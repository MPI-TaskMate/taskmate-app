const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5048/api"; 

export type RegisterRequest = {
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
};

export function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", },
    body: JSON.stringify({
      email: data.email.trim(),
      password: data.password,
    }),
  });

  if (!response.ok) {
    let message = "Registration failed.";

    try {
      const errorData = await response.json();

      if (errorData?.message) {
        message = errorData.message;
      }
    } catch {

    }

    throw new Error(message);
  }

  const result: AuthResponse = await response.json();
  return result;
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: data.email.trim(),
      password: data.password,
    }),
  });

  if (!response.ok) {
    let message = "Login failed.";

    try {
      const errorData = await response.json();

      if (errorData?.message) {
        message = errorData.message;
      }
    } catch {}

    throw new Error(message);
  }

  const result: AuthResponse = await response.json();
  return result;
}