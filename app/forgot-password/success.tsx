import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{ uri: "https://via.placeholder.com/80x80.png?text=✓" }}
          style={styles.icon}
        />
        <Text style={styles.title}>Password Changed!</Text>
        <Text style={styles.message}>
          Your password has been successfully updated. You can now log in with
          your new password.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/login-signUp/loginScreen")}
        >
          <Text style={styles.buttonText}>Login Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
  },
  icon: { width: 80, height: 80, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  message: { textAlign: "center", color: "#666", marginBottom: 30 },
  button: {
    backgroundColor: "#E76F00",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
