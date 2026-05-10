package proone.customerservice1.dto;



import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String message;
}