package proone.customerservice1.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import proone.customerservice1.dto.LoginRequest;
import proone.customerservice1.dto.LoginResponse;
import proone.customerservice1.dto.ProfileDTO;
import proone.customerservice1.dto.RegisterRequest;
import proone.customerservice1.dto.UserUpdateRequest;
import proone.customerservice1.entity.Profile;
import proone.customerservice1.entity.Role;
import proone.customerservice1.entity.User;
import proone.customerservice1.exception.DuplicateEmailException;
import proone.customerservice1.exception.InvalidCredentialsException;
import proone.customerservice1.exception.ProfileNotFoundException;
import proone.customerservice1.exception.UserNotFoundException;
import proone.customerservice1.repository.ProfileRepository;
import proone.customerservice1.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already in use: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.CLIENT;

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(savedUser)
                .build();
        profileRepository.save(profile);

        return savedUser;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                "Login successful"
        );
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Profile getProfile(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user: " + userId));
    }

    @Transactional
    public Profile updateProfile(Long userId, ProfileDTO dto) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user: " + userId));

        profile.setPhone(dto.getPhone());
        profile.setAddress(dto.getAddress());
        profile.setCity(dto.getCity());
        profile.setCountry(dto.getCountry());
        profile.setPhotoUrl(dto.getPhotoUrl());

        return profileRepository.save(profile);
    }

    @Transactional
    public User createClient(RegisterRequest request, Long requestedBy) {
        validateAdmin(requestedBy);
        request.setRole(Role.CLIENT);
        return register(request);
    }

    @Transactional
    public User updateClient(Long id, UserUpdateRequest request, Long requestedBy) {
        validateAdmin(requestedBy);
        User user = getUserById(id);

        if (user.getRole() != Role.CLIENT) {
            throw new UserNotFoundException("Client not found with id: " + id);
        }

        userRepository.findByEmail(request.getEmail())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateEmailException("Email already in use: " + request.getEmail());
                });

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(request.getPassword());
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteClient(Long id, Long requestedBy) {
        validateAdmin(requestedBy);
        User user = getUserById(id);

        if (user.getRole() != Role.CLIENT) {
            throw new UserNotFoundException("Client not found with id: " + id);
        }

        userRepository.delete(user);
    }

    private void validateAdmin(Long requestedBy) {
        User requester = getUserById(requestedBy);
        if (requester.getRole() != Role.ADMIN) {
            throw new InvalidCredentialsException("Access denied: only ADMIN users can manage clients.");
        }
    }
}
