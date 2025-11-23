# 🔍 HƯỚNG DẪN DEBUG THANH TOÁN - TỪNG BƯỚC

## ✅ BƯỚC 1: KIỂM TRA SERVER CÓ SỐNG KHÔNG

```bash
# Test server health
curl https://food-delivery-mobile-app.onrender.com/health
```

**Kết quả mong đợi:** `{"status":"ok"}`

**Nếu lỗi:** Server đang sleep (Render free tier), đợi ~1 phút để server khởi động lại.

---

## ✅ BƯỚC 2: KIỂM TRA ORDER ĐÃ ĐƯỢC TẠO TRÊN SERVER CHƯA

Sau khi tạo đơn hàng trong app, check xem order có tồn tại trên server không:

```bash
# Thay DH-1763868773912-byyhff bằng Order ID thực tế
curl https://food-delivery-mobile-app.onrender.com/payment/status/DH-1763868773912-byyhff
```

**Kết quả mong đợi:**

```json
{
  "orderId": "DH-1763868773912-byyhff",
  "paymentStatus": "unpaid",
  "status": "pending",
  "finalAmount": 50000
}
```

**Nếu lỗi 404:**

- Order CHƯA được tạo trên server
- Kiểm tra logs trong app xem `sendOrderToServer()` có thành công không
- Có thể do mất kết nối khi tạo order

---

## ✅ BƯỚC 3: TEST WEBHOOK BẰNG NÚT "TEST WEBHOOK" TRONG APP

1. Mở app → Đi đến màn hình thanh toán
2. Nhấn nút **"🧪 Test Webhook (DEBUG)"**
3. Xem kết quả trong Alert

**Kết quả mong đợi:**

```
Status: 200
Message: Payment received and order updated
```

**Nếu thành công:**

- Backend webhook endpoint hoạt động ĐÚNG ✅
- Vấn đề là: **Sepay không gọi webhook**

**Nếu lỗi 401 Unauthorized:**

- API Key sai
- Check header `Authorization: Bearer thanhToanTrucTuyen`

**Nếu lỗi 404:**

- Order không tồn tại trong database
- Quay lại BƯỚC 2

---

## ✅ BƯỚC 4: KIỂM TRA LẠI PAYMENT STATUS SAU KHI TEST WEBHOOK

Sau khi test webhook thành công, kiểm tra xem order đã được cập nhật chưa:

```bash
curl https://food-delivery-mobile-app.onrender.com/payment/status/DH-1763868773912-byyhff
```

**Kết quả mong đợi:**

```json
{
  "orderId": "DH-1763868773912-byyhff",
  "paymentStatus": "paid",  ← ĐÃ CHUYỂN THÀNH PAID
  "status": "confirmed",
  "finalAmount": 50000,
  "paymentTransaction": {
    "transactionId": "TEST...",
    "gateway": "VIETQR",
    ...
  }
}
```

**Nếu vẫn là `unpaid`:**

- Webhook không cập nhật database
- Kiểm tra logs backend xem có lỗi gì không
- Có thể do regex matching Order ID không khớp

---

## ✅ BƯỚC 5: KIỂM TRA SEPAY WEBHOOK CONFIGURATION

Đăng nhập vào **Sepay Dashboard** và kiểm tra:

### 5.1. Webhook URL phải CHÍNH XÁC:

```
https://food-delivery-mobile-app.onrender.com/payment/webhook/sepay
```

### 5.2. Webhook Headers:

```
Authorization: Bearer thanhToanTrucTuyen
Content-Type: application/json
```

### 5.3. Webhook Event:

- Chọn event: **"Transaction Received"** hoặc **"Payment Success"**

### 5.4. Test Webhook từ Sepay Dashboard:

- Sepay thường có nút "Test Webhook"
- Nhấn test và xem có gọi được không

---

## ✅ BƯỚC 6: THỰC HIỆN GIAO DỊCH THẬT VÀ QUAN SÁT LOGS

### 6.1. Mở logs backend (Render.com):

1. Vào Render Dashboard
2. Chọn service `food-delivery-mobile-app`
3. Xem **Logs** tab

### 6.2. Mở logs app (React Native):

```bash
# Nếu dùng Expo Go
npx expo start
# Logs sẽ hiển thị trong terminal
```

### 6.3. Thực hiện thanh toán:

1. Tạo đơn hàng trong app
2. Quét QR bằng banking app
3. Chuyển khoản **ĐÚNG số tiền + nội dung**

### 6.4. Quan sát logs:

**LOGS APP (React Native):**

```
🚀 [Payment Polling Started] Order: DH-...
🔄 [1/120] (3s) Polling payment for: DH-...
✅ ========== PAYMENT STATUS RESPONSE ==========
📋 Order ID: DH-...
💳 Payment Status: unpaid
...
```

**LOGS BACKEND (Render):**

```
📥 SEPAY WEBHOOK RECEIVED  ← CÂU NÀY PHẢI XUẤT HIỆN
📋 Raw Body: {...}
✅ Order found and updated: DH-...
```

---

## 🎯 CHẨN ĐOÁN DỰA TRÊN LOGS

| Trường hợp                | Logs Backend                           | Logs App                       | Vấn đề                  | Giải pháp                      |
| ------------------------- | -------------------------------------- | ------------------------------ | ----------------------- | ------------------------------ |
| ✅ THÀNH CÔNG             | `📥 SEPAY WEBHOOK RECEIVED`            | `🎉 PAYMENT CONFIRMED`         | Không có                | -                              |
| ❌ Webhook không được gọi | KHÔNG CÓ `📥 SEPAY WEBHOOK`            | `⏱️ POLLING TIMEOUT`           | Sepay không gọi webhook | Kiểm tra Sepay config          |
| ❌ Server sleep           | KHÔNG CÓ LOG NÀO                       | `❌ Error: 502/503`            | Server đang sleep       | Nâng cấp Render plan           |
| ❌ Order không tồn tại    | `⚠️ Order not found: DH-...`           | `⚠️ Order not found on server` | Order chưa được tạo     | Kiểm tra `sendOrderToServer()` |
| ❌ Regex không match      | `❌ Could not match orderId from: ...` | `⏱️ POLLING TIMEOUT`           | Nội dung CK không khớp  | Sửa regex trong backend        |

---

## 📊 EXPECTED BEHAVIOR - FLOW ĐÚNG

```
1. User checkout → App tạo order → Server tạo order → Database lưu (paymentStatus: "unpaid")
2. App hiển thị QR → User scan QR → Banking app transfer money
3. Bank → Sepay nhận tiền → Sepay GỌI WEBHOOK → Backend nhận webhook
4. Backend cập nhật order → Database (paymentStatus: "paid")
5. App polling → Phát hiện paymentStatus = "paid" → Hiển thị success
```

**Điểm QUAN TRỌNG NHẤT:** Bước 3-4 (Sepay → Webhook → Database)

---

## 🔧 GIẢI PHÁP DỰA PHÒNG

Nếu webhook không bao giờ hoạt động, có thể implement:

### Option 1: Polling trực tiếp Sepay API

- Gọi API Sepay để lấy danh sách giao dịch
- So sánh với order trong database
- Không phụ thuộc vào webhook

### Option 2: Manual verification

- User upload ảnh bill chuyển khoản
- Admin xác nhận thủ công

### Option 3: Nâng cấp Render plan

- Render free tier có thể bị sleep
- Paid plan ($7/month) sẽ luôn sống

---

## 📋 CHECKLIST DEBUG

- [ ] Server health OK (BƯỚC 1)
- [ ] Order tồn tại trên server (BƯỚC 2)
- [ ] Test webhook thành công (BƯỚC 3)
- [ ] Order status đã update sau test (BƯỚC 4)
- [ ] Sepay webhook URL đúng (BƯỚC 5.1)
- [ ] Sepay webhook headers đúng (BƯỚC 5.2)
- [ ] Logs backend hiển thị `📥 SEPAY WEBHOOK RECEIVED` (BƯỚC 6.4)
- [ ] Logs app hiển thị `🎉 PAYMENT CONFIRMED` (BƯỚC 6.4)

---

## 🆘 LIÊN HỆ HỖ TRỢ

Nếu tất cả các bước trên đã làm mà vẫn không được:

1. **Liên hệ Sepay Support:**

   - Hỏi xem webhook có được gọi không
   - Xem logs webhook attempts trong Sepay dashboard

2. **Check Render Logs:**

   - Có thể webhook đã gọi nhưng server trả lỗi
   - Kiểm tra response status từ webhook endpoint

3. **Thử thanh toán với số tiền nhỏ (10,000 VND):**
   - Đảm bảo account có đủ tiền test
   - Test với nhiều banks khác nhau
