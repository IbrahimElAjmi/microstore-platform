package proone.billingservice.exception;

public class BillingAlreadyExistsException extends RuntimeException {
    public BillingAlreadyExistsException(String message) {
        super(message);
    }
}
