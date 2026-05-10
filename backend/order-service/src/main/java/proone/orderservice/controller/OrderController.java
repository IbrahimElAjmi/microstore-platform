package proone.orderservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import proone.orderservice.dto.OrderRequest;
import proone.orderservice.dto.OrderResponse;
import proone.orderservice.entity.OrderStatus;
import proone.orderservice.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) OrderStatus status) {
        if (customerId != null && status != null) {
            return ResponseEntity.ok(orderService.getOrdersByCustomerAndStatus(customerId, status).stream()
                    .map(OrderResponse::from)
                    .toList());
        }
        if (customerId != null) {
            return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId).stream()
                    .map(OrderResponse::from)
                    .toList());
        }
        if (status != null) {
            return ResponseEntity.ok(orderService.getOrdersByStatus(status).stream()
                    .map(OrderResponse::from)
                    .toList());
        }
        return ResponseEntity.ok(orderService.getAllOrders().stream()
                .map(OrderResponse::from)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(OrderResponse.from(orderService.getOrderById(id)));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(OrderResponse.from(orderService.createOrder(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> updateOrder(@PathVariable Long id, @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(OrderResponse.from(orderService.updateOrder(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(OrderResponse.from(orderService.updateOrderStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
