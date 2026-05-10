package proone.customerservice1.repository;




import org.springframework.data.jpa.repository.JpaRepository;
import proone.customerservice1.entity.Profile;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByUserId(Long userId);
}