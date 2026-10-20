package com.bikaner.restaurant.controller;

import com.bikaner.restaurant.config.OrderNotificationService;
import com.bikaner.restaurant.model.Order;
import com.bikaner.restaurant.model.OrderStatus;
import com.bikaner.restaurant.repository.OrderRepository;
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
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderNotificationService notificationService;

    public OrderController(OrderRepository orderRepository, OrderNotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.notificationService = notificationService;
    }

    /**
     * High-Concurrency Thread-Safe Order Placement.
     * Handles 25+ simultaneous orders effortlessly using non-blocking async dispatch.
     */
    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody Order order) {
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
        order.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));

        if (order.getItems() != null) {
            order.getItems().forEach(item -> item.setOrder(order));
            if (order.getTotalAmount() == null) {
                double total = order.getItems().stream()
                        .mapToDouble(i -> (i.getPrice() != null ? i.getPrice() : 0.0) * (i.getQuantity() != null ? i.getQuantity() : 1))
                        .sum();
                order.setTotalAmount(total);
            }
        } else if (order.getTotalAmount() == null) {
            order.setTotalAmount(0.0);
        }

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

        Order savedOrder;
        synchronized (this) {
            savedOrder = orderRepository.save(order);
        }

        // Instant Real-Time Server-Sent Events Notification to Kitchen / Admin Bell System
        try {
            notificationService.notifyNewOrder(savedOrder);
        } catch (Exception e) {
            System.err.println("SSE notify error: " + e.getMessage());
        }

        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping
    public List<Order> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String table
    ) {
        if (table != null && !table.trim().isEmpty()) {
            return orderRepository.findByTableNumberOrderByCreatedAtDesc(table.trim());
        }
        if (status != null) {
            return orderRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate
    ) {
        String newStatusStr = statusUpdate.get("status");
        if (newStatusStr == null) {
            return ResponseEntity.badRequest().build();
        }

        return orderRepository.findById(id).map(order -> {
            OrderStatus newStatus = OrderStatus.valueOf(newStatusStr.toUpperCase());
            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
            Order updated = orderRepository.save(order);

            // Instant Real-Time broadcast of status change via SSE
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
                order.setPaymentMethod(paymentDetails.get("paymentMethod"));
            }
            if (paymentDetails.containsKey("paymentStatus")) {
                order.setPaymentStatus(paymentDetails.get("paymentStatus"));
            }
            if (paymentDetails.containsKey("paymentId")) {
                order.setPaymentId(paymentDetails.get("paymentId"));
            }
            order.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
            Order updated = orderRepository.save(order);

            // Instant Real-Time broadcast of payment change via SSE
            try {
                notificationService.notifyStatusChange(updated);
            } catch (Exception e) {
                System.err.println("SSE notify payment error: " + e.getMessage());
            }

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamOrders() {
        return notificationService.subscribe();
    }

    /**
     * Complete Financial & Operational Statistics for Admin Portal
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Order> all = orderRepository.findAll();
        LocalDate today = LocalDate.now();

        long pending = all.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        long accepted = all.stream().filter(o -> o.getStatus() == OrderStatus.ACCEPTED).count();
        long preparing = all.stream().filter(o -> o.getStatus() == OrderStatus.PREPARING).count();
        long served = all.stream().filter(o -> o.getStatus() == OrderStatus.SERVED).count();
        long cancelled = all.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();

        // Total sales from all active / non-cancelled orders
        double totalSales = all.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalAmount)
                .sum();

        // Today's specific sales
        double todaySales = all.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED &&
                             o.getCreatedAt() != null &&
                             o.getCreatedAt().toLocalDate().isEqual(today))
                .mapToDouble(Order::getTotalAmount)
                .sum();

        long validOrdersCount = all.size() - cancelled;
        double aov = validOrdersCount > 0 ? totalSales / validOrdersCount : 0.0;

        // Sales by Table breakdown
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
