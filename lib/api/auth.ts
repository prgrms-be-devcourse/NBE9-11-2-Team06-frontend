import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, AuthSession } from '@/types/auth'
import { mockMembers, TEST_ACCOUNT } from '@/mock/auth'
import { delay } from './client'

// 세션 스토리지 키
const SESSION_KEY = 'auth_session'

// 로그인 API (Mock)
export async function login(data: LoginRequest): Promise<LoginResponse> {
  await delay(500) // 네트워크 지연 시뮬레이션

  const member = mockMembers.find(
    m => m.email === data.email && m.password_hash === data.password
  )

  if (member) {
    const session: AuthSession = {
      isAuthenticated: true,
      member: {
        member_id: member.member_id,
        email: member.email,
        nickname: member.nickname,
        timezone: member.timezone,
        created_at: member.created_at,
        modified_at: member.modified_at,
      },
    }
    
    // 세션 저장
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }

    return {
      success: true,
      member: session.member,
    }
  }

  return {
    success: false,
    member: null,
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  }
}

// 회원가입 API (Mock)
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  await delay(500)

  const exists = mockMembers.some(m => m.email === data.email)
  
  if (exists) {
    return {
      success: false,
      message: '이미 등록된 이메일입니다.',
    }
  }

  // Mock에서는 실제로 저장하지 않음
  return {
    success: true,
    message: '회원가입이 완료되었습니다.',
  }
}

// 로그아웃
export async function logout(): Promise<void> {
  await delay(200)
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY)
  }
}

// 현재 세션 확인
export function getSession(): AuthSession {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, member: null }
  }

  const stored = sessionStorage.getItem(SESSION_KEY)
  if (stored) {
    return JSON.parse(stored)
  }

  return { isAuthenticated: false, member: null }
}

// 테스트 계정 정보 export
export { TEST_ACCOUNT }
