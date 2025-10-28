// app/privacy-policy.tsx
import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function PrivacyPolicy() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Privacy & Policy</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 12 },
  p: { color: "#555", marginTop: 6, lineHeight: 20 },
});
