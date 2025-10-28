

import * as SQLite from "expo-sqlite";
import { CartItemSimple, User } from './../types/types'; // SỬA 1: Import types mới

export type UserProps = User; // Giữ tên 'UserProps' theo yêu cầu

// ... (code 'db' và 'getDb' giữ nguyên) ...
let db: SQLite.SQLiteDatabase | null = null;

// FUNCTION: Reset database khi gặp lỗi
export const resetDatabase = async () => {
    try {
        if (db) {
            await db.closeAsync();
            db = null;
        }
        await SQLite.deleteDatabaseAsync("UserDB.db");
        console.log("🗑️ Đã xóa database cũ");
        // Tạo lại database mới
        db = await initDatabase();
        console.log("✅ Đã tạo database mới");
        return true;
    } catch (e) {
        console.error("❌ Lỗi khi reset database:", e);
        return false;
    }
};

const initDatabase = async () => {
    const dbInstance = await SQLite.openDatabaseAsync("UserDB.db");

    // Tạo bảng Users với _id để lưu MongoDB ID
    await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS Users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      payment TEXT NOT NULL,
      favorite TEXT,
      _id TEXT
    );
  `);

    // MIGRATION: Thêm cột _id nếu chưa có (để lưu MongoDB ID)
    try {
        await dbInstance.execAsync(`ALTER TABLE Users ADD COLUMN _id TEXT;`);
        console.log("✅ Đã thêm cột _id vào bảng Users");
    } catch (e: any) {
        if (e.message && e.message.includes("duplicate column")) {
            console.log("ℹ️ Cột _id đã tồn tại");
        } else {
            console.error("⚠️ Lỗi khi thêm cột _id:", e);
        }
    }

    // MIGRATION: Thêm cột image nếu chưa có (để tương thích với database cũ)
    try {
        await dbInstance.execAsync(`ALTER TABLE Users ADD COLUMN image TEXT;`);
        console.log("✅ Đã thêm cột image vào bảng Users");
    } catch (e: any) {
        if (e.message && e.message.includes("duplicate column")) {
            console.log("ℹ️ Cột image đã tồn tại");
        } else {
            console.error("⚠️ Lỗi khi thêm cột image:", e);
        }
    }

    // MIGRATION: Thêm cột favorite nếu chưa có
    try {
        await dbInstance.execAsync(`ALTER TABLE Users ADD COLUMN favorite TEXT;`);
        console.log("✅ Đã thêm cột favorite vào bảng Users");
    } catch (e: any) {
        if (e.message && e.message.includes("duplicate column")) {
            console.log("ℹ️ Cột favorite đã tồn tại");
        } else {
            console.error("⚠️ Lỗi khi thêm cột favorite:", e);
        }
    }

    // (MỚI) Bảng CARTITEMS để tạo mối quan hệ
    await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS CartItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE
    );
  `);

    return dbInstance;
};

const getDb = async () => {
    if (db) return db;
    db = await initDatabase();
    return db;
};

// --- HÀM HELPER PARSE/STRINGIFY ---
// (Hàm này chỉ còn dùng cho 'favorite')
const parseUserFromDb = (dbUser: any): User | null => {
    if (!dbUser) return null;
    return {
        ...dbUser,
        _id: dbUser._id || undefined, // Lấy _id từ SQLite (nếu có)
        favorite: dbUser.favorite ? JSON.parse(dbUser.favorite) : [],
        cart: [], // Sẽ được điền vào sau
    };
};

export const fetchInitialUser = async (): Promise<User | null> => {
    const db = await getDb();

    // 1. Lấy thông tin user cơ bản (chỉ từ database, không tạo mẫu)
    const dbUser = await db.getFirstAsync<any>(
        "SELECT * FROM Users LIMIT 1" // Lấy user đầu tiên nếu có
    );

    const user = parseUserFromDb(dbUser);

    // Nếu không có user trong database, trả về null
    // User phải đăng nhập hoặc đăng ký để có dữ liệu
    if (!user) {
        console.log("📭 Không có user trong database.");
        console.log("💡 Vui lòng đăng nhập hoặc đăng ký tài khoản.");
        return null;
    }

    console.log("✅ Đã tìm thấy user:", user.username);
    console.log("   User ID (Local):", user.id);
    console.log("   User ID (MongoDB):", user._id || "N/A");

    // 2. Lấy Cart Items của user đó
    const cartItems = await db.getAllAsync<CartItemSimple>(
        "SELECT item_id as item, quantity FROM CartItems WHERE user_id = ?",
        [user.id]
    );

    user.cart = cartItems;
    return user;
};

/**
 * (CẬP NHẬT) Lưu user (khi Login/Register)
 * Đây là một giao dịch (transaction)
 */
export const saveUserToDb = async (user: User): Promise<User | null> => {
    const db = await getDb();
    const { cart, ...userData } = user; // Giữ lại _id để lưu vào SQLite

    try {
        await db.withTransactionAsync(async () => {
            // 1. Lưu thông tin cơ bản vào bảng Users (BAO GỒM _id)
            await db.runAsync(
                `INSERT OR REPLACE INTO Users (id, fullName, address, phone, username, password, payment, image, favorite, _id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userData.id,
                    userData.fullName,
                    userData.address,
                    userData.phone,
                    userData.username,
                    userData.password,
                    userData.payment,
                    userData.image || null,
                    JSON.stringify(userData.favorite || []),
                    userData._id || null // Lưu MongoDB _id
                ]
            );

            console.log("💾 Đã lưu user vào SQLite với _id:", userData._id);

            // 2. Xóa tất cả CartItems cũ của user này
            await db.runAsync("DELETE FROM CartItems WHERE user_id = ?", [user.id]);

            // 3. Thêm CartItems mới
            for (const item of cart) {
                await db.runAsync(
                    "INSERT INTO CartItems (user_id, item_id, quantity) VALUES (?, ?, ?)",
                    [user.id, item.item, item.quantity]
                );
            }
        });
        return user; // Trả về user đầy đủ (đã bao gồm cart và _id)
    } catch (e) {
        console.error("Lỗi khi lưu user vào CSDL (transaction):", e);
        return null;
    }
};

/**
 * (CẬP NHẬT) Chỉnh sửa User (Edit Profile, Change Pass, Update Cart/Favorite)
 */
export const editUserInDb = async (
    userId: string,
    updatedData: Partial<User>
): Promise<User | null> => {
    const db = await getDb();

    try {
        // SỬA LỖI TRANSACTION:
        // Bọc TOÀN BỘ logic trong MỘT giao dịch
        await db.withTransactionAsync(async () => {

            // 1. Xử lý các trường trong bảng Users (fullName, favorite, v.v.)
            const userFieldsToUpdate: Partial<any> = { ...updatedData };
            delete userFieldsToUpdate.cart; // Xóa cart, vì nó được xử lý riêng

            // Stringify 'favorite' nếu nó được cập nhật
            if (userFieldsToUpdate.favorite) {
                userFieldsToUpdate.favorite = JSON.stringify(userFieldsToUpdate.favorite);
            }

            if (Object.keys(userFieldsToUpdate).length > 0) {
                const setClause = Object.entries(userFieldsToUpdate)
                    .map(([key]) => `${key} = ?`)
                    .join(", ");
                const values = [...Object.values(userFieldsToUpdate), userId];
                // Chạy lệnh UPDATE bên trong giao dịch
                await db.runAsync(`UPDATE Users SET ${setClause} WHERE id = ?`, values);
            }

            // 2. Xử lý riêng cho 'cart' (Nếu 'cart' được truyền vào)
            if (updatedData.cart) {
                // Xóa cart cũ
                await db.runAsync("DELETE FROM CartItems WHERE user_id = ?", [userId]);
                // Thêm cart mới
                for (const item of updatedData.cart as CartItemSimple[]) {
                    await db.runAsync(
                        "INSERT INTO CartItems (user_id, item_id, quantity) VALUES (?, ?, ?)",
                        [userId, item.item, item.quantity]
                    );
                }
            }
        }); // <-- Giao dịch kết thúc ở đây

        // 3. Lấy lại toàn bộ user sau khi giao dịch thành công
        const updatedUserFromDb = await db.getFirstAsync<any>(
            "SELECT * FROM Users WHERE id = ?",
            [userId]
        );
        const finalUser = parseUserFromDb(updatedUserFromDb);
        if (!finalUser) return null;

        const cartItems = await db.getAllAsync<CartItemSimple>(
            "SELECT item_id as item, quantity FROM CartItems WHERE user_id = ?",
            [userId]
        );
        finalUser.cart = cartItems;
        return finalUser;

    } catch (e) {
        console.error("Lỗi khi edit user CSDL:", e);
        return null; // Trả về null sẽ kích hoạt "Failed to update user in DB"
    }
};

// (Hàm 'clearUserFromDb' giữ nguyên như cũ nếu bạn có)