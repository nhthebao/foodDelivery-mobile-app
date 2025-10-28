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
 * (Cập nhật để xử lý đúng cấu trúc cart với API)
 */
export const updateUserOnApi = async (
    userId: string,
    updatedData: User
): Promise<boolean> => {
    try {
        console.log("📤 Gửi request PUT lên API...");
        console.log("   URL:", `${API_URL}/${userId}`);

        // Chuẩn bị payload để gửi lên API
        // Loại bỏ các field không cần thiết và đảm bảo cart có đúng format
        const payload = {
            ...updatedData,
            // Đảm bảo cart chỉ có item và quantity (API sẽ tự tạo _id)
            cart: updatedData.cart?.map((cartItem) => ({
                item: cartItem.item,
                quantity: cartItem.quantity,
            })) || [],
            // Loại bỏ id local (chỉ giữ _id của MongoDB)
            id: undefined,
        };

        console.log("   Cart items:", payload.cart.length);
        console.log("   Payload:", JSON.stringify(payload, null, 2));

        const res = await fetch(`${API_URL}/${userId}`, {
            method: "PUT",
            headers: JSON_HEADERS,
            body: JSON.stringify(payload),
        });

        console.log("📥 Response status:", res.status, res.statusText);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ Update API error:", res.status, errorText);
            return false;
        }

        const responseData = await res.json();
        console.log("✅ API update successful!");
        console.log("   Updated user:", responseData);
        return true;
    } catch (err) {
        console.error("❌ Update API network error:", err);
        return false;
    }
};