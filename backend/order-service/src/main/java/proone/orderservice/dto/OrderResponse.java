package proone.orderservice.dto;

import lombok.Builder;
import lombok.Data;
import proone.orderservice.entity.Order;
import proone.orderservice.entity.OrderStatus;

import java.time.LocalDateTime;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Long customerId;
    private Long productId;
    private Integer quantity;
    private Double totalPrice;
    private OrderStatus status;
    private LocalDateTime createdAt;

    public static OrderResponse from(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .productId(order.getProductId())
                .quantity(order.getQuantity())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
