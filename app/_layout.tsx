import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DessertProvider } from "../context/DessertContext";
import { UserProvider } from "../context/UserContext";
import { UserListProvider } from "../context/UserListContext";

export default function RootLayout() {
  return (
    <UserListProvider>
      <UserProvider>
        <DessertProvider>
          <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
               <Stack.Screen
                name="begin/splashScreen"
                options={{headerShown: false, presentation: "fullScreenModal", animation: "fade" }}
              />
              <Stack.Screen name="index"/>
              <Stack.Screen name="(tabs)"/>
            </Stack>
          </SafeAreaProvider>
        </DessertProvider>
      </UserProvider>
    </UserListProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
