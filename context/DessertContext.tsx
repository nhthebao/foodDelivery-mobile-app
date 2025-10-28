import React, { createContext, useContext, useEffect, useState } from "react";
import { Dessert } from "../types/types"; // ✅ import interface
import { useUser } from "./UserContext";

interface DessertContextType {
  desserts: Dessert[];
  loading: boolean;
  getById: (id: string) => Dessert | undefined;
  addToCart: (dessertId: string) => Promise<void>;
}

const DessertContext = createContext<DessertContextType>({
  desserts: [],
  loading: true,
  getById: () => undefined,
  addToCart: async () => {},
});

const API_URL = "https://food-delivery-mobile-app.onrender.com/desserts";

export const DessertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [desserts, setDesserts] = useState<Dessert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, updateCart } = useUser();

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

  const getById = (id: string) => desserts.find((d) => d.id === id);

  const addToCart = async (dessertId: string) => {
    if (!user) {
      alert("Please log in first!");
      return;
    }
    const newCart = user.cart.includes(dessertId)
      ? user.cart
      : [...user.cart, dessertId];
    await updateCart(newCart);
    alert("🛒 Added to your cart!");
  };

  return (
    <DessertContext.Provider value={{ desserts, loading, getById, addToCart }}>
      {children}
    </DessertContext.Provider>
  );
};

export const useDessert = () => useContext(DessertContext);
