# 🔐 Session Long-Term Configuration

## 📝 **การตั้งค่า Session เพื่อเก็บนานขึ้น**

### 🎯 **เป้าหมาย**
- เก็บ Session นาน **7 วัน** แทนที่จะหมดอายุใน 30 นาที
- ไม่ต้องล็อกอินซ้ำบ่อยๆ เมื่อใช้งานตะกร้าสินค้าหรือฟีเจอร์อื่นๆ
- Session จะ refresh อัตโนมัติทุก 30 นาที

---

## ⚙️ **Backend Configuration**

### 1. **application.properties**
```properties
# Session Configuration - เก็บ Session นาน 7 วัน
server.servlet.session.timeout=7d
server.servlet.session.cookie.name=ECOMMERCE_SESSION
server.servlet.session.cookie.max-age=604800
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=false
server.servlet.session.cookie.same-site=lax
server.servlet.session.persistent=true
server.servlet.session.store-type=hash_map
```

### 2. **SecurityConfig.java**
```java
.sessionManagement(session -> session
    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
    .maximumSessions(5) // อนุญาตหลาย device
    .maxSessionsPreventsLogin(false)
    .and()
    .sessionFixation().migrateSession() // ป้องกัน session fixation
    .invalidSessionUrl("/api/auth/login?expired=true")
)
```

### 3. **AuthController.java - New Endpoints**
```java
// 💓 Keep Session Alive
@PostMapping("/keep-alive")
public ResponseEntity<?> keepSessionAlive(HttpSession session)

// 📊 Session Info
@GetMapping("/session-info") 
public ResponseEntity<?> getSessionInfo(HttpSession session)
```

---

## 🌐 **Frontend Configuration**

### 1. **AuthService.ts - Auto Keep-Alive**
```typescript
// 💓 Keep Session Alive - เรียกทุก 30 นาที
async keepSessionAlive(): Promise<boolean>

// 🔄 Auto Keep-Alive Setup 
startAutoKeepAliveWithControl(): void

// 🛑 Stop Auto Keep-Alive
stopAutoKeepAlive(): void
```

### 2. **App.tsx - Initialize Auto Keep-Alive**
```typescript
useEffect(() => {
  fetchProducts();
  loadCurrentUser();
  // เริ่มต้น Auto Keep-Alive สำหรับ Session
  AuthService.startAutoKeepAliveWithControl();
  
  return () => {
    AuthService.stopAutoKeepAlive();
  };
}, []);
```

---

## 🛡️ **Security Features**

| Feature | Description |
|---------|-------------|
| **HttpOnly Cookie** | ป้องกัน XSS attacks |
| **SameSite=Lax** | ป้องกัน CSRF attacks |
| **Session Fixation Protection** | Migrate session เมื่อล็อกอิน |
| **Maximum Sessions** | จำกัด 5 sessions ต่อ user |
| **Auto Keep-Alive** | Refresh session ทุก 30 นาที |

---

## ⏰ **Timeline**

| Event | Duration | Description |
|-------|----------|-------------|
| **Session Timeout** | 7 วัน | Session หมดอายุหลัง 7 วัน |
| **Cookie Max-Age** | 7 วัน (604800 วินาที) | Browser เก็บ cookie นาน 7 วัน |
| **Auto Keep-Alive** | ทุก 30 นาที | Frontend refresh session อัตโนมัติ |

---

## 🧪 **วิธีทดสอบ**

### 1. **ล็อกอิน**
```bash
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  -d '{"email": "test@example.com", "password": "test123"}'
```

### 2. **ดู Session Info**
```bash
curl -X GET http://localhost:8082/api/auth/session-info \
  --cookie cookies.txt
```

### 3. **Keep Session Alive**
```bash
curl -X POST http://localhost:8082/api/auth/keep-alive \
  --cookie cookies.txt
```

### 4. **ทดสอบ Cart**
```bash
curl -X GET http://localhost:8082/api/session-cart \
  --cookie cookies.txt
```

---

## 🔍 **Debug**

### Backend Logs
```java
System.out.println("🔍 Session Debug:");
System.out.println("  - Session ID: " + sessionId);
System.out.println("  - User in session: " + (user != null ? user.getEmail() : "null"));
```

### Frontend Console
```javascript
// ดู Session Info
const sessionInfo = await AuthService.getSessionInfo();
console.log('📊 Session Info:', sessionInfo);

// Keep Session Alive
const keepAlive = await AuthService.keepSessionAlive();
console.log('💓 Keep Alive Result:', keepAlive);
```

---

## ✅ **Expected Results**

1. **ล็อกอินครั้งเดียว** → ใช้งานได้ 7 วัน
2. **เพิ่มสินค้าในตะกร้า** → ไม่ต้องล็อกอินใหม่
3. **Auto Refresh** → Session จะ refresh ทุก 30 นาที
4. **Multiple Devices** → สามารถล็อกอินหลาย device ได้ (สูงสุด 5 sessions)

---

## 🚨 **Troubleshooting**

| Problem | Solution |
|---------|----------|
| Session หมดอายุเร็ว | ตรวจสอบ `server.servlet.session.timeout=7d` |
| Cookie ไม่ส่ง | ตรวจสอบ `credentials: 'include'` |
| CORS Error | ตรวจสอบ `allowCredentials=true` |
| Auto Keep-Alive ไม่ทำงาน | ตรวจสอบ `startAutoKeepAliveWithControl()` |

---

## 📅 **Last Updated**: August 6, 2025
