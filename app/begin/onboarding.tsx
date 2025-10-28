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
    image: "https://via.placeholder.com/400x800?text=Food+1",
  },
  {
    id: "2",
    title: "Order with Ease, Anytime You Crave",
    subtitle:
      "Discover new tastes, customize your meals, and track your order in real-time with ease.",
    image: "https://via.placeholder.com/400x800?text=Food+2",
  },
  {
    id: "3",
    title: "Track & Enjoy Every Bite of the Journey",
    subtitle:
      "From breakfast to dinner, find your favorite dishes and get them delivered fast and fresh.",
    image: "https://via.placeholder.com/400x800?text=Food+3",
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
      router.push("/login-logout/signupScreen");
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
            <View style={styles.overlay}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
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
              <TouchableOpacity
                style={styles.button}
                onPress={handleNext}
              >
                <Text style={styles.buttonText}>
                  {currentIndex === slides.length - 1 ? "Get Started" : "Continue"}
                </Text>
              </TouchableOpacity>
              {currentIndex === slides.length - 1 && (
                <Text style={styles.signIn}>
                  Don’t have an account?{" "}
                  <Text style={styles.signInLink} onPress={() => router.push("/login-logout/signupScreen")}>
                    Sign In
                  </Text>
                </Text>
              )}
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
  overlay: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: "#E36A2E",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 60,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  signIn: {
    color: "#ccc",
    marginTop: 16,
  },
  signInLink: {
    color: "#fff",
    fontWeight: "600",
  },
});
