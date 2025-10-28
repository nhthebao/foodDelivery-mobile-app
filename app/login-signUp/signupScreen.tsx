import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ORANGE = "#E8702A";

export default function SignupScreen() {
  const router = useRouter();
  const prefill = false;

  const [fullName, setFullName] = useState(prefill ? "Jenny Wilson" : "");
  const [email, setEmail] = useState(prefill ? "wilson@09gail.com" : "");
  const [password, setPassword] = useState(prefill ? "password123" : "");
  const [hidePassword, setHidePassword] = useState(true);
  const [accepted, setAccepted] = useState(prefill ? true : false);

  const onSignUp = () => {
    if (!accepted) {
      alert("Please accept Terms and Conditions");
      return;
    }
    alert("Sign Up pressed\n(implement sign up logic)");
    // router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <View style={styles.backCircle}>
            <Text style={{ fontSize: 18 }}>‹</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>Create an Account</Text>
        <Text style={styles.subtitle}>
          Join us today and unlock endless possibilities. It's quick, easy, and
          just a step away!
        </Text>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your name..."
            placeholderTextColor="#999"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
          <TextInput
            placeholder="Enter your email address..."
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter your password..."
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
            style={styles.termsRow}
            onPress={() => setAccepted((s) => !s)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted && <Text style={{ color: "#fff" }}>✓</Text>}
            </View>
            <Text style={{ color: "#666", marginLeft: 10 }}>
              By creating an account, you agree to our{" "}
              <Text style={{ color: ORANGE }}>Terms and Conditions</Text> and{" "}
              <Text style={{ color: ORANGE }}>Privacy Notice</Text>.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={onSignUp}>
            <Text style={styles.primaryBtnText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => router.push("/login-signUp/loginScreen")}
        >
          <Text style={{ color: "#666" }}>
            Already have an account?{" "}
            <Text style={{ color: ORANGE, fontWeight: "600" }}>Sign In</Text>
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
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  footerLink: { alignSelf: "center", marginTop: 22 },
});
