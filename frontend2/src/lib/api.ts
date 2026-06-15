export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || "An API error occurred");
  }

  return data as ApiResponse<T>;
}
