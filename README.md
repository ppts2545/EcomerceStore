# ShoppeeClone - E-commerce Store

A full-stack e-commerce application inspired by Shopee, built with Spring Boot backend and modern frontend framework.

## 🏗️ Project Structure

```
E-commerceStore.WebApp/
├── .vscode/                    # VS Code workspace settings
├── backend/                    # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/example/E_commerceStore/WebApp/
│   │   │   │       ├── Application.java
│   │   │   │       ├── controller/
│   │   │   │       └── model/
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── templates/
│   │   └── test/
│   ├── pom.xml
│   └── target/
├── frontend/                   # React/Vue/Angular frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── workspace.code-workspace    # VS Code multi-folder workspace
```

## 🚀 Getting Started

### Prerequisites
- Java 24 or higher
- Maven 3.6+
- Node.js 18+
- VS Code

### 1. Open the Workspace
Open `workspace.code-workspace` in VS Code for the best development experience.

### 2. Backend Setup
```bash
cd backend
mvn spring-boot:run
```
Backend will be available at `http://localhost:8080`

### 3. Frontend Setup (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at `http://localhost:5173`

## 🛠️ Available VS Code Tasks

- **Spring Boot: Run Backend** - Start the Spring Boot application
- **Frontend: Start Dev Server** - Start the frontend development server
- **Full Stack: Start Both** - Start both backend and frontend together
- **Spring Boot: Clean Backend** - Clean Maven build
- **Frontend: Install Dependencies** - Install npm dependencies

Access tasks via: `Ctrl+Shift+P` → "Tasks: Run Task"

## 📱 Features

### Backend (Spring Boot)
- ✅ REST API endpoints for products
- ✅ Thymeleaf templates (can be removed when using separate frontend)
- ✅ Product model and controllers
- ✅ Cross-origin resource sharing (CORS) enabled

### Frontend (Vite + React + TypeScript)
- ✅ Modern Vite build tool
- ✅ React with TypeScript
- ✅ Fast HMR (Hot Module Replacement)
- 🔄 Shopee-inspired design (to be implemented)
- 🔄 Product catalog
- 🔄 Shopping cart functionality
- 🔄 User authentication

## 🔗 API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/search?name={keyword}` - Search products
- `GET /` - Home page (current Shopee-style page)
- `GET /about` - About page
- `GET /contact` - Contact page

## 🎨 Current Demo

Visit `http://localhost:8080` to see the current Shopee-style demo page built with Thymeleaf.

## 📝 Next Steps

1. Choose and set up a frontend framework in the `frontend/` folder
2. Connect frontend to backend APIs
3. Add user authentication
4. Implement shopping cart
5. Add payment integration
6. Deploy to cloud platform

## 🤝 Contributing

This is a learning project. Feel free to experiment and add features!

## 📄 License

Educational use only.
