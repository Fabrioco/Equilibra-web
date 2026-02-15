import { API_URL } from "@/app/config/env";

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

type FetchApiOptions = RequestInit & { auth?: boolean };

export async function fetchApi<T = unknown>(
  path: string,
  options: FetchApiOptions = {},
): Promise<{ data: T; ok: boolean; status: number }> {
  const { auth = true, ...rest } = options;
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = auth
    ? getAuthHeaders()
    : { "Content-Type": "application/json" };
  const res = await fetch(url, {
    ...rest,
    headers: {
      ...headers,
      ...(rest.headers as Record<string, string>),
    },
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { data, ok: res.ok, status: res.status };
}
