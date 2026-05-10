package proone.inventoryservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import proone.inventoryservice.entity.Inventory;
import proone.inventoryservice.repository.InventoryRepository;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final InventoryRepository inventoryRepository;

    @Override
    public void run(String... args) {
        if (inventoryRepository.count() > 0) {
            return;
        }

        inventoryRepository.save(Inventory.builder()
                .productId(1L)
                .quantity(20)
                .build());

        inventoryRepository.save(Inventory.builder()
                .productId(2L)
                .quantity(50)
                .build());
    }
}
