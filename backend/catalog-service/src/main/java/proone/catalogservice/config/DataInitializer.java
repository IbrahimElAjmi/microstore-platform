package proone.catalogservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import proone.catalogservice.entity.Category;
import proone.catalogservice.entity.Product;
import proone.catalogservice.repository.CategoryRepository;
import proone.catalogservice.repository.ProductRepository;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0 || productRepository.count() > 0) {
            return;
        }

        Category electronics = categoryRepository.save(Category.builder()
                .name("Electronics")
                .description("Phones, laptops and accessories")
                .build());

        Category books = categoryRepository.save(Category.builder()
                .name("Books")
                .description("Books and learning materials")
                .build());

        productRepository.save(Product.builder()
                .name("Laptop")
                .description("Student laptop")
                .price(7500.0)
                .imageUrl("https://example.com/laptop.jpg")
                .category(electronics)
                .build());

        productRepository.save(Product.builder()
                .name("Java Book")
                .description("Beginner Java book")
                .price(250.0)
                .imageUrl("https://example.com/java-book.jpg")
                .category(books)
                .build());
    }
}
