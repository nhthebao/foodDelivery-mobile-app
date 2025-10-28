// assets/components/MoMoQRModal.tsx
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

interface MoMoQRModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MoMoQRModal: React.FC<MoMoQRModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection="down"
      onSwipeComplete={onClose}
      style={styles.modal}>
      <View style={styles.modalContainer}>
        <View style={styles.dragIndicator} />
        <Text style={styles.headerTitle}>Quét QR MoMo</Text>

        <View style={styles.qrContainer}>
          <Image
            source={require("../assets/images/momo_qr.png")}
            style={styles.qrImage}
            resizeMode="contain"
          />
          <Text style={styles.qrInstruction}>
            Mở app MoMo và quét mã QR để thanh toán
          </Text>
          <Text style={styles.amountText}>Số tiền: 100,000 VND</Text>
          <Text style={styles.orderText}>Mã đơn hàng: ORDER_12345</Text>
        </View>

        <TouchableOpacity style={styles.successButton} onPress={onSuccess}>
          <Text style={styles.successButtonText}>
            Xác nhận thanh toán thành công (Demo)
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  dragIndicator: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: "center",
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  qrInstruction: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  amountText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f26522",
    marginBottom: 5,
  },
  orderText: {
    fontSize: 14,
    color: "#666",
  },
  successButton: {
    backgroundColor: "#f26522",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 30,
    width: "100%",
  },
  successButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MoMoQRModal;
