package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.dto.MediaItemDto;
import com.example.E_commerceStore.WebApp.dto.ProductDto;
import com.example.E_commerceStore.WebApp.dto.TagDto;
import com.example.E_commerceStore.WebApp.model.MediaItem;
import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.model.Store;
import com.example.E_commerceStore.WebApp.model.Tag;
import com.example.E_commerceStore.WebApp.repository.ProductRepository;
import com.example.E_commerceStore.WebApp.repository.StoreRepository;
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
    private final StoreRepository storeRepository;
    private final TagRepository tagRepository;

    public ProductService(ProductRepository productRepository,
                          StoreRepository storeRepository,
                          TagRepository tagRepository) {
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
        this.tagRepository = tagRepository;
    }

    // -------- READ (DTO) --------
    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll()
                .stream().map(this::toProductDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<ProductDto> getProductById(Long id) {
        return productRepository.findById(id).map(this::toProductDto);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getProductsByStoreId(Long storeId) {
        return productRepository.findByStore_Id(storeId)
                .stream().map(this::toProductDto).toList();
    }

    private ProductDto toProductDto(Product p) {
        Store store = p.getStore();
        Long storeId = (store != null ? store.getId() : null);
        String storeName = (store != null ? store.getName() : null);

        var mediaDtos = (p.getMediaItems() == null) ? List.<MediaItemDto>of()
                : p.getMediaItems().stream()
                    .map(m -> new MediaItemDto(
                            m.getId(), m.getType(), m.getUrl(),
                            m.getThumbnail(), m.getAlt(), m.getDisplayOrder()))
                    .toList();

        var tagDtos = (p.getTags() == null) ? List.<TagDto>of()
                : p.getTags().stream()
                    .map(t -> new TagDto(t.getId(), t.getName()))
                    .toList();

        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getStock(),
                storeId,
                storeName,
                mediaDtos,
                tagDtos
        );
    }

    // -------- WRITE (Entity) --------
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product product) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setPrice(product.getPrice());
        existing.setStock(product.getStock());
        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // multipart (แบบมี storeId)
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
            List<String> mediaDisplayOrders,
            Long storeId
    ) throws Exception {

        // เตรียมโฟลเดอร์อัปโหลด
        final String uploadDir = "uploads/";
        Files.createDirectories(Paths.get(uploadDir));

        // สร้าง Product
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stock != null ? stock : 0);

        // ผูก Store
        if (storeId != null) {
            Store store = storeRepository.findById(storeId)
                    .orElseThrow(() -> new IllegalArgumentException("Store not found: " + storeId));
            product.setStore(store);
        }

        // Tags
        if (tagNames != null && !tagNames.isEmpty()) {
            product.setTags(resolveTags(tagNames));
        }

        List<MediaItem> mediaItemList = new ArrayList<>();

        // รูปหลัก
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

        // สื่อเพิ่มเติม
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

        // ต้องแน่ใจว่า mapping Product<->MediaItem เป็น Cascade.ALL แล้ว (จากโมเดลคุณเป็นอยู่)
        return productRepository.save(product);
    }

    // ---------- Helpers ----------
    private Set<Tag> resolveTags(List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        for (String name : tagNames) {
            if (name == null || name.isBlank()) continue;
            Tag tag = tagRepository.findByName(name).orElseGet(() -> tagRepository.save(new Tag(name)));
            tags.add(tag);
        }
        return tags;
    }

    private String randomizeFilename(String original) {
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        return UUID.randomUUID() + ext;
    }
}