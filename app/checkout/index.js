// app/checkout/index.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

export default function Checkout() {
  const router = useRouter(); 
  const [user, setUser] = useState(null);

 

  return (
    <ScrollView style={{ padding: 16, backgroundColor: "#fff" }}>
      <Text style={s.title}>Checkout</Text>

      {items.length === 0 && (
        <Text style={{ color: "#666" }}>Your cart is empty.</Text>
      )}

      {items.map((it) => (
        <View key={it.id} style={s.item}>
          <Image source={{ uri: it.image }} style={s.img} />
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{it.name}</Text>
            <Text style={s.price}>
              ${(it.price * it.qty).toFixed(2)}{" "}
              <Text style={{ color: "#999" }}>
                (${it.price} x {it.qty})
              </Text>
            </Text>
            <View style={s.qtyRow}>
              <Touch onPress={() => setQty(it.id, it.qty - 1)}>-</Touch>
              <Text style={s.qtyBox}>{it.qty}</Text>
              <Touch onPress={() => setQty(it.id, it.qty + 1)}>+</Touch>
              <TouchableOpacity
                onPress={() => remove(it.id)}
                style={s.remove}
              >
                <Text style={{ color: "#fff" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* Address + Payment */}
      {user && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Address</Text>
          <Text style={{ color: "#555" }}>
            {user.address || "Unknown address"}
          </Text>
          <Text style={s.cardTitle}>Payment Method</Text>
          <TouchableOpacity onPress={() => router.push("/payment")}>
            <Text style={{ color: "#555" }}>
              {"Select Payment Method"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Totals */}
      <View style={s.totals}>
        <Row label="Order Amount" value={`$${subtotal.toFixed(2)}`} />
        <Row label="Tax (10%)" value={`$${tax.toFixed(2)}`} />
        <Row label="Discount" value={`-$${discount.toFixed(2)}`} />
        <Row
          label="Total Payment"
          value={`$${total.toFixed(2)}`}
          bold
        />
      </View>

      <TouchableOpacity
        style={s.checkoutBtn}
        disabled={items.length === 0}
        onPress={() => clear()}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>
          Proceed To Checkout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const Row = ({ label, value, bold }) => (
  <View style={s.row}>
    <Text style={[s.rowL, bold && { fontWeight: "800" }]}>{label}</Text>
    <Text style={[s.rowR, bold && { fontWeight: "800" }]}>{value}</Text>
  </View>
);

const Touch = ({ children, onPress }) => (
  <TouchableOpacity onPress={onPress} style={s.step}>
    <Text style={{ fontSize: 18, fontWeight: "800" }}>{children}</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800", marginBottom: 12 },
  item: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 10,
    padding: 10,
  },
  img: { width: 70, height: 70, borderRadius: 8, marginRight: 10 },
  name: { fontWeight: "800", fontSize: 16 },
  price: { color: "#ff6a00", fontWeight: "800", marginTop: 4 },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  step: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBox: {
    minWidth: 42,
    textAlign: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: "800",
  },
  remove: {
    marginLeft: "auto",
    backgroundColor: "#ff3b30",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
  },
  cardTitle: { fontWeight: "800", marginTop: 6, marginBottom: 4 },
  totals: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  rowL: { color: "#333" },
  rowR: { color: "#333" },
  checkoutBtn: {
    backgroundColor: "#ff6a00",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
});
