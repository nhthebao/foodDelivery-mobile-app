import { User } from "../types/types"; // (Hãy đảm bảo đường dẫn này đúng)

const API_URL = "https://food-delivery-mobile-app.onrender.com/users";

// (MỚI) 1. Định nghĩa headers dùng chung cho các yêu cầu JSON
const JSON_HEADERS = {
    "Content-Type": "application/json",
};

/**
 * 2. Đăng nhập (Login)
 * (Logic này vẫn giữ nguyên, vì nó là một yêu cầu GET đơn giản)
 */
export const loginOnApi = async (
    username: string,
    password: string
): Promise<User | null> => {
    try {
        const res = await fetch(API_URL); // Yêu cầu GET
        if (!res.ok) {
            console.error("Login API error: Failed to fetch users", res.status);
            return null;
        }

        const data: User[] = await res.json();
        const found = data.find(
            (u) => u.username === username && u.password === password
        );

        return found || null;
    } catch (err) {
        console.error("Login API network error:", err);
        return null;
    }
};

/**
 * 3. Đăng ký (Register)
 * (Sử dụng headers chung)
 */
export const registerOnApi = async (
    userData: Omit<User, "id" | "_id" | "cart" | "favorite" | "image">
): Promise<User | null> => {

    const newUserPayload = {
        ...userData,
        cart: [],
        favorite: [],
        image: "https://randomuser.me/api/portraits/lego/1.jpg",
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: JSON_HEADERS, // <-- Đã đơn giản hóa
            body: JSON.stringify(newUserPayload),
        });

        if (!res.ok) {
            console.error("Register API error:", res.status, await res.text());
            return null;
        }

        // API nên trả về user vừa được tạo
        return res.json();
    } catch (err) {
        console.error("Register API network error:", err);
        return null;
    }
};

/**
 * 4. Cập nhật User (Update)
 * (Sử dụng headers chung)
 */
export const updateUserOnApi = async (
    userId: string,
    updatedData: User
): Promise<boolean> => {
    try {
        const res = await fetch(`${API_URL}/${userId}`, {
            method: "PUT",
            headers: JSON_HEADERS, // <-- Đã đơn giản hóa
            body: JSON.stringify(updatedData),
        });

        if (!res.ok) {
            console.error("Update API error:", res.status, await res.text());
        }
        return res.ok;
    } catch (err) {
        console.error("Update API network error:", err);
        return false;
    }
};