/**
 * Script để reset database khi gặp lỗi
 * Chạy script này khi database bị corrupt hoặc cần tạo lại schema
 */

import { resetDatabase } from '../services/userDatabaseServices';

export const runDatabaseReset = async () => {
    console.log("🔄 Bắt đầu reset database...");
    const success = await resetDatabase();

    if (success) {
        console.log("✅ Database đã được reset thành công!");
        console.log("📱 Vui lòng reload app để áp dụng thay đổi");
    } else {
        console.log("❌ Reset database thất bại. Vui lòng thử lại.");
    }

    return success;
};
