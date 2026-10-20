package com.bikaner.restaurant.controller;

import com.bikaner.restaurant.model.MenuItem;
import com.bikaner.restaurant.repository.MenuItemRepository;
import com.bikaner.restaurant.security.InputSanitizer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    private final MenuItemRepository menuItemRepository;

    public MenuController(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    @GetMapping
    public List<MenuItem> getAllMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        if (search != null && !search.trim().isEmpty()) {
            String sanitizedSearch = InputSanitizer.sanitizeText(search.trim(), 50);
            return menuItemRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(sanitizedSearch, sanitizedSearch);
        }
        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
            String sanitizedCategory = InputSanitizer.sanitizeText(category.trim(), 50);
            return menuItemRepository.findByCategoryIgnoreCase(sanitizedCategory);
        }
        return menuItemRepository.findAll();
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return menuItemRepository.findDistinctCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable Long id) {
        return menuItemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createMenuItem(@RequestBody MenuItem item) {
        if (item.getName() == null || item.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Dish name is required."));
        }

        // Deduplication: if dish already exists by name, update it instead of duplicate
        String cleanName = InputSanitizer.sanitizeText(item.getName().trim(), 100);
        List<MenuItem> existingList = menuItemRepository.findByNameIgnoreCase(cleanName);
        MenuItem target = existingList.isEmpty() ? item : existingList.get(0);

        target.setName(cleanName);
        target.setCategory(InputSanitizer.sanitizeText(item.getCategory(), 50));
        target.setDescription(InputSanitizer.sanitizeText(item.getDescription(), 1000));
        target.setImageUrl(InputSanitizer.sanitizeText(item.getImageUrl(), 4096));
        target.setTag(InputSanitizer.sanitizeText(item.getTag(), 50));

        if (item.getPrice() == null || item.getPrice() < 0) {
            target.setPrice(0.0);
        } else {
            target.setPrice(item.getPrice());
        }
        target.setAvailable(item.isAvailable());
        target.setVeg(item.isVeg());

        MenuItem saved = menuItemRepository.save(target);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/toggle-availability")
    public ResponseEntity<MenuItem> toggleAvailability(@PathVariable Long id) {
        return menuItemRepository.findById(id).map(item -> {
            item.setAvailable(!item.isAvailable());
            return ResponseEntity.ok(menuItemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem updatedItem) {
        // 1. Try finding by database ID
        MenuItem target = menuItemRepository.findById(id).orElse(null);

        // 2. Fallback: If not found by ID (e.g. from frontend catalog ID like 101), look up by dish Name
        if (target == null && updatedItem.getName() != null && !updatedItem.getName().trim().isEmpty()) {
            List<MenuItem> byName = menuItemRepository.findByNameIgnoreCase(updatedItem.getName().trim());
            if (!byName.isEmpty()) {
                target = byName.get(0);
            }
        }

        // 3. Fallback: If still not in database, create as a new MenuItem (UPSERT) so edit never fails
        if (target == null) {
            target = new MenuItem();
        }

        if (updatedItem.getName() != null && !updatedItem.getName().trim().isEmpty()) {
            target.setName(InputSanitizer.sanitizeText(updatedItem.getName(), 100));
        }
        if (updatedItem.getCategory() != null && !updatedItem.getCategory().trim().isEmpty()) {
            target.setCategory(InputSanitizer.sanitizeText(updatedItem.getCategory(), 50));
        }
        if (updatedItem.getPrice() != null && updatedItem.getPrice() >= 0) {
            target.setPrice(updatedItem.getPrice());
        }
        if (updatedItem.getDescription() != null) {
            target.setDescription(InputSanitizer.sanitizeText(updatedItem.getDescription(), 1000));
        }
        if (updatedItem.getImageUrl() != null && !updatedItem.getImageUrl().trim().isEmpty()) {
            target.setImageUrl(InputSanitizer.sanitizeText(updatedItem.getImageUrl(), 4096));
        }
        if (updatedItem.getTag() != null) {
            target.setTag(InputSanitizer.sanitizeText(updatedItem.getTag(), 50));
        }
        target.setAvailable(updatedItem.isAvailable());
        target.setVeg(updatedItem.isVeg());

        MenuItem saved = menuItemRepository.save(target);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        if (menuItemRepository.existsById(id)) {
            menuItemRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
