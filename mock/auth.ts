import type { Member } from '@/types/auth'

export const mockMembers: Member[] = [
  {
    member_id: 1,
    email: 'test@example.com',
    password_hash: 'Test1234!', // 테스트용으로 평문 저장 (실제로는 bcrypt)
    nickname: '테스트유저',
    timezone: 'Asia/Seoul',
    created_at: '2026-04-10T10:00:00Z',
    modified_at: '2026-04-10T10:00:00Z',
  },
]

// 테스트 계정 정보
export const TEST_ACCOUNT = {
  email: 'test@example.com',
  password: 'Test1234!',
  nickname: '테스트유저',
}
