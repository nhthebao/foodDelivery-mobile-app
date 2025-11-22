import SettingItem from "@/components/SettingItem";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useCurrentUser } from "../../context/UserContext";

export default function ProfileScreen() {
  const { currentUser } = useCurrentUser();
  const router = useRouter();

  // Nếu chưa đăng nhập, hiển thị màn hình yêu cầu đăng nhập
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
          <Text style={styles.emptySubtitle}>
            Please log in to view your personal information
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/login-signUp/loginScreen")}
          >
            <Text style={styles.actionButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* --- HEADER --- */}
      <View style={styles.top}>
        <Image
          source={
            currentUser?.image
              ? { uri: currentUser.image }
              : require("../../assets/images/avatar.png")
          }
          style={styles.avatar}
        />
        <View style={{ marginLeft: 12 }}>
          {/* 'currentUser?.' là cách làm đúng */}
          <Text style={styles.name}>
            {currentUser?.fullName || "Họ và tên"}
          </Text>
          <Text style={styles.phone}>
            {currentUser?.phone || "Số điện thoại"}
          </Text>
        </View>
      </View>

      {/* --- DANH SÁCH CÀI ĐẶT --- */}
      <View style={styles.section}>
        {/* Order History */}
        <SettingItem label="Order History" href="/profile/orderHistory" />

        {/* Cài đặt */}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 60,
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
    backgroundColor: "#f26522",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#f26522",
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
