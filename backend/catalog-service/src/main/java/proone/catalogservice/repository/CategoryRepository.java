package proone.catalogservice.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import proone.catalogservice.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String name);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
