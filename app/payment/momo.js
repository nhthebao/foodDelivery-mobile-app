// app/payment/momo.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function MomoQR() {
  const router = useRouter();

  return (
    <View style={s.container}>
      <Text style={s.title}>Momo Payment</Text>

      <Image
        source={require("../../assets/images/momo_qr.png")} // ảnh QR mặc định
        style={s.qr}
      />

      <Text style={s.desc}>
        Scan this QR code with your Momo app to complete payment.
      </Text>

      <TouchableOpacity
        style={s.btn}
        onPress={() => router.replace("/checkout")}
      >
        <Text style={s.btnText}>Back to Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 20 },
  qr: { width: 250, height: 250, resizeMode: "contain", marginBottom: 20 },
  desc: { textAlign: "center", color: "#666", marginBottom: 20 },
  btn: {
    backgroundColor: "#ff6a00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
