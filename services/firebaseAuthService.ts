/**
 * 🔐 OTP Service Layer
 * ========================
 * Backend handles:
 * - SMS sending via Firebase Admin SDK
 * - OTP storage + validation
 * 
 * Frontend handles:
 * - Sending request to backend
 * - Collecting OTP from user
 * - Verifying OTP via backend
 * - Getting temporary token
 */

let resetIdRef: string | null = null;

/**
 * ✅ Store reset ID from backend response
 * @param resetId - Reset ID from backend /auth/password/request-reset
 */
export const storeResetId = (resetId: string): void => {
  resetIdRef = resetId;
  console.log(`📱 [OTP] Reset ID stored for OTP verification`);
};

/**
 * ✅ Get stored reset ID
 */
export const getResetId = (): string | null => {
  return resetIdRef;
};

/**
 * ✅ Clear OTP state
 */
export const clearOTPState = (): void => {
  resetIdRef = null;
  console.log(`📱 [OTP] OTP state cleared`);
};

/**
 * ✅ Check if reset ID is stored
 */
export const hasResetId = (): boolean => {
  return resetIdRef !== null;
};
