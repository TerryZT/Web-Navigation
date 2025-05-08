"use client";

const AUTH_KEY = "linkhub_auth_status";

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