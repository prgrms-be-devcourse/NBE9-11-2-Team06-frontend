// ERD MEMBER 테이블 기반 타입 정의
export interface Member {
  member_id: number
  email: string
  password_hash: string
  nickname: string | null
  timezone: string | null
  created_at: string | null
  modified_at: string | null
}

// 로그인 요청/응답
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  member: Omit<Member, 'password_hash'> | null
  message?: string
}

// 회원가입 요청/응답
export interface RegisterRequest {
  email: string
  password: string
  nickname?: string
}

export interface RegisterResponse {
  success: boolean
  message?: string
}

// 세션 정보
export interface AuthSession {
  isAuthenticated: boolean
  member: Omit<Member, 'password_hash'> | null
}
