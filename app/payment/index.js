// app/payment/index.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function PaymentScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState("Cash on Delivery");

  const handleContinue = () => {
    if (selected === "Momo") {
      router.push("/payment/momo"); // chuyển sang trang QR
    } else {
      router.back(); // quay về Checkout
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Payment Methods</Text>

      <TouchableOpacity
        style={[s.option, selected === "Cash on Delivery" && s.optionActive]}
        onPress={() => setSelected("Cash on Delivery")}
      >
        <View style={s.row}>
          <Image
            source={require("../../assets/icons/cash.png")}
            style={s.icon}
          />
          <Text style={s.label}>Cash on Delivery</Text>
        </View>
        <View
          style={[
            s.radio,
            selected === "Cash on Delivery" && s.radioActive,
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.option, selected === "Momo" && s.optionActive]}
        onPress={() => setSelected("Momo")}
      >
        <View style={s.row}>
          <Image
            source={require("../../assets/icons/momo.png")}
            style={s.icon}
          />
          <Text style={s.label}>Momo</Text>
        </View>
        <View style={[s.radio, selected === "Momo" && s.radioActive]} />
      </TouchableOpacity>

      <TouchableOpacity style={s.btn} onPress={handleContinue}>
        <Text style={s.btnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 18, fontWeight: "800", marginBottom: 20 },
  option: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionActive: { borderColor: "#ff6a00", backgroundColor: "#fff8f3" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { width: 30, height: 30, resizeMode: "contain" },
  label: { fontSize: 16, fontWeight: "600" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  radioActive: { borderColor: "#ff6a00", backgroundColor: "#ff6a00" },
  btn: {
    backgroundColor: "#ff6a00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
