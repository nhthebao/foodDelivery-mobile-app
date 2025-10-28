import { useCurrentUser } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

const OrderSuccessScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const { currentUser, updateCart } = useCurrentUser();

  useEffect(() => {
    // Xóa CÁC SẢN PHẨM ĐÃ MUA khỏi giỏ hàng
    const removeSelectedItemsFromCart = async () => {
      try {
        console.log("🧹 Đang xóa các sản phẩm đã mua khỏi giỏ hàng...");

        // Lấy danh sách IDs đã chọn từ params
        const selectedItemIds = params.selectedItemIds
          ? JSON.parse(params.selectedItemIds as string)
          : [];

        console.log("   Items đã mua:", selectedItemIds);

        if (!currentUser || selectedItemIds.length === 0) {
          console.log("⚠️ Không có items để xóa");
          return;
        }

        // Lọc ra các items KHÔNG nằm trong danh sách đã mua
        const remainingCart = currentUser.cart.filter(
          (cartItem) => !selectedItemIds.includes(cartItem.item)
        );

        console.log(
          `   Xóa ${
            currentUser.cart.length - remainingCart.length
          } items khỏi giỏ hàng`
        );
        console.log(`   Còn lại ${remainingCart.length} items trong giỏ hàng`);

        // Cập nhật giỏ hàng mới (đã loại bỏ items đã mua)
        await updateCart(remainingCart);
        console.log("✅ Đã xóa các sản phẩm đã mua thành công!");
      } catch (error) {
        console.error("❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
      }
    };

    removeSelectedItemsFromCart();

    // Hiệu ứng phóng to
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    // Sau 0.8s chuyển sang màn hình chính
    const timer = setTimeout(() => {
      router.push("/(tabs)");
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark" size={50} color="#f26522" />
        </Animated.View>
        <Text style={styles.title}>Order Successfully</Text>
        <Text style={styles.subtitle}>
          Happy! Your food will be made immediately and we will send it after
          it&apos;s finished by the courier.
        </Text>
      </View>
    </View>
  );
};

export default OrderSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f26522",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  circle: {
    backgroundColor: "#fff",
    borderRadius: 100,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
