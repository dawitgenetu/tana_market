# Admin Guide - Tana Market

## 🎯 Admin Overview

The Admin role has **full system access** with complete control over users, products, orders, comments, reports, and activity logs.

## 🔐 Creating Your First Admin User

### Quick Setup (Recommended)

Run this command from the `backend` directory:

```bash
cd backend
npm run create-admin
```

This will create an admin user with:
- **Email:** `admin@tanamarket.com`
- **Password:** `admin123`
- **⚠️ IMPORTANT:** Change this password immediately after first login!

### Manual Setup via MongoDB

If you prefer to create the admin manually:

1. Connect to MongoDB
2. Insert admin user:
```javascript
use tana-market
db.users.insertOne({
  name: "Admin User",
  email: "admin@tanamarket.com",
  password: "$2a$10$YourBcryptHashHere", // Use bcrypt to hash your password
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 📍 Admin Dashboard Access

### URLs:
- **Dashboard:** `http://localhost:3000/admin/dashboard`
- **Users:** `http://localhost:3000/admin/users`
- **Products:** `http://localhost:3000/admin/products`
- **Orders:** `http://localhost:3000/admin/orders`
- **Comments:** `http://localhost:3000/admin/comments`
- **Reports:** `http://localhost:3000/admin/reports`
- **Activity Logs:** `http://localhost:3000/admin/logs`

### Access Requirements:
1. Must be logged in
2. Must have `admin` role
3. If not admin, you'll be redirected to home page

## 🎨 Admin Features

### 1. **Dashboard** (`/admin/dashboard`)
- **Statistics Cards:**
  - Total Users count
  - Total Products count
  - Total Orders count
  - Total Revenue
- **Sales Overview Chart:** Line chart showing sales trends
- **Recent Orders:** Last 5 orders with customer info

### 2. **User Management** (`/admin/users`)
- ✅ View all users (customers, managers, admins)
- ✅ Create new users (can assign any role)
- ✅ Delete users
- ✅ View user roles with color-coded badges
- **Roles Available:**
  - Customer (default)
  - Manager
  - Admin

### 3. **Product Management** (`/admin/products`)
- ✅ View all products
- ✅ Add new products
- ✅ Edit existing products
- ✅ Delete products
- ✅ Manage product details (name, price, stock, category, images)

### 4. **Order Management** (`/admin/orders`)
- ✅ View all orders from all customers
- ✅ See order details (items, customer, total, status)
- ✅ Monitor order status flow
- ✅ Track delivery progress

### 5. **Comment Moderation** (`/admin/comments`)
- ✅ View all product reviews/comments
- ✅ Approve pending comments
- ✅ Reject inappropriate comments
- ✅ See comment status (pending/approved/rejected)
- ✅ View ratings and customer feedback

### 6. **Reports & Analytics** (`/admin/reports`)
- ✅ Sales reports with charts
- ✅ Category distribution (pie chart)
- ✅ Revenue analytics
- ✅ Export reports (PDF/CSV) - Coming soon

### 7. **Activity Logs** (`/admin/logs`)
- ✅ View all system activities
- ✅ Track user actions (login, logout, CRUD operations)
- ✅ Monitor system usage
- ✅ Audit trail for security

## 🔒 Admin Permissions

### What Admins Can Do:
- ✅ **Full Access** to all features
- ✅ Create/Edit/Delete any user
- ✅ Assign any role to users
- ✅ Manage all products
- ✅ View all orders
- ✅ Moderate all comments
- ✅ Access all reports
- ✅ View activity logs

### Admin vs Manager:
| Feature | Admin | Manager |
|---------|-------|---------|
| User Management | ✅ Full | ❌ No |
| Product Management | ✅ Full | ✅ Full |
| Order Management | ✅ All Orders | ✅ Assigned Orders |
| Comment Moderation | ✅ Approve/Reject | ✅ Reply Only |
| Reports & Analytics | ✅ Full Access | ❌ Limited |
| Activity Logs | ✅ Full Access | ❌ No |

## 🚀 Quick Start Steps

1. **Start MongoDB:**
   ```bash
   mongod
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Create Admin User:**
   ```bash
   cd backend
   npm run create-admin
   ```

4. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Login as Admin:**
   - Go to `http://localhost:3000/login`
   - Email: `admin@tanamarket.com`
   - Password: `admin123`
   - You'll be redirected to `/admin/dashboard`

## 🔧 API Endpoints (Admin Only)

All admin endpoints require:
- Valid JWT token in `Authorization: Bearer <token>` header
- User role must be `admin`

### Endpoints:
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/comments` - Get all comments
- `PUT /api/admin/comments/:id/approve` - Approve comment
- `PUT /api/admin/comments/:id/reject` - Reject comment
- `GET /api/admin/reports` - Get reports data
- `GET /api/admin/logs` - Get activity logs

## 🛡️ Security Notes

1. **Change Default Password:** Immediately change `admin123` after first login
2. **JWT Secret:** Use a strong secret in `.env` file
3. **Role Verification:** All admin routes verify role on backend
4. **Activity Logging:** All admin actions are logged
5. **HTTPS:** Use HTTPS in production

## 📝 Notes

- Admin users cannot be deleted through the UI (for safety)
- Admin role is checked on both frontend and backend
- All admin actions are logged in ActivityLog
- Admin dashboard uses modern charts (Recharts library)

## 🆘 Troubleshooting

### Can't Access Admin Dashboard?
1. Check if you're logged in
2. Verify your user role is `admin` in database
3. Check browser console for errors
4. Verify backend is running on port 5000

### Admin User Not Created?
1. Check MongoDB connection
2. Verify `.env` file has correct `MONGODB_URI`
3. Check backend logs for errors
4. Try creating manually via MongoDB

### Permission Denied?
1. Clear browser localStorage
2. Logout and login again
3. Verify JWT token is valid
4. Check backend middleware is working

---

**Need Help?** Check the main README.md or SETUP.md files for more information.
