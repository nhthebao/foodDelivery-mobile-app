import { FavoriteButton } from "@/components/FavoriteButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    PanResponder,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDessert } from "../../context/DessertContext";
import { Dessert } from "../../types/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HomeScreen() {
    const { desserts, loading, toggleFavorite, isFavorite } = useDessert();
    const [showAll, setShowAll] = useState(false);
    const [previewImg, setPreviewImg] = useState<string | null>(null);

    // Floating button position
    const pan = useRef(
        new Animated.ValueXY({
            x: SCREEN_WIDTH - 80,
            y: SCREEN_HEIGHT - 180,
        })
    ).current;

    // Animation
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const router = useRouter();

    // Pan responder for draggable button
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value,
                });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                {
                    useNativeDriver: false,
                }
            ),
            onPanResponderRelease: () => {
                pan.flattenOffset();
                // Snap to edges
                const currentX = (pan.x as any)._value;
                const currentY = (pan.y as any)._value;

                let finalX = currentX;
                let finalY = currentY;

                // Snap to left or right edge
                if (currentX < SCREEN_WIDTH / 2) {
                    finalX = 20;
                } else {
                    finalX = SCREEN_WIDTH - 80;
                }

                // Keep within screen bounds
                if (finalY < 100) finalY = 100;
                if (finalY > SCREEN_HEIGHT - 180) finalY = SCREEN_HEIGHT - 180;

                Animated.spring(pan, {
                    toValue: { x: finalX, y: finalY },
                    useNativeDriver: false,
                    friction: 7,
                }).start();
            },
        })
    ).current;

    if (loading)
        return (
            <ActivityIndicator
                size="large"
                style={{ flex: 1, marginTop: 120 }}
            />
        );

    const displayedDesserts: Dessert[] = showAll
        ? desserts
        : desserts.slice(0, 6);

    // 🧩 Khi giữ ảnh 0.6 giây → hiển thị preview với hiệu ứng đẹp
    const handleLongPress = (img: string) => {
        setPreviewImg(img);

        // Reset animations
        scaleAnim.setValue(0.3);
        opacityAnim.setValue(0);
        backdropOpacity.setValue(0);
        rotateAnim.setValue(0);

        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(rotateAnim, {
                toValue: 1,
                friction: 10,
                tension: 50,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // 🧩 Khi thả tay ra → ảnh thu nhỏ lại với hiệu ứng mượt
    const handleRelease = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.3,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => setPreviewImg(null));
    };

    const renderGridItem = ({ item }: { item: Dessert }) => (
        <Pressable
            style={s.gridCard}
            onLongPress={() => handleLongPress(item.image)}
            delayLongPress={600}
            onPressOut={handleRelease}
            onPress={() => router.push(`/menu/${item.id}` as any)}
        >
            <View style={s.gridImgWrap}>
                <Image
                    source={{ uri: item.image }}
                    style={s.gridImg}
                    resizeMode="cover"
                />
                {item.discount > 0 && (
                    <View style={s.discountBadge}>
                        <Text style={s.discountText}>-{item.discount}%</Text>
                    </View>
                )}
                <View style={s.favoriteBtnWrapper}>
                    <FavoriteButton
                        isFavorite={isFavorite(item.id)}
                        onPress={() => toggleFavorite(item.id)}
                        size={20}
                    />
                </View>
            </View>

            <View style={{ paddingHorizontal: 6, paddingBottom: 8 }}>
                <Text style={s.gridName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={s.gridPrice}>${item.price.toFixed(2)}</Text>
                <Text style={s.gridRating}>
                    ⭐ {item.rating} ({item.reviews})
                </Text>
            </View>
        </Pressable>
    );

    const HeaderComponent = (
        <View>
            {/* Header */}
            <ScrollView
                contentContainerStyle={s.rowBetween}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            >
                <View>
                    <Text style={s.h1}>Deliver</Text>
                    <Text style={s.sub}>Street Town</Text>
                </View>

                <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                        style={[
                            s.pill,
                            {
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                            },
                        ]}
                        onPress={() => router.push("/ai" as any)}
                    >
                        <Text style={{ fontSize: 16 }}>🤖</Text>
                        <Text style={s.pillTxt}>AI</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={s.pill}
                        onPress={() => router.push("/search" as any)}
                    >
                        <Text style={s.pillTxt}>Search</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={s.pill}
                        onPress={() => router.push("/filter" as any)}
                    >
                        <Text style={s.pillTxt}>Filter</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[s.pill, { backgroundColor: "#ff6a00" }]}
                        onPress={() => router.push("/(tabs)/cart")}
                    >
                        <Text style={[s.pillTxt, { color: "#fff" }]}>Cart</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Banner */}
            <View style={s.banner}>
                <Image
                    source={require("../../assets/backgrounds/order.png")}
                    style={s.bannerImg}
                />
                <Text style={s.bannerText}>
                    UP TO 30% OFF{"\n"}ON FIRST ORDER
                </Text>
            </View>

            {/* Featured Carousel */}
            <Text style={s.section}>Featured Desserts 🍰</Text>
            <FlatList
                horizontal
                data={desserts.slice(0, 10)}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Pressable
                        style={s.hCard}
                        onPress={() => router.push(`/menu/${item.id}` as any)}
                        onLongPress={() => handleLongPress(item.image)}
                        delayLongPress={600}
                        onPressOut={handleRelease}
                    >
                        <View style={s.hImgWrap}>
                            <Image
                                source={{ uri: item.image }}
                                style={s.hImg}
                                resizeMode="cover"
                            />
                            {item.discount > 0 && (
                                <View style={s.discountTag}>
                                    <Text style={s.discountTxt}>
                                        {item.discount}%Off
                                    </Text>
                                </View>
                            )}
                            <View style={s.heartBtnWrapper}>
                                <FavoriteButton
                                    isFavorite={isFavorite(item.id)}
                                    onPress={() => toggleFavorite(item.id)}
                                    size={18}
                                />
                            </View>
                        </View>

                        <View style={{ paddingHorizontal: 8 }}>
                            <Text style={s.hName} numberOfLines={1}>
                                {item.name}
                            </Text>

                            <View style={s.hRow}>
                                <Text style={s.hMeta}>
                                    {item.deliveryTime || "20–30 min • 1.3 km"}
                                </Text>
                                <Text style={s.hPrice}>
                                    ${item.price.toFixed(2)}
                                </Text>
                            </View>

                            <Text style={s.hRating}>
                                ⭐ {item.rating} ({item.reviews} Reviews)
                            </Text>
                        </View>
                    </Pressable>
                )}
                contentContainerStyle={{
                    paddingHorizontal: 4,
                    paddingBottom: 12,
                }}
            />

            <View style={s.rowBetween}>
                <Text style={s.section}>Kitchen near you</Text>
                <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                    <Text style={[s.section, { color: "#ff6a00" }]}>
                        {showAll ? "Show less" : "See all"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#FFF8F3" }}
            edges={["top"]}
        >
            <FlatList
                data={displayedDesserts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={renderGridItem}
                ListHeaderComponent={HeaderComponent}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                contentContainerStyle={{ padding: 18, paddingBottom: 30 }}
            />

            {/* Image Preview Modal */}
            <Modal visible={!!previewImg} transparent animationType="none">
                <Animated.View
                    style={[
                        s.previewContainer,
                        {
                            opacity: backdropOpacity,
                        },
                    ]}
                >
                    <Pressable
                        style={StyleSheet.absoluteFillObject}
                        onPress={handleRelease}
                    />
                    {previewImg && (
                        <Animated.View
                            style={[
                                s.previewWrapper,
                                {
                                    transform: [
                                        { scale: scaleAnim },
                                        {
                                            rotate: rotateAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ["-5deg", "0deg"],
                                            }),
                                        },
                                    ],
                                    opacity: opacityAnim,
                                },
                            ]}
                        >
                            <Image
                                source={{ uri: previewImg }}
                                style={s.previewImg}
                                resizeMode="cover"
                            />
                            <LinearGradient
                                colors={["transparent", "rgba(0,0,0,0.4)"]}
                                style={s.previewGradient}
                            >
                                <View style={s.previewBadge}>
                                    <Ionicons
                                        name="expand-outline"
                                        size={20}
                                        color="#fff"
                                    />
                                    <Text style={s.previewBadgeText}>
                                        Preview
                                    </Text>
                                </View>
                            </LinearGradient>
                        </Animated.View>
                    )}
                </Animated.View>
            </Modal>

            {/* Floating AI Chat Button */}
            <Animated.View
                style={[
                    s.floatingButton,
                    {
                        transform: [
                            { translateX: pan.x },
                            { translateY: pan.y },
                        ],
                    },
                ]}
                {...panResponder.panHandlers}
            >
                <TouchableOpacity
                    style={s.floatingButtonInner}
                    onPress={() => router.push("/ai" as any)}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={["#FF6B35", "#FF8E53"]}
                        style={s.floatingGradient}
                    >
                        <Ionicons name="chatbubbles" size={28} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { backgroundColor: "#FFF8F3", padding: 18 },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    h1: {
        fontSize: 18,
        fontWeight: "800",
        color: "#2c3e50",
        letterSpacing: 0.3,
    },
    sub: {
        color: "#6c757d",
        fontSize: 14,
        fontWeight: "500",
        marginTop: 2,
    },
    pill: {
        borderWidth: 1.5,
        borderColor: "#FFE8DC",
        backgroundColor: "#FFF",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24,
        shadowColor: "#FF6B35",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    pillTxt: {
        color: "#2c3e50",
        fontWeight: "700",
        fontSize: 14,
        letterSpacing: 0.2,
    },
    banner: {
        position: "relative",
        marginVertical: 20,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#FF6B35",
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    bannerImg: {
        width: "100%",
        height: 200,
        borderRadius: 20,
    },
    bannerText: {
        position: "absolute",
        left: 20,
        top: 20,
        color: "#fff",
        fontSize: 32,
        fontWeight: "900",
        width: "75%",
        lineHeight: 38,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        letterSpacing: 0.5,
    },
    section: {
        fontSize: 20,
        fontWeight: "800",
        marginVertical: 14,
        color: "#2c3e50",
        letterSpacing: 0.3,
    },

    // Featured carousel card
    hCard: {
        width: 240,
        backgroundColor: "#fff",
        borderRadius: 18,
        marginRight: 16,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        paddingBottom: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#FFE8DC",
    },
    hImgWrap: { position: "relative" },
    hImg: { width: "100%", height: 140 },
    discountTag: {
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "#FF6B35",
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        shadowColor: "#FF6B35",
        shadowOpacity: 0.4,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    discountTxt: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    heartBtnWrapper: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    hName: {
        fontSize: 16,
        fontWeight: "700",
        marginTop: 8,
        color: "#2c3e50",
        letterSpacing: 0.2,
    },
    hRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 6,
    },
    hMeta: {
        color: "#6c757d",
        fontSize: 13,
        fontWeight: "500",
    },
    hPrice: {
        color: "#FF6B35",
        fontWeight: "800",
        fontSize: 16,
        letterSpacing: 0.2,
    },
    hRating: {
        color: "#FFB300",
        fontWeight: "600",
        marginTop: 4,
        fontSize: 14,
    },

    // Grid (Shopee layout)
    gridCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 16,
        width: "48%",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
        borderWidth: 1,
        borderColor: "#FFE8DC",
    },
    gridImgWrap: { position: "relative" },
    gridImg: { width: "100%", height: 150 },
    discountBadge: {
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "#FF6B35",
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        shadowColor: "#FF6B35",
        shadowOpacity: 0.4,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    discountText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    gridName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2c3e50",
        marginTop: 6,
        minHeight: 36,
        letterSpacing: 0.2,
    },
    gridPrice: {
        color: "#FF6B35",
        fontWeight: "900",
        fontSize: 16,
        marginTop: 4,
        letterSpacing: 0.2,
    },
    gridRating: {
        color: "#6c757d",
        fontSize: 13,
        marginTop: 4,
        fontWeight: "500",
    },
    favoriteBtnWrapper: {
        position: "absolute",
        top: 10,
        right: 10,
    },

    previewContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "center",
        alignItems: "center",
    },

    previewWrapper: {
        width: "85%",
        aspectRatio: 1,
        borderRadius: 24,
        overflow: "hidden",
        shadowColor: "#FF6B35",
        shadowOpacity: 0.6,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 15,
        borderWidth: 4,
        borderColor: "#fff",
        backgroundColor: "#fff",
    },

    previewImg: {
        width: "100%",
        height: "100%",
    },

    previewGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 16,
    },

    previewBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(255, 107, 53, 0.9)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },

    previewBadgeText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.5,
    },

    // Floating AI Button
    floatingButton: {
        position: "absolute",
        width: 64,
        height: 64,
        zIndex: 999,
    },
    floatingButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        overflow: "hidden",
        shadowColor: "#FF6B35",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
    },
    floatingGradient: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
});
