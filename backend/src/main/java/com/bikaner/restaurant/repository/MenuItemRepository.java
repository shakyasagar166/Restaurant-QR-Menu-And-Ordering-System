package com.bikaner.restaurant.repository;

import com.bikaner.restaurant.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategoryIgnoreCase(String category);
    List<MenuItem> findByIsAvailableTrue();
    
    @Query("SELECT DISTINCT m.category FROM MenuItem m ORDER BY m.category ASC")
    List<String> findDistinctCategories();

    List<MenuItem> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
}
