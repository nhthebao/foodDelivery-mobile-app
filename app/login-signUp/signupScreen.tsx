import { CustomAlert } from "@/components/CustomAlert";
import { useCurrentUser } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ORANGE = "#ff6a00";

export default function SignupScreen() {
  const router = useRouter();
  const { register } = useCurrentUser();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const onSignUp = async () => {
    // Validation
    if (!fullName.trim()) {
      showAlert("Lỗi", "Vui lòng nhập họ tên");
      return;
    }

    if (!phone.trim()) {
      showAlert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    if (!address.trim()) {
      showAlert("Lỗi", "Vui lòng nhập địa chỉ");
      return;
    }

    if (!username.trim()) {
      showAlert("Lỗi", "Vui lòng nhập tên đăng nhập");
      return;
    }

    if (!password.trim()) {
      showAlert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 6) {
      showAlert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (!accepted) {
      showAlert("Lỗi", "Vui lòng chấp nhận Điều khoản và Điều kiện");
      return;
    }

    setLoading(true);
    try {
      const success = await register({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        username: username.trim(),
        password: password,
        payment: "momo", // Default payment method
      });

      if (success) {
        // Navigate immediately without delay for better UX
        router.replace("/(tabs)");
      } else {
        showAlert(
          "Đăng ký thất bại",
          "Tên đăng nhập đã tồn tại hoặc có lỗi xảy ra"
        );
      }
    } catch (error) {
      console.error("Register error:", error);
      showAlert("Lỗi", "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingBottom: 20, backgroundColor: "white" }}
        behavior={Platform.select({ ios: "padding", android: undefined })}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}>
            <View style={styles.backCircle}>
              <Text style={{ fontSize: 18 }}>‹</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>
            Hãy tham gia cùng chúng tôi ngày hôm nay. Nhanh chóng, dễ dàng và
            chỉ mất một bước!
          </Text>

          <View style={{ marginTop: 18 }}>
            <Text style={styles.label}>Họ tên</Text>
            <TextInput
              placeholder="Nhập họ tên..."
              placeholderTextColor="#999"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Số điện thoại</Text>
            <TextInput
              placeholder="Nhập số điện thoại..."
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!loading}
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Địa chỉ</Text>
            <TextInput
              placeholder="Nhập địa chỉ..."
              placeholderTextColor="#999"
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              editable={!loading}
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Tên đăng nhập</Text>
            <TextInput
              placeholder="Nhập tên đăng nhập..."
              placeholderTextColor="#999"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loading}
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Mật khẩu</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Nhập mật khẩu..."
                secureTextEntry={hidePassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setHidePassword((s) => !s)}
                disabled={loading}>
                <Ionicons
                  name={hidePassword ? "eye-off" : "eye"}
                  size={22}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>
              Xác nhận mật khẩu
            </Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Nhập lại mật khẩu..."
                secureTextEntry={hideConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setHideConfirmPassword((s) => !s)}
                disabled={loading}>
                <Ionicons
                  name={hideConfirmPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAccepted((s) => !s)}
              activeOpacity={0.8}
              disabled={loading}>
              <View
                style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                {accepted && <Text style={{ color: "#fff" }}>✓</Text>}
              </View>
              <Text style={{ color: "#666", marginLeft: 10, flex: 1 }}>
                Bằng cách tạo tài khoản, bạn đồng ý với{" "}
                <Text style={{ color: ORANGE }}>Điều khoản và Điều kiện</Text>{" "}
                và <Text style={{ color: ORANGE }}>Chính sách Bảo mật</Text> của
                chúng tôi.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={onSignUp}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Đăng ký</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => router.push("/login-signUp/loginScreen")}
            disabled={loading}>
            <Text style={{ color: "#666" }}>
              Đã có tài khoản?{" "}
              <Text style={{ color: ORANGE, fontWeight: "600" }}>
                Đăng nhập
              </Text>
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
        </ScrollView>
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

  label: { color: "#222", marginBottom: 6 },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e6e8ec",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  termsRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 14 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: { backgroundColor: ORANGE, borderColor: ORANGE },

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

  footerLink: { alignSelf: "center", marginTop: 22, marginBottom: 30 },
});
