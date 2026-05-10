package proone.billingservice.dto;

import lombok.Builder;
import lombok.Data;
import proone.billingservice.entity.Billing;
import proone.billingservice.entity.BillingStatus;
import proone.billingservice.entity.PaymentMethod;

import java.time.LocalDateTime;

@Data
@Builder
public class BillingResponse {
    private Long id;
    private Long orderId;
    private Double amount;
    private BillingStatus status;
    private PaymentMethod paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    public static BillingResponse from(Billing billing) {
        return BillingResponse.builder()
                .id(billing.getId())
                .orderId(billing.getOrderId())
                .amount(billing.getAmount())
                .status(billing.getStatus())
                .paymentMethod(billing.getPaymentMethod())
                .createdAt(billing.getCreatedAt())
                .paidAt(billing.getPaidAt())
                .build();
    }
}
