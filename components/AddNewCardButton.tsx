import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface AddNewCardButtonProps {
  onPress?: () => void;
}

const AddNewCardButton: React.FC<AddNewCardButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>+ Add New Card</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 16,
    color: "#555",
  },
});

export default AddNewCardButton;
