import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface CreditCardViewProps {
  balance: string;
  cardNumber: string;
  expireDate: string;
  brandIcon: ImageSourcePropType;
}

const CreditCardView: React.FC<CreditCardViewProps> = ({
  balance,
  cardNumber,
  expireDate,
  brandIcon,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>Current Balance</Text>
        <Image source={brandIcon} style={styles.icon} />
      </View>

      <Text style={styles.balance}>{balance}</Text>
      <Text style={styles.cardNumber}>{cardNumber}</Text>
      <Text style={styles.expireDate}>{expireDate}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1B1B2F",
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
  },
  balance: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginVertical: 8,
  },
  cardNumber: {
    color: "#fff",
    letterSpacing: 1.5,
    marginTop: 12,
    fontSize: 16,
  },
  expireDate: {
    color: "#fff",
    alignSelf: "flex-end",
    marginTop: 4,
    fontSize: 14,
  },
  icon: {
    width: 40,
    height: 30,
    resizeMode: "contain",
  },
});

export default CreditCardView;
