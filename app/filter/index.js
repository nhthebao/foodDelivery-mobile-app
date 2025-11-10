// app/filter/index.js
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = [
  "Vietnamese",
  "Fast Food",
  "Asian",
  "Japanese",
  "Western",
  "Healthy",
  "Dessert",
  "Soup",
  "Snack",
  "Indian",
  "Hotpot",
  "Korean",
];

export default function FilterScreen() {
  const router = useRouter();

  const [min, setMin] = useState(0);
  const [max, setMax] = useState(500);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("");

  /* --- Hàm điều chỉnh giá trị --- */
  const step = (setter, delta, isMin) => {
    setter((v) => {
      let newVal = v + delta;
      if (isMin) newVal = Math.min(Math.max(0, newVal), max); // min ≤ max
      else newVal = Math.max(Math.min(500, newVal), min);     // max ≥ min
      return newVal;
    });
  };

  /* --- Hàm xử lý nhấn Apply --- */
  const applyFilter = () => {
    router.push(
      `/search?min=${min}&max=${max}&rating=${rating}&category=${encodeURIComponent(
        category
      )}`
    );
  };

  /* --- Hàm xử lý Clear --- */
  const clearFilter = () => {
    setMin(0);
    setMax(500);
    setRating(0);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <View style={s.container}>
      {/* PRICE RANGE */}
      <Text style={s.h1}>Price Range</Text>
      <View style={s.row}>
        <Touch onPress={() => step(setMin, -5, true)}>-</Touch>
        <Text style={s.box}>${min}</Text>
        <Touch onPress={() => step(setMin, 5, true)}>+</Touch>
        <Text style={{ marginHorizontal: 10 }}>to</Text>
        <Touch onPress={() => step(setMax, -5, false)}>-</Touch>
        <Text style={s.box}>${max}</Text>
        <Touch onPress={() => step(setMax, 5, false)}>+</Touch>
      </View>

      {/* CATEGORY FILTER */}
      <Text style={s.h1}>Popular Filters</Text>
      <View style={s.wrap}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCategory(c)}
            style={[s.chip, category === c && s.chipActive]}
          >
            <Text
              style={[s.chipTxt, category === c && { color: "#fff" }]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* STAR RATING */}
      <Text style={s.h1}>Star Rating</Text>
      <View style={s.row}>
        {[4, 4.5, 4.7, 4.8, 4.9, 5].map((st) => (
          <TouchableOpacity
            key={st}
            onPress={() => setRating(st)}
            style={[
              s.star,
              rating === st && { backgroundColor: "#ff6a00" },
            ]}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>{st}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BUTTONS */}
      <TouchableOpacity style={s.apply} onPress={applyFilter}>
        <Text style={{ color: "#fff", fontWeight: "800" }}>Apply Filter</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.clear} onPress={clearFilter}>
        <Text style={{ color: "#ff6a00", fontWeight: "800" }}>Clear All</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 

/* --- COMPONENT NHỎ --- */
const Touch = ({ children, onPress }) => (
  <TouchableOpacity onPress={onPress} style={s.step}>
    <Text style={{ fontSize: 18, fontWeight: "800" }}>{children}</Text>
  </TouchableOpacity>
);

/* --- STYLES --- */
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  h1: {
    fontWeight: "700",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    minWidth: 70,
    textAlign: "center",
    fontWeight: "700",
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  chipActive: {
    backgroundColor: "#ff6a00",
    borderColor: "#ff6a00",
  },
  chipTxt: {
    color: "#333",
    fontWeight: "700",
  },
  star: {
    width: 44,
    height: 44,
    backgroundColor: "#ccc",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  apply: {
    marginTop: 24,
    backgroundColor: "#ff6a00",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  clear: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: "#ff6a00",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
