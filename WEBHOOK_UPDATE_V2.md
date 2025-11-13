# 🔄 Cập nhật Webhook Sepay - Backend v2

## 📋 Thay đổi chính

### ❌ Cấu trúc cũ (v1)

```json
{
  "id": "123456",
  "gateway": "MBBank",
  "transaction_date": "2025-11-14 10:30:00",
  "account_number": "0123456789",
  "amount_in": 50000,
  "transaction_content": "DH-123456",
  "reference_number": "FT12345",
  "bank_brand_name": "MB Bank"
}
```

### ✅ Cấu trúc mới (v2)

```json
{
  "id": 123456,
  "gateway": "MBBank",
  "transactionDate": "2025-11-14 10:30:00",
  "accountNumber": "0123456789",
  "subAccount": "VQRQAFFXT3481",
  "code": "code_giao_dich",
  "content": "DH-123456",
  "transferType": "in",
  "transferAmount": 50000,
  "accumulated": 1000000,
  "referenceCode": "FT12345",
  "description": "Thanh toan don hang"
}
```

## 🔑 Các thay đổi quan trọng

### 1. Field names (camelCase)

| Cũ                    | Mới                    |
| --------------------- | ---------------------- |
| `transaction_date`    | `transactionDate`      |
| `account_number`      | `accountNumber`        |
| `amount_in`           | `transferAmount`       |
| `transaction_content` | `content`              |
| `reference_number`    | `referenceCode`        |
| `bank_brand_name`     | `gateway` (giữ nguyên) |

### 2. Fields mới bắt buộc

#### `transferType` (string)

- **Giá trị:** "in" (tiền vào) hoặc "out" (tiền ra)
- **Quan trọng:** Backend chỉ xử lý khi `transferType === "in"`
- **Nếu thiếu hoặc khác "in":** Webhook trả về 200 nhưng không cập nhật order

```javascript
if (transferType !== "in") {
  return res.status(200).json({
    success: true,
    message: "Transaction type not 'in'",
  });
}
```

#### `subAccount` (string)

- **Giá trị:** "VQRQAFFXT3481" (Virtual Account từ Sepay)
- **Mục đích:** Xác định tài khoản ảo nhận tiền
- **Validation:** Backend kiểm tra match với `process.env.BANK_ACCOUNT`

```javascript
const expectedVirtualAccount = process.env.BANK_ACCOUNT || "VQRQAFFXT3481";
if (subAccount && subAccount !== expectedVirtualAccount) {
  return res.status(200).json({
    success: true,
    message: "Virtual account not matched",
  });
}
```

#### `accumulated` (number)

- **Giá trị:** Số dư tích lũy sau giao dịch
- **Không dùng cho validation** nhưng có thể log để tracking

### 3. Validation logic mới

#### Check transfer type

```javascript
// Chỉ xử lý giao dịch tiền VÀO
if (transferType !== "in") {
  console.log(`⚠️ Ignoring transaction type: ${transferType}`);
  return res.status(200).json({ ... });
}
```

#### Check virtual account

```javascript
// Validate tài khoản ảo (nếu có)
if (subAccount && subAccount !== expectedVirtualAccount) {
  console.log(`⚠️ Virtual account mismatch`);
  return res.status(200).json({ ... });
}
```

#### Check payment amount

```javascript
// So sánh với transferAmount (thay vì amount_in)
if (receivedAmount < expectedAmount) {
  console.log(`⚠️ Payment amount mismatch`);
  return res.status(200).json({ ... });
}
```

#### Check duplicate payment

```javascript
// Kiểm tra đơn hàng đã thanh toán chưa
if (order.paymentStatus === "paid") {
  console.log(`⚠️ Order already paid: ${orderId}`);
  return res.status(200).json({ ... });
}
```

## 📱 App Changes

### MomoModal.tsx

```typescript
// Thay đổi nội dung QR từ description → orderCode
// CŨ:
const qrUrl = `...&des=${encodeURIComponent(description)}`;

// MỚI:
const qrUrl = `...&des=${encodeURIComponent(orderCode)}`;
```

**Lý do:** Backend parse `orderCode` từ field `content` trong webhook. Nếu dùng description phức tạp, có thể regex không match được orderCode.

### paymentServices.ts

- Không thay đổi (vì chỉ call GET /payment/status/:orderId)
- Backend endpoint này không đổi response format

## 🧪 Test Cases

### ✅ Case 1: Thanh toán thành công

```bash
curl -X POST .../webhook/sepay \
  -d '{
    "transferType": "in",
    "subAccount": "VQRQAFFXT3481",
    "content": "DH-123456",
    "transferAmount": 50000
  }'
```

**Expected:** Order status → "paid", Alert thành công

### ❌ Case 2: Transfer type không phải "in"

```bash
curl -X POST .../webhook/sepay \
  -d '{
    "transferType": "out",
    "content": "DH-123456",
    "transferAmount": 50000
  }'
```

**Expected:** Webhook trả 200 nhưng không update order, App timeout sau 5 phút

### ❌ Case 3: Virtual account sai

```bash
curl -X POST .../webhook/sepay \
  -d '{
    "transferType": "in",
    "subAccount": "WRONG_ACCOUNT",
    "content": "DH-123456",
    "transferAmount": 50000
  }'
```

**Expected:** Webhook trả 200 nhưng không update order

### ❌ Case 4: Số tiền không đủ

```bash
curl -X POST .../webhook/sepay \
  -d '{
    "transferType": "in",
    "subAccount": "VQRQAFFXT3481",
    "content": "DH-123456",
    "transferAmount": 10000
  }'
```

**Expected:** Webhook trả 200 + message "insufficient", không update order

### ✅ Case 5: Đơn hàng đã thanh toán

```bash
# Gửi webhook 2 lần cho cùng 1 order
```

**Expected:** Lần 1 update thành công, lần 2 trả "already paid"

## 🔍 Debug Checklist

Khi webhook không hoạt động, check theo thứ tự:

1. ✅ **Authorization header đúng?**

   ```
   Authorization: Apikey thanhToanTrucTuyen
   ```

2. ✅ **transferType = "in"?**

   - Nếu không có hoặc khác "in" → Bị bỏ qua

3. ✅ **subAccount đúng?**

   - Phải = "VQRQAFFXT3481"
   - Nếu sai → Bị bỏ qua

4. ✅ **content chứa orderCode?**

   - Phải match regex: `/DH-\d+-[a-z0-9]+/i`
   - VD: "DH-123456-abc", "Thanh toan DH-123456-xyz"

5. ✅ **transferAmount >= finalAmount?**

   - Nếu nhỏ hơn → Không update order

6. ✅ **Order tồn tại trong DB?**

   - Kiểm tra có order với `id = orderCode` không

7. ✅ **Order chưa thanh toán?**
   - Nếu `paymentStatus === "paid"` → Webhook success nhưng không update

## 📝 Migration Notes

### Không cần thay đổi:

- ✅ Database schema (Order model)
- ✅ Frontend payment flow
- ✅ QR code generation logic (chỉ thay content)
- ✅ Polling mechanism

### Cần kiểm tra:

- ⚠️ QR content phải = orderCode (không phải description)
- ⚠️ Sepay webhook config phải gửi đúng format mới
- ⚠️ Environment variables: `BANK_ACCOUNT`, `SEPAY_API_KEY`

## 🚀 Production Checklist

- [ ] Update Sepay webhook config với format mới
- [ ] Test webhook với Postman/cURL
- [ ] Test thanh toán thật trên thiết bị
- [ ] Monitor backend logs khi có giao dịch thật
- [ ] Chuẩn bị rollback plan nếu có vấn đề
