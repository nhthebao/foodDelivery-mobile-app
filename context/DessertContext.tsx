import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
// SỬA 1: Import thêm CartItemSimple để dùng
import { CartItemSimple, Dessert } from "../types/types";
import { useCurrentUser } from "./UserContext"; // (Đã sửa tên file context)

interface DessertContextType {
  desserts: Dessert[];
  loading: boolean;
  getById: (id: string) => Dessert | undefined;
  addToCart: (dessertId: string, quantity?: number) => Promise<boolean>;
  updateCartQuantity: (
    dessertId: string,
    newQuantity: number
  ) => Promise<boolean>;
  removeFromCart: (dessertId: string) => Promise<boolean>;
  toggleFavorite: (dessertId: string) => Promise<boolean>;
  isFavorite: (dessertId: string) => boolean;
  refreshDesserts: () => Promise<void>; // Pull to refresh
  clearFavorites: () => Promise<boolean>; // Xóa tất cả favorites
}

const DessertContext = createContext<DessertContextType>({
  desserts: [],
  loading: true,
  getById: () => undefined,
  addToCart: async () => false,
  updateCartQuantity: async () => false,
  removeFromCart: async () => false,
  toggleFavorite: async () => false,
  isFavorite: () => false,
  refreshDesserts: async () => {},
  clearFavorites: async () => false,
});

const API_URL = "https://food-delivery-mobile-app.onrender.com/desserts";

export const DessertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [desserts, setDesserts] = useState<Dessert[]>([]);
  const [loading, setLoading] = useState(true);

  // SỬA 2: Đảm bảo bạn đang import từ file context đã đổi tên
  const { currentUser, updateCart, editUser } = useCurrentUser();

  // (useEffect để fetch desserts giữ nguyên)
  const fetchDesserts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDesserts(data);
      console.log(`Fetched ${data.length} desserts`);
    } catch (e) {
      console.error("Error fetching desserts:", e);
      // Không throw để tránh crash UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesserts();
  }, []);

  // === REFRESH (Pull to Refresh) ===
  const refreshDesserts = async () => {
    await fetchDesserts();
  };

  // (getById giữ nguyên)
  const getById = (id: string) =>
    desserts.find((d) => {
      return d.id === id;
    });

  // SỬA 3: Cập nhật toàn bộ logic 'addToCart' với tham số quantity
  const addToCart = async (
    dessertId: string,
    quantity: number = 1
  ): Promise<boolean> => {
    if (!currentUser) {
      console.log("❌ Không thể thêm vào giỏ hàng: Chưa đăng nhập");
      return false;
    }

    console.log(`🛒 Thêm ${quantity}x món ${dessertId} vào giỏ hàng...`);

    // Lấy giỏ hàng hiện tại (và tạo bản sao)
    const currentCart = [...currentUser.cart];

    // Tìm xem item đã tồn tại trong giỏ hàng chưa
    const existingItemIndex = currentCart.findIndex(
      (cartItem) => cartItem.item === dessertId
    );

    let newCart: CartItemSimple[];

    if (existingItemIndex !== -1) {
      // TRƯỜNG HỢP 1: Đã có -> Tăng số lượng theo quantity
      newCart = currentCart.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + quantity;
          console.log(
            `  ↗️ Tăng số lượng từ ${item.quantity} lên ${newQuantity}`
          );
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    } else {
      // TRƯỜNG HỢP 2: Chưa có -> Thêm đối tượng mới vào mảng
      const newItem: CartItemSimple = {
        item: dessertId,
        quantity: quantity,
      };
      console.log(`  ➕ Thêm món mới với số lượng ${quantity}`);
      newCart = [...currentCart, newItem];
    }

    // Gọi 'updateCart' (từ CurrentUserContext) với mảng mới
    // updateCart sẽ tự động đồng bộ lên SQLite và API
    await updateCart(newCart);
    console.log("✅ Đã thêm vào giỏ hàng và đồng bộ lên API");
    return true;
  };

  // Toggle favorite
  const toggleFavorite = async (dessertId: string): Promise<boolean> => {
    if (!currentUser) {
      console.log("❌ Chưa đăng nhập");
      return false;
    }

    const currentFavorites = currentUser.favorite || [];
    const isFav = currentFavorites.includes(dessertId);

    const newFavorites = isFav
      ? currentFavorites.filter((id) => id !== dessertId)
      : [...currentFavorites, dessertId];

    try {
      await editUser({ favorite: newFavorites });
      console.log(`❤️ Favorite updated: ${dessertId}`);
      return true;
    } catch (err) {
      console.error("❌ Lỗi cập nhật favorite:", err);
      return false;
    }
  };

  // Update cart quantity
  const updateCartQuantity = useCallback(
    async (dessertId: string, newQuantity: number): Promise<boolean> => {
      if (!currentUser) {
        console.log("❌ Chưa đăng nhập");
        return false;
      }

      if (newQuantity < 1) {
        return removeFromCart(dessertId);
      }

      try {
        const currentCart = currentUser.cart || [];
        const existingItemIndex = currentCart.findIndex(
          (item) => item.item === dessertId
        );

        if (existingItemIndex >= 0) {
          // Kiểm tra nếu quantity không thay đổi, skip update
          if (currentCart[existingItemIndex].quantity === newQuantity) {
            return true;
          }

          const updatedCart = [...currentCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: newQuantity,
          };
          await updateCart(updatedCart);
          console.log(
            `✅ Cart quantity updated: ${dessertId} -> ${newQuantity}`
          );
          return true;
        } else {
          console.log("❌ Item không tồn tại trong giỏ hàng");
          return false;
        }
      } catch (err) {
        console.error("❌ Lỗi cập nhật quantity:", err);
        return false;
      }
    },
    [currentUser, updateCart, removeFromCart]
  );

  // Remove from cart
  const removeFromCart = useCallback(
    async (dessertId: string): Promise<boolean> => {
      if (!currentUser) {
        console.log("❌ Chưa đăng nhập");
        return false;
      }

      try {
        const currentCart = currentUser.cart || [];
        const updatedCart = currentCart.filter(
          (item) => item.item !== dessertId
        );
        await updateCart(updatedCart);
        console.log(`✅ Item removed from cart: ${dessertId}`);
        return true;
      } catch (err) {
        console.error("❌ Lỗi xóa khỏi giỏ hàng:", err);
        return false;
      }
    },
    [currentUser, updateCart]
  );

  // Check if dessert is favorite
  const isFavorite = (dessertId: string): boolean => {
    return currentUser?.favorite?.includes(dessertId) ?? false;
  };

  return (
    <DessertContext.Provider
      value={{
        desserts,
        loading,
        getById,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        toggleFavorite,
        isFavorite,
        refreshDesserts,
        clearFavorites: async () => {
          if (!currentUser) return false;
          try {
            await editUser({ favorite: [] });
            console.log("✅ Đã xóa tất cả favorites");
            return true;
          } catch (err) {
            console.error("❌ Lỗi xóa favorites:", err);
            return false;
          }
        },
      }}
    >
      {children}
    </DessertContext.Provider>
  );
};

export const useDessert = () => useContext(DessertContext);
