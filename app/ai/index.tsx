import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState<any[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const AI_KEY = process.env.AI_KEY;

  // Fetch menu data từ API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(
          "https://food-delivery-mobile-app.onrender.com/desserts"
        );
        const data = await response.json();
        setMenuData(data);
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };
    fetchMenu();
  }, []);

  // System prompt với thông tin món ăn từ API
  const getSystemPrompt = () => {
    const menuList = menuData
      .map(
        (item) =>
          `- ${item.name} (${item.category}): ${item.description} - Giá: $${item.price}, Rating: ${item.rating}/5, Thời gian giao: ${item.deliveryTime}`
      )
      .join("\n");

    return {
      role: "system",
      content: `Bạn là trợ lý AI của ứng dụng giao đồ ăn "Food Delivery". Nhiệm vụ của bạn là:

📋 DANH SÁCH MÓN ĂN CÓ SẴN:
${menuList}

🎯 QUY TẮC HOẠT ĐỘNG:
- CHỈ gợi ý các món ăn có trong danh sách trên
- Khi gợi ý món, hãy đề cập tên chính xác, giá, rating và thời gian giao hàng
- Giúp người dùng chọn món dựa trên: sở thích, ngân sách, loại món (Vietnamese, Fast Food, Japanese, v.v.)
- Trả lời bằng tiếng Việt một cách thân thiện và nhiệt tình
- Có thể so sánh các món, gợi ý combo, hoặc món phù hợp với thời tiết/tâm trạng

❌ KHÔNG ĐƯỢC:
- Gợi ý món ăn KHÔNG có trong danh sách
- Trả lời về chủ đề không liên quan (chính trị, toán học, khoa học, giải trí, v.v.)
- Nếu người dùng hỏi chủ đề khác, lịch sự từ chối: "Xin lỗi, tôi chỉ có thể giúp bạn gợi ý món ăn từ thực đơn của nhà hàng. Bạn muốn tôi gợi ý món gì không?"

💡 VÍ DỤ CÂU TRẢ LỜI TốT:
"Tôi gợi ý bạn món Phở Bò Hà Nội ($3.84) với rating 4.3/5, thời gian giao 20-30 phút. Món này có nước dùng thơm ngọt, rất phù hợp cho bữa sáng hoặc trưa!"`,
    };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: { role: "user" | "assistant"; content: string } = {
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = getSystemPrompt();

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_KEY}`, // ⚠️ thêm key thật vào đây
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [systemPrompt, ...messages, userMsg],
        }),
      });

      const data = await res.json();
      const aiText =
        data?.choices?.[0]?.message?.content?.trim() ||
        "I couldn't process your question.";

      setMessages((prev) => [...prev, { role: "assistant", content: aiText }]);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Network error or invalid API key. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={["#FF6B35", "#FF8E53", "#FFA06B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.header}
        >
          <View style={s.headerContent}>
            <View style={s.headerIcon}>
              <Ionicons name="restaurant" size={28} color="#fff" />
            </View>
            <View>
              <Text style={s.headerTitle}>AI Food Assistant</Text>
              <Text style={s.headerSubtitle}>{menuData.length} món có sẵn</Text>
            </View>
          </View>
          <TouchableOpacity style={s.infoButton}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* Chat messages */}
        <ScrollView
          ref={scrollRef}
          style={s.chatBox}
          contentContainerStyle={s.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {/* Welcome message */}
          {messages.length === 0 && (
            <View style={s.welcomeContainer}>
              <View style={s.welcomeIconContainer}>
                <Ionicons name="chatbubbles" size={60} color="#FF6B35" />
              </View>
              <Text style={s.welcomeTitle}>
                Chào mừng đến với AI Assistant!
              </Text>
              <Text style={s.welcomeText}>
                Tôi có thể giúp bạn tìm món ăn phù hợp với sở thích và ngân sách
                của bạn
              </Text>
              <View style={s.suggestionsContainer}>
                <Text style={s.suggestionsTitle}>💡 Gợi ý câu hỏi:</Text>
                {[
                  "Gợi ý món Việt Nam",
                  "Món nào dưới $5?",
                  "Món có rating cao nhất",
                  "Món giao nhanh nhất",
                ].map((suggestion, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={s.suggestionChip}
                    onPress={() => setInput(suggestion)}
                  >
                    <Text style={s.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Messages */}
          {messages.map((m, i) => (
            <View
              key={i}
              style={[s.messageRow, m.role === "user" ? s.userRow : s.aiRow]}
            >
              {m.role === "assistant" && (
                <View style={s.aiAvatar}>
                  <Ionicons
                    name="restaurant-outline"
                    size={18}
                    color="#FF6B35"
                  />
                </View>
              )}
              <View
                style={[
                  s.msgBubble,
                  m.role === "user" ? s.userBubble : s.aiBubble,
                ]}
              >
                <Text
                  style={[s.msgTxt, m.role === "user" ? s.userText : s.aiText]}
                >
                  {m.content}
                </Text>
              </View>
              {m.role === "user" && (
                <View style={s.userAvatar}>
                  <Ionicons name="person" size={18} color="#fff" />
                </View>
              )}
            </View>
          ))}

          {loading && (
            <View style={s.loadingContainer}>
              <View style={s.aiAvatar}>
                <Ionicons name="restaurant-outline" size={18} color="#FF6B35" />
              </View>
              <View style={s.loadingBubble}>
                <ActivityIndicator size="small" color="#FF6B35" />
                <Text style={s.loadingText}>Đang suy nghĩ...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input box */}
        <View style={s.inputContainer}>
          <View style={s.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Hỏi về món ăn bạn muốn..."
              placeholderTextColor="#999"
              style={s.input}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                s.sendBtn,
                (!input.trim() || loading) && s.sendBtnDisabled,
              ]}
              onPress={sendMessage}
              disabled={!input.trim() || loading}
            >
              <Ionicons
                name="send"
                size={20}
                color={input.trim() && !loading ? "#fff" : "#ccc"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#FF6B35",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 14,
    marginTop: 3,
    fontWeight: "500",
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  chatBox: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  chatContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexGrow: 1,
  },
  welcomeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 50,
  },
  welcomeIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#FF6B35",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFE8DC",
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FF6B35",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  welcomeText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 36,
    fontWeight: "400",
  },
  suggestionsContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: "#FFE8DC",
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#495057",
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  suggestionChip: {
    backgroundColor: "linear-gradient(135deg, #FFF5F0 0%, #FFE8DC 100%)",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#FFD4BC",
    shadowColor: "#FF6B35",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  suggestionText: {
    color: "#FF6B35",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 18,
    alignItems: "flex-end",
    gap: 10,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  aiRow: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B35",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderWidth: 2,
    borderColor: "#FFE8DC",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF6B35",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B35",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  msgBubble: {
    maxWidth: "75%",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  userBubble: {
    backgroundColor: "#FF6B35",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 1.5,
    borderColor: "#FFE8DC",
  },
  msgTxt: {
    fontSize: 15.5,
    lineHeight: 23,
    letterSpacing: 0.2,
  },
  userText: {
    color: "#fff",
    fontWeight: "500",
  },
  aiText: {
    color: "#2c3e50",
    fontWeight: "400",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },
  loadingBubble: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: "#FFE8DC",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#FFE8DC",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#FFF8F3",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "#FFE8DC",
  },
  input: {
    flex: 1,
    color: "#2c3e50",
    fontSize: 15.5,
    maxHeight: 100,
    paddingVertical: 8,
    fontWeight: "400",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF6B35",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    shadowColor: "#FF6B35",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  sendBtnDisabled: {
    backgroundColor: "#FFD4BC",
    shadowOpacity: 0.1,
  },
  poweredBy: {
    textAlign: "center",
    color: "#adb5bd",
    fontSize: 11,
    marginTop: 8,
    fontStyle: "italic",
  },
});
