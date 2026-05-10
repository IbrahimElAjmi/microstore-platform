package proone.billingservice.exception;

public class InvalidOrderDataException extends RuntimeException {
    public InvalidOrderDataException(String message) {
        super(message);
    }
}
