package proone.billingservice.service;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import proone.billingservice.client.OrderClient;
import proone.billingservice.dto.BillingRequest;
import proone.billingservice.entity.Billing;
import proone.billingservice.entity.BillingStatus;
import proone.billingservice.exception.BillingAlreadyExistsException;
import proone.billingservice.exception.BillingNotFoundException;
import proone.billingservice.exception.ExternalServiceException;
import proone.billingservice.exception.InvalidBillingStateException;
import proone.billingservice.exception.InvalidOrderDataException;
import proone.billingservice.exception.OrderNotFoundException;
import proone.billingservice.repository.BillingRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillingRepository billingRepository;
    private final OrderClient orderClient;

    @Transactional(readOnly = true)
    public List<Billing> getBillings(BillingStatus status) {
        if (status != null) {
            return billingRepository.findByStatus(status);
        }
        return billingRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Billing getBillingById(Long id) {
        return billingRepository.findById(id)
                .orElseThrow(() -> new BillingNotFoundException("Billing not found: " + id));
    }

    @Transactional(readOnly = true)
    public Billing getBillingByOrderId(Long orderId) {
        return billingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BillingNotFoundException("Billing not found for order: " + orderId));
    }

    @Transactional
    public Billing createBilling(BillingRequest request) {
        if (billingRepository.existsByOrderId(request.getOrderId())) {
            throw new BillingAlreadyExistsException("Billing already exists for order: " + request.getOrderId());
        }

        double amount = extractOrderTotalPrice(request.getOrderId());

        Billing billing = Billing.builder()
                .orderId(request.getOrderId())
                .amount(amount)
                .paymentMethod(request.getPaymentMethod())
                .status(BillingStatus.PENDING)
                .build();

        return billingRepository.save(billing);
    }

    @Transactional
    public Billing markAsPaid(Long id) {
        Billing billing = getBillingById(id);
        if (billing.getStatus() == BillingStatus.PAID) {
            return billing;
        }
        if (billing.getStatus() == BillingStatus.REFUNDED) {
            throw new InvalidBillingStateException("Refunded billing cannot be paid again");
        }

        billing.setStatus(BillingStatus.PAID);
        billing.setPaidAt(LocalDateTime.now());
        return billingRepository.save(billing);
    }

    @Transactional
    public Billing markAsFailed(Long id) {
        Billing billing = getBillingById(id);
        if (billing.getStatus() == BillingStatus.PAID || billing.getStatus() == BillingStatus.REFUNDED) {
            throw new InvalidBillingStateException("Only pending billing can fail");
        }

        billing.setStatus(BillingStatus.FAILED);
        return billingRepository.save(billing);
    }

    @Transactional
    public Billing refund(Long id) {
        Billing billing = getBillingById(id);
        if (billing.getStatus() != BillingStatus.PAID) {
            throw new InvalidBillingStateException("Only paid billing can be refunded");
        }

        billing.setStatus(BillingStatus.REFUNDED);
        return billingRepository.save(billing);
    }

    private double extractOrderTotalPrice(Long orderId) {
        try {
            Map<String, Object> order = orderClient.getOrderById(orderId);
            if (order == null || !order.containsKey("totalPrice") || order.get("totalPrice") == null) {
                throw new InvalidOrderDataException("Invalid order response for order: " + orderId);
            }
            return Double.parseDouble(order.get("totalPrice").toString());
        } catch (FeignException.NotFound e) {
            throw new OrderNotFoundException("Order not found: " + orderId);
        } catch (FeignException e) {
            throw new ExternalServiceException("Order service unavailable");
        } catch (NumberFormatException e) {
            throw new InvalidOrderDataException("Invalid order amount for order: " + orderId);
        }
    }
}
