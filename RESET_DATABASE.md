# 🔧 Hướng dẫn Reset Database

## Vấn đề
Database cũ có cột `_id` nhưng schema mới đã xóa cột này → Lỗi "table Users has no column named _id"

## Giải pháp: XÓA DATABASE CŨ

### Cách 1: Uninstall app trong Expo Go (KHUYẾN NGHỊ)
1. Mở Expo Go
2. Long press vào app "foodDelivery-mobile-app"
3. Chọn "Clear data" hoặc xóa app và cài lại
4. Scan QR code lại

### Cách 2: Xóa thủ công bằng code (Tạm thời)

Thêm vào `app/index.tsx`:

```typescript
import { resetDatabase } from "@/services/userDatabaseServices";
import { useEffect } from "react";

export default function Index() {
  // ... existing code ...
  
  useEffect(() => {
    // CHẠY 1 LẦN ĐỂ XÓA DATABASE CŨ
    const reset = async () => {
      await resetDatabase();
      console.log("✅ Database đã được reset!");
    };
    reset();
  }, []);
  
  // ... rest of code ...
}
```

**SAU KHI CHẠY 1 LẦN, HÃY XÓA CODE NÀY ĐI!**

## Schema Database Mới (KHÔNG CÓ _id)

```sql
CREATE TABLE Users (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  payment TEXT NOT NULL,
  image TEXT,
  favorite TEXT
);
```

## Lưu ý
- `_id` chỉ được sử dụng cho API sync (MongoDB ID)
- SQLite local KHÔNG lưu `_id`
- User từ API có `_id`, user mới đăng ký không có `_id`
