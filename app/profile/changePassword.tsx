import InputField from "@/components/InputField";
import AlertModal from "@/components/AlertModal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useCurrentUser } from "@/context/UserContext";
import * as apiService from "@/services/apiUserServices";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderPadding } from "../../hooks/useHeaderPadding";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const headerPadding = useHeaderPadding();

  const { currentUser, editUser, jwtToken } = useCurrentUser();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ Checkbox state

  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    buttons: [] as {
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }[],
  });

  const handleChangePassword = async () => {
    setOldPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    if (!currentUser) {
      setAlertConfig({
        title: "❌ Lỗi",
        message:
          "Không thể tải thông tin người dùng. Vui lòng thử đăng nhập lại.",
        type: "error",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
      return;
    }

    // Kiểm tra input rỗng
    if (!oldPassword || !newPassword || !confirmPassword) {
      setAlertConfig({
        title: "⚠️ Thiếu Thông Tin",
        message: "Vui lòng nhập đầy đủ thông tin.",
        type: "warning",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
      return;
    }

    // Kiểm tra mật khẩu mới trùng khớp
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu mới không khớp.");
      return;
    }

    // Kiểm tra mật khẩu mới khác mật khẩu cũ
    if (newPassword === oldPassword) {
      setNewPasswordError("Mật khẩu mới phải khác mật khẩu cũ.");
      return;
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      setNewPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      console.log("🔐 Bắt đầu đổi mật khẩu qua service layer...");

      // ✅ Gọi service layer để thay đổi mật khẩu
      if (!jwtToken) {
        setAlertConfig({
          title: "⚠️ Phiên Hết Hạn",
          message: "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.",
          type: "warning",
          buttons: [
            {
              text: "Đăng nhập lại",
              onPress: async () => {
                setAlertVisible(false);
                router.replace("/login-signUp/loginScreen");
              },
            },
          ],
        });
        setAlertVisible(true);
        return;
      }

      const success = await apiService.changePasswordLoggedIn(
        jwtToken,
        oldPassword.trim(),
        newPassword.trim()
      );

      if (success) {
        console.log("✅ Đổi mật khẩu thành công");
        setAlertConfig({
          title: "✅ Thành Công",
          message: "Đổi mật khẩu thành công!",
          type: "success",
          buttons: [
            {
              text: "OK",
              onPress: () => {
                setAlertVisible(false);
                router.back();
              },
            },
          ],
        });
        setAlertVisible(true);

        // Reset form
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        console.error("❌ Đổi mật khẩu thất bại");
        setOldPasswordError("Mật khẩu cũ không chính xác.");
        setAlertConfig({
          title: "❌ Lỗi",
          message: "Mật khẩu cũ không chính xác. Vui lòng thử lại.",
          type: "error",
          buttons: [{ text: "OK" }],
        });
        setAlertVisible(true);
      }
    } catch (error: any) {
      console.error("❌ Lỗi đổi mật khẩu:", error);
      setAlertConfig({
        title: "❌ Lỗi",
        message: error.message || "Đã xảy ra sự cố khi cập nhật mật khẩu.",
        type: "error",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
    }
  };

  return (
    <View style={styles.notchCover}>
      <SafeAreaView
        style={[styles.container, { flex: 1, backgroundColor: "#fff" }]}
        edges={[]}
      >
        {/* --- HEADER (Giữ nguyên) --- */}
        <View style={[styles.header, { paddingTop: headerPadding }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
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
            secureTextEntry={!showPassword}
          />
          {oldPasswordError ? (
            <Text style={styles.errorText}>{oldPasswordError}</Text>
          ) : null}

          <Text style={styles.label}>New Password</Text>
          <InputField
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry={!showPassword}
          />
          {newPasswordError ? (
            <Text style={styles.errorText}>{newPasswordError}</Text>
          ) : null}

          <Text style={styles.label}>Confirm New Password</Text>
          <InputField
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry={!showPassword}
          />
          {confirmPasswordError ? (
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
          ) : null}

          {/* ✅ Show/Hide Password Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.6}
          >
            <View
              style={[styles.checkbox, showPassword && styles.checkboxChecked]}
            >
              {showPassword && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Show all passwords</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changeButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.changeButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* Alert Modal */}
        <AlertModal
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
          onClose={() => setAlertVisible(false)}
        />
      </SafeAreaView>
    </View>
  );
}

// --- STYLES (Giữ nguyên) ---
const styles = StyleSheet.create({
  notchCover: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
  // ✅ Checkbox styles
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#ff6a00",
    borderColor: "#ff6a00",
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
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
