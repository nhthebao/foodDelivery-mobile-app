// services/paymentServices.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://food-delivery-mobile-app.onrender.com";

// Kiểm tra trạng thái thanh toán của đơn hàng
export const checkPaymentStatus = async (orderId: string) => {
    try {
        const token = await AsyncStorage.getItem("jwtToken");

        const response = await fetch(`${API_BASE_URL}/payment/status/${orderId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            orderId: data.orderId,
            paymentStatus: data.paymentStatus,
            orderStatus: data.status,
            finalAmount: data.finalAmount,
            paymentTransaction: data.paymentTransaction,
        };
    } catch (error) {
        console.error("Error checking payment status:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

// Polling - Kiểm tra thanh toán định kỳ (mỗi 5 giây)
export const pollPaymentStatus = async (
    orderId: string,
    onStatusChange: (status: {
        paymentStatus: string;
        orderStatus: string;
    }) => void,
    maxAttempts: number = 60 // 60 attempts x 5s = 5 phút
): Promise<boolean> => {
    let attempts = 0;

    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            attempts++;

            console.log(
                `[Payment Polling] Attempt ${attempts}/${maxAttempts} for order ${orderId}`
            );

            const result = await checkPaymentStatus(orderId);

            if (result.success) {
                onStatusChange({
                    paymentStatus: result.paymentStatus || "unpaid",
                    orderStatus: result.orderStatus || "pending",
                });

                // Nếu đã thanh toán thành công
                if (result.paymentStatus === "paid") {
                    clearInterval(interval);
                    console.log("✅ Payment confirmed!");
                    resolve(true);
                    return;
                }
            }

            // Hết số lần thử
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.log("⏱️ Payment polling timeout");
                resolve(false);
            }
        }, 5000); // Kiểm tra mỗi 5 giây
    });
};

// Tạo thông tin thanh toán (để lấy QR content)
export const createPaymentInfo = async (orderId: string) => {
    try {
        const token = await AsyncStorage.getItem("jwtToken");

        const response = await fetch(`${API_BASE_URL}/payment/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ orderId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            paymentInfo: data.paymentInfo,
            qrContent: data.qrContent,
        };
    } catch (error) {
        console.error("Error creating payment info:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

// Stop polling (để dừng khi user đóng modal)
let currentPollingInterval: ReturnType<typeof setInterval> | null = null;

export const startPaymentPolling = (
    orderId: string,
    onStatusChange: (status: {
        paymentStatus: string;
        orderStatus: string;
    }) => void,
    onSuccess: () => void,
    onTimeout: () => void
) => {
    let attempts = 0;
    const maxAttempts = 60;

    currentPollingInterval = setInterval(async () => {
        attempts++;

        const result = await checkPaymentStatus(orderId);

        if (result.success) {
            onStatusChange({
                paymentStatus: result.paymentStatus || "unpaid",
                orderStatus: result.orderStatus || "pending",
            });

            if (result.paymentStatus === "paid") {
                stopPaymentPolling();
                onSuccess();
                return;
            }
        }

        if (attempts >= maxAttempts) {
            stopPaymentPolling();
            onTimeout();
        }
    }, 5000);

    return currentPollingInterval;
};

export const stopPaymentPolling = () => {
    if (currentPollingInterval) {
        clearInterval(currentPollingInterval);
        currentPollingInterval = null;
        console.log("⏹️ Payment polling stopped");
    }
};
