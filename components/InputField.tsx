// assets/components/InputField.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface InputFieldProps {
  label?: string;
  placeholder: string;
  style?: object;
  value: string;
  onChangeText: Dispatch<SetStateAction<string>>;
  secureTextEntry?: boolean;
  error?: string;
  editable?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  style,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  editable = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = secureTextEntry;
  const actualSecureTextEntry = isPasswordField && !showPassword;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={[styles.input, !editable && styles.inputDisabled]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={actualSecureTextEntry}
          editable={editable}
        />

        {/* 🆕 Icon Con Mắt - Ẩn/Hiện Password */}
        {isPasswordField && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color={error ? "#FF6B35" : "#666"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
    color: "#999",
  },
  eyeButton: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  inputError: {
    borderColor: "#FF6B35",
  },
  errorText: {
    color: "#FF6B35",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },
});

export default InputField;
