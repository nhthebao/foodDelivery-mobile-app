// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Cấu hình lấy từ file google-services.json (bạn đã có)
const firebaseConfig = {
  apiKey: "AIzaSyAqfyrL3PSw8DtxsyAKbzJ6hi7mnPtrg3s",
  authDomain: "fooddelivery-15d47.firebaseapp.com",
  projectId: "fooddelivery-15d47",
  storageBucket: "fooddelivery-15d47.firebasestorage.app",
  messagingSenderId: "30971580525",
  appId: "1:30971580525:android:5c6b277bafb3c8ff206f64",
};

// Khởi tạo Firebase
export const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
// Dịch vụ Authencation
export const auth = getAuth(app);
