package proone.billingservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "orderClient", url = "${order.service.url:http://localhost:8084}")
public interface OrderClient {

    @GetMapping("/api/orders/{id}")
    Map<String, Object> getOrderById(@PathVariable("id") Long id);
}
