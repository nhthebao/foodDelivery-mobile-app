import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ORANGE = "#E8702A";

export default function LoginScreen() {
  const router = useRouter();
  const prefill = false;

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState(prefill ? "wilson@09gail.com" : "");
  const [phone, setPhone] = useState(prefill ? "0905550101" : "");
  const [password, setPassword] = useState(prefill ? "password123" : "");
  const [hidePassword, setHidePassword] = useState(true);

  const tabStyle = (t: "email" | "phone") =>
    method === t ? styles.tabActive : styles.tabInactive;

  const onSignIn = () => {
    if (method === "phone") {
      router.push("/forgot-password/verify");
    } else {
      alert("Sign In pressed\n(implement email auth logic here)");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.container}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <View style={styles.backCircle}>
            <Text style={{ fontSize: 18 }}>‹</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>
          Enter your registered account to sign in
        </Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={tabStyle("email")}
            onPress={() => setMethod("email")}
          >
            <Text
              style={
                method === "email"
                  ? styles.tabTextActive
                  : styles.tabTextInactive
              }
            >
              Email
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
          {method === "email" ? (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address..."
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
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

          <TouchableOpacity style={styles.primaryBtn} onPress={onSignIn}>
            <Text style={styles.primaryBtnText}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Divider & Social */}
        <View style={styles.socialWrap}>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={{ color: "#999", marginHorizontal: 8 }}>
              Or continue with
            </Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Image
                source={{ uri: "https://via.placeholder.com/40?text=G" }}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Image
                source={{ uri: "https://via.placeholder.com/40?text=" }}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Image
                source={{ uri: "https://via.placeholder.com/40?text=F" }}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => router.push("/login-signUp/signupScreen")}
        >
          <Text style={{ color: "#666" }}>
            Don't have an account?{" "}
            <Text style={{ color: ORANGE, fontWeight: "600" }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  socialWrap: { marginTop: 28 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    flex: 1,
    marginHorizontal: 10,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 14,
  },
  socialBtn: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: { width: 36, height: 36, resizeMode: "contain" },
  footerLink: { alignSelf: "center", marginTop: 22 },
});
