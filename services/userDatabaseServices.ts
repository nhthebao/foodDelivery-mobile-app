import * as SQLite from "expo-sqlite";
import { CartItemSimple, User } from "../types/types";

export type UserProps = User;

let db: SQLite.SQLiteDatabase | null = null;

// ==============================
// 🔁 Reset Database
// ==============================
export const resetDatabase = async () => {
    try {
        if (db) {
            await db.closeAsync();
            db = null;
        }
        await SQLite.deleteDatabaseAsync("UserDB.db");
        console.log("🗑️ Đã xóa database cũ");

        db = await initDatabase();
        console.log("✅ Đã tạo database mới");
        return true;
    } catch (e) {
        console.error("❌ Lỗi khi reset database:", e);
        return false;
    }
};

// ==============================
// 🧱 Init Database
// ==============================
const initDatabase = async () => {
    const dbInstance = await SQLite.openDatabaseAsync("UserDB.db");

    try {
        // ✅ Check if Users table exists and has correct schema
        const tableInfo = await dbInstance.getAllAsync(`PRAGMA table_info(Users);`);
        const hasEmailColumn = tableInfo.some((col: any) => col.name === 'email');
        const hasAuthProvidersColumn = tableInfo.some((col: any) => col.name === 'authProviders');

        if (!hasEmailColumn || !hasAuthProvidersColumn) {
            console.log("🔧 Users table missing required columns, dropping and recreating...");
            await dbInstance.execAsync(`DROP TABLE IF EXISTS Users;`);
            await dbInstance.execAsync(`DROP TABLE IF EXISTS CartItems;`);
        }
    } catch (err) {
        console.log("🔧 Database table doesn't exist yet, will create new...");
    }

    await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS Users (
      id TEXT PRIMARY KEY,
      _id TEXT,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      authProviders TEXT NOT NULL,
      image TEXT,
      favorite TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);

    await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS CartItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE
    );
  `);

    console.log("✅ Database initialized with correct schema");
    return dbInstance;
};

const getDb = async () => {
    if (!db) {
        db = await initDatabase();
    }
    return db;
};

// ==============================
// 🧩 Helper: Parse User
// ==============================
const parseUserFromDb = (dbUser: any): User | null => {
    if (!dbUser) return null;
    return {
        _id: dbUser._id || undefined,
        id: dbUser.id,
        fullName: dbUser.fullName,
        email: dbUser.email,
        username: dbUser.username,
        phone: dbUser.phone,
        address: dbUser.address,
        paymentMethod: dbUser.paymentMethod,
        authProviders: dbUser.authProviders ? JSON.parse(dbUser.authProviders) : ["firebase"],
        image: dbUser.image || "",
        favorite: dbUser.favorite ? JSON.parse(dbUser.favorite) : [],
        cart: [],
        createdAt: dbUser.createdAt || new Date().toISOString(),
        updatedAt: dbUser.updatedAt || new Date().toISOString(),
    };
};

// ==============================
// 📥 Fetch Initial User
// ==============================
export const fetchInitialUser = async (): Promise<User | null> => {
    const db = await getDb();

    const dbUser = await db.getFirstAsync<any>(
        "SELECT * FROM Users LIMIT 1"
    );

    const user = parseUserFromDb(dbUser);
    if (!user) {
        console.log("📭 Không có user trong database local");
        return null;
    }

    const cartItems = await db.getAllAsync<CartItemSimple>(
        "SELECT item_id as item, quantity FROM CartItems WHERE user_id = ?",
        [user.id]
    );

    user.cart = cartItems;
    return user;
};

// ==============================
// 💾 Save User To DB (Register/Login)
// ==============================
export const saveUserToDb = async (user: User): Promise<User | null> => {
    try {
        const db = await getDb();
        if (!db) {
            console.error("❌ Database not initialized");
            return null;
        }

        const { cart, ...u } = user;

        await db.withTransactionAsync(async () => {
            await db.runAsync(
                `INSERT OR REPLACE INTO Users (
          id, _id, fullName, email, username, phone, address,
          paymentMethod, authProviders, image, favorite, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    u.id,
                    u._id || null,
                    u.fullName,
                    u.email,
                    u.username,
                    u.phone,
                    u.address,
                    u.paymentMethod,
                    JSON.stringify(u.authProviders || ["firebase"]),
                    u.image || null,
                    JSON.stringify(u.favorite || []),
                    u.createdAt || new Date().toISOString(),
                    u.updatedAt || new Date().toISOString(),
                ]
            );

            // Xóa và ghi lại giỏ hàng
            await db.runAsync("DELETE FROM CartItems WHERE user_id = ?", [user.id]);
            for (const item of cart) {
                await db.runAsync(
                    "INSERT INTO CartItems (user_id, item_id, quantity) VALUES (?, ?, ?)",
                    [user.id, item.item, item.quantity]
                );
            }
        });

        console.log("💾 Đã lưu user vào SQLite:", user.username);
        return user;
    } catch (e) {
        console.error("❌ Lỗi khi lưu user:", e);
        return null;
    }
};

// ==============================
// ✏️ Edit User In DB (Update Profile/Cart/Favorite)
// ==============================
export const editUserInDb = async (
    userId: string,
    updatedData: Partial<User>
): Promise<User | null> => {
    try {
        const db = await getDb();
        if (!db) {
            console.error("❌ Database not initialized");
            return null;
        }

        await db.withTransactionAsync(async () => {
            const userFieldsToUpdate: any = { ...updatedData };
            delete userFieldsToUpdate.cart;

            if (userFieldsToUpdate.favorite) {
                userFieldsToUpdate.favorite = JSON.stringify(userFieldsToUpdate.favorite);
            }

            if (Object.keys(userFieldsToUpdate).length > 0) {
                const setClause = Object.entries(userFieldsToUpdate)
                    .map(([key]) => `${key} = ?`)
                    .join(", ");
                const values = [...Object.values(userFieldsToUpdate), userId];
                await db.runAsync(
                    `UPDATE Users SET ${setClause} WHERE id = ?`,
                    values as (string | number | null)[]
                );
            }

            if (updatedData.cart) {
                await db.runAsync("DELETE FROM CartItems WHERE user_id = ?", [userId]);
                for (const item of updatedData.cart) {
                    await db.runAsync(
                        "INSERT INTO CartItems (user_id, item_id, quantity) VALUES (?, ?, ?)",
                        [userId, item.item, item.quantity]
                    );
                }
            }
        });

        const dbUser = await db.getFirstAsync<any>(
            "SELECT * FROM Users WHERE id = ?",
            [userId]
        );
        const user = parseUserFromDb(dbUser);
        if (!user) return null;

        const cartItems = await db.getAllAsync<CartItemSimple>(
            "SELECT item_id as item, quantity FROM CartItems WHERE user_id = ?",
            [userId]
        );
        user.cart = cartItems;
        return user;
    } catch (e) {
        console.error("❌ Lỗi khi cập nhật user:", e);
        return null;
    }
};

// ==============================
// 🗑️ Xóa User
// ==============================
export const clearUserFromDb = async () => {
    try {
        const db = await getDb();
        if (!db) {
            console.error("❌ Database not initialized");
            return;
        }

        await db.withTransactionAsync(async () => {
            await db.execAsync("DELETE FROM CartItems;");
            await db.execAsync("DELETE FROM Users;");
        });
        console.log("🧹 Đã xóa sạch dữ liệu user");
        return true;
    } catch (e) {
        console.error("❌ Lỗi khi xóa user:", e);
        return false;
    }
};
