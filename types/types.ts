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

export interface User {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  username: string;
  password: string;
  payment: string;
  image: string;
}

export interface CartItem extends Dessert {
  qty: number;
}