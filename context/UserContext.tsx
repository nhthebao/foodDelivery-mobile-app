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

  // 4. Đăng xuất (Xóa user khỏi database và state)
  const logout = async () => {
    try {
      console.log("🚪 Đang xóa dữ liệu user khỏi database...");
      // Reset database để xóa tất cả dữ liệu user
      await dbService.resetDatabase();
      console.log("✅ Đã xóa dữ liệu user khỏi database");
      // Xóa user khỏi state
      setCurrentUser(null);
    } catch (error) {
      console.error("❌ Lỗi khi đăng xuất:", error);
      // Vẫn xóa user khỏi state ngay cả khi có lỗi
      setCurrentUser(null);
    }
  };

  // 5. Chỉnh sửa User (State -> SQLite -> API)
  const editUser = async (updatedData: Partial<User>) => {
    if (!currentUser) return;

    const oldUser = currentUser;
    const newUserData = { ...currentUser, ...updatedData };

    // 1. Cập nhật lạc quan (Optimistic Update)
    setCurrentUser(newUserData);

    try {
      // 2. Cập nhật SQLite
      const userFromDb = await dbService.editUserInDb(
        currentUser.id, // Dùng ID local để tìm và cập nhật
        updatedData
      );

      if (!userFromDb) {
        throw new Error("Failed to update user in DB");
      }

      // Đồng bộ lại state với dữ liệu chính xác từ CSDL
      setCurrentUser(userFromDb);

      // 3. Cập nhật API (chạy nền)
      // Sử dụng user.id (local ID như U026) để gọi API
      console.log("🔍 Kiểm tra ID của user:", {
        id: userFromDb.id,
        typeOf: typeof userFromDb.id,
        hasId: !!userFromDb.id,
      });

      if (userFromDb.id) {
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔄 BẮT ĐẦU ĐỒNG BỘ LÊN API");
        console.log("   User ID:", userFromDb.id);
        console.log("   Username:", userFromDb.username);

        // Chuẩn bị dữ liệu để gửi lên API
        const apiPayload = {
          ...userFromDb,
          // Đảm bảo cart có đúng cấu trúc API mong đợi
          cart:
            userFromDb.cart?.map((cartItem) => ({
              item: cartItem.item,
              quantity: cartItem.quantity,
              // Không gửi _id nếu đang tạo mới item trong cart
            })) || [],
        };

        console.log("   Cart để đồng bộ:", apiPayload.cart);
        console.log(
          "   API URL:",
          `https://food-delivery-mobile-app.onrender.com/users/${userFromDb.id}`
        );

        const apiSuccess = await apiService.updateUserOnApi(
          userFromDb.id, // Đổi từ _id sang id
          apiPayload
        );

        if (!apiSuccess) {
          console.error("❌ ĐỒNG BỘ API THẤT BẠI!");
          console.error("   Local data đã được lưu, nhưng API chưa cập nhật");
          console.error("   ⚠️ Kiểm tra xem user ID tồn tại trên API không");
        } else {
          console.log("✅✅✅ ĐỒNG BỘ USER LÊN API THÀNH CÔNG! ✅✅✅");
        }
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      } else {
        console.warn("⚠️ User không có ID, không thể đồng bộ API.");
      }
    } catch (err) {
      console.error("Edit user error:", err);
      setCurrentUser(oldUser); // Rollback nếu có lỗi
    }
  };

  // 6. Cập nhật giỏ hàng (sử dụng 'editUser')
  const updateCart = async (newCart: CartItemSimple[]) => {
    console.log("🛒 Updating cart with items:", newCart.length);
    await editUser({ cart: newCart });
    console.log("✅ Cart updated successfully");
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
