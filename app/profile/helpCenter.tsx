// app/help-center.tsx
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const faqs = [
  "How do I reset my password?",
  "How do I contact support?",
  "How can I update my information?",
  "How can I report an issue?",
  "How do I manage notifications?",
];

export default function HelpCenter() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Help Center</Text>
      <FlatList
        data={faqs}
        keyExtractor={(i) => i}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row}>
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  row: {
    padding: 14,
    backgroundColor: "#fafafa",
    borderRadius: 10,
  },
});
