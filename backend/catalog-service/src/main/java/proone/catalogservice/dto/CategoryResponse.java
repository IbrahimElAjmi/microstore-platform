package proone.catalogservice.dto;

import lombok.Builder;
import lombok.Data;
import proone.catalogservice.entity.Category;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;

    public static CategoryResponse from(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}
