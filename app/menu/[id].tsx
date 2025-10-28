import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useDessert } from "../../context/DessertContext";
import { useUserList } from "../../context/UserListContext";
import { Dessert } from "../../types/types";

export default function MenuDetail(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, loading, addToCart } = useDessert();
  const { getById: getUserById, loading: userLoading } = useUserList();
  const [qty, setQty] = useState<number>(1);

  const item: Dessert | undefined = getById(id!);

  if (loading || userLoading)
    return (
      <ActivityIndicator size="large" style={{ flex: 1, marginTop: 120 }} />
    );

  if (!item)
    return (
      <View style={s.center}>
        <Text style={s.notFound}>Dessert not found 🧁</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Ảnh món */}
        <Image source={{ uri: item.image }} style={s.image} />

        {/* Nội dung */}
        <View style={s.content}>
          {/* Tên + Giá */}
          <View style={s.rowBetween}>
            <Text style={s.name}>{item.name}</Text>
            <Text style={s.price}>${item.price.toFixed(2)}</Text>
          </View>

          {/* Pills */}
          <View style={s.pillsRow}>
            <Pill>
              {item.freeDelivery ? "🚚 Free Delivery" : "💵 Delivery Fee"}
            </Pill>
            <Pill>⏱ {item.deliveryTime || "20–30 mins"}</Pill>
            <Pill>⭐ {item.rating}</Pill>
          </View>

          {/* Mô tả */}
          <Text style={s.sectionTitle}>Description</Text>
          <Text style={s.desc}>{item.description}</Text>

          {/* Reviews */}
          <View style={s.rowBetween}>
            <Text style={s.sectionTitle}>
              Reviews ({item.reviews || 0})
            </Text>
            <TouchableOpacity>
              <Text style={{ color: "#ff6a00", fontWeight: "600" }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {(item.review || []).map((r, idx) => {
            const user = getUserById(r.idUser);
            return (
              <View key={idx} style={s.reviewCard}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={{
                      uri:
                        user?.image ||
                        "https://i.pravatar.cc/150?img=1",
                    }}
                    style={s.avatar}
                  />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <View style={s.rowBetween}>
                      <Text style={s.reviewer}>
                        {user?.fullName || "Unknown User"}
                      </Text>
                      <Text style={{ color: "#444", fontWeight: "600" }}>
                        ⭐ {r.rating}
                      </Text>
                    </View>
                    <Text style={s.reviewText}>{r.content}</Text>
                    <Text style={s.dateTxt}>{r.date}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Thanh Add to Cart */}
      <View style={s.bottomBar}>
        <View style={s.qtyBox}>
          <TouchableOpacity
            onPress={() => setQty(Math.max(1, qty - 1))}
            style={s.qtyBtn}
          >
            <Text style={s.qtyTxt}>–</Text>
          </TouchableOpacity>
          <Text style={s.qtyNumber}>{qty}</Text>
          <TouchableOpacity
            onPress={() => setQty(qty + 1)}
            style={s.qtyBtn}
          >
            <Text style={s.qtyTxt}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={s.cartBtn}
          onPress={() => addToCart(item.id)}
        >
          <Text style={s.cartTxt}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.pill}>
      <Text style={s.pillTxt}>{children}</Text>
    </View>
  );
}

/* === STYLES (giữ nguyên như bạn đã có) === */
const s = StyleSheet.create({
  image: { width: "100%", height: 260 },
  content: { padding: 16 },
  name: { fontSize: 22, fontWeight: "800", color: "#222" },
  price: { fontSize: 20, fontWeight: "800", color: "#ff6a00" },
  pillsRow: { flexDirection: "row", gap: 10, marginVertical: 8 },
  pill: {
    backgroundColor: "#f4f4f4",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillTxt: { fontWeight: "600", color: "#333" },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginTop: 10 },
  desc: { color: "#666", lineHeight: 20, marginTop: 6 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  reviewer: { fontWeight: "700", fontSize: 15 },
  reviewText: { color: "#555", fontSize: 13, marginTop: 3, lineHeight: 18 },
  dateTxt: { fontSize: 12, color: "#999", marginTop: 3 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFound: { fontSize: 18, fontWeight: "700", color: "#999" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyBox: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBtn: {
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyTxt: { fontSize: 18, fontWeight: "800" },
  qtyNumber: { fontSize: 18, fontWeight: "700", color: "#333" },
  cartBtn: {
    backgroundColor: "#ff6a00",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  cartTxt: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
