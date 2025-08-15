# Local HTTPS Setup for Spring Boot and Vite (Frontend)

To ensure cookies work cross-origin with SameSite=None, you must use HTTPS for both backend and frontend. Here’s how to set up HTTPS for local development:

---

## 1. Generate a Self-Signed Certificate

You can use Java’s `keytool` to generate a certificate for Spring Boot:

```sh
keytool -genkeypair -alias devcert -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore keystore.p12 -validity 3650 -storepass password -dname "CN=localhost"
```
- This creates `keystore.p12` in your current directory with password `password`.

---

## 2. Configure Spring Boot for HTTPS

Add these properties to your `backend/src/main/resources/application.properties` (or `application-dev.properties`):

```
server.port=8443
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=password
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=devcert
```
- Move `keystore.p12` to `backend/src/main/resources/`.

---

## 3. Start Spring Boot Backend

Run your backend as usual. It will now be available at `https://localhost:8443`.

---

## 4. Configure Vite Frontend for HTTPS

Install mkcert (if not already):
```sh
brew install mkcert
mkcert -install
mkcert localhost
```
- This creates `localhost.pem` and `localhost-key.pem`.

Edit your `vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem'),
    },
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

---

## 5. Restart Both Servers
- Start backend: `mvn spring-boot:run`
- Start frontend: `npm run dev`
- Access your app at `https://localhost:5173`

---

## 6. Accept Self-Signed Certificates
- The first time you visit, your browser will warn about the self-signed certificate. Accept the risk for local development.

---

## 7. Test Login and Orders
- Log in via the frontend.
- Check DevTools > Application > Cookies for `JSESSIONID` under `https://localhost:8443`.
- Your order history should now work.

---

If you want this automated, let me know and I can add scripts to your project.
