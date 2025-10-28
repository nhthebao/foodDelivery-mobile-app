import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserProvider } from "../context/UserContext";
import { DessertProvider } from "../context/DessertContext";
import { UserListProvider } from "../context/UserListContext"; // ✅ import thêm

export default function RootLayout() {
  return (
    <UserListProvider>
      <UserProvider>
        <DessertProvider>
          <SafeAreaView style={styles.safeArea}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="search/index" />
              <Stack.Screen name="filter/index" />
              <Stack.Screen name="menu/[id]" />
              <Stack.Screen name="checkout/index" />
            </Stack>
          </SafeAreaView>
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
