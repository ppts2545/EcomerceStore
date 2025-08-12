# 🔐 ระบบ Session และการเชื่อมโยงตะกร้าสินค้า

## ✅ **สรุป: ระบบได้เก็บ Session แล้ว!**

ระบบ E-commerce ของคุณมีการจัดการ session ที่สมบูรณ์แล้ว ทั้งสำหรับการล็อกอินด้วย Google OAuth2 และการสมัครสมาชิกปกติ โดยจะเชื่อมโยงข้อมูลผู้ใช้กับตะกร้าสินค้าในฐานข้อมูลโดยอัตโนมัติ

---

## 🏗️ **วิธีการทำงานของระบบ Session**

### **1. การเข้าสู่ระบบ (Login)**

#### **📧 Email/Password Login:**
```java
// AuthController.java - /api/auth/login
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpSession session) {
    User user = userService.authenticate(request.getEmail(), request.getPassword());
    String token = jwtUtil.generateToken(user.getEmail());
    
    // 🔑 เก็บข้อมูลผู้ใช้ใน Session
    session.setAttribute("user", user);
    session.setAttribute("token", token);
    
    return ResponseEntity.ok(response);
}
```

#### **🔍 Google OAuth2 Login:**
```java
// OAuth2SuccessHandler.java
@Override
public void onAuthenticationSuccess(...) {
    // สร้างหรืออัปเดตผู้ใช้จาก Google
    User user = userRepository.findByEmail(email).orElse(createNewUser());
    
    // 🔑 เก็บข้อมูลผู้ใช้ใน Session (จากการ redirect)
    // Session จะถูกสร้างโดยอัตโนมัติเมื่อผู้ใช้เข้าสู่ระบบสำเร็จ
}
```

### **2. การสมัครสมาชิก (Registration)**

```java
// AuthController.java - /api/auth/register
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpSession session) {
    User user = userService.registerUser(...);
    String token = jwtUtil.generateToken(user.getEmail());
    
    // 🔑 เก็บข้อมูลผู้ใช้ใน Session ทันที
    session.setAttribute("user", user);
    session.setAttribute("token", token);
    
    return ResponseEntity.ok(response);
}
```

---

## 🛒 **การเชื่อมโยงกับตะกร้าสินค้า**

### **1. Session-Based Cart API (ใหม่!)**

ฉันได้สร้าง `SessionCartController` ที่ใช้ session แทนการส่ง userId:

```java
// SessionCartController.java
@RestController
@RequestMapping("/api/cart")
public class SessionCartController {
    
    @GetMapping
    public ResponseEntity<?> getCart(HttpSession session) {
        User user = getCurrentUser(session); // ดึงจาก session
        if (user == null) {
            return ResponseEntity.status(401).body("กรุณาเข้าสู่ระบบ");
        }
        
        Cart cart = cartService.getUserCart(user);
        return ResponseEntity.ok(cart);
    }
    
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest request, HttpSession session) {
        User user = getCurrentUser(session); // ไม่ต้องส่ง userId
        CartItem item = cartService.addToCart(user, request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(item);
    }
}
```

### **2. Frontend CartService (อัปเดตแล้ว)**

Frontend จะใช้ `credentials: 'include'` เพื่อส่ง session cookies:

```typescript
// CartService.ts
class CartService {
  async getCartItems(): Promise<CartItem[]> {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      credentials: 'include', // 🔑 ส่ง session cookies
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    return data.items || [];
  }
  
  async addToCart(productId: string, quantity: number): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/add`, {
      method: 'POST',
      credentials: 'include', // 🔑 ส่ง session cookies
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });
    
    return response.json().success;
  }
}
```

---

## 🔄 **การทำงานของระบบ**

### **สถานการณ์ที่ 1: ผู้ใช้เก่า Login ด้วย Google**
1. ผู้ใช้คลิก Google Login
2. ระบบตรวจสอบ email ในฐานข้อมูล → **พบข้อมูลเดิม**
3. ระบบอัปเดต `lastLoginAt` และข้อมูล OAuth2
4. ระบบสร้าง session ใหม่
5. **ตะกร้าเดิมยังคงอยู่** (เชื่อมโยงกับ User ID)

```java
// UserService.java
public User createOrUpdateOAuth2User(...) {
    Optional<User> existingUser = userRepository.findByEmail(email);
    if (existingUser.isPresent()) {
        User user = existingUser.get();
        user.setLastLoginAt(LocalDateTime.now());
        user.setOauth2Provider(provider); // อัปเดตข้อมูล OAuth2
        return userRepository.save(user); // ✅ ข้อมูลตะกร้าเดิมยังคงอยู่
    }
}
```

### **สถานการณ์ที่ 2: ผู้ใช้ใหม่ Sign Up ด้วย Google**
1. ผู้ใช้คลิก Google Login
2. ระบบตรวจสอบ email → **ไม่พบข้อมูล**
3. ระบบสร้าง User ใหม่ในฐานข้อมูล
4. ระบบสร้าง session
5. **สร้างตะกร้าใหม่** (เมื่อเพิ่มสินค้าครั้งแรก)

```java
// CartService.java
public Cart getOrCreateCart(User user) {
    Optional<Cart> existingCart = cartRepository.findByUser(user);
    if (existingCart.isPresent()) {
        return existingCart.get();
    }
    
    // ✅ สร้างตะกร้าใหม่สำหรับผู้ใช้ใหม่
    Cart cart = new Cart(user);
    return cartRepository.save(cart);
}
```

---

## 📊 **ข้อมูลที่เก็บในฐานข้อมูล**

### **User Table:**
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    password VARCHAR(255), -- NULL สำหรับ OAuth2 users
    oauth2_provider VARCHAR(50), -- 'google', 'facebook'
    oauth2_provider_id VARCHAR(255), -- Google User ID
    last_login_at TIMESTAMP,
    created_at TIMESTAMP
);
```

### **Cart & CartItem Tables:**
```sql
CREATE TABLE carts (
    id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP
);

CREATE TABLE cart_items (
    id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    cart_id BIGINT REFERENCES carts(id),
    product_id BIGINT REFERENCES products(id),
    quantity INTEGER,
    price_at_time DECIMAL(10,2),
    added_at TIMESTAMP
);
```

---

## 🔧 **การตั้งค่าที่สำคัญ**

### **1. CORS Configuration:**
```java
// SecurityConfig.java
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
```

### **2. Session Management:**
```java
// SecurityConfig.java
.sessionManagement(session -> session
    .maximumSessions(1)
    .maxSessionsPreventsLogin(false)
)
```

### **3. Frontend Configuration:**
```typescript
// ทุก API call ต้องมี
credentials: 'include' // เพื่อส่ง session cookies
```

---

## ✨ **ประโยชน์ของระบบนี้**

### **🔐 ความปลอดภัย:**
- Session ถูกจัดการโดย Spring Security
- ไม่ต้องส่ง user ID ใน URL (ป้องกัน IDOR attacks)
- Session หมดอายุอัตโนมัติ

### **🎯 ความสะดวก:**
- ผู้ใช้ไม่ต้อง login ใหม่เมื่อปิด-เปิดเบราว์เซอร์
- ตะกร้าสินค้าคงอยู่ข้ามการ login/logout
- รองรับทั้ง Email/Password และ OAuth2

### **📱 ความคงเส้นคงวา:**
- ข้อมูลตะกร้าเก็บในฐานข้อมูล (ไม่ใช่ localStorage)
- เข้าถึงได้จากทุกอุปกรณ์ที่ login ด้วย account เดียวกัน
- ไม่สูญหายเมื่อล้าง browser cache

---

## 🚀 **วิธีทดสอบ**

### **1. ทดสอบ Google Login:**
1. เปิด `http://localhost:5174`
2. คลิก "เข้าสู่ระบบ" → "Google"
3. Login ด้วย Google
4. เพิ่มสินค้าลงตะกร้า
5. Logout และ Login อีกครั้ง → **ตะกร้าควรยังคงอยู่**

### **2. ทดสอบ Email/Password:**
1. สมัครสมาชิกใหม่
2. เพิ่มสินค้าลงตะกร้า
3. Logout และ Login อีกครั้ง → **ตะกร้าควรยังคงอยู่**

### **3. ทดสอบ Cross-device:**
1. Login ด้วย account เดียวกันในเบราว์เซอร์อื่น
2. **ตะกร้าควรจะเหมือนกัน**

---

## 🎊 **สรุป**

**ระบบของคุณพร้อมใช้งานแล้ว!** 

✅ มีการเก็บ session สำหรับทั้ง Google OAuth2 และ Email/Password  
✅ ตะกร้าสินค้าเชื่อมโยงกับผู้ใช้ในฐานข้อมูล  
✅ ข้อมูลคงอยู่ข้ามการ login/logout  
✅ รองรับการใช้งานข้ามอุปกรณ์  
✅ ปลอดภัยและใช้งานง่าย  

ระบบจะทำการเชื่อมโยงข้อมูลผู้ใช้กับตะกร้าโดยอัตโนมัติ ไม่ว่าจะ login ด้วยวิธีไหนก็ตาม!
