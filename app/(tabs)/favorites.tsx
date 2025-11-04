import { CustomAlert } from "@/components/CustomAlert";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useDessert } from "@/context/DessertContext";
import { useCurrentUser } from "@/context/UserContext";
import { Dessert } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const ORANGE = "#E76F00";
const BACKGROUND = "#FAFAFA";

export default function FavoritesScreen() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const {
    desserts,
    loading,
    toggleFavorite,
    isFavorite,
    refreshDesserts,
    clearFavorites,
  } = useDessert();
  const [favoriteItems, setFavoriteItems] = useState<Dessert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showClearAlert, setShowClearAlert] = useState(false);

  // Load favorites
  useEffect(() => {
    if (currentUser?.favorite && desserts.length > 0) {
      const favorites = desserts.filter((d) =>
        currentUser.favorite.includes(d.id)
      );
      setFavoriteItems(favorites);
    }
  }, [currentUser?.favorite, desserts]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshDesserts?.(); // Gọi hàm refresh từ context
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshDesserts]);

  // Clear all favorites
  const handleClearAll = async () => {
    setShowClearAlert(true);
  };

  const confirmClearAll = async () => {
    const success = await clearFavorites();
    setShowClearAlert(false);
    if (success) {
      // Tự động cập nhật UI (do context sẽ re-render)
    }
  };

  const handleToggleFavorite = async (dessertId: string) => {
    await toggleFavorite(dessertId);
  };

  const renderItem = ({ item, index }: { item: Dessert; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => router.push(`/menu/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.image }}
            style={styles.itemImage}
            resizeMode="cover"
          />
          <View style={styles.favoriteBtnContainer}>
            <FavoriteButton
              isFavorite={isFavorite(item.id)}
              onPress={(e) => {
                e.stopPropagation();
                handleToggleFavorite(item.id);
              }}
              size={28}
            />
          </View>
          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </View>
          )}
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={15} color={ORANGE} />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviews}> ({item.reviews})</Text>
          </View>
          <Text style={styles.price}>${item.price}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="heart" size={28} color={ORANGE} />
          <Text style={styles.title}>My Favorites</Text>
        </View>
        <View style={styles.headerActions}>
          <Text style={styles.subtitle}>
            {favoriteItems.length}{" "}
            {favoriteItems.length === 1 ? "item" : "items"}
          </Text>
          {favoriteItems.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Empty State */}
      {favoriteItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="heart-outline" size={80} color="#ddd" />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any dessert to save it here
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/(tabs)")}
            activeOpacity={0.8}
          >
            <Ionicons name="restaurant" size={20} color="#fff" />
            <Text style={styles.browseButtonText}> Explore Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favoriteItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={ORANGE}
            />
          }
        />
      )}

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={showClearAlert}
        title="Clear Favorites"
        message={`Remove all ${favoriteItems.length} items from favorites?`}
        buttons={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setShowClearAlert(false),
          },
          {
            text: "Clear All",
            style: "destructive",
            onPress: confirmClearAll,
          },
        ]}
        onClose={() => setShowClearAlert(false)}
      />
    </SafeAreaView>
  );
}

// === STYLES (cập nhật thêm cho Clear button) ===
const styles = StyleSheet.create({
  // ... (giữ nguyên các style cũ)

  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#fff0f0",
    borderRadius: 8,
  },
  clearText: {
    color: "#ff4444",
    fontSize: 13,
    fontWeight: "600",
  },

  // Các style cũ giữ nguyên...
  container: { flex: 1, backgroundColor: BACKGROUND },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#888",
    fontWeight: "500",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 24, fontWeight: "700", color: "#000" },
  subtitle: { fontSize: 15, color: "#666", fontWeight: "500" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  browseButton: {
    flexDirection: "row",
    backgroundColor: ORANGE,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 8,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  browseButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  listContent: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 100 },
  gridRow: { justifyContent: "space-between", paddingHorizontal: 4 },
  itemCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  imageWrapper: { position: "relative", width: "100%", height: 160 },
  itemImage: { width: "100%", height: "100%" },
  favoriteBtnContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: ORANGE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  discountText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  itemInfo: { padding: 14 },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
    lineHeight: 20,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  rating: { fontSize: 13, fontWeight: "700", color: "#000", marginLeft: 4 },
  reviews: { fontSize: 12, color: "#888" },
  price: { fontSize: 18, fontWeight: "800", color: ORANGE },
});
