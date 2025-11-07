// app/privacy-policy.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.container, { flex: 1, backgroundColor: "#fff" }]}
      edges={["top"]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>1. Information Collection</Text>
        <Text style={styles.p}>
          We collect personal information to provide and improve our services...
        </Text>

        <Text style={styles.sectionTitle}>2. Information Use</Text>
        <Text style={styles.p}>
          The information is used to process orders, communicate with you...
        </Text>

        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.p}>
          We may share your data with partners only when necessary...
        </Text>

        <Text style={styles.sectionTitle}>4. Security Measures</Text>
        <Text style={styles.p}>
          We implement security measures to protect your data...
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 12 },
  p: { color: "#555", marginTop: 6, lineHeight: 20 },
});
