import { useCurrentUser } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return; // Đợi load user từ database

    // Điều hướng dựa trên trạng thái user
    const timeout = setTimeout(() => {
      if (currentUser) {
        // ✅ Đã có user trong database (đã đăng nhập) → vào trang chính
        console.log("✅ User đã đăng nhập:", currentUser.username);
        router.replace("/(tabs)");
      } else {
        // ❌ Chưa có user → bắt buộc đăng nhập
        console.log("📭 Chưa có user, chuyển đến trang đăng nhập");
        router.replace("/login-signUp/loginScreen");
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [currentUser, isLoading, router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <ActivityIndicator size="large" color="#ff6a00" />
      <Text style={{ marginTop: 16, color: "#666", fontSize: 16 }}>
        {isLoading ? "Đang tải..." : "Đang chuyển hướng..."}
      </Text>
    </View>
  );
}
