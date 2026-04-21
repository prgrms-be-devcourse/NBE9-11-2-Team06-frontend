import type { Meeting, MeetingDetail, CreateMeetingRequest, GuestParticipationRequest, GuestDeleteRequest, RecommendedTimeSlot } from '@/types/meeting'
import { mockMeetings, mockMeetingDetails, mockRecommendedSlots } from '@/mock/meeting'
import { delay } from './client'


// 내 모임 목록 조회
export async function getMyMeetings(memberId: number): Promise<Meeting[]> {
  await delay(500)

  return mockMeetings
    .filter(m => m.member_id === memberId)
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateB - dateA // 최신순
    })
}

// 모임 상세 조회
export async function getMeetingDetail(meetingId: number): Promise<MeetingDetail | null> {
  await delay(500)

  return mockMeetingDetails.find(m => m.meeting_id === meetingId) || null
}

// 랜덤 URL로 모임 조회
export async function getMeetingByUrl(randomUrl: string): Promise<MeetingDetail | null> {
  await delay(500)

  return mockMeetingDetails.find(m => m.random_url === randomUrl) || null
}

// 모임 생성
export async function createMeeting(data: CreateMeetingRequest, memberId: number): Promise<Meeting> {
  await delay(500)

  const newMeeting: Meeting = {
    meeting_id: Date.now(),
    member_id: memberId,
    title: data.title,
    category: data.category,
    local_time: 'Asia/Seoul',
    status: 'adjusting',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    random_url: generateRandomUrl(),
    duration: data.duration,
  }

  // Mock에서는 메모리에만 추가
  mockMeetings.unshift(newMeeting)

  return newMeeting
}

// 모임 삭제
export async function deleteMeeting(meetingId: number): Promise<boolean> {
  await delay(500)

  const index = mockMeetings.findIndex(m => m.meeting_id === meetingId)
  if (index !== -1) {
    mockMeetings.splice(index, 1)
    return true
  }
  return false
}

// 비회원 참여 등록
export async function participateAsGuest(
  meetingId: number,
  data: GuestParticipationRequest
): Promise<boolean> {
  const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}/time-blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) throw new Error('시간표 등록에 실패했습니다.')
  return true
}

// 비회원 인증 (일정 수정용)
export async function verifyGuest(
  meetingId: number,
  guestName: string,
  guestPassword: string
): Promise<boolean> {
  await delay(500)

  const meeting = mockMeetingDetails.find(m => m.meeting_id === meetingId)
  if (!meeting) return false

  return meeting.participants.some(
    p => p.guest_name === guestName && p.guest_password === guestPassword
  )
}

// 추천 시간대 조회
export async function getRecommendedSlots(meetingId: number): Promise<RecommendedTimeSlot[]> {
  await delay(500)

  // 실제로는 백엔드에서 계산
  return mockRecommendedSlots
}

// 일정 확정
export async function confirmMeeting(
  meetingId: number,
  confirmedDateTime: { date: string; startTime: string; endTime: string }
): Promise<boolean> {
  await delay(500)

  const meetingIndex = mockMeetings.findIndex(m => m.meeting_id === meetingId)
  if (meetingIndex !== -1) {
    mockMeetings[meetingIndex].status = 'confirmed'
  }

  const detailIndex = mockMeetingDetails.findIndex(m => m.meeting_id === meetingId)
  if (detailIndex !== -1) {
    mockMeetingDetails[detailIndex].status = 'confirmed'
    mockMeetingDetails[detailIndex].confirmedDateTime = confirmedDateTime
  }

  return true
}

// 비회원 일정 삭제
// 비회원 일정 삭제
export async function deleteParticipantSchedule(
  meetingId: number,
  data: GuestDeleteRequest
): Promise<boolean> {
  const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}/time-blocks`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) throw new Error('시간표 삭제에 실패했습니다.')
  return true
}
// 일정 확정 취소
export async function cancelConfirmedMeeting(meetingId: number): Promise<boolean> {
  await delay(500)

  const meetingIndex = mockMeetings.findIndex(m => m.meeting_id === meetingId)
  if (meetingIndex !== -1) {
    mockMeetings[meetingIndex].status = 'adjusting'
  }

  const detailIndex = mockMeetingDetails.findIndex(m => m.meeting_id === meetingId)
  if (detailIndex !== -1) {
    mockMeetingDetails[detailIndex].status = 'adjusting'
    mockMeetingDetails[detailIndex].confirmedDateTime = undefined
  }

  return true
}

// 랜덤 URL 생성 헬퍼
function generateRandomUrl(): string {
  return Math.random().toString(36).substring(2, 15)
}
