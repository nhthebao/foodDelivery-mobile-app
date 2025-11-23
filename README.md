<div align="center">

# 🍔 GoBite - Food Delivery Mobile App

## Frontend Repository

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.23-000020?style=flat&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Ứng dụng đặt đồ ăn trực tuyến được xây dựng với React Native & Expo**

[Demo](#) • [Backend Repo](https://github.com/nhthebao/Test_Server_Render) • [Báo cáo lỗi](https://github.com/nhthebao/foodDelivery-mobile-app/issues)

---

</div>

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ & Thư viện](#-công-nghệ--thư-viện)
- [Kiến trúc dự án](#-kiến-trúc-dự-án)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Build Production](#-build-production)
- [Screenshots](#-screenshots)
- [Đóng góp](#-đóng-góp)
- [License](#-license)

---

## 📱 Giới thiệu

**GoBite** là ứng dụng di động đặt đồ ăn trực tuyến được phát triển bằng **React Native** với **Expo SDK 54**, mang đến trải nghiệm mua sắm mượt mà và hiện đại cho người dùng iOS và Android.

### Điểm nổi bật

- ✨ UI/UX hiện đại, mượt mà với animations
- 🔐 Xác thực an toàn với Firebase Authentication
- 💳 Tích hợp thanh toán trực tuyến (MoMo, Sepay)
- 📦 Quản lý đơn hàng real-time
- 🤖 AI Chatbot hỗ trợ khách hàng
- 📱 Hỗ trợ cả iOS và Android
- 🌐 Offline-first với SQLite

---

## ✨ Tính năng

### 🔐 Xác thực & Người dùng

- Đăng ký/Đăng nhập với Firebase (Email/Password, Google)
- Quên mật khẩu với OTP qua email
- Quản lý thông tin cá nhân (tên, email, SĐT, địa chỉ)
- Upload và cập nhật ảnh đại diện
- Đăng xuất an toàn

### 🛒 Mua sắm

- Duyệt danh sách món ăn với hình ảnh chất lượng cao
- Tìm kiếm và lọc món ăn theo danh mục
- Xem chi tiết món ăn (mô tả, giá, rating, reviews)
- Thêm/Xóa/Cập nhật số lượng trong giỏ hàng
- Danh sách yêu thích (Favorites)
- Chọn nhiều món để thanh toán

### 💳 Thanh toán

- Thanh toán COD (tiền mặt)
- Thanh toán trực tuyến qua MoMo QR
- Tích hợp webhook tự động cập nhật trạng thái
- Lưu phương thức thanh toán
- Lịch sử giao dịch chi tiết

### 📦 Quản lý đơn hàng

- Tạo đơn hàng với thông tin đầy đủ
- Theo dõi trạng thái đơn hàng (Pending, Confirmed, Preparing, Delivering, Delivered)
- Xem lịch sử đơn hàng
- Chi tiết đơn hàng với thông tin món ăn, địa chỉ, thanh toán
- Đồng bộ đơn hàng từ server

### 🤖 AI Assistant

- Chatbot tích hợp AI hỗ trợ 24/7
- Gợi ý món ăn thông minh
- Trả lời câu hỏi về menu, giá cả, thời gian giao hàng

### 🎨 Giao diện

- Onboarding screens cho lần đầu mở app
- Splash screen chuyên nghiệp
- Bottom tab navigation
- Animations mượt mà với Reanimated
- Custom alerts thay thế Alert native
- Dark/Light mode ready

---

## 🛠 Công nghệ & Thư viện

### Core Framework

| Công nghệ        | Version | Mục đích                                   |
| ---------------- | ------- | ------------------------------------------ |
| **React Native** | 0.81.5  | Framework phát triển mobile đa nền tảng    |
| **Expo**         | 54.0.23 | SDK & toolchain để phát triển React Native |
| **React**        | 19.1.0  | UI library                                 |
| **TypeScript**   | 5.9.2   | Type safety & IntelliSense                 |

### Navigation & Routing

| Thư viện                           | Version | Mục đích                                   |
| ---------------------------------- | ------- | ------------------------------------------ |
| **expo-router**                    | 6.0.14  | File-based routing (giống Next.js)         |
| **@react-navigation/native**       | 7.1.8   | Navigation core                            |
| **@react-navigation/bottom-tabs**  | 7.4.0   | Bottom tab navigation                      |
| **react-native-screens**           | 4.16.0  | Native screen optimization                 |
| **react-native-safe-area-context** | 5.6.0   | Safe area handling (notch, home indicator) |

### State Management & Storage

| Thư viện                                      | Version  | Mục đích                             |
| --------------------------------------------- | -------- | ------------------------------------ |
| **React Context API**                         | Built-in | Global state management              |
| **@react-native-async-storage/async-storage** | 2.2.0    | Key-value storage (settings, tokens) |
| **expo-sqlite**                               | 16.0.9   | Local SQLite database (orders, cart) |

### Authentication & Backend

| Thư viện     | Version | Mục đích                                         |
| ------------ | ------- | ------------------------------------------------ |
| **firebase** | 12.5.0  | Firebase Authentication (Google, Email/Password) |
| **axios**    | 1.12.2  | HTTP client để gọi REST API                      |

### UI Components & Styling

| Thư viện                 | Version     | Mục đích                                  |
| ------------------------ | ----------- | ----------------------------------------- |
| **@expo/vector-icons**   | 15.0.3      | Icon library (Ionicons, MaterialIcons...) |
| **expo-linear-gradient** | 15.0.7      | Gradient backgrounds                      |
| **react-native-modal**   | 14.0.0-rc.1 | Custom modal components                   |
| **expo-symbols**         | 1.0.7       | SF Symbols cho iOS                        |
| **expo-haptics**         | 15.0.7      | Haptic feedback                           |

### Animations & Gestures

| Thư viện                         | Version | Mục đích                    |
| -------------------------------- | ------- | --------------------------- |
| **react-native-reanimated**      | 4.1.1   | High-performance animations |
| **react-native-gesture-handler** | 2.28.0  | Native gesture handling     |
| **@gorhom/bottom-sheet**         | 5.2.6   | Bottom sheet component      |

### Media & Files

| Thư viện                   | Version | Mục đích                    |
| -------------------------- | ------- | --------------------------- |
| **expo-image**             | 3.0.10  | Optimized image component   |
| **expo-media-library**     | 18.2.0  | Access device photos        |
| **expo-file-system**       | 19.0.17 | File system operations      |
| **react-native-view-shot** | 4.0.3   | Capture screenshots         |
| **expo-sharing**           | 14.0.7  | Share content to other apps |

### Performance & Optimization

| Thư viện                                  | Version | Mục đích                              |
| ----------------------------------------- | ------- | ------------------------------------- |
| **@shopify/flash-list**                   | 2.0.2   | High-performance list (thay FlatList) |
| **babel-plugin-transform-remove-console** | 6.9.4   | Remove console.log trong production   |

### Development Tools

| Thư viện               | Version | Mục đích           |
| ---------------------- | ------- | ------------------ |
| **expo-dev-client**    | 6.0.17  | Custom dev client  |
| **eslint**             | 9.25.0  | Code linting       |
| **eslint-config-expo** | 10.0.0  | Expo ESLint config |

### Other Expo Modules

| Thư viện               | Version | Mục đích                               |
| ---------------------- | ------- | -------------------------------------- |
| **expo-font**          | 14.0.9  | Custom fonts                           |
| **expo-splash-screen** | 31.0.10 | Splash screen                          |
| **expo-status-bar**    | 3.0.8   | Status bar styling                     |
| **expo-system-ui**     | 6.0.8   | System UI (status bar, navigation bar) |
| **expo-constants**     | 18.0.10 | App constants & manifest               |
| **expo-linking**       | 8.0.8   | Deep linking                           |
| **expo-web-browser**   | 15.0.9  | In-app browser                         |
| **expo-auth-session**  | 7.0.8   | OAuth authentication flow              |

---

## 📁 Kiến trúc dự án

```
foodDelivery-mobile-app/
│
├── app/                          # Screens & Routes (Expo Router)
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx           # Tab layout
│   │   ├── index.tsx             # Home screen
│   │   ├── cart.tsx              # Shopping cart
│   │   ├── favorites.tsx         # Favorites list
│   │   └── profileScreen.tsx    # User profile
│   │
│   ├── begin/                    # Onboarding flow
│   │   ├── splashScreen.tsx      # Splash screen
│   │   └── onboarding.tsx        # Onboarding slides
│   │
│   ├── login-signUp/             # Authentication
│   │   ├── loginScreen.tsx       # Login screen
│   │   └── signupScreen.tsx      # Signup screen
│   │
│   ├── forgot-password/          # Password recovery
│   │   ├── forgotPassword.tsx    # Request OTP
│   │   ├── verify.tsx            # Verify OTP
│   │   ├── new-password.tsx      # Set new password
│   │   └── success.tsx           # Success screen
│   │
│   ├── menu/                     # Product details
│   │   └── [id].tsx              # Dynamic route for menu item
│   │
│   ├── payment/                  # Payment flow
│   │   ├── checkOut.tsx          # Checkout screen
│   │   ├── paymentMethodScreen.tsx # Select payment method
│   │   └── momo.js               # MoMo payment integration
│   │
│   ├── order-process/            # Order tracking
│   │   ├── orderTrackingScreen.tsx
│   │   ├── orderArrivedScreen.tsx
│   │   └── ratingDriverScreen.tsx
│   │
│   ├── profile/                  # User profile management
│   │   ├── personalData.tsx      # Edit profile
│   │   ├── orderHistory.tsx      # Order history
│   │   └── orderDetail.tsx       # Order details
│   │
│   ├── search/                   # Search functionality
│   │   └── index.js
│   │
│   ├── filter/                   # Filter products
│   │   └── index.js
│   │
│   ├── ai/                       # AI Chatbot
│   │   └── index.tsx
│   │
│   ├── modals/                   # Modal screens
│   │   ├── CustomAlert.tsx
│   │   └── logOutModal.tsx
│   │
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point
│
├── components/                   # Reusable components
│   ├── ui/                       # UI components
│   ├── CartItemRow.tsx           # Cart item component
│   ├── CheckOutItem.tsx          # Checkout item
│   ├── CreditCardView.tsx        # Credit card display
│   ├── CustomAlert.tsx           # Custom alert modal
│   ├── FavoriteButton.tsx        # Favorite toggle button
│   ├── Header.tsx                # Screen header
│   ├── InputField.tsx            # Text input field
│   ├── MomoModal.tsx             # MoMo QR modal
│   ├── OTPAlert.tsx              # OTP input modal
│   ├── PaymentOption.tsx         # Payment method option
│   └── SettingItem.tsx           # Setting menu item
│
├── context/                      # React Context (State Management)
│   ├── UserContext.tsx           # User state (auth, profile)
│   ├── DessertContext.tsx        # Dessert data & cart
│   └── UserListContext.tsx       # All users list (for reviews)
│
├── services/                     # API & Business Logic
│   ├── apiUserServices.ts        # User API calls
│   ├── firebaseAuthService.ts    # Firebase authentication
│   ├── userDatabaseServices.ts   # User database operations
│   ├── orderServices.ts          # Order operations (SQLite + Server)
│   ├── paymentServices.ts        # Payment API
│   └── dessertServices.ts        # Dessert API
│
├── firebase/                     # Firebase config
│   └── firebaseConfig.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useHeaderPadding.ts       # Dynamic header padding
│   ├── use-color-scheme.ts       # Color scheme hook
│   └── use-theme-color.ts        # Theme color hook
│
├── constants/                    # Constants & Theme
│   └── theme.ts                  # Color palette, spacing, typography
│
├── types/                        # TypeScript types
│   └── types.ts                  # Type definitions
│
├── assets/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── backgrounds/
│
├── scripts/                      # Utility scripts
│   ├── reset-project.js
│   ├── resetDatabase.ts          # Reset SQLite database
│   └── resetOrderDatabase.ts     # Reset order database
│
├── app.json                      # Expo config
├── eas.json                      # EAS Build config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── babel.config.js               # Babel config
└── README.md                     # Documentation

```

### Mô hình kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                      │
├─────────────────────────────────────────────────────────┤
│  UI Layer (Screens & Components)                        │
│    └── Expo Router (File-based routing)                 │
├─────────────────────────────────────────────────────────┤
│  State Management Layer                                  │
│    ├── UserContext (Auth, Profile)                      │
│    ├── DessertContext (Products, Cart)                  │
│    └── UserListContext (User list for reviews)          │
├─────────────────────────────────────────────────────────┤
│  Service Layer                                           │
│    ├── Firebase Auth Service (Authentication)           │
│    ├── API Services (HTTP calls to backend)             │
│    └── Database Services (SQLite operations)            │
├─────────────────────────────────────────────────────────┤
│  Storage Layer                                           │
│    ├── AsyncStorage (Settings, tokens)                  │
│    └── SQLite (Orders, cart offline)                    │
└─────────────────────────────────────────────────────────┘
                          ↓ ↑
                    REST API (HTTPS)
                          ↓ ↑
┌─────────────────────────────────────────────────────────┐
│              Backend Server (Node.js/Express)            │
│                MongoDB Atlas Database                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Cài đặt

### Yêu cầu hệ thống

- **Node.js**: v20.x hoặc mới hơn
- **npm** hoặc **yarn**: Package manager
- **Expo CLI**: Cài đặt global `npm install -g expo-cli`
- **Android Studio** (cho Android) hoặc **Xcode** (cho iOS)
- **Git**: Version control

### Clone repository

```bash
git clone https://github.com/nhthebao/foodDelivery-mobile-app.git
cd foodDelivery-mobile-app
```

### Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

---

## ⚙️ Cấu hình

### 1. Tạo file `.env`

Tạo file `.env` ở thư mục root:

```env
# Backend API
EXPO_PUBLIC_API_URL=https://food-delivery-mobile-app.onrender.com

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Cấu hình Firebase

1. Tạo project tại [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** với Email/Password và Google
3. Thêm Android/iOS app vào Firebase project
4. Download `google-services.json` (Android) và `GoogleService-Info.plist` (iOS)
5. Copy các file vào thư mục tương ứng

### 3. Cấu hình EAS Build (Optional)

Nếu muốn build với EAS:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

---

## 🏃 Chạy ứng dụng

### Development mode

```bash
# Start Expo dev server
npx expo start

# Start with clear cache
npx expo start --clear

# Start with tunnel (for testing on physical device)
npx expo start --tunnel
```

### Chạy trên Android

```bash
npx expo run:android
```

### Chạy trên iOS (chỉ macOS)

```bash
npx expo run:ios
```

### Chạy trên web

```bash
npx expo start --web
```

---

## 📦 Build Production

### Build với EAS (Recommended)

```bash
# Build for development
eas build --profile development --platform android

# Build for preview (internal testing)
eas build --profile preview --platform android

# Build for production
eas build --profile production --platform android
```

### Local build

```bash
# Android APK
npx expo build:android -t apk

# Android AAB (for Google Play)
npx expo build:android -t app-bundle

# iOS IPA (chỉ macOS)
npx expo build:ios
```

---

## 📸 Screenshots

_Coming soon..._

---

## 🤝 Đóng góp

Chúng tôi luôn chào đón mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 👥 Team

**Nhóm 6 - Mobile Development**

| Họ tên               | MSSV     | Email                  |
| -------------------- | -------- | ---------------------- |
| Nguyễn Huỳnh Thế Bảo | 22690761 | 22690761@gm.uit.edu.vn |
| Nguyễn Tấn Nghị      | 22685461 | 22685461@gm.uit.edu.vn |
| Nguyễn Hoài Nhân     | 22689531 | 22689531@gm.uit.edu.vn |

---

## 📞 Liên hệ

- **Email**: gobitefood@gmail.com
- **Frontend**: [nhthebao/foodDelivery-mobile-app](https://github.com/nhthebao/foodDelivery-mobile-app)
- **Backend**: [nhthebao/Test_Server_Render](https://github.com/nhthebao/Test_Server_Render)

---

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 🙏 Lời cảm ơn

- [Expo](https://expo.dev/) - Amazing development platform
- [Firebase](https://firebase.google.com/) - Authentication & Hosting
- [React Native](https://reactnative.dev/) - Cross-platform framework
- [MongoDB Atlas](https://www.mongodb.com/atlas) - Cloud database
- Tất cả các open-source contributors đã tạo ra các thư viện tuyệt vời

---

<div align="center">

**Được phát triển với ❤️ bởi Nhóm 6**

⭐ Star repo này nếu bạn thấy hữu ích!

</div>
