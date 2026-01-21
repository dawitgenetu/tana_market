## Introduction
This Requirement Analysis Document captures the functional and non-functional needs of Tana Market, a role-based e-commerce platform built with React (frontend) and Node/Express + MongoDB (backend). Requirements are derived strictly from the existing codebase, routes, and models.

## Existing System
- Lacks integrated role-aware workflows; typical small retailers rely on fragmented tools.
- Manual tracking of orders and payments leads to delayed updates and limited auditability.
- Limited customer feedback management and no unified notification system.

## Proposed System
- A unified web platform with RBAC (customer, manager, admin) supporting product catalog, cart, checkout, payments (Chapa), order lifecycle, delivery tracking, comments/reviews, notifications, and analytics dashboards.
- Enforces delivery constraints (1–3 minutes) and auto-removes pending orders cancelled by customers.

## Functional Requirements
- **FREQ-1 User Registration & Authentication**: Users register/login; passwords hashed (`User` model pre-save), JWT-based auth (`auth` routes/middleware).
- **FREQ-2 Role-Based Access Control**: Admin, manager, customer roles enforced in middleware and protected frontend routes.
- **FREQ-3 Product Management**: CRUD on products with name, description, price, discount, stock, category, images (`Product` model, `products` routes; admin/manager UIs).
- **FREQ-4 Cart & Checkout**: Customers manage cart and initiate checkout (frontend pages `Cart.jsx`, `Checkout.jsx`).
- **FREQ-5 Order Placement & Tracking**: Orders created from checkout (`orders` route), tracked by TANA tracking number; delivery time stored in `Order` model.
- **FREQ-6 Payment Processing**: Chapa integration for payment initialization and verification (`payments` route).
- **FREQ-7 Order Lifecycle Management**: Status transitions pending → paid → approved → shipped → delivered/cancelled; approvals/shipments via manager/admin routes; cancelled pending orders removed.
- **FREQ-8 Delivery Time Enforcement**: Estimated delivery time constrained to 1–3 minutes; stats surfaced to admin dashboard.
- **FREQ-9 Returns & Refunds**: Return requests and refunds managed in admin/manager routes; statuses tracked in `returnRequest`.
- **FREQ-10 Comments & Reviews**: Verified buyers submit ratings/comments; moderation (approve/reject/reply) by admin/manager (`comments` routes, `Comment` model with unique review per order).
- **FREQ-11 Notifications**: System notifications per user and type (`Notification` model, notifications routes/components).
- **FREQ-12 Activity Logging**: Log key actions with metadata (`ActivityLog` model; admin logs view).
- **FREQ-13 Analytics & Reports**: Admin/manager dashboards showing sales, orders, delivery stats, top products, category distribution (`admin.js` aggregation, frontend dashboards).
- **FREQ-14 User Management**: Admin manages users (create/delete/list; `users` routes, `AdminUsers` page).
- **FREQ-15 Security & Access**: JWT auth, password hashing, role checks, protected static uploads, and input validation via express-validator.

## Non-Functional Requirements
- **Performance**: Responsive SPA UI; REST API with pagination potential; delivery time stored efficiently.
- **Scalability**: Modular routes/models allow horizontal scaling of API and MongoDB; static frontend build supports CDN hosting.
- **Security**: JWT authentication, bcrypt hashing, RBAC, validation, and CORS configuration.
- **Usability**: Responsive layouts, toast feedback, dashboards with charts (Recharts) and cards.
- **Reliability**: MongoDB persistence, activity logs, notification history.
- **Maintainability**: Clear separation of concerns, typed enums in models, scripts for seeding/admin creation.
- **Portability**: Runs on Node.js; frontend built by Vite; environment-based configuration for MongoDB and payment keys.

## Use Case Descriptions (Selected)
- **UC-1: Customer places an order**: Customer authenticates → adds products to cart → proceeds to checkout → payment initialized/verified → order stored with status `paid` → tracking number assigned when paid → customer tracks order.
- **UC-2: Manager approves and ships order**: Manager views paid orders → approves (`/manager/orders/:id/approve`) → ships (`/manager/orders/:id/ship`) → status updates; notifications emitted.
- **UC-3: Admin monitors delivery performance**: Admin dashboard aggregates delivery stats (avg/min/max) from `Order.estimatedDeliveryTime`.
- **UC-4: Customer cancels pending order**: Customer invokes `/orders/:id/cancel`; backend deletes the pending order to remove data.
- **UC-5: Customer submits a review**: After delivery, customer posts rating/comment tied to order/product; uniqueness enforced per user/product/order; admin/manager may approve/reject or reply.
- **UC-6: Admin manages users**: Admin creates/deletes users; role assignments enforced by middleware and UI.

## Business Rules
- One review per user per product per order (unique index in `Comment`).
- Order statuses restricted to defined enum; only pending orders can be cancelled by customer; approved/shipped/delivered handled by manager/admin.
- Delivery time must be between 1 and 3 minutes; defaults to 1 minute; no manual admin override in UI.
- Tracking number generated for paid orders following `TANA-YYYYMMDD-XXXX`.
- Return/refund flows only for paid/approved/shipped/delivered orders; refunds may set status to cancelled before shipping proceeds.

## System Requirements
- **Hardware**: Commodity server capable of running Node.js and MongoDB; recommended 2+ CPU cores, 4GB+ RAM for test/development; scalable in production.
- **Software**:
  - Node.js (for Express API and build tooling)
  - MongoDB (database)
  - npm (package manager)
  - Vite/React build chain (frontend)
  - Environment variables for `MONGODB_URI`, JWT secret, Chapa keys.

## UML Descriptions (Textual)
- **Use Case View**: Actors—Customer, Manager, Admin. Core use cases—browse products, manage cart, checkout, pay, track order, approve/ship orders, manage products, moderate comments, view analytics, manage users.
- **Logical View (Classes/Entities)**: `User` (role, credentials), `Product` (pricing, stock, category, images, rating), `Order` (items, totals, status, tracking, delivery time, returnRequest), `Comment` (rating, status, reply), `Notification` (type, read flag, metadata), `ActivityLog` (action, metadata).
- **Process View**: Request/response over REST; async payment verification webhook; background creation of tracking numbers in `Order` pre-save.
- **Deployment View**: Browser SPA → Vite-built assets; API on Node/Express; MongoDB instance; static uploads served from backend `/uploads`.
