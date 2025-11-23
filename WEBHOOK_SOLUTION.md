# 🔧 Giải pháp cho vấn đề Webhook không nhận được

## ❌ Vấn đề hiện tại

Webhook từ Sepay **KHÔNG** được gọi đến backend, dẫn đến:

- Frontend polling mãi không thấy payment status update
- Order vẫn ở trạng thái "unpaid" dù đã chuyển tiền
- Timeout sau 10 phút

## ✅ Các giải pháp

### Giải pháp 1: Sử dụng Polling thay vì Webhook (Recommended cho test)

**Vấn đề:** Sepay webhook cần setup phức tạp, URL public, và có thể có delay.

**Giải pháp:** Tăng cường polling để check trực tiếp trên API Sepay:

```typescript
// Thay vì chờ webhook, app sẽ:
// 1. Gọi Sepay API để check transaction
// 2. Nếu có transaction matching -> update order
// 3. Continue polling như bình thường
```

**Ưu điểm:**

- ✅ Không phụ thuộc webhook
- ✅ Work với Render free tier (sleep mode)
- ✅ Dễ debug và test
- ✅ Instant feedback khi user quay lại app

**Nhược điểm:**

- ❌ Cần Sepay API key để query transactions
- ❌ Có limit rate từ Sepay

---

### Giải pháp 2: Fix webhook Authorization

**Vấn đề:** Sepay gửi header không đúng format

**Giải pháp:** Relax authorization check:

```javascript
// Backend: routes/payment.routes.js
const verifyApiKey = (req, res, next) => {
  const authHeader = req.headers["authorization"] || "";
  const expectedApiKey = process.env.SEPAY_API_KEY || "thanhToanTrucTuyen";

  // ✅ Chấp nhận nhiều format:
  // - "Bearer thanhToanTrucTuyen"
  // - "thanhToanTrucTuyen"
  // - Header "x-api-key: thanhToanTrucTuyen"
  const apiKey =
    req.headers["x-api-key"] || authHeader.replace(/^Bearer\s+/i, "");

  if (!apiKey || apiKey !== expectedApiKey) {
    console.log("❌ Invalid API Key:", apiKey);
    console.log("📋 All headers:", req.headers);

    // ⚠️ FOR TESTING ONLY: Allow without auth
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ WARNING: Bypassing auth for development");
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "❌ Unauthorized: Invalid API Key",
    });
  }

  next();
};
```

---

### Giải pháp 3: Add webhook test endpoint (Bypass auth)

**Vấn đề:** Không biết webhook có đến server không

**Giải pháp:** Thêm endpoint test KHÔNG cần auth:

```javascript
// Backend: routes/payment.routes.js

// 🧪 TEST ENDPOINT - NO AUTH REQUIRED
router.post("/webhook/sepay/test", async (req, res) => {
  console.log("🧪 TEST WEBHOOK RECEIVED (NO AUTH)");
  console.log("📋 Headers:", req.headers);
  console.log("📦 Body:", req.body);

  res.json({
    success: true,
    message: "Test webhook received!",
    timestamp: new Date().toISOString(),
    receivedData: req.body,
  });
});

// Sau đó test với URL:
// https://food-delivery-mobile-app.onrender.com/payment/webhook/sepay/test
```

---

## 🎯 Plan hành động (Recommended)

### Bước 1: Tăng polling time (Quick Fix)

```typescript
// Đã tăng polling lên 10 phút (120 attempts x 3s)
// Giảm interval từ 5s → 3s để check nhanh hơn
```

### Bước 2: Test webhook có đến không

```bash
# Dùng test-webhook.html để gửi test request
# Xem logs trên Render.com
# Check Sepay dashboard
```

### Bước 3: Nếu webhook vẫn không work

```typescript
// Implement Sepay API polling
// Thay vì chờ webhook, app tự check transactions
```

---

## 🔨 Code cần thêm ngay (Backend)

### 1. Relax auth check (Backend)

### 2. Test endpoint (Backend)
