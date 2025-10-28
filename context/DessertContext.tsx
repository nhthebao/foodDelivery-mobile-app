import React, { createContext, useContext, useEffect, useState } from "react";
// SỬA 1: Import thêm CartItemSimple để dùng
import { CartItemSimple, Dessert } from "../types/types";
import { useCurrentUser } from "./UserContext"; // (Đã sửa tên file context)

interface DessertContextType {
  desserts: Dessert[];
  loading: boolean;
  getById: (id: string) => Dessert | undefined;
  addToCart: (dessertId: string, quantity?: number) => Promise<boolean>;
}

const DessertContext = createContext<DessertContextType>({
  desserts: [],
  loading: true,
  getById: () => undefined,
  addToCart: async () => false,
});

const API_URL = "https://food-delivery-mobile-app.onrender.com/desserts";

export const DessertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [desserts, setDesserts] = useState<Dessert[]>([]);
  const [loading, setLoading] = useState(true);

  // SỬA 2: Đảm bảo bạn đang import từ file context đã đổi tên
  const { currentUser, updateCart } = useCurrentUser();

  // (useEffect để fetch desserts giữ nguyên)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setDesserts(data);
      } catch (e) {
        console.error("Error fetching desserts:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  return (
    <DessertContext.Provider value={{ desserts, loading, getById, addToCart }}>
      {children}
    </DessertContext.Provider>
  );
};

export const useDessert = () => useContext(DessertContext);
