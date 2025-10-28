import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
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
import { CustomAlert } from "../../components/CustomAlert";
import { useCurrentUser } from "../../context/UserContext";

export default function PersonalDataScreen() {
  // SỬA 3: Lấy context bằng hook 'useCurrentUser'
  // Hook này đảm bảo 'currentUser' và 'editUser' luôn tồn tại (hoặc báo lỗi rõ ràng)
  const { currentUser, editUser } = useCurrentUser();
  const router = useRouter();

  // (Phần state giữ nguyên)
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

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

  // SỬA 4: useEffect (Giữ nguyên)
  // Logic này vẫn đúng để đồng bộ state từ context
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.fullName);
      setAddress(currentUser.address);
      setPhone(currentUser.phone);
    }
  }, [currentUser]); // <-- Phụ thuộc vào currentUser từ hook

  // SỬA 5: handleSave (Giữ nguyên)
  // Logic này đã đúng, 'editUser' giờ được đảm bảo là 1 hàm
  const handleSave = async () => {
    // (Kiểm tra 'if (!editUser)' vẫn tốt, nhưng hook đã làm việc đó rồi)
    try {
      await editUser({
        fullName: name,
        address: address,
        phone: phone,
      });

      setAlertConfig({
        title: "Thành công",
        message: "Đã cập nhật thông tin cá nhân.",
        buttons: [
          {
            text: "OK",
            onPress: () => {
              setAlertVisible(false);
              if (router.canGoBack()) {
                router.back();
              }
            },
          },
        ],
      });
      setAlertVisible(true);
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      setAlertConfig({
        title: "Lỗi",
        message: "Đã xảy ra sự cố khi lưu.",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
    }
  };

  // Kiểm tra đăng nhập
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
          <Text style={styles.emptySubtitle}>
            Vui lòng đăng nhập để chỉnh sửa thông tin cá nhân
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.replace("/login-signUp/loginScreen")}>
            <Text style={styles.actionButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // (Phần return JSX giữ nguyên)
  return (
    <SafeAreaView
      style={[styles.container, { flex: 1, backgroundColor: "#fff" }]}
      edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}>
          <View style={styles.avatarWrap}>
            <Image
              source={{
                uri:
                  currentUser?.image ||
                  "https://randomuser.me/api/portraits/men/40.jpg",
              }}
              style={styles.avatar}
            />
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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

// (Styles giữ nguyên)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 100,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#222",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: "#f26522",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#f26522",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarWrap: { alignItems: "center", marginVertical: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  form: { marginTop: 10 },
  label: { marginTop: 12, color: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  saveBtn: {
    backgroundColor: "#f26522",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
});
