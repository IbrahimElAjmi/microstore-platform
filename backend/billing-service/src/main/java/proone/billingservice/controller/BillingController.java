package proone.billingservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import proone.billingservice.dto.BillingRequest;
import proone.billingservice.dto.BillingResponse;
import proone.billingservice.entity.BillingStatus;
import proone.billingservice.service.BillingService;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BillingController {

    private final BillingService billingService;

    @GetMapping
    public ResponseEntity<List<BillingResponse>> getBillings(@RequestParam(required = false) BillingStatus status) {
        return ResponseEntity.ok(billingService.getBillings(status).stream()
                .map(BillingResponse::from)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillingResponse> getBillingById(@PathVariable Long id) {
        return ResponseEntity.ok(BillingResponse.from(billingService.getBillingById(id)));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<BillingResponse> getBillingByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(BillingResponse.from(billingService.getBillingByOrderId(orderId)));
    }

    @PostMapping
    public ResponseEntity<BillingResponse> createBilling(@Valid @RequestBody BillingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(BillingResponse.from(billingService.createBilling(request)));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<BillingResponse> markAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(BillingResponse.from(billingService.markAsPaid(id)));
    }

    @PutMapping("/{id}/fail")
    public ResponseEntity<BillingResponse> markAsFailed(@PathVariable Long id) {
        return ResponseEntity.ok(BillingResponse.from(billingService.markAsFailed(id)));
    }

    @PutMapping("/{id}/refund")
    public ResponseEntity<BillingResponse> refund(@PathVariable Long id) {
        return ResponseEntity.ok(BillingResponse.from(billingService.refund(id)));
    }
}
