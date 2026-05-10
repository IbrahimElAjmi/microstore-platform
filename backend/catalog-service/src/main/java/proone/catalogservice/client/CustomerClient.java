package proone.catalogservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import proone.catalogservice.exception.CustomerServiceUnavailableException;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomerClient {

    private final RestTemplate restTemplate;

    @Value("${customer.service.url}")
    private String customerServiceUrl;

    public boolean userExists(Long userId) {
        try {
            String url = customerServiceUrl + "/api/users/" + userId;
            restTemplate.getForObject(url, Object.class);
            return true;
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        } catch (Exception e) {
            log.error("Could not reach customer-service: {}", e.getMessage());
            throw new CustomerServiceUnavailableException("Customer service unavailable");
        }
    }

    @SuppressWarnings("unchecked")
    public boolean isAdmin(Long userId) {
        try {
            String url = customerServiceUrl + "/api/users/" + userId + "/role";
            Map<String, String> response = restTemplate.getForObject(url, Map.class);
            return response != null && "ADMIN".equals(response.get("role"));
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        } catch (Exception e) {
            log.error("Could not reach customer-service: {}", e.getMessage());
            throw new CustomerServiceUnavailableException("Customer service unavailable");
        }
    }
}
