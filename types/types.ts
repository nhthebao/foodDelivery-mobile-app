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
  _id?: string;     // ID từ MongoDB (ví dụ "69006f219e5ba39bec38525c")
  id: string;       // ID nghiệp vụ (ví dụ "U026")
  fullName: string;
  address: string;
  phone: string;
  username: string;
  password: string; // API không nên trả về password, nhưng ta lưu cục bộ
  payment: string;
  image: string;
  favorite: string[]; // Mảng chuỗi đơn giản
  cart: CartItemSimple[];   // Mảng các đối tượng CartItem
}