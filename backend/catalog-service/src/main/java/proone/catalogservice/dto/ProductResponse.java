package proone.catalogservice.dto;

import lombok.Builder;
import lombok.Data;
import proone.catalogservice.entity.Product;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;

    public static ProductResponse from(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .build();
    }
}
