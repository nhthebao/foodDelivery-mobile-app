import { Ionicons } from "@expo/vector-icons";
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
import { useCurrentUser } from "../../context/UserContext";
import { useHeaderPadding } from "../../hooks/useHeaderPadding";
import { CustomAlert } from "../../components/CustomAlert";

export default function PersonalDataScreen() {
  // SỬA 3: Lấy context bằng hook 'useCurrentUser'
  // Hook này đảm bảo 'currentUser' và 'editUser' luôn tồn tại (hoặc báo lỗi rõ ràng)
  const { currentUser, editUser, isLoading } = useCurrentUser();
  const router = useRouter();
  const headerPadding = useHeaderPadding();

  // (Phần state giữ nguyên)
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
    // Kiểm tra validation
    if (!name.trim()) {
      setAlertConfig({
        title: "Error",
        message: "Please enter your full name.",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
      return;
    }

    if (!phone.trim()) {
      setAlertConfig({
        title: "Error",
        message: "Please enter your phone number.",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
      return;
    }

    if (!address.trim()) {
      setAlertConfig({
        title: "Error",
        message: "Please enter your address.",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
      return;
    }

    try {
      setIsSaving(true);
      console.log("💾 Đang lưu thông tin cá nhân...");

      await editUser({
        fullName: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
      });

      console.log("✅ Personal data saved");

      setAlertConfig({
        title: "Success",
        message: "Personal information updated successfully.",
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
      console.error("❌ Error saving:", error);
      setAlertConfig({
        title: "Error",
        message: "An error occurred while saving. Please try again.",
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Kiểm tra đăng nhập
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Not logged in</Text>
          <Text style={styles.emptySubtitle}>
            Please log in to edit your personal information
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.replace("/login-signUp/loginScreen")}
          >
            <Text style={styles.actionButtonText}>Log in now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // (Phần return JSX giữ nguyên)
  return (
    <View style={styles.notchCover}>
      <SafeAreaView
        style={[styles.container, { flex: 1, backgroundColor: "#fff" }]}
        edges={[]}
      >
        {/* Header with Back Button */}
        <View style={[styles.header, { paddingTop: headerPadding }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Data</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
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

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  isSaving && { opacity: 0.6, backgroundColor: "#ccc" },
                ]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {isSaving ? "Đang lưu..." : "Save Changes"}
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
    </View>
  );
}

// (Styles giữ nguyên)
const styles = StyleSheet.create({
  notchCover: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
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
  avatarWrap: {
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  form: { marginTop: 10, paddingHorizontal: 20 },
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
