import axios from "axios";
import { User } from "../types/types";

const API_URL = "https://food-delivery-mobile-app.onrender.com/users";

const JSON_HEADERS = {
    "Content-Type": "application/json",
};

/**
 * 🔹 1. Lấy User theo email (Firebase login dùng cái này)
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
        const url = `${API_URL}?email=${encodeURIComponent(email)}`;
        const res = await axios.get(url);
        console.log("🔗 GET", url, "status:", res.status, "items:", Array.isArray(res.data) ? res.data.length : 0);
        if (res.data && res.data.length > 0) {
            return res.data[0]; // MockAPI trả mảng => lấy phần tử đầu tiên
        }
        return null;
    } catch (error) {
        console.error("❌ Lỗi getUserByEmail:", error);
        return null;
    }
};

/**
 * 🔹 1.1. Lấy User theo ID (Firebase UID)
 */
export const getUserById = async (userId: string): Promise<User | null> => {
    try {
        const url = `${API_URL}?id=${encodeURIComponent(userId)}`;
        const res = await axios.get(url);
        console.log("🔗 GET by ID", url, "status:", res.status);
        if (res.data && res.data.length > 0) {
            return res.data[0];
        }
        return null;
    } catch (error) {
        console.error("❌ Lỗi getUserById:", error);
        return null;
    }
};

export const getUserByUsername = async (
    username: string
): Promise<User | null> => {
    try {
        const normalizedUsername = username.toLowerCase().trim();
        const res = await axios.get(`${API_URL}?username=${encodeURIComponent(normalizedUsername)}`);

        if (res.data && res.data.length > 0) {
            return res.data[0];
        }
        return null;
    } catch (error) {
        console.error("❌ Lỗi getUserByUsername:", error);
        return null;
    }
};

/**
 * 🔹 1.3. Lấy User theo phone
 */
export const getUserByPhone = async (phone: string): Promise<User | null> => {
    try {
        const res = await axios.get(`${API_URL}?phone=${phone}`);
        if (res.data && res.data.length > 0) {
            return res.data[0];
        }
        return null;
    } catch (error) {
        console.error("❌ Lỗi getUserByPhone:", error);
        return null;
    }
};

/**
 * 🔹 Firebase Auth - Login/Register qua Firebase token
 * Server xác minh Firebase token → auto-create user nếu chưa tồn tại
 * → Gửi JWT token + user data về client
 * 
 * @param firebaseToken Firebase ID token từ Firebase Auth
 * @param username Username (optional, dùng khi register)
 * @param fullName Full name (optional, dùng khi register)
 * @param phone Phone number (optional, dùng khi register)
 * @param address Address (optional, dùng khi register)
 */
export const loginWithFirebase = async (
    firebaseToken: string,
    username?: string,
    fullName?: string,
    phone?: string,
    address?: string
): Promise<{ token: string; user: User } | null> => {
    try {
        console.log("🔑 Firebase Token:", firebaseToken);
        const AUTH_API = "https://food-delivery-mobile-app.onrender.com/auth/login";
        const payload: any = { firebaseToken };

        // ✅ Truyền user data nếu có (register flow)
        if (username) payload.username = username;
        if (fullName) payload.fullName = fullName;
        if (phone) payload.phone = phone;
        if (address) payload.address = address;

        const res = await axios.post(AUTH_API, payload, { headers: JSON_HEADERS });
        console.log("✅ Firebase login/register success:", res.data);
        return {
            token: res.data.token,
            user: res.data.user,
        };
    } catch (error: any) {
        console.error("❌ Lỗi Firebase login/register:", error.response?.data || error.message);
        return null;
    }
};



/**
 * 🔹 Lấy thông tin user hiện tại (cần JWT token)
 */
export const getCurrentUser = async (token: string): Promise<User | null> => {
    try {
        const AUTH_API = "https://food-delivery-mobile-app.onrender.com/auth/me";
        const res = await axios.get(AUTH_API, {
            headers: {
                ...JSON_HEADERS,
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("✅ Got current user:", res.data);
        return res.data;
    } catch (error: any) {
        console.error("❌ Lỗi getCurrentUser:", error.response?.data || error.message);
        return null;
    }
};

/**
 * 🔹 Cập nhật profile user
 */
export const updateUserProfile = async (
    token: string,
    updates: Partial<User>
): Promise<User | null> => {
    try {
        const AUTH_API = "https://food-delivery-mobile-app.onrender.com/auth/update-profile";
        const res = await axios.put(AUTH_API, updates, {
            headers: {
                ...JSON_HEADERS,
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("✅ Profile updated:", res.data);
        return res.data.user;
    } catch (error: any) {
        console.error("❌ Lỗi updateUserProfile:", error.response?.data || error.message);
        return null;
    }
};

/**
 * 🔹 Logout
 */
export const logoutUser = async (token: string): Promise<boolean> => {
    try {
        const AUTH_API = "https://food-delivery-mobile-app.onrender.com/auth/logout";
        await axios.post(AUTH_API, {}, {
            headers: {
                ...JSON_HEADERS,
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("✅ Logged out");
        return true;
    } catch (error: any) {
        console.error("❌ Lỗi logout:", error.response?.data || error.message);
        return false;
    }
};

/**
 * 🔹 Request Password Reset Code
 * For EMAIL: Gửi link reset (không cần verify)
 * For PHONE: Gửi mã OTP (cần verify)
 */
export const requestPasswordResetCode = async (
    method: "email" | "phone",
    identifier: string
): Promise<{
    resetId: string
    requiresVerification: boolean
    expiresIn: number
    debug_otp?: string
    phoneNumber?: string
} | null> => {
    try {
        const AUTH_API =
            "https://food-delivery-mobile-app.onrender.com/auth/password/request-reset";
        const res = await axios.post(
            AUTH_API,
            { method, identifier },
            { headers: JSON_HEADERS }
        );
        console.log("✅ Reset code sent:", res.data);
        console.log("✅ Reset ID:", res.data.resetId);
        console.log("📋 Debug OTP (test):", res.data.debug_otp);

        return {
            resetId: res.data.resetId,
            requiresVerification: res.data.requiresVerification,
            expiresIn: res.data.expiresIn,
            debug_otp: res.data.debug_otp, // ✅ Thêm debug_otp
            phoneNumber: res.data.phoneNumber, // ✅ Thêm phoneNumber
        };
    } catch (error: any) {
        console.error(
            "❌ Lỗi request reset code:",
            error.response?.data || error.message
        );
        return null;
    }
};

/**
 * 🔹 Verify Password Reset Code
 * Xác thực code + lấy temporary token
 */
export const verifyPasswordResetCode = async (
    resetId: string,
    code: string
): Promise<{ temporaryToken: string } | null> => {
    try {
        const AUTH_API =
            "https://food-delivery-mobile-app.onrender.com/auth/password/verify-reset-code";
        const res = await axios.post(
            AUTH_API,
            { resetId, code },
            { headers: JSON_HEADERS }
        );
        console.log("✅ Reset code verified:", res.data);
        return {
            temporaryToken: res.data.temporaryToken,
        };
    } catch (error: any) {
        console.error(
            "❌ Lỗi verify reset code:",
            error.response?.data || error.message
        );
        return null;
    }
};

/**
 * 🔹 Change Password with Reset Token
 * Cập nhật password bằng temporary token
 */
export const changePasswordWithResetToken = async (
    temporaryToken: string,
    newPassword: string
): Promise<boolean> => {
    try {
        const AUTH_API =
            "https://food-delivery-mobile-app.onrender.com/auth/password/change-password";
        const res = await axios.post(
            AUTH_API,
            { temporaryToken, newPassword },
            { headers: JSON_HEADERS }
        );
        console.log("✅ Password changed:", res.data);
        return true;
    } catch (error: any) {
        console.error(
            "❌ Lỗi change password:",
            error.response?.data || error.message
        );
        return false;
    }
};

/**
 * 🔹 Change Password (Logged In User)
 * Thay đổi mật khẩu khi user đã đăng nhập
 * Xác thực mật khẩu cũ trước khi thay
 */
export const changePasswordLoggedIn = async (
    jwt: string,
    oldPassword: string,
    newPassword: string
): Promise<boolean> => {
    try {
        const AUTH_API =
            "https://food-delivery-mobile-app.onrender.com/auth/password/change-logged-in";
        const res = await axios.post(
            AUTH_API,
            { oldPassword, newPassword },
            {
                headers: {
                    ...JSON_HEADERS,
                    Authorization: `Bearer ${jwt}`,
                },
            }
        );
        console.log("✅ Password changed successfully:", res.data);
        return true;
    } catch (error: any) {
        console.error(
            "❌ Lỗi change password:",
            error.response?.data || error.message
        );
        return false;
    }
};
