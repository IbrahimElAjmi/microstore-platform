package proone.customerservice1.dto;

import lombok.Builder;
import lombok.Data;
import proone.customerservice1.entity.User;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
