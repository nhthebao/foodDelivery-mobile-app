import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDessert } from "../../context/DessertContext";
import { Dessert } from "../../types/types";

export default function HomeScreen(): JSX.Element {
    const { desserts, loading } = useDessert();
    const [showAll, setShowAll] = useState(false);
    const [previewImg, setPreviewImg] = useState<string | null>(null);

    // Animation
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const router = useRouter();

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

    // 🧩 Khi giữ ảnh 0.75 giây → hiển thị preview nhỏ
    const handleLongPress = (img: string) => {
        setPreviewImg(img);

        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // 🧩 Khi thả tay ra → ảnh thu nhỏ lại rồi biến mất
    const handleRelease = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => setPreviewImg(null));
    };

    const renderGridItem = ({ item }: { item: Dessert }) => (
        <Pressable
            style={s.gridCard}
            onLongPress={() => handleLongPress(item.image)}
            delayLongPress={750}
            onPressOut={handleRelease}
            onPress={() => router.push(`/menu/${item.id}` as any)}
        >
            <View style={s.gridImgWrap}>
                <Image source={{ uri: item.image }} style={s.gridImg} />
                {item.discount > 0 && (
                    <View style={s.discountBadge}>
                        <Text style={s.discountText}>-{item.discount}%</Text>
                    </View>
                )}
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
            <View style={s.rowBetween}>
                <View>
                    <Text style={s.h1}>Deliver To</Text>
                    <Text style={s.sub}>@ 44 Street Town</Text>
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
                        onPress={() => router.push("/checkout" as any)}
                    >
                        <Text style={[s.pillTxt, { color: "#fff" }]}>Cart</Text>
                    </TouchableOpacity>
                </View>
            </View>

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
                    <TouchableOpacity
                        style={s.hCard}
                        onPress={() => router.push(`/menu/${item.id}` as any)}
                    >
                        <View style={s.hImgWrap}>
                            <Image
                                source={{ uri: item.image }}
                                style={s.hImg}
                            />
                            {item.discount > 0 && (
                                <View style={s.discountTag}>
                                    <Text style={s.discountTxt}>
                                        {item.discount}%Off
                                    </Text>
                                </View>
                            )}
                            <TouchableOpacity style={s.heartBtn}>
                                <Text style={{ fontSize: 16 }}>♡</Text>
                            </TouchableOpacity>
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
                    </TouchableOpacity>
                )}
                contentContainerStyle={{
                    paddingHorizontal: 4,
                    paddingBottom: 12,
                }}
            />

            {/* Kitchen section title */}
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
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <FlatList
                data={displayedDesserts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={renderGridItem}
                ListHeaderComponent={HeaderComponent}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
            />

            <Modal visible={!!previewImg} transparent animationType="none">
                <View style={s.previewContainer}>
                    {previewImg && (
                        <View style={s.previewWrapper}>
                            <Animated.Image
                                source={{ uri: previewImg }}
                                style={[
                                    s.previewImg,
                                    {
                                        transform: [{ scale: scaleAnim }],
                                        opacity: opacityAnim,
                                    },
                                ]}
                                resizeMode="cover"
                            />
                        </View>
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { backgroundColor: "#fff", padding: 16 },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    h1: { fontSize: 16, fontWeight: "700" },
    sub: { color: "#777" },
    pill: {
        borderWidth: 1,
        borderColor: "#eee",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    pillTxt: { color: "#333", fontWeight: "600" },
    banner: { position: "relative", marginVertical: 16 },
    bannerImg: { width: "100%", height: 180, borderRadius: 12 },
    bannerText: {
        position: "absolute",
        left: 16,
        top: 16,
        color: "#fff",
        fontSize: 30,
        fontWeight: "800",
        width: "75%",
        lineHeight: 36,
    },
    section: { fontSize: 18, fontWeight: "700", marginVertical: 10 },

    // Featured carousel card
    hCard: {
        width: 220,
        backgroundColor: "#fff",
        borderRadius: 14,
        marginRight: 14,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        paddingBottom: 10,
        overflow: "hidden",
    },
    hImgWrap: { position: "relative" },
    hImg: { width: "100%", height: 120 },
    discountTag: {
        position: "absolute",
        top: 8,
        left: 8,
        backgroundColor: "#ff6a00",
        borderRadius: 6,
        paddingVertical: 2,
        paddingHorizontal: 6,
    },
    discountTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
    heartBtn: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#fff",
        borderRadius: 16,
        width: 26,
        height: 26,
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
    },
    hName: { fontSize: 15, fontWeight: "700", marginTop: 6, color: "#222" },
    hRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    hMeta: { color: "#777", fontSize: 12 },
    hPrice: { color: "#000", fontWeight: "700", fontSize: 14 },
    hRating: {
        color: "#ffb300",
        fontWeight: "500",
        marginTop: 4,
        fontSize: 13,
    },

    // Grid (Shopee layout)
    gridCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 14,
        width: "48%",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    gridImgWrap: { position: "relative" },
    gridImg: { width: "100%", height: 140 },
    discountBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        backgroundColor: "#ff6a00",
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 6,
    },
    discountText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    gridName: {
        fontSize: 13,
        fontWeight: "600",
        color: "#222",
        marginTop: 4,
        minHeight: 34,
    },
    gridPrice: {
        color: "#ff6a00",
        fontWeight: "800",
        fontSize: 14,
        marginTop: 2,
    },
    gridRating: { color: "#777", fontSize: 12, marginTop: 2 },

    previewContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",
        justifyContent: "center",
        alignItems: "center",
    },

    previewWrapper: {
        width: "90%",
        height: "50%",
        borderRadius: 30,
        overflow: "hidden", // ✅ cần dòng này để bo góc thật sự
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },

    previewImg: {
        width: "100%",
        height: "100%",
    },
});
