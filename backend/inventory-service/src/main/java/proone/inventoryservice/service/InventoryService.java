package proone.inventoryservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import proone.inventoryservice.dto.InventoryResponse;
import proone.inventoryservice.entity.Inventory;
import proone.inventoryservice.exception.InsufficientStockException;
import proone.inventoryservice.exception.InvalidInventoryRequestException;
import proone.inventoryservice.exception.InventoryNotFoundException;
import proone.inventoryservice.repository.InventoryRepository;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    @Transactional(readOnly = true)
    public List<InventoryResponse> isInStock(List<Long> productIds) {
        List<Long> requestedProductIds = normalizeProductIds(productIds);
        if (requestedProductIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Inventory> inventoryByProductId = inventoryRepository.findByProductIdIn(requestedProductIds).stream()
                .collect(java.util.stream.Collectors.toMap(Inventory::getProductId, Function.identity()));

        return requestedProductIds.stream()
                .map(inventoryByProductId::get)
                .filter(java.util.Objects::nonNull)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByProductId(Long productId) {
        validateProductId(productId);

        return inventoryRepository.findByProductId(productId)
                .map(this::toResponse)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product ID: " + productId));
    }

    @Transactional
    public void updateInventory(Long productId, Integer quantity) {
        validateProductId(productId);
        validateQuantity(quantity, false);

        Inventory inventory = inventoryRepository.findByProductIdForUpdate(productId)
                .orElse(Inventory.builder()
                        .productId(productId)
                        .quantity(0)
                        .build());
        inventory.setQuantity(quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void reduceInventory(Long productId, Integer quantity) {
        validateProductId(productId);
        validateQuantity(quantity, true);

        Inventory inventory = inventoryRepository.findByProductIdForUpdate(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product ID: " + productId));

        if (inventory.getQuantity() < quantity) {
            throw new InsufficientStockException("Insufficient stock for product ID: " + productId);
        }

        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void increaseInventory(Long productId, Integer quantity) {
        validateProductId(productId);
        validateQuantity(quantity, true);

        Inventory inventory = inventoryRepository.findByProductIdForUpdate(productId)
                .orElse(Inventory.builder()
                        .productId(productId)
                        .quantity(0)
                        .build());

        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventoryRepository.save(inventory);
    }

    private InventoryResponse toResponse(Inventory inventory) {
        return InventoryResponse.builder()
                .productId(inventory.getProductId())
                .quantity(inventory.getQuantity())
                .build();
    }

    private List<Long> normalizeProductIds(List<Long> productIds) {
        if (productIds == null) {
            return List.of();
        }

        return productIds.stream()
                .flatMap(productId -> productId == null ? Stream.empty() : Stream.of(productId))
                .filter(productId -> productId > 0)
                .distinct()
                .toList();
    }

    private void validateProductId(Long productId) {
        if (productId == null || productId <= 0) {
            throw new InvalidInventoryRequestException("Product ID must be greater than zero");
        }
    }

    private void validateQuantity(Integer quantity, boolean mustBePositive) {
        if (quantity == null) {
            throw new InvalidInventoryRequestException("Quantity is required");
        }

        if (mustBePositive && quantity <= 0) {
            throw new InvalidInventoryRequestException("Quantity must be greater than zero");
        }

        if (!mustBePositive && quantity < 0) {
            throw new InvalidInventoryRequestException("Quantity cannot be negative");
        }
    }
}
