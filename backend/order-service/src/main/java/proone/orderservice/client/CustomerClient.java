package proone.orderservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "customerClient", url = "${customer.service.url:http://localhost:8081}")
public interface CustomerClient {

    @GetMapping("/api/users/{id}")
    Map<String, Object> getUserById(@PathVariable("id") Long id);
}
