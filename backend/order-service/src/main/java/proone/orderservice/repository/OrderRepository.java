package proone.orderservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import proone.orderservice.entity.Order;
import proone.orderservice.entity.OrderStatus;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByProductId(Long productId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByCustomerIdAndStatus(Long customerId, OrderStatus status);
}
