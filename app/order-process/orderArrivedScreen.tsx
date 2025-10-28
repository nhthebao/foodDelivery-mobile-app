import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const OrderArrivedScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#f26522" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      {/* Checkmark Icon */}
      <View style={styles.iconWrapper}>
        <Ionicons name="checkmark-circle" size={100} color="#fff" />
      </View>

      {/* Text */}
      <Text style={styles.title}>Your order has arrived!</Text>
      <Text style={styles.subtitle}>
        Right on time, we delivered your order in 25 min!
      </Text>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("RatingDriver" as never)}>
        <Text style={styles.buttonText}>Rate Your Driver</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderArrivedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f26522",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginRight: 30,
  },
  iconWrapper: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 25,
    borderRadius: 80,
    marginBottom: 30,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 50,
    opacity: 0.9,
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: "#f26522",
    fontSize: 16,
    fontWeight: "600",
  },
});
