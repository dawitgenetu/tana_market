## Testing Strategy
- **Focus**: Functional correctness of RBAC, product/order flows, payment verification, delivery constraints, and review moderation.
- **Approach**: Black-box functional testing on REST endpoints and UI flows; validation through toast feedback and protected navigation; linting on frontend codebase.
- **Tools**: Manual API testing (e.g., Postman/cURL), browser-based UI testing, eslint for static analysis.

## Types of Testing
- **Functional Testing**: Authentication, product CRUD, cart/checkout, order lifecycle, returns, comments, notifications.
- **Validation Testing**: Form validations, status guards (e.g., cancel only pending orders).
- **Security Testing**: JWT protection, role restrictions, password hashing verification.
- **Integration Testing**: Payment verification hook with Chapa, notification flows, tracking number generation.
- **UI/UX Testing**: Responsive layouts, toast feedback, navigation flows per role.

## Test Cases
| ID | Scenario | Precondition | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| TC-01 | User registration/login | No prior account; server running | Register via `/register` UI → login | JWT issued; user stored hashed; redirected to home |
| TC-02 | RBAC guard (manager route) | Authenticated customer | Navigate to `/manager/dashboard` | Redirected to `/` (access denied) |
| TC-03 | Product create (admin) | Admin authenticated | POST `/api/products` with valid payload + image | Product saved; appears in admin/manager lists and customer catalog |
| TC-04 | Cart and checkout | Customer authenticated | Add product to cart → open cart → checkout | Order created with status `pending`; totals correct |
| TC-05 | Payment verification | Order pending, payment initialized | Simulate Chapa verify hook | Order status becomes `paid`; tracking number assigned |
| TC-06 | Approve and ship | Order status `paid`; manager authenticated | PUT `/manager/orders/:id/approve` then `/manager/orders/:id/ship` | Status transitions to `approved`, then `shipped`; notifications sent |
| TC-07 | Customer cancel pending | Order status `pending` | PUT `/api/orders/:id/cancel` | Order document deleted; response confirms removal |
| TC-08 | Delivery time constraint | Admin stats present | Inspect `Order.estimatedDeliveryTime` bounds | Values remain within 1–3; defaults to 1 |
| TC-09 | Review submission | Delivered order; customer authenticated | POST comment for order/product | One review enforced; status `pending` until moderation |
| TC-10 | Comment moderation | Admin authenticated | Approve/reject via comments route/UI | Status updates; product rating aggregates recomputed |
| TC-11 | Notifications read state | User has unread notifications | Fetch `/api/notifications` → mark read | `read` flag toggles; indexes support quick queries |

## Validation and Verification
- **Validation**: Requirements traced to functional tests (e.g., delivery constraint, cancellation removal, RBAC).
- **Verification**: Code-level checks via eslint; Mongoose schema constraints (enums, min/max, indexes) ensure structural correctness; route-level status guards verify process rules.

## Results and Discussion
- Functional flows are supported end-to-end per code inspection. Delivery window is enforced at schema level; cancellation removes pending orders to satisfy data-removal rule. RBAC is consistently applied in middleware and UI. Payment integration depends on external Chapa availability; integration should be tested in staging with real credentials. Automated test coverage is not present; adding API integration tests would improve regression safety.
