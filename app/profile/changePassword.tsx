import InputField from "@/components/InputField";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useCurrentUser } from "@/context/UserContext";
import { auth } from "@/firebase/firebaseConfig";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/CustomAlert";

export default function ChangePasswordScreen() {
  const router = useRouter();

  const { currentUser, editUser } = useCurrentUser();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

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

  const handleChangePassword = async () => {
    setOldPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    if (!currentUser) {
      setAlertConfig({
        title: "Lỗi",
        message:
          "Không thể tải thông tin người dùng. Vui lòng thử đăng nhập lại.",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
      return;
    }

    // Kiểm tra Firebase user
    const firebaseUser = auth.currentUser;
    console.log("🔐 Firebase user check:", {
      exists: !!firebaseUser,
      email: firebaseUser?.email,
      uid: firebaseUser?.uid,
    });

    if (!firebaseUser || !firebaseUser.email) {
      console.warn(
        "⚠️ Firebase user null - User đang dùng forceLogin (test mode)"
      );
      setAlertConfig({
        title: "⚠️ Test Mode",
        message:
          "Bạn đang dùng forceLogin (test mode). Để đổi mật khẩu, vui lòng đăng nhập thật qua form đăng nhập.",
        buttons: [
          {
            text: "Đăng nhập lại",
            onPress: async () => {
              setAlertVisible(false);
              // Logout và chuyển về màn login
              await signOut(auth);
              router.replace("/login-signUp/loginScreen");
            },
          },
          {
            text: "Đóng",
            style: "cancel",
            onPress: () => {
              setAlertVisible(false);
            },
          },
        ],
      });
      setAlertVisible(true);
      return;
    }

    // Kiểm tra input rỗng
    if (!oldPassword || !newPassword || !confirmPassword) {
      setAlertConfig({
        title: "Lỗi",
        message: "Vui lòng nhập đầy đủ thông tin.",
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
      console.log("🔐 Bắt đầu đổi mật khẩu...");

      // Bước 1: Xác thực lại mật khẩu cũ với Firebase
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        oldPassword
      );

      try {
        await reauthenticateWithCredential(firebaseUser, credential);
        console.log("✅ Xác thực mật khẩu cũ thành công");
      } catch (reauthError: any) {
        console.error("❌ Xác thực mật khẩu cũ thất bại:", reauthError.code);
        if (
          reauthError.code === "auth/wrong-password" ||
          reauthError.code === "auth/invalid-credential"
        ) {
          setOldPasswordError("Mật khẩu cũ không chính xác.");
        } else {
          setAlertConfig({
            title: "Lỗi",
            message: "Không thể xác thực mật khẩu cũ. Vui lòng thử lại.",
            buttons: [{ text: "OK" }],
          });
          setAlertVisible(true);
        }
        return;
      }

      // Bước 2: Cập nhật mật khẩu mới trên Firebase
      await updatePassword(firebaseUser, newPassword);
      console.log("✅ Đã cập nhật mật khẩu trên Firebase");

      // Thành công
      setAlertConfig({
        title: "Thành công",
        message: "Đổi mật khẩu thành công!",
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
    } catch (error: any) {
      console.error("❌ Lỗi đổi mật khẩu:", error);
      setAlertConfig({
        title: "Lỗi",
        message: error.message || "Đã xảy ra sự cố khi cập nhật mật khẩu.",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
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

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
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
