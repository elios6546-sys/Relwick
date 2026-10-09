const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "X-Requested-With": "relwick" },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("X-Requested-With")) {
    headers.set("X-Requested-With", "relwick");
  }
  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (res.status === 401 && retry && !path.startsWith("/v1/auth/")) {
    const ok = await refreshSession();
    if (ok) return apiFetch<T>(path, init, false);
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new ApiError("Session expirée.", 401);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "message" in data
        ? String((data as { message: unknown }).message)
        : `Erreur ${res.status}`;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

export async function postLead(body: unknown): Promise<{ id: string }> {
  return apiFetch<{ id: string }>("/v1/leads", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getApiUrl(): string {
  return API_URL;
}
