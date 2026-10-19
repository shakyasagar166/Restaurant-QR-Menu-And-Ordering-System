package com.bikaner.restaurant.service;

import com.bikaner.restaurant.model.MenuItem;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MenuKnowledgeService {

    public static class VerificationResult {
        public List<MenuItem> availableMatches = new ArrayList<>();
        public List<String> unavailableItems = new ArrayList<>();
        public boolean isNonVegQuery = false;
        public boolean isAlcoholQuery = false;
        public boolean isOrderStatusQuery = false;
        public String detectedLanguage = "hinglish"; // "hindi", "hinglish", "english"
    }

    public VerificationResult verifyQuery(String query, List<MenuItem> allMenu) {
        VerificationResult res = new VerificationResult();
        if (query == null || query.trim().isEmpty()) {
            return res;
        }

        String lower = query.toLowerCase();

        // 1. Detect language
        if (query.matches(".*[\\u0900-\\u097F]+.*")) {
            res.detectedLanguage = "hindi";
        } else if (lower.contains("bhai") || lower.contains("kya") || lower.contains("hai") || 
                   lower.contains("milega") || lower.contains("chahiye") || lower.contains("kitne") || 
                   lower.contains("rate") || lower.contains("batao") || lower.contains("hoga") || lower.contains("karo")) {
            res.detectedLanguage = "hinglish";
        } else {
            res.detectedLanguage = "english";
        }

        // 2. Non-veg check
        if (lower.contains("chicken") || lower.contains("mutton") || lower.contains("fish") || 
            lower.contains("egg") || lower.contains("meat") || lower.contains("non veg") || lower.contains("nonveg") ||
            lower.contains("चिकन") || lower.contains("अंडा") || lower.contains("मीट") || lower.contains("मटन") || lower.contains("मांस") || lower.contains("मछली")) {
            res.isNonVegQuery = true;
            res.unavailableItems.add("Non-Veg (Chicken/Mutton/Fish/Egg/Meat)");
        }

        // 3. Alcohol check
        if (lower.contains("beer") || lower.contains("wine") || lower.contains("whisky") || 
            lower.contains("vodka") || lower.contains("daroo") || lower.contains("sharab") || lower.contains("alcohol") ||
            lower.contains("शराब") || lower.contains("दारू") || lower.contains("बियर")) {
            res.isAlcoholQuery = true;
            res.unavailableItems.add("Alcohol / Beer / Wine");
        }

        // 4. Order status check
        if ((lower.contains("order") || lower.contains("ऑर्डर")) && 
            (lower.contains("kahan") || lower.contains("status") || lower.contains("kab") || 
             lower.contains("time") || lower.contains("tracking") || lower.contains("check") || 
             lower.contains("mera") || lower.contains("स्टेटस") || lower.contains("hua"))) {
            res.isOrderStatusQuery = true;
        }

        // 5. Explicit popular items NOT in Bikaner Express menu
        if (lower.contains("biryani") || lower.contains("बिरयानी")) {
            res.unavailableItems.add("Biryani");
        }
        if (lower.contains("momo") || lower.contains("momos") || lower.contains("मोमो") || lower.contains("मोमोज़")) {
            res.unavailableItems.add("Momos");
        }
        if (lower.contains("pasta") || lower.contains("पास्ता")) {
            res.unavailableItems.add("Pasta");
        }
        if (lower.contains("maggi") || lower.contains("मैगी")) {
            res.unavailableItems.add("Maggi");
        }
        if (lower.contains("roll") || lower.contains("rolls") || lower.contains("frankie") || lower.contains("रोल")) {
            res.unavailableItems.add("Rolls / Frankies");
        }
        if (lower.contains("poha") || lower.contains("पोहा")) {
            res.unavailableItems.add("Poha");
        }
        if (lower.contains("dal baati") || lower.contains("daal baati") || lower.contains("दाल बाटी")) {
            res.unavailableItems.add("Dal Baati");
        }
        if (lower.contains("chole kulche") || lower.contains("छोले कुलचे")) {
            res.unavailableItems.add("Chole Kulche Combo");
        }
        if (lower.contains("jalebi") || lower.contains("जलेबी")) {
            res.unavailableItems.add("Jalebi");
        }
        if (lower.contains("sizzler") || lower.contains("सिज़लर")) {
            res.unavailableItems.add("Sizzler");
        }
        if (lower.contains("khasta kachori") || lower.contains("pyaz kachori")) {
            res.unavailableItems.add("Khasta / Pyaz Kachori");
        }

        // 6. Direct exact / substring match against all 86 menu items
        for (MenuItem item : allMenu) {
            String itemNameLower = item.getName().toLowerCase();
            if (lower.contains(itemNameLower)) {
                if (!res.availableMatches.contains(item)) {
                    res.availableMatches.add(item);
                }
            }
        }

        // 7. If no direct full-name match, check category keywords & ingredient triggers
        if (res.availableMatches.isEmpty()) {
            if (lower.contains("paneer") || lower.contains("पनीर")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("paneer")).forEach(res.availableMatches::add);
            } else if (lower.contains("dal") || lower.contains("daal") || lower.contains("दाल")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("dal") || m.getName().toLowerCase().contains("daal")).forEach(res.availableMatches::add);
            } else if (lower.contains("roti") || lower.contains("रोटी")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("roti")).forEach(res.availableMatches::add);
            } else if (lower.contains("naan") || lower.contains("नान")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("naan")).forEach(res.availableMatches::add);
            } else if (lower.contains("kulcha") || lower.contains("कुल्चा")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("kulcha")).forEach(res.availableMatches::add);
            } else if (lower.contains("paratha") || lower.contains("parantha") || lower.contains("पराठा")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("parantha") || m.getName().toLowerCase().contains("paratha")).forEach(res.availableMatches::add);
            } else if (lower.contains("dosa") || lower.contains("डोसा")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("dosa")).forEach(res.availableMatches::add);
            } else if (lower.contains("idli") || lower.contains("इडली")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("idli")).forEach(res.availableMatches::add);
            } else if (lower.contains("coffee") || lower.contains("कॉफी")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("coffee")).forEach(res.availableMatches::add);
            } else if (lower.contains("chai") || lower.contains("tea") || lower.contains("चाय")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("tea")).forEach(res.availableMatches::add);
            } else if (lower.contains("pizza") || lower.contains("पिज़्ज़ा")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("pizza")).forEach(res.availableMatches::add);
            } else if (lower.contains("burger") || lower.contains("बर्गर")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("burger")).forEach(res.availableMatches::add);
            } else if (lower.contains("sandwich") || lower.contains("सैंडविच")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("sandwich")).forEach(res.availableMatches::add);
            } else if (lower.contains("chaap") || lower.contains("चाप")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("chaap")).forEach(res.availableMatches::add);
            } else if (lower.contains("noodles") || lower.contains("chowmein") || lower.contains("नूडल्स") || lower.contains("चाउमीन")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("noodles")).forEach(res.availableMatches::add);
            } else if (lower.contains("fried rice") || lower.contains("चावल") || lower.contains("chawal")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("rice")).forEach(res.availableMatches::add);
            } else if (lower.contains("chole bhature") || lower.contains("bhature") || lower.contains("भटूरे")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("bhature")).forEach(res.availableMatches::add);
            } else if (lower.contains("pav bhaji") || lower.contains("पाव भाजी")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("pav bhaji")).forEach(res.availableMatches::add);
            } else if (lower.contains("gol gappa") || lower.contains("pani puri") || lower.contains("गोल गप्पा") || lower.contains("पानी पुरी")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("gol gappa")).forEach(res.availableMatches::add);
            } else if (lower.contains("chaat") || lower.contains("चाट")) {
                allMenu.stream().filter(m -> m.getCategory().equalsIgnoreCase("Chaat & Snacks")).forEach(res.availableMatches::add);
            } else if (lower.contains("thali") || lower.contains("थाली")) {
                allMenu.stream().filter(m -> m.getCategory().equalsIgnoreCase("Thali & Platters")).forEach(res.availableMatches::add);
            } else if (lower.contains("mojito") || lower.contains("मोहितो")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("mojito")).forEach(res.availableMatches::add);
            } else if (lower.contains("sweet") || lower.contains("dessert") || lower.contains("meetha") || lower.contains("मीठा")) {
                allMenu.stream().filter(m -> m.getCategory().equalsIgnoreCase("Desserts & Sweets")).forEach(res.availableMatches::add);
            } else if (lower.contains("rasmalai") || lower.contains("रसमलाई")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("rasmalai")).forEach(res.availableMatches::add);
            } else if (lower.contains("gulab jamun") || lower.contains("गुलाब जामुन")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("gulab jamun")).forEach(res.availableMatches::add);
            } else if (lower.contains("kulfi") || lower.contains("कुल्फी")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("kulfi")).forEach(res.availableMatches::add);
            } else if (lower.contains("pastry") || lower.contains("पेस्ट्री")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("pastry")).forEach(res.availableMatches::add);
            } else if (lower.contains("samosa") || lower.contains("समोसा")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("samosa")).forEach(res.availableMatches::add);
            } else if (lower.contains("manchurian") || lower.contains("मंचूरियन")) {
                allMenu.stream().filter(m -> m.getName().toLowerCase().contains("manchurian")).forEach(res.availableMatches::add);
            }
        }

        return res;
    }
}
