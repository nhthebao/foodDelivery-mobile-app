import InputField from "@/components/InputField";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react"; // SỬA 1: Xóa 'useContext' vì đã dùng hook
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// SỬA 2: Import hook 'useCurrentUser' thay vì 'UserContext'
// Giả sử file context của bạn nằm ở "../context/UserContext.tsx" (hoặc .js)
import { useCurrentUser } from "@/context/UserContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const router = useRouter();

  // SỬA 3: Sử dụng hook 'useCurrentUser' để lấy context
  // Hook này sẽ trả về thẳng các giá trị bạn cần
  const { currentUser, editUser } = useCurrentUser();

  // State cho input (Giữ nguyên)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State cho các thông báo lỗi (Giữ nguyên)
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleChangePassword = async () => {
    // 0. Reset tất cả các lỗi (Giữ nguyên)
    setOldPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    // SỬA 4: Đơn giản hóa kiểm tra context
    // Hook 'useCurrentUser' đã đảm bảo 'editUser' luôn tồn tại (hoặc văng lỗi)
    // Chúng ta chỉ cần kiểm tra 'currentUser' có null hay không (nghĩa là user chưa đăng nhập)
    if (!currentUser) {
      Alert.alert(
        "Lỗi",
        "Không thể tải thông tin người dùng. Vui lòng thử đăng nhập lại."
      );
      return;
    }

    // 2. Kiểm tra input rỗng (Giữ nguyên)
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    // 3. Kiểm tra mật khẩu mới trùng khớp (Giữ nguyên)
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu mới không khớp.");
      return;
    }

    // 4. Kiểm tra mật khẩu cũ (Giữ nguyên)
    if (oldPassword !== currentUser.password) {
      setOldPasswordError("Mật khẩu cũ không chính xác.");
      return;
    }

    // 5. Kiểm tra mật khẩu mới khác mật khẩu cũ (Giữ nguyên)
    if (newPassword === oldPassword) {
      setNewPasswordError("Mật khẩu mới phải khác mật khẩu cũ.");
      return;
    }

    // 6. Cập nhật mật khẩu (Giữ nguyên)
    try {
      // 'editUser' đã được lấy trực tiếp từ hook
      await editUser({ password: newPassword });
      Alert.alert("Thành công", "Đổi mật khẩu thành công!");
      router.back();
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      Alert.alert("Lỗi", "Đã xảy ra sự cố khi cập nhật.");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { flex: 1, backgroundColor: "#fff" }]}
      edges={["top"]}>
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

      {/* --- FORM (Giữ nguyên) --- */}
      <View style={styles.form}>
        <Text style={styles.label}>Old Password</Text>
        <InputField
          value={oldPassword}
          onChangeText={setOldPassword}
          placeholder="Enter old password"
          secureTextEntry
        />
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
        {confirmPasswordError ? (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.changeButton}
          onPress={handleChangePassword}>
          <Text style={styles.changeButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- STYLES (Giữ nguyên) ---
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
