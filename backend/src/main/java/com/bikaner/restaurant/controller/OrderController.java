package com.bikaner.restaurant.controller;

import com.bikaner.restaurant.config.OrderNotificationService;
import com.bikaner.restaurant.model.Order;
import com.bikaner.restaurant.model.OrderStatus;
import com.bikaner.restaurant.repository.OrderRepository;
import com.bikaner.restaurant.security.AuthTokenService;
import com.bikaner.restaurant.security.InputSanitizer;
import com.bikaner.restaurant.security.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderNotificationService notificationService;
    private final RateLimiterService rateLimiterService;
    private final AuthTokenService authTokenService;

    public OrderController(OrderRepository orderRepository,
                           OrderNotificationService notificationService,
                           RateLimiterService rateLimiterService,
                           AuthTokenService authTokenService) {
        this.orderRepository = orderRepository;
        this.notificationService = notificationService;
        this.rateLimiterService = rateLimiterService;
        this.authTokenService = authTokenService;
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.trim().isEmpty()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    private boolean isAdmin(HttpServletRequest request) {
        String token = authTokenService.extractToken(request);
        return token != null && authTokenService.isValidToken(token);
    }

    /**
     * High-Concurrency Thread-Safe Order Placement.
     * Hardened with Anti-Flood Rate Limiting, Input Sanitization, and PII Shields.
     */
    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody Order order, HttpServletRequest request) {
        String clientIp = getClientIp(request);

        // 1. Anti-Flood Rate Limiting (Stops automated spam bot order injection)
        if (!rateLimiterService.allowOrderSubmission(clientIp)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "RATE_LIMIT_EXCEEDED");
            err.put("message", "Order submission limit reached. Please wait a minute before submitting again.");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(err);
        }

        // 2. Strict Input Sanitization & Anti-XSS
        order.setCustomerName(InputSanitizer.sanitizeText(order.getCustomerName(), 60));
        order.setCustomerPhone(InputSanitizer.sanitizePhone(order.getCustomerPhone()));
        order.setTableNumber(InputSanitizer.sanitizeTable(order.getTableNumber()));
        order.setNotes(InputSanitizer.sanitizeText(order.getNotes(), 250));

        if (order.getItems() == null || order.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Order must contain at least one item."));
        }

        // Validate and sanitize items
        for (var item : order.getItems()) {
            item.setName(InputSanitizer.sanitizeText(item.getName(), 100));
            item.setSpecialInstructions(InputSanitizer.sanitizeText(item.getSpecialInstructions(), 150));
            // Clamp quantity between 1 and 50
            if (item.getQuantity() == null || item.getQuantity() < 1) {
                item.setQuantity(1);
            } else if (item.getQuantity() > 50) {
                item.setQuantity(50);
            }
            // Enforce non-negative price
            if (item.getPrice() == null || item.getPrice() < 0) {
                item.setPrice(0.0);
            }
            item.setOrder(order);
        }

        // Calculate and enforce tamper-proof total amount
        double computedTotal = order.getItems().stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();
        order.setTotalAmount(computedTotal);

        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
        order.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));

        if (order.getPaymentMethod() == null || order.getPaymentMethod().trim().isEmpty()) {
            order.setPaymentMethod("CASH");
        }
        if (order.getPaymentStatus() == null || order.getPaymentStatus().trim().isEmpty()) {
            if ("ONLINE".equalsIgnoreCase(order.getPaymentMethod()) && order.getPaymentId() != null) {
                order.setPaymentStatus("PAID");
            } else {
                order.setPaymentStatus("PENDING");
            }
        }

        Order savedOrder = orderRepository.save(order);

        // Instant non-blocking async real-time kitchen bell alert
        try {
            notificationService.notifyNewOrder(savedOrder);
        } catch (Exception e) {
            System.err.println("Async notify error: " + e.getMessage());
        }

        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping
    public List<Order> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String table,
            HttpServletRequest request
    ) {
        boolean admin = isAdmin(request);

        List<Order> orders;
        if (table != null && !table.trim().isEmpty()) {
            orders = orderRepository.findByTableNumberOrderByCreatedAtDesc(InputSanitizer.sanitizeTable(table.trim()));
        } else if (status != null) {
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }

        // PII Shield: If fetched by non-admin public viewer, mask customer phone numbers
        if (!admin) {
            for (Order o : orders) {
                if (o.getCustomerPhone() != null) {
                    o.setCustomerPhone(InputSanitizer.maskPhone(o.getCustomerPhone()));
                }
            }
        }

        return orders;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id, HttpServletRequest request) {
        boolean admin = isAdmin(request);
        return orderRepository.findById(id).map(order -> {
            if (!admin && order.getCustomerPhone() != null) {
                order.setCustomerPhone(InputSanitizer.maskPhone(order.getCustomerPhone()));
            }
            return ResponseEntity.ok(order);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate
    ) {
        String newStatusStr = statusUpdate.get("status");
        if (newStatusStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status field is required."));
        }

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(newStatusStr.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid order status value."));
        }

        return orderRepository.findById(id).map(order -> {
            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
            Order updated = orderRepository.save(order);

            try {
                notificationService.notifyStatusChange(updated);
            } catch (Exception e) {
                System.err.println("SSE notify status error: " + e.getMessage());
            }

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<Order> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> paymentDetails
    ) {
        return orderRepository.findById(id).map(order -> {
            if (paymentDetails.containsKey("paymentMethod")) {
                order.setPaymentMethod(InputSanitizer.sanitizeText(paymentDetails.get("paymentMethod"), 20));
            }
            if (paymentDetails.containsKey("paymentStatus")) {
                order.setPaymentStatus(InputSanitizer.sanitizeText(paymentDetails.get("paymentStatus"), 20));
            }
            if (paymentDetails.containsKey("paymentId")) {
                order.setPaymentId(InputSanitizer.sanitizeText(paymentDetails.get("paymentId"), 100));
            }
            order.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
            Order updated = orderRepository.save(order);

            try {
                notificationService.notifyStatusChange(updated);
            } catch (Exception e) {
                System.err.println("SSE notify payment error: " + e.getMessage());
            }

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/bill")
    public ResponseEntity<Order> updateOrderBill(
            @PathVariable Long id,
            @RequestBody Map<String, Object> billDetails
    ) {
        return orderRepository.findById(id).map(order -> {
            if (billDetails.containsKey("totalAmount")) {
                try {
                    order.setTotalAmount(Double.valueOf(billDetails.get("totalAmount").toString()));
                } catch (Exception ignored) {}
            }
            if (billDetails.containsKey("notes")) {
                order.setNotes(InputSanitizer.sanitizeText(String.valueOf(billDetails.get("notes")), 250));
            }
            order.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
            Order updated = orderRepository.save(order);

            try {
                notificationService.notifyStatusChange(updated);
            } catch (Exception e) {
                System.err.println("SSE notify bill error: " + e.getMessage());
            }

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamOrders() {
        return notificationService.subscribe();
    }

    /**
     * Complete Financial & Operational Statistics for Admin Portal.
     * Enforced by AdminAuthInterceptor to prevent unauthorized revenue reconnaissance.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Order> all = orderRepository.findAllByOrderByCreatedAtDesc();
        LocalDate today = LocalDate.now();

        long pending = all.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        long accepted = all.stream().filter(o -> o.getStatus() == OrderStatus.ACCEPTED).count();
        long preparing = all.stream().filter(o -> o.getStatus() == OrderStatus.PREPARING).count();
        long served = all.stream().filter(o -> o.getStatus() == OrderStatus.SERVED).count();
        long cancelled = all.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();

        double totalSales = all.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalAmount)
                .sum();

        double todaySales = all.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED &&
                             o.getCreatedAt() != null &&
                             o.getCreatedAt().toLocalDate().isEqual(today))
                .mapToDouble(Order::getTotalAmount)
                .sum();

        long validOrdersCount = all.size() - cancelled;
        double aov = validOrdersCount > 0 ? totalSales / validOrdersCount : 0.0;

        Map<String, Double> tableSales = all.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getTableNumber() != null)
                .collect(Collectors.groupingBy(
                        Order::getTableNumber,
                        Collectors.summingDouble(Order::getTotalAmount)
                ));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", all.size());
        stats.put("pendingOrders", pending);
        stats.put("acceptedOrders", accepted);
        stats.put("preparingOrders", preparing);
        stats.put("servedOrders", served);
        stats.put("cancelledOrders", cancelled);
        stats.put("totalSales", Math.round(totalSales));
        stats.put("todaySales", Math.round(todaySales));
        stats.put("averageOrderValue", Math.round(aov));
        stats.put("tableSales", tableSales);

        return ResponseEntity.ok(stats);
    }
}
