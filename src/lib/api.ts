/** From `client/.env` → `VITE_API_BASE_URL` (see `.env.example`). */
function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) {
    console.warn(
      "[api] VITE_API_BASE_URL is not set; using http://localhost:5050/api — add it to client/.env",
    );
    return "http://localhost:5050/api";
  }
  throw new Error(
    "VITE_API_BASE_URL is required in production. Set it in Vercel → Environment Variables before building the client.",
  );
}

const API_BASE_URL = resolveApiBaseUrl();
const TOKEN_KEY = "admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(body.message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export type UploadResult = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  thumbnailUrl?: string;
};

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return apiFetch<UploadResult>("/upload/image", {
    method: "POST",
    body: formData,
    auth: true,
  });
}

export async function uploadVideo(file: File) {
  const formData = new FormData();
  formData.append("video", file);
  return apiFetch<UploadResult>("/upload/video", {
    method: "POST",
    body: formData,
    auth: true,
  });
}

export async function deleteUploadedAsset(publicId: string, resourceType: "image" | "video") {
  await apiFetch("/upload/delete-asset", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ publicId, resourceType }),
  });
}
