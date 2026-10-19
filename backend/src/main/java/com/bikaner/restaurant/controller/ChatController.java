package com.bikaner.restaurant.controller;

import com.bikaner.restaurant.model.MenuItem;
import com.bikaner.restaurant.model.Order;
import com.bikaner.restaurant.repository.MenuItemRepository;
import com.bikaner.restaurant.repository.OrderRepository;
import com.bikaner.restaurant.service.GroqAiService;
import com.bikaner.restaurant.service.MenuKnowledgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;
    private final GroqAiService groqAiService;
    private final MenuKnowledgeService menuKnowledgeService;

    public ChatController(MenuItemRepository menuItemRepository, 
                          OrderRepository orderRepository,
                          GroqAiService groqAiService,
                          MenuKnowledgeService menuKnowledgeService) {
        this.menuItemRepository = menuItemRepository;
        this.orderRepository = orderRepository;
        this.groqAiService = groqAiService;
        this.menuKnowledgeService = menuKnowledgeService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> payload) {
        String query = (String) payload.getOrDefault("message", "");
        String tableNumber = (String) payload.getOrDefault("tableNumber", "T-1");
        Object orderIdObj = payload.get("activeOrderId");
        Long activeOrderId = orderIdObj != null ? Long.valueOf(orderIdObj.toString()) : null;

        List<MenuItem> allMenu = menuItemRepository.findAll();

        Order userOrder = null;
        if (activeOrderId != null) {
            userOrder = orderRepository.findById(activeOrderId).orElse(null);
        }
        if (userOrder == null && tableNumber != null) {
            List<Order> tableOrders = orderRepository.findByTableNumberOrderByCreatedAtDesc(tableNumber);
            if (!tableOrders.isEmpty()) {
                userOrder = tableOrders.get(0);
            }
        }

        // Run menu verification & ground truth analysis
        MenuKnowledgeService.VerificationResult verification = menuKnowledgeService.verifyQuery(query, allMenu);

        // 1. Try Groq AI with grounded verification
        if (groqAiService.isConfigured()) {
            String groqReply = groqAiService.askGroq(query.trim(), allMenu, userOrder, tableNumber, verification);
            if (groqReply != null && !groqReply.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("reply", groqReply);
                response.put("poweredBy", "Groq Cloud AI");

                // Include matched items so interactive [+ Add] buttons show in chat
                Set<MenuItem> itemsToShow = new LinkedHashSet<>(verification.availableMatches);
                for (MenuItem m : allMenu) {
                    if (groqReply.toLowerCase().contains(m.getName().toLowerCase())) {
                        itemsToShow.add(m);
                    }
                }
                response.put("items", itemsToShow.stream().limit(4).collect(Collectors.toList()));

                return ResponseEntity.ok(response);
            }
        }

        // 2. Deterministic Grounded Fallback Engine
        Map<String, Object> fallbackResponse = generateLocalResponse(query.trim(), tableNumber, userOrder, allMenu, verification);
        fallbackResponse.put("poweredBy", "Bikaner AI Concierge Engine");
        return ResponseEntity.ok(fallbackResponse);
    }

    @GetMapping("/groq-status")
    public ResponseEntity<Map<String, Object>> getGroqStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("configured", groqAiService.isConfigured());
        status.put("hasKey", groqAiService.getApiKey() != null && !groqAiService.getApiKey().isEmpty());
        return ResponseEntity.ok(status);
    }

    @PostMapping("/groq-key")
    public ResponseEntity<Map<String, Object>> setGroqKey(@RequestBody Map<String, String> payload) {
        String key = payload.get("apiKey");
        groqAiService.setApiKey(key);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("configured", groqAiService.isConfigured());
        res.put("message", groqAiService.isConfigured() ? "Groq API Key activated successfully!" : "Key saved.");
        return ResponseEntity.ok(res);
    }

    private Map<String, Object> generateLocalResponse(String query, String tableNumber, Order userOrder, 
                                                      List<MenuItem> allMenu, 
                                                      MenuKnowledgeService.VerificationResult verification) {
        Map<String, Object> result = new HashMap<>();
        List<MenuItem> suggestedItems = new ArrayList<>();
        StringBuilder reply = new StringBuilder();
        boolean isHindi = "hindi".equals(verification.detectedLanguage);

        // 1. Order Status query
        if (verification.isOrderStatusQuery) {
            if (userOrder != null) {
                reply.append("📋 **Aapka Table [").append(userOrder.getTableNumber()).append("] ka Order #").append(userOrder.getId()).append(" status:**\n\n");
                reply.append("• **Status**: `").append(userOrder.getStatus()).append("`\n");
                reply.append("• **Total Amount**: ₹").append(Math.round(userOrder.getTotalAmount())).append("\n\n");
                
                if (userOrder.getStatus().name().equals("PENDING")) {
                    reply.append("🔔 *Kitchen bell baj chuki hai, manager abhi accept kar rahe hain.*");
                } else if (userOrder.getStatus().name().equals("ACCEPTED")) {
                    reply.append("👨‍🍳 *Kitchen ne order accept kar liya hai! Cooking start ho chuki hai.*");
                } else if (userOrder.getStatus().name().equals("PREPARING")) {
                    reply.append("🔥 *Chef aapka khana taaza prepare kar rahe hain, bas thodi der me aapki table par hoga.*");
                } else if (userOrder.getStatus().name().equals("SERVED")) {
                    reply.append("🍽️ *Aapka order serve ho chuka hai! Enjoy your royal meal.*");
                }
            } else {
                reply.append("Aapki table (").append(tableNumber).append(") ka filhal koi active order nahi mila. Aap menu se apni pasand ki dishes order tray me add karke place kar sakte hain!");
            }

            result.put("reply", reply.toString());
            result.put("items", Collections.emptyList());
            return result;
        }

        // 2. Non-veg query
        if (verification.isNonVegQuery) {
            reply.append("🌿 **Bikaner Express ek 100% Pure Shuddh Shakahari (Pure Veg) Restaurant hai.** Yahan koi bhi non-veg dish (chicken, mutton, egg, fish) nahi banai jaati.\n\n");
            reply.append("Lekin aap hamari pure veg signatures try kar sakte hain:\n");
            reply.append("• **Tandoori Malai Chaap** (₹290)\n");
            reply.append("• **Tandoori Paneer Tikka** (₹370)\n");
            reply.append("• **Paneer Butter Masala** (₹385)\n\n");
            reply.append("Kya aap inme se kuch order me add karna chahenge?");
            
            allMenu.stream()
                .filter(m -> m.getName().contains("Chaap") || m.getName().contains("Paneer Tikka"))
                .limit(3)
                .forEach(suggestedItems::add);

            result.put("reply", reply.toString());
            result.put("items", suggestedItems);
            return result;
        }

        // 3. Alcohol query
        if (verification.isAlcoholQuery) {
            reply.append("🍹 **Bikaner Express me alcohol serve nahi hoti.** Hamare paas bohot hi refreshing **Signature Mocktails, Shakes aur Cold Beverages** available hain:\n\n");
            reply.append("• **Virgin Mojito** - ₹160\n");
            reply.append("• **Spl Kala Khatta Mocktail** - ₹160\n");
            reply.append("• **Cold Coffee with Ice Cream** - ₹185\n");
            reply.append("• **Kesar Pista Badam Milk** - ₹105\n\n");
            reply.append("Aapke liye koi drink order tray me add karun?");

            allMenu.stream()
                .filter(m -> m.getCategory().equalsIgnoreCase("Mocktails") || m.getName().contains("Cold Coffee"))
                .limit(3)
                .forEach(suggestedItems::add);

            result.put("reply", reply.toString());
            result.put("items", suggestedItems);
            return result;
        }

        // 4. If query asked for items that DO NOT exist on the menu
        if (!verification.unavailableItems.isEmpty()) {
            if (isHindi) {
                reply.append("माफ़ कीजिये, **").append(String.join(", ", verification.unavailableItems)).append("** हमारे मेनू में उपलब्ध नहीं है।\n\n");
            } else {
                reply.append("Maaf kijiye, **").append(String.join(", ", verification.unavailableItems)).append("** hamare menu me available nahi hai.\n\n");
            }

            if (!verification.availableMatches.isEmpty()) {
                if (isHindi) {
                    reply.append("लेकिन हमारे मेनू में ये विकल्प उपलब्ध हैं:\n");
                } else {
                    reply.append("Lekin aap hamare menu se yeh dishes try kar sakte hain:\n");
                }
                for (MenuItem m : verification.availableMatches.stream().limit(4).collect(Collectors.toList())) {
                    reply.append("• **").append(m.getName()).append("**: ₹").append(Math.round(m.getPrice())).append("\n");
                    suggestedItems.add(m);
                }
            } else {
                if (isHindi) {
                    reply.append("आप हमारे लोकप्रिय व्यंजन आज़मा सकते हैं:\n")
                         .append("• **Dal Makhani**: ₹325\n")
                         .append("• **Paneer Butter Masala**: ₹385\n")
                         .append("• **Executive Thali**: ₹320\n")
                         .append("• **Veg Fried Rice**: ₹230\n");
                } else {
                    reply.append("Aap hamare popular dishes try kar sakte hain:\n")
                         .append("• **Dal Makhani**: ₹325\n")
                         .append("• **Paneer Butter Masala**: ₹385\n")
                         .append("• **Executive Thali**: ₹320\n")
                         .append("• **Veg Fried Rice**: ₹230\n");
                }
                allMenu.stream()
                    .filter(m -> m.getName().equals("Dal Makhani") || m.getName().equals("Paneer Butter Masala") || m.getName().equals("Executive Thali"))
                    .forEach(suggestedItems::add);
            }

            result.put("reply", reply.toString());
            result.put("items", suggestedItems);
            return result;
        }

        // 5. If query has confirmed available matches
        if (!verification.availableMatches.isEmpty()) {
            if (verification.availableMatches.size() == 1) {
                MenuItem item = verification.availableMatches.get(0);
                if (isHindi) {
                    reply.append("हाँ! **").append(item.getName()).append("** हमारे मेनू में उपलब्ध है।\n\n")
                         .append("• **दाम (Price)**: ₹").append(Math.round(item.getPrice())).append("\n")
                         .append("• **Category**: ").append(item.getCategory()).append("\n\n")
                         .append("क्या मैं इसे आपकी आर्डर ट्रे में जोड़ दूँ?");
                } else {
                    reply.append("Haan! **").append(item.getName()).append("** hamare menu me available hai.\n\n")
                         .append("• **Price**: ₹").append(Math.round(item.getPrice())).append("\n")
                         .append("• **Category**: ").append(item.getCategory()).append("\n\n")
                         .append("Kya main ise aapke order tray me add kar doon?");
                }
                suggestedItems.add(item);
            } else {
                if (isHindi) {
                    reply.append("हाँ! हमारे मेनू में ये विकल्प उपलब्ध हैं:\n\n");
                } else {
                    reply.append("Haan! Hamare menu me yeh varieties available hain:\n\n");
                }
                for (MenuItem m : verification.availableMatches.stream().limit(5).collect(Collectors.toList())) {
                    reply.append("• **").append(m.getName()).append("**: ₹").append(Math.round(m.getPrice())).append("\n");
                    suggestedItems.add(m);
                }
                reply.append("\nKya main inme se koi dish aapke liye add karun?");
            }

            result.put("reply", reply.toString());
            result.put("items", suggestedItems);
            return result;
        }

        // 6. Default general greeting
        if (isHindi) {
            reply.append("नमस्ते! मैं **Bikaner Express AI Concierge** हूँ। 🙏\n\n")
                 .append("आप मुझसे किसी भी डिश की उपलब्धता, भाव (rates), शेफ स्पेशल या अपनी टेबल का स्टेटस पूछ सकते हैं!");
        } else {
            reply.append("Namaste! Main **Bikaner Express AI Concierge** hoon. 🙏\n\n")
                 .append("Aap mujhse kisi bhi dish ka **rate / price**, menu availability, chef recommendations ya aapka **Table [").append(tableNumber).append("] ka order status** pooch sakte hain!");
        }

        result.put("reply", reply.toString());
        result.put("items", Collections.emptyList());
        return result;
    }
}
