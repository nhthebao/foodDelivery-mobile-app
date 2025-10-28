// SỬA 1: Bổ sung các import bị thiếu
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react"; // <-- Đã import useContext
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
import { UserContext } from "../context/UserContext"; // <-- BỊ THIẾU

export default function PersonalDataScreen() {
  const context = useContext(UserContext);
  const router = useRouter();
  const currentUser = context?.currentUser;
  const editUser = context?.editUser;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.fullName);
      setAddress(currentUser.address);
      setPhone(currentUser.phone);
    }
  }, [currentUser]);

  const handleSave = async () => {
    // PHẢI KIỂM TRA 'editUser' có tồn tại không trước khi gọi
    if (!editUser) {
      Alert.alert("Lỗi", "Không thể lưu, hàm editUser không tồn tại.");
      return;
    }

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

  if (!currentUser) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#f26522" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    </View>
  );
}

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
