package proone.customerservice1.controller;




import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import proone.customerservice1.dto.LoginRequest;
import proone.customerservice1.dto.LoginResponse;
import proone.customerservice1.dto.ProfileDTO;
import proone.customerservice1.dto.ProfileResponse;
import proone.customerservice1.dto.RegisterRequest;
import proone.customerservice1.dto.UserUpdateRequest;
import proone.customerservice1.entity.User;
import proone.customerservice1.dto.UserResponse;
import proone.customerservice1.service.CustomerService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;

    // POST /api/auth/register
    @PostMapping("/auth/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = customerService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(user));
    }

    // POST /api/auth/login
    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = customerService.login(request);
        return ResponseEntity.ok(response);
    }

    // GET /api/users/{id}
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(UserResponse.from(customerService.getUserById(id)));
    }
    @GetMapping("/users")
    public List<UserResponse> getUserById() {
        return customerService.getUsers().stream()
                .map(UserResponse::from)
                .toList();
    }

    @PostMapping("/users/clients")
    public ResponseEntity<UserResponse> createClient(@Valid @RequestBody RegisterRequest request,
                                                     @RequestParam Long requestedBy) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserResponse.from(customerService.createClient(request, requestedBy)));
    }

    @PutMapping("/users/clients/{id}")
    public ResponseEntity<UserResponse> updateClient(@PathVariable Long id,
                                                     @Valid @RequestBody UserUpdateRequest request,
                                                     @RequestParam Long requestedBy) {
        return ResponseEntity.ok(UserResponse.from(customerService.updateClient(id, request, requestedBy)));
    }

    @DeleteMapping("/users/clients/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id,
                                             @RequestParam Long requestedBy) {
        customerService.deleteClient(id, requestedBy);
        return ResponseEntity.noContent().build();
    }

    // GET /api/users/{id}/profile
    @GetMapping("/users/{id}/profile")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(ProfileResponse.from(customerService.getProfile(id)));
    }

    // PUT /api/users/{id}/profile
    @PutMapping("/users/{id}/profile")
    public ResponseEntity<ProfileResponse> updateProfile(@PathVariable Long id,
                                                 @RequestBody ProfileDTO dto) {
        return ResponseEntity.ok(ProfileResponse.from(customerService.updateProfile(id, dto)));
    }

    /**
     * 🔗 Called by catalog-service to check if a user is ADMIN
     * GET /api/users/{id}/role
     */
    @GetMapping("/users/{id}/role")
    public ResponseEntity<Map<String, String>> getUserRole(@PathVariable Long id) {
        User user = customerService.getUserById(id);
        return ResponseEntity.ok(Map.of("role", user.getRole().name()));
    }
}
