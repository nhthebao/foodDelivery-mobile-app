import AsyncStorage from "@react-native-async-storage/async-storage";
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

// 🔧 Helper function: Map Firebase error codes to user-friendly Vietnamese messages
const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    // Authentication errors
    "auth/invalid-email": "Email không hợp lệ",
    "auth/user-disabled": "Tài khoản đã bị vô hiệu hóa",
    "auth/user-not-found": "Tài khoản không tồn tại",
    "auth/wrong-password": "Mật khẩu không đúng",
    "auth/invalid-credential": "Thông tin đăng nhập không đúng",
    "auth/too-many-requests": "Quá nhiều lần thử. Vui lòng thử lại sau",
    "auth/network-request-failed":
      "Lỗi kết nối mạng. Vui lòng kiểm tra internet",
    "auth/operation-not-allowed": "Phương thức đăng nhập không được phép",
    "auth/weak-password": "Mật khẩu quá yếu (tối thiểu 6 ký tự)",
    "auth/email-already-in-use": "Email đã được sử dụng",
    "auth/invalid-verification-code": "Mã xác thực không đúng",
    "auth/invalid-verification-id": "Mã xác thực không hợp lệ",
    "auth/missing-verification-code": "Vui lòng nhập mã xác thực",
    "auth/session-expired": "Phiên đăng nhập đã hết hạn",
  };

  return errorMessages[errorCode] || "Đã xảy ra lỗi không xác định";
};

interface CurrentUserContextType {
  currentUser: User | null;
  isLoading: boolean;
  // Accept either username OR email as the first argument. The implementation
  // will resolve the real email from the API when a username is provided.
  login: (identifier: string, password: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: {
    fullName: string;
    phone: string;
    address: string;
    username: string;
    email: string;
    password: string;
    paymentMethod: string;
    image: string;
  }) => Promise<boolean>;
  updateCart: (newCart: CartItemSimple[]) => Promise<void>;
  editUser: (updatedData: Partial<User>) => Promise<void>;
  // forceLogin: (username: string) => Promise<boolean>;
  jwtToken: string | null; // JWT token từ server
}

const CurrentUserContext = createContext<CurrentUserContextType | null>(null);

export const CurrentUserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  // JWT Token Storage Functions
  const storeJwtToken = async (token: string) => {
    try {
      await AsyncStorage.setItem("jwtToken", token);
      setJwtToken(token);
      console.log("✅ JWT token stored");
    } catch (err) {
      console.error("❌ Error storing JWT:", err);
    }
  };

  const getJwtToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (token) {
        setJwtToken(token);
      }
      return token;
    } catch (err) {
      console.error("❌ Error retrieving JWT:", err);
      return null;
    }
  };

  const clearJwtToken = async () => {
    try {
      await AsyncStorage.removeItem("jwtToken");
      setJwtToken(null);
      console.log("✅ JWT token cleared");
    } catch (err) {
      console.error("❌ Error clearing JWT:", err);
    }
  };

  // 🟢 Theo dõi trạng thái đăng nhập Firebase + restore JWT
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Load JWT token từ storage
        const savedToken = await getJwtToken();
        if (savedToken) {
          console.log("✅ Restored JWT token from storage");
        }
      } catch (err) {
        console.error("❌ Error initializing auth:", err);
      }
    };

    initializeAuth();

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

  // 🟢 Đăng ký - tạo Firebase account → server tự tạo user via /auth/login
  // Server auto-create user nếu Firebase token lần đầu tiên
  const register = async (userData: {
    fullName: string;
    phone: string;
    address: string;
    username: string;
    email: string;
    password: string;
    paymentMethod: string;
    image: string;
  }): Promise<boolean> => {
    try {
      // 1️⃣ Tạo user trên Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const firebaseUser = userCredential.user;
      if (!firebaseUser?.uid) throw new Error("Firebase user không hợp lệ");

      // 2️⃣ Lấy Firebase token
      const firebaseToken = await firebaseUser.getIdToken();

      // 3️⃣ Gọi server /auth/login (server auto-create user nếu chưa tồn tại)
      // ✅ Truyền username, fullName, phone, address để server lưu đúng
      const result = await apiService.loginWithFirebase(
        firebaseToken,
        userData.username, // ✅ Username từ user input
        userData.fullName, // ✅ Full name từ user input
        userData.phone, // ✅ Phone từ user input
        userData.address // ✅ Address từ user input
      );
      if (!result) throw new Error("Không thể đăng ký trên server");

      setCurrentUser(result.user);
      await storeJwtToken(result.token);
      console.log("✅ Đăng ký thành công:", result.user.username);
      return true;
    } catch (err: any) {
      console.error("❌ Lỗi khi đăng ký:", err);
      return false;
    }
  };

  // 🟢 Đăng nhập với Google (Firebase token)
  const loginWithGoogle = async (firebaseToken: string): Promise<boolean> => {
    try {
      console.log("🔐 Attempting Google login with Firebase token");

      // Gọi server /auth/login với Firebase token từ Google Auth
      const result = await apiService.loginWithFirebase(firebaseToken);
      if (!result) throw new Error("Không thể kết nối đến máy chủ");

      setCurrentUser(result.user);
      await storeJwtToken(result.token);
      console.log("✅ Google login thành công:", result.user.username);
      return true;
    } catch (err: any) {
      console.log("❌ Lỗi Google login:", err?.message);
      throw new Error(err?.message || "Google login thất bại");
    }
  };

  // 🟢 Đăng nhập - verify Firebase + lấy JWT từ server
  const login = async (
    identifier: string,
    password: string
  ): Promise<boolean> => {
    try {
      let email = identifier;

      // Nếu identifier không phải email, cần fetch email từ server trước
      if (!identifier.includes("@")) {
        console.log("🔍 Resolving identifier to email:", identifier);
        // Thử username trước
        let user = await apiService.getUserByUsername(identifier);

        // Nếu không tìm thấy, thử phone
        if (!user) {
          console.log("⚠️ Username not found, trying phone:", identifier);
          user = await apiService.getUserByPhone(identifier);
        }

        if (!user) {
          console.log("❌ User not found - username/phone:", identifier);
          throw new Error("Tên đăng nhập hoặc số điện thoại không tồn tại");
        }
        email = user.email;
        console.log("✅ Resolved to email:", email);
      }

      console.log("🔐 Attempting Firebase login with email:", email);
      // 1️⃣ Đăng nhập Firebase để lấy token
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;
      if (!firebaseUser) throw new Error("Đăng nhập thất bại");

      console.log("✅ Firebase login successful, uid:", firebaseUser.uid);
      // 2️⃣ Lấy Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();
      console.log("🔓 Got Firebase ID token");

      // 3️⃣ Gọi server /auth/login để lấy JWT + user data
      const result = await apiService.loginWithFirebase(firebaseToken);
      if (!result) throw new Error("Không thể kết nối đến máy chủ");

      setCurrentUser(result.user);
      await storeJwtToken(result.token);
      console.log("✅ Đăng nhập thành công:", result.user.username);
      return true;
    } catch (err: any) {
      // ⚠️ Use console.log instead of console.error to avoid red screen in dev mode
      console.log("❌ Lỗi đăng nhập:", err?.code || err?.message);

      // Map Firebase error codes to user-friendly messages
      if (err?.code) {
        const friendlyMessage = getFirebaseErrorMessage(err.code);
        throw new Error(friendlyMessage);
      }

      // If not a Firebase error, throw the original error message
      throw new Error(err?.message || "Đã xảy ra lỗi không xác định");
    }
  };

  // 🟢 Đăng xuất
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      await clearJwtToken();
    } catch (err) {
      console.error("❌ Lỗi đăng xuất:", err);
      setCurrentUser(null);
      await clearJwtToken();
    }
  };

  // 🟢 Cập nhật thông tin user (với JWT token)
  const editUser = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    if (!jwtToken) {
      console.warn("⚠️ Không có JWT token, không thể cập nhật user");
      return;
    }

    const merged = {
      ...currentUser,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    try {
      const updated = await apiService.updateUserProfile(jwtToken, updatedData);
      if (updated) {
        setCurrentUser(updated);
      }
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
        loginWithGoogle,
        register,
        logout,
        editUser,
        updateCart,
        jwtToken,
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
