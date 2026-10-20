package com.bikaner.restaurant.config;

import com.bikaner.restaurant.model.Order;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class OrderNotificationService {

    // Thread-safe list of active SSE connections
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    /**
     * Subscribe a client (Admin POS or Customer Tracker) to the real-time event stream.
     * Uses 24-hour timeout and 1-second auto-reconnect instruction.
     */
    public SseEmitter subscribe() {
        // 24 hours timeout (86,400,000 ms) so connection stays open indefinitely
        SseEmitter emitter = new SseEmitter(86_400_000L);

        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> {
            emitter.complete();
            emitters.remove(emitter);
        });
        emitter.onError((e) -> emitters.remove(emitter));

        // Initial handshake with reconnect instruction: reconnect in 1000ms if disconnected
        try {
            emitter.send(SseEmitter.event()
                    .reconnectTime(1000L)
                    .name("CONNECTED")
                    .data("Connected to Bikaner Express Real-Time Kitchen Bell SSE Stream"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    /**
     * Instantly broadcasts newly submitted orders to all connected Admin dashboards.
     */
    public void notifyNewOrder(Order order) {
        if (order == null) return;
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .reconnectTime(1000L)
                        .name("NEW_ORDER")
                        .data(order));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }

    /**
     * Instantly broadcasts status updates (e.g. ACCEPTED, PREPARING, SERVED) to all screens.
     */
    public void notifyStatusChange(Order order) {
        if (order == null) return;
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .reconnectTime(1000L)
                        .name("ORDER_UPDATED")
                        .data(order));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }

    /**
     * Periodic 15-second keep-alive heartbeat ping.
     * Prevents proxies, firewalls, and routers from dropping the idle SSE socket connection.
     */
    @Scheduled(fixedRate = 15000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .comment("bikaner-keepalive-ping"));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }

    public int getActiveSubscriberCount() {
        return emitters.size();
    }
}
