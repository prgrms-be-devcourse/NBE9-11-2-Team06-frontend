import type { Meeting, MeetingDetail, ParticipantWithAvailability, RecommendedTimeSlot } from '@/types/meeting'

// Mock 회원 데이터
export const mockMembers = [
  {
    member_id: 1,
    email: 'test@example.com',
    password_hash: '$2b$10$hashedpassword', // 실제로는 bcrypt 해시
    nickname: '테스트유저',
    timezone: 'Asia/Seoul',
    created_at: '2026-04-10T10:00:00Z',
    modified_at: '2026-04-10T10:00:00Z',
  },
]

// Mock 모임 데이터
export const mockMeetings: Meeting[] = [
  {
    meeting_id: 1,
    member_id: 1,
    title: '팀 프로젝트 회의',
    category: 'meeting',
    local_time: 'Asia/Seoul',
    status: 'adjusting',
    created_at: '2026-04-14T10:00:00Z',
    modified_at: '2026-04-14T10:00:00Z',
    random_url: 'abc123xyz',
    duration: 120,
  },
  {
    meeting_id: 2,
    member_id: 1,
    title: '동창회 모임',
    category: 'casual',
    local_time: 'Asia/Seoul',
    status: 'confirmed',
    created_at: '2026-04-14T09:00:00Z',
    modified_at: '2026-04-14T11:00:00Z',
    random_url: 'def456uvw',
    duration: 180,
  },
]

// Mock 참여자 데이터
export const mockParticipants: ParticipantWithAvailability[] = [
  {
    participant_id: 1,
    meeting_id: 2,
    guest_name: '김철수',
    guest_password: '1234',
    availableTimes: [
      { date: '2026-04-15', times: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
    ],
  },
  {
    participant_id: 2,
    meeting_id: 2,
    guest_name: '이영희',
    guest_password: '5678',
    availableTimes: [
      { date: '2026-04-15', times: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'] },
    ],
  },
  {
    participant_id: 3,
    meeting_id: 2,
    guest_name: '박민수',
    guest_password: '9012',
    availableTimes: [
      { date: '2026-04-15', times: ['14:00', '14:30', '15:00', '15:30'] },
    ],
  },
]

// Mock 모임 상세 데이터
export const mockMeetingDetails: MeetingDetail[] = [
  {
    ...mockMeetings[0],
    dates: ['2026-04-15', '2026-04-16'],
    participants: [],
  },
  {
    ...mockMeetings[1],
    dates: ['2026-04-15'],
    participants: mockParticipants,
    confirmedDateTime: {
      date: '2026-04-15',
      startTime: '14:00',
      endTime: '17:00',
    },
  },
]

// Mock 추천 시간대 데이터
export const mockRecommendedSlots: RecommendedTimeSlot[] = [
  {
    date: '2026-04-15',
    startTime: '14:00',
    endTime: '17:00',
    availableCount: 3,
    participantNames: ['김철수', '이영희', '박민수'],
  },
  {
    date: '2026-04-15',
    startTime: '15:00',
    endTime: '18:00',
    availableCount: 2,
    participantNames: ['김철수', '이영희'],
  },
]

// 날짜 포맷 헬퍼
export function formatDateKorean(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]
  return `${month}월 ${day}일 (${weekday})`
}

// 시간 포맷 헬퍼 (분 -> 시간 표시)
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}분`
  if (mins === 0) return `${hours}시간`
  return `${hours}시간 ${mins}분`
}
