# Tana Market - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Install Dependencies

From the root directory:

```bash
npm run install:all
```

Or install separately:

```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
npm install
```

### 2. Environment Setup

#### Backend Environment

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tana-market
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CHAPA_SECRET_KEY=your-chapa-secret-key
FRONTEND_URL=http://localhost:3000
```

#### Frontend

The frontend is configured to proxy API requests to `http://localhost:5000` (see `vite.config.js`).

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### 4. Run the Application

#### Development Mode (Both Frontend and Backend)

From the root directory:

```bash
npm run dev
```

This will start:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:5000`

#### Run Separately

**Frontend only:**
```bash
cd frontend
npm run dev
```

**Backend only:**
```bash
cd backend
npm run dev
```

## Project Structure

```
TanaMarket/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── layouts/      # Layout components
│   │   ├── store/        # Zustand state management
│   │   └── utils/        # Utility functions
│   └── package.json
├── backend/           # Express.js backend
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   └── server.js       # Entry point
└── package.json
```

## Features

### Customer Features
- Browse products with search and filters
- Shopping cart with persistent storage
- Secure checkout with Chapa payment integration
- Order tracking with TANA tracking numbers
- Product reviews and ratings
- User profile management

### Manager Features
- Product management (CRUD)
- Order approval and shipping
- Comment/review management
- Dashboard with statistics

### Admin Features
- User management
- Full product management
- Order management
- Comment moderation
- Reports and analytics
- Activity logs

## Default Roles

- **Customer**: Can browse, purchase, and review products
- **Manager**: Can manage products, orders, and comments
- **Admin**: Full system access

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/categories/list` - Get all categories

### Orders
- `GET /api/orders` - Get user orders (authenticated)
- `POST /api/orders` - Create order (authenticated)
- `GET /api/orders/tracking/:trackingNumber` - Track order

### Payments
- `POST /api/payments/initialize` - Initialize Chapa payment

## Technologies Used

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)
- React Hook Form
- Recharts (charts)
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- Chapa Payment API

## Notes

- The frontend uses modern React patterns with hooks and functional components
- All UI components are responsive and mobile-friendly
- Animations and transitions are handled by Framer Motion
- State management uses Zustand for simplicity
- The backend follows RESTful API conventions
- JWT tokens are stored in localStorage (consider httpOnly cookies for production)

## Production Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Set production environment variables
3. Use a process manager like PM2 for the backend
4. Serve frontend build files with a web server (Nginx, etc.)
5. Enable HTTPS
6. Use secure JWT secrets
7. Configure CORS properly
8. Set up MongoDB connection with proper authentication

## Support

For issues or questions, please refer to the README.md file.
