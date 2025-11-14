import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  type?: "success" | "error" | "warning" | "info";
  onClose?: () => void;
}

export default function AlertModal({
  visible,
  title,
  message,
  buttons,
  type = "info",
  onClose,
}: AlertModalProps) {
  const getIconName = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "warning":
        return "alert-circle";
      case "info":
      default:
        return "information-circle";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#FF6B35";
      case "warning":
        return "#FFA500";
      case "info":
      default:
        return "#2196F3";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay} />

        <View style={styles.centeredView}>
          <View style={styles.modalContent}>
            {/* Icon */}
            <Ionicons
              name={getIconName()}
              size={64}
              color={getIconColor()}
              style={styles.icon}
            />

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Buttons */}
            <View
              style={[
                styles.buttonsContainer,
                buttons.length > 2 && styles.buttonsColumn,
              ]}
            >
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === "cancel" && styles.buttonCancel,
                    button.style === "destructive" && styles.buttonDestructive,
                    buttons.length > 1 && styles.buttonMultiple,
                  ]}
                  onPress={() => {
                    button.onPress?.();
                    onClose?.();
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      button.style === "cancel" && styles.buttonTextCancel,
                      button.style === "destructive" &&
                        styles.buttonTextDestructive,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: Dimensions.get("window").width * 0.82,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#222",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
    fontWeight: "400",
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  buttonsColumn: {
    flexDirection: "column",
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 45,
  },
  buttonCancel: {
    backgroundColor: "#E8E8E8",
  },
  buttonDestructive: {
    backgroundColor: "#F44336",
  },
  buttonMultiple: {
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  buttonTextCancel: {
    color: "#555",
  },
  buttonTextDestructive: {
    color: "white",
  },
});
