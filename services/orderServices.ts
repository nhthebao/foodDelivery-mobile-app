import * as SQLite from "expo-sqlite";

// ==============================
// 📦 Order Types
// ==============================
export interface OrderItem {
    dessertId: string; // ID món ăn (required by server)
    name: string;
    price: number;
    quantity: number;
}

export interface DeliveryAddress {
    fullAddress: string;
    phone: string;
}

export interface PaymentTransaction {
    transactionId?: string;
    gateway?: string;
    transactionDate?: string;
    amount?: number;
    referenceNumber?: string;
    bankBrand?: string;
    content?: string;
    description?: string;
    subAccount?: string;
}

export interface Order {
    _id?: string; // MongoDB ID từ server
    id: string; // Order code (VD: DH102969)
    userId: string;
    items: OrderItem[];
    totalAmount: number; // Tổng tiền trước thuế/phí
    discount: number; // Giảm giá
    deliveryFee: number; // Phí giao hàng
    finalAmount: number; // Tổng tiền cuối cùng
    paymentMethod: string; // "momo" hoặc "cod"
    deliveryAddress: DeliveryAddress;
    estimatedDeliveryTime?: string;
    status: string; // "pending", "confirmed", "preparing", "delivering", "delivered", "cancelled"
    paymentStatus: string; // "unpaid", "paid", "refunded"
    paymentTransaction?: PaymentTransaction;
    createdAt: string;
    updatedAt: string;
}

let orderDb: SQLite.SQLiteDatabase | null = null;

// ==============================
// 🔁 Reset Order Database
// ==============================
export const resetOrderDatabase = async () => {
    try {
        if (orderDb) {
            await orderDb.closeAsync();
            orderDb = null;
        }
        await SQLite.deleteDatabaseAsync("OrderDB.db");
        console.log("🗑️ Đã xóa OrderDB cũ");

        orderDb = await initOrderDatabase();
        console.log("✅ Đã tạo OrderDB mới");
        return true;
    } catch (e) {
        console.error("❌ Lỗi khi reset OrderDB:", e);
        return false;
    }
};

// ==============================
// 🧱 Init Order Database
// ==============================
const initOrderDatabase = async () => {
    const dbInstance = await SQLite.openDatabaseAsync("OrderDB.db");

    try {
        // Tạo bảng với schema mới có paymentTransaction
        await dbInstance.execAsync(`
            CREATE TABLE IF NOT EXISTS Orders (
              id TEXT PRIMARY KEY,
              _id TEXT,
              userId TEXT NOT NULL,
              items TEXT NOT NULL,
              totalAmount REAL NOT NULL,
              discount REAL NOT NULL,
              deliveryFee REAL NOT NULL,
              finalAmount REAL NOT NULL,
              paymentMethod TEXT NOT NULL,
              deliveryAddress TEXT NOT NULL,
              estimatedDeliveryTime TEXT,
              status TEXT NOT NULL,
              paymentStatus TEXT NOT NULL,
              paymentTransaction TEXT,
              createdAt TEXT NOT NULL,
              updatedAt TEXT NOT NULL
            );
        `);

        // Migrate: Thêm cột paymentTransaction nếu chưa có (cho DB cũ)
        try {
            await dbInstance.execAsync(`
                ALTER TABLE Orders ADD COLUMN paymentTransaction TEXT;
            `);
            console.log("✅ Đã thêm cột paymentTransaction vào bảng Orders");
        } catch (alterError: any) {
            // Cột đã tồn tại hoặc lỗi khác, bỏ qua
            if (!alterError.message?.includes("duplicate column")) {
                console.log("ℹ️ Cột paymentTransaction đã tồn tại hoặc không cần thêm");
            }
        }
    } catch (error: any) {
        // Nếu có lỗi schema (bảng cũ), drop và tạo lại
        if (error.message?.includes("no column named") || error.message?.includes("has no column")) {
            console.log("⚠️ Phát hiện schema cũ, đang migrate...");
            await dbInstance.execAsync(`DROP TABLE IF EXISTS Orders;`);
            await dbInstance.execAsync(`
                CREATE TABLE Orders (
                  id TEXT PRIMARY KEY,
                  _id TEXT,
                  userId TEXT NOT NULL,
                  items TEXT NOT NULL,
                  totalAmount REAL NOT NULL,
                  discount REAL NOT NULL,
                  deliveryFee REAL NOT NULL,
                  finalAmount REAL NOT NULL,
                  paymentMethod TEXT NOT NULL,
                  deliveryAddress TEXT NOT NULL,
                  estimatedDeliveryTime TEXT,
                  status TEXT NOT NULL,
                  paymentStatus TEXT NOT NULL,
                  createdAt TEXT NOT NULL,
                  updatedAt TEXT NOT NULL
                );
            `);
            console.log("✅ Đã migrate OrderDB thành công");
        } else {
            throw error;
        }
    }

    return dbInstance;
};

const getOrderDb = async () => {
    if (orderDb) return orderDb;

    try {
        orderDb = await initOrderDatabase();
        return orderDb;
    } catch (error: any) {
        // Nếu có lỗi schema, reset và thử lại
        if (error.message?.includes("no column named") || error.message?.includes("has no column")) {
            console.log("⚠️ Lỗi schema, đang reset database...");
            await resetOrderDatabase();
            return orderDb!;
        }
        throw error;
    }
};

// ==============================
// 💾 Save Order To SQLite
// ==============================
export const saveOrderToSQLite = async (order: Order): Promise<boolean> => {
    try {
        const db = await getOrderDb();

        await db.runAsync(
            `INSERT OR REPLACE INTO Orders (
        id, _id, userId, items, totalAmount, discount, deliveryFee, finalAmount, 
        paymentMethod, deliveryAddress, estimatedDeliveryTime, status, paymentStatus, 
        paymentTransaction, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                order.id,
                order._id || null,
                order.userId,
                JSON.stringify(order.items),
                order.totalAmount,
                order.discount,
                order.deliveryFee,
                order.finalAmount,
                order.paymentMethod,
                JSON.stringify(order.deliveryAddress),
                order.estimatedDeliveryTime || null,
                order.status,
                order.paymentStatus,
                order.paymentTransaction ? JSON.stringify(order.paymentTransaction) : null,
                order.createdAt,
                order.updatedAt,
            ]
        );

        console.log("💾 Đã lưu đơn hàng vào SQLite:", order.id);
        return true;
    } catch (e: any) {
        console.error("❌ Lỗi khi lưu đơn hàng vào SQLite:", e);

        // Nếu lỗi do schema cũ, reset và thử lại
        if (e.message?.includes("no column named") || e.message?.includes("has no column")) {
            console.log("⚠️ Đang reset database và thử lại...");
            await resetOrderDatabase();

            // Thử lại lần nữa
            try {
                const db = await getOrderDb();
                await db.runAsync(
                    `INSERT OR REPLACE INTO Orders (
                id, _id, userId, items, totalAmount, discount, deliveryFee, finalAmount, 
                paymentMethod, deliveryAddress, estimatedDeliveryTime, status, paymentStatus, 
                paymentTransaction, createdAt, updatedAt
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        order.id,
                        order._id || null,
                        order.userId,
                        JSON.stringify(order.items),
                        order.totalAmount,
                        order.discount,
                        order.deliveryFee,
                        order.finalAmount,
                        order.paymentMethod,
                        JSON.stringify(order.deliveryAddress),
                        order.estimatedDeliveryTime || null,
                        order.status,
                        order.paymentStatus,
                        order.paymentTransaction ? JSON.stringify(order.paymentTransaction) : null,
                        order.createdAt,
                        order.updatedAt,
                    ]
                );
                console.log("💾 Đã lưu đơn hàng vào SQLite (sau khi reset):", order.id);
                return true;
            } catch (retryError) {
                console.error("❌ Vẫn lỗi sau khi reset:", retryError);
                return false;
            }
        }

        return false;
    }
};

// ==============================
// 📤 Send Order To Server
// ==============================
export const sendOrderToServer = async (
    order: Order,
    token: string
): Promise<boolean> => {
    try {
        console.log("📤 ========== SENDING ORDER TO SERVER ==========");
        console.log("📤 Order ID:", order.id);
        console.log("📤 User ID:", order.userId);
        console.log("📤 Payment Method:", order.paymentMethod);
        console.log("📤 Final Amount:", order.finalAmount, "VND");
        console.log("📤 Items:", order.items.length);
        console.log("📤 Full Order Data:", JSON.stringify(order, null, 2));
        console.log("📤 ==============================================");

        const response = await fetch(
            "https://food-delivery-mobile-app.onrender.com/orders",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(order),
            }
        );

        console.log("📡 Response status:", response.status);

        // Đọc response text trước để debug
        const responseText = await response.text();
        console.log("📡 Response body:", responseText);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} - ${responseText}`);
        }

        // Parse JSON nếu có data
        let result;
        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
            console.warn("⚠️ Không thể parse JSON response, nhưng request thành công");
            result = {};
        }

        console.log("✅ Đã gửi đơn hàng lên server:", result);

        // Cập nhật _id từ server nếu có
        if (result._id || result.id) {
            const db = await getOrderDb();
            await db.runAsync("UPDATE Orders SET _id = ? WHERE id = ?", [
                result._id || result.id,
                order.id,
            ]);
        }

        return true;
    } catch (error) {
        console.error("❌ Lỗi chi tiết khi gửi đơn hàng lên server:", error);
        if (error instanceof Error) {
            console.error("❌ Error message:", error.message);
            console.error("❌ Error stack:", error.stack);
        }
        return false;
    }
};

// ==============================
// 📦 Create And Save Order
// ==============================
export const createOrder = async (
    orderCode: string,
    userId: string,
    items: OrderItem[],
    totalAmount: number,
    paymentMethod: string,
    fullAddress: string,
    phone: string,
    token: string
): Promise<Order | null> => {
    try {
        const now = new Date().toISOString();

        // Tính toán các giá trị
        const discount = 0; // Có thể thêm logic discount sau
        const deliveryFee = 0; // Miễn phí giao hàng
        const finalAmount = totalAmount + deliveryFee - discount;

        // Estimate delivery time (30-45 phút từ bây giờ)
        const estimatedTime = new Date(Date.now() + 30 * 60 * 1000); // +30 phút

        const order: Order = {
            id: orderCode,
            userId,
            items,
            totalAmount,
            discount,
            deliveryFee,
            finalAmount,
            paymentMethod: paymentMethod === "Thanh toán trực tuyến" ? "momo" : "cod",
            deliveryAddress: {
                fullAddress,
                phone,
            },
            estimatedDeliveryTime: estimatedTime.toISOString(),
            status: "pending",
            paymentStatus: "unpaid",
            createdAt: now,
            updatedAt: now,
        };

        console.log("📦 Đang tạo đơn hàng:", {
            orderCode,
            userId,
            itemsCount: items.length,
            totalAmount,
            paymentMethod,
        });

        // Lưu vào SQLite
        const savedToSQLite = await saveOrderToSQLite(order);
        if (!savedToSQLite) {
            console.error("❌ Không thể lưu đơn hàng vào SQLite");
            return null;
        }

        // Gửi lên server và chờ kết quả
        console.log("📤 Đang gửi đơn hàng lên server...");
        const serverSuccess = await sendOrderToServer(order, token);

        if (serverSuccess) {
            console.log("✅ Đơn hàng đã được lưu thành công trên server!");
        } else {
            console.warn("⚠️ Không thể gửi đơn hàng lên server (đã lưu local)");
            console.warn("⚠️ Payment polling có thể thất bại vì server không có order này");
        }

        console.log("✅ Đã tạo và lưu đơn hàng local thành công");
        return order;
    } catch (error) {
        console.error("❌ Lỗi khi tạo đơn hàng:", error);
        if (error instanceof Error) {
            console.error("❌ Error details:", error.message, error.stack);
        }
        return null;
    }
};

// ==============================
// 📖 Get All Orders By User
// ==============================
export const getOrdersByUserId = async (
    userId: string
): Promise<Order[]> => {
    const db = await getOrderDb();

    try {
        const orders = await db.getAllAsync<any>(
            "SELECT * FROM Orders WHERE userId = ? ORDER BY createdAt DESC",
            [userId]
        );

        return orders.map((o) => ({
            ...o,
            items: JSON.parse(o.items),
            deliveryAddress: JSON.parse(o.deliveryAddress),
            paymentTransaction: o.paymentTransaction ? JSON.parse(o.paymentTransaction) : undefined,
        }));
    } catch (e) {
        console.error("❌ Lỗi khi lấy đơn hàng:", e);
        return [];
    }
};

// ==============================
// 📥 Get Order by ID from Server
// ==============================
export const getOrderById = async (
    orderId: string,
    token: string
): Promise<Order | null> => {
    try {
        console.log(`🔄 Loading order ${orderId} from server...`);

        const response = await fetch(
            `https://food-delivery-mobile-app.onrender.com/orders/${orderId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            console.warn(`⚠️ Server returned ${response.status}`);
            return null;
        }

        const serverOrder = await response.json();
        console.log(`✅ Loaded order ${serverOrder.id} successfully`);
        return serverOrder;
    } catch (error) {
        console.error("❌ Error loading order detail:", error);
        return null;
    }
};

// ==============================
// 🔄 Sync Orders from Server
// ==============================
export const syncOrdersFromServer = async (
    userId: string,
    token: string
): Promise<boolean> => {
    try {
        console.log("🔄 Đang đồng bộ đơn hàng từ server...");

        const response = await fetch(
            `https://food-delivery-mobile-app.onrender.com/orders/user/${userId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            console.warn(`⚠️ Server returned ${response.status}`);
            return false;
        }

        const result = await response.json();
        const serverOrders = result.orders || [];

        console.log(`📥 Nhận được ${serverOrders.length} đơn hàng từ server`);

        // Sync each order to SQLite
        for (const serverOrder of serverOrders) {
            try {
                // Map server order to local order format
                const localOrder: Order = {
                    id: serverOrder.id,
                    _id: serverOrder._id,
                    userId: serverOrder.userId,
                    items: serverOrder.items.map((item: any) => ({
                        dessertId: item.dessertId,
                        name: item.dessertName || item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                    totalAmount: serverOrder.totalAmount,
                    discount: serverOrder.discount,
                    deliveryFee: serverOrder.deliveryFee,
                    finalAmount: serverOrder.finalAmount,
                    paymentMethod: serverOrder.paymentMethod,
                    deliveryAddress: serverOrder.deliveryAddress,
                    estimatedDeliveryTime: serverOrder.estimatedDeliveryTime,
                    status: serverOrder.status,
                    paymentStatus: serverOrder.paymentStatus,
                    paymentTransaction: serverOrder.paymentTransaction,
                    createdAt: serverOrder.createdAt,
                    updatedAt: serverOrder.updatedAt,
                };

                await saveOrderToSQLite(localOrder);
            } catch (syncError) {
                console.error(`❌ Lỗi khi sync order ${serverOrder.id}:`, syncError);
            }
        }

        console.log("✅ Đồng bộ đơn hàng thành công");
        return true;
    } catch (error) {
        console.error("❌ Lỗi khi đồng bộ từ server:", error);
        return false;
    }
};

// ==============================
// 🔄 Update Order Status from Server
// ==============================
export const updateOrderFromServer = async (
    orderId: string,
    token: string
): Promise<boolean> => {
    try {
        console.log(`🔄 Đang cập nhật order ${orderId} từ server...`);

        const response = await fetch(
            `https://food-delivery-mobile-app.onrender.com/orders/${orderId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            console.warn(`⚠️ Server returned ${response.status}`);
            return false;
        }

        const serverOrder = await response.json();

        // Map and save to SQLite
        const localOrder: Order = {
            id: serverOrder.id,
            _id: serverOrder._id,
            userId: serverOrder.userId,
            items: serverOrder.items.map((item: any) => ({
                dessertId: item.dessertId,
                name: item.dessertName || item.name,
                price: item.price,
                quantity: item.quantity,
            })),
            totalAmount: serverOrder.totalAmount,
            discount: serverOrder.discount,
            deliveryFee: serverOrder.deliveryFee,
            finalAmount: serverOrder.finalAmount,
            paymentMethod: serverOrder.paymentMethod,
            deliveryAddress: serverOrder.deliveryAddress,
            estimatedDeliveryTime: serverOrder.estimatedDeliveryTime,
            status: serverOrder.status,
            paymentStatus: serverOrder.paymentStatus,
            paymentTransaction: serverOrder.paymentTransaction,
            createdAt: serverOrder.createdAt,
            updatedAt: serverOrder.updatedAt,
        };

        await saveOrderToSQLite(localOrder);
        console.log(`✅ Đã cập nhật order ${orderId}`);
        return true;
    } catch (error) {
        console.error(`❌ Lỗi khi cập nhật order ${orderId}:`, error);
        return false;
    }
};

// ==============================
// 🗑️ Clear All Orders
// ==============================
export const clearAllOrders = async (): Promise<boolean> => {
    const db = await getOrderDb();

    try {
        await db.execAsync("DELETE FROM Orders;");
        console.log("🧹 Đã xóa sạch dữ liệu đơn hàng");
        return true;
    } catch (e) {
        console.error("❌ Lỗi khi xóa đơn hàng:", e);
        return false;
    }
};
