// app/profile-screen.tsx
import SettingItem from "@/components/SettingItem";
import { Link } from "expo-router";
import React, { useContext } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// SỬA 1: Đảm bảo path này trỏ đúng đến file context của bạn
import { UserContext } from "../context/UserContext";

export default function ProfileScreen() {
  // SỬA 2: Lấy context một cách an toàn hơn
  // context có thể là null (nếu provider đang loading)
  // nên ta dùng ?. (optional chaining)
  const context = useContext(UserContext);
  const currentUser = context?.currentUser;
  const logOut = context?.logOut; // Lấy luôn hàm logOut

  // SỬA 3: Xử lý hàm logout
  // (Giả sử /modals/log-out-modal là màn hình popup hỏi "Bạn có chắc không?")
  // Nếu bạn muốn nút này logout ngay lập tức, bạn sẽ làm khác:
  // <TouchableOpacity style={styles.logoutBtn} onPress={logOut}>
  //   <Text style={styles.logoutText}>Logout</Text>
  // </TouchableOpacity>

  return (
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <View style={styles.top}>
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/40.jpg" }}
          style={styles.avatar}
        />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>
            {/* Phần code này của bạn đã hoàn hảo.
              Nếu currentUser tồn tại, dùng fullName.
              Nếu không, dùng "Lucas Nathan" làm dự phòng.
            */}
            {currentUser?.fullName || "Unknown"}
          </Text>
          <Text style={styles.phone}>{currentUser?.phone || "0855999411"}</Text>
        </View>
      </View>

      {/* --- DANH SÁCH CÀI ĐẶT --- */}
      <View style={styles.section}>
        <SettingItem label="Edit Profile" href="/profile/personalData" />
        <SettingItem label="Change Password" href="/profile/changePassword" />
        <SettingItem label="Help & Support" href="/profile/helpCenter" />
        <SettingItem label="Privacy & Policy" href="/profile/privacyPolicy" />
      </View>

      <View style={{ flex: 1 }} />

      {/* --- NÚT ĐĂNG XUẤT --- */}
      {/* (Giữ nguyên code của bạn) */}
      <Link href="/modals/logOutModal" asChild>
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (giữ nguyên styles của bạn)
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  top: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  name: { fontSize: 18, fontWeight: "700" },
  phone: { color: "#666", marginTop: 4 },
  section: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" },
  row: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: { fontSize: 16 },
  logoutBtn: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f2a365",
  },
  logoutText: { color: "#f26522", fontWeight: "700" },
});
