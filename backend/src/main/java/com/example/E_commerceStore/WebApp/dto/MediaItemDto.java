package com.example.E_commerceStore.WebApp.dto;

public record MediaItemDto(
    Long id,
    String type,
    String url,
    String thumbnail,
    String alt,
    Integer displayOrder
) {}
