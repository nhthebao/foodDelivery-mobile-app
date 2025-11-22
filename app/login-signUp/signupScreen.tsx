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

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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
    const {
      fullName,
      phone,
      address,
      username,
      email,
      password,
      confirmPassword,
    } = form;

    if (!fullName.trim())
      return showAlert("Error", "Please enter your full name");
    if (!phone.trim()) return showAlert("Error", "Please enter phone number");
    if (!address.trim()) return showAlert("Error", "Please enter address");
    if (!username.trim()) return showAlert("Error", "Please enter username");
    if (!email.trim()) return showAlert("Error", "Please enter email");
    if (!email.includes("@"))
      return showAlert("Error", "Invalid email, please check again");
    if (!password.trim()) return showAlert("Error", "Please enter password");
    if (password.length < 6)
      return showAlert("Error", "Password must be at least 6 characters");
    if (password !== confirmPassword)
      return showAlert("Error", "Password confirmation does not match");
    if (!accepted)
      return showAlert("Error", "Please accept Terms and Conditions");

    setLoading(true);
    try {
      const success = await register({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        paymentMethod: "momo",
        image:
          "https://firebasestorage.googleapis.com/v0/b/fooddelivery-15d47.firebasestorage.app/o/03ebd625cc0b9d636256ecc44c0ea324.jpg?alt=media&token=1632c189-ec3d-447b-8f3c-28048ae9812a",
      });

      if (success) router.replace("/login-signUp/loginScreen");
      else showAlert("Registration failed", "Email or username already exists");
    } catch (error) {
      console.error("Register error:", error);
      showAlert(
        "Error",
        "An error occurred during registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>
            Cùng tham gia và trải nghiệm ngay hôm nay!
          </Text>

          <View style={{ marginTop: 20 }}>
            {[
              {
                key: "fullName",
                label: "Full Name",
                placeholder: "Enter full name...",
              },
              {
                key: "phone",
                label: "Phone Number",
                placeholder: "Enter phone number...",
                keyboardType: "phone-pad",
              },
              {
                key: "address",
                label: "Address",
                placeholder: "Enter address...",
              },
              {
                key: "username",
                label: "Username",
                placeholder: "Enter username...",
                autoCapitalize: "none",
              },
              {
                key: "email",
                label: "Email",
                placeholder: "Enter email...",
                autoCapitalize: "none",
                keyboardType: "email-address",
              },
            ].map((item) => (
              <View key={item.key} style={{ marginBottom: 16 }}>
                <Text style={styles.label}>{item.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={item.placeholder}
                  placeholderTextColor="#aaa"
                  keyboardType={item.keyboardType as any}
                  autoCapitalize={item.autoCapitalize as any}
                  value={(form as any)[item.key]}
                  editable={!loading}
                  onChangeText={(v) => updateField(item.key, v)}
                />
              </View>
            ))}
            {/* Password */}
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password..."
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(v) => updateField("password", v)}
              editable={!loading}
            />

            {/* Confirm Password */}
            <Text style={[styles.label, { marginTop: 14 }]}>
              Xác nhận mật khẩu
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm password..."
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              textContentType="none"
              autoComplete="off"
              value={form.confirmPassword}
              onChangeText={(v) => updateField("confirmPassword", v)}
              editable={!loading}
            />

            {/* ✅ Show/Hide Password Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.6}
            >
              <View
                style={[
                  styles.checkbox,
                  showPassword && styles.checkboxChecked,
                ]}
              >
                {showPassword && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Hiển thị mật khẩu</Text>
            </TouchableOpacity>

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAccepted((s) => !s)}
              disabled={loading}
            >
              <View
                style={[styles.checkbox, accepted && styles.checkboxChecked]}
              >
                {accepted && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.termsText}>
                Bằng cách tạo tài khoản, bạn đồng ý với{" "}
                <Text style={styles.link}>Điều khoản</Text> và{" "}
                <Text style={styles.link}>Chính sách Bảo mật</Text> của chúng
                tôi.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={onSignUp}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => router.push("/login-signUp/loginScreen")}
          >
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.linkBold}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          buttons={[{ text: "OK", onPress: () => setAlertVisible(false) }]}
          onClose={() => setAlertVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 22,
    backgroundColor: "#fff",
  },
  backBtn: { marginBottom: 4, alignSelf: "flex-start" },
  title: { fontSize: 26, fontWeight: "700", color: "#111" },
  subtitle: { color: "#777", marginTop: 4, fontSize: 14 },
  label: { color: "#333", marginBottom: 6, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  eyeBtn: {
    position: "absolute",
    right: 10,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  // ✅ Checkbox for password visibility
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 14,
    paddingVertical: 8,
  },
  termsRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 18 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: ORANGE, borderColor: ORANGE },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  termsText: {
    color: "#666",
    marginLeft: 10,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  link: { color: ORANGE, fontWeight: "600" },
  linkBold: { color: ORANGE, fontWeight: "700" },
  primaryBtn: {
    marginTop: 24,
    backgroundColor: ORANGE,
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footerLink: { alignSelf: "center", marginTop: 26, marginBottom: 20 },
  footerText: { color: "#666", fontSize: 14 },
});
