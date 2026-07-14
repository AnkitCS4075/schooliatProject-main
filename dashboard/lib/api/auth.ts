import { saveToken } from "@/lib/auth/storage";
import { BASE_URL } from "./config";

export async function loginAndSaveToken(
  email: string,
  password: string
): Promise<any> {
  // Ensure BASE_URL doesn't end with / and path starts with /
  const cleanBaseUrl = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  const authUrl = cleanBaseUrl ? `${cleanBaseUrl}/auth/authenticate` : "/auth/authenticate";
  let res: Response;
  try {
    res = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-platform": "web",
      },
      body: JSON.stringify({
        request: {
          email,
          password,
        },
      }),
    });
  } catch (err) {
    const isNetworkError =
      err instanceof TypeError &&
      (err.message === "Failed to fetch" || (err as any).cause?.code === "ECONNREFUSED");
    if (isNetworkError) {
      const hint = cleanBaseUrl
        ? `Cannot connect to ${cleanBaseUrl}. Ensure the backend is running there, or set NEXT_PUBLIC_API_URL in .env.local.`
        : "Cannot connect to the API. Ensure the Backend is running (e.g. cd Backend && npm run dev, default port 4000).";
      throw new Error(hint);
    }
    throw err;
  }

  if (!res.ok) {
    // Try to parse error response for better error messages
    let errorData = null;
    try {
      const errorText = await res.text();
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // Response was not JSON
      }
    } catch {
      // Could not read response
    }

    // Don't expose response body which might contain sensitive information
    let errorMessage = "Login failed";
    if (res.status === 401) {
      errorMessage = "Invalid email or password";
    } else if (res.status === 403) {
      errorMessage = "Access denied";
    } else if (res.status === 404) {
      // Backend returns 404 for "User not found" - treat as invalid credentials
      errorMessage = errorData?.message || "Invalid email or password";
    } else if (res.status >= 500) {
      errorMessage = "Server error";
    } else {
      errorMessage = errorData?.message || `Login failed (${res.status})`;
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  if (!data.token) {
    throw new Error("Login response missing token");
  }

  await saveToken(data.token);
  return data;
}

