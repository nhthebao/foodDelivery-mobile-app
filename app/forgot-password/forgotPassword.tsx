import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPassword() {
  const router = useRouter();

  const methods = [
    {
      key: "email",
      title: "Email",
      subtitle: "Send verification code to your email",
      icon: "mail-outline",
      color: "#ff6a00",
    },
    {
      key: "phone",
      title: "Phone Number",
      subtitle: "Send OTP code to your phone number (demo)",
      icon: "call-outline",
      color: "#ff6a00",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Choose a verification method to reset your password
      </Text>

      {methods.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.option}
          onPress={() =>
            router.push(`/forgot-password/verify?method=${item.key}`)
          }
        >
          <Ionicons
            name={item.icon as any}
            size={32}
            color={item.color}
            style={styles.icon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>{item.title}</Text>
            <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
  title: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
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
