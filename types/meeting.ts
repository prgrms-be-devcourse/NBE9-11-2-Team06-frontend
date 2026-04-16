// ERD MEETINGS 테이블 기반 타입 정의
export interface Meeting {
  meeting_id: number
  member_id: number
  title: string | null
  category: string | null
  local_time: string | null
  status: 'adjusting' | 'confirmed' | 'ended' | null
  created_at: string | null
  modified_at: string | null
  random_url: string | null
  duration: number | null
}

// ERD PARTICIPANTS 테이블 기반 타입 정의
export interface Participant {
  participant_id: number
  meeting_id: number
  guest_name: string | null
  guest_password: string | null
}

// ERD TIME_TABLE 테이블 기반 타입 정의
export interface TimeTable {
  id: number
  meeting_id: number
  created_by: string | null
  created_at: string | null
  modified_by: string | null
  modified_at: string | null
}

// ERD DATE_INFO 테이블 기반 타입 정의
export interface DateInfo {
  date_id: number
  time_table_id: number
  meeting_id: number
  date: string | null
  created_at: string | null
  create_by: string | null
  modified_at: string | null
  modified_by: string | null
}

// ERD TIME_INFO 테이블 기반 타입 정의
export interface TimeInfo {
  time_id: number
  date_id: number
  time_table_id: number
  meeting_id: number
  time: string | null
  created_at: string | null
  create_by: string | null
  modified_at: string | null
  modified_by: string | null
}

// ERD Time_Block 테이블 기반 타입 정의
export interface TimeBlock {
  time_block_id: number
  meeting_id: number
  participant_id: number
  created_by: string | null
  created_at: string | null
  modified_at: string | null
}

// ERD Available_Date_time 테이블 기반 타입 정의
export interface AvailableDateTime {
  available_date_time_id: number
  time_block_id: number
  meeting_id: number
  participant_id: number
  date: string | null
  created_by: string | null
  create_at: string | null
  modified_at: string | null
}

// ERD Available_Time 테이블 기반 타입 정의
export interface AvailableTime {
  available_time_id: number
  available_date_time_id: number
  time_block_id: number
  meeting_id: number
  participant_id: number
  time: string | null
  created_by: string | null
  created_at: string | null
  modified_at: string | null
}

// ERD ADJUSTRESULT 테이블 기반 타입 정의
export interface AdjustResult {
  adjustresult_id: number
  time_id: number
  date_id: number
  time_table_id: number
  meeting_id: number
  name: string | null
}

// 모임 생성 요청
export interface CreateMeetingRequest {
  title: string
  category: string
  dates: string[] // 선택된 날짜들
  duration: number // 분 단위
}

// 모임 상세 정보 (조합된 데이터)
export interface MeetingDetail extends Meeting {
  dates: string[]
  participants: ParticipantWithAvailability[]
  confirmedDateTime?: {
    date: string
    startTime: string
    endTime: string
  }
}

// 참여자 가용 시간 포함
export interface ParticipantWithAvailability extends Participant {
  availableTimes: {
    date: string
    times: string[]
  }[]
}

// 추천 시간대
export interface RecommendedTimeSlot {
  date: string
  startTime: string
  endTime: string
  availableCount: number
  participantNames: string[]
}

// 비회원 참여 요청
export interface GuestParticipationRequest {
  guestName: string
  guestPassword: string
  availableDateTimes: string[]
}


// 카테고리 옵션
export const MEETING_CATEGORIES = [
  { value: 'study', label: '스터디' },
  { value: 'meeting', label: '회의' },
  { value: 'casual', label: '가벼운 만남' },
  { value: 'other', label: '기타' },
] as const

// 진행 시간 옵션 (30분 ~ 5시간, 30분 단위)
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

export interface GuestDeleteRequest {
  guestName: string
  guestPassword: string
}

