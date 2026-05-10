package proone.catalogservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import proone.catalogservice.client.CustomerClient;
import proone.catalogservice.dto.CategoryDTO;
import proone.catalogservice.dto.ProductDTO;
import proone.catalogservice.entity.Category;
import proone.catalogservice.entity.Product;
import proone.catalogservice.exception.CategoryAlreadyExistsException;
import proone.catalogservice.exception.CategoryNotFoundException;
import proone.catalogservice.exception.ProductNotFoundException;
import proone.catalogservice.exception.UnauthorizedCatalogAccessException;
import proone.catalogservice.repository.CategoryRepository;
import proone.catalogservice.repository.ProductRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CustomerClient customerClient;

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public Category createCategory(CategoryDTO dto, Long requestedBy) {
        validateAdmin(requestedBy, "create categories");
        if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new CategoryAlreadyExistsException("Category already exists: " + dto.getName());
        }

        Category category = Category.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .build();
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, CategoryDTO dto, Long requestedBy) {
        validateAdmin(requestedBy, "update categories");
        Category category = getCategory(id);

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), id)) {
            throw new CategoryAlreadyExistsException("Category already exists: " + dto.getName());
        }

        category.setName(dto.getName().trim());
        category.setDescription(dto.getDescription());

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id, Long requestedBy) {
        validateAdmin(requestedBy, "delete categories");
        if (!categoryRepository.existsById(id)) {
            throw new CategoryNotFoundException("Category not found: " + id);
        }
        if (productRepository.existsByCategoryId(id)) {
            throw new CategoryAlreadyExistsException("Category is used by products: " + id);
        }
        categoryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Product> searchProducts(String keyword, Long categoryId) {
        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : keyword.trim();
        if (normalizedKeyword != null && categoryId != null) {
            return productRepository.findByNameContainingIgnoreCaseAndCategoryId(normalizedKeyword, categoryId);
        }
        if (normalizedKeyword != null) {
            return productRepository.findByNameContainingIgnoreCase(normalizedKeyword);
        }
        if (categoryId != null) {
            return productRepository.findByCategoryId(categoryId);
        }
        return productRepository.findAll();
    }

    @Transactional
    public Product createProduct(ProductDTO dto, Long requestedBy) {
        validateAdmin(requestedBy, "create products");
        Category category = getCategory(dto.getCategoryId());

        Product product = Product.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .imageUrl(dto.getImageUrl())
                .category(category)
                .build();

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductDTO dto, Long requestedBy) {
        validateAdmin(requestedBy, "update products");
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + id));

        Category category = getCategory(dto.getCategoryId());

        product.setName(dto.getName().trim());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setCategory(category);

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id, Long requestedBy) {
        validateAdmin(requestedBy, "delete products");
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }

    private Category getCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found: " + categoryId));
    }

    private void validateAdmin(Long requestedBy, String action) {
        if (requestedBy == null || !customerClient.isAdmin(requestedBy)) {
            throw new UnauthorizedCatalogAccessException("Access denied: only ADMIN users can " + action + ".");
        }
    }
}
