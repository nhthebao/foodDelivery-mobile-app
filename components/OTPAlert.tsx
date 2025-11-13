import React, { useEffect, useState } from "react";
import {
  Clipboard,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface OTPAlertProps {
  visible: boolean;
  otp: string;
  onClose: () => void;
  onCopyOTP?: (otp: string) => void;
}

export function OTPAlert({ visible, otp, onClose, onCopyOTP }: OTPAlertProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyOTP = async () => {
    try {
      await Clipboard.setString(otp);
      setCopied(true);
      console.log(`✅ [OTP] Copied to clipboard: ${otp}`);
      onCopyOTP?.(otp);
    } catch (error) {
      console.error("❌ [OTP] Failed to copy:", error);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          {/* Header */}
          <Text style={styles.title}>🔐 Mã OTP Của Bạn</Text>
          <Text style={styles.subtitle}>Mã này sẽ hết hạn trong 10 phút</Text>

          {/* OTP Display */}
          <TouchableOpacity
            style={styles.otpContainer}
            onPress={handleCopyOTP}
            activeOpacity={0.7}>
            <Text style={styles.otpText}>{otp}</Text>
            <Text style={styles.copyHint}>
              {copied ? "✅ Đã sao chép!" : "Nhấn để sao chép"}
            </Text>
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Mã này sẽ được dán tự động vào ô nhập khi bạn nhấn
              &quot;Dán&quot;
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text style={styles.secondaryButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                copied && styles.primaryButtonActive,
              ]}
              onPress={handleCopyOTP}
              activeOpacity={0.7}>
              <Text style={styles.primaryButtonText}>
                {copied ? "✅ Sao chép" : "📋 Sao chép OTP"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ff6a00",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },

  // OTP Container
  otpContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ff6a00",
  },
  otpText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ff6a00",
    letterSpacing: 6,
    marginBottom: 8,
    fontFamily: "monospace",
  },
  copyHint: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },

  // Info Box
  infoBox: {
    backgroundColor: "#fff9f0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#ff6a00",
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  // Buttons
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  primaryButton: {
    flex: 1.2,
    backgroundColor: "#ff6a00",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonActive: {
    backgroundColor: "#0fb88f",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
