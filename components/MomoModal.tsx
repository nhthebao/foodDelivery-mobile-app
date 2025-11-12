// assets/components/MoMoQRModal.tsx
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";

interface MoMoQRModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount?: number;
  orderCode?: string;
  description?: string;
}

const MoMoQRModal: React.FC<MoMoQRModalProps> = ({
  visible,
  onClose,
  onSuccess,
  amount = 100000,
  orderCode = "ORDER_12345",
  description = "Thanh toan don hang",
}) => {
  // Tạo URL QR động
  const qrUrl = `https://qr.sepay.vn/img?acc=VQRQAFDAW5405&bank=MBBank&amount=${amount}&des=${encodeURIComponent(
    description
  )}`;

  // Hàm lưu QR code về máy
  const handleSaveQR = async () => {
    try {
      // Yêu cầu quyền ghi vào thư viện ảnh (chỉ cần writeOnly)
      const { status } = await MediaLibrary.requestPermissionsAsync(false);

      if (status !== "granted") {
        Alert.alert(
          "Cần cấp quyền",
          "Vui lòng cấp quyền truy cập thư viện ảnh để lưu QR code"
        );
        return;
      }

      // Tải QR code về
      const fileUri = FileSystem.documentDirectory + `QR_${orderCode}.png`;
      const downloadResult = await FileSystem.downloadAsync(qrUrl, fileUri);

      if (downloadResult.status === 200) {
        // Lưu vào thư viện ảnh
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);

        // Thử tạo album, nếu lỗi thì bỏ qua (vẫn lưu được ảnh)
        try {
          await MediaLibrary.createAlbumAsync("QR Codes", asset, false);
        } catch (albumError) {
          console.log("Album creation skipped:", albumError);
        }

        Alert.alert("Thành công", "Đã lưu QR code vào thư viện ảnh!");
      } else {
        Alert.alert("Lỗi", "Không thể tải QR code. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error saving QR:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu QR code!");
    }
  };

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

        {/* Header với nút lưu */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Quét QR Thanh Toán</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveQR}>
            <Text style={styles.saveButtonText}>💾 Lưu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.qrContainer}>
          <Image
            source={{ uri: qrUrl }}
            style={styles.qrImage}
            resizeMode="contain"
          />
          <Text style={styles.qrInstruction}>
            Mở app ngân hàng và quét mã QR để thanh toán
          </Text>
          <Text style={styles.amountText}>
            Số tiền: {amount.toLocaleString("vi-VN")} VND
          </Text>
          <Text style={styles.orderText}>Mã đơn hàng: {orderCode}</Text>
          <Text style={styles.descText} numberOfLines={2}>
            {description}
          </Text>
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
    marginBottom: 5,
  },
  descText: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginTop: 5,
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
