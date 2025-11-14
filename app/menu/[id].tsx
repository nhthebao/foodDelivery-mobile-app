// file: MenuDetail.tsx (Đã viết lại)

import { CustomAlert } from "@/components/CustomAlert";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Pill } from "@/components/Pill"; // SỬA: Import 'Pill' từ file riêng
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
import { useUserList } from "../../context/UserListContext";
import { Dessert, Review } from "../../types/types";

// Định nghĩa kiểu cho review đã được "populate"
interface PopulatedReview extends Review {
  user: { fullName: string; image: string } | undefined;
}

export default function MenuDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter(); // SỬA: Khởi tạo router
  const { getById, loading, addToCart, toggleFavorite, isFavorite } =
    useDessert();
  const { getById: getUserById, loading: userLoading } = useUserList();
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

  // TỐI ƯU 2: Lấy thông tin user cho review 1 lần
  const populatedReviews: PopulatedReview[] = useMemo(() => {
    if (!item || !item.review) return [];
    return item.review.map((r) => ({
      ...r,
      user: getUserById(r.idUser), // Lấy user và gán vào review
    }));
  }, [item, getUserById]);

  if (loading || userLoading)
    return <ActivityIndicator size="large" style={styles.center} />;

  if (!item)
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Không tìm thấy món ăn 🧁</Text>
      </View>
    );

  // SỬA LỖI: Cập nhật hàm để gửi 'qty'
  const handleAddToCart = async () => {
    // Gửi 'item.id' và 'qty' (số lượng)
    const success = await addToCart(item.id, qty);

    if (success) {
      // CẢI TIẾN UX: Thêm thông tin rõ ràng và 2 lựa chọn
      setAlertConfig({
        title: "Đã thêm vào giỏ hàng!",
        message: `🛒 ${qty} x ${item.name} đã được thêm vào giỏ hàng và đồng bộ lên API.`,
        buttons: [
          {
            text: "Tiếp tục mua sắm",
            style: "cancel",
          },
          {
            text: "Đến giỏ hàng",
            onPress: () => router.push("/(tabs)/cart"),
          },
        ],
      });
      setAlertVisible(true);
    } else {
      setAlertConfig({
        title: "Chưa đăng nhập",
        message: "Vui lòng đăng nhập để thêm món ăn vào giỏ hàng.",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
    }
  };
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
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
                {item.freeDelivery
                  ? "🚚 Miễn phí giao hàng"
                  : "💵 Phí giao hàng"}
              </Pill>
              <Pill>⏱ {item.deliveryTime || "20–30 phút"}</Pill>
              <Pill>⭐ {item.rating}</Pill>
            </View>

            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.desc}>{item.description}</Text>

            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>
                Đánh giá ({item.reviews || 0})
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {/* SỬA: Dùng 'populatedReviews' đã được tối ưu */}
            {populatedReviews.map((r, idx) => (
              <View key={idx} style={styles.reviewCard}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={{
                      uri: r.user?.image || "https://i.pravatar.cc/150?img=1",
                    }}
                    style={styles.avatar}
                  />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.reviewer}>
                        {r.user?.fullName || "Người dùng ẩn danh"}
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
            <Text style={styles.cartTxt}>Thêm {qty} vào giỏ hàng</Text>
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
