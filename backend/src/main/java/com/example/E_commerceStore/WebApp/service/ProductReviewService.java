package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.ProductReview;
import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.repository.ProductReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductReviewService {
    @Autowired
    private ProductReviewRepository productReviewRepository;

    public ProductReview saveReview(ProductReview review) {
        return productReviewRepository.save(review);
    }

    public List<ProductReview> getReviewsByProduct(Product product) {
        return productReviewRepository.findByProduct(product);
    }

    public List<ProductReview> getReviewsByProductId(Long productId) {
        return productReviewRepository.findByProductId(productId);
    }

    public Optional<ProductReview> getReviewById(Long id) {
        return productReviewRepository.findById(id);
    }

    public void deleteReview(Long id) {
        productReviewRepository.deleteById(id);
    }
}
