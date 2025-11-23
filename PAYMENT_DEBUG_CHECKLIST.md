# 🔍 Payment Debug Checklist - So sánh Frontend vs Backend

## 📊 Thông tin hiện tại

### Frontend (App)

```
QR URL: https://qr.sepay.vn/img?acc=VQRQAFFXT3481&bank=MBBank&amount={amount}&des={orderCode}
Backend API: https://food-delivery-mobile-app.onrender.com
Virtual Account: VQRQAFFXT3481
Bank: MBBank
```

### Backend (Server - Cần kiểm tra)

```
Webhook URL: https://food-delivery-mobile-app.onrender.com/payment/webhook/sepay
Expected Account: VQRQAFFXT3481 (từ env BANK_ACCOUNT)
API Key: thanhToanTrucTuyen (từ env SEPAY_API_KEY)
```

---

## ⚠️ CÁC VẤN ĐỀ CÓ THỂ XẢY RA

### 1️⃣ Virtual Account không khớp

**Frontend gửi:** `VQRQAFFXT3481`
**Backend expect:** `process.env.BANK_ACCOUNT || "VQRQAFFXT3481"`

✅ **Cách check:**

```bash
# Trên Render.com dashboard:
# Settings → Environment → Kiểm tra biến BANK_ACCOUNT
# Nếu không có hoặc khác → Webhook sẽ reject
```

---

### 2️⃣ Order Code Format không match

**Frontend tạo:** `DH-{timestamp}-{random}`
Ví dụ: `DH-1763868773912-byyhff`

**Backend expect từ webhook:**

- Từ field `code`: Chính xác orderCode
- Từ field `content`: Regex `/DH[\d-]+[a-z0-9]*/i`

✅ **Cách check:**

- Xem logs backend khi webhook được gọi
- Check field `code` và `content` từ Sepay

---

### 3️⃣ Webhook không được Sepay gọi

**Nguyên nhân phổ biến:**

1. Chưa config webhook trên Sepay dashboard
2. Server đang sleep (Render free tier)
3. Authorization header sai
4. URL không accessible

✅ **Cách check:**

```bash
# 1. Test server alive:
curl https://food-delivery-mobile-app.onrender.com/health

# 2. Test webhook endpoint (bằng test-webhook.html):
# Mở file test-webhook.html trong browser
# Nhập Order ID
# Click "Send Webhook"

# 3. Xem logs trên Render.com:
# Dashboard → Logs → Tìm "📥 SEPAY WEBHOOK RECEIVED"
```

---

### 4️⃣ Authorization header format sai

**Backend expect:**

```javascript
Authorization: Bearer thanhToanTrucTuyen
// HOẶC
Authorization: thanhToanTrucTuyen
// HOẶC
x-api-key: thanhToanTrucTuyen
```

**Sepay gửi:** ??? (Cần check từ Sepay)

✅ **Fix tạm thời - Relax auth cho test:**

```javascript
// Backend: routes/payment.routes.js
const verifyApiKey = (req, res, next) => {
  // LOG EVERYTHING
  console.log("📥 Webhook Headers:", req.headers);
  console.log("📦 Webhook Body:", req.body);

  // BYPASS AUTH FOR TESTING
  console.log("⚠️ BYPASSING AUTH FOR TESTING");
  return next();

  // ... rest of code
};
```

---

### 5️⃣ Amount không khớp

**Frontend gửi:** `amount` trong VND (ví dụ: 101376)
**Backend expect:** `order.finalAmount` phải khớp với `transferAmount`

✅ **Cách check:**

```javascript
// Check order trong database:
db.orders.findOne({ id: "DH-1763868773912-byyhff" });

// So sánh:
// order.finalAmount === webhook.transferAmount
```

---

## 🎯 HÀNH ĐỘNG CẦN LÀM NGAY

### Bước 1: Kiểm tra Sepay Dashboard

```
1. Đăng nhập Sepay
2. Tìm Virtual Account: VQRQAFFXT3481
3. Check webhook configuration:
   - URL: https://food-delivery-mobile-app.onrender.com/payment/webhook/sepay
   - Method: POST
   - Headers: Authorization: Bearer thanhToanTrucTuyen
   - Status: Active
```

### Bước 2: Test Manual Webhook

```bash
# Dùng test-webhook.html hoặc curl:
curl -X POST https://food-delivery-mobile-app.onrender.com/payment/webhook/sepay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer thanhToanTrucTuyen" \
  -d '{
    "id": 99999,
    "gateway": "MBBank",
    "transactionDate": "2025-11-23 12:00:00",
    "accountNumber": "9999999999",
    "subAccount": "VQRQAFFXT3481",
    "code": "DH-1763868773912-byyhff",
    "content": "DH-1763868773912-byyhff Thanh toan",
    "transferType": "in",
    "transferAmount": 101376,
    "accumulated": 1000000,
    "referenceCode": "FT123456",
    "description": "Test"
  }'

# Kết quả mong đợi:
# {
#   "success": true,
#   "message": "✅ Payment processed successfully",
#   "orderId": "DH-1763868773912-byyhff",
#   ...
# }
```

### Bước 3: Check Backend Logs

```bash
# Trên Render.com:
# 1. Vào Dashboard → Logs
# 2. Tìm các dòng:
#    - "📥 ========== SEPAY WEBHOOK RECEIVED =========="
#    - "✅ Payment confirmed for order: ..."
#    - "❌ Order not found: ..."

# Nếu KHÔNG thấy log → Webhook chưa được gọi!
# Nếu thấy "Order not found" → Order ID không match
# Nếu thấy "Invalid API Key" → Auth header sai
```

### Bước 4: Debug Order Creation

```bash
# Check order có tồn tại trong DB không:
# MongoDB Atlas → Collections → orders
# Tìm: { id: "DH-1763868773912-byyhff" }

# Hoặc dùng API:
curl https://food-delivery-mobile-app.onrender.com/payment/status/DH-1763868773912-byyhff \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}"
```

---

## 🔧 QUICK FIXES

### Fix 1: Bypass Auth tạm thời (Backend)

```javascript
// routes/payment.routes.js
const verifyApiKey = (req, res, next) => {
  console.log("📥 Webhook request:", {
    headers: req.headers,
    body: req.body,
  });

  // TEMPORARY: Bypass auth
  return next();
};
```

### Fix 2: Add test endpoint không cần auth

```javascript
// routes/payment.routes.js
router.post("/webhook/sepay/test", async (req, res) => {
  console.log("🧪 TEST WEBHOOK - NO AUTH");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  // Process như webhook thật
  try {
    const { code, content, transferAmount, subAccount } = req.body;
    const orderId = code || content?.match(/DH[\d-]+[a-z0-9]*/i)?.[0];

    const Order = require("../server").Order;
    const order = await Order.findOne({ id: orderId });

    if (order) {
      order.paymentStatus = "paid";
      order.status = "confirmed";
      await order.save();

      res.json({
        success: true,
        message: "Test webhook processed",
        orderId: order.id,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Order not found",
        orderId: orderId,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### Fix 3: Add manual update endpoint

```javascript
// routes/payment.routes.js
router.post("/payment/manual-confirm/:orderId", async (req, res) => {
  try {
    const Order = require("../server").Order;
    const order = await Order.findOne({ id: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.paymentTransaction = {
      transactionId: "MANUAL_" + Date.now(),
      gateway: "MANUAL",
      amount: order.finalAmount,
    };
    await order.save();

    res.json({
      success: true,
      message: "Payment manually confirmed",
      order: order,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## 📞 DEBUG WORKFLOW

1. ✅ Tạo order trong app → Lấy Order ID
2. ✅ Check order exist: `GET /payment/status/{orderId}`
3. ✅ Test webhook: Dùng `test-webhook.html` hoặc curl
4. ✅ Check backend logs trên Render.com
5. ✅ Nếu webhook work → Config Sepay dashboard
6. ✅ Nếu webhook không work → Dùng manual confirm API

---

## 🎯 EXPECTED RESULT

### Khi thanh toán thành công:

```
Frontend:
1. Tạo order → "DH-1763868773912-byyhff"
2. Show QR với Virtual Account: VQRQAFFXT3481
3. Start polling every 3s

User:
4. Scan QR → Chuyển tiền 101376 VND
5. Nội dung CK: "DH-1763868773912-byyhff"

Sepay:
6. Nhận giao dịch
7. Call webhook: POST /payment/webhook/sepay
8. Gửi data: { code, content, transferAmount, subAccount }

Backend:
9. Nhận webhook
10. Log: "📥 SEPAY WEBHOOK RECEIVED"
11. Extract orderId từ code/content
12. Tìm order trong DB
13. Verify amount
14. Update: paymentStatus = "paid", status = "confirmed"
15. Response: { success: true }

Frontend:
16. Polling detect paymentStatus = "paid"
17. Stop polling
18. Show success alert
19. Navigate to success screen
```

---

## 🚨 NẾU VẪN KHÔNG WORK

### Option 1: Sepay API Polling (Thay vì webhook)

- Query Sepay API để check transactions
- Match với order code
- Update payment status

### Option 2: Manual Confirm

- User click "Tôi đã chuyển khoản"
- Admin verify trên dashboard
- Manual update status

### Option 3: Screenshot Verify

- User upload screenshot chuyển khoản
- Admin verify
- Update status
