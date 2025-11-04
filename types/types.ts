export interface Review {
  idUser: string;
  content: string;
  rating: number;
  date: string;
}

export interface Dessert {
  id: string;
  name: string;
  rating: number;
  price: number;
  category: string;
  discount: number;
  reviews: number;
  deliveryTime: string;
  image: string;
  description: string;
  freeDelivery: boolean;
  review: Review[];
}

export interface CartItem extends Dessert {
  qty: number;
}
export interface CartItemSimple {
  _id?: string;
  item: string;     // ID của sản phẩm (ví dụ "D071")
  quantity: number; // Số lượng
}

export interface User {
  _id?: string;        // MongoDB ID
  id: string;          // ID nghiệp vụ (ví dụ "U026")

  fullName: string;
  email: string;
  username: string;
  phone: string;
  address: string;

  paymentMethod: string; // ví dụ: "momo", "cash", "zalopay"
  authProvider: "local" | "firebase"; // nguồn đăng nhập

  image: string;        // avatar URL
  favorite: string[];   // danh sách món yêu thích (ID món ăn)
  cart: CartItemSimple[];

  createdAt: string;    // ISO datetime string
  updatedAt: string;    // ISO datetime string
}