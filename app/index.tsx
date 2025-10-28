import { useCurrentUser } from "@/context/UserContext";
import { resetDatabase } from "@/services/userDatabaseServices";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { currentUser, isLoading } = useCurrentUser();
  const [dbReset, setDbReset] = useState(false);

  // 🔧 CHẠY 1 LẦN ĐỂ XÓA DATABASE CŨ - SAU ĐÓ XÓA CODE NÀY
  useEffect(() => {
    const resetOnce = async () => {
      try {
        console.log("🔄 Đang reset database để xóa cột _id cũ...");
        await resetDatabase();
        console.log("✅ Database đã được reset thành công!");
        setDbReset(true);
      } catch (e) {
        console.error("❌ Lỗi khi reset database:", e);
        setDbReset(true); // Vẫn tiếp tục
      }
    };
    resetOnce();
  }, []);

  useEffect(() => {
    if (!dbReset || isLoading) return; // Đợi reset xong và load user

    const timeout = setTimeout(() => {
      if (currentUser) {
        // Đã có user trong database → vào trang chính
        router.replace("/(tabs)");
      } else {
        // Chưa có user → vào trang đăng nhập
        router.replace("/login-signUp/loginScreen");
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [currentUser, isLoading, dbReset]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}>
      <ActivityIndicator size="large" color="#ff6a00" />
      <Text style={{ marginTop: 16, color: "#666" }}>
        {!dbReset ? "Resetting database..." : "Loading..."}
      </Text>
    </View>
  );
}
