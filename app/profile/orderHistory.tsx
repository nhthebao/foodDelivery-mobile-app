import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrentUser } from "../../context/UserContext";
import { useHeaderPadding } from "../../hooks/useHeaderPadding";
import { Order } from "../../services/orderServices";

export default function OrderHistoryScreen() {
  const router = useRouter();
  const headerPadding = useHeaderPadding();
  const { currentUser } = useCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load orders
  const loadOrders = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        console.warn("⚠️ No token found");
        setOrders([]);
        return;
      }

      console.log(`🔄 Loading orders for user: ${currentUser.id}`);
      console.log(`📡 Fetching: /users/${currentUser.id}/orders`);

      const response = await fetch(
        `https://food-delivery-mobile-app.onrender.com/orders/user/${currentUser.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        console.warn(`⚠️ Server returned ${response.status}`);
        const errorText = await response.text();
        console.error(`❌ Error response: ${errorText}`);
        setOrders([]);
        return;
      }

      const result = await response.json();
      console.log(`📦 Response data:`, result);

      const serverOrders = result.orders || [];
      console.log(`📥 Loaded ${serverOrders.length} orders from server`);

      if (serverOrders.length === 0) {
        console.warn("⚠️ No orders returned from server");
        console.warn(`   User ID: ${currentUser.id}`);
        console.warn(`   Total in response: ${result.total}`);
      }

      // Map server orders to local Order format
      const mappedOrders: Order[] = serverOrders.map((serverOrder: any) => ({
        id: serverOrder.id,
        _id: serverOrder._id,
        userId: serverOrder.userId,
        items: serverOrder.items.map((item: any) => ({
          dessertId: item.dessertId,
          name: item.dessertName || item.name || item.dessertId || "Món ăn",
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
      }));

      console.log(`✅ Mapped ${mappedOrders.length} orders successfully`);
      console.log("📋 First order sample:", mappedOrders[0]);

      setOrders(mappedOrders);
    } catch (error) {
      console.error("❌ Error loading orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders(); // Load from server on first load
  }, [currentUser?.id]);

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    loadOrders(); // Reload from server when refreshing
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#FFA500";
      case "confirmed":
        return "#4CAF50";
      case "preparing":
        return "#2196F3";
      case "delivering":
        return "#9C27B0";
      case "delivered":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      default:
        return "#666";
    }
  };

  // Get status text in Vietnamese
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "preparing":
        return "Đang chuẩn bị";
      case "delivering":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Get payment status text
  const getPaymentStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "Đã thanh toán";
      case "unpaid":
        return "Chưa thanh toán";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  // Get payment method text
  const getPaymentMethodText = (method: string) => {
    if (method === "momo" || method === "Thanh toán trực tuyến") {
      return "MoMo QR";
    }
    if (method === "cod" || method === "Thanh toán khi nhận hàng") {
      return "COD";
    }
    return method;
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Render order item
  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => {
        // Navigate to order detail
        router.push({
          pathname: "/profile/orderDetail",
          params: { orderId: item.id },
        });
      }}>
      {/* Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Ionicons name="receipt-outline" size={20} color="#f26522" />
          <Text style={styles.orderCode}>{item.id}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}>
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      {/* Items preview */}
      <View style={styles.itemsPreview}>
        <Text style={styles.itemsCount}>
          {item.items.length} món • {formatCurrency(item.finalAmount)}
        </Text>
        <Text style={styles.itemsList} numberOfLines={2}>
          {item.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.orderFooter}>
        <View style={styles.footerLeft}>
          <Ionicons name="card-outline" size={16} color="#666" />
          <Text style={styles.paymentMethod}>
            {getPaymentMethodText(item.paymentMethod)}
          </Text>
          <View
            style={[
              styles.paymentStatusDot,
              {
                backgroundColor:
                  item.paymentStatus === "paid" ? "#4CAF50" : "#FFA500",
              },
            ]}
          />
          <Text style={styles.paymentStatus}>
            {getPaymentStatusText(item.paymentStatus)}
          </Text>
        </View>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  // Empty state
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={[styles.header, { paddingTop: headerPadding }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
          <Text style={styles.emptySubtitle}>
            Vui lòng đăng nhập để xem lịch sử đơn hàng
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/login-signUp/loginScreen")}>
            <Text style={styles.actionButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.notchCover}>
      <SafeAreaView style={styles.container} edges={[]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: headerPadding }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color="#f26522" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f26522" />
            <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
            <Text style={styles.emptySubtitle}>
              Bạn chưa có đơn hàng nào. Hãy đặt món ngay!
            </Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/(tabs)")}>
              <Text style={styles.actionButtonText}>Đặt món ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#f26522"]}
                tintColor="#f26522"
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  notchCover: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: "#f26522",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#f26522",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  orderCode: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  itemsPreview: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },
  itemsList: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  paymentMethod: {
    fontSize: 12,
    color: "#666",
  },
  paymentStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
  paymentStatus: {
    fontSize: 12,
    color: "#666",
  },
  orderDate: {
    fontSize: 12,
    color: "#999",
  },
});
