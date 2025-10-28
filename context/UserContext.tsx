import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { CartItemSimple, User } from "../types/types";

import * as apiService from "../services/apiUserServices";
import * as dbService from "../services/userDatabaseServices";

interface CurrentUserContextType {
  currentUser: User | null;
  isLoading: boolean;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCart: (newCart: CartItemSimple[]) => Promise<void>;

  register: (
    userData: Omit<User, "id" | "_id" | "cart" | "favorite" | "image">
  ) => Promise<boolean>;

  editUser: (updatedData: Partial<User>) => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextType | null>(null);

export const CurrentUserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromDb = async () => {
      try {
        // Gọi hàm service CSDL (đã được sửa)
        const user = await dbService.fetchInitialUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (e) {
        console.error("Failed to load user from DB", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserFromDb();
  }, []);

  // 2. Đăng nhập (API -> SQLite -> State)
  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const userFromApi = await apiService.loginOnApi(username, password);
      if (userFromApi) {
        await dbService.saveUserToDb(userFromApi); // Đồng bộ CSDL
        setCurrentUser(userFromApi); // Cập nhật State
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login error in context:", err);
      return false;
    }
  };

  // 3. Đăng ký (API -> SQLite -> State)
  const register = async (
    userData: Omit<User, "id" | "_id" | "cart" | "favorite" | "image">
  ): Promise<boolean> => {
    try {
      const newUser = await apiService.registerOnApi(userData);
      if (newUser) {
        await dbService.saveUserToDb(newUser); // Đồng bộ CSDL
        setCurrentUser(newUser); // Cập nhật State
        return true;
      }
      return false;
    } catch (err) {
      console.error("Register error in context:", err);
      return false;
    }
  };

  // 4. Đăng xuất (State)
  const logout = async () => {
    // (Tùy chọn: bạn có thể gọi clearUserFromDb tại đây nếu muốn)
    setCurrentUser(null);
  };

  // 5. Chỉnh sửa User (State -> SQLite -> API)
  const editUser = async (updatedData: Partial<User>) => {
    if (!currentUser) return;

    const oldUser = currentUser;
    const newUserData = { ...currentUser, ...updatedData };

    // Cập nhật lạc quan
    setCurrentUser(newUserData);

    try {
      // B. Cập nhật SQLite
      const userFromDb = await dbService.editUserInDb(
        currentUser.id,
        updatedData
      );

      if (userFromDb) {
        // Đồng bộ lại state với CSDL
        setCurrentUser(userFromDb);

        // C. Cập nhật API (chạy nền)
        // User từ API có _id (MongoDB), user từ register mới có id
        // Chỉ đồng bộ lên API nếu user có _id (tức là đã tồn tại trên server)
        if (userFromDb._id) {
          const apiSuccess = await apiService.updateUserOnApi(
            userFromDb._id, // MongoDB ID
            userFromDb
          );

          if (!apiSuccess) {
            console.warn("API sync failed. Local data is updated.");
          } else {
            console.log("Đồng bộ user lên API thành công.");
          }
        } else {
          console.log("User local-only (không có _id), bỏ qua đồng bộ API.");
        }
      } else {
        // Nếu userFromDb là null (do lỗi CSDL), văng lỗi
        throw new Error("Failed to update user in DB");
      }
    } catch (err) {
      console.error("Edit user error:", err);
      setCurrentUser(oldUser); // Rollback nếu lỗi
    }
  };

  // 6. Cập nhật giỏ hàng (sử dụng 'editUser')
  const updateCart = async (newCart: CartItemSimple[]) => {
    await editUser({ cart: newCart });
  };

  // 7. (ĐỔI TÊN) Trả về Provider
  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        register,
        logout,
        editUser,
        updateCart,
      }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

// 8. (ĐỔI TÊN) Hook để sử dụng
export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error(
      // (Sửa lại thông báo lỗi)
      "useCurrentUser must be used within a CurrentUserProvider"
    );
  }
  return context;
};
