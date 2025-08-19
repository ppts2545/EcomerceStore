package com.example.E_commerceStore.WebApp.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProductDto(
    Long id,
    String name,
    String description,
    BigDecimal price,
    Integer stock,
    Long storeId,
    String storeName,
    List<MediaItemDto> mediaItems,
    List<TagDto> tags
) {}