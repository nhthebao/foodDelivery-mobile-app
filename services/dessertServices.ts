import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://food-delivery-mobile-app.onrender.com";

export interface Dessert {
    id: string;
    name: string;
    price: number;
    description?: string;
    image?: string;
    category?: string;
    rating?: number;
    reviews?: number;
}

/**
 * Get dessert by ID from server
 */
export const getDessertById = async (dessertId: string): Promise<Dessert | null> => {
    try {
        console.log(`🔄 Fetching dessert details for ID: ${dessertId}`);

        const response = await fetch(`${API_URL}/desserts/${dessertId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.warn(`⚠️ Could not fetch dessert ${dessertId}, status: ${response.status}`);
            return null;
        }

        const dessertData = await response.json();
        console.log(`✅ Found dessert: ${dessertData.name}`);
        return dessertData;
    } catch (error) {
        console.error(`❌ Error fetching dessert ${dessertId}:`, error);
        return null;
    }
};

/**
 * Get all desserts from server
 */
export const getAllDesserts = async (): Promise<Dessert[]> => {
    try {
        const response = await fetch(`${API_URL}/desserts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.warn(`⚠️ Could not fetch desserts, status: ${response.status}`);
            return [];
        }

        const desserts = await response.json();
        return desserts;
    } catch (error) {
        console.error("❌ Error fetching desserts:", error);
        return [];
    }
};
