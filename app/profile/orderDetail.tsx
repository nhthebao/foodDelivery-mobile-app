import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order } from "../../services/orderServices";
import { useCurrentUser } from "../../context/UserContext";

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentUser } = useCurrentUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrderDetail();
  }, [params.orderId]);

  const loadOrderDetail = async () => {
    if (!currentUser?.id || !params.orderId) {
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        console.warn("⚠️ No token found");
        setOrder(null);
        return;
      }

      console.log(`🔄 Loading order ${params.orderId} from server...`);

      const response = await fetch(
        `https://food-delivery-mobile-app.onrender.com/orders/${params.orderId}`,
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
        setOrder(null);
        return;
      }

      const serverOrder = await response.json();

      // Map server order to local Order format
      const mappedOrder: Order = {
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
      };

      console.log(`✅ Loaded order ${serverOrder.id} successfully`);
      setOrder(mappedOrder);
    } catch (error) {
      console.error("❌ Error loading order detail:", error);
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrderDetail();
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

  // Get status text
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f26522" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>❌</Text>
          <Text style={styles.emptyTitle}>Không tìm thấy đơn hàng</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusBadgeLarge,
              { backgroundColor: getStatusColor(order.status) + "20" },
            ]}>
            <Ionicons
              name="checkmark-circle"
              size={32}
              color={getStatusColor(order.status)}
            />
            <Text
              style={[
                styles.statusTextLarge,
                { color: getStatusColor(order.status) },
              ]}>
              {getStatusText(order.status)}
            </Text>
          </View>
          <Text style={styles.orderCode}>Mã đơn: {order.id}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết món</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressRow}>
              <Ionicons name="location" size={20} color="#f26522" />
              <Text style={styles.addressText}>
                {order.deliveryAddress.fullAddress}
              </Text>
            </View>
            <View style={styles.addressRow}>
              <Ionicons name="call" size={20} color="#f26522" />
              <Text style={styles.addressText}>
                {order.deliveryAddress.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phương thức:</Text>
              <Text style={styles.paymentValue}>
                {order.paymentMethod === "momo" ? "MoMo QR" : "COD"}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Trạng thái:</Text>
              <Text
                style={[
                  styles.paymentValue,
                  {
                    color:
                      order.paymentStatus === "paid" ? "#4CAF50" : "#FFA500",
                  },
                ]}>
                {order.paymentStatus === "paid"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </Text>
            </View>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết giá</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tạm tính:</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(order.totalAmount)}
              </Text>
            </View>
            {order.discount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Giảm giá:</Text>
                <Text style={[styles.priceValue, { color: "#4CAF50" }]}>
                  -{formatCurrency(order.discount)}
                </Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Phí giao hàng:</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(order.deliveryFee)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(order.finalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction Info (if paid) */}
        {order.paymentTransaction && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin giao dịch</Text>
            <View style={styles.transactionCard}>
              <View style={styles.transactionRow}>
                <Text style={styles.transactionLabel}>Mã giao dịch:</Text>
                <Text style={styles.transactionValue}>
                  {order.paymentTransaction.transactionId}
                </Text>
              </View>
              <View style={styles.transactionRow}>
                <Text style={styles.transactionLabel}>Ngân hàng:</Text>
                <Text style={styles.transactionValue}>
                  {order.paymentTransaction.gateway}
                </Text>
              </View>
              <View style={styles.transactionRow}>
                <Text style={styles.transactionLabel}>Thời gian:</Text>
                <Text style={styles.transactionValue}>
                  {formatDate(order.paymentTransaction.transactionDate)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusTextLarge: {
    fontSize: 18,
    fontWeight: "700",
  },
  orderCode: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#999",
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemName: {
    fontSize: 14,
    color: "#222",
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f26522",
  },
  addressCard: {
    gap: 12,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  addressText: {
    fontSize: 14,
    color: "#222",
    flex: 1,
    lineHeight: 20,
  },
  paymentCard: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 14,
    color: "#666",
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  priceCard: {
    gap: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 14,
    color: "#222",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f26522",
  },
  transactionCard: {
    gap: 12,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionLabel: {
    fontSize: 13,
    color: "#666",
  },
  transactionValue: {
    fontSize: 13,
    color: "#222",
    fontWeight: "500",
  },
});
