import SettingItem from "@/components/SettingItem";
import { Link } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useCurrentUser } from "../../context/UserContext";

export default function ProfileScreen() {
  const { currentUser } = useCurrentUser();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* --- HEADER --- */}
      <View style={styles.top}>
        <Image
          source={{
            uri:
              currentUser?.image ||
              "https://randomuser.me/api/portraits/men/40.jpg",
          }}
          style={styles.avatar}
        />
        <View style={{ marginLeft: 12 }}>
          {/* 'currentUser?.' là cách làm đúng */}
          <Text style={styles.name}>{currentUser?.fullName || "Unknown"}</Text>
          <Text style={styles.phone}>{currentUser?.phone || "0855999411"}</Text>
        </View>
      </View>

      {/* --- DANH SÁCH CÀI ĐẶT --- */}
      <View style={styles.section}>
        {/* SỬA 3: Đảm bảo các đường dẫn này chính xác */}
        {/* (Giả sử file changePassword.tsx nằm ở app/profile/changePassword.tsx) */}
        <SettingItem label="Edit Profile" href="/profile/personalData" />
        <SettingItem label="Change Password" href="/profile/changePassword" />
        <SettingItem label="Help & Support" href="/profile/helpCenter" />
        <SettingItem label="Privacy & Policy" href="/profile/privacyPolicy" />
      </View>

      <View style={{ flex: 1 }} />

      {/* --- NÚT ĐĂNG XUẤT --- */}
      {/* Giả định: Modal '/modals/logOutModal' sẽ gọi hàm 'logOut' */}
      <Link href="/modals/logOutModal" asChild>
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

// (Styles của bạn giữ nguyên)
const styles = StyleSheet.create({
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
