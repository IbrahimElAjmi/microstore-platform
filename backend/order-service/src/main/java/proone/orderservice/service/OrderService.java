package proone.orderservice.service;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import proone.orderservice.client.CatalogClient;
import proone.orderservice.client.CustomerClient;
import proone.orderservice.client.InventoryClient;
import proone.orderservice.dto.OrderRequest;
import proone.orderservice.entity.Order;
import proone.orderservice.entity.OrderStatus;
import proone.orderservice.exception.CustomerNotFoundException;
import proone.orderservice.exception.ExternalServiceException;
import proone.orderservice.exception.InventoryUpdateException;
import proone.orderservice.exception.InvalidProductDataException;
import proone.orderservice.exception.OrderNotFoundException;
import proone.orderservice.exception.ProductNotFoundException;
import proone.orderservice.repository.OrderRepository;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CatalogClient catalogClient;
    private final CustomerClient customerClient;
    private final InventoryClient inventoryClient;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found: " + id));
    }

    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public List<Order> getOrdersByCustomerAndStatus(Long customerId, OrderStatus status) {
        return orderRepository.findByCustomerIdAndStatus(customerId, status);
    }

    @Transactional
    public Order createOrder(OrderRequest request) {
        validateCustomerExists(request.getCustomerId());
        double unitPrice = extractProductPrice(request.getProductId());

        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .productId(request.getProductId())
                .quantity(request.getQuantity())
                .totalPrice(unitPrice * request.getQuantity())
                .status(request.getStatus() == null ? OrderStatus.PENDING : request.getStatus())
                .build();

        Order savedOrder = orderRepository.save(order);
        if (savedOrder.getStatus() != OrderStatus.CANCELLED) {
            reduceInventory(request.getProductId(), request.getQuantity());
        }
        return savedOrder;
    }

    @Transactional
    public Order updateOrder(Long id, OrderRequest request) {
        Order existing = getOrderById(id);

        validateCustomerExists(request.getCustomerId());
        double unitPrice = extractProductPrice(request.getProductId());
        OrderStatus targetStatus = request.getStatus() == null ? existing.getStatus() : request.getStatus();
        adjustInventoryForOrderUpdate(existing, request, targetStatus);

        existing.setCustomerId(request.getCustomerId());
        existing.setProductId(request.getProductId());
        existing.setQuantity(request.getQuantity());
        existing.setTotalPrice(unitPrice * request.getQuantity());
        existing.setStatus(targetStatus);

        return orderRepository.save(existing);
    }

    @Transactional
    public Order updateOrderStatus(Long id, OrderStatus status) {
        Order existing = getOrderById(id);
        if (existing.getStatus() != OrderStatus.CANCELLED && status == OrderStatus.CANCELLED) {
            increaseInventory(existing.getProductId(), existing.getQuantity());
        } else if (existing.getStatus() == OrderStatus.CANCELLED && status != OrderStatus.CANCELLED) {
            reduceInventory(existing.getProductId(), existing.getQuantity());
        }
        existing.setStatus(status);
        return orderRepository.save(existing);
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order existing = getOrderById(id);
        if (existing.getStatus() != OrderStatus.CANCELLED) {
            increaseInventory(existing.getProductId(), existing.getQuantity());
        }
        orderRepository.delete(existing);
    }

    private void validateCustomerExists(Long customerId) {
        try {
            customerClient.getUserById(customerId);
        } catch (FeignException.NotFound e) {
            throw new CustomerNotFoundException("Customer not found: " + customerId);
        } catch (FeignException e) {
            throw new ExternalServiceException("Customer service unavailable");
        }
    }

    private double extractProductPrice(Long productId) {
        try {
            Map<String, Object> product = catalogClient.getProductById(productId);
            if (product == null || !product.containsKey("price") || product.get("price") == null) {
                throw new InvalidProductDataException("Invalid product response for product: " + productId);
            }
            return Double.parseDouble(product.get("price").toString());
        } catch (FeignException.NotFound e) {
            throw new ProductNotFoundException("Product not found: " + productId);
        } catch (FeignException e) {
            throw new ExternalServiceException("Catalog service unavailable");
        }
    }

    private void reduceInventory(Long productId, Integer quantity) {
        try {
            inventoryClient.reduceInventory(productId, quantity);
        } catch (FeignException.BadRequest e) {
            throw new InventoryUpdateException("Insufficient inventory for product: " + productId);
        } catch (FeignException.NotFound e) {
            throw new InventoryUpdateException("Inventory not found for product: " + productId);
        } catch (FeignException e) {
            throw new ExternalServiceException("Inventory service unavailable");
        }
    }

    private void increaseInventory(Long productId, Integer quantity) {
        try {
            inventoryClient.increaseInventory(productId, quantity);
        } catch (FeignException.BadRequest e) {
            throw new InventoryUpdateException("Invalid inventory update for product: " + productId);
        } catch (FeignException e) {
            throw new ExternalServiceException("Inventory service unavailable");
        }
    }

    private void adjustInventoryForOrderUpdate(Order existing, OrderRequest request, OrderStatus targetStatus) {
        boolean existingReservesStock = existing.getStatus() != OrderStatus.CANCELLED;
        boolean targetReservesStock = targetStatus != OrderStatus.CANCELLED;

        if (existingReservesStock && !targetReservesStock) {
            increaseInventory(existing.getProductId(), existing.getQuantity());
            return;
        }

        if (!existingReservesStock && targetReservesStock) {
            reduceInventory(request.getProductId(), request.getQuantity());
            return;
        }

        if (!existingReservesStock) {
            return;
        }

        boolean productChanged = !existing.getProductId().equals(request.getProductId());
        if (productChanged) {
            reduceInventory(request.getProductId(), request.getQuantity());
            increaseInventory(existing.getProductId(), existing.getQuantity());
            return;
        }

        int quantityDifference = request.getQuantity() - existing.getQuantity();
        if (quantityDifference > 0) {
            reduceInventory(existing.getProductId(), quantityDifference);
        } else if (quantityDifference < 0) {
            increaseInventory(existing.getProductId(), Math.abs(quantityDifference));
        }
    }
}
