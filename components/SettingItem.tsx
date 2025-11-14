import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SettingItemProps {
  label: string;
  href: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const SettingItem = ({ label, href, icon }: SettingItemProps) => (
  <Link href={href} asChild>
    <TouchableOpacity style={styles.row}>
      <View style={styles.leftContent}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color="#f26522" />
          </View>
        )}
        <Text style={styles.rowText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  </Link>
);

export default SettingItem;

const styles = StyleSheet.create({
  row: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#fff5f0",
    justifyContent: "center",
    alignItems: "center",
  },
  rowText: {
    fontSize: 16,
    color: "#222",
  },
});
