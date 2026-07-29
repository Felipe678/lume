const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000'

export interface ApiResponse<T> {
  status: number
  body: T | null
}

/** Fetch fino para a API do Lume. Lança em erro de REDE; status HTTP volta normal. */
export async function apiFetch<T>(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {},
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
  let body: T | null = null
  if (res.status !== 204) {
    try {
      body = (await res.json()) as T
    } catch {
      body = null
    }
  }
  return { status: res.status, body }
}
