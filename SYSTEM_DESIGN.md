# System Design Document: Tana Market

## 1. System Purpose and Design Goals

**Purpose:**
Tana Market is a comprehensive full-stack e-commerce platform designed to facilitate seamless online trading. It serves three distinct user groups: **Customers**, who browse and purchase products; **Managers**, who oversee product listings and order processing; and **Administrators**, who have full system control including user management.

**Design Goals:**

*   **Performance:**
    *   **Frontend:** Utilizes **React** with **Vite** to ensure ultra-fast load times and a responsive Single Page Application (SPA) experience.
    *   **Backend:** Built on **Node.js** and **Express**, providing an asynchronous, event-driven architecture capable of handling high concurrent requests efficiently.
    *   **Database:** Uses **MongoDB**, a NoSQL database, optimized for flexible data schemas and high-speed read/write operations for product catalogs and user sessions.

*   **Dependability:**
    *   **Reliability:** Implements standard JWT-based authentication to secure session states.
    *   **Transactional Integrity:** Critical flows like Order Creation and Payment Verification (via Chapa) use transactional logic (e.g., verifying stock before confirming orders) to ensure data consistency.
    *   **Error Handling:** centralized error handling in the backend ensures system stability even when individual requests fail.

*   **End User Experience:**
    *   **Responsiveness:** The UI is built with a mobile-first approach, ensuring functionality across desktops, tablets, and mobile devices.
    *   **Usability:** Distinct layouts for different roles (Admin Dashboard vs. Customer Storefront) provide tailored experiences that reduce cognitive load.
    *   **Feedback:** Real-time feedback via toast notifications and loading states keeps users informed of system status.

---

## 3.1 Architectural Design

### Subsystem Diagram

The system follows a typical **Client-Server architecture**.

```mermaid
graph TD
    Client[Client (Browser)] <-->|HTTP/REST| Server[Backend API (Node/Express)]
    Server <-->|Mongoose Driver| Database[(MongoDB)]
    Server <-->|Webhook/API| PaymentGW[Payment Gateway (Chapa)]
```

*   **Client Subsystem:** Handles presentation, user interaction, and state management.
*   **Server Subsystem:** Handles business logic, authentication, data validation, and database orchestration.
*   **Database Subsystem:** Persists all application data (Users, Products, Orders).
*   **External Payment Subsystem:** Manages financial transactions securely.

### 3.1.1 Component Modeling

The system is composed of highly decoupled modular components.

**Frontend Components (React):**
*   **Auth Module:** `LoginForm`, `RegisterForm`, `AuthContext`.
*   **Product Module:** `ProductList`, `ProductCard`, `ProductDetail`.
*   **Order Module:** `Cart`, `CheckoutForm`, `OrderHistory`.
*   **Navigation:** `Navbar`, `Sidebar` (for Admin/Manager).

**Backend Components (Express Modules):**
*   **Controllers:** Handle specific request logic (e.g., `productController`, `orderController`).
*   **Routes:** Map HTTP endpoints to controllers (`/api/products`, `/api/orders`).
*   **Middleware:** Cross-cutting concerns like `auth` (JWT verification) and `upload` (File handling).
*   **Services/Utils:** Helper logic like `notificationService` and `chapaPaymentService`.

### 3.1.2 Deployment Modeling

This diagram illustrates the physical deployment of artifacts on hardware nodes.

**Nodes:**
1.  **Client Node (User's Device):**
    *   Runs the **React SPA** (loaded via browser).
    *   Communicates via HTTPS.
2.  **App Server Node:**
    *   Host: Linux/Windows Server.
    *   Runtime: **Node.js**.
    *   Artifact: `server.js` (Express App).
    *   Environment Variables: `PORT`, `JWT_SECRET`.
3.  **Database Server Node:**
    *   Host: MongoDB Atlas (Cloud) or Dedicated Server.
    *   Software: **mongod** process.
    *   Data: Collections (Users, Products, etc.).

**Communication Links:**
*   Client -> App Server: HTTPS (JSON/REST).
*   App Server -> Database: TCP/IP (MongoDB Protocol).

---

## 3.2 Detail Design

### 3.2.1 Design Class Model

**Core Domain Classes:**

*   **User**
    *   Attributes: `name` (String), `email` (String), `password` (String), `role` (Enum: admin/manager/customer).
    *   Methods: `comparePassword()`.

*   **Product**
    *   Attributes: `name`, `description`, `price` (Number), `stock` (Number), `category`, `images` (Array), `isActive` (Boolean).
    *   Methods: `checkStock()`.

*   **Order**
    *   Attributes: `user` (User Ref), `items` (List[Product, Qty]), `total` (Number), `status` (Enum: pending/paid/shipped...), `trackingNumber`.
    *   Methods: `calculateTotal()`.

**Relationships:**
*   **1 User** has **0..* Orders**.
*   **1 Order** contains **1..* Products**.
*   **1 User** writes **0..* Comments**.

### 3.2.2 Persistent Model (MongoDB Schema)

Since we use MongoDB, the persistence model maps closely to the class model but defines physical storage properties.

**Collections:**

1.  **users**
    *   `_id`: ObjectId (PK)
    *   `email`: String (Unique Index)
    *   `role`: String
    *   `password`: String (Hashed)

2.  **products**
    *   `_id`: ObjectId (PK)
    *   `name`: String (Index)
    *   `price`: Number
    *   `stock`: Number
    *   `category`: String (Index)

3.  **orders**
    *   `_id`: ObjectId (PK)
    *   `user`: ObjectId (FK -> users)
    *   `items`: Array of Objects `{ product: ObjectId, quantity: Number }`
    *   `trackingNumber`: String (Unique Index)
    *   `status`: String

4.  **comments**
    *   `_id`: ObjectId (PK)
    *   `user`: ObjectId (FK -> users)
    *   `product`: ObjectId (FK -> products)
    *   `rating`: Number

---

## 3.3 User Interface Design

The User Interface is built using **React** with a component-based architecture.

**Layouts:**
*   **Customer Layout:** Features a public Navigation Bar (Logo, Search, Cart Icon, Login) and a Footer. Optimized for browsing.
*   **Dashboard Layout (Admin/Manager):** Features a Collapsible Sidebar (Dashboard, Products, Orders, Users) and a Top Bar for quick actions.

**Key Interface Screens:**

1.  **Home Page:**
    *   **Hero Section:** Promotional banners/sliders.
    *   **Featured Products:** Grid view of top products.
    *   **Footer:** Links and contact info.

2.  **Product Detail:**
    *   **Image Gallery:** Large product images.
    *   **Info Panel:** Title, Price, Description, "Add to Cart" button.
    *   **Reviews:** List of user comments and ratings.

3.  **Checkout:**
    *   **Cart Summary:** List of items and total.
    *   **Shipping Form:** Address inputs.
    *   **Payment Button:** "Pay with Chapa" action.

4.  **Admin Dashboard:**
    *   **Stats Cards:** Total Sales, Active Users, Pending Orders.
    *   **Data Tables:** Sortable/Filterable lists for managing Products and Users.

---

## 3.4 Access Control and Security

**Authentication:**
*   **Mechanism:** JSON Web Tokens (JWT).
*   **Flow:** User logs in credentials -> Server validates -> Returns JWT -> Client stores JWT (localStorage) -> Client sends JWT in `Authorization` header.

**Authorization (Role-Based Access Control):**

| Feature | Admin | Manager | Customer | Guest |
| :--- | :---: | :---: | :---: | :---: |
| **Browse Products** | ✅ | ✅ | ✅ | ✅ |
| **Search/Filter** | ✅ | ✅ | ✅ | ✅ |
| **Add to Cart** | ✅ | ✅ | ✅ | ✅ |
| **View Own Orders** | ✅ | ✅ | ✅ | ❌ |
| **Place Order** | ✅ | ✅ | ✅ | ❌ |
| **Rate/Review** | ❌ | ❌ | ✅ | ❌ |
| **Manage Products** (Add/Edit) | ✅ | ✅ | ❌ | ❌ |
| **Manage Orders** (Update Status) | ✅ | ✅ | ❌ | ❌ |
| **Manage Users** (Promote/Ban) | ✅ | ❌ | ❌ | ❌ |
| **View Analytics** | ✅ | ✅ | ❌ | ❌ |

**Security Measures:**
*   **Password Hashing:** Bcrypt is used to hash passwords before storage.
*   **Input Validation:** Middleware validates all incoming data to prevent injection attacks.
*   **CORS:** Configured to allow only trusted origins.
*   **Secure Headers:** Helmet (recommended) to set HTTP security headers.
