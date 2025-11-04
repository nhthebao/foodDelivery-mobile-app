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

export const getUserByUsername = async (
    username: string
): Promise<User | null> => {
    try {
        const res = await axios.get(`${API_URL}?username=${username}`);
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
 * 🔹 2. Đăng ký user mới trên server
 * (đăng ký Firebase xong thì gọi hàm này để sync thông tin user)
 */
export const registerOnApi = async (
    userData: Omit<User, "id" | "_id" | "cart" | "favorite" | "image">
): Promise<User | null> => {
    const payload = {
        ...userData,
        authProvider: "firebase",
        cart: [],
        favorite: [],
        image:
            "https://res.cloudinary.com/dxx0dqmn8/image/upload/v1761622331/default_user_avatar.png",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error("Register API error:", res.status, await res.text());
            return null;
        }

        return res.json();
    } catch (err) {
        console.error("Register API network error:", err);
        return null;
    }
};

/**
 * 🔹 3. Cập nhật thông tin User
 */
export const updateUserOnApi = async (
    userId: string,
    updatedData: Partial<User>
): Promise<boolean> => {
    try {
        const payload = {
            ...updatedData,
            updatedAt: new Date().toISOString(),
        };

        const res = await fetch(`${API_URL}/${userId}`, {
            method: "PUT",
            headers: JSON_HEADERS,
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error("❌ Update API error:", res.status, await res.text());
            return false;
        }

        return true;
    } catch (err) {
        console.error("❌ Update API network error:", err);
        return false;
    }
};

/**
 * 🔹 4. (Tuỳ chọn) Lấy toàn bộ user — chỉ dùng khi admin / debug
 */
export const getAllUsers = async (): Promise<User[]> => {
    try {
        const res = await axios.get(API_URL);
        return res.data;
    } catch (error) {
        console.error("❌ Lỗi getAllUsers:", error);
        return [];
    }
};

/**
 * 🔹 5. Đăng ký người dùng mới (gọi từ màn đăng ký)
 *  => Tự động gọi Firebase và sync lên MockAPI
 */
export const register = async (values: {
    fullName: string;
    phone: string;
    address: string;
    username: string;
    email: string;
    password: string;
    paymentMethod: string;
}) => {
    try {
        const user = await registerOnApi({
            fullName: values.fullName.trim(),
            phone: values.phone.trim(),
            address: values.address.trim(),
            username: values.username.trim(),
            email: values.email.trim(),
            authProvider: "firebase",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            paymentMethod: values.paymentMethod,
        });

        return user;
    } catch (error) {
        console.error("❌ Lỗi register:", error);
        return null;
    }
};
