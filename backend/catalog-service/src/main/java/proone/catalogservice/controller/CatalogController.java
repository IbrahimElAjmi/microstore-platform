package proone.catalogservice.controller;



import proone.catalogservice.dto.CategoryResponse;
import proone.catalogservice.dto.CategoryDTO;
import proone.catalogservice.dto.ProductDTO;
import proone.catalogservice.dto.ProductResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import proone.catalogservice.service.CatalogService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CatalogController {

    private final CatalogService catalogService;

    // ───────────── CATEGORIES ─────────────

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(catalogService.getAllCategories().stream()
                .map(CategoryResponse::from)
                .toList());
    }

    /**
     * POST /api/categories?requestedBy=1
     * 🔗 requestedBy must be an ADMIN user (verified via customer-service)
     */
    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryDTO dto,
            @RequestParam Long requestedBy) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CategoryResponse.from(catalogService.createCategory(dto, requestedBy)));
    }

    // ───────────── PRODUCTS ─────────────

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDTO dto,
            @RequestParam Long requestedBy) {
        return ResponseEntity.ok(CategoryResponse.from(catalogService.updateCategory(id, dto, requestedBy)));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id,
            @RequestParam Long requestedBy) {
        catalogService.deleteCategory(id, requestedBy);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(catalogService.searchProducts(keyword, categoryId).stream()
                .map(ProductResponse::from)
                .toList());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ProductResponse.from(catalogService.getProductById(id)));
    }

    /**
     * POST /api/products?requestedBy=1
     * 🔗 requestedBy must be an ADMIN user (verified via customer-service)
     */
    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductDTO dto,
            @RequestParam Long requestedBy) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ProductResponse.from(catalogService.createProduct(dto, requestedBy)));
    }

    /**
     * PUT /api/products/{id}?requestedBy=1
     * 🔗 requestedBy must be an ADMIN user
     */
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO dto,
            @RequestParam Long requestedBy) {
        return ResponseEntity.ok(ProductResponse.from(catalogService.updateProduct(id, dto, requestedBy)));
    }

    /**
     * DELETE /api/products/{id}?requestedBy=1
     * 🔗 requestedBy must be an ADMIN user
     */
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @RequestParam Long requestedBy) {
        catalogService.deleteProduct(id, requestedBy);
        return ResponseEntity.noContent().build();
    }
}
