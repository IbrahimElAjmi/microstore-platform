package proone.billingservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import proone.billingservice.entity.PaymentMethod;

@Data
public class BillingRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
