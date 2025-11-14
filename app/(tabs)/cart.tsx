// SỬA 1: Import useRouter từ expo-router
import CartItemRow from "@/components/CartItemRow";
import { CustomAlert } from "@/components/CustomAlert";
import { useDessert } from "@/context/DessertContext";
import { useCurrentUser } from "@/context/UserContext";
import { Dessert } from "@/types/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface HydratedCartItem extends Dessert {
  quantity: number;
}

const { width } = Dimensions.get("window");
const PRIMARY_COLOR = "#ff6a00";
const SECONDARY_COLOR = "#fff4e6";
const TEXT_DARK = "#1a1a1a";
const TEXT_LIGHT = "#666";

const CartScreen = () => {
  const router = useRouter();

  const { currentUser, isLoading: isUserLoading } = useCurrentUser();
  const {
    desserts,
    loading: isDessertsLoading,
    updateCartQuantity,
    removeFromCart,
  } = useDessert();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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

  const hydratedCartItems: HydratedCartItem[] = useMemo(() => {
    if (!currentUser || !currentUser.cart || !desserts) return [];

    return currentUser.cart
      .map((cartItem) => {
        const dessertDetails = desserts.find((d) => d.id === cartItem.item);
        if (dessertDetails) {
          return {
            ...dessertDetails,
            quantity: cartItem.quantity,
          };
        }
        return null;
      })
      .filter((item): item is HydratedCartItem => item !== null);
  }, [currentUser, desserts]);

  const isAllSelected =
    hydratedCartItems.length > 0 &&
    selectedItems.length === hydratedCartItems.length;

  const totalPrice = useMemo(() => {
    return hydratedCartItems.reduce((sum, item) => {
      if (selectedItems.includes(item.id)) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);
  }, [selectedItems, hydratedCartItems]);

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(hydratedCartItems.map((item) => item.id));
    }
  };

  const handleCheckout = () => {
    const itemsToCheckout = hydratedCartItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    router.push({
      pathname: "/payment/checkOut",
      params: {
        items: JSON.stringify(itemsToCheckout),
        total: totalPrice,
        selectedItemIds: JSON.stringify(selectedItems),
      },
    });
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const success = await updateCartQuantity(itemId, newQuantity);
      if (success && newQuantity === 0) {
        setSelectedItems((prev) => prev.filter((id) => id !== itemId));
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật số lượng");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xóa món ăn");
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một món để xóa");
      return;
    }

    Alert.alert(
      "Xóa món đã chọn",
      `Xóa ${selectedItems.length} món khỏi giỏ hàng?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              for (const itemId of selectedItems) {
                await removeFromCart(itemId);
              }
              setSelectedItems([]);
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa món ăn");
            }
          },
        },
      ]
    );
  };

  const handleClearCart = () => {
    if (hydratedCartItems.length === 0) return;

    setAlertConfig({
      title: "Xóa tất cả",
      message: "Xóa toàn bộ giỏ hàng?",
      buttons: [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa tất cả",
          style: "destructive",
          onPress: async () => {
            try {
              for (const item of hydratedCartItems) {
                await removeFromCart(item.id);
              }
              setSelectedItems([]);
              setAlertVisible(false);
            } catch (error) {
              setAlertConfig({
                title: "Lỗi",
                message: "Không thể xóa giỏ hàng",
                buttons: [
                  { text: "OK", onPress: () => setAlertVisible(false) },
                ],
              });
            }
          },
        },
      ],
    });
    setAlertVisible(true);
  };

  // Loading
  if (isUserLoading || isDessertsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Chưa đăng nhập
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="lock-closed" size={48} color={PRIMARY_COLOR} />
          </View>
          <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
          <Text style={styles.emptySubtitle}>
            Đăng nhập để xem và quản lý giỏ hàng của bạn
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/login-signUp/loginScreen")}
          >
            <Text style={styles.primaryButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Giao diện chính
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Danh sách sản phẩm */}
      <FlatList
        data={hydratedCartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            isSelected={selectedItems.includes(item.id)}
            onSelect={() => handleSelectItem(item.id)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={56} color="#ccc" />
            </View>
            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptySubtitle}>
              Hãy thêm món ăn ngon vào giỏ hàng ngay!
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.primaryButtonText}>Bắt đầu mua sắm</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={
          hydratedCartItems.length === 0
            ? { flex: 1 }
            : { paddingBottom: 100, paddingHorizontal: 16 }
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Footer - Chỉ hiện khi có sản phẩm */}
      {hydratedCartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerTop}>
            {/* Select All */}
            <TouchableOpacity
              onPress={handleSelectAll}
              style={styles.selectAllButton}
            >
              <MaterialCommunityIcons
                name={
                  isAllSelected ? "checkbox-marked" : "checkbox-blank-outline"
                }
                size={22}
                color={isAllSelected ? PRIMARY_COLOR : "#999"}
              />
              <Text style={styles.selectAllText}>Chọn tất cả</Text>
            </TouchableOpacity>

            {/* Delete Actions */}
            <View style={styles.deleteGroup}>
              <TouchableOpacity
                onPress={handleClearCart}
                style={styles.deleteBtn}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={18}
                  color="#E74C3C"
                />
                <Text style={styles.deleteBtnText}>Xóa tất cả</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Checkout Section */}
          <View style={styles.checkoutSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
              {selectedItems.length > 0 && (
                <Text style={styles.itemCount}>
                  ({selectedItems.length} món)
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.checkoutButton,
                selectedItems.length === 0 && styles.checkoutButtonDisabled,
              ]}
              onPress={handleCheckout}
              disabled={selectedItems.length === 0}
            >
              <Text style={styles.checkoutButtonText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  notchCover: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  // Header
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_DARK,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: TEXT_LIGHT,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: TEXT_LIGHT,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Footer
  footer: {
    position: "absolute",
    height: 120,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  footerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllText: {
    marginLeft: 6,
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: "500",
  },
  deleteGroup: {
    flexDirection: "row",
    gap: 12,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#fee",
    borderWidth: 1,
    borderColor: "#fcc",
  },
  deleteBtnDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#eee",
  },
  deleteBtnText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#E74C3C",
    fontWeight: "500",
  },

  // Checkout
  checkoutSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: TEXT_LIGHT,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: PRIMARY_COLOR,
    marginTop: 2,
  },
  itemCount: {
    fontSize: 12,
    color: TEXT_LIGHT,
    marginTop: 2,
  },
  checkoutButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  checkoutButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default CartScreen;
