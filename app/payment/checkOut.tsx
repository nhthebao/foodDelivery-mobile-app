import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/CustomAlert";
import MoMoQRModal from "../../components/MomoModal";
import { useDessert } from "../../context/DessertContext";
import { useCurrentUser } from "../../context/UserContext";
import {
  createOrder,
  OrderItem,
  updateOrderFromServer,
} from "../../services/orderServices";

export default function Checkout() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    currentUser,
    updateCart,
    isLoading: userLoading,
    jwtToken,
  } = useCurrentUser();
  const { desserts, loading: dessertsLoading } = useDessert();

  // ✅ Lấy phương thức thanh toán: ưu tiên từ params, fallback về saved method
  const paymentMethod = useMemo(() => {
    // Nếu có từ params (vừa chọn xong) thì dùng
    if (params.selectedPaymentMethod) {
      console.log(
        "💳 Payment method from params:",
        params.selectedPaymentMethod
      );
      return params.selectedPaymentMethod as string;
    }

    // Nếu không có từ params, dùng saved payment method từ user profile
    if (currentUser?.paymentMethod) {
      console.log(
        "💳 Payment method from user profile:",
        currentUser.paymentMethod
      );
      return currentUser.paymentMethod;
    }

    console.log("⚠️ No payment method found");
    // Default fallback
    return "";
  }, [params.selectedPaymentMethod, currentUser?.paymentMethod]);

  // State cho Custom Alert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    buttons: [] as {
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }[],
  });

  // State cho MoMo Modal
  const [showMoMoModal, setShowMoMoModal] = useState(false);

  // ✅ State để tracking order creation
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // ✅ Dùng useRef để orderCode không bị tạo lại khi component re-render
  const orderCodeRef = React.useRef<string>(
    `DH-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
  );
  const orderCode = orderCodeRef.current;

  // ✅ Track payment method để xóa order cũ khi thay đổi
  const previousPaymentMethodRef = React.useRef<string>("");
  const isInitialMount = React.useRef(true);

  React.useEffect(() => {
    const deleteOldOrder = async () => {
      // ✅ Skip on initial mount
      if (isInitialMount.current) {
        console.log("🔄 Initial mount, setting payment method:", paymentMethod);
        isInitialMount.current = false;
        previousPaymentMethodRef.current = paymentMethod;
        return;
      }

      // Nếu đã tạo order và payment method thay đổi (khác với lần trước)
      if (
        lastOrderId &&
        paymentMethod &&
        previousPaymentMethodRef.current &&
        previousPaymentMethodRef.current !== paymentMethod
      ) {
        console.log(
          `♻️ Payment method changed from "${previousPaymentMethodRef.current}" to "${paymentMethod}"`
        );
        console.log("🗑️ Deleting old order:", lastOrderId);

        // ✅ Hiển thị alert xác nhận xóa order cũ
        setAlertConfig({
          title: "Thay đổi phương thức thanh toán?",
          message: `Bạn đã có đơn hàng chưa thanh toán với phương thức "${previousPaymentMethodRef.current}". Chuyển sang "${paymentMethod}" sẽ hủy đơn hàng cũ. Bạn có chắc chắn muốn tiếp tục?`,
          buttons: [
            {
              text: "Hủy",
              style: "cancel",
              onPress: () => {
                setAlertVisible(false);
                // Quay về payment method screen để user chọn lại
                router.back();
              },
            },
            {
              text: "Xác nhận",
              style: "destructive",
              onPress: async () => {
                setAlertVisible(false);

                try {
                  const response = await fetch(
                    `https://food-delivery-mobile-app.onrender.com/orders/${lastOrderId}`,
                    {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwtToken}`,
                      },
                    }
                  );

                  if (response.ok) {
                    console.log("✅ Old order deleted successfully");
                  } else {
                    console.warn(
                      "⚠️ Failed to delete old order:",
                      response.status
                    );
                  }
                } catch (error) {
                  console.error("❌ Error deleting old order:", error);
                }

                // Reset states để tạo order mới
                setLastOrderId(null);
                setIsCreatingOrder(false);
                setShowMoMoModal(false);
                // ✅ Reset orderCode để tạo mã mới
                orderCodeRef.current = `DH-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 6)}`;
                console.log(
                  "🔄 New order code generated:",
                  orderCodeRef.current
                );
                // Cập nhật previous payment method
                previousPaymentMethodRef.current = paymentMethod;
              },
            },
          ],
        });
        setAlertVisible(true);
        return;
      }

      // Cập nhật previous payment method (chỉ khi không có order cũ hoặc đã xử lý xong)
      if (paymentMethod && !lastOrderId) {
        console.log("✅ Updating previous payment method to:", paymentMethod);
        previousPaymentMethodRef.current = paymentMethod;
      }
    };

    deleteOldOrder();
  }, [paymentMethod, lastOrderId, jwtToken, router]);

  // Tính toán cart items với thông tin đầy đủ (CHỈ LẤY CÁC ITEMS ĐÃ CHỌN)
  const cartItems = useMemo(() => {
    // Lấy danh sách IDs đã chọn từ params
    const selectedItemIds = params.selectedItemIds
      ? JSON.parse(params.selectedItemIds as string)
      : [];

    console.log("🛒 Cart calculation:");
    console.log("  - selectedItemIds:", selectedItemIds);
    console.log("  - currentUser.cart:", currentUser?.cart);
    console.log("  - desserts.length:", desserts.length);

    if (
      !currentUser?.cart ||
      desserts.length === 0 ||
      selectedItemIds.length === 0
    ) {
      console.log("⚠️ Cart is empty due to:", {
        noCart: !currentUser?.cart,
        noDesserts: desserts.length === 0,
        noSelectedIds: selectedItemIds.length === 0,
      });
      return [];
    }

    // Chỉ lấy các items có ID nằm trong selectedItemIds
    const items = currentUser.cart
      .filter((cartItem) => selectedItemIds.includes(cartItem.item))
      .map((cartItem) => {
        const dessert = desserts.find((d) => d.id === cartItem.item);
        if (!dessert) return null;

        return {
          ...dessert,
          quantity: cartItem.quantity,
        };
      })
      .filter((item) => item !== null);

    console.log("✅ Cart items calculated:", items.length, "items");
    return items;
  }, [currentUser?.cart, desserts, params.selectedItemIds]);

  // Tính toán tổng tiền
  const calculations = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item!.price * item!.quantity,
      0
    );
    const tax = subtotal * 0.1; // 10% thuế
    const discount = 0; // Có thể thêm logic discount sau
    const total = subtotal + tax - discount;

    return { subtotal, tax, discount, total };
  }, [cartItems]);

  // Hàm cập nhật số lượng
  const updateQuantity = async (dessertId: string, newQty: number) => {
    if (!currentUser || newQty < 1) return;

    const newCart = currentUser.cart.map((item) =>
      item.item === dessertId ? { ...item, quantity: newQty } : item
    );

    await updateCart(newCart);
  };

  // Hàm xóa item
  const removeItem = async (dessertId: string) => {
    if (!currentUser) return;

    const newCart = currentUser.cart.filter((item) => item.item !== dessertId);
    await updateCart(newCart);

    setAlertConfig({
      title: "Đã xóa",
      message: "Món ăn đã được xóa khỏi giỏ hàng!",
      buttons: [{ text: "OK" }],
    });
    setAlertVisible(true);
  };

  // Hàm xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (!currentUser) return;

    setAlertConfig({
      title: "Xóa giỏ hàng?",
      message: "Bạn có chắc chắn muốn xóa tất cả món ăn khỏi giỏ hàng?",
      buttons: [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa tất cả",
          onPress: async () => {
            await updateCart([]);
          },
        },
      ],
    });
    setAlertVisible(true);
  };

  // Tạo description cho QR code: "mã đơn hàng + tên món ăn"
  const generateOrderDescription = () => {
    const itemNames = cartItems.map((item) => item!.name).join(", ");
    // Giới hạn độ dài description để không quá dài
    const maxLength = 100;
    const fullDesc = `${orderCode} ${itemNames}`;
    return fullDesc.length > maxLength
      ? fullDesc.substring(0, maxLength) + "..."
      : fullDesc;
  };

  // Chuyển đổi giá từ USD sang VND (giả sử tỷ giá 1 USD = 24,000 VND)
  const calculateAmountVND = () => {
    return Math.round(calculations.total * 24000);
  };

  // Hàm tạo đơn hàng và lưu vào SQLite + Server
  const saveOrder = async () => {
    if (!currentUser || !jwtToken) {
      console.error("❌ Không có user hoặc token");
      return false;
    }

    try {
      const orderItems: OrderItem[] = cartItems.map((item) => ({
        dessertId: item!.id,
        name: item!.name,
        price: item!.price,
        quantity: item!.quantity,
      }));

      const order = await createOrder(
        orderCode,
        currentUser.id,
        orderItems,
        calculateAmountVND(),
        paymentMethod || "",
        currentUser.address,
        currentUser.phone,
        jwtToken
      );

      if (!order) {
        console.error("❌ Không thể tạo đơn hàng");
        return false;
      }

      console.log("✅ Đã tạo đơn hàng thành công:", order.id);
      setLastOrderId(order.id); // ✅ Lưu order ID để sync sau

      // ✅ KHÔNG XÓA CART Ở ĐÂY
      // Cart sẽ được xóa sau khi thanh toán thành công
      // - COD: Xóa ngay khi navigate to success
      // - MoMo: Xóa sau khi webhook confirm payment

      return true;
    } catch (error) {
      console.error("❌ Lỗi khi lưu đơn hàng:", error);
      return false;
    }
  };

  // ✅ Hàm xóa items khỏi giỏ hàng
  const clearSelectedItemsFromCart = async () => {
    try {
      if (!currentUser) return;

      const selectedItemIds = params.selectedItemIds
        ? JSON.parse(params.selectedItemIds as string)
        : [];

      const newCart = currentUser.cart.filter(
        (item) => !selectedItemIds.includes(item.item)
      );

      await updateCart(newCart);
      console.log("🧹 Đã xóa items khỏi giỏ hàng");
    } catch (error) {
      console.error("❌ Lỗi khi xóa cart:", error);
    }
  };

  // Hàm thanh toán
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // ✅ Prevent double clicks
    if (isCreatingOrder) {
      console.log("⚠️ Order đang được tạo, vui lòng chờ...");
      return;
    }

    // Kiểm tra nếu chưa chọn phương thức thanh toán
    if (!paymentMethod) {
      setAlertConfig({
        title: "Chưa chọn phương thức thanh toán",
        message: "Vui lòng chọn phương thức thanh toán trước khi đặt hàng",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
      return;
    }

    try {
      // ✅ TẠO ORDER TRƯỚC cho cả 2 phương thức thanh toán
      setIsCreatingOrder(true);
      console.log("📦 Đang tạo order trên server...");

      const orderCreated = await saveOrder();

      if (!orderCreated) {
        setAlertConfig({
          title: "Lỗi",
          message:
            "Không thể tạo đơn hàng. Vui lòng kiểm tra kết nối và thử lại!",
          buttons: [{ text: "OK" }],
        });
        setAlertVisible(true);
        return;
      }

      console.log("✅ Order đã được tạo thành công trên server");

      // Nếu chọn thanh toán trực tuyến -> hiển thị modal MoMo
      if (paymentMethod === "Thanh toán trực tuyến") {
        console.log("💳 Mở MoMo modal với orderCode:", orderCode);
        // ✅ KHÔNG XÓA CART Ở ĐÂY - User chưa thanh toán!
        setShowMoMoModal(true);
        return;
      }

      // Nếu chọn COD -> hiển thị success screen
      if (paymentMethod === "Thanh toán khi nhận hàng") {
        console.log("🚀 COD order completed, navigating to success screen...");

        // Navigate đến success screen với replace để clear stack
        router.replace({
          pathname: "/payment/paymentSuccessScreen",
          params: {
            orderCode: orderCode,
            selectedItemIds: params.selectedItemIds as string,
          },
        });

        // Reset states sau khi navigate
        setLastOrderId(null);
        setIsCreatingOrder(false);
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Hàm xử lý khi đóng MoMo modal - CHỈ ĐÓNG MODAL, KHÔNG XÓA ORDER
  const handleMoMoClose = () => {
    console.log("🚪 Đóng modal MoMo, giữ nguyên order:", lastOrderId);
    setShowMoMoModal(false);
    // Order vẫn còn unpaid, user có thể vào order history để thanh toán lại
  };

  // Hàm xử lý khi thanh toán MoMo thành công
  const handleMoMoSuccess = async () => {
    try {
      setShowMoMoModal(false);

      // 🔄 Sync order từ server để cập nhật paymentStatus
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (token && lastOrderId) {
          console.log(`🔄 Syncing order ${lastOrderId} from server...`);
          await updateOrderFromServer(lastOrderId, token);
          console.log(`✅ Order synced successfully`);
        }
      } catch (syncError) {
        console.error("❌ Failed to sync order:", syncError);
        // Chỉ log lỗi, không hiển thị cho user vì đơn hàng vẫn được tạo thành công
      }

      // ✅ Navigate đến success screen
      console.log("🚀 Payment successful, navigating to success screen...");

      // Navigate đến success screen với replace để clear stack
      router.replace({
        pathname: "/payment/paymentSuccessScreen",
        params: {
          orderCode: orderCode,
          selectedItemIds: params.selectedItemIds as string,
        },
      });

      // Reset states sau khi navigate
      setLastOrderId(null);
      setIsCreatingOrder(false);
    } catch (error) {
      console.error("❌ Error in handleMoMoSuccess:", error);
      setAlertConfig({
        title: "Lỗi",
        message:
          "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng kiểm tra lại đơn hàng trong lịch sử.",
        buttons: [
          {
            text: "Đóng",
            style: "cancel",
            onPress: () => setAlertVisible(false),
          },
        ],
      });
      setAlertVisible(true);
    }
  };

  if (userLoading || dessertsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6a00" />
      </View>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Check out</Text>
          <View style={{ width: 80 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyText}>
            Vui lòng đăng nhập để xem giỏ hàng
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/login-signUp/loginScreen")}>
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { marginRight: 18 }]}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Check out</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptySubtitle}>
              Hãy thêm món ăn yêu thích của bạn vào giỏ hàng nhé!
            </Text>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => router.push("/(tabs)")}>
              <Text style={styles.homeBtnText}>🏠 Quay về trang chủ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cartItems.map((item) => (
              <View key={item!.id} style={styles.cartItem}>
                <Image source={{ uri: item!.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item!.name}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ${item!.price.toFixed(2)}
                  </Text>

                  {/* Hiển thị số lượng (chỉ xem, không chỉnh sửa) */}
                  <Text style={styles.itemQuantity}>
                    Số lượng: {item!.quantity}
                  </Text>

                  {/* Item Total */}
                  <Text style={styles.itemTotal}>
                    Tạm tính: ${(item!.price * item!.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Delivery Info */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>📍 Địa chỉ giao hàng</Text>
              <Text style={styles.cardText}>{currentUser.address}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>💳 Phương thức thanh toán</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/payment/paymentMethodScreen",
                    params: {
                      selectedItemIds: params.selectedItemIds as string,
                      fromCheckout: "true",
                    },
                  })
                }>
                <Text style={styles.cardLink}>
                  {paymentMethod || "Chọn phương thức thanh toán →"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính</Text>
                <Text style={styles.summaryValue}>
                  ${calculations.subtotal.toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Thuế (10%)</Text>
                <Text style={styles.summaryValue}>
                  ${calculations.tax.toFixed(2)}
                </Text>
              </View>

              {calculations.discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Giảm giá</Text>
                  <Text style={[styles.summaryValue, { color: "#4caf50" }]}>
                    -${calculations.discount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalValue}>
                  ${calculations.total.toFixed(2)}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Checkout Button */}
      {cartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomTotal}>Tổng hóa đơn</Text>
            <Text style={styles.bottomPrice}>
              ${calculations.total.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.checkoutBtn,
              isCreatingOrder && styles.checkoutBtnDisabled,
            ]}
            onPress={handleCheckout}
            disabled={isCreatingOrder}>
            <Text style={styles.checkoutBtnText}>
              {isCreatingOrder ? "Đang tạo đơn hàng..." : "Đặt hàng"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />

      {/* MoMo QR Modal */}
      <MoMoQRModal
        visible={showMoMoModal}
        onClose={handleMoMoClose}
        onSuccess={handleMoMoSuccess}
        amount={calculateAmountVND()}
        orderCode={orderCode}
        description={generateOrderDescription()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: {
    fontSize: 16,
    color: "#ff6a00",
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
  },
  clearBtn: {
    fontSize: 14,
    color: "#ff3b30",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 100,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    color: "#222",
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  homeBtn: {
    backgroundColor: "#ff6a00",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#ff6a00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  homeBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
  },
  shopBtn: {
    backgroundColor: "#ff6a00",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shopBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: "#ff6a00",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: "#ff6a00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ff6a00",
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    backgroundColor: "#fff",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    minWidth: 30,
    textAlign: "center",
  },
  removeBtn: {
    marginLeft: "auto",
  },
  removeBtnText: {
    color: "#ff3b30",
    fontSize: 13,
    fontWeight: "600",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
  },
  infoCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  cardLink: {
    fontSize: 14,
    color: "#ff6a00",
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#666",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ff6a00",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomTotal: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ff6a00",
  },
  checkoutBtn: {
    backgroundColor: "#ff6a00",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  checkoutBtnDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  checkoutBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
