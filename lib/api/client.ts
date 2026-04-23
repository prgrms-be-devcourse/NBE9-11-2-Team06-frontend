export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export function jsonHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' }
}
