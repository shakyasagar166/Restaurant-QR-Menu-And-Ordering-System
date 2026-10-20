package com.bikaner.restaurant.controller;

import com.bikaner.restaurant.model.MenuItem;
import com.bikaner.restaurant.repository.MenuItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            return menuItemRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search.trim(), search.trim());
        }
        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
            return menuItemRepository.findByCategoryIgnoreCase(category.trim());
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
    public MenuItem createMenuItem(@RequestBody MenuItem item) {
        return menuItemRepository.save(item);
    }

    @PutMapping("/{id}/toggle-availability")
    public ResponseEntity<MenuItem> toggleAvailability(@PathVariable Long id) {
        return menuItemRepository.findById(id).map(item -> {
            item.setAvailable(!item.isAvailable());
            return ResponseEntity.ok(menuItemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem updatedItem) {
        return menuItemRepository.findById(id).map(existing -> {
            if (updatedItem.getName() != null && !updatedItem.getName().trim().isEmpty()) {
                existing.setName(updatedItem.getName().trim());
            }
            if (updatedItem.getCategory() != null && !updatedItem.getCategory().trim().isEmpty()) {
                existing.setCategory(updatedItem.getCategory().trim());
            }
            if (updatedItem.getPrice() != null && updatedItem.getPrice() >= 0) {
                existing.setPrice(updatedItem.getPrice());
            }
            if (updatedItem.getDescription() != null) {
                existing.setDescription(updatedItem.getDescription().trim());
            }
            if (updatedItem.getImageUrl() != null && !updatedItem.getImageUrl().trim().isEmpty()) {
                existing.setImageUrl(updatedItem.getImageUrl().trim());
            }
            if (updatedItem.getTag() != null) {
                existing.setTag(updatedItem.getTag().trim().isEmpty() ? null : updatedItem.getTag().trim());
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
