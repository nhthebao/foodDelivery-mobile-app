import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const RatingDriverScreen: React.FC = () => {
  const navigation = useNavigation();
  const [rating, setRating] = useState(4);

  const handleStarPress = (index: number) => setRating(index);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rating</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.orderNumber}>Order Number - 012345</Text>
        <Text style={styles.orderTime}>Today, 09:35 AM</Text>

        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/41.jpg" }}
          style={styles.avatar}
        />

        <Text style={styles.driverName}>Lucas Nathan</Text>
        <Text style={styles.driverSub}>
          How much rating would you like to give?
        </Text>

        {/* Rating stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity key={i} onPress={() => handleStarPress(i)}>
              <Ionicons
                name={i <= rating ? "star" : "star-outline"}
                size={36}
                color={i <= rating ? "#f6b93b" : "#ccc"}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => navigation.navigate("Home" as never)}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RatingDriverScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 26,
  },
  content: {
    alignItems: "center",
    marginTop: 40,
  },
  orderNumber: {
    fontWeight: "700",
    fontSize: 16,
  },
  orderTime: {
    color: "#999",
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  driverName: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
  },
  driverSub: {
    color: "#555",
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: "#f26522",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 50,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
