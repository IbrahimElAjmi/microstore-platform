package proone.orderservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "inventoryClient", url = "${inventory.service.url:http://localhost:8083}")
public interface InventoryClient {

    @PutMapping("/api/inventory/reduce/{productId}")
    void reduceInventory(@PathVariable("productId") Long productId, @RequestParam("quantity") Integer quantity);

    @PutMapping("/api/inventory/increase/{productId}")
    void increaseInventory(@PathVariable("productId") Long productId, @RequestParam("quantity") Integer quantity);
}
