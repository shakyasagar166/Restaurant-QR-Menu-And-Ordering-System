package com.bikaner.restaurant.repository;

import com.bikaner.restaurant.model.Order;
import com.bikaner.restaurant.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items ORDER BY o.createdAt DESC")
    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.tableNumber = :tableNumber ORDER BY o.createdAt DESC")
    List<Order> findByTableNumberOrderByCreatedAtDesc(@Param("tableNumber") String tableNumber);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.status = :status ORDER BY o.createdAt DESC")
    List<Order> findByStatusOrderByCreatedAtDesc(@Param("status") OrderStatus status);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.status <> :status ORDER BY o.createdAt DESC")
    List<Order> findByStatusNotOrderByCreatedAtDesc(@Param("status") OrderStatus status);
}
