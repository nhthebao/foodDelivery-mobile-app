import { CustomAlert } from "@/components/CustomAlert";
import * as apiService from "@/services/apiUserServices";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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

export default function NewPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✅ Checkbox state
  const router = useRouter();
  const params = useLocalSearchParams();

  // CustomAlert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Support both methods: email and phone
  // Both methods now use temporary token from backend
  const temporaryToken = (params as any).temporaryToken as string | undefined;
  const method = (params as any).method as string | undefined;

  const onResetPassword = async () => {
    // Validation
    if (!password.trim() || !confirm.trim()) {
      showAlert("Error", "Please enter a password");
      return;
    }

    if (password !== confirm) {
      showAlert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      showAlert("Error", "Password must be at least 6 characters");
      return;
    }

    // Check temporary token (required for both methods)
    if (!temporaryToken) {
      showAlert("Error", "Invalid token. Please try again.");
      return;
    }

    setLoading(true);
    try {
      console.log(`🔑 Changing password (${method} method)...`);

      // Both email and phone methods use temporary token from backend
      const success = await apiService.changePasswordWithResetToken(
        temporaryToken,
        password.trim()
      );

      if (success) {
        showAlert("Success", "Password has been reset. Please log in again.");
        router.push("/forgot-password/success");
      } else {
        showAlert("Error", "Unable to reset password. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ Error resetting password:", err);
      showAlert("Error", err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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
                style={[
                  styles.checkbox,
                  showPassword && styles.checkboxChecked,
                ]}
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

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
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
