/**
 * Script để reset Order Database
 * Chạy script này khi cần xóa và tạo lại bảng Orders với schema mới
 * 
 * Cách sử dụng:
 * 1. Import và gọi trong app
 * 2. Hoặc thêm vào dev menu
 */

import * as SQLite from "expo-sqlite";

export const resetOrderDB = async () => {
    try {
        console.log("🔄 Đang reset Order Database...");

        // Xóa database cũ
        await SQLite.deleteDatabaseAsync("OrderDB.db");
        console.log("✅ Đã xóa OrderDB.db");

        // Tạo database mới với schema mới
        const db = await SQLite.openDatabaseAsync("OrderDB.db");

        await db.execAsync(`
            CREATE TABLE Orders (
              id TEXT PRIMARY KEY,
              _id TEXT,
              userId TEXT NOT NULL,
              items TEXT NOT NULL,
              totalAmount REAL NOT NULL,
              discount REAL NOT NULL,
              deliveryFee REAL NOT NULL,
              finalAmount REAL NOT NULL,
              paymentMethod TEXT NOT NULL,
              deliveryAddress TEXT NOT NULL,
              estimatedDeliveryTime TEXT,
              status TEXT NOT NULL,
              paymentStatus TEXT NOT NULL,
              createdAt TEXT NOT NULL,
              updatedAt TEXT NOT NULL
            );
        `);

        await db.closeAsync();

        console.log("✅ Đã tạo lại OrderDB.db với schema mới");
        console.log("✅ Reset hoàn tất!");

        return true;
    } catch (error) {
        console.error("❌ Lỗi khi reset OrderDB:", error);
        return false;
    }
};
