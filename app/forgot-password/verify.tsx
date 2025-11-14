import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { CustomAlert } from "../../components/CustomAlert";
import { OTPAlert } from "../../components/OTPAlert";
import * as apiService from "../../services/apiUserServices";
import * as firebaseAuthService from "../../services/firebaseAuthService";

export default function VerifyCode() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const method = (params as any).method as string | undefined;
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [timer, setTimer] = useState(0);
  const [showOTPAlert, setShowOTPAlert] = useState(false);
  const [displayOTP, setDisplayOTP] = useState("");

  // CustomAlert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      firebaseAuthService.clearOTPState();
    };
  }, []);

  // ✅ Request reset code via service (Email method)
  const onSendEmail = async () => {
    if (!email.trim() || !email.includes("@"))
      return showAlert("Lỗi", "Vui lòng nhập một email hợp lệ");

    setLoading(true);
    try {
      const result = await apiService.requestPasswordResetCode(
        "email",
        email.trim()
      );

      if (!result) {
        showAlert("Lỗi", "Email không tồn tại hoặc lỗi gửi email");
        return;
      }

      // ✅ Email doesn't need verification
      // User will receive link in email
      console.log("✅ Email reset link đã gửi!");
      showAlert(
        "Thành công",
        "Email đã gửi! Vui lòng kiểm tra hộp thư để nhận link đặt lại mật khẩu."
      );

      // Optional: Navigate to success screen or just go back
      router.push("/forgot-password/success");
    } catch (err: any) {
      console.error("❌ Lỗi gửi email đặt lại mật khẩu:", err);
      showAlert("Lỗi", "Gửi email thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Send OTP via Backend (Backend sẽ gửi SMS via Firebase)
  const onSendOTP = async () => {
    if (!phone.trim() || phone.length < 10)
      return showAlert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ");

    setLoading(true);
    try {
      console.log(`📱 Requesting OTP to ${phone} via Backend...`);

      // Backend sẽ xử lý: tạo OTP + gửi SMS via Firebase Admin SDK
      const result = await apiService.requestPasswordResetCode(
        "phone",
        phone.trim()
      );

      if (!result) {
        showAlert("Lỗi", "Số điện thoại không tồn tại hoặc lỗi gửi OTP");
        return;
      }

      // Lưu reset ID để dùng sau khi verify OTP
      firebaseAuthService.storeResetId(result.resetId);

      setPhone(phone.trim());
      setTimer(60);
      setSent(true);
      console.log(`✅ OTP đã gửi qua SMS đến ${phone}!`);
      console.log(`📋 [DEBUG] Full result:`, result);
      console.log(`📋 [DEBUG] debug_otp:`, (result as any).debug_otp);

      // 🔧 TEST MODE: Hiện debug OTP trong custom alert
      const debugOTP = (result as any).debug_otp;
      console.log(`📋 [DEBUG] debugOTP value:`, debugOTP);
      console.log(`📋 [DEBUG] typeof debugOTP:`, typeof debugOTP);

      if (debugOTP) {
        console.log(`✅ [DEBUG] Setting OTP alert with OTP: ${debugOTP}`);
        setDisplayOTP(debugOTP);
        setShowOTPAlert(true);
      } else {
        console.log(`❌ [DEBUG] No debug OTP found, showing generic alert`);
        showAlert(
          "Thành công",
          "Mã OTP đã gửi qua SMS! Vui lòng kiểm tra tin nhắn."
        );
      }
    } catch (err: any) {
      console.error("❌ Lỗi gửi OTP:", err);
      showAlert(
        "Lỗi",
        "Gửi OTP thất bại. " + (err?.message || "Vui lòng thử lại.")
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle OTP auto-paste
  const handleOTPCopied = (otp: string) => {
    setCode(otp);
    setShowOTPAlert(false);
    console.log(`✅ [OTP] Auto-pasted: ${otp}`);
  };

  // ✅ Verify OTP via Backend
  const onConfirmCode = async () => {
    if (!code.trim() || code.length !== 6)
      return showAlert("Lỗi", "Vui lòng nhập mã 6 chữ số");

    if (!firebaseAuthService.hasResetId()) {
      return showAlert("Lỗi", "Chưa gửi OTP. Vui lòng gửi OTP trước.");
    }

    setLoading(true);
    try {
      console.log(`📱 Verifying OTP ${code} via Backend...`);

      const resetId = firebaseAuthService.getResetId();

      // Gửi resetId + OTP lên backend để verify
      const verifyResult = await apiService.verifyPasswordResetCode(
        resetId!,
        code.trim()
      );

      if (!verifyResult || !verifyResult.temporaryToken) {
        showAlert("Lỗi", "Mã OTP sai hoặc hết hạn");
        return;
      }

      console.log(`✅ OTP verified! Got temporary token`);
      showAlert("Thành công", "Xác thực OTP thành công!");

      // Chuyển sang screen đặt mật khẩu mới (dùng temporary token)
      router.push({
        pathname: "/forgot-password/new-password",
        params: {
          temporaryToken: verifyResult.temporaryToken,
          phoneNumber: phone,
          method: "phone",
        },
      });
    } catch (err: any) {
      console.error("❌ Lỗi xác thực OTP:", err);
      showAlert(
        "Lỗi",
        "Mã OTP sai hoặc hết hạn. " + (err?.message || "Vui lòng thử lại.")
      );
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
        <Text style={styles.headerTitle}>
          {method === "phone" ? "Xác thực OTP" : "Đặt lại mật khẩu"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <Text style={styles.title}>
              {method === "phone"
                ? "Xác thực OTP"
                : "Đặt lại mật khẩu bằng Email"}
            </Text>

            {method === "phone" ? (
              <>
                {!sent ? (
                  <>
                    <Text style={styles.subtitle}>
                      Nhập số điện thoại của bạn, chúng tôi sẽ gửi mã OTP xác
                      thực
                    </Text>

                    <TextInput
                      style={styles.input}
                      placeholder="+84 (hoặc 0) 123 456 789"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                      editable={!loading}
                    />

                    <TouchableOpacity
                      style={[styles.button, loading && { opacity: 0.7 }]}
                      onPress={onSendOTP}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Gửi mã OTP</Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.subtitle}>
                      Mã OTP đã gửi! Vui lòng nhập mã 6 chữ số
                    </Text>

                    <TextInput
                      style={styles.input}
                      placeholder="000000"
                      placeholderTextColor="#cececeff"
                      keyboardType="numeric"
                      maxLength={6}
                      value={code}
                      onChangeText={setCode}
                      editable={!loading}
                    />

                    {timer > 0 ? (
                      <Text style={styles.resend}>Gửi lại sau {timer}s</Text>
                    ) : (
                      <TouchableOpacity onPress={onSendOTP} disabled={loading}>
                        <Text
                          style={[
                            styles.resend,
                            {
                              fontWeight: "600",
                              textDecorationLine: "underline",
                            },
                          ]}
                        >
                          Gửi lại mã
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[styles.button, loading && { opacity: 0.7 }]}
                      onPress={onConfirmCode}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Xác thực</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              <>
                {!sent ? (
                  <>
                    <Text style={styles.subtitle}>
                      Nhập email bạn dùng để đăng ký, chúng tôi sẽ gửi link đặt
                      lại mật khẩu
                    </Text>

                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      placeholderTextColor="#cececeff"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      editable={!loading}
                    />

                    <TouchableOpacity
                      style={[styles.button, loading && { opacity: 0.7 }]}
                      onPress={onSendEmail}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Gửi email đặt lại</Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.subtitle}>
                      Đã gửi email! Vui lòng kiểm tra hộp thư và làm theo hướng
                      dẫn để đặt lại mật khẩu.
                    </Text>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() =>
                        router.replace("/login-signUp/loginScreen")
                      }
                    >
                      <Text style={styles.buttonText}>Quay về đăng nhập</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Alert - Custom UI với auto-copy */}
      <OTPAlert
        visible={showOTPAlert}
        otp={displayOTP}
        onClose={() => setShowOTPAlert(false)}
        onCopyOTP={handleOTPCopied}
      />

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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
    fontSize: 18,
    letterSpacing: 4,
    textAlign: "center",
  },
  resend: { color: "#E76F00", marginTop: 10, textAlign: "center" },
  button: {
    backgroundColor: "#E76F00",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
