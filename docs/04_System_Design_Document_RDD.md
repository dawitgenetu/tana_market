## Architectural Design
- **Architecture Style**: Three-tier SPA + REST API + Document Database.
- **Frontend**: React 18 (Vite), Tailwind/Bootstrap, React Router, Zustand stores.
- **Backend**: Node.js/Express with modular routers, JWT auth, role authorization, Mongoose ODM.
- **Database**: MongoDB collections for users, products, orders, comments, notifications, activity logs.
- **Integration**: Chapa payment gateway; static assets served by backend `/uploads`.

### High-Level Diagram (ASCII)
```
[Browser SPA]
    |
    | HTTPS (Axios via utils/api.js)
    v
[Express API] -- JWT/RBAC --> [Mongoose Models] --> [MongoDB]
    |
    +--> [/uploads] static images
    +--> [Chapa Payment Verification Webhook]
```

## Component Design
- **Routing Layer**: `routes/*.js` modules for auth, products, orders, payments, users, comments, notifications, admin, manager. Each encapsulates validation and business rules per domain.
- **Middleware**: `middleware/auth.js` for authentication and authorization.
- **Models**: Mongoose schemas for core entities (`User`, `Product`, `Order`, `Comment`, `Notification`, `ActivityLog`), capturing constraints (e.g., delivery time min/max, status enums, unique indexes).
- **Utils**: `utils/notifications.js` for emitting notifications; supporting scripts for seeding and tracking index recreation.
- **Frontend Layouts**: Role-based layouts (`AdminLayout`, `ManagerLayout`, `CustomerLayout`, `AuthLayout`) hosting navigation shells.
- **Frontend Pages**: Feature pages per role (catalog, cart, checkout, orders, dashboards, comments, returns, reports, logs).
- **State Stores**: `authStore.js`, `cartStore.js`, `notificationStore.js` using Zustand.

## Deployment Design
- **Environments**: Node/Express server with env-driven `MONGODB_URI` and payment secrets; Vite build outputs static assets (`frontend/dist`).
- **Serving**: Backend listens on configurable port (default 5001); exposes REST under `/api/*`; serves `/uploads` for product images.
- **External**: Chapa webhook endpoint `/api/payments/verify` uses raw JSON body.

## Class / Data Model Design
- **User**: `{ name, email (unique), password (hashed), phone, address, role ∈ {customer, manager, admin}, isActive, timestamps }`.
- **Product**: `{ name, description, price, discount, stock, category, images[], rating, reviewCount, isActive, timestamps }`.
- **Order**: `{ user, items[{product, quantity, price}], shippingAddress{address,city,phone,notes}, status ∈ {pending, paid, approved, shipped, delivered, cancelled}, total, trackingNumber, paymentReference, estimatedDeliveryTime (min=1, max=3, default=1), deliveryTimeSetBy, deliveryTimeSetAt, returnRequest{status, reason, timestamps, refund info}, timestamps }`.
- **Comment**: `{ user, product, order, rating 1–5, comment, status ∈ {pending, approved, rejected}, reply, repliedBy, timestamps }` with unique index on (user, product, order).
- **Notification**: `{ user, type enum, title, message, link, read, metadata, timestamps }` with indexes for user/read and createdAt.
- **ActivityLog**: `{ user, action, description, metadata, timestamps }`.

## Database / Persistent Model
- MongoDB collections per model; indexes:
  - `Comment` unique compound index (user, product, order).
  - `Notification` indexes on user/read/createdAt.
  - `Order` trackingNumber unique partial index.
- Uploaded product images stored in filesystem under `backend/uploads/products` with filenames generated via Multer.

## User Interface Design
- **Navigation**: Role-specific sidebars/headers (AdminHeader/Sidebar, ManagerHeader/Sidebar, Navbar for customers).
- **Dashboards**: Cards and charts (Recharts) for sales, orders, delivery stats.
- **Forms**: Login/Register, product forms, checkout, comment submission, returns.
- **Feedback**: Toast notifications (react-hot-toast), badges for status, modals for confirmations (some removed for delivery time editing).
- **Responsiveness**: Tailwind utility classes and layout grids; mobile-first design.

## Security & Access Control
- JWT authentication with protected routes on API (`authenticate`) and role checks (`authorize`).
- Password hashing via bcrypt pre-save hook on `User`.
- Input validation using express-validator in routes (e.g., auth, products).
- CORS middleware configured; uploads served from controlled path.
- Role-based UI guarding via `ProtectedRoute` in `App.jsx`.
