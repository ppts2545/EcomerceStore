package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.MediaItem;
import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.model.Store;
import com.example.E_commerceStore.WebApp.model.Tag;
import com.example.E_commerceStore.WebApp.repository.CartItemRepository;
import com.example.E_commerceStore.WebApp.repository.CommentRepository;
import com.example.E_commerceStore.WebApp.repository.MediaItemRepository;
import com.example.E_commerceStore.WebApp.repository.OrderItemRepository;
import com.example.E_commerceStore.WebApp.repository.ProductRepository;
import com.example.E_commerceStore.WebApp.repository.ProductReviewRepository;
import com.example.E_commerceStore.WebApp.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final TagRepository tagRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductReviewRepository productReviewRepository;
    private final MediaItemRepository mediaItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final CommentRepository commentRepository;

    public ProductService(ProductRepository productRepository,
                          TagRepository tagRepository,
                          CartItemRepository cartItemRepository,
                          ProductReviewRepository productReviewRepository,
                          MediaItemRepository mediaItemRepository,
                          OrderItemRepository orderItemRepository,
                          CommentRepository commentRepository) {
        this.productRepository = productRepository;
        this.tagRepository = tagRepository;
        this.cartItemRepository = cartItemRepository;
        this.productReviewRepository = productReviewRepository;
        this.mediaItemRepository = mediaItemRepository;
        this.orderItemRepository = orderItemRepository;
        this.commentRepository = commentRepository;
    }

    // =========================
    // Create: with main image + optional medias
    // =========================
    public Product saveProductWithImagesAndMedia(
            String name,
            String description,
            BigDecimal price,
            Integer stock,
            List<String> tagNames,
            MultipartFile imageFile,
            List<MultipartFile> mediaFiles,
            List<String> mediaTypes,
            List<String> mediaAlts,
            List<String> mediaDisplayOrders
    ) throws Exception {

        final String uploadDir = "uploads/";
        Files.createDirectories(Paths.get(uploadDir));

        // Build Product
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stock);

        // Tags
        if (tagNames != null && !tagNames.isEmpty()) {
            product.setTags(resolveTags(tagNames));
        }

        List<MediaItem> mediaItemList = new ArrayList<>();

        // Main image
        if (imageFile != null && !imageFile.isEmpty()) {
            String filename = randomizeFilename(imageFile.getOriginalFilename());
            Path filePath = Paths.get(uploadDir, filename);
            Files.copy(imageFile.getInputStream(), filePath);

            MediaItem mainMedia = new MediaItem();
            mainMedia.setType("image");
            mainMedia.setUrl("/uploads/" + filename);
            mainMedia.setDisplayOrder(0);
            mainMedia.setProduct(product);
            mediaItemList.add(mainMedia);
        }

        // Additional medias
        if (mediaFiles != null && !mediaFiles.isEmpty()) {
            for (int i = 0; i < mediaFiles.size(); i++) {
                MultipartFile f = mediaFiles.get(i);
                if (f == null || f.isEmpty()) continue;

                String filename = randomizeFilename(f.getOriginalFilename());
                Path filePath = Paths.get(uploadDir, filename);
                Files.copy(f.getInputStream(), filePath);

                MediaItem media = new MediaItem();
                String type = (mediaTypes != null && i < mediaTypes.size()) ? mediaTypes.get(i) : "image";
                String alt = (mediaAlts != null && i < mediaAlts.size()) ? mediaAlts.get(i) : null;
                int displayOrder = 1 + i;
                if (mediaDisplayOrders != null && i < mediaDisplayOrders.size()) {
                    try {
                        displayOrder = Integer.parseInt(mediaDisplayOrders.get(i));
                    } catch (Exception ignore) {}
                }

                media.setType(type);
                media.setAlt(alt);
                media.setDisplayOrder(displayOrder);
                media.setUrl("/uploads/" + filename);
                media.setProduct(product);

                mediaItemList.add(media);
            }
        }

        product.setMediaItems(mediaItemList);

        // NOTE: ต้องแน่ใจว่า mapping ระหว่าง Product <-> MediaItem เป็น Cascade.PERSIST/MERGE ใน entity
        return productRepository.save(product);
    }

    // =========================
    // Create: simple with one main image
    // =========================
    public Product saveProductWithImage(String name,
                                        String description,
                                        BigDecimal price,
                                        Integer stock,
                                        List<String> tagNames,
                                        MultipartFile imageFile) throws Exception {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        final String uploadDir = "uploads/";
        Files.createDirectories(Paths.get(uploadDir));

        String filename = randomizeFilename(imageFile.getOriginalFilename());
        Path filePath = Paths.get(uploadDir, filename);
        Files.copy(imageFile.getInputStream(), filePath);

        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stock);

        if (tagNames != null && !tagNames.isEmpty()) {
            product.setTags(resolveTags(tagNames));
        }

        MediaItem media = new MediaItem();
        media.setType("image");
        media.setUrl("/uploads/" + filename);
        media.setDisplayOrder(0);
        media.setProduct(product);

        product.setMediaItems(List.of(media));

        return productRepository.save(product);
    }

    // =========================
    // Read helpers
    // =========================
    public List<Product> getProductsByTags(List<String> tagNames) {
        return productRepository.findByTagsNameIn(tagNames);
    }

    public List<Product> getProductsByStore(Store store) {
        return productRepository.findByStore(store);
    }

    public List<Product> getProductsByStoreId(Long storeId) {
        return productRepository.findByStoreId(storeId);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    // =========================
    // Create/Update plain
    // =========================
    public Product saveProduct(Product product) {
        validateProductBasics(product);

        // normalize & persist tags
        if (product.getTags() != null && !product.getTags().isEmpty()) {
            Set<Tag> managed = new HashSet<>();
            for (Tag t : product.getTags()) {
                Tag db = tagRepository.findByName(t.getName()).orElse(null);
                if (db == null) {
                    db = tagRepository.save(new Tag(t.getName()));
                }
                managed.add(db);
            }
            product.setTags(managed);
        }

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        return productRepository.findById(id)
                .map(p -> {
                    if (productDetails.getName() != null) p.setName(productDetails.getName());
                    if (productDetails.getDescription() != null) p.setDescription(productDetails.getDescription());
                    if (productDetails.getPrice() != null) p.setPrice(productDetails.getPrice());
                    if (productDetails.getStock() != null) p.setStock(productDetails.getStock());
                    // imageUrl handled via MediaItem entity – ไม่แก้ตรงนี้
                    return productRepository.save(p);
                })
                .orElse(null);
    }

    // =========================
    // Delete with relations
    // =========================
    @Transactional
    public boolean deleteProduct(Long id) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) return false;
        Product product = opt.get();

        // ลบสิ่งที่อ้างอิงสินค้า (ถ้า repo ของคุณมีเมธอดเฉพาะจะเร็วกว่า)
        try {
            // ถ้า CartItemRepository มี deleteByProductId ใช้อันนั้นแทนจะดีกว่า
            cartItemRepository.deleteAll(
                    cartItemRepository.findAll()
                            .stream()
                            .filter(c -> c.getProduct().getId().equals(id))
                            .toList()
            );
        } catch (Exception ignore) {}

        try {
            // ถ้า repo มี deleteByProductId ให้เปลี่ยนมาใช้จะมีประสิทธิภาพกว่า
            productReviewRepository.deleteAll(productReviewRepository.findByProductId(id));
        } catch (Exception ignore) {}

        try {
            mediaItemRepository.deleteByProductId(id);
        } catch (Exception ignore) {}

        try {
            orderItemRepository.deleteByProductId(id);
        } catch (Exception ignore) {}

        try {
            commentRepository.deleteByProduct(product);
        } catch (Exception ignore) {}

        productRepository.deleteById(id);
        return true;
    }

    // =========================
    // Queries
    // =========================
    public List<Product> searchProducts(String keyword) {
        return productRepository.searchByKeyword(keyword);
    }

    public List<Product> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceRange(minPrice, maxPrice);
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findFeaturedProducts();
    }

    public List<Product> getLatestProducts() {
        return productRepository.findLatestProducts();
    }

    public long getTotalProductCount() {
        return productRepository.count();
    }

    // =========================
    // Stock helpers
    // =========================
    public boolean isProductInStock(Long productId) {
        return productRepository.findById(productId)
                .map(p -> p.getStock() != null && p.getStock() > 0)
                .orElse(false);
    }

    public Integer getProductStock(Long productId) {
        return productRepository.findById(productId)
                .map(Product::getStock)
                .orElse(0);
    }

    public Product updateStock(Long productId, Integer newStock) {
        return productRepository.findById(productId)
                .map(p -> {
                    p.setStock(newStock);
                    return productRepository.save(p);
                })
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));
    }

    public boolean reduceStock(Long productId, Integer quantity) {
        Optional<Product> ex = productRepository.findById(productId);
        if (ex.isPresent()) {
            Product p = ex.get();
            if (p.getStock() != null && p.getStock() >= quantity) {
                p.setStock(p.getStock() - quantity);
                productRepository.save(p);
                return true;
            }
        }
        return false;
    }

    public Product addStock(Long productId, Integer quantity) {
        return productRepository.findById(productId)
                .map(p -> {
                    p.setStock((p.getStock() == null ? 0 : p.getStock()) + quantity);
                    return productRepository.save(p);
                })
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));
    }

    public List<Product> getLowStockProducts(Integer threshold) {
        return productRepository.findByStockLessThan(threshold);
    }

    public List<Product> getOutOfStockProducts() {
        return productRepository.findByStock(0);
    }

    // =========================
    // Helpers
    // =========================
    private Set<Tag> resolveTags(List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        for (String name : tagNames) {
            if (name == null || name.isBlank()) continue;
            Tag tag = tagRepository.findByName(name).orElseGet(() -> tagRepository.save(new Tag(name)));
            tags.add(tag);
        }
        return tags;
    }

    private void validateProductBasics(Product product) {
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than 0");
        }
        if (product.getStock() == null || product.getStock() < 0) {
            throw new IllegalArgumentException("Stock must be non-negative");
        }
    }

    private String randomizeFilename(String original) {
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        return UUID.randomUUID() + ext;
    }
}