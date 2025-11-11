import * as apiService from "@/services/apiUserServices";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function NewPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✅ Checkbox state
  const router = useRouter();
  const params = useLocalSearchParams();

  // Support both methods: email and phone
  // Both methods now use temporary token from backend
  const temporaryToken = (params as any).temporaryToken as string | undefined;
  const method = (params as any).method as string | undefined;

  const onResetPassword = async () => {
    // Validation
    if (!password.trim() || !confirm.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Lỗi", "Mật khẩu không khớp");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    // Check temporary token (required for both methods)
    if (!temporaryToken) {
      Alert.alert("Lỗi", "Token không hợp lệ. Vui lòng thử lại.");
      return;
    }

    setLoading(true);
    try {
      console.log(`� Changing password (${method} method)...`);

      // Both email and phone methods use temporary token from backend
      const success = await apiService.changePasswordWithResetToken(
        temporaryToken,
        password.trim()
      );

      if (success) {
        Alert.alert(
          "✅ Thành công",
          "Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại."
        );
        router.push("/forgot-password/success");
      } else {
        Alert.alert("❌ Lỗi", "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error("❌ Lỗi reset password:", err);
      Alert.alert("❌ Lỗi", err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>New Password</Text>
          <Text style={styles.subtitle}>
            Create a new password that is safe and easy to remember
          </Text>

          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            editable={!loading}
          />

          <Text style={styles.label}>Confirm New password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="********"
            editable={!loading}
          />

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
            <Text style={styles.checkboxLabel}>Show password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={onResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create New Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 20 },
  subtitle: { color: "#666", marginVertical: 10 },
  label: { marginTop: 15, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
  },
  // ✅ Checkbox styles
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
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
    backgroundColor: "#E76F00",
    borderColor: "#E76F00",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#E76F00",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
