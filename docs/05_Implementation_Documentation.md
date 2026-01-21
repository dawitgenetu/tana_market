## Technology Stack
- **Frontend**: React 18, Vite, React Router, Zustand, Tailwind CSS, Bootstrap utilities, Recharts, Framer Motion, Lucide Icons, react-hot-toast.
- **Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs, express-validator, multer, CORS, dotenv, axios (for service calls), Chapa payment integration.
- **Database**: MongoDB.

## Folder Structure (High-Level)
- `/frontend`: React application (layouts, pages for admin/manager/customer, components, stores, utils, assets).
- `/backend`: Express API (routes, models, middleware, utils, scripts, uploads).
- `/docs`: Project documentation (this SDLC set).
- Root `package.json`: orchestration scripts (`dev`, `dev:frontend`, `dev:backend`, `build`, `install:all`).

## Key Modules / Components
- **Backend Routes**:
  - `auth.js`: authentication, JWT issuance.
  - `products.js`: product CRUD with image upload.
  - `orders.js`: customer orders, cancellation (delete pending), tracking lookup.
  - `payments.js`: Chapa payment init/verify, webhook handler.
  - `users.js`: user management (admin).
  - `comments.js`: review submission and moderation.
  - `notifications.js`: CRUD for notifications.
  - `admin.js`: admin analytics, reports, returns, comments, orders.
  - `manager.js`: manager dashboards, approvals, shipping, returns.
- **Backend Models**:
  - `User`, `Product`, `Order`, `Comment`, `Notification`, `ActivityLog`.
- **Frontend Layouts**: `AuthLayout`, `CustomerLayout`, `ManagerLayout`, `AdminLayout`.
- **Frontend Pages**: Customer (Home, Products, ProductDetail, Cart, Checkout, Orders, OrderTracking, Profile, MyReviews, Contact, About); Manager (Dashboard, Products, Orders, Returns, Comments); Admin (Dashboard, Users, Products, Orders, Returns, Comments, Reports, Logs).
- **State Stores**: `authStore.js` (user session/JWT), `cartStore.js`, `notificationStore.js`.
- **Utilities**: `utils/api.js` (Axios base), `currency.js`, `imageUrl.js`, `categories.js`.

## Database Schema Explanation
- Entities mapped via Mongoose with enforced enums and constraints:
  - Delivery time: `estimatedDeliveryTime` min 1, max 3 (minutes), default 1.
  - Order status enum; returnRequest nested object for lifecycle of returns/refunds.
  - Comment unique constraint for verified purchase reviews.
  - Notification indexes for efficient unread queries.
  - Order trackingNumber partial unique index to maintain uniqueness when assigned.

## Code Implementation Strategy
- **Separation of Concerns**: Domain-specific routes, shared middleware, and model definitions decouple responsibilities.
- **RBAC**: Middleware (`authenticate`, `authorize`) intercepts requests; frontend `ProtectedRoute` guards routes.
- **Data Validation**: express-validator applied within route handlers (auth/products).
- **Async Flows**: Payment verification endpoint uses raw JSON body to satisfy Chapa requirements; tracking number generation in `Order` pre-save hook ensures uniqueness.
- **UI Feedback**: Toasts for success/error, badges for statuses, modals and confirmations for critical actions.
- **Performance Considerations**: Aggregation pipelines in `admin.js` for delivery and sales stats; React memoization via functional components and minimal global state.

## Assumptions and Constraints
- Environment variables supply secrets (JWT, Chapa) and database URI.
- Single MongoDB deployment assumed; sharding/replication not configured in code.
- Static files are served from backend; CDN offloading not configured.
- Payment processing depends on external Chapa availability.
- Delivery time currently auto-managed (no manual override); logistics complexity out of scope.
