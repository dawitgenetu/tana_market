## SDLC Model Selection
**Iterative-Incremental with Agile Practices.**  
The repository shows phased yet adaptable development: separate backend/frontend packages, modular routes/models, and continuous enhancements (e.g., delivery-time constraint updates). This aligns with iterative delivery where increments (authentication, products, orders, payments, analytics) are built, reviewed, and refined while accommodating changes.

## Phase-by-Phase Application

### Requirement Analysis
- Captured multi-role needs (admin/manager/customer) reflected in protected frontend routes (`App.jsx`) and role-based middleware (`middleware/auth.js`).
- Business rules encoded in models (e.g., `Order` status enum, 1–3 minute delivery window) and routes (`orders.js`, `admin.js`, `manager.js`).
- Payment and tracking requirements embodied in payment routes and the TANA tracking format.

### System Design
- Layered architecture: React SPA → REST API (Express) → MongoDB models.
- Separation of concerns through route modules (auth, products, orders, payments, comments, notifications, admin, manager).
- Persistent models defined via Mongoose schemas (users, products, orders, comments, notifications, activity logs).
- UI layouts segmented by role (AdminLayout, ManagerLayout, CustomerLayout).

### Implementation
- Frontend: React 18 + Vite, Tailwind/Bootstrap styling, React Router for navigation, Zustand for state (auth, cart, notifications), API helper (`utils/api.js`) for Axios calls.
- Backend: Express with JWT auth, role authorization, Mongoose for ODM, Multer for uploads, express-validator for input checking, Chapa integration in payments route.
- Delivery window enforced in `Order` schema and admin stats; cancellation deletes pending orders.

### Testing
- Manual and UI-driven validation implied via toast feedback and guarded routes. Linting configured for frontend. Testing approach detailed in testing document (see `06_Testing_and_Evaluation.md`) with functional cases (auth, product CRUD, order flow, payment verification, review moderation).

### Deployment
- Node server (`backend/server.js`) with environment-based MongoDB URI.
- Static frontend build via `npm run build` (Vite) and backend start via `npm start`.
- Uploads served from `/uploads`, public assets in `frontend/public`.

### Maintenance
- Scripts for seeding and admin creation (`scripts/createAdmin.js`, `addSampleProducts.js`).
- Activity logs and notifications support operational monitoring.
- Clear modular structure eases updates (e.g., adjusting delivery constraints, adding routes).
