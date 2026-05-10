package proone.inventoryservice;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import proone.inventoryservice.dto.InventoryResponse;
import proone.inventoryservice.exception.InsufficientStockException;
import proone.inventoryservice.exception.InvalidInventoryRequestException;
import proone.inventoryservice.service.InventoryService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class InventoryServiceApplicationTests {

    @Autowired
    private InventoryService inventoryService;

    @Test
    void contextLoads() {
    }

    @Test
    void testUpdateAndGetInventory() {
        inventoryService.updateInventory(1L, 100);
        InventoryResponse response = inventoryService.getInventoryByProductId(1L);
        assertEquals(1L, response.getProductId());
        assertEquals(100, response.getQuantity());
    }

    @Test
    void testReduceInventory() {
        inventoryService.updateInventory(2L, 50);
        inventoryService.reduceInventory(2L, 20);
        InventoryResponse response = inventoryService.getInventoryByProductId(2L);
        assertEquals(30, response.getQuantity());
    }

    @Test
    void testReduceInventoryInsufficientStock() {
        inventoryService.updateInventory(3L, 10);
        assertThrows(InsufficientStockException.class, () -> {
            inventoryService.reduceInventory(3L, 20);
        });
    }

    @Test
    void testIsInStockKeepsRequestedOrderAndIgnoresMissingProducts() {
        inventoryService.updateInventory(4L, 15);
        inventoryService.updateInventory(5L, 25);

        List<InventoryResponse> response = inventoryService.isInStock(List.of(5L, 99L, 4L, 5L));

        assertEquals(2, response.size());
        assertEquals(5L, response.get(0).getProductId());
        assertEquals(25, response.get(0).getQuantity());
        assertEquals(4L, response.get(1).getProductId());
        assertEquals(15, response.get(1).getQuantity());
    }

    @Test
    void testUpdateInventoryRejectsNegativeQuantity() {
        assertThrows(InvalidInventoryRequestException.class, () -> {
            inventoryService.updateInventory(6L, -1);
        });
    }

    @Test
    void testReduceInventoryRejectsZeroQuantity() {
        inventoryService.updateInventory(7L, 10);

        assertThrows(InvalidInventoryRequestException.class, () -> {
            inventoryService.reduceInventory(7L, 0);
        });
    }

    @Test
    void testIncreaseInventoryCreatesOrAddsStock() {
        inventoryService.increaseInventory(8L, 5);
        inventoryService.increaseInventory(8L, 7);

        InventoryResponse response = inventoryService.getInventoryByProductId(8L);

        assertEquals(12, response.getQuantity());
    }
}
