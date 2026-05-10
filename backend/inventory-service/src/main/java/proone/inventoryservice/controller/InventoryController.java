package proone.inventoryservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import proone.inventoryservice.dto.InventoryResponse;
import proone.inventoryservice.service.InventoryService;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<InventoryResponse> isInStock(@RequestParam List<Long> productIds) {
        return inventoryService.isInStock(productIds);
    }

    @GetMapping("/{productId}")
    @ResponseStatus(HttpStatus.OK)
    public InventoryResponse getInventory(@PathVariable Long productId) {
        return inventoryService.getInventoryByProductId(productId);
    }

    @PostMapping("/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void updateInventory(@PathVariable Long productId, @RequestParam Integer quantity) {
        inventoryService.updateInventory(productId, quantity);
    }

    @RequestMapping(value = "/reduce/{productId}", method = {RequestMethod.PUT, RequestMethod.POST})
    @ResponseStatus(HttpStatus.OK)
    public void reduceInventory(@PathVariable Long productId, @RequestParam Integer quantity) {
        inventoryService.reduceInventory(productId, quantity);
    }

    @RequestMapping(value = "/increase/{productId}", method = {RequestMethod.PUT, RequestMethod.POST})
    @ResponseStatus(HttpStatus.OK)
    public void increaseInventory(@PathVariable Long productId, @RequestParam Integer quantity) {
        inventoryService.increaseInventory(productId, quantity);
    }
}
