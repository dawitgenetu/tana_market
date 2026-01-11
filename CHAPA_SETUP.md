# Chapa Payment Integration Setup

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tana-market
JWT_SECRET=6EaAxryjV6aiRzvNAuQgEfzU
CHAPA_SECRET_KEY=CHASECK_TEST-o2D1uU3RtyWLKKBKxcO5YQtpkjfjTS1E
CHAPA_PUBLIC_KEY=CHAPUBK_TEST-qG9XQUygaFZg5NYM5uUwVCo5pW04MecQ
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

## 📝 Steps to Create .env File

### Windows (PowerShell):
```powershell
cd backend
@"
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tana-market
JWT_SECRET=6EaAxryjV6aiRzvNAuQgEfzU
CHAPA_SECRET_KEY=CHASECK_TEST-o2D1uU3RtyWLKKBKxcO5YQtpkjfjTS1E
CHAPA_PUBLIC_KEY=CHAPUBK_TEST-qG9XQUygaFZg5NYM5uUwVCo5pW04MecQ
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
"@ | Out-File -FilePath .env -Encoding utf8
```

### Manual Method:
1. Navigate to `backend` folder
2. Create a new file named `.env` (no extension)
3. Copy and paste the content above
4. Save the file

## 💳 Chapa Payment Flow

### 1. **Payment Initialization**
- Customer completes checkout
- Order is created
- Payment is initialized with Chapa
- Customer is redirected to Chapa checkout page

### 2. **Payment Processing**
- Customer completes payment on Chapa
- Chapa processes the payment
- Chapa sends callback to backend

### 3. **Payment Verification**
- Backend receives callback from Chapa
- Payment is verified with Chapa API
- Order status is updated to "paid"
- Customer is redirected back to order tracking page

## 🔧 API Endpoints

### Initialize Payment
```
POST /api/payments/initialize
Headers: Authorization: Bearer <token>
Body: {
  orderId: "order_id",
  amount: 1500.00
}
Response: {
  checkout_url: "https://checkout.chapa.co/...",
  tx_ref: "TANA-20260103-0042"
}
```

### Verify Payment (Webhook)
```
POST /api/payments/verify
Body: {
  tx_ref: "TANA-20260103-0042",
  status: "success"
}
```

### Manual Verification
```
GET /api/payments/verify/:txRef
Headers: Authorization: Bearer <token>
```

## 🧪 Testing with Chapa Test Mode

The provided keys are **TEST keys** for development:

- **Test Card Numbers:**
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
  - 3D Secure: `4000 0025 0000 3155`

- **Test Details:**
  - CVV: Any 3 digits (e.g., `123`)
  - Expiry: Any future date (e.g., `12/25`)
  - PIN: Any 4 digits (for mobile money)

## 🔒 Production Setup

For production, replace test keys with live keys:

1. Get live keys from Chapa Dashboard
2. Update `.env` file:
   ```env
   CHAPA_SECRET_KEY=CHASECK_LIVE-...
   CHAPA_PUBLIC_KEY=CHAPUBK_LIVE-...
   ```
3. Update callback URL to production domain
4. Enable webhook in Chapa dashboard

## 🐛 Troubleshooting

### Payment Not Initializing?
- Check `.env` file exists and has correct keys
- Verify backend is running
- Check Chapa secret key is correct
- Check browser console for errors

### Payment Not Verifying?
- Check callback URL is accessible
- Verify webhook is configured in Chapa dashboard
- Check backend logs for verification errors
- Use manual verification endpoint as fallback

### Order Status Not Updating?
- Check payment verification endpoint
- Verify order exists in database
- Check payment reference matches
- Review backend logs

## 📚 Chapa Documentation

- API Docs: https://developer.chapa.co/
- Test Mode: https://developer.chapa.co/docs/test-mode
- Webhooks: https://developer.chapa.co/docs/webhooks

## ✅ Features Implemented

- ✅ Payment initialization
- ✅ Redirect to Chapa checkout
- ✅ Payment verification (webhook)
- ✅ Manual payment verification
- ✅ Order status updates
- ✅ Payment reference tracking
- ✅ Error handling
- ✅ Test mode support

## 🚀 Next Steps

1. Create `.env` file with provided keys
2. Restart backend server
3. Test payment flow with test card
4. Verify payment status updates
5. Configure production keys when ready
