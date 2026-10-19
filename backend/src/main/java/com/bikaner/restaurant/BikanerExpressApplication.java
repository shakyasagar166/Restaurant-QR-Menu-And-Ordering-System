package com.bikaner.restaurant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BikanerExpressApplication {

    public static void main(String[] args) {
        SpringApplication.run(BikanerExpressApplication.class, args);
        System.out.println("=================================================");
        System.out.println("🍲 Bikaner Express Foods Backend Running on :8080");
        System.out.println("🔔 Realtime QR Menu Ordering System Ready!");
        System.out.println("=================================================");
    }
}
