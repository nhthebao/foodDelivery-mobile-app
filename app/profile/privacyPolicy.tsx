// app/privacy-policy.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.container, { flex: 1, backgroundColor: "#fff" }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* 1. Information Collection */}
        <Text style={styles.sectionTitle}>1. Information Collection</Text>
        <Text style={styles.p}>
          We collect various types of personal information to operate our food
          delivery service, including:
        </Text>
        <Text style={styles.p}>
          • Account details: name, phone number, email.
        </Text>
        <Text style={styles.p}>• Delivery address and order history.</Text>
        <Text style={styles.p}>
          • Location data to determine accurate delivery areas.
        </Text>
        <Text style={styles.p}>
          • Payment information (processed securely by third-party providers).
        </Text>
        <Text style={styles.p}>
          • Device and technical data such as IP, device type, and app usage
          behavior.
        </Text>

        {/* 2. Information Use */}
        <Text style={styles.sectionTitle}>2. Information Use</Text>
        <Text style={styles.p}>We use your information to:</Text>
        <Text style={styles.p}>• Create and manage your user account.</Text>
        <Text style={styles.p}>
          • Process your food orders and coordinate delivery.
        </Text>
        <Text style={styles.p}>
          • Contact you when needed for order confirmation or updates.
        </Text>
        <Text style={styles.p}>
          • Improve app performance and enhance user experience.
        </Text>
        <Text style={styles.p}>
          • Send promotional offers or notifications (when permitted).
        </Text>

        {/* 3. Information Sharing */}
        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.p}>
          We only share your data with third parties when necessary, such as:
        </Text>
        <Text style={styles.p}>
          • Delivery partners / drivers to complete your order.
        </Text>
        <Text style={styles.p}>
          • Payment gateways for online transactions.
        </Text>
        <Text style={styles.p}>
          • Technical service providers that support app functionality.
        </Text>
        <Text style={styles.p}>• Legal authorities when required by law.</Text>
        <Text style={styles.p}>
          We do NOT sell or trade your personal information to any external
          parties for commercial purposes.
        </Text>

        {/* 4. Data Security */}
        <Text style={styles.sectionTitle}>4. Security Measures</Text>
        <Text style={styles.p}>
          We implement strict security measures to safeguard your personal data,
          including encrypted transmission, secure storage, and protection
          against unauthorized access, loss, or misuse.
        </Text>

        {/* 5. User Rights */}
        <Text style={styles.sectionTitle}>5. User Rights</Text>
        <Text style={styles.p}>As a user, you have the right to:</Text>
        <Text style={styles.p}>
          • View and update your personal information.
        </Text>
        <Text style={styles.p}>
          • Request deletion of your account and related data.
        </Text>
        <Text style={styles.p}>• Opt out of marketing notifications.</Text>
        <Text style={styles.p}>
          • Disable location access (which may affect delivery accuracy).
        </Text>

        {/* 6. Cookies */}
        <Text style={styles.sectionTitle}>
          6. Cookies & Tracking Technologies
        </Text>
        <Text style={styles.p}>
          We may use cookies or similar tracking technologies to analyze app
          usage, improve performance, and personalize your user experience. You
          may disable cookies in your device settings.
        </Text>

        {/* 7. Children Policy */}
        <Text style={styles.sectionTitle}>7. Children’s Privacy</Text>
        <Text style={styles.p}>
          Our service is not intended for children under 13. We do not knowingly
          collect personal information from children.
        </Text>

        {/* 8. Policy Changes */}
        <Text style={styles.sectionTitle}>8. Policy Updates</Text>
        <Text style={styles.p}>
          We may update this Privacy Policy from time to time. Any changes will
          be notified within the app.
        </Text>

        {/* 9. Contact */}
        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.p}>
          If you have any questions regarding this Privacy Policy, please
          contact us:
        </Text>
        <Text style={styles.p}>• Email: support@yourrestaurant.com</Text>
        <Text style={styles.p}>• Hotline: 0123 456 789</Text>
        <Text style={styles.p}>
          • Address: Your Restaurant Address, Vietnam
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  scrollView: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 16 },
  p: { color: "#555", marginTop: 6, lineHeight: 20 },
});
