import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ItemProps {
  image: any;
  name: string;
  desc: string;
  price: string;
  selected?: boolean;
}

const CheckoutItem: React.FC<ItemProps> = ({
  image,
  name,
  desc,
  price,
  selected,
}) => (
  <View style={[styles.item, selected && styles.itemSelected]}>
    <View style={styles.itemLeft}>
      <TouchableOpacity style={styles.radioOuter}>
        {selected && <View style={styles.radioInner} />}
      </TouchableOpacity>
      <Image source={image} style={styles.itemImage} />
      <View>
        <Text style={styles.itemName}>{name}</Text>
        <Text style={styles.itemDesc}>{desc}</Text>
        <Text style={styles.itemPrice}>{price}</Text>
      </View>
    </View>
    <View style={styles.itemRight}>
      <TouchableOpacity style={styles.qtyButton}>
        <Text style={styles.qtyText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.qtyValue}>01</Text>
      <TouchableOpacity style={styles.qtyButton}>
        <Text style={styles.qtyText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);
export default CheckoutItem;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f6f6f6",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  itemSelected: {
    borderColor: "#f26522",
    borderWidth: 1.5,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f26522",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  itemDesc: {
    color: "#777",
    fontSize: 12,
  },
  itemPrice: {
    fontWeight: "600",
    marginTop: 5,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    width: 25,
    height: 25,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  qtyValue: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});
