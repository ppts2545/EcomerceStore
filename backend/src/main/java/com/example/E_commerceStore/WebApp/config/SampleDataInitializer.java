package com.example.E_commerceStore.WebApp.config;

import com.example.E_commerceStore.WebApp.model.Product;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.model.UserRole;
import com.example.E_commerceStore.WebApp.model.MediaItem;
import com.example.E_commerceStore.WebApp.model.Comment;
import com.example.E_commerceStore.WebApp.repository.ProductRepository;
import com.example.E_commerceStore.WebApp.repository.UserRepository;
import com.example.E_commerceStore.WebApp.repository.MediaItemRepository;
import com.example.E_commerceStore.WebApp.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class SampleDataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MediaItemRepository mediaItemRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // สร้างข้อมูลผู้ใช้ตัวอย่าง
        createSampleUsers();
        
        // สร้างข้อมูลสินค้าตัวอย่าง
        createSampleProducts();
        
        // สร้างข้อมูลรีวิวตัวอย่าง
        createSampleReviews();
        
        System.out.println("🎉 Sample data initialized successfully!");
    }

    private void createSampleUsers() {
        if (userRepository.count() == 0) {
            // สร้าง Admin user
            User admin = new User();
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRole(UserRole.ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);

            // สร้าง Customer user
            User customer = new User();
            customer.setEmail("customer@example.com");
            customer.setPassword(passwordEncoder.encode("customer123"));
            customer.setFirstName("John");
            customer.setLastName("Doe");
            customer.setRole(UserRole.CUSTOMER);
            customer.setCreatedAt(LocalDateTime.now());
            userRepository.save(customer);

            System.out.println("✅ Sample users created:");
            System.out.println("   - Admin: admin@example.com / admin123");
            System.out.println("   - Customer: customer@example.com / customer123");
        }
    }

    private void createSampleProducts() {
        // ⚠️ ไม่ลบข้อมูลเก่า เพื่อเก็บ cart items ของผู้ใช้
        // เช็คว่ามีข้อมูลตัวอย่างแล้วหรือไม่
        if (productRepository.count() >= 10) {
            System.out.println("✅ Sample products already exist, skipping creation...");
            return;
        }
        
        System.out.println("🆕 Creating sample products without deleting existing data...");
        
        // สินค้าหมวดอิเล็กทรอนิกส์ พร้อม Media Slider
            Product macbook = createProduct("MacBook Air M2", "13-inch laptop with M2 chip, 8GB RAM, 256GB SSD, all-day battery", 
                         new BigDecimal("1099.99"), 10);
            // เพิ่ม media items สำหรับ MacBook
            addMediaToProduct(macbook, "image", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop", null, "MacBook Air - Front View", 0);
            addMediaToProduct(macbook, "image", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop", null, "MacBook Air - Keyboard", 1);
            addMediaToProduct(macbook, "video", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=150&h=150&fit=crop", "MacBook Air Demo Video", 2);
            
            Product iphone = createProduct("iPhone 15 Pro", "Latest iPhone with titanium design, A17 Pro chip, and advanced camera system", 
                         new BigDecimal("999.99"), 15);
            // เพิ่ม media items สำหรับ iPhone
            addMediaToProduct(iphone, "image", "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=300&fit=crop", null, "iPhone - Different Colors", 0);
            addMediaToProduct(iphone, "image", "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop", null, "iPhone - Camera Close-up", 1);
            
            Product samsung = createProduct("Samsung Galaxy S24", "Flagship Android phone with advanced AI features and stunning display", 
                         new BigDecimal("799.99"), 12);
            
            // สินค้าหมวดแฟชั่น
            Product tshirt = createProduct("Premium Cotton T-Shirt", "100% organic cotton, comfortable fit, available in multiple colors", 
                         new BigDecimal("29.99"), 50);
            // เพิ่ม media items สำหรับ T-Shirt
            addMediaToProduct(tshirt, "image", "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=300&fit=crop", null, "T-Shirt - White", 0);
            addMediaToProduct(tshirt, "image", "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=300&fit=crop", null, "T-Shirt - Black", 1);
            addMediaToProduct(tshirt, "image", "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=300&fit=crop", null, "T-Shirt - Colors", 2);
            
            createProduct("Designer Jeans", "Premium denim with perfect fit and modern styling", 
                         new BigDecimal("89.99"), 30);

            // สินค้าหมวดความงาม
            createProduct("Luxury Face Cream", "Anti-aging moisturizer with natural ingredients", 
                         new BigDecimal("45.99"), 25);
            
            createProduct("Matte Lipstick Set", "Long-lasting matte finish in 6 beautiful shades", 
                         new BigDecimal("32.99"), 40);

            // สินค้าหมวดของใช้ในบ้าน
            createProduct("Smart Rice Cooker", "1.8L capacity with multiple cooking modes", 
                         new BigDecimal("189.99"), 12);
            
            Product blender = createProduct("High-Speed Blender", "1500W motor, perfect for smoothies and food prep", 
                         new BigDecimal("249.99"), 8);
            // เพิ่ม media items สำหรับ Blender
            addMediaToProduct(blender, "image", "https://images.unsplash.com/photo-1610736020395-fd7b6a3b6bb2?w=400&h=300&fit=crop", null, "Blender - In Use", 0);
            addMediaToProduct(blender, "video", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=150&h=150&fit=crop", "Blender Demo", 1);

            // สินค้าหมวดหนังสือ
            createProduct("JavaScript Programming Guide", "Complete guide to modern JavaScript development", 
                         new BigDecimal("59.99"), 20);

            System.out.println("✅ Sample products created: 10 products with media slider support");
    }

    private void addMediaToProduct(Product product, String type, String url, String thumbnail, String alt, Integer displayOrder) {
        MediaItem mediaItem = new MediaItem();
        mediaItem.setType(type);
        mediaItem.setUrl(url);
        mediaItem.setThumbnail(thumbnail);
        mediaItem.setAlt(alt);
        mediaItem.setDisplayOrder(displayOrder);
        mediaItem.setProduct(product);
        MediaItem saved = mediaItemRepository.save(mediaItem);
        System.out.println("✅ MediaItem saved: " + saved.getType() + " - " + saved.getUrl() + " for product: " + product.getName());
    }

    private Product createProduct(String name, String description, BigDecimal price, 
                              Integer stock) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stock);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    private void createSampleReviews() {
        // สร้างรีวิวเฉพาะเมื่อยังไม่มีรีวิวในระบบ
        if (commentRepository.count() > 0) {
            System.out.println("✅ Sample reviews already exist, skipping creation...");
            return;
        }

        System.out.println("🆕 Creating sample reviews...");

        // สร้างผู้ใช้เพิ่มเติมสำหรับรีวิว
        createSampleReviewUsers();

        // ดึงผู้ใช้และสินค้าที่มีอยู่
        User admin = userRepository.findByEmail("admin@example.com").orElse(null);
        User customer = userRepository.findByEmail("customer@example.com").orElse(null);
        User reviewer1 = userRepository.findByEmail("reviewer1@example.com").orElse(null);
        User reviewer2 = userRepository.findByEmail("reviewer2@example.com").orElse(null);
        User reviewer3 = userRepository.findByEmail("reviewer3@example.com").orElse(null);

        // ดึงสินค้าทั้งหมด
        var products = productRepository.findAll();
        
        if (products.size() >= 2 && admin != null && customer != null && reviewer1 != null) {
            Product firstProduct = products.get(0); // MacBook หรือสินค้าแรก
            Product secondProduct = products.get(1); // iPhone หรือสินค้าที่สอง

            // รีวิวสำหรับสินค้าแรก
            createReview(reviewer1, firstProduct, "สินค้าดีมาก คุณภาพเยี่ยม ส่งเร็วมากค่ะ แนะนำเลย! ใช้งานง่าย performance ดีจริง", 5, 7);
            createReview(customer, firstProduct, "ผ้านิ่มสบาย ใส่แล้วสวย ราคาสมเหตุสมผล คุ้มค่าเงินมาก สั่งซื้อครั้งที่ 2 แล้ว", 4, 5);
            createReview(reviewer2, firstProduct, "ดีค่ะ แต่สีจริงอาจจะต่างจากรูปนิดหน่อย โดยรวมโอเคครับ บริการดี", 4, 3);

            // รีวิวสำหรับสินค้าที่สอง
            createReview(reviewer3, secondProduct, "กระเป๋าสวยมาก หนังดูดี ช่องเยอะ ใส่ของได้เยอะค่ะ ถูกใจจริงๆ คุณภาพเกินราคา", 5, 6);
            createReview(admin, secondProduct, "คุณภาพโอเค แต่อยากให้สายยาวกว่านี้นิดหน่อยค่ะ ถ้าปรับปรุงตรงนี้จะดีมาก", 3, 4);
            
            // รีวิวเพิ่มเติมสำหรับสินค้าที่ 3 ถ้ามี
            if (products.size() >= 3) {
                Product thirdProduct = products.get(2);
                createReview(reviewer1, thirdProduct, "ใช้ได้ดี ราคาไม่แพง คุ้มค่า แพ็กเกจมาดี ไม่เสียหาย", 4, 2);
                createReview(reviewer2, thirdProduct, "สินค้าตรงตามที่โฆษณา จัดส่งรวดเร็ว ประทับใจ", 5, 1);
            }

            System.out.println("✅ Sample reviews created successfully!");
        } else {
            System.out.println("⚠️  Cannot create reviews: Missing products or users");
        }
    }

    private void createSampleReviewUsers() {
        // สร้างผู้ใช้เพิ่มเติมสำหรับรีวิว
        createReviewUserIfNotExists("reviewer1@example.com", "สมชาย", "ใจดี");
        createReviewUserIfNotExists("reviewer2@example.com", "สมหญิง", "รักสวย");  
        createReviewUserIfNotExists("reviewer3@example.com", "วิชัย", "สุขใส");
    }

    private void createReviewUserIfNotExists(String email, String firstName, String lastName) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode("password123"));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(UserRole.CUSTOMER);
            user.setCreatedAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    private void createReview(User user, Product product, String content, int rating, int daysAgo) {
        Comment comment = new Comment(user, product, content, rating);
        comment.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        commentRepository.save(comment);
    }
}
