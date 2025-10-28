

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

    // Tạo bảng Users KHÔNG CÓ _id (MongoDB field không cần thiết)
    await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS Users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      payment TEXT NOT NULL,
      favorite TEXT
    );
  `);

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

    // ... (Logic 'existingUser' và 'INSERT MẪU' giữ nguyên) ...
    // Lưu ý: User mẫu 'U001' sẽ không có cart items
    // ...

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
        favorite: dbUser.favorite ? JSON.parse(dbUser.favorite) : [],
        cart: [], // Sẽ được điền vào sau
    };
};

// --- CÁC HÀM SERVICE CHÍNH ---

/**
 * (CẬP NHẬT) Lấy user VÀ cart items của họ
 */
export const fetchInitialUser = async (): Promise<User | null> => {
    const db = await getDb();

    // 1. Lấy thông tin user cơ bản
    const dbUser = await db.getFirstAsync<any>(
        "SELECT * FROM Users" // Lấy user đầu tiên tìm thấy
    );

    const user = parseUserFromDb(dbUser);
    if (!user) {
        console.log("CSDL rỗng. Đang thêm dữ liệu mẫu cho user U026...");
        try {
            // Chúng ta dùng transaction vì phải ghi vào 2 bảng
            await db.withTransactionAsync(async () => {

                // 4a. Thêm user "Nguyễn Tấn Nghị" vào bảng Users (KHÔNG CÓ _id)
                await db.runAsync(
                    `INSERT INTO Users (id, fullName, address, phone, username, password, payment, image, favorite) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        "U026", // id
                        "Nguyễn Tấn Nghị", // fullName
                        "14 Nguyen Van Cu, Ho Chi Minh City", // address
                        "0905443344", // phone
                        "nguyenbaoz", // username
                        "zpass456", // password
                        "momo", // payment
                        "https://res.cloudinary.com/dxx0dqmn8/image/upload/v1761622331/05_vuonghacde_mcbgta.jpg", // image
                        JSON.stringify(["D072", "D077"]) // favorite (phải lưu dạng JSON string)
                    ]
                );

                // 4b. Thêm giỏ hàng vào bảng CartItems
                // Món 1: D071, số lượng 2
                await db.runAsync(
                    "INSERT INTO CartItems (user_id, item_id, quantity) VALUES (?, ?, ?)",
                    ["U026", "D071", 2]
                );

                // Món 2: D075, số lượng 1
                await db.runAsync(
                    "INSERT INTO CartItems (user_id, item_id, quantity) VALUES (?, ?, ?)",
                    ["U026", "D075", 1]
                );
            });
            console.log("Đã thêm user U026 và giỏ hàng mẫu thành công.");

        } catch (e) {
            console.error("Lỗi khi thêm dữ liệu mẫu:", e);
        }
    }

    // Nếu vẫn không có user sau khi thử thêm dữ liệu mẫu, trả về null
    if (!user) {
        return null;
    }

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
    const { cart, _id, ...userData } = user; // Tách cart và _id ra (không lưu _id vào SQLite)

    try {
        await db.withTransactionAsync(async () => {
            // 1. Lưu thông tin cơ bản vào bảng Users (KHÔNG CÓ _id)
            await db.runAsync(
                `INSERT OR REPLACE INTO Users (id, fullName, address, phone, username, password, payment, image, favorite) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userData.id,
                    userData.fullName,
                    userData.address,
                    userData.phone,
                    userData.username,
                    userData.password,
                    userData.payment,
                    userData.image || null,
                    JSON.stringify(userData.favorite || [])
                ]
            );

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
        return user; // Trả về user đầy đủ (đã bao gồm cart)
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