import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Discover Deliciousness Anytime, Anywhere",
    subtitle:
      "Explore endless food options, order in seconds, and enjoy quick delivery straight to your door.",
    image:
      "https://res.cloudinary.com/dwxj422dk/image/upload/v1761639604/bg1_xy9ljl.png",
  },
  {
    id: "2",
    title: "Order with Ease, Anytime You Crave",
    subtitle:
      "Discover new tastes, customize your meals, and track your order in real-time with ease.",
    image:
      "https://res.cloudinary.com/dwxj422dk/image/upload/v1761639603/bg2_nikppp.png",
  },
  {
    id: "3",
    title: "Track & Enjoy Every Bite of the Journey",
    subtitle:
      "From breakfast to dinner, find your favorite dishes and get them delivered fast and fresh.",
    image:
      "https://res.cloudinary.com/dwxj422dk/image/upload/v1761639603/bg3_dwdxnc.png",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      ref.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace("/login-signUp/signupScreen");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        ref={ref}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <Image source={{ uri: item.image }} style={styles.image} />

            {/* Gradient overlay giúp chữ dễ đọc */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.gradient}
            />

            {/* Overlay chính */}
            <View style={styles.overlay}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>

              {/* Dots */}
              <View style={styles.dots}>
                {slides.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      { opacity: currentIndex === i ? 1 : 0.3 },
                    ]}
                  />
                ))}
              </View>

              {/* Button */}
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>
                  {currentIndex === slides.length - 1
                    ? "Get Started"
                    : "Continue"}
                </Text>
              </TouchableOpacity>

              {/* Sign in */}
              <View style={{ height: 30, marginTop: 10 }}>
                {currentIndex === slides.length - 1 ? (
                  <Text style={styles.signIn}>
                    Don’t have an account?{" "}
                    <Text
                      style={styles.signInLink}
                      onPress={() =>
                        router.replace("/login-signUp/signupScreen")
                      }
                    >
                      Sign In
                    </Text>
                  </Text>
                ) : (
                  // Giữ chỗ để layout không xê dịch
                  <Text style={{ opacity: 0 }}>placeholder</Text>
                )}
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 28,
    minHeight: height * 0.35, // cố định vùng chứa nội dung
    justifyContent: "flex-end", // giữ nút ở cùng vị trí giữa các slide
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 32,
  },
  subtitle: {
    color: "#ddd",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
  button: {
    width: 240,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#E36A2E",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 70,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  signIn: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
  },
  signInLink: {
    color: "#fff",
    fontWeight: "700",
  },
});
