import { CustomAlert } from "@/app/modals/CustomAlert";
import { useCurrentUser } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ORANGE = "#ff6a00";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useCurrentUser();

  const [method, setMethod] = useState<"username" | "phone">("username");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const tabStyle = (t: "username" | "phone") =>
    method === t ? styles.tabActive : styles.tabInactive;

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // 🟢 Đăng nhập bằng username + password
  // Chỉ cần validate input, context sẽ xử lý tất cả Firebase + server communication
  const loginByUsername = async (
    usernameInput: string,
    passwordInput: string
  ): Promise<boolean> => {
    try {
      const success = await login(usernameInput, passwordInput);
      return success;
    } catch (err: any) {
      // ⚠️ Use console.log to avoid red screen
      console.log("❌ Lỗi khi đăng nhập bằng username:", err?.message);
      // Re-throw to be caught by onSignIn
      throw err;
    }
  };

  // 🔸 Đăng nhập bằng phone
  // Phone được lưu cùng email, nên dùng phone như identifier
  const loginByPhone = async (
    phoneInput: string,
    passwordInput: string
  ): Promise<boolean> => {
    try {
      // Phone không phải email, nên context sẽ fetch username từ phone
      // Có thể cần thay đổi: sử dụng phone như identifier
      const success = await login(phoneInput, passwordInput);
      return success;
    } catch (err: any) {
      // ⚠️ Use console.log to avoid red screen
      console.log("❌ Login by phone error:", err?.message);
      // Re-throw to be caught by onSignIn
      throw err;
    }
  };

  const onSignIn = async () => {
    if (method === "phone") {
      if (!phone.trim()) {
        showAlert("Lỗi", "Vui lòng nhập số điện thoại");
        return;
      }

      if (!password.trim()) {
        showAlert("Lỗi", "Vui lòng nhập mật khẩu");
        return;
      }

      setLoading(true);
      try {
        const success = await loginByPhone(phone.trim(), password);
        if (success) {
          router.replace("/(tabs)");
        }
      } catch (error: any) {
        // ⚠️ Use console.log to avoid red screen
        console.log("Login error:", error?.message);
        // Display user-friendly error message from context
        showAlert(
          "Đăng nhập thất bại",
          error?.message || "Đã xảy ra lỗi không xác định"
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // 🟢 Đăng nhập bằng username
    if (method === "username") {
      if (!username.trim()) {
        showAlert("Lỗi", "Vui lòng nhập tên đăng nhập");
        return;
      }

      if (!password.trim()) {
        showAlert("Lỗi", "Vui lòng nhập mật khẩu");
        return;
      }

      setLoading(true);
      try {
        const success = await loginByUsername(username.trim(), password);
        if (success) {
          router.replace("/(tabs)");
        }
      } catch (error: any) {
        // ⚠️ Use console.log to avoid red screen
        console.log("Login error:", error?.message);
        // Display user-friendly error message from context
        showAlert(
          "Đăng nhập thất bại",
          error?.message || "Đã xảy ra lỗi không xác định"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.container}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <View style={styles.backCircle}>
              <Text style={{ fontSize: 18 }}>‹</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={tabStyle("username")}
              onPress={() => setMethod("username")}
            >
              <Text
                style={
                  method === "username"
                    ? styles.tabTextActive
                    : styles.tabTextInactive
                }
              >
                Username
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tabStyle("phone")}
              onPress={() => setMethod("phone")}
            >
              <Text
                style={
                  method === "phone"
                    ? styles.tabTextActive
                    : styles.tabTextInactive
                }
              >
                Phone Number
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Form */}
          <View style={{ marginTop: 18, width: "100%" }}>
            {method === "username" ? (
              <>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username..."
                  placeholderTextColor="#999"
                  textContentType="username"
                  value={username}
                  onChangeText={setUsername}
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Phone number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number..."
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </>
            )}

            <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password..."
                placeholderTextColor="#999"
                secureTextEntry={hidePassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setHidePassword((s) => !s)}
              >
                <Ionicons
                  name={hidePassword ? "eye-off" : "eye"}
                  size={22}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => router.push("/forgot-password/forgotPassword")}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={onSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Or continue with */}
          <View style={styles.orContinueContainer}>
            <Text style={styles.orContinueText}>Or continue with</Text>
            <View style={styles.socialButtonsRow}>
              {/* Google */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  showAlert("Google", "Google login not implemented yet")
                }
              >
                <Image
                  source={{
                    uri: "https://res.cloudinary.com/dwxj422dk/image/upload/v1762275301/search_rgerih.png",
                  }}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>

              {/* Facebook */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  showAlert("Facebook", "Facebook login not implemented yet")
                }
              >
                <Image
                  source={{
                    uri: "https://res.cloudinary.com/dwxj422dk/image/upload/v1762275301/facebook_ih0r0s.png",
                  }}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>

              {/* Apple - Temporarily hidden */}
              {/* <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  showAlert("Apple", "Apple login not implemented yet")
                }
              >
                <Image
                  source={{
                    uri: "apple-icon-url-here",
                  }}
                  style={styles.socialIcon}
                />
              </TouchableOpacity> */}
            </View>
          </View>

          {/* Footer */}
          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => router.push("/login-signUp/signupScreen")}
          >
            <Text style={{ color: "#666" }}>
              Don&apos;t have an account?{" "}
              <Text style={{ color: ORANGE, fontWeight: "600" }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          <CustomAlert
            visible={alertVisible}
            title={alertTitle}
            message={alertMessage}
            buttons={[
              {
                text: "OK",
                onPress: () => setAlertVisible(false),
              },
            ]}
            onClose={() => setAlertVisible(false)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, backgroundColor: "#fff" },
  backBtn: { marginTop: 6 },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#f2f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "700", marginTop: 14 },
  subtitle: { color: "#7d7d7d", marginTop: 6 },
  tabs: {
    marginTop: 18,
    flexDirection: "row",
    backgroundColor: "#f6f7f9",
    borderRadius: 12,
    padding: 6,
  },
  tabInactive: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  tabTextActive: { color: "#111", fontWeight: "600" },
  tabTextInactive: { color: "#999" },
  label: { color: "#222", marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#e6e8ec",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  eyeBtn: {
    position: "absolute",
    right: 12,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  forgotRow: { alignItems: "flex-end", marginTop: 10 },
  forgotText: { color: ORANGE, fontWeight: "600" },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: ORANGE,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  orContinueContainer: { alignItems: "center", marginTop: 24 },
  orContinueText: { color: "#888", fontSize: 14, marginBottom: 12 },
  socialButtonsRow: { flexDirection: "row", justifyContent: "center", gap: 16 },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e6e8ec",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  socialIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  footerLink: { alignSelf: "center", marginTop: 22 },
});
