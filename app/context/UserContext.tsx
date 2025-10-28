import React, { ReactNode, useEffect, useRef, useState } from "react";
// ✅ Sử dụng import từ '/next' để đảm bảo các hàm async mới nhất và type chính xác
import * as SQLite from "expo-sqlite";

interface UserProps {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  username: string;
  password: string;
  payment: string;
}

interface UserContextProps {
  currentUser: UserProps | null;
  editUser: (updatedUser: Partial<UserProps>) => Promise<void>;
  logOut: () => void;
}

export const UserContext = React.createContext<UserContextProps | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProps | null>(null);
  // Type là SQLite.SQLiteDatabase từ '/next'
  const dbRef = useRef<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mở DB và init
  const initApp = async () => {
    try {
      const db = await SQLite.openDatabaseAsync("UserDB.db");
      dbRef.current = db;

      // 1. CREATE TABLE: Dùng db.execAsync
      // Hàm này thực thi nhiều lệnh SQL (bao gồm CREATE)
      await db.execAsync(`
            CREATE TABLE IF NOT EXISTS Users (
              id TEXT PRIMARY KEY,
              fullName TEXT NOT NULL,
              address TEXT NOT NULL,
              phone TEXT NOT NULL,
              username TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              payment TEXT NOT NULL
            );
          `);

      // 2. CHECK FOR SAMPLE USER: Dùng db.getFirstAsync (SELECT 1 hàng)
      const existingUser = await db.getFirstAsync<{ id: string }>(
        "SELECT id FROM Users WHERE id = ?",
        ["U001"]
      );

      // 3. INSERT MẪU nếu chưa có: Dùng db.runAsync
      if (!existingUser) {
        await db.runAsync(
          `INSERT INTO Users (id, fullName, address, phone, username, password, payment) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            "U001",
            "Nguyen Van A",
            "123 Le Loi, Ho Chi Minh City",
            "0905123456",
            "nguyenvana",
            "123456",
            "momo",
          ]
        );
        console.log("Sample user inserted");
      }

      // 4. FETCH USER: Dùng db.getFirstAsync
      const user = await db.getFirstAsync<UserProps>(
        "SELECT * FROM Users WHERE id = ?",
        ["U001"]
      );

      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Init error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------

  useEffect(() => {
    initApp();
  }, []);

  // Edit user
  const editUser = async (updatedUser: Partial<UserProps>) => {
    if (!currentUser || !dbRef.current) return;
    try {
      const db = dbRef.current;
      const setClause = Object.entries(updatedUser)
        .map(([key]) => `${key} = ?`)
        .join(", ");
      // Đảm bảo values là một mảng tham số hợp lệ cho runAsync
      const values = [...Object.values(updatedUser), currentUser.id];

      // 1. UPDATE USER: Dùng db.runAsync
      await db.runAsync(`UPDATE Users SET ${setClause} WHERE id = ?`, values);

      // 2. Refresh lại dữ liệu user: Dùng db.getFirstAsync
      const updated = await db.getFirstAsync<UserProps>(
        "SELECT * FROM Users WHERE id = ?",
        [currentUser.id]
      );

      if (updated) {
        setCurrentUser(updated);
      }

      console.log("User updated");
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // Log out (Không đổi)
  const logOut = () => {
    setCurrentUser(null);
    console.log("Logged out");
  };

  if (isLoading) {
    return null;
  }

  return (
    <UserContext.Provider value={{ currentUser, editUser, logOut }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
