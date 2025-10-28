import { Dessert } from "@/types/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRIMARY_COLOR = "#ff6a00"; // Màu chủ đạo của app

interface HydratedCartItem extends Dessert {
  quantity: number;
}

const CartItemRow = ({
  item,
  isSelected,
  onSelect,
}: {
  item: HydratedCartItem;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={onSelect} style={styles.selectButton}>
        <MaterialCommunityIcons
          name={
            isSelected ? "checkbox-marked-outline" : "checkbox-blank-outline"
          }
          size={24}
          color={PRIMARY_COLOR}
        />
      </TouchableOpacity>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.itemPrice, { color: PRIMARY_COLOR }]}>
          {item.price.toLocaleString("vi-VN")}đ
        </Text>
      </View>
      <View style={styles.quantityBox}>
        <Text style={styles.quantityText}>x{item.quantity}</Text>
      </View>
    </View>
  );
};

export default CartItemRow;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    padding: 10,
    elevation: 1,
  },
  selectButton: {
    paddingRight: 10,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  quantityBox: {
    paddingHorizontal: 15,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
});
