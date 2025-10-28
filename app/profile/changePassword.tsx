import InputField from "@/components/InputField";
import { Ionicons } from "@expo/vector-icons"; // Import Icon
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"; // Import Alert
import { UserContext } from "../context/UserContext"; // Import Context

export default function ChangePasswordScreen() {
  const router = useRouter();

  // Lấy context
  const context = useContext(UserContext);
  const currentUser = context?.currentUser;
  const editUser = context?.editUser;

  // State cho input
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // SỬA 1: Thêm state cho các thông báo lỗi
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // SỬA 2: Cập nhật logic đổi mật khẩu
  const handleChangePassword = async () => {
    // 0. Reset tất cả các lỗi trước khi kiểm tra
    setOldPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    // 1. Kiểm tra context
    if (!currentUser || !editUser) {
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng.");
      return;
    }

    // 2. Kiểm tra input rỗng (vẫn dùng Alert vì đây là lỗi chung)
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    // 3. Kiểm tra mật khẩu mới trùng khớp (Ưu tiên kiểm tra này trước)
    if (newPassword !== confirmPassword) {
      // Hiển thị lỗi dưới ô input
      setConfirmPasswordError("Mật khẩu mới không khớp.");
      return;
    }

    // 4. Kiểm tra mật khẩu cũ
    if (oldPassword !== currentUser.password) {
      // Hiển thị lỗi dưới ô input
      setOldPasswordError("Mật khẩu cũ không chính xác.");
      return;
    }

    // 5. Kiểm tra mật khẩu mới khác mật khẩu cũ
    if (newPassword === oldPassword) {
      // Hiển thị lỗi dưới ô input MỚI
      setNewPasswordError("Mật khẩu mới phải khác mật khẩu cũ.");
      return;
    }

    // 6. Cập nhật mật khẩu (nếu tất cả đều qua)
    try {
      await editUser({ password: newPassword });
      Alert.alert("Thành công", "Đổi mật khẩu thành công!");
      router.back();
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      Alert.alert("Lỗi", "Đã xảy ra sự cố khi cập nhật.");
    }
  };

  return (
    <View style={styles.container}>
      {/* --- HEADER (Giữ nguyên) --- */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* --- FORM --- */}
      <View style={styles.form}>
        <Text style={styles.label}>Old Password</Text>
        <InputField
          value={oldPassword}
          onChangeText={setOldPassword}
          placeholder="Enter old password"
          secureTextEntry
        />
        {/* SỬA 3: Hiển thị lỗi Mật khẩu cũ */}
        {oldPasswordError ? (
          <Text style={styles.errorText}>{oldPasswordError}</Text>
        ) : null}

        <Text style={styles.label}>New Password</Text>
        <InputField
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry
        />
        {/* SỬA 4: Hiển thị lỗi Mật khẩu mới */}
        {newPasswordError ? (
          <Text style={styles.errorText}>{newPasswordError}</Text>
        ) : null}

        <Text style={styles.label}>Confirm New Password</Text>
        <InputField
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry
        />
        {/* SỬA 5: Hiển thị lỗi Xác nhận MK */}
        {confirmPasswordError ? (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.changeButton}
          onPress={handleChangePassword}>
          <Text style={styles.changeButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// SỬA 6: Thêm style 'errorText'
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  form: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  // Style cho text báo lỗi
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 4,
  },
  changeButton: {
    backgroundColor: "#f26522",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 30,
  },
  changeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
