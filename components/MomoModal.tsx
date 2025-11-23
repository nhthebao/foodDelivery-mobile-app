// assets/components/MoMoQRModal.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { captureRef } from "react-native-view-shot";
import {
  checkPaymentStatus,
  startPaymentPolling,
  stopPaymentPolling,
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

  // ✅ Detect khi payment status chuyển thành paid
  useEffect(() => {
    if (paymentStatus === "paid" && visible) {
      console.log("🎉 Payment status changed to PAID - triggering success!");
      stopPaymentPolling();
      setIsChecking(false);

      Alert.alert(
        "Thanh toán thành công! 🎉",
        "Đơn hàng của bạn đã được xác nhận.",
        [
          {
            text: "OK",
            onPress: () => {
              onClose();
              onSuccess();
            },
          },
        ],
        { cancelable: false }
      );
    }
  }, [paymentStatus, visible, onClose, onSuccess]);

  // Bắt đầu kiểm tra thanh toán khi modal mở
  useEffect(() => {
    if (visible && orderCode) {
      setIsChecking(true);
      setPaymentStatus("unpaid");
      setCountdown(300);

      console.log(`🔍 Starting payment verification for order: ${orderCode}`);

      // ✅ Wake up server trước để tránh cold start
      wakeUpServer();

      // Bắt đầu polling
      startPaymentPolling(
        orderCode,
        (status) => {
          console.log("💳 Payment status updated:", status);
          console.log(
            `🔔 Current paymentStatus state before update: ${paymentStatus}`
          );
          // ✅ Update state - useEffect sẽ detect khi chuyển thành paid
          setPaymentStatus(status.paymentStatus);
          console.log(`🔔 Setting paymentStatus to: ${status.paymentStatus}`);
        },
        () => {
          // Callback này sẽ được gọi từ polling khi detect paid
          console.log("✅ Payment confirmed from polling!");
        },
        () => {
          // Timeout
          console.log("⏱️ Payment verification timeout");
          setIsChecking(false);
          Alert.alert(
            "Hết thời gian chờ",
            "Chưa nhận được xác nhận thanh toán. Vui lòng kiểm tra lịch sử đơn hàng.",
            [
              {
                text: "Xem đơn hàng",
                onPress: () => {
                  onClose();
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
          orderCode &&
          paymentStatus !== "paid" // Chỉ check nếu chưa paid
        ) {
          console.log("🔄 ========== APP RETURNED TO FOREGROUND ==========");
          console.log(`🔍 Checking payment for order: ${orderCode}`);

          // Check payment status ngay lập tức
          try {
            const result = await checkPaymentStatus(orderCode);
            console.log(`📊 Payment check result:`, result);

            // ✅ Update payment status - useEffect sẽ handle success
            if (result && result.paymentStatus === "paid") {
              console.log("✅ Payment confirmed while app was in background!");
              setPaymentStatus("paid"); // Trigger useEffect
            } else if (result && result.success) {
              console.log(
                "⚠️ Payment not confirmed yet. Status:",
                result.paymentStatus
              );
              // Polling vẫn đang chạy, không cần làm gì
            }
          } catch (error) {
            console.error("❌ Error checking payment status:", error);
            // Resume polling on error
            if (!isChecking) {
              console.log("⚠️ Error occurred, resuming polling...");
              setIsChecking(true);
            }
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [visible, orderCode, onSuccess, onClose, paymentStatus, isChecking]);

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

  // Wake up server để tránh cold start
  const wakeUpServer = async () => {
    try {
      console.log("🔔 Waking up server...");
      const response = await fetch(
        "https://food-delivery-mobile-app.onrender.com/health",
        { method: "GET" }
      );
      if (response.ok) {
        console.log("✅ Server is awake and ready");
      }
    } catch {
      console.log("⚠️ Server wake up failed, but continuing...");
    }
  };

  const onSaveImageAsync = async () => {
    try {
      setIsDownloading(true);
      console.log("🎯 Starting QR save process...");

      // Chụp vùng QR trước
      const uri = await captureRef(qrContainerRef, {
        format: "png",
        quality: 1,
      });

      console.log("📸 Captured QR image:", uri);

      // ✅ Luôn dùng share dialog trên mobile để user tự chọn lưu hoặc share
      // Đơn giản và tránh lỗi permission
      if (Platform.OS === "android" || Platform.OS === "ios") {
        const isAvailable = await Sharing.isAvailableAsync();

        if (!isAvailable) {
          setIsDownloading(false);
          Alert.alert(
            "Không hỗ trợ",
            "Thiết bị không hỗ trợ chia sẻ. Vui lòng chụp màn hình."
          );
          return;
        }

        // Share trực tiếp, user có thể chọn "Save to Files" hoặc "Save Image"
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Lưu hoặc chia sẻ mã QR",
        });

        setIsDownloading(false);
        console.log("✅ Share dialog shown successfully");

        // Thông báo hướng dẫn user
        Alert.alert(
          "Chia sẻ thành công",
          "Chọn 'Save Image' hoặc 'Save to Photos' để lưu mã QR vào thư viện ảnh của bạn.",
          [{ text: "OK" }]
        );
      } else {
        // Web platform
        setIsDownloading(false);
        Alert.alert("Không hỗ trợ", "Vui lòng chụp màn hình để lưu mã QR.");
      }
    } catch (e: any) {
      setIsDownloading(false);
      console.log("❌ Error in save process:", e.message);

      Alert.alert("Lỗi", "Không thể chia sẻ mã QR. Vui lòng chụp màn hình.");
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      swipeDirection="down"
      onSwipeComplete={handleClose}
      style={styles.modal}>
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
            <Text style={styles.successText}>Payment successful!</Text>
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
            disabled={isDownloading}>
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
  checkButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    justifyContent: "center",
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
