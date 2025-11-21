export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      FIREBASE_API_KEY:
        process.env.FIREBASE_API_KEY ||
        "AIzaSyAqfyrL3PSw8DtxsyAKbzJ6hi7mnPtrg3s",
      FIREBASE_AUTH_DOMAIN:
        process.env.FIREBASE_AUTH_DOMAIN ||
        "fooddelivery-15d47.firebaseapp.com",
      FIREBASE_PROJECT_ID:
        process.env.FIREBASE_PROJECT_ID || "fooddelivery-15d47",
      FIREBASE_STORAGE_BUCKET:
        process.env.FIREBASE_STORAGE_BUCKET ||
        "fooddelivery-15d47.firebasestorage.app",
      FIREBASE_MESSAGING_SENDER_ID:
        process.env.FIREBASE_MESSAGING_SENDER_ID || "30971580525",
      FIREBASE_APP_ID:
        process.env.FIREBASE_APP_ID ||
        "1:30971580525:android:87331626a2076f7f206f64",
      AI_KEY: process.env.AI_KEY,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    },
  };
};
