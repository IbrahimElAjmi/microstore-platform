package proone.orderservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "catalogClient", url = "${catalog.service.url:http://localhost:8082}")
public interface CatalogClient {

    @GetMapping("/api/products/{id}")
    Map<String, Object> getProductById(@PathVariable("id") Long id);
}
