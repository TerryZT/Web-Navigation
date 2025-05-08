"use client";

const AUTH_KEY = "linkhub_auth_status";
// The MOCK_STORED_PASSWORD is used by the changePassword function to verify the "current" password.
// However, the login function will always check against "admin" for this mock setup.
const MOCK_STORED_PASSWORD = "admin";

export const login = (password: string): boolean => {
  // In a real app, you'd verify credentials against a backend.
  // For this mock, we'll use a hardcoded password.
  if (password === "admin") {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, "true");
    }
    return true;
  }
  return false;
};

export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_KEY) === "true";
  }
  return false;
};

export const changePassword = (currentPassword: string, newPassword: string, confirmPassword: string): { success: boolean; message: string } => {
  if (typeof window === "undefined") {
    return { success: false, message: "Password change can only be done on the client." };
  }

  if (currentPassword !== MOCK_STORED_PASSWORD) {
    return { success: false, message: "Incorrect current password." };
  }
  if (!newPassword) {
    return { success: false, message: "New password cannot be empty." };
  }
  if (newPassword.length < 6) {
    return { success: false, message: "New password must be at least 6 characters long." };
  }
  if (newPassword === currentPassword) {
    return { success: false, message: "New password cannot be the same as the current password." };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, message: "New password and confirmation password do not match." };
  }

  // In a real app, you would hash and store the newPassword here.
  // For this mock, we just simulate success. The login password remains "admin".
  // The MOCK_STORED_PASSWORD above is also not updated.
  return { success: true, message: "Password changed successfully. Note: For this demo, login will still use 'admin'." };
};
