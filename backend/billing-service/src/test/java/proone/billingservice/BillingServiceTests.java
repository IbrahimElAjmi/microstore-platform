package proone.billingservice;

import org.junit.jupiter.api.Test;
import proone.billingservice.client.OrderClient;
import proone.billingservice.dto.BillingRequest;
import proone.billingservice.entity.Billing;
import proone.billingservice.entity.BillingStatus;
import proone.billingservice.entity.PaymentMethod;
import proone.billingservice.exception.BillingAlreadyExistsException;
import proone.billingservice.exception.InvalidBillingStateException;
import proone.billingservice.repository.BillingRepository;
import proone.billingservice.service.BillingService;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BillingServiceTests {

    private final BillingRepository billingRepository = mock(BillingRepository.class);
    private final OrderClient orderClient = mock(OrderClient.class);
    private final BillingService billingService = new BillingService(billingRepository, orderClient);

    @Test
    void createBillingUsesOrderTotalPrice() {
        BillingRequest request = billingRequest();
        when(billingRepository.existsByOrderId(1L)).thenReturn(false);
        when(orderClient.getOrderById(1L)).thenReturn(Map.of("totalPrice", 120.0));
        when(billingRepository.save(any(Billing.class))).thenAnswer(invocation -> {
            Billing billing = invocation.getArgument(0);
            billing.setId(10L);
            return billing;
        });

        Billing billing = billingService.createBilling(request);

        assertEquals(1L, billing.getOrderId());
        assertEquals(120.0, billing.getAmount());
        assertEquals(BillingStatus.PENDING, billing.getStatus());
        assertEquals(PaymentMethod.CARD, billing.getPaymentMethod());
    }

    @Test
    void createBillingRejectsDuplicateOrderBilling() {
        BillingRequest request = billingRequest();
        when(billingRepository.existsByOrderId(1L)).thenReturn(true);

        assertThrows(BillingAlreadyExistsException.class, () -> billingService.createBilling(request));
    }

    @Test
    void markAsPaidUpdatesStatusAndPaidAt() {
        Billing billing = Billing.builder()
                .id(10L)
                .orderId(1L)
                .amount(120.0)
                .paymentMethod(PaymentMethod.CARD)
                .status(BillingStatus.PENDING)
                .build();
        when(billingRepository.findById(10L)).thenReturn(Optional.of(billing));
        when(billingRepository.save(any(Billing.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Billing paidBilling = billingService.markAsPaid(10L);

        assertEquals(BillingStatus.PAID, paidBilling.getStatus());
        assertNotNull(paidBilling.getPaidAt());
    }

    @Test
    void refundRequiresPaidBilling() {
        Billing billing = Billing.builder()
                .id(10L)
                .orderId(1L)
                .amount(120.0)
                .paymentMethod(PaymentMethod.CARD)
                .status(BillingStatus.PENDING)
                .build();
        when(billingRepository.findById(10L)).thenReturn(Optional.of(billing));

        assertThrows(InvalidBillingStateException.class, () -> billingService.refund(10L));
    }

    private BillingRequest billingRequest() {
        BillingRequest request = new BillingRequest();
        request.setOrderId(1L);
        request.setPaymentMethod(PaymentMethod.CARD);
        return request;
    }
}
