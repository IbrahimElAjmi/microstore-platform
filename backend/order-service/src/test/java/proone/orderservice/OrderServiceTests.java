package proone.orderservice;

import org.junit.jupiter.api.Test;
import proone.orderservice.client.CatalogClient;
import proone.orderservice.client.CustomerClient;
import proone.orderservice.client.InventoryClient;
import proone.orderservice.dto.OrderRequest;
import proone.orderservice.entity.Order;
import proone.orderservice.entity.OrderStatus;
import proone.orderservice.repository.OrderRepository;
import proone.orderservice.service.OrderService;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderServiceTests {

    private final OrderRepository orderRepository = mock(OrderRepository.class);
    private final CatalogClient catalogClient = mock(CatalogClient.class);
    private final CustomerClient customerClient = mock(CustomerClient.class);
    private final InventoryClient inventoryClient = mock(InventoryClient.class);
    private final OrderService orderService = new OrderService(
            orderRepository,
            catalogClient,
            customerClient,
            inventoryClient
    );

    @Test
    void createOrderReducesInventoryAfterSavingOrder() {
        OrderRequest request = orderRequest(OrderStatus.PENDING);
        when(customerClient.getUserById(10L)).thenReturn(Map.of("id", 10L));
        when(catalogClient.getProductById(20L)).thenReturn(Map.of("price", 15.0));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(1L);
            return order;
        });

        Order order = orderService.createOrder(request);

        assertEquals(45.0, order.getTotalPrice());
        verify(inventoryClient).reduceInventory(20L, 3);
    }

    @Test
    void createCancelledOrderDoesNotReduceInventory() {
        OrderRequest request = orderRequest(OrderStatus.CANCELLED);
        when(customerClient.getUserById(10L)).thenReturn(Map.of("id", 10L));
        when(catalogClient.getProductById(20L)).thenReturn(Map.of("price", 15.0));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        orderService.createOrder(request);

        verify(inventoryClient, never()).reduceInventory(any(), any());
    }

    @Test
    void cancellingOrderRestoresInventory() {
        Order existing = Order.builder()
                .id(1L)
                .customerId(10L)
                .productId(20L)
                .quantity(3)
                .totalPrice(45.0)
                .status(OrderStatus.PENDING)
                .build();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order order = orderService.updateOrderStatus(1L, OrderStatus.CANCELLED);

        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        verify(inventoryClient).increaseInventory(20L, 3);
    }

    private OrderRequest orderRequest(OrderStatus status) {
        OrderRequest request = new OrderRequest();
        request.setCustomerId(10L);
        request.setProductId(20L);
        request.setQuantity(3);
        request.setStatus(status);
        return request;
    }
}
