// services/paymentServices.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://food-delivery-mobile-app.onrender.com";

// Kiểm tra trạng thái thanh toán của đơn hàng
export const checkPaymentStatus = async (orderId: string, retryCount: number = 0): Promise<{
    success: boolean;
    orderId?: string;
    paymentStatus?: string;
    orderStatus?: string;
    finalAmount?: number;
    paymentTransaction?: any;
    notFound?: boolean;
    error?: string;
    timeout?: boolean;
}> => {
    try {
        const token = await AsyncStorage.getItem("jwtToken");

        console.log(`🔍 Checking payment status for order: ${orderId} (attempt ${retryCount + 1})`);
        console.log(`🌐 API URL: ${API_BASE_URL}/payment/status/${orderId}`);

        // ✅ Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(`${API_BASE_URL}/payment/status/${orderId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            // ✅ Handle 404 - Order not found (might be created later)
            if (response.status === 404) {
                console.warn(`⚠️ Order not found on server: ${orderId}`);
                return {
                    success: true,
                    orderId: orderId,
                    paymentStatus: "unpaid",
                    orderStatus: "pending",
                    finalAmount: 0,
                    paymentTransaction: null,
                    notFound: true,
                };
            }

            // ✅ Handle 502/503 - Server error, retry once
            if ((response.status === 502 || response.status === 503) && retryCount < 2) {
                console.warn(`⚠️ Server error (${response.status}), retrying in 3s...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                return checkPaymentStatus(orderId, retryCount + 1);
            }

            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log(`✅ ========== PAYMENT STATUS RESPONSE ==========`);
        console.log(`📋 Order ID: ${orderId}`);
        console.log(`💳 Payment Status: ${data.paymentStatus}`);
        console.log(`📦 Order Status: ${data.status}`);
        console.log(`💰 Final Amount: ${data.finalAmount} VND`);
        console.log(`🏦 Transaction:`, data.paymentTransaction || 'None');
        console.log(`================================================`);

        return {
            success: true,
            orderId: data.orderId,
            paymentStatus: data.paymentStatus,
            orderStatus: data.status,
            finalAmount: data.finalAmount,
            paymentTransaction: data.paymentTransaction,
        };
    } catch (error) {
        // ✅ Handle timeout errors
        if (error instanceof Error && error.name === 'AbortError') {
            console.error("❌ Request timeout:", orderId);

            // Retry once on timeout
            if (retryCount < 1) {
                console.log("🔄 Retrying after timeout...");
                await new Promise(resolve => setTimeout(resolve, 2000));
                return checkPaymentStatus(orderId, retryCount + 1);
            }

            return {
                success: false,
                error: "Request timeout",
                timeout: true,
            };
        }

        console.error("❌ Error checking payment status:", error);
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
    const maxAttempts = 120; // Tăng từ 60 → 120 (10 phút)
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5; // Tăng từ 3 → 5

    const startTime = Date.now();
    console.log(`🚀 [Payment Polling Started] Order: ${orderId}`);
    console.log(`⏱️ Max attempts: ${maxAttempts}, Interval: 3s, Total time: ${maxAttempts * 3 / 60} minutes`);

    currentPollingInterval = setInterval(async () => {
        attempts++;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        console.log(`🔄 [${attempts}/${maxAttempts}] (${elapsed}s) Polling payment for: ${orderId}`);

        const result = await checkPaymentStatus(orderId);

        // ✅ Handle success
        if (result.success) {
            consecutiveErrors = 0; // Reset error counter on success

            // Check if order was not found (404)
            if ((result as any).notFound && attempts === 1) {
                console.warn(`⚠️ Order not found on server. This may indicate:`);
                console.warn(`   1. Order creation failed on server`);
                console.warn(`   2. OrderId mismatch between app and server`);
                console.warn(`   Will continue polling in case order is created later...`);
            }

            onStatusChange({
                paymentStatus: result.paymentStatus || "unpaid",
                orderStatus: result.orderStatus || "pending",
            });

            if (result.paymentStatus === "paid") {
                const totalTime = Math.floor((Date.now() - startTime) / 1000);
                console.log(`✅ ========== PAYMENT CONFIRMED ==========`);
                console.log(`✅ Order: ${orderId}`);
                console.log(`✅ Total time: ${totalTime}s (${attempts} attempts)`);
                console.log(`✅ Transaction:`, result.paymentTransaction);
                console.log(`✅ ========================================`);
                stopPaymentPolling();
                onSuccess();
                return;
            }
        } else {
            // ✅ Handle errors
            consecutiveErrors++;
            console.error(`❌ Error in polling (${consecutiveErrors}/${maxConsecutiveErrors}):`, result.error);

            // Stop polling if too many consecutive errors
            if (consecutiveErrors >= maxConsecutiveErrors) {
                console.error(`❌ Too many consecutive errors (${consecutiveErrors}). Stopping polling.`);
                stopPaymentPolling();
                onTimeout();
                return;
            }
        }

        // ✅ Timeout after max attempts
        if (attempts >= maxAttempts) {
            const totalTime = Math.floor((Date.now() - startTime) / 1000);
            console.log(`⏱️ ========== POLLING TIMEOUT ==========`);
            console.log(`⏱️ Order: ${orderId}`);
            console.log(`⏱️ Total time: ${totalTime}s (${maxAttempts} attempts)`);
            console.log(`⏱️ Last status: ${result.success ? result.paymentStatus : 'error'}`);
            console.log(`⏱️ ======================================`);
            stopPaymentPolling();
            onTimeout();
        }
    }, 3000); // Giảm từ 5s → 3s để check nhanh hơn

    return currentPollingInterval;
};

export const stopPaymentPolling = () => {
    if (currentPollingInterval) {
        clearInterval(currentPollingInterval);
        currentPollingInterval = null;
        console.log("⏹️ Payment polling stopped");
    }
};
