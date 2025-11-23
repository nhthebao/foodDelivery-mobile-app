// app/payments/payment-methods.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ContinueButton from "@/components/ContinueButton";
import PaymentOption from "@/components/PaymentOption";
import { useCurrentUser } from "@/context/UserContext";
import { SafeAreaView } from "react-native-safe-area-context";

interface PaymentOptionData {
  id: string;
  label: string;
  icon: any;
}

const PaymentMethodsScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const { currentUser, editUser } = useCurrentUser();
  const [selected, setSelected] = useState<string>("momo");

  // ✅ Load phương thức thanh toán đã lưu khi component mount
  useEffect(() => {
    if (currentUser?.paymentMethod) {
      // Convert từ saved payment method sang payment ID
      if (
        currentUser.paymentMethod === "momo" ||
        currentUser.paymentMethod === "Thanh toán trực tuyến"
      ) {
        setSelected("momo");
      } else if (
        currentUser.paymentMethod === "cod" ||
        currentUser.paymentMethod === "Thanh toán khi nhận hàng"
      ) {
        setSelected("cod");
      }
      console.log("✅ Loaded saved payment method:", currentUser.paymentMethod);
    }
  }, [currentUser]);

  const paymentOptions: PaymentOptionData[] = [
    {
      id: "momo",
      label: "Thanh toán trực tuyến",
      icon: require("../../assets/images/momo.png"),
    },
    {
      id: "cod",
      label: "Thanh toán khi nhận hàng",
      icon: require("../../assets/images/cash.jpg"),
    },
  ];

  const handlePaymentSelection = (id: string) => {
    setSelected(id);
  };

  const getPaymentLabel = (id: string) => {
    const option = paymentOptions.find((opt) => opt.id === id);
    return option ? option.label : "cod";
  };

  const handleContinue = async () => {
    const selectedMethod = getPaymentLabel(selected);
    console.log("💳 Payment method selected:", selectedMethod);
    console.log(
      "🔙 Navigating back to checkout with selectedItemIds:",
      params.selectedItemIds
    );

    // ✅ Navigate về checkout với params đầy đủ
    // KHÔNG save vào server ở đây vì sẽ làm mất cart
    router.replace({
      pathname: "/payment/checkOut",
      params: {
        selectedItemIds: params.selectedItemIds as string,
        selectedPaymentMethod: selectedMethod,
        timestamp: Date.now().toString(), // Force re-render
      },
    });
  };
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {paymentOptions.map((opt) => (
          <PaymentOption
            key={opt.id}
            icon={opt.icon}
            label={opt.label}
            selected={selected === opt.id}
            onPress={() => handlePaymentSelection(opt.id)}
          />
        ))}

        <ContinueButton onPress={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});

export default PaymentMethodsScreen;
