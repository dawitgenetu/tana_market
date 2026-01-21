## Sample Forms (Described)
- **Login/Register Forms**: Capture email, password, and name (registration); validation handled client-side with toast feedback.
- **Product Form (Admin/Manager)**: Fields for name, description, price, discount, stock, category, images; leverages upload to `/uploads/products`.
- **Checkout Form**: Shipping address (address, city, phone, notes) and payment initiation via Chapa.
- **Return Request Form**: Reason selection/free-text, tied to an existing paid/shipped/delivered order.

## Sample UI Screens (Textual)
- **Customer Home/Products**: Grid of products with images, price, discount badges, category filters; cart icon for adding items.
- **Cart/Checkout**: Line items with quantity controls, subtotal/total summary, checkout button.
- **Order Tracking**: Status badges showing progression pending → paid → approved → shipped → delivered/cancelled; TANA tracking number display.
- **Admin Dashboard**: Cards for totals, charts for sales/orders, delivery-time range summary; tables for recent orders.
- **Manager Dashboard**: Orders awaiting approval/shipping, product performance highlights.
- **Comments Moderation**: List of pending/approved/rejected reviews with approve/reject/reply controls.

## Questionnaires / Interviews (Framework)
- Stakeholder interviews focusing on order workflow pain points, payment verification expectations, and required analytics.
- Customer feedback prompts about checkout usability, delivery-time clarity, and notification usefulness.

## Additional Diagrams (ASCII)
**Order Status Flow**
```
pending --> paid --> approved --> shipped --> delivered
   \                                 /
    \--> cancelled (pending by customer) or via refunds
```

**Review Moderation Flow**
```
customer submits review (pending)
        |
 admin/manager approves or rejects
        |
 approved -> visible & rating aggregated
 rejected -> hidden, optional reply
```
