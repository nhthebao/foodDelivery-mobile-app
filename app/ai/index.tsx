import React, { useEffect, useRef, useState } from "react";
import {
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
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer", // ⚠️ thêm key thật vào đây
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [...messages, userMsg],
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
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}>
        {/* Header */}
        <Text style={s.title}>🤖 Chat with AI</Text>

        {/* Chat messages */}
        <ScrollView
          ref={scrollRef}
          style={s.chatBox}
          contentContainerStyle={{ paddingVertical: 10 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }>
          {messages.map((m, i) => (
            <View
              key={i}
              style={[
                s.msgBubble,
                m.role === "user" ? s.userBubble : s.aiBubble,
                {
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                },
              ]}>
              <Text style={s.msgTxt}>{m.content}</Text>
            </View>
          ))}
          {loading && <Text style={s.thinking}>AI is thinking...</Text>}
        </ScrollView>

        {/* Input box */}
        <View style={s.inputWrap}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your question..."
            placeholderTextColor="#999"
            style={s.input}
            multiline
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[s.sendBtn, loading && { opacity: 0.5 }]}
            onPress={sendMessage}
            disabled={loading}>
            <Text style={s.sendTxt}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fefefe",
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#ff6a00",
    marginBottom: 8,
  },
  chatBox: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  msgBubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 16,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: "#ffe7cc",
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: "#e7f2ff",
    borderBottomLeftRadius: 2,
  },
  msgTxt: {
    color: "#333",
    fontSize: 15,
    lineHeight: 20,
  },
  thinking: {
    textAlign: "center",
    color: "#aaa",
    fontStyle: "italic",
    marginTop: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  input: {
    flex: 1,
    color: "#333",
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: "#ff6a00",
    borderRadius: 16,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendTxt: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
