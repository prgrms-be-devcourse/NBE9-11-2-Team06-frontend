import type {
  MeetingEntry,
  ApiResponse,
  CreateMeetingRequest,
  MeetingCreateApiResponse,
  ParticipantJoinRequest,
  GuestParticipationRequest,
  GuestDeleteRequest,
  ParticipantSchedule,
  RecommendedTimeSlot,
  ConfirmedSchedule,
  FinalizeRequest,
  TimeTableResponse,
} from '@/types/meeting'
import { BASE_URL, jsonHeaders } from './client'

export async function getMyMeetings(): Promise<MeetingEntry[]> {
  const res = await fetch(`${BASE_URL}/api/meetings`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('모임 목록 조회에 실패했습니다.')
  const json: ApiResponse<MeetingEntry[]> = await res.json()
  return json.data
}

export async function getMeetingByUrl(randomUrl: string): Promise<MeetingEntry> {
  const res = await fetch(`${BASE_URL}/api/meetings/${randomUrl}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('모임 조회에 실패했습니다.')
  const json: ApiResponse<MeetingEntry> = await res.json()
  return json.data
}

export async function createMeeting(data: CreateMeetingRequest): Promise<MeetingCreateApiResponse> {
  const res = await fetch(`${BASE_URL}/api/meetings`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('모임 생성에 실패했습니다.')
  const json: ApiResponse<MeetingCreateApiResponse> = await res.json()
  return json.data
}

export async function deleteMeeting(meetingId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('모임 삭제에 실패했습니다.')
}

export async function joinMeeting(randomUrl: string, data: ParticipantJoinRequest): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/meetings/${randomUrl}/participants`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || '모임 참가에 실패했습니다.')
  }
}

export async function participateAsGuest(meetingId: number, data: GuestParticipationRequest): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}/time-blocks`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || '시간표 등록에 실패했습니다.')
  }
}

export async function deleteParticipantSchedule(meetingId: number, data: GuestDeleteRequest): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}/time-blocks`, {
    method: 'DELETE',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || '시간표 삭제에 실패했습니다.')
  }
}

export async function getParticipantSchedules(meetingId: number): Promise<ParticipantSchedule[]> {
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}/participants`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('참여자 목록 조회에 실패했습니다.')
  const json: ApiResponse<ParticipantSchedule[]> = await res.json()
  return json.data
}

export async function getRecommendedSlots(meetingId: number): Promise<RecommendedTimeSlot[]> {
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}/recommend`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('추천 시간대 조회에 실패했습니다.')
  const json: ApiResponse<RecommendedTimeSlot[]> = await res.json()
  return json.data
}

export async function confirmMeeting(meetingId: number, data: FinalizeRequest): Promise<ConfirmedSchedule> {
  // Backend expects LocalTime in "HH:mm" format (@JsonFormat(pattern = "HH:mm")).
  // The recommend API returns LocalTime without @JsonFormat, so it comes back as "HH:mm:ss".
  // Normalize to the first 5 characters to strip any trailing seconds.
  const payload = { date: data.date, time: data.time.slice(0, 5) }
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}/confirm`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || '일정 확정에 실패했습니다.')
  }
  const json: ApiResponse<ConfirmedSchedule> = await res.json()
  return json.data
}

export async function cancelConfirmedMeeting(meetingId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}/confirm`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || '일정 확정 취소에 실패했습니다.')
  }
}

export async function getConfirmedSchedule(meetingId: number): Promise<ConfirmedSchedule | null> {
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}/confirm`, {
    credentials: 'include',
  })
  if (res.status === 400 || res.status === 404) return null
  if (!res.ok) throw new Error('확정 일정 조회에 실패했습니다.')
  const json: ApiResponse<ConfirmedSchedule> = await res.json()
  return json.data
}

export async function getTimeTable(meetingId: number): Promise<TimeTableResponse> {
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}/timetable`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('타임테이블 조회에 실패했습니다.')
  const json: ApiResponse<TimeTableResponse> = await res.json()
  return json.data
}
