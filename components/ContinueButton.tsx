import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ContinueButtonProps {
  onPress?: () => void;
}

const ContinueButton: React.FC<ContinueButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.continueButton} onPress={onPress}>
      <Text style={styles.text}>Continue</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  continueButton: {
    backgroundColor: "#FF6B00",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  text: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});

export default ContinueButton;
