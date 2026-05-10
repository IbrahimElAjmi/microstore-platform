package proone.billingservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import proone.billingservice.entity.Billing;
import proone.billingservice.entity.BillingStatus;

import java.util.List;
import java.util.Optional;

public interface BillingRepository extends JpaRepository<Billing, Long> {
    Optional<Billing> findByOrderId(Long orderId);
    boolean existsByOrderId(Long orderId);
    List<Billing> findByStatus(BillingStatus status);
}
