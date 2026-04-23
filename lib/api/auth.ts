import type { LoginRequest, RegisterRequest, AuthSession, AuthUser } from '@/types/auth'
import type { ApiResponse } from '@/types/meeting'
import { BASE_URL, jsonHeaders } from './client'

const SESSION_KEY = 'auth_user'

export async function login(data: LoginRequest): Promise<{ success: boolean; user: AuthUser | null; message?: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { success: false, user: null, message: err.detail || '이메일 또는 비밀번호가 올바르지 않습니다.' }
  }

  const json: ApiResponse<AuthUser> = await res.json()
  const user = json.data

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    window.dispatchEvent(new Event('session-changed'))
  }

  return { success: true, user }
}

export async function register(data: RegisterRequest): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${BASE_URL}/api/members`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { success: false, message: err.detail || '회원가입에 실패했습니다.' }
  }

  return { success: true }
}

export async function logout(): Promise<void> {
  await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {})

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY)
    window.dispatchEvent(new Event('session-changed'))
  }
}

export function getSession(): AuthSession {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null }
  }

  const stored = sessionStorage.getItem(SESSION_KEY)
  if (stored) {
    try {
      const user: AuthUser = JSON.parse(stored)
      return { isAuthenticated: true, user }
    } catch {
      return { isAuthenticated: false, user: null }
    }
  }

  return { isAuthenticated: false, user: null }
}

export async function checkEmail(email: string): Promise<{ available: boolean }> {
  const res = await fetch(`${BASE_URL}/api/members/check-email`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ email }),
  })

  if (!res.ok) return { available: false }

  const json: ApiResponse<{ available: boolean }> = await res.json()
  return json.data
}
