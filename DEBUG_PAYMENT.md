# 🔧 Debug Payment Issues

## ✅ Checklist để kiểm tra

### 1. Kiểm tra Sepay Webhook Configuration

```bash
# Trên Sepay dashboard:
- Webhook URL: https://food-delivery-mobile-app.onrender.com/payment/webhook/sepay
- API Key header: Authorization: Bearer thanhToanTrucTuyen
- Status: Active
```

### 2. Test Webhook Endpoint

```bash
# Test bằng curl hoặc Postman:
curl -X POST https://food-delivery-mobile-app.onrender.com/payment/webhook/sepay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer thanhToanTrucTuyen" \
  -d '{
    "id": 12345,
    "gateway": "MBBank",
    "transactionDate": "2025-11-23 10:30:00",
    "accountNumber": "9999999999",
    "subAccount": "VQRQAFFXT3481",
    "code": "DH-1763868773912-byyhff",
    "content": "DH-1763868773912-byyhff Thanh toan don hang",
    "transferType": "in",
    "transferAmount": 101376,
    "accumulated": 1000000,
    "referenceCode": "FT123456",
    "description": "Chuyen tien"
  }'
```

### 3. Kiểm tra Backend Logs

```bash
# Xem logs trên Render.com:
# Tìm các dòng:
# - "📥 ========== SEPAY WEBHOOK RECEIVED =========="
# - "✅ Payment confirmed for order"
# - "❌ Order not found"
```

### 4. Kiểm tra Order trong Database

```javascript
// Trên MongoDB Atlas, chạy query:
db.orders.find({
  id: "DH-1763868773912-byyhff",
});

// Hoặc xem tất cả orders gần đây:
db.orders.find().sort({ createdAt: -1 }).limit(5);
```

### 5. Test Payment Status Endpoint

```bash
# Test API check status:
curl https://food-delivery-mobile-app.onrender.com/payment/status/DH-1763868773912-byyhff \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

## 🐛 Các vấn đề thường gặp

### Issue 1: Webhook không được gọi

**Nguyên nhân:**

- Sepay chưa cấu hình webhook
- URL không public/accessible
- Server đang sleep (Render free tier)

**Giải pháp:**

- Ping server trước: `curl https://food-delivery-mobile-app.onrender.com/health`
- Kiểm tra Sepay dashboard
- Dùng ngrok để test local

### Issue 2: Order ID không match

**Nguyên nhân:**

- Sepay gửi content khác format
- Regex matching không đúng

**Giải pháp:**

- Log tất cả webhook requests
- Xem exact format của `code` và `content`

### Issue 3: API Key không khớp

**Nguyên nhân:**

- Header format sai
- Env variable chưa set

**Giải pháp:**

```javascript
// Backend cần:
Authorization: Bearer thanhToanTrucTuyen

// hoặc
Authorization: thanhToanTrucTuyen
```

### Issue 4: Polling timeout

**Nguyên nhân:**

- Frontend timeout trước khi webhook xử lý
- Server cold start mất thời gian

**Giải pháp:**

- Tăng polling time: 60 → 120 attempts
- Giảm interval: 5s → 3s
- Add retry logic

## 🔨 Quick Fixes

### Fix 1: Tăng polling timeout (Frontend)

```typescript
// paymentServices.ts
export const startPaymentPolling = (
  orderId: string,
  onStatusChange: ...,
  onSuccess: ...,
  onTimeout: ...
) => {
  let attempts = 0;
  const maxAttempts = 120; // Tăng từ 60 → 120 (10 phút)

  currentPollingInterval = setInterval(async () => {
    // ... existing code
  }, 3000); // Giảm từ 5s → 3s
};
```

### Fix 2: Add debug logs (Frontend)

```typescript
// orderServices.ts - trong createOrder
console.log("📦 Creating order with code:", orderCode);
console.log("📦 Order details:", {
  id: orderCode,
  userId,
  finalAmount,
  paymentMethod,
});
```

### Fix 3: Verify webhook URL

```bash
# Test server đang chạy:
curl https://food-delivery-mobile-app.onrender.com/health

# Kết quả phải là:
# { "status": "ok", "database": "connected", ... }
```

### Fix 4: Manual test payment

```javascript
// Trên MongoDB Atlas, update manually để test:
db.orders.updateOne(
  { id: "DH-1763868773912-byyhff" },
  {
    $set: {
      paymentStatus: "paid",
      status: "confirmed",
      paymentTransaction: {
        transactionId: "TEST_123",
        gateway: "MBBank",
        amount: 101376,
      },
    },
  }
);

// Sau đó reload app để xem UI có update không
```

## 📊 Monitoring

### Add webhook test endpoint (Backend)

```javascript
// routes/payment.routes.js
router.get("/test-webhook/:orderId", async (req, res) => {
  try {
    const Order = require("../server").Order;
    const order = await Order.findOne({ id: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Simulate webhook
    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.paymentTransaction = {
      transactionId: "TEST_" + Date.now(),
      gateway: "TEST",
      amount: order.finalAmount,
    };
    await order.save();

    res.json({ success: true, message: "Payment simulated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

## 🎯 Next Steps

1. **Kiểm tra server logs** trên Render.com
2. **Test webhook manually** bằng curl
3. **Verify order tồn tại** trong database với đúng ID
4. **Check Sepay dashboard** xem webhook có được gọi không
5. **Add more logging** ở cả frontend và backend
