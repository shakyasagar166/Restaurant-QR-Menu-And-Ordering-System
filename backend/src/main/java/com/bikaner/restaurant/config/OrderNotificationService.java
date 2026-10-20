package com.bikaner.restaurant.config;

import com.bikaner.restaurant.model.Order;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class OrderNotificationService {

    // Thread-safe list of active SSE connections
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    // High-performance non-blocking async executor for real-time broadcasts
    // Guarantees zero latency / zero thread blocking on HTTP order placement!
    private final ExecutorService asyncBroadcaster = Executors.newCachedThreadPool();

    /**
     * Subscribe a client (Admin POS) to the real-time event stream.
     * Uses 15-minute connection window with automatic client auto-reconnect.
     */
    public SseEmitter subscribe() {
        // 15 minutes timeout (900,000 ms) with automatic reconnection to prevent stale socket accumulation
        SseEmitter emitter = new SseEmitter(900_000L);

        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> {
            try { emitter.complete(); } catch (Exception ignored) {}
            emitters.remove(emitter);
        });
        emitter.onError((e) -> emitters.remove(emitter));

        // Initial handshake
        try {
            emitter.send(SseEmitter.event()
                    .reconnectTime(2000L)
                    .name("CONNECTED")
                    .data("Connected to Bikaner Express Real-Time Kitchen Bell SSE Stream"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    /**
     * Completely Asynchronous broadcast of newly submitted orders.
     * Runs in a background worker thread so placeOrder() returns in milliseconds!
     */
    public void notifyNewOrder(Order order) {
        if (order == null || emitters.isEmpty()) return;

        asyncBroadcaster.submit(() -> {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .reconnectTime(2000L)
                            .name("NEW_ORDER")
                            .data(order));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
            if (!deadEmitters.isEmpty()) {
                emitters.removeAll(deadEmitters);
            }
        });
    }

    /**
     * Completely Asynchronous broadcast of status updates.
     */
    public void notifyStatusChange(Order order) {
        if (order == null || emitters.isEmpty()) return;

        asyncBroadcaster.submit(() -> {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .reconnectTime(2000L)
                            .name("ORDER_UPDATED")
                            .data(order));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
            if (!deadEmitters.isEmpty()) {
                emitters.removeAll(deadEmitters);
            }
        });
    }

    /**
     * Periodic 25-second keep-alive heartbeat ping.
     */
    @Scheduled(fixedRate = 25000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;

        asyncBroadcaster.submit(() -> {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("PING")
                            .data("heartbeat"));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
            if (!deadEmitters.isEmpty()) {
                emitters.removeAll(deadEmitters);
            }
        });
    }
}
