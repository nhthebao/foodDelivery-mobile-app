import { CurrentUserProvider } from "@/context/UserContext";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DessertProvider } from "../context/DessertContext";
import { UserListProvider } from "../context/UserListContext"; // ✅ import thêm

export default function RootLayout() {
  return (
    <UserListProvider>
      <CurrentUserProvider>
        <DessertProvider>
          <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="begin/splashScreen"
                options={{
                  headerShown: false,
                  presentation: "fullScreenModal",
                  animation: "fade",
                }}
              />
              <Stack.Screen name="index" />
              <Stack.Screen
                name="(tabs)"
                options={{
                  gestureEnabled: false, // Disable swipe back from main app
                }}
              />
              <Stack.Screen
                name="login-signUp/loginScreen"
                options={{
                  gestureEnabled: false, // Disable swipe back on login
                }}
              />
              <Stack.Screen
                name="login-signUp/signupScreen"
                options={{
                  gestureEnabled: false, // Disable swipe back on signup
                }}
              />
            </Stack>
          </SafeAreaProvider>
        </DessertProvider>
      </CurrentUserProvider>
    </UserListProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
