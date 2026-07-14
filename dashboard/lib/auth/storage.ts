import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "accessToken";

export interface User {
  id: string;
  email: string;
  userType: "APP" | "SCHOOL";
  role?: {
    id: string;
    name: string;
    permissions?: string[];
  };
  schoolId?: string;
  school?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface DecodedToken {
  data?: {
    user?: User;
  };
  iss?: string;
  iat?: number;
  exp?: number;
}

export async function saveToken(token: string): Promise<void> {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export async function clearToken(): Promise<void> {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(TOKEN_KEY);
  }
}

export async function getUserRoles(): Promise<string | null> {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.data?.user?.role?.name || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.data?.user || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

