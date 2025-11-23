import { Dessert } from "@/types/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { CustomAlert } from "@/components/CustomAlert";
import { useState, useCallback, memo } from "react";

const PRIMARY_COLOR = "#ff6a00"; // Màu chủ đạo của app
const DELETE_COLOR = "#E76F00"; // Màu cho icon xóa (đồng bộ với favorites)

interface HydratedCartItem extends Dessert {
  quantity: number;
}

const CartItemRow = ({
  item,
  isSelected,
  onSelect,
  onUpdateQuantity,
  onRemoveItem,
}: {
  item: HydratedCartItem;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: "cancel" | "destructive";
    }>;
  }>({ title: "", message: "", buttons: [] });

  const handleDecrease = useCallback(async () => {
    if (isUpdating) return;

    if (item.quantity > 1) {
      setIsUpdating(true);
      try {
        await onUpdateQuantity(item.id, item.quantity - 1);
      } finally {
        setIsUpdating(false);
      }
    } else {
      setAlertConfig({
        title: "Remove Item",
        message: `Do you want to remove "${item.name}" from the cart?`,
        buttons: [
          {
            text: "Cancel",
            onPress: () => setAlertVisible(false),
            style: "cancel",
          },
          {
            text: "Remove",
            onPress: () => {
              onRemoveItem(item.id);
              setAlertVisible(false);
            },
            style: "destructive",
          },
        ],
      });
      setAlertVisible(true);
    }
  }, [
    item.quantity,
    item.id,
    item.name,
    isUpdating,
    onUpdateQuantity,
    onRemoveItem,
  ]);

  const handleIncrease = useCallback(async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, item.quantity + 1);
    } finally {
      setIsUpdating(false);
    }
  }, [item.id, item.quantity, isUpdating, onUpdateQuantity]);

  const handleRemove = useCallback(() => {
    setAlertConfig({
      title: "Remove Item",
      message: `Do you want to remove "${item.name}" from the cart?`,
      buttons: [
        {
          text: "Cancel",
          onPress: () => setAlertVisible(false),
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => {
            onRemoveItem(item.id);
            setAlertVisible(false);
          },
          style: "destructive",
        },
      ],
    });
    setAlertVisible(true);
  }, [item.id, item.name, onRemoveItem]);
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
          ${item.price.toFixed(2)}
        </Text>
      </View>

      {/* Quantity Controls */}
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={handleDecrease}
          style={[styles.quantityButton, isUpdating && styles.disabledButton]}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={PRIMARY_COLOR} />
          ) : (
            <MaterialCommunityIcons
              name="minus"
              size={16}
              color={PRIMARY_COLOR}
            />
          )}
        </TouchableOpacity>

        <Text style={styles.quantityText}>{item.quantity}</Text>

        <TouchableOpacity
          onPress={handleIncrease}
          style={[styles.quantityButton, isUpdating && styles.disabledButton]}
          disabled={isUpdating}
        >
          <MaterialCommunityIcons name="plus" size={16} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      {/* Delete Button */}
      <TouchableOpacity onPress={handleRemove} style={styles.deleteButton}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={20}
          color={DELETE_COLOR}
        />
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default memo(CartItemRow);

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "100%",
    marginTop: 10,
    borderRadius: 8,
    padding: 12,
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
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#fef2f2",
    marginLeft: 5,
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: "#f5f5f5",
  },
});
