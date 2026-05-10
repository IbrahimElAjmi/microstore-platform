package proone.catalogservice.exception;

public class UnauthorizedCatalogAccessException extends RuntimeException {
    public UnauthorizedCatalogAccessException(String message) {
        super(message);
    }
}
