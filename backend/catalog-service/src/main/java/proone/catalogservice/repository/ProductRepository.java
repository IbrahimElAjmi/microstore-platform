package proone.catalogservice.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import proone.catalogservice.entity.Product;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Search by name keyword
    List<Product> findByNameContainingIgnoreCase(String keyword);

    // Filter by category
    List<Product> findByCategoryId(Long categoryId);

    // Search by name AND category
    List<Product> findByNameContainingIgnoreCaseAndCategoryId(String keyword, Long categoryId);

    boolean existsByCategoryId(Long categoryId);
}
