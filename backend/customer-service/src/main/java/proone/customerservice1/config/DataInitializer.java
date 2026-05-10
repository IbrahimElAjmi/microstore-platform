package proone.customerservice1.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import proone.customerservice1.entity.Profile;
import proone.customerservice1.entity.Role;
import proone.customerservice1.entity.User;
import proone.customerservice1.repository.ProfileRepository;
import proone.customerservice1.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    @Override
    public void run(String... args) {
        createUserIfMissing("Admin", "User", "admin@estore.com", "admin123", Role.ADMIN);
        createUserIfMissing("Client", "User", "client@estore.com", "client123", Role.CLIENT);
    }

    private void createUserIfMissing(String firstName, String lastName, String email, String password, Role role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User user = userRepository.save(User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(password)
                .role(role)
                .build());

        profileRepository.save(Profile.builder()
                .user(user)
                .build());
    }
}
