import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth } from "../firebase/firebaseConfig";
import * as apiService from "../services/apiUserServices";
import { CartItemSimple, User } from "../types/types";

interface CurrentUserContextType {
  currentUser: User | null;
  isLoading: boolean;
  // Accept either username OR email as the first argument. The implementation
  // will resolve the real email from the API when a username is provided.
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: {
    fullName: string;
    phone: string;
    address: string;
    username: string;
    email: string;
    password: string;
    paymentMethod: string;
  }) => Promise<boolean>;
  updateCart: (newCart: CartItemSimple[]) => Promise<void>;
  editUser: (updatedData: Partial<User>) => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextType | null>(null);

export const CurrentUserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 Theo dõi trạng thái đăng nhập Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Debug + more robust lookup: normalize email and try fallback to username
      if (firebaseUser) {
        console.log("🔔 onAuthStateChanged - firebaseUser:", {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        });
      }

      if (firebaseUser && firebaseUser.email) {
        try {
          const normalizedEmail = firebaseUser.email.trim().toLowerCase();
          console.log("🔍 Tìm user theo email (normalized):", normalizedEmail);

          let userFromApi = await apiService.getUserByEmail(normalizedEmail);

          if (!userFromApi) {
            // Fallback: try username derived from the email prefix
            const usernameCandidate = normalizedEmail.split("@")[0];
            console.warn(
              "⚠️ User không tìm thấy theo email, thử tìm theo username:",
              usernameCandidate
            );
            userFromApi = await apiService.getUserByUsername(usernameCandidate);
            if (userFromApi) {
              console.log(
                "✅ Tìm thấy user theo username fallback:",
                userFromApi.id
              );
            }
          }

          if (!userFromApi) {
            console.log("📭 Chưa có user trong API cho Firebase user này");
            setCurrentUser(null);
          } else {
            setCurrentUser(userFromApi);
          }
        } catch (err) {
          console.error("❌ Lỗi load user từ server:", err);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  // 🟢 Đăng ký Firebase + lưu user lên server
  const register = async (userData: {
    fullName: string;
    phone: string;
    address: string;
    username: string;
    email: string;
    password: string;
    paymentMethod: string;
  }): Promise<boolean> => {
    try {
      // 0️⃣ Kiểm tra trùng username / email trên server
      const existingUser = await apiService.getUserByUsername(
        userData.username
      );
      const existingEmail = await apiService.getUserByEmail(userData.email);

      if (existingUser || existingEmail) {
        console.warn("⚠️ Username hoặc Email đã tồn tại!");
        return false;
      }

      // 1️⃣ Tạo user trên Firebase để xác thực
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const firebaseUser = userCredential.user;
      if (!firebaseUser?.uid) throw new Error("Firebase user không hợp lệ");

      // 2️⃣ Chuẩn bị dữ liệu gửi lên server
      const newUserPayload: User = {
        id: firebaseUser.uid, // ✅ sử dụng UID của Firebase làm id
        fullName: userData.fullName.trim(),
        username: userData.username.trim(),
        email: userData.email.trim(),
        phone: userData.phone.trim(),
        address: userData.address.trim(),
        authProvider: "firebase",
        paymentMethod: userData.paymentMethod || "momo",
        image:
          "https://res.cloudinary.com/dxx0dqmn8/image/upload/v1761622331/default_user_avatar.png",
        favorite: [],
        cart: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 3️⃣ Gửi dữ liệu user lên server (MongoDB)
      const newUser = await apiService.registerOnApi(newUserPayload);
      if (!newUser) throw new Error("Không thể lưu user lên server");

      setCurrentUser(newUser);
      return true;
    } catch (err: any) {
      console.error("❌ Lỗi khi đăng ký:", err);
      if (err.code === "auth/email-already-in-use") {
        console.warn("⚠️ Firebase báo email đã tồn tại");
      }
      return false;
    }
  };

  // 🟢 Đăng nhập bằng username + password
  const login = async (
    identifier: string,
    password: string
  ): Promise<boolean> => {
    try {
      // If identifier looks like an email, try to fetch user by email.
      // Otherwise treat it as username and fetch by username.
      let userFromApi: User | null = null;

      if (identifier.includes("@")) {
        userFromApi = await apiService.getUserByEmail(identifier);
        if (!userFromApi) throw new Error("Không tìm thấy email trên server");
      } else {
        userFromApi = await apiService.getUserByUsername(identifier);
        if (!userFromApi)
          throw new Error("Không tìm thấy username trên server");
      }

      // Use the real email from the API to sign in to Firebase
      await signInWithEmailAndPassword(auth, userFromApi.email, password);

      // Save to context
      setCurrentUser(userFromApi);
      return true;
    } catch (err) {
      console.error("❌ Lỗi đăng nhập:", err);
      return false;
    }
  };

  // 🟢 Đăng xuất
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (err) {
      console.error("❌ Lỗi đăng xuất:", err);
      setCurrentUser(null);
    }
  };

  // 🟢 Cập nhật thông tin user
  const editUser = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const merged = {
      ...currentUser,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    try {
      await apiService.updateUserOnApi(currentUser.id, merged);
      setCurrentUser(merged);
    } catch (err) {
      console.error("❌ Lỗi cập nhật user:", err);
    }
  };

  // 🟢 Cập nhật giỏ hàng
  const updateCart = async (newCart: CartItemSimple[]) => {
    await editUser({ cart: newCart });
  };

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
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (!context)
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return context;
};
