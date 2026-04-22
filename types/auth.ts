export interface AuthUser {
  memberId: number
  nickname: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  nickname: string
  timezone: 'ASIA_SEOUL' | 'UTC' | 'AMERICA_NEW_YORK'
}

export interface AuthSession {
  isAuthenticated: boolean
  user: AuthUser | null
}

export const TIMEZONE_OPTIONS = [
  { value: 'ASIA_SEOUL', label: '아시아/서울 (KST)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'AMERICA_NEW_YORK', label: '미국/뉴욕 (EST)' },
] as const
