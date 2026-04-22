// 백엔드 API 공통 응답 래퍼
export interface ApiResponse<T> {
  resultCode: string
  msg: string
  data: T
}

// 모임 상태 (백엔드 MeetingStatus enum)
export type MeetingStatus = 'PENDING' | 'CONFIRMED'

// 내 모임 목록 / 단건 조회 응답 (MeetingEntryResponse)
export interface MeetingEntry {
  meetingId: number
  title: string
  category: string
  duration: number
  status: MeetingStatus
  roomUrl: string
  dates: string[]     // ["2026-04-21", "2026-04-22", ...]
  createdAt: string   // "2026-04-21T14:30:00"
}

// 모임 생성 요청 (MeetingCreateRequest)
export interface CreateMeetingRequest {
  title: string
  category: string
  dates: string[]
  duration: number
}

// 모임 생성 응답 (MeetingCreateResponse)
export interface MeetingCreateApiResponse {
  meetingId: number
  roomUrl: string
}

// 비회원 참가 요청 (ParticipantJoinRequest)
export interface ParticipantJoinRequest {
  guestName: string
  guestPassword: string
}

// 시간블록 등록 요청 (TimeBlockRequest)
export interface GuestParticipationRequest {
  guestName: string
  guestPassword: string
  availableDateTimes: string[]  // "yyyy-MM-dd HH:mm" 형식
}

// 시간블록 삭제 요청 (TimeBlockDeleteRequest)
export interface GuestDeleteRequest {
  guestName: string
  guestPassword: string
}

// 참여자 스케줄 응답 (ParticipantsScheduleResponse)
export interface ParticipantSchedule {
  name: string
  availableTimeRanges: TimeRangeItem[]
}

// 시간 범위 (TimeRangeResponse)
export interface TimeRangeItem {
  date: string       // "2026-04-21"
  startTime: string  // "10:00"
  endTime: string    // "12:00"
}

// 타임테이블 응답 (TimeTableResponse)
export interface TimeTableResponse {
  availableDateTimes: TimeTableDateInfo[]
}

export interface TimeTableDateInfo {
  availableDate: string
  availableTimeInfos: TimeTableTimeInfo[]
}

export interface TimeTableTimeInfo {
  time: string
  participants: string[]
  count: number
}

// 추천 일정 응답 (RecommendedScheduleResponse)
export interface RecommendedTimeSlot {
  date: string
  startTime: string
  endTime: string
  availableCount: number
}

// 확정 일정 응답 (ConfirmedScheduleResponse)
export interface ConfirmedSchedule {
  date: string
  time: string
  message: string
  status: MeetingStatus
}

// 일정 확정 요청 (FinalizeRequest)
export interface FinalizeRequest {
  date: string   // "2026-04-21"
  time: string   // "14:00"
}

// 카테고리 옵션
export const MEETING_CATEGORIES = [
  { value: 'study', label: '스터디' },
  { value: 'meeting', label: '회의' },
  { value: 'casual', label: '가벼운 만남' },
  { value: 'other', label: '기타' },
] as const

// 진행 시간 옵션
export const DURATION_OPTIONS = [
  { value: 30, label: '30분' },
  { value: 60, label: '1시간' },
  { value: 90, label: '1시간 30분' },
  { value: 120, label: '2시간' },
  { value: 150, label: '2시간 30분' },
  { value: 180, label: '3시간' },
  { value: 210, label: '3시간 30분' },
  { value: 240, label: '4시간' },
  { value: 270, label: '4시간 30분' },
  { value: 300, label: '5시간' },
] as const
