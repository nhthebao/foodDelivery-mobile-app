import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import axios from "axios";
import * as SQLite from "expo-sqlite";
import { useLocalSearchParams, useRouter } from "expo-router";

const API = "https://food-delivery-mobile-app.onrender.com/desserts";

// ✅ Mở hoặc tạo database
const db = SQLite.openDatabaseSync("search_history.db");

export default function SearchScreen() {
  const [q, setQ] = useState("");
  const [data, setData] = useState([]);
  const [history, setHistory] = useState([]); // lưu lịch sử
  const router = useRouter();
  const params = useLocalSearchParams();

  /* --- Lấy dữ liệu món ăn --- */
  useEffect(() => {
    axios.get(API).then((r) => setData(r.data));
  }, []);

  /* --- Tạo bảng SQLite nếu chưa có --- */
  useEffect(() => {
    db.execAsync(`
      CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        term TEXT UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    loadHistory();
  }, []);

  /* --- Lấy lịch sử từ DB --- */
  const loadHistory = async () => {
    const rows = await db.getAllAsync("SELECT term FROM search_history ORDER BY id DESC LIMIT 10;");
    setHistory(rows.map((r) => r.term));
  };

  /* --- Lưu từ khóa khi nhấn Search --- */
  const saveSearch = async (term) => {
    if (!term.trim()) return;
    try {
      await db.runAsync("INSERT OR IGNORE INTO search_history (term) VALUES (?);", [term.trim()]);
      loadHistory();
    } catch (e) {
      console.log("Save search error:", e);
    }
  };

  const filtered = useMemo(() => {
  let arr = data;

  if (q) arr = arr.filter(d => d.name.toLowerCase().includes(q.toLowerCase()));

  // Nhận params từ Filter
  const min = parseFloat(params.min) || 0;
  const max = parseFloat(params.max) || 999;
  const rating = params.rating ? parseFloat(params.rating) : 0;
  const category = params.category ? params.category.toLowerCase() : "";

  if (min > 0 || max < 999)
    arr = arr.filter(d => Number(d.price) >= min && Number(d.price) <= max);

  // ✅ CHỈ CẦN rating >= 1 mới lọc
  if (!isNaN(rating) && rating >= 1)
    arr = arr.filter(d => Number(d.rating) >= rating);

  if (category)
    arr = arr.filter(d => (d.category || "").toLowerCase() === category);

  return arr;
}, [data, q, params]);



  return (
    <ScrollView style={{ backgroundColor: "#fff", padding: 16 }}>
      {/* Ô nhập tìm kiếm */}
      <View style={s.row}>
        <TextInput
          style={s.input}
          placeholder="Search for Food..."
          value={q}
          onChangeText={setQ}
        />
        <TouchableOpacity
          style={s.filterBtn}
          onPress={() => {
            saveSearch(q);
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Lịch sử tìm kiếm */}
      {history.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <View style={s.rowBetween}>
            <Text style={s.title}>Recent Search</Text>
            <TouchableOpacity
              onPress={async () => {
                await db.runAsync("DELETE FROM search_history;");
                setHistory([]);
              }}
            >
              <Text style={{ color: "#ff6a00", fontWeight: "600" }}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <View style={s.tagWrap}>
            {history.map((h, i) => (
              <TouchableOpacity key={i} onPress={() => setQ(h)} style={s.tag}>
                <Text style={{ color: "#333", fontWeight: "600" }}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Danh sách kết quả */}
      <Text style={s.title}>Hot Deals 🔥</Text>
      {filtered.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={s.card}
          onPress={() => router.push(`/menu/${item.id}`)}
        >
          <Image source={{ uri: item.image }} style={s.img} />
          <View style={{ flex: 1, padding: 10 }}>
            <Text style={s.name}>{item.name}</Text>
            <Text style={{ color: "#777" }}>
              ⭐ {item.rating} ({item.reviews})
            </Text>
            <Text style={s.price}>${Number(item.price).toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/menu/${item.id}`)}
            style={s.add}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

/* --- STYLES --- */
const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#e5e5e5", padding: 12, borderRadius: 10 },
  filterBtn: {
    backgroundColor: "#ff6a00",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  img: { width: 90, height: 90 },
  name: { fontWeight: "700", fontSize: 16 },
  price: { color: "#ff6a00", fontWeight: "800", marginTop: 6 },
  add: {
    backgroundColor: "#ff6a00",
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: "#f4f4f4",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
});
