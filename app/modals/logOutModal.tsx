// app/logout-modal.tsx
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LogoutModal() {
  const router = useRouter();

  const onLogout = () => {
    // TODO: clear auth, tokens...
    // router.replace("/login");
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.modal}>
        <Text style={styles.title}>Are you sure you want to logout?</Text>
        <Text style={{ color: "#666", marginTop: 8 }}>
          You will need to login again to continue.
        </Text>
        <View style={{ height: 18 }} />
        <TouchableOpacity
          style={styles.btnCancel}
          onPress={() => router.back()}>
          <Text>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnLogout} onPress={onLogout}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    width: "86%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 16, fontWeight: "700" },
  btnCancel: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#f2f2f2",
  },
  btnLogout: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#f26522",
  },
});
