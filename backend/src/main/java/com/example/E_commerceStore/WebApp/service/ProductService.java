package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.model.MediaItem;
import com.example.E_commerceStore.WebApp.repository.ProductRepository;
import com.example.E_commerceStore.WebApp.repository.TagRepository;
import com.example.E_commerceStore.WebApp.model.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductService {
    // ...existing code...

    // เพิ่มสินค้าใหม่พร้อมอัปโหลดไฟล์รูปภาพหลักและ media หลายไฟล์
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
        String uploadDir = "uploads/";
        Files.createDirectories(Paths.get(uploadDir));

        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stock);

        // set tags จาก tagNames (ถ้ามี)
        if (tagNames != null && !tagNames.isEmpty()) {
            Set<Tag> productTags = new java.util.HashSet<>();
            for (String tagName : tagNames) {
                Tag tag = tagRepository.findByName(tagName).orElse(null);
                if (tag == null) {
                    tag = new Tag(tagName);
                    tag = tagRepository.save(tag);
                }
                productTags.add(tag);
            }
            product.setTags(productTags);
        }

        List<MediaItem> mediaItemList = new java.util.ArrayList<>();

        // Main image (imageFile)
        if (imageFile != null && !imageFile.isEmpty()) {
            String originalFilename = imageFile.getOriginalFilename();
            String ext = originalFilename != null && originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf('.')) : "";
            String filename = UUID.randomUUID().toString() + ext;
            Path filePath = Paths.get(uploadDir, filename);
            Files.copy(imageFile.getInputStream(), filePath);

            MediaItem mainMedia = new MediaItem();
            mainMedia.setType("image");
            mainMedia.setUrl("/uploads/" + filename);
            mainMedia.setDisplayOrder(0);
            mainMedia.setProduct(product);
            mediaItemList.add(mainMedia);
        }

        // Additional media files
        if (mediaFiles != null && mediaFiles.size() > 0) {
            for (int i = 0; i < mediaFiles.size(); i++) {
                MultipartFile file = mediaFiles.get(i);
                if (file == null || file.isEmpty()) continue;
                String originalFilename = file.getOriginalFilename();
                String ext = originalFilename != null && originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf('.')) : "";
                String filename = UUID.randomUUID().toString() + ext;
                Path filePath = Paths.get(uploadDir, filename);
                Files.copy(file.getInputStream(), filePath);

                MediaItem media = new MediaItem();
                // type, alt, displayOrder จาก meta
                String type = (mediaTypes != null && i < mediaTypes.size()) ? mediaTypes.get(i) : "image";
                String alt = (mediaAlts != null && i < mediaAlts.size()) ? mediaAlts.get(i) : null;
                int displayOrder = 1 + i; // 0 = main image
                if (mediaDisplayOrders != null && i < mediaDisplayOrders.size()) {
                    try { displayOrder = Integer.parseInt(mediaDisplayOrders.get(i)); } catch (Exception ignore) {}
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
        return productRepository.save(product);
    }


    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TagRepository tagRepository;

    // เพิ่มสินค้าใหม่พร้อมอัปโหลดไฟล์รูปภาพ
    public Product saveProductWithImage(String name, String description, BigDecimal price, Integer stock, List<String> tagNames, MultipartFile imageFile) throws Exception {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }
        String uploadDir = "uploads/";
        Files.createDirectories(Paths.get(uploadDir));
        String originalFilename = imageFile.getOriginalFilename();
        String ext = originalFilename != null && originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf('.')) : "";
        String filename = UUID.randomUUID().toString() + ext;
        Path filePath = Paths.get(uploadDir, filename);
        Files.copy(imageFile.getInputStream(), filePath);


        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stock);

        // set tags จาก tagNames (ถ้ามี)
        if (tagNames != null && !tagNames.isEmpty()) {
            Set<Tag> productTags = new java.util.HashSet<>();
            for (String tagName : tagNames) {
                Tag tag = tagRepository.findByName(tagName).orElse(null);
                if (tag == null) {
                    tag = new Tag(tagName);
                    tag = tagRepository.save(tag);
                }
                productTags.add(tag);
            }
            product.setTags(productTags);
        }

        MediaItem media = new MediaItem();
        media.setType("image");
        media.setUrl("/uploads/" + filename);
        media.setDisplayOrder(0);
        media.setProduct(product);

        product.setMediaItems(List.of(media));

        return productRepository.save(product);
    }

    public List<Product> getProductsByTags(List<String> tagNames) {
        return productRepository.findByTagsNameIn(tagNames);
    }

    public List<Product> getProductsByStore(com.example.E_commerceStore.WebApp.model.Store store) {
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

    public Product saveProduct(Product product) {
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than 0");
        }
        if (product.getStock() == null || product.getStock() < 0) {
            throw new IllegalArgumentException("Stock must be non-negative");
        }

        // Ensure all tags are persisted before assigning to product
        if (product.getTags() != null && !product.getTags().isEmpty()) {
            Set<Tag> managedTags = new java.util.HashSet<>();
            for (Tag tag : product.getTags()) {
                Tag managedTag = tagRepository.findByName(tag.getName()).orElse(null);
                if (managedTag == null) {
                    managedTag = new Tag(tag.getName());
                    managedTag = tagRepository.save(managedTag);
                }
                managedTags.add(managedTag);
            }
            product.setTags(managedTags);
        }

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            if (productDetails.getName() != null) {
                product.setName(productDetails.getName());
            }
            if (productDetails.getDescription() != null) {
                product.setDescription(productDetails.getDescription());
            }
            if (productDetails.getPrice() != null) {
                product.setPrice(productDetails.getPrice());
            }
            // imageUrl removed, handled by MediaItem
            if (productDetails.getStock() != null) {
                product.setStock(productDetails.getStock());
            }
            return productRepository.save(product);
        }
        return null;
    }

    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }

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

    public boolean isProductInStock(Long productId) {
        Optional<Product> product = productRepository.findById(productId);
        return product.isPresent() && product.get().getStock() > 0;
    }

    public Integer getProductStock(Long productId) {
        Optional<Product> product = productRepository.findById(productId);
        return product.map(Product::getStock).orElse(0);
    }

    public Product updateStock(Long productId, Integer newStock) {
        Optional<Product> existingProduct = productRepository.findById(productId);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            product.setStock(newStock);
            return productRepository.save(product);
        }
        throw new IllegalArgumentException("Product not found with id: " + productId);
    }

    public boolean reduceStock(Long productId, Integer quantity) {
        Optional<Product> existingProduct = productRepository.findById(productId);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            if (product.getStock() >= quantity) {
                product.setStock(product.getStock() - quantity);
                productRepository.save(product);
                return true;
            }
        }
        return false;
    }

    public Product addStock(Long productId, Integer quantity) {
        Optional<Product> existingProduct = productRepository.findById(productId);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            product.setStock(product.getStock() + quantity);
            return productRepository.save(product);
        }
        throw new IllegalArgumentException("Product not found with id: " + productId);
    }

    public List<Product> getLowStockProducts(Integer threshold) {
        return productRepository.findByStockLessThan(threshold);
    }

    public List<Product> getOutOfStockProducts() {
        return productRepository.findByStock(0);
    }
}