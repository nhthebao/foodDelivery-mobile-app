// app/payments/payment-methods.tsx
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import ContinueButton from "@/components/ContinueButton";
import MoMoQRModal from "@/components/MomoModal";
import PaymentOption from "@/components/PaymentOption";
import { SafeAreaView } from "react-native-safe-area-context";

interface PaymentOptionData {
  id: string;
  label: string;
  icon: any;
}

const PaymentMethodsScreen: React.FC = () => {
  const [selected, setSelected] = useState<string>("momo");
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  const paymentOptions: PaymentOptionData[] = [
    {
      id: "momo",
      label: "MoMo",
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

  const handleContinue = () => {
    if (selected === "cod") {
      // COD: Trực tiếp success
      router.push("/payment/paymentSuccessScreen");
      return;
    }

    if (selected === "momo") {
      // Hiển thị QR code modal
      setShowQRModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowQRModal(false);
  };

  const handleSuccess = () => {
    // Giả sử sau khi quét QR thành công, navigate đến success
    setShowQRModal(false);
    router.push("/payment/paymentSuccessScreen");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Payment Methods</Text>
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

      {/* --- MOMO QR MODAL --- */}
      <MoMoQRModal
        visible={showQRModal}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
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
