// SỬA 1: Import useRouter từ expo-router
import CartItemRow from "@/components/CartItemRow";
import { useDessert } from "@/context/DessertContext"; // Tên hook đúng là useDessert (số ít)
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface HydratedCartItem extends Dessert {
  quantity: number;
}

const PRIMARY_COLOR = "#ff6a00"; // Màu chủ đạo của app

const CartScreen = () => {
  const router = useRouter();

  const { currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { desserts, loading: isDessertsLoading } = useDessert();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
  }, [currentUser, desserts]); // 4. Các hàm tính toán và xử lý (Giữ nguyên)

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
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(itemId)) {
        return prevSelected.filter((id) => id !== itemId);
      } else {
        return [...prevSelected, itemId];
      }
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(hydratedCartItems.map((item) => item.id));
    }
  };

  //Cập nhật hàm handleCheckout để dùng router.push

  const handleCheckout = () => {
    const itemsToCheckout = hydratedCartItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    router.push({
      pathname: "/payment/checkOut",
      params: {
        items: JSON.stringify(itemsToCheckout),
        total: totalPrice,
        selectedItemIds: JSON.stringify(selectedItems), // Truyền danh sách IDs đã chọn
      },
    });
  };

  if (isUserLoading || isDessertsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  } // 6. Xử lý không có user hoặc giỏ hàng rỗng (Giữ nguyên)

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
          <Text style={styles.emptySubtitle}>
            Vui lòng đăng nhập để xem giỏ hàng của bạn
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/login-signUp/loginScreen")}>
            <Text style={styles.actionButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  } // 7. Render giao diện

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
      </View>

      {/* 7a. Danh sách sản phẩm */}
      <FlatList
        data={hydratedCartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            isSelected={selectedItems.includes(item.id)}
            onSelect={() => handleSelectItem(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptySubtitle}>
              Hãy thêm món ăn yêu thích của bạn vào giỏ hàng nhé!
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/(tabs)")}>
              <Text style={styles.actionButtonText}>🏠 Quay về trang chủ</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSelectAll} style={styles.selectAll}>
          <MaterialCommunityIcons
            name={
              isAllSelected
                ? "checkbox-marked-outline"
                : "checkbox-blank-outline"
            }
            size={24}
            color={PRIMARY_COLOR}
          />
          <Text style={styles.selectAllText}>Chọn tất cả</Text>
        </TouchableOpacity>
        <View style={styles.checkoutBox}>
          <View>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={[styles.totalPrice, { color: PRIMARY_COLOR }]}>
              ${totalPrice.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkoutButton, // SỬA 3: Dùng màu đã định nghĩa
              { backgroundColor: PRIMARY_COLOR },
              selectedItems.length === 0 && styles.checkoutDisabled,
            ]}
            onPress={handleCheckout}
            disabled={selectedItems.length === 0}>
            <Text style={styles.checkoutText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Component con (SỬA 3: Cập nhật màu) ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 100,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#222",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: 100,
  },

  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 10,
    paddingBottom: 20,
  },
  selectAll: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllText: {
    marginLeft: 8,
    fontSize: 16,
  },
  checkoutBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold", // color: PRIMARY_COLOR, (đã chuyển lên inline style)
    textAlign: "right",
  },
  checkoutButton: {
    // backgroundColor: PRIMARY_COLOR, (đã chuyển lên inline style)
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginLeft: 10,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});

export default CartScreen;
