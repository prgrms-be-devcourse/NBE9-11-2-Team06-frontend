'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Edit, Eye, Copy, Link, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TimeGrid } from './TimeGrid'
import { ParticipantList } from './ParticipantList'
import { RecommendedSlots } from './RecommendedSlots'
import { GuestInputModal } from './GuestInputModal'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { getMeetingByUrl, getRecommendedSlots, participateAsGuest, confirmMeeting, cancelConfirmedMeeting, deleteParticipantSchedule } from '@/lib/api/meeting'
import { getSession } from '@/lib/api/auth'
import { MEETING_CATEGORIES } from '@/types/meeting'
import { formatDuration, formatDateKorean } from '@/mock/meeting'
import type { MeetingDetail as MeetingDetailType, RecommendedTimeSlot } from '@/types/meeting'

interface MeetingDetailProps {
  meetingUrl: string
}

export function MeetingDetail({ meetingUrl }: MeetingDetailProps) {
  const [meeting, setMeeting] = useState<MeetingDetailType | null>(null)
  const [recommendedSlots, setRecommendedSlots] = useState<RecommendedTimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInputMode, setIsInputMode] = useState(false)
  const [isOrganizerPickMode, setIsOrganizerPickMode] = useState(false)
  const [selectedTimes, setSelectedTimes] = useState<Map<string, string[]>>(new Map())
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const session = getSession()
  const isOwner = meeting && session.member && meeting.member_id === session.member.member_id

  const fetchMeeting = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getMeetingByUrl(meetingUrl)
      if (!data) {
        setError('모임을 찾을 수 없습니다.')
        return
      }

      setMeeting(data)

      const slots = await getRecommendedSlots(data.meeting_id)
      setRecommendedSlots(slots)
    } catch {
      setError('모임 정보를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMeeting()
  }, [meetingUrl])

  const handleTimeSelect = (date: string, times: string[]) => {
    setSelectedTimes(prev => {
      const next = new Map(prev)
      if (times.length === 0) {
        next.delete(date)
      } else {
        next.set(date, times)
      }
      return next
    })
  }

  const handleSaveSchedule = async (name: string, password: string) => {
    if (!meeting) return

    // 프론트 형식 → 백엔드 형식으로 변환
    const availableDateTimes: string[] = []

    selectedTimes.forEach((times, date) => {
      times.forEach(time => {
        availableDateTimes.push(`${date} ${time}`) // "2026-04-20 10:00" 형식
      })
    })

    await participateAsGuest(meeting.meeting_id, {
      guestName: name,
      guestPassword: password,
      availableDateTimes,
    })

    setIsInputMode(false)
    setSelectedTimes(new Map())
    await fetchMeeting()
  }

  const handleDeleteSchedule = async (name: string, password: string) => {
    if (!meeting) return
    await deleteParticipantSchedule(meeting.meeting_id, {
      guestName: name,
      guestPassword: password,
    })
    await fetchMeeting()
  }

  const handleCancelConfirm = async () => {
    if (!meeting || !isOwner) return
    const confirmed = confirm('확정된 일정을 취소하시겠습니까?')
    if (!confirmed) return
    await cancelConfirmedMeeting(meeting.meeting_id)
    await fetchMeeting()
  }

  const handleManualSelect = () => {
    setIsOrganizerPickMode(true)
    setIsInputMode(false)
    setSelectedTimes(new Map())
  }

  const handleOrganizerConfirm = async () => {
    if (!meeting) return
    const entries = Array.from(selectedTimes.entries()).filter(([, times]) => times.length > 0)
    if (entries.length === 0) {
      alert('시간을 선택해주세요.')
      return
    }
    const [date, times] = entries[0]
    const sortedTimes = [...times].sort()
    // 첫 번째 연속 블록만 사용
    let endIdx = 0
    for (let i = 1; i < sortedTimes.length; i++) {
      const [ph, pm] = sortedTimes[i - 1].split(':').map(Number)
      const [ch, cm] = sortedTimes[i].split(':').map(Number)
      if (ch * 60 + cm - (ph * 60 + pm) === 30) {
        endIdx = i
      } else {
        break
      }
    }
    const startTime = sortedTimes[0]
    const lastTime = sortedTimes[endIdx]
    const [h, m] = lastTime.split(':').map(Number)
    const endMinutes = h * 60 + m + 30
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`

    const confirmed = confirm(`${formatDateKorean(date)} ${startTime} - ${endTime}로 일정을 확정하시겠습니까?`)
    if (!confirmed) return

    await confirmMeeting(meeting.meeting_id, { date, startTime, endTime })
    setIsOrganizerPickMode(false)
    setSelectedTimes(new Map())
    await fetchMeeting()
  }

  const handleConfirmSlot = async (slot: RecommendedTimeSlot) => {
    if (!meeting || !isOwner) return

    const confirmed = confirm(`${formatDateKorean(slot.date)} ${slot.startTime} - ${slot.endTime}로 일정을 확정하시겠습니까?`)
    if (!confirmed) return

    await confirmMeeting(meeting.meeting_id, {
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    })

    await fetchMeeting()
  }

  const handleCopyMeetingLink = () => {
    if (!meeting?.random_url) return
    const fullUrl = `${window.location.origin}/meetings/${meeting.random_url}`
    const text = `"${meeting.title}" 일정 조율에 참여해 주세요.\n가능한 시간을 아래 링크에서 선택해 주세요:\n${fullUrl}`
    navigator.clipboard.writeText(text)
    alert('링크가 복사되었습니다!')
  }

  const handleCopyConfirmedText = () => {
    if (!meeting?.confirmedDateTime) return
    const text = `${formatDateKorean(meeting.confirmedDateTime.date)} ${meeting.confirmedDateTime.startTime} "${meeting.title}" 모일 예정입니다`
    navigator.clipboard.writeText(text)
    alert('텍스트가 복사되었습니다!')
  }

  if (isLoading) {
    return <LoadingState message="모임 정보를 불러오는 중..." />
  }

  if (error || !meeting) {
    return <ErrorState message={error || '모임을 찾을 수 없습니다.'} onRetry={fetchMeeting} />
  }

  const categoryLabel = MEETING_CATEGORIES.find(c => c.value === meeting.category)?.label || meeting.category
  const statusConfig = {
    adjusting: { label: '조율 중', variant: 'secondary' as const },
    confirmed: { label: '확정됨', variant: 'default' as const },
    ended: { label: '종료', variant: 'outline' as const },
  }
  const status = meeting.status ? statusConfig[meeting.status] : statusConfig.adjusting

  return (
    <div className="space-y-6">
      {/* 모임 정보 헤더 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline">{categoryLabel}</Badge>
            <Badge variant={status.variant} className={meeting.status === 'confirmed' ? 'bg-primary text-primary-foreground' : ''}>
              {status.label}
            </Badge>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-4">{meeting.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{meeting.dates.length}개 날짜</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>최소 {meeting.duration ? formatDuration(meeting.duration) : '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{meeting.participants.length}명 참여</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleCopyMeetingLink}>
                <Link className="w-3 h-3 mr-1" />
                링크 복사
              </Button>
            </div>
          </div>

          {meeting.confirmedDateTime && (
            <div className="mt-4 p-3 bg-accent rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-accent-foreground">
                  {formatDateKorean(meeting.confirmedDateTime.date)} {meeting.confirmedDateTime.startTime} - {meeting.confirmedDateTime.endTime}
                </span>
                <Button variant="ghost" size="sm" onClick={handleCopyConfirmedText}>
                  <Copy className="w-4 h-4 mr-1" />
                  복사
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 시간표 */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">시간 선택</h2>
                {!isOrganizerPickMode && (
                  <div className="flex gap-2">
                    <Button
                      variant={isInputMode ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => {
                        setIsInputMode(!isInputMode)
                        if (isInputMode) setSelectedTimes(new Map())
                      }}
                    >
                      {isInputMode ? (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          전체 결과
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-1" />
                          내 시간 입력
                        </>
                      )}
                    </Button>
                    {!isInputMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        내 일정 삭제
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {isOrganizerPickMode && (
                <div className="mb-4 p-3 bg-accent rounded-lg text-sm text-accent-foreground">
                  원하는 시간대를 드래그하여 선택하세요 (참여자 현황 참고)
                </div>
              )}

              <p className="text-sm text-muted-foreground mb-4">
                {isInputMode
                  ? '가능한 시간을 드래그하여 선택하세요'
                  : 'hover시 참여자 이름을 확인할 수 있습니다'
                }
              </p>

              <TimeGrid
                dates={meeting.dates}
                participants={meeting.participants}
                isInputMode={isInputMode}
                isOrganizerPickMode={isOrganizerPickMode}
                selectedTimes={selectedTimes}
                onTimeSelect={handleTimeSelect}
                maxParticipants={meeting.participants.length || 1}
                confirmedSlot={meeting.confirmedDateTime}
              />

              {isInputMode && selectedTimes.size > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setShowGuestModal(true)}>
                    일정 저장하기
                  </Button>
                </div>
              )}

              {isOrganizerPickMode && (
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setIsOrganizerPickMode(false); setSelectedTimes(new Map()) }}
                  >
                    취소
                  </Button>
                  <Button onClick={handleOrganizerConfirm} disabled={selectedTimes.size === 0}>
                    이 시간으로 확정
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          <RecommendedSlots
            slots={recommendedSlots}
            isOwner={!!isOwner}
            onConfirm={handleConfirmSlot}
            onCancelConfirm={handleCancelConfirm}
            onManualSelect={handleManualSelect}
            confirmedSlot={meeting.confirmedDateTime}
          />
          <ParticipantList participants={meeting.participants} />
        </div>
      </div>

      <GuestInputModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSubmit={handleSaveSchedule}
        mode="create"
      />
      <GuestInputModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSubmit={handleDeleteSchedule}
        mode="delete"
      />
    </div>
  )
}
