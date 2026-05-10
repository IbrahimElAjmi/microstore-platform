package proone.catalogservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryDTO {

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;
}