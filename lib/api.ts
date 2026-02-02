import { API_URL } from "@/config/env";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchApi<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; ok: boolean; status: number }> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string>),
    },
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { data, ok: res.ok, status: res.status };
}
