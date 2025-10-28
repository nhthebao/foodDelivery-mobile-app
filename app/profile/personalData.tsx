import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

      Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân.");

      if (router.canGoBack()) {
        router.back();
      }
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      Alert.alert("Lỗi", "Đã xảy ra sự cố khi lưu.");
    }
  };

  // SỬA 6: Loading (Giữ nguyên)
  if (!currentUser) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#f26522" />
      </View>
    );
  }

  // (Phần return JSX giữ nguyên)
  return (
    <SafeAreaView
      style={[styles.container, { flex: 1, backgroundColor: "#fff" }]}
      edges={["top"]}>
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/40.jpg" }}
          style={styles.avatar}
        />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

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
          <Text style={{ color: "#fff", fontWeight: "700" }}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// (Styles giữ nguyên)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
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
