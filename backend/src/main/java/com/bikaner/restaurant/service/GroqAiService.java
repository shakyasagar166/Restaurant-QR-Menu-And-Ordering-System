package com.bikaner.restaurant.service;

import com.bikaner.restaurant.model.MenuItem;
import com.bikaner.restaurant.model.Order;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GroqAiService {

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.model:qwen/qwen3.8-27b}")
    private String model;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model != null ? model.trim() : "qwen/qwen3.8-27b";
    }

    public boolean isConfigured() {
        return apiKey != null && apiKey.startsWith("gsk_") && apiKey.length() > 20;
    }

    public String askGroq(String userMessage, List<MenuItem> menuItems, Order activeOrder, String tableNumber, MenuKnowledgeService.VerificationResult verification) {
        if (!isConfigured()) {
            return null;
        }

        try {
            StringBuilder systemPrompt = new StringBuilder();
            systemPrompt.append("You are the official AI Food Concierge and Virtual Waiter for 'Bikaner Express Foods Pvt. Ltd.', located at Aman International Mall, Roof Top, 6/19 Radha Raman Road, Awas Vikas, Mainpuri (U.P.) 205001.\n");
            systemPrompt.append("We are a 100% PURE VEGETARIAN (Shuddh Shakahari) restaurant. Strictly NO non-veg (chicken, mutton, fish, egg, or meat) and NO alcohol.\n");
            systemPrompt.append("Customer is seated at Table: ").append(tableNumber != null ? tableNumber : "T-1").append(".\n\n");

            if (activeOrder != null) {
                systemPrompt.append("ACTIVE TABLE ORDER: Order #").append(activeOrder.getId())
                        .append(" | Status: ").append(activeOrder.getStatus())
                        .append(" | Total Bill: ₹").append(Math.round(activeOrder.getTotalAmount()))
                        .append(" | Items: ").append(activeOrder.getItems().stream().map(i -> i.getQuantity() + "x " + i.getName()).collect(Collectors.joining(", ")))
                        .append(".\n\n");
            }

            // GROUND TRUTH INJECTION
            systemPrompt.append("STRICT GROUND TRUTH & ANTI-HALLUCINATION RULES:\n");
            if (verification != null) {
                if (!verification.unavailableItems.isEmpty()) {
                    systemPrompt.append("1. UNAVAILABLE ITEMS IN THIS QUERY: ").append(String.join(", ", verification.unavailableItems)).append(".\n");
                    systemPrompt.append("   -> CRITICAL RULE: You MUST state clearly and politely: 'Maaf kijiye, [item] hamare menu me available nahi hai.' (or in Hindi: 'माफ़ कीजिये, [item] हमारे मेनू में उपलब्ध नहीं है।'). NEVER pretend or claim we serve it!\n");
                }
                if (!verification.availableMatches.isEmpty()) {
                    systemPrompt.append("2. CONFIRMED AVAILABLE MATCHES: ");
                    for (MenuItem m : verification.availableMatches) {
                        systemPrompt.append(m.getName()).append(" [₹").append(Math.round(m.getPrice())).append("], ");
                    }
                    systemPrompt.append("\n   -> Confirm these items ARE available and give their exact prices.\n");
                }
                if (verification.isNonVegQuery) {
                    systemPrompt.append("3. NON-VEG INQUIRY: Customer asked for non-veg. Strictly clarify that Bikaner Express is 100% Pure Shuddh Shakahari, and recommend top veg dishes (Tandoori Malai Chaap ₹290, Tandoori Paneer Tikka ₹370).\n");
                }
            }

            systemPrompt.append("\nGENERAL INSTRUCTIONS:\n");
            systemPrompt.append("- Respond in the same language as the customer (Hindi script if customer writes in Hindi, Hinglish if customer writes in Hinglish, English if customer writes in English).\n");
            systemPrompt.append("- Never invent or hallucinate dishes, prices, or combos not in the menu below.\n");
            systemPrompt.append("- Keep responses appetizing, warm, and concise with bold dish names and prices.\n\n");

            systemPrompt.append("OFFICIAL COMPLETE MENU (ALL 86 DISHES & EXACT PRICES):\n");
            for (MenuItem item : menuItems) {
                systemPrompt.append("- ").append(item.getName())
                        .append(" [").append(item.getCategory()).append("]: ₹")
                        .append(Math.round(item.getPrice())).append("\n");
            }

            // Prepare JSON payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", model);
            payload.put("temperature", 0.2);
            payload.put("max_tokens", 450);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt.toString()));
            messages.add(Map.of("role", "user", "content", userMessage));
            payload.put("messages", messages);

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GROQ_API_URL))
                    .header("Content-Type", "application/json; charset=utf-8")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(12))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    return choices.get(0).path("message").path("content").asText();
                }
            } else {
                System.err.println("Groq API response (" + response.statusCode() + "): " + response.body());
                if (response.statusCode() == 429) {
                    System.out.println("Groq rate limit reached, falling back to local verification engine.");
                    return null;
                }
                if (!"qwen/qwen3.8-27b".equals(model)) {
                    payload.put("model", "qwen/qwen3.8-27b");
                    String retryBody = objectMapper.writeValueAsString(payload);
                    HttpRequest retryReq = HttpRequest.newBuilder()
                            .uri(URI.create(GROQ_API_URL))
                            .header("Content-Type", "application/json; charset=utf-8")
                            .header("Authorization", "Bearer " + apiKey)
                            .POST(HttpRequest.BodyPublishers.ofString(retryBody, StandardCharsets.UTF_8))
                            .timeout(Duration.ofSeconds(10))
                            .build();
                    HttpResponse<String> retryResp = httpClient.send(retryReq, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
                    if (retryResp.statusCode() == 200) {
                        JsonNode root = objectMapper.readTree(retryResp.body());
                        JsonNode choices = root.path("choices");
                        if (choices.isArray() && choices.size() > 0) {
                            return choices.get(0).path("message").path("content").asText();
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Exception calling Groq API: " + e.getMessage());
        }

        return null;
    }
}
