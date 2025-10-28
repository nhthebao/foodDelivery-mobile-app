import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

const OrderSuccessScreen: React.FC = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hiệu ứng phóng to
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    // Sau 0.8s chuyển sang màn hình tracking
    const timer = setTimeout(() => {
      router.push("/(tabs)");
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark" size={50} color="#f26522" />
        </Animated.View>
        <Text style={styles.title}>Order Successfully</Text>
        <Text style={styles.subtitle}>
          Happy! Your food will be made immediately and we will send it after
          it&apos;s finished by the courier.
        </Text>
      </View>
    </View>
  );
};

export default OrderSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f26522",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  circle: {
    backgroundColor: "#fff",
    borderRadius: 100,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
