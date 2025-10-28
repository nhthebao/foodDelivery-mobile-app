import { useRouter } from "expo-router";

import axios from 'axios';
import { useEffect, useState } from "react";

import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ForgotPassword() {
  const router = useRouter();

  const methods = [
    {
      title: "Email",
      subtitle: "********@mail.com",
      icon: { uri: "https://via.placeholder.com/40x40.png?text=@" },
    },
    {
      title: "Phone Number",
      subtitle: "***** **** **** 0101",
      icon: { uri: "https://via.placeholder.com/40x40.png?text=☎" },
    },
  ];

  // Test
  const [desserts, setDesserts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://172.16.16.31:3000/desserts';
   const fetchDesserts = async () => {
    try {
      const res = await axios.get(API_URL);
      console.log('Dữ liệu trả về:', res.data);
      setDesserts(res.data);
    } catch (err : any) {
      console.log('Lỗi khi load dữ liệu:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesserts();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={desserts}
        keyExtractor={(item : any) => item._id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            <Text>Giá: {item.price}₫</Text>
          </View>
        )}
      />
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Select verification method and we will send verification code
      </Text>

      {methods.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={styles.option}
          onPress={() => router.push("/forgot-password/verify")}
        >
          <Image source={item.icon} style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>{item.title}</Text>
            <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 20 },
  subtitle: { color: "#666", marginTop: 10, marginBottom: 30 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  icon: { width: 40, height: 40, marginRight: 15, borderRadius: 6 },
  optionTitle: { fontSize: 16, fontWeight: "600" },
  optionSubtitle: { color: "#666", marginTop: 4 },
});
