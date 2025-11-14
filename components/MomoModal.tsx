// assets/components/MoMoQRModal.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { captureRef } from "react-native-view-shot";
import Constants from "expo-constants";
import {
  startPaymentPolling,
  stopPaymentPolling,
  checkPaymentStatus,
} from "../services/paymentServices";

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
  const [isChecking, setIsChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("unpaid");
  const [countdown, setCountdown] = useState(300); // 5 phút = 300 giây
  const [isDownloading, setIsDownloading] = useState(false);
  const [mediaLibraryStatus, requestMediaLibraryPermission] =
    MediaLibrary.usePermissions();

  // App state ref for handling background/foreground
  const appState = useRef(AppState.currentState);
  // Ref cho QR container để capture
  const qrContainerRef = useRef<View>(null);

  // Tạo URL QR động với Virtual Account từ Sepay
  // acc = Virtual Account (subAccount trong webhook)
  // des = Nội dung CK (content trong webhook) - Phải chứa orderCode để webhook nhận dạng
  const qrUrl = `https://qr.sepay.vn/img?acc=VQRQAFFXT3481&bank=MBBank&amount=${amount}&des=${encodeURIComponent(
    orderCode
  )}`;

  // Bắt đầu kiểm tra thanh toán khi modal mở
  useEffect(() => {
    if (visible && orderCode) {
      setIsChecking(true);
      setPaymentStatus("unpaid");
      setCountdown(300);

      console.log(`🔍 Starting payment verification for order: ${orderCode}`);

      // Bắt đầu polling
      startPaymentPolling(
        orderCode,
        (status) => {
          console.log("💳 Payment status updated:", status);
          setPaymentStatus(status.paymentStatus);
        },
        () => {
          // Thanh toán thành công
          console.log("✅ Payment confirmed!");
          setIsChecking(false);

          // ✅ Đóng modal trước để tránh lỗi navigation
          stopPaymentPolling();

          Alert.alert(
            "Thanh toán thành công! 🎉",
            "Đơn hàng của bạn đã được xác nhận.",
            [
              {
                text: "OK",
                onPress: () => {
                  onSuccess();
                },
              },
            ],
            { cancelable: false } // Không cho dismiss bằng cách tap ra ngoài
          );
        },
        () => {
          // Timeout
          console.log("⏱️ Payment verification timeout");
          setIsChecking(false);
          Alert.alert(
            "Hết thời gian chờ",
            "Không nhận được xác nhận thanh toán. Vui lòng kiểm tra lại đơn hàng trong lịch sử.",
            [
              {
                text: "Xem đơn hàng",
                onPress: () => {
                  onClose();
                  // TODO: Navigate to orders history
                },
              },
              {
                text: "Đóng",
                onPress: onClose,
                style: "cancel",
              },
            ]
          );
        }
      );

      // Đếm ngược thời gian
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
      };
    }

    return () => {
      stopPaymentPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, orderCode]);

  // ✅ Handle app state changes (khi user thoát/quay lại app)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        // Khi user quay lại app từ background
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active" &&
          visible &&
          orderCode
        ) {
          console.log(
            "🔄 App returned to foreground, checking payment status..."
          );

          // Check payment status ngay lập tức
          try {
            const result = await checkPaymentStatus(orderCode);
            if (result && result.paymentStatus === "paid") {
              console.log("✅ Payment confirmed while app was in background!");
              stopPaymentPolling();
              setIsChecking(false);
              setPaymentStatus("paid");

              Alert.alert(
                "Thanh toán thành công! 🎉",
                "Đơn hàng của bạn đã được xác nhận.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      onSuccess();
                    },
                  },
                ],
                { cancelable: false }
              );
            }
          } catch (error) {
            console.error("❌ Error checking payment status:", error);
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [visible, orderCode, onSuccess]);

  // Cleanup khi đóng modal
  const handleClose = () => {
    stopPaymentPolling();
    setIsChecking(false);
    onClose();
  };

  // Format thời gian còn lại
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const onSaveImageAsync = async () => {
    try {
      // Xin quyền trước
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Không có quyền",
          "Ứng dụng cần quyền truy cập thư viện để lưu ảnh."
        );
        return;
      }

      setIsDownloading(true);

      // Chụp vùng QR
      const uri = await captureRef(qrContainerRef, {
        format: "png",
        quality: 1,
      });

      // Lưu vào thư viện
      await MediaLibrary.saveToLibraryAsync(uri);

      setIsDownloading(false);
      Alert.alert("Đã lưu", "Mã QR đã được lưu vào thư viện ảnh 🔥");
    } catch (e) {
      setIsDownloading(false);
      console.log("Error saving QR:", e);
      Alert.alert("Lỗi", "Không thể lưu ảnh.");
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      swipeDirection="down"
      onSwipeComplete={handleClose}
      style={styles.modal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.dragIndicator} />

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Quét QR Thanh Toán</Text>
        </View>

        {/* Trạng thái thanh toán */}
        {isChecking && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#f26522" />
            <Text style={styles.statusText}>
              Đang chờ xác nhận thanh toán...
            </Text>
            <Text style={styles.countdownText}>
              Thời gian còn lại: {formatTime(countdown)}
            </Text>
          </View>
        )}

        {paymentStatus === "paid" && (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successText}>Đã thanh toán thành công!</Text>
          </View>
        )}

        <View style={styles.qrContainer} ref={qrContainerRef}>
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

          {/* Nút tải mã QR */}
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={onSaveImageAsync}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.downloadButtonContent}>
                <MaterialCommunityIcons
                  name="download"
                  size={16}
                  color="#fff"
                  style={styles.downloadIcon}
                />
                <Text style={styles.downloadButtonText}>Lưu mã QR</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Nút đóng */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dragIndicator: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
  headerContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
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
  statusContainer: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 15,
    gap: 5,
  },
  statusText: {
    fontSize: 14,
    color: "#f26522",
    fontWeight: "500",
    marginTop: 5,
  },
  countdownText: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 15,
    gap: 10,
  },
  successIcon: {
    fontSize: 24,
  },
  successText: {
    fontSize: 14,
    color: "#4caf50",
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: "#666",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  downloadButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    justifyContent: "center",
  },
  downloadButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  downloadIcon: {
    marginRight: 6,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  successButton: {
    backgroundColor: "#f26522",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  successButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MoMoQRModal;
