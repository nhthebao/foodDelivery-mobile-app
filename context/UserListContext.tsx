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
        const res = await fetch(API_URL);
        const data = await res.json();
        setUsers(data);
      } catch (e) {
        console.error("Error fetching users:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getById = (id: string) => users.find((u) => u.id === id);

  return (
    <UserListContext.Provider value={{ users, loading, getById }}>
      {children}
    </UserListContext.Provider>
  );
};

export const useUserList = () => useContext(UserListContext);
