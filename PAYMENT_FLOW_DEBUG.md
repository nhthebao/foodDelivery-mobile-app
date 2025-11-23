# 🔍 Debug Payment Flow - Chi tiết từng bước

## 📊 Flow hoạt động:

```
User Scan QR → Banking App → Transfer Money → Sepay
                                                  ↓
                                            Webhook Call
                                                  ↓
                                    Backend: /webhook/sepay
                                                  ↓
                                    Update Order in MongoDB
                                    (paymentStatus: "paid")
                                                  ↓
                            Frontend Polling: /payment/status/:orderId
                                                  ↓
                                    Read from MongoDB
                                                  ↓
                                    Return status to app
                                                  ↓
                                        Show Success ✅
```

## ❌ Các điểm có thể fail:

### 1. **Sepay không gọi webhook**

**Nguyên nhân:**

- Chưa config webhook URL trên Sepay dashboard
- Server đang sleep (Render free tier)
- URL không accessible

**Cách check:**

```bash
# Xem logs trên Render.com
# Tìm dòng: "📥 ========== SEPAY WEBHOOK RECEIVED =========="
# Nếu KHÔNG có → Webhook chưa được gọi
```

**Fix:**

- Config webhook trên Sepay: `https://food-delivery-mobile-app.onrender.com/payment/webhook/sepay`
- API Key header: `Authorization: Bearer thanhToanTrucTuyen`

---

### 2. **Webhook bị reject do Authorization**

**Nguyên nhân:**

- API Key không đúng
- Header format sai

**Cách check logs:**

```bash
# Tìm dòng: "❌ Invalid API Key:"
# Hoặc: Status 401 Unauthorized
```

**Fix:**

```javascript
// Relax authorization check
const verifyApiKey = (req, res, next) => {
  const authHeader = req.headers["authorization"] || "";
  const apiKey =
    req.headers["x-api-key"] || authHeader.replace(/^Bearer\s+/i, "");
  const expectedApiKey = process.env.SEPAY_API_KEY || "thanhToanTrucTuyen";

  // Log để debug
  console.log("🔑 Checking API Key:", apiKey);
  console.log("🔑 Expected:", expectedApiKey);

  if (!apiKey || apiKey !== expectedApiKey) {
    console.log("❌ Invalid API Key");

    // Bypass auth for testing
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ Bypassing auth for development");
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "❌ Unauthorized",
    });
  }

  next();
};
```

---

### 3. **Order không tìm thấy trong database**

**Nguyên nhân:**

- Order chưa được tạo
- OrderId không match

**Cách check logs:**

```bash
# Tìm dòng: "❌ Order not found: DH-xxxxx"
# Xem: "📋 Recent orders:" để so sánh format
```

**Debug:**

```javascript
// Frontend: Check order được tạo đúng chưa
console.log("📦 Creating order with ID:", orderCode);

// Backend: Check order ID format
console.log("🔍 Searching for order:", orderId);
console.log(
  "📋 Recent orders:",
  recentOrders.map((o) => o.id)
);
```

**Vấn đề thường gặp:**

- Frontend tạo: `DH-1763868773912-byyhff`
- Sepay gửi: `DH1763868773912byyhff` (không có dấu `-`)
- Database: `DH-1763868773912-byyhff`
- → Không match!

---

### 4. **Amount không khớp**

**Nguyên nhân:**

- Frontend gửi amount khác với actual transfer amount

**Cách check logs:**

```bash
# Tìm: "⚠️ Payment amount mismatch"
# Expected: 101376 VND
# Received: 100000 VND
```

**Fix:**

- Đảm bảo QR code có đúng amount
- Check `order.finalAmount` trong database

---

### 5. **Polling không nhận được update**

**Nguyên nhân:**

- Webhook đã update database nhưng polling check order khác
- Cache hoặc database connection issue

**Cách check:**

```bash
# Frontend logs:
# "🔄 [1/120] (3s) Polling payment for: DH-xxxxx"
# "✅ Payment status: unpaid" ← Vẫn unpaid dù đã chuyển tiền

# Backend logs:
# "✅ Payment confirmed for order: DH-xxxxx" ← Webhook đã xử lý
# "🔍 [GET /payment/status] Checking payment for order: DH-xxxxx"
# "✅ [GET /payment/status] Found order: DH-xxxxx - unpaid" ← Vẫn unpaid?
```

**Fix:**

- Check database xem order có status gì
- Verify orderIds giống nhau

---

## 🎯 Action Plan - Các bước cần làm NGAY

### Bước 1: Test webhook có được gọi không

```bash
# 1. Mở test-webhook.html trong browser
# 2. Nhập Order ID: DH-1763868773912-byyhff
# 3. Click "Load Template"
# 4. Click "Send Webhook"
# 5. Check logs trên Render.com
```

### Bước 2: Check order tồn tại trong database

```javascript
// Trên MongoDB Atlas, run query:
db.orders.find({ id: "DH-1763868773912-byyhff" })

// Kết quả:
{
  "_id": "...",
  "id": "DH-1763868773912-byyhff",
  "paymentStatus": "unpaid", // hoặc "paid"?
  "finalAmount": 101376
}
```

### Bước 3: Test full flow với manual webhook

```bash
# 1. Tạo order mới qua app
# 2. Copy Order ID (ví dụ: DH-1763868999999-abcdef)
# 3. Dùng test-webhook.html gửi fake payment
# 4. Check xem polling có detect được không
```

### Bước 4: Check Sepay configuration

```
Sepay Dashboard:
- Webhook URL: https://food-delivery-mobile-app.onrender.com/payment/webhook/sepay
- Method: POST
- Header: Authorization: Bearer thanhToanTrucTuyen
- Status: Active ✅
```

---

## 🔨 Code Fixes Cần Thêm

### Fix 1: Add more debug logs in polling

```typescript
// paymentServices.ts
export const checkPaymentStatus = async (
  orderId: string,
  retryCount: number = 0
) => {
  // ... existing code ...

  const data = await response.json();
  console.log(`✅ ========== PAYMENT STATUS RESPONSE ==========`);
  console.log(`Order ID: ${orderId}`);
  console.log(`Payment Status: ${data.paymentStatus}`);
  console.log(`Order Status: ${data.status}`);
  console.log(`Final Amount: ${data.finalAmount}`);
  console.log(`Transaction:`, data.paymentTransaction);
  console.log(`================================================`);

  // ... rest of code ...
};
```

### Fix 2: Relax order matching in webhook

```javascript
// Backend: routes/payment.routes.js
// Sau khi extract orderId từ code/content:

console.log(`🔍 Searching for order with ID: ${orderId}`);

// Try multiple matching strategies
const matchStrategies = [
  // 1. Exact match
  { id: orderId },

  // 2. Case-insensitive
  { id: { $regex: new RegExp(`^${orderId}$`, "i") } },

  // 3. Remove all dashes
  { id: { $regex: new RegExp(`^${orderId.replace(/-/g, "")}$`, "i") } },

  // 4. Flexible dashes
  { id: { $regex: new RegExp(`^DH-?\\d+-?[a-z0-9]+$`, "i") } },
];

for (const strategy of matchStrategies) {
  order = await Order.findOne(strategy);
  if (order) {
    console.log(`✅ Found order with strategy:`, strategy);
    break;
  }
}
```

### Fix 3: Wake server before payment

```typescript
// components/MomoModal.tsx
const wakeUpServer = async () => {
  try {
    console.log("🔔 Pinging server to wake up...");
    await fetch("https://food-delivery-mobile-app.onrender.com/health");
    console.log("✅ Server is awake");
  } catch (err) {
    console.log("⚠️ Server wake failed, but continuing...");
  }
};

// Call khi mở modal
useEffect(() => {
  if (visible && orderCode) {
    wakeUpServer(); // Wake server first
    // Then start polling...
  }
}, [visible, orderCode]);
```

---

## 📝 Checklist Debug

- [ ] **Sepay webhook URL đã được config chưa?**
- [ ] **Server có sleep không? (ping /health trước)**
- [ ] **Webhook có được gọi không? (check logs "📥 SEPAY WEBHOOK RECEIVED")**
- [ ] **Authorization có pass không? (check logs "❌ Invalid API Key")**
- [ ] **Order có trong database không? (query MongoDB)**
- [ ] **OrderId format có match không? (so sánh frontend vs Sepay)**
- [ ] **Amount có đúng không? (check finalAmount vs transferAmount)**
- [ ] **Polling có chạy không? (check logs "🔄 Polling payment for")**
- [ ] **Status có update trong database không? (query sau khi webhook)**

---

## 🚨 Most Common Issue

**99% vấn đề là: Webhook KHÔNG được gọi từ Sepay**

**Lý do:**

1. Chưa config trên Sepay dashboard
2. Server đang sleep (cold start)
3. URL không public/accessible

**Solution:**

1. Config webhook trên Sepay
2. Wake server trước khi show QR (ping /health)
3. Test với test-webhook.html để verify backend logic hoạt động đúng
4. Nếu Sepay vẫn không work → Consider alternative: Poll Sepay API directly
