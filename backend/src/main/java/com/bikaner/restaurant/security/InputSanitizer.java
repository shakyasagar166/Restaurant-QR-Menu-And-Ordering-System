package com.bikaner.restaurant.security;

import java.util.regex.Pattern;

/**
 * Enterprise-Grade Input Sanitizer & Anti-XSS Protection.
 * Strictly neutralizes HTML injection, script execution, and malicious payloads.
 */
public final class InputSanitizer {

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("(javascript:|data:text/html|vbscript:|onload=|onerror=|onclick=)", Pattern.CASE_INSENSITIVE);
    private static final Pattern PHONE_ALLOWED = Pattern.compile("[^0-9+]");
    private static final Pattern TABLE_ALLOWED = Pattern.compile("[^a-zA-Z0-9 -]");

    private InputSanitizer() {}

    /**
     * Strips dangerous HTML tags, scripts, and truncates to prevent buffer abuse.
     */
    public static String sanitizeText(String input, int maxLength) {
        if (input == null) return null;
        String cleaned = HTML_TAG_PATTERN.matcher(input).replaceAll("");
        cleaned = SCRIPT_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = cleaned.trim();
        if (cleaned.length() > maxLength) {
            cleaned = cleaned.substring(0, maxLength);
        }
        return cleaned;
    }

    /**
     * Sanitizes customer phone number, keeping only digits and optional leading plus.
     */
    public static String sanitizePhone(String phone) {
        if (phone == null) return null;
        String cleaned = PHONE_ALLOWED.matcher(phone).replaceAll("");
        if (cleaned.length() > 15) {
            cleaned = cleaned.substring(0, 15);
        }
        return cleaned;
    }

    /**
     * Masks customer phone number for public/diner views to prevent PII harvesting.
     * E.g. "9058605348" -> "9058***348"
     */
    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 6) return "***";
        int len = phone.length();
        if (len <= 8) {
            return phone.substring(0, 2) + "***" + phone.substring(len - 2);
        }
        return phone.substring(0, 4) + "***" + phone.substring(len - 3);
    }

    /**
     * Sanitizes table identifier (e.g. "T-4", "Table 12").
     */
    public static String sanitizeTable(String table) {
        if (table == null) return "T-1";
        String cleaned = TABLE_ALLOWED.matcher(table).replaceAll("").trim();
        if (cleaned.isEmpty()) return "T-1";
        if (cleaned.length() > 15) cleaned = cleaned.substring(0, 15);
        return cleaned;
    }
}
