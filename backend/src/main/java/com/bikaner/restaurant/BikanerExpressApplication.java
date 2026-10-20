package com.bikaner.restaurant;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class BikanerExpressApplication {

    @PostConstruct
    public void init() {
        // Enforce Indian Standard Time (IST) globally across cloud deployments
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(BikanerExpressApplication.class, args);
        System.out.println("=================================================");
        System.out.println("🍲 Bikaner Express Foods Backend Running on :8080 (IST)");
        System.out.println("🔔 Realtime QR Menu Ordering System Ready!");
        System.out.println("=================================================");
    }
}
