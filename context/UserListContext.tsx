// context/UserListContext.tsx
import { User } from "@/types/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserListContextType {
  users: User[];
  loading: boolean;
  getById: (id: string) => User | undefined;
}

const UserListContext = createContext<UserListContextType>({
  users: [],
  loading: true,
  getById: () => undefined,
});

const API_URL = "https://food-delivery-mobile-app.onrender.com/users";

export const UserListProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log("📡 Fetching users from:", API_URL);
        const res = await fetch(API_URL);

        if (!res.ok) {
          console.error("❌ Failed to fetch users, status:", res.status);
          return;
        }

        const data = await res.json();
        console.log("✅ Fetched users count:", data.length);

        if (data.length > 0) {
          console.log(
            "👥 Sample user IDs:",
            data.slice(0, 5).map((u: User) => u.id)
          );
        } else {
          console.warn("⚠️ No users found in response");
        }

        setUsers(data);
      } catch (e) {
        console.error("❌ Error fetching users:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getById = (id: string) => {
    const user = users.find((u) => u.id === id);
    // Chỉ log warning nếu users đã được load và vẫn không tìm thấy
    if (!user && users.length > 0 && !loading) {
      console.log(
        `⚠️ User not found for id: ${id}, available users:`,
        users.slice(0, 3).map((u) => u.id)
      );
    }
    return user;
  };

  return (
    <UserListContext.Provider value={{ users, loading, getById }}>
      {children}
    </UserListContext.Provider>
  );
};

export const useUserList = () => useContext(UserListContext);
