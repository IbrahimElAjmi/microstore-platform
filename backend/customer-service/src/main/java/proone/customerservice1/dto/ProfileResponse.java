package proone.customerservice1.dto;

import lombok.Builder;
import lombok.Data;
import proone.customerservice1.entity.Profile;

@Data
@Builder
public class ProfileResponse {
    private Long id;
    private Long userId;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String photoUrl;

    public static ProfileResponse from(Profile profile) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .city(profile.getCity())
                .country(profile.getCountry())
                .photoUrl(profile.getPhotoUrl())
                .build();
    }
}
