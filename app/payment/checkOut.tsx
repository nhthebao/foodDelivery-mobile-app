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
import { createOrder, OrderItem } from "../../services/orderServices";

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

  // Lấy phương thức thanh toán từ params (nếu vừa chọn xong)
  const selectedPaymentMethod = params.paymentMethod as string | undefined;

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

  // State cho mã đơn hàng (tạo một lần duy nhất)
  const [orderCode] = useState(() => `DH${Date.now().toString().slice(-6)}`);

  // Tính toán cart items với thông tin đầy đủ (CHỈ LẤY CÁC ITEMS ĐÃ CHỌN)
  const cartItems = useMemo(() => {
    // Lấy danh sách IDs đã chọn từ params
    const selectedItemIds = params.selectedItemIds
      ? JSON.parse(params.selectedItemIds as string)
      : [];

    if (
      !currentUser?.cart ||
      desserts.length === 0 ||
      selectedItemIds.length === 0
    ) {
      return [];
    }

    // Chỉ lấy các items có ID nằm trong selectedItemIds
    return currentUser.cart
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
        selectedPaymentMethod || "",
        currentUser.address,
        currentUser.phone,
        jwtToken
      );

      if (!order) {
        console.error("❌ Không thể tạo đơn hàng");
        return false;
      }

      console.log("✅ Đã tạo đơn hàng thành công:", order.id);

      // Xóa các items đã đặt khỏi giỏ hàng
      const selectedItemIds = params.selectedItemIds
        ? JSON.parse(params.selectedItemIds as string)
        : [];
      const newCart = currentUser.cart.filter(
        (item) => !selectedItemIds.includes(item.item)
      );
      await updateCart(newCart);

      return true;
    } catch (error) {
      console.error("❌ Lỗi khi lưu đơn hàng:", error);
      return false;
    }
  };

  // Hàm thanh toán
  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // Kiểm tra nếu chưa chọn phương thức thanh toán
    if (!selectedPaymentMethod) {
      setAlertConfig({
        title: "Chưa chọn phương thức thanh toán",
        message: "Vui lòng chọn phương thức thanh toán trước khi đặt hàng",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
      return;
    }

    // Nếu chọn thanh toán trực tuyến -> hiển thị modal MoMo
    if (selectedPaymentMethod === "Thanh toán trực tuyến") {
      setShowMoMoModal(true);
      return;
    }

    // Nếu chọn COD -> lưu đơn hàng và chuyển đến success
    if (selectedPaymentMethod === "Thanh toán khi nhận hàng") {
      saveOrder().then((success) => {
        if (success) {
          router.push({
            pathname: "/payment/paymentSuccessScreen",
            params: {
              orderCode: orderCode,
            },
          });
        } else {
          setAlertConfig({
            title: "Lỗi",
            message: "Không thể tạo đơn hàng. Vui lòng thử lại!",
            buttons: [{ text: "OK" }],
          });
          setAlertVisible(true);
        }
      });
    }
  };

  // Hàm xử lý khi thanh toán MoMo thành công
  const handleMoMoSuccess = async () => {
    setShowMoMoModal(false);

    // Lưu đơn hàng
    const success = await saveOrder();
    if (success) {
      router.push({
        pathname: "/payment/paymentSuccessScreen",
        params: {
          orderCode: orderCode,
        },
      });
    } else {
      setAlertConfig({
        title: "Lỗi",
        message: "Không thể tạo đơn hàng. Vui lòng thử lại!",
        buttons: [{ text: "OK" }],
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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Quay lại</Text>
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
                  {selectedPaymentMethod || "Chọn phương thức thanh toán →"}
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
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>Đặt hàng</Text>
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
        onClose={() => setShowMoMoModal(false)}
        onSuccess={handleMoMoSuccess}
        amount={calculateAmountVND()}
        orderCode={orderCode}
        description={generateOrderDescription()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  checkoutBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
