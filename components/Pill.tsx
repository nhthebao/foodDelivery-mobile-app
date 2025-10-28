// file: components/Pill.tsx (File mới)

import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillTxt}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: "#f4f4f4",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillTxt: { fontWeight: "600", color: "#333" },
});
