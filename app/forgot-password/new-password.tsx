import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function NewPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>New Password</Text>
          <Text style={styles.subtitle}>
            Create a new password that is safe and easy to remember
          </Text>

          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="********"
          />

          <Text style={styles.label}>Confirm New password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            placeholder="********"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/forgot-password/success")}>
            <Text style={styles.buttonText}>Create New Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  button: {
    backgroundColor: "#E76F00",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
