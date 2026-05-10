package proone.inventoryservice.exception;

public class InvalidInventoryRequestException extends RuntimeException {
    public InvalidInventoryRequestException(String message) {
        super(message);
    }
}
