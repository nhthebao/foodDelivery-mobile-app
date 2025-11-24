// file: MenuDetail.tsx (Đã viết lại)

import { CustomAlert } from "@/components/CustomAlert";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Pill } from "@/components/Pill"; // SỬA: Import 'Pill' từ file riêng
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router"; // SỬA: Import 'useRouter'
import React, { useMemo, useState } from "react"; // SỬA: Import 'useMemo'
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
import { useDessert } from "../../context/DessertContext";
import { useCurrentUser } from "../../context/UserContext";
import { Dessert } from "../../types/types";

// Mapping user names for review display
const USER_NAMES: { [key: string]: string } = {
  U026: "Nguyễn Văn A",
  U027: "Trần Thị B",
  U028: "Lê Văn C",
  U029: "Phạm Thị D",
  U030: "Hoàng Văn E",
  U031: "Võ Thị F",
  U032: "Đặng Văn G",
  U033: "Bùi Thị H",
};

export default function MenuDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter(); // Sửa: Khởi tạo router
  const { getById, loading, addToCart, toggleFavorite, isFavorite } =
    useDessert();
  const { currentUser } = useCurrentUser();
  const [qty, setQty] = useState<number>(1);

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

  // TỐI ƯU 1: Dùng useMemo để 'item' chỉ bị tìm 1 lần,
  // trừ khi 'id' hoặc hàm 'getById' thay đổi.
  const item: Dessert | undefined = useMemo(() => {
    if (!id) return undefined;
    return getById(id);
  }, [id, getById]);

  // Get user name from mapping
  const getUserName = (userId: string): string => {
    return USER_NAMES[userId] || "Anonymous User";
  };

  // Get avatar for user
  const getUserAvatar = (userId: string): string => {
    const index = parseInt(userId.replace("U0", "")) || 1;
    return `https://i.pravatar.cc/150?img=${index}`;
  };

  if (loading) return <ActivityIndicator size="large" style={styles.center} />;

  if (!item)
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Item not found 🧁</Text>
      </View>
    );

  // SỬA LỖI: Cập nhật hàm để gửi 'qty'
  const handleAddToCart = async () => {
    // Gửi 'item.id' và 'qty' (số lượng)
    const success = await addToCart(item.id, qty);

    if (success) {
      // CẢI TIẾN UX: Thêm thông tin rõ ràng và 2 lựa chọn
      setAlertConfig({
        title: "Added to Cart!",
        message: `🛒 ${qty} x ${item.name} has been added to your cart.`,
        buttons: [
          {
            text: "Continue Shopping",
            style: "cancel",
          },
          {
            text: "Go to Cart",
            onPress: () => router.push("/(tabs)/cart"),
          },
        ],
      });
      setAlertVisible(true);
    } else {
      setAlertConfig({
        title: "Not Logged In",
        message: "Please log in to add items to your cart.",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
    }
  };
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image source={{ uri: item.image }} style={styles.image} />
          {/* Favorite button (same style as Home) */}
          <View style={styles.favoriteBtnWrapper} pointerEvents="box-none">
            <FavoriteButton
              isFavorite={isFavorite(item.id)}
              onPress={() => toggleFavorite(item.id)}
              size={20}
            />
          </View>
          <View style={styles.content}>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>

            <View style={styles.pillsRow}>
              <Pill>
                {item.freeDelivery ? "🚚 Free delivery" : "💵 Delivery fee"}
              </Pill>
              <Pill>⏱ {item.deliveryTime || "20–30 min"}</Pill>
              <Pill>⭐ {item.rating}</Pill>
            </View>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.desc}>{item.description}</Text>

            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>
                Reviews ({item.reviews || 0})
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Reviews from dessert data */}
            {item.review?.map((r, idx) => (
              <View key={idx} style={styles.reviewCard}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={{
                      uri: getUserAvatar(r.idUser),
                    }}
                    style={styles.avatar}
                  />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.reviewer}>
                        {getUserName(r.idUser)}
                      </Text>
                      <Text style={styles.ratingText}>⭐ {r.rating}</Text>
                    </View>
                    <Text style={styles.reviewText}>{r.content}</Text>
                    <Text style={styles.dateTxt}>{r.date}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Thanh Add to Cart */}
        <View style={styles.bottomBar}>
          <View style={styles.qtyBox}>
            <TouchableOpacity
              onPress={() => setQty(Math.max(1, qty - 1))}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyTxt}>–</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNumber}>{qty}</Text>
            <TouchableOpacity
              onPress={() => setQty(qty + 1)}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyTxt}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
            <Text style={styles.cartTxt}>Add {qty} to cart</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Alert */}
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() => setAlertVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

// SỬA: Đổi tên 's' thành 'styles' cho dễ đọc
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 100 },
  image: { width: "100%", height: 260 },
  content: { padding: 16 },
  name: { fontSize: 22, fontWeight: "800", color: "#222", flex: 1 },
  price: { fontSize: 20, fontWeight: "800", color: "#ff6a00" },
  pillsRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 8,
    flexWrap: "wrap",
  },
  // 'pill' và 'pillTxt' đã được chuyển sang file components/Pill.tsx
  sectionTitle: { fontSize: 16, fontWeight: "800", marginTop: 10 },
  desc: { color: "#666", lineHeight: 20, marginTop: 6 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  seeAllText: { color: "#ff6a00", fontWeight: "600" },
  reviewCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  reviewer: { fontWeight: "700", fontSize: 15 },
  ratingText: { color: "#444", fontWeight: "600" },
  reviewText: { color: "#555", fontSize: 13, marginTop: 3, lineHeight: 18 },
  dateTxt: { fontSize: 12, color: "#999", marginTop: 3 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFound: { fontSize: 18, fontWeight: "700", color: "#999" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  qtyBox: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBtn: {
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyTxt: { fontSize: 18, fontWeight: "800" },
  qtyNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    minWidth: 20,
    textAlign: "center",
  },
  cartBtn: {
    backgroundColor: "#ff6a00",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1, // Làm nút 'Add to Cart' co giãn
  },
  cartTxt: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
  favoriteBtnWrapper: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});
