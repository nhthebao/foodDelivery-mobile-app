import { Platform } from "react-native";

/**
 * Hook để get header paddingTop dựa trên platform
 * iOS (có notch/Dynamic Island): paddingTop = 50
 * Android: paddingTop = 12
 */
export const useHeaderPadding = () => {
    return Platform.OS === "ios" ? 50 : 30;
};
