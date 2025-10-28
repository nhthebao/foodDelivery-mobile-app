import BottomSheet from "@gorhom/bottom-sheet";
import React, { useMemo, useRef } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const OrderTrackingScreen = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  return (
    <View style={styles.container}>
      {/* Map placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={{ color: "#555" }}>Map will appear here</Text>
      </View>

      {/* BottomSheet hiển thị thông tin đơn hàng */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}>
        <View style={styles.sheetContent}>
          {/* Header */}
          <Text style={styles.orderTitle}>Order Number - 012345</Text>
          <Text style={styles.orderTime}>📅 Today, 03:45 PM</Text>

          {/* Shipper Info */}
          <View style={styles.driverRow}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/147/147144.png",
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.driverName}>Lucas Nathan</Text>
              <Text style={styles.rating}>⭐ 4.9</Text>
            </View>
            <View style={styles.actionButtons}>
              <View style={styles.iconCircle}>
                <Text>📞</Text>
              </View>
              <View style={styles.iconCircle}>
                <Text>💬</Text>
              </View>
            </View>
          </View>

          {/* Order Status */}
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>🛍️ Preparing your order</Text>
            <Text style={styles.statusDesc}>
              The restaurant is preparing your food
            </Text>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
};

export default OrderTrackingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#e8e8e8",
    justifyContent: "center",
    alignItems: "center",
  },
  sheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: "#ccc",
    width: 60,
  },
  sheetContent: {
    flex: 1,
    padding: 20,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  orderTime: {
    color: "#777",
    marginTop: 4,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "500",
  },
  rating: {
    color: "#666",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  iconCircle: {
    backgroundColor: "#f3f3f3",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  statusBox: {
    backgroundColor: "#f4f0ff",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  statusText: {
    fontWeight: "600",
    fontSize: 16,
  },
  statusDesc: {
    color: "#666",
    marginTop: 4,
  },
});
