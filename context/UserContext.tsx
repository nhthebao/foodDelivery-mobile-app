import React, { createContext, useContext, useState, useEffect } from "react";

// ===== Kiểu dữ liệu người dùng =====
export interface User {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  cart: string[];
  username: string;
  password: string;
  favorite: string[];
  payment: string;
  image: string;
}

// ===== Kiểu dữ liệu context =====
interface UserContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCart: (newCart: string[]) => Promise<void>;
}

// ===== Tạo context =====
const UserContext = createContext<UserContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  updateCart: async () => {},
});

const API_URL = "https://food-delivery-mobile-app.onrender.com/users";

// ===== Provider =====
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // 🧩 Đăng nhập đơn giản theo username + password
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(API_URL);
      const data: User[] = await res.json();

      const found = data.find(
        (u) => u.username === username && u.password === password
      );

      if (found) {
        setUser(found);
        return true;
      }

      return false;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  // 🧩 Cập nhật giỏ hàng user trên API
  const updateCart = async (newCart: string[]): Promise<void> => {
    if (!user) return;
    try {
      const updatedUser: User = { ...user, cart: newCart };
      const res = await fetch(`${API_URL}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        setUser(updatedUser);
      } else {
        console.warn("Update cart failed");
      }
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  // 🧩 Đăng xuất
  const logout = (): void => setUser(null);

  return (
    <UserContext.Provider value={{ user, login, logout, updateCart }}>
      {children}
    </UserContext.Provider>
  );
};

// ===== Hook sử dụng UserContext =====
export const useUser = (): UserContextType => useContext(UserContext);
