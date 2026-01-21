## Project Summary
Tana Market implements a full-stack, role-based e-commerce platform. The React frontend delivers distinct experiences for customers, managers, and administrators, while the Express/MongoDB backend enforces RBAC, manages products, orders, payments, returns, notifications, and activity logs. Delivery time is constrained to a 1–3 minute window and automated. Pending order cancellations remove data to honor clean-state rules.

## Achievements
- End-to-end shopping flow with cart, checkout, Chapa payment verification, and order tracking using TANA-format numbers.
- Robust RBAC across API and UI layers with protected routes.
- Comprehensive product management with media uploads, pricing, discounts, and stock.
- Order lifecycle management including approvals, shipping, delivery, cancellations, and returns/refunds.
- Review system with moderation, unique review constraints, and rating aggregation.
- Dashboards with analytics and delivery-time statistics; notifications and activity logging for auditability.

## Challenges Faced
- Coordinating payment verification with external gateway requirements (raw webhook payloads).
- Enforcing strict delivery-time constraints while maintaining status workflows.
- Ensuring unique tracking numbers and unique review submissions per order.
- Managing role separation in both frontend routing and backend middleware.

## Lessons Learned
- Clear separation of concerns (routes/models/layouts) improves maintainability.
- Schema-level constraints (enums, indexes, min/max) effectively guard business rules.
- Role-aware UI plus API enforcement prevents privilege drift.
- Integration endpoints (payments) benefit from explicit payload handling (raw body).

## Future Enhancement Suggestions
- Add automated integration tests for core flows (auth, payments, orders, comments).
- Introduce role-based analytics exports (CSV/PDF) per dashboard.
- Externalize file storage to object storage for scalability.
- Add multi-language and currency support.
- Implement delivery/logistics provider integration and dynamic delivery-time estimation beyond the current 1–3 minute window.
- Provide real-time updates via WebSockets for order status and notifications.
