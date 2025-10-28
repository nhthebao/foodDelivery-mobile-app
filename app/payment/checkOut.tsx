import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CheckoutItem, { ItemProps } from "../../components/CheckOutItem";

const CheckoutScreen: React.FC = () => {
  const router = useRouter();

  const itemList: ItemProps[] = [
    {
      image: require("../../assets/images/pizza1.png"),
      name: "Cheese Pizza",
      desc: "Pizza",
      price: "$20.00",
      selected: true,
    },
    {
      image: require("../../assets/images/pizza2.png"),
      name: "Supreme Pizza",
      desc: "Pizza",
      price: "$20.00",
    },
    {
      image: require("../../assets/images/pizza3.png"),
      name: "Veggie Pizza",
      desc: "Pizza",
      price: "$18.00",
    },
  ];

  // 👉 Hàm xử lý chuyển trang
  const handleCheckout = () => {
    router.push("/payments/payment-success-screen");
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.itemContainer}>
          <FlatList
            data={itemList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <CheckoutItem
                image={item.image}
                name={item.name}
                desc={item.desc}
                price={item.price}
                selected={item.selected}
              />
            )}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.addressSection}>
          <View style={styles.addressHeader}>
            <Text style={styles.sectionTitle}>Address</Text>
            <TouchableOpacity>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>Home</Text>
            <Text style={styles.addressSubText}>
              123 Main Street, District 1, Ho Chi Minh City
            </Text>
          </View>
        </View>

        <View style={styles.paymentSummary}>
          <View style={styles.rowBetween}>
            <Text style={styles.summaryText}>Order Amount</Text>
            <Text style={styles.summaryText}>$20.00</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.summaryText}>Tax</Text>
            <Text style={styles.summaryText}>$5</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.summaryText}>Discount</Text>
            <Text style={styles.summaryText}>$0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.totalText}>Total Payment</Text>
            <Text style={styles.totalText}>$25.00</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}>
          <Text style={styles.checkoutText}>Proceed To Checkout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  itemContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  addressSection: {
    marginHorizontal: 20,
    marginTop: 15,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  editText: {
    color: "#f26522",
    fontWeight: "500",
  },
  addressBox: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  addressText: {
    fontSize: 15,
    fontWeight: "600",
  },
  addressSubText: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },
  paymentSummary: {
    marginTop: 25,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    color: "#333",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "700",
  },
  checkoutButton: {
    backgroundColor: "#f26522",
    borderRadius: 30,
    marginHorizontal: 20,
    marginVertical: 30,
    alignItems: "center",
    paddingVertical: 15,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
