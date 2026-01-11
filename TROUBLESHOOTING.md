# Troubleshooting Guide

## Network Error - Backend Not Running

If you see a "Network Error" or "Cannot connect to server" message, it means the backend server is not running.

### Quick Fix:

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   
   You should see:
   ```
   MongoDB connected
   Server running on port 5000
   ```

2. **Make sure MongoDB is running:**
   - If using local MongoDB: `mongod`
   - Or use MongoDB Atlas connection string in `.env`

3. **Check Backend Status:**
   - Backend should be running on: `http://localhost:5000`
   - Test by visiting: `http://localhost:5000/api/stats`

### Running Both Frontend and Backend:

**Option 1: Run separately (recommended for debugging):**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Option 2: Run together:**
```bash
# From root directory
npm run dev
```

### Common Issues:

#### 1. Port 5000 Already in Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

#### 2. MongoDB Not Connected
- Check MongoDB is running
- Verify connection string in `backend/.env`
- Check MongoDB logs for errors

#### 3. CORS Errors
- Backend has CORS enabled
- Check `backend/server.js` has `app.use(cors())`

#### 4. Authentication Errors
- Make sure you're logged in
- Check user role is 'manager' or 'admin'
- Verify JWT token in localStorage

### Testing Backend Connection:

1. **Check if backend is running:**
   ```bash
   curl http://localhost:5000/api/stats
   ```
   
   Should return JSON with stats.

2. **Check browser console:**
   - Open DevTools (F12)
   - Go to Network tab
   - Try adding a product
   - Check if request shows "Failed" or "Pending"

3. **Check backend logs:**
   - Look at terminal where backend is running
   - Check for error messages
   - Verify MongoDB connection

### Environment Setup:

Make sure `backend/.env` exists:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tana-market
JWT_SECRET=your-secret-key
CHAPA_SECRET_KEY=your-chapa-key
FRONTEND_URL=http://localhost:3000
```

### Still Having Issues?

1. **Check all services are running:**
   - ✅ MongoDB
   - ✅ Backend (port 5000)
   - ✅ Frontend (port 3000)

2. **Clear browser cache:**
   - Clear localStorage
   - Hard refresh (Ctrl+Shift+R)

3. **Check firewall/antivirus:**
   - May be blocking localhost connections

4. **Restart everything:**
   - Stop all Node processes
   - Restart MongoDB
   - Start backend
   - Start frontend
