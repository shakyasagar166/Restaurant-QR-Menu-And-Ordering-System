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
        item.setName(InputSanitizer.sanitizeText(item.getName(), 100));
        item.setCategory(InputSanitizer.sanitizeText(item.getCategory(), 50));
        item.setDescription(InputSanitizer.sanitizeText(item.getDescription(), 300));
        item.setImageUrl(InputSanitizer.sanitizeText(item.getImageUrl(), 255));
        item.setTag(InputSanitizer.sanitizeText(item.getTag(), 30));

        if (item.getPrice() == null || item.getPrice() < 0) {
            item.setPrice(0.0);
        }

        MenuItem saved = menuItemRepository.save(item);
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
        return menuItemRepository.findById(id).map(existing -> {
            if (updatedItem.getName() != null && !updatedItem.getName().trim().isEmpty()) {
                existing.setName(InputSanitizer.sanitizeText(updatedItem.getName(), 100));
            }
            if (updatedItem.getCategory() != null && !updatedItem.getCategory().trim().isEmpty()) {
                existing.setCategory(InputSanitizer.sanitizeText(updatedItem.getCategory(), 50));
            }
            if (updatedItem.getPrice() != null && updatedItem.getPrice() >= 0) {
                existing.setPrice(updatedItem.getPrice());
            }
            if (updatedItem.getDescription() != null) {
                existing.setDescription(InputSanitizer.sanitizeText(updatedItem.getDescription(), 300));
            }
            if (updatedItem.getImageUrl() != null && !updatedItem.getImageUrl().trim().isEmpty()) {
                existing.setImageUrl(InputSanitizer.sanitizeText(updatedItem.getImageUrl(), 255));
            }
            if (updatedItem.getTag() != null) {
                existing.setTag(InputSanitizer.sanitizeText(updatedItem.getTag(), 30));
            }
            existing.setAvailable(updatedItem.isAvailable());
            existing.setVeg(updatedItem.isVeg());
            return ResponseEntity.ok(menuItemRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
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
