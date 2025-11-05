import { useLocalSearchParams, useRouter } from "expo-router";
import {
  PhoneAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithPhoneNumber,
} from "firebase/auth";
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
import { auth } from "../../firebase/firebaseConfig";

export default function VerifyCode() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const method = (params as any).method as string | undefined;
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  // Initialize reCAPTCHA verifier for phone auth (for Expo/React Native)
  useEffect(() => {
    // On mobile (Expo), Firebase Phone Auth handles reCAPTCHA automatically
    // We just need to ensure the auth object is ready
    if (!auth) {
      console.error("❌ Firebase auth not initialized");
    }
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const onSendEmail = async () => {
    if (!email.trim() || !email.includes("@"))
      return alert("Vui lòng nhập một email hợp lệ");

    setLoading(true);
    try {
      // Check if email exists in database
      const res = await fetch(
        `https://food-delivery-mobile-app.onrender.com/users?email=${encodeURIComponent(
          email.trim()
        )}`
      );
      const users = await res.json();

      if (!users || users.length === 0) {
        alert("❌ Email không tồn tại trong hệ thống");
        setLoading(false);
        return;
      }

      // Use Firebase to send a password reset email
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
      console.log("✅ Email đặt lại mật khẩu đã gửi!");
    } catch (err: any) {
      console.error("❌ Lỗi gửi email đặt lại mật khẩu:", err);
      alert("Gửi email thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const onSendOTP = async () => {
    if (!phone.trim() || phone.length < 10)
      return alert("Vui lòng nhập số điện thoại hợp lệ");

    setLoading(true);
    try {
      // Normalize phone number
      let phoneWithCountry = phone.trim();
      if (phoneWithCountry.startsWith("0")) {
        phoneWithCountry = "+84" + phoneWithCountry.slice(1);
      } else if (!phoneWithCountry.startsWith("+")) {
        phoneWithCountry = "+84" + phoneWithCountry;
      }

      console.log("📱 Gửi OTP tới:", phoneWithCountry);

      // Trên Expo (mobile), Firebase Phone Auth cần cấu hình thêm
      // Giải pháp: Tạm dùng demo OTP cho đến khi cấu hình SHA-1 (Android) hoặc Apple Team ID (iOS)
      if (Platform.OS !== "web") {
        // Mobile (iOS/Android via Expo): Dùng demo OTP
        console.log("📝 Chế độ Demo (Mobile): OTP là '123456'");
        setVerificationId("demo_verification_id_" + Date.now());
        setTimer(60);
        setSent(true);
        alert(
          "📝 Chế độ Demo: Mã OTP là 123456\n\nGhi chú: Cần cấu hình SHA-1 (Android) hoặc Apple Team ID (iOS) để gửi SMS thật"
        );
        return;
      }

      // Web: Dùng Firebase Phone Auth thực
      try {
        const confirmation = await signInWithPhoneNumber(
          auth,
          phoneWithCountry
        );
        setVerificationId(confirmation.verificationId);
        setTimer(60);
        setSent(true);
        console.log("✅ OTP đã gửi qua SMS!");
      } catch (phoneErr: any) {
        console.error("📲 Chi tiết lỗi:", phoneErr);
        throw phoneErr;
      }
    } catch (err: any) {
      console.error("❌ Lỗi gửi OTP:", err);
      alert("Gửi OTP thất bại:\n" + (err.message || err.code));
    } finally {
      setLoading(false);
    }
  };

  const onConfirmOTP = async () => {
    if (!code.trim() || code.length !== 6)
      return alert("Vui lòng nhập mã OTP 6 chữ số");

    if (!verificationId) {
      alert("Chưa gửi OTP, vui lòng gửi OTP trước");
      return;
    }

    setLoading(true);
    try {
      // Check if it's demo mode (starts with "demo_verification_id")
      if (verificationId.startsWith("demo_verification_id")) {
        if (code === "123456") {
          console.log("✅ Demo Mode: OTP xác thực thành công!");
          alert("✅ Demo: Mã xác thực đúng!");
          router.push("/forgot-password/new-password");
        } else {
          alert("❌ Mã OTP không đúng. Hãy nhập 123456");
        }
      } else {
        // Real Firebase verification
        const credential = PhoneAuthProvider.credential(
          verificationId,
          code.trim()
        );
        await signInWithCredential(auth, credential);
        console.log("✅ OTP xác thực thành công!");
        router.push("/forgot-password/new-password");
      }
    } catch (err: any) {
      console.error("❌ Lỗi xác thực OTP:", err);
      alert("Mã OTP không đúng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
                      onPress={onConfirmOTP}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
