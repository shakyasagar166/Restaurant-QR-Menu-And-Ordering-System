package com.bikaner.restaurant.repository;

import com.bikaner.restaurant.model.Order;
import com.bikaner.restaurant.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByTableNumberOrderByCreatedAtDesc(String tableNumber);
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    List<Order> findByStatusNotOrderByCreatedAtDesc(OrderStatus status);
}
