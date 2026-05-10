package proone.inventoryservice.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import proone.inventoryservice.entity.Inventory;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);

    List<Inventory> findByProductIdIn(List<Long> productIds);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select inventory from Inventory inventory where inventory.productId = :productId")
    Optional<Inventory> findByProductIdForUpdate(Long productId);
}
