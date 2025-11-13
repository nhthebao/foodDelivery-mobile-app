# Hướng dẫn test thanh toán tự động

## 🎯 Tính năng

Hệ thống tự động kiểm tra trạng thái thanh toán qua webhook Sepay:

- ✅ Tự động polling mỗi 5 giây
- ✅ Hiển thị countdown 5 phút
- ✅ Tự động đóng modal khi thanh toán thành công
- ✅ Alert timeout nếu quá 5 phút không có xác nhận

## 📋 Cấu hình Backend

### Webhook URL

```
https://food-delivery-mobile-app.onrender.com/webhook/sepay
```

### API Key

```
thanhToanTrucTuyen
```

### Cách Sepay gửi request

```http
POST /webhook/sepay
Headers:
  Authorization: Apikey thanhToanTrucTuyen
  Content-Type: application/json

Body:
{
  "id": 123456,
  "gateway": "MBBank",
  "transactionDate": "2025-11-14 10:30:00",
  "accountNumber": "0123456789",
  "subAccount": "VQRQAFFXT3481",
  "code": "code_giao_dich",
  "content": "DH-1699401234567-abc123def",
  "transferType": "in",
  "transferAmount": 50000,
  "accumulated": 1000000,
  "referenceCode": "FT12345",
  "description": "Thanh toan don hang"
}
```

**Các field quan trọng:**

- `transferType`: Phải = "in" (tiền vào)
- `subAccount`: Virtual Account = "VQRQAFFXT3481"
- `content`: Phải chứa orderCode (VD: "DH-123456")
- `transferAmount`: Số tiền chuyển khoản (phải >= finalAmount)

## 🧪 Test Flow

### 1. Tạo đơn hàng

```typescript
// Trong checkOut.tsx
const orderCode = `DH-${Date.now().toString().slice(-6)}`;
// Ví dụ: DH-123456
```

### 2. Hiển thị QR Code

- Modal hiển thị QR code với nội dung chuyển khoản = `orderCode`
- VD: `DH-123456`
- App bắt đầu polling tự động

### 3. Mô phỏng thanh toán (Test)

#### Cách 1: Dùng Postman/cURL

```bash
curl -X POST https://food-delivery-mobile-app.onrender.com/webhook/sepay \
  -H "Authorization: Apikey thanhToanTrucTuyen" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 123456,
    "gateway": "MBBank",
    "transactionDate": "2025-11-14 10:30:00",
    "accountNumber": "0123456789",
    "subAccount": "VQRQAFFXT3481",
    "code": "TEST123",
    "content": "DH-123456",
    "transferType": "in",
    "transferAmount": 50000,
    "accumulated": 1000000,
    "referenceCode": "FT12345",
    "description": "Test thanh toan"
  }'
```

**Quan trọng:**

- `transferType` = "in" (tiền vào, nếu khác sẽ bị bỏ qua)
- `content` chứa mã đơn hàng (DH-123456)
- `transferAmount` >= giá trị đơn hàng

#### Cách 2: Thanh toán thật qua QR Code

1. Mở app ngân hàng MBBank
2. Quét QR code hiển thị trong app
3. Chuyển khoản đúng số tiền
4. Nội dung CK phải có mã đơn hàng (VD: `DH-123456`)

### 4. Kiểm tra kết quả

App sẽ tự động:

1. Hiển thị "Đang chờ xác nhận thanh toán..."
2. Đếm ngược thời gian
3. Khi webhook nhận được → Alert "Thanh toán thành công! 🎉"
4. Tự động đóng modal và chuyển sang màn hình success

## 📱 Demo Mode

Trong development, có nút "[Demo] Bỏ qua - Xác nhận luôn" để test nhanh mà không cần thanh toán thật.

Nút này sẽ tự động ẩn khi build production (`__DEV__ === false`).

## 🔍 Debug

### Check logs

```javascript
// App logs
console.log("🔍 Starting payment verification for order:", orderCode);
console.log("💳 Payment status updated:", status);
console.log("✅ Payment confirmed!");

// Backend logs
console.log("📥 Received Sepay webhook:");
console.log("🔍 Processing payment for order:", orderId);
console.log("✅ Payment confirmed for order:", orderId);
```

### API endpoints để test thủ công

#### Kiểm tra trạng thái đơn hàng

```bash
GET https://food-delivery-mobile-app.onrender.com/payment/status/DH-123456
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Tạo thông tin thanh toán

```bash
POST https://food-delivery-mobile-app.onrender.com/payment/create
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "orderId": "DH-123456"
}
```

## ⚙️ Cấu hình

### Thời gian polling

Sửa trong `paymentServices.ts`:

```typescript
const maxAttempts = 60; // 60 attempts x 5s = 5 phút
```

### Interval giữa các lần check

```typescript
}, 5000); // Kiểm tra mỗi 5 giây
```

## 🚨 Troubleshooting

### Webhook không nhận được

1. Kiểm tra API Key đúng: `thanhToanTrucTuyen`
2. Kiểm tra format Authorization header: `Apikey thanhToanTrucTuyen`
3. Check backend logs xem có nhận request không

### App không cập nhật trạng thái

1. Kiểm tra JWT token còn hợp lệ không
2. Check network - backend có đang chạy không
3. Xem console logs trong app

### Timeout quá nhanh

- Tăng `maxAttempts` trong `paymentServices.ts`
- Hoặc giảm interval (nhưng sẽ tốn tài nguyên hơn)

## 📝 Notes

- ⚠️ Webhook chỉ hoạt động khi backend đang chạy
- ⚠️ Nội dung chuyển khoản PHẢI chứa mã đơn hàng chính xác
- ⚠️ Test trên thiết bị thật để đảm bảo network ổn định
- ✅ Polling tự động dừng khi:
  - Thanh toán thành công
  - Hết thời gian (timeout)
  - User đóng modal
