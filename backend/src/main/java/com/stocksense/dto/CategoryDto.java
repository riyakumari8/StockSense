package com.stocksense.dto;

import com.stocksense.entity.Category;

public class CategoryDto {
    private Long id;
    private String name;
    private String code;
    private String description;

    public CategoryDto() {
    }

    public CategoryDto(Long id, String name, String code, String description) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
    }

    public static CategoryDto fromEntity(Category category) {
        if (category == null) return null;
        return new CategoryDto(
            category.getId(),
            category.getName(),
            category.getCode(),
            category.getDescription()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
