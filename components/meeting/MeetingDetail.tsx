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
import {
  getMeetingByUrl,
  getParticipantSchedules,
  getRecommendedSlots,
  getConfirmedSchedule,
  participateAsGuest,
  joinMeeting,
  confirmMeeting,
  cancelConfirmedMeeting,
  deleteParticipantSchedule,
  getTimeTable,
} from '@/lib/api/meeting'
import { getSession } from '@/lib/api/auth'
import { MEETING_CATEGORIES } from '@/types/meeting'
import { formatDuration, formatDateKorean, addMinutes } from '@/lib/format'
import type {
  MeetingEntry,
  ParticipantSchedule,
  RecommendedTimeSlot,
  ConfirmedSchedule,
} from '@/types/meeting'

interface MeetingDetailProps {
  meetingUrl: string
}

const STATUS_CONFIG = {
  PENDING: { label: '조율 중', variant: 'secondary' as const },
  CONFIRMED: { label: '확정됨', variant: 'default' as const },
}

export function MeetingDetail({ meetingUrl }: MeetingDetailProps) {
  const [meeting, setMeeting] = useState<MeetingEntry | null>(null)
  const [participants, setParticipants] = useState<ParticipantSchedule[]>([])
  const [dates, setDates] = useState<string[]>([])
  const [recommendedSlots, setRecommendedSlots] = useState<RecommendedTimeSlot[]>([])
  const [confirmedSchedule, setConfirmedSchedule] = useState<ConfirmedSchedule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInputMode, setIsInputMode] = useState(false)
  const [isOrganizerPickMode, setIsOrganizerPickMode] = useState(false)
  const [selectedTimes, setSelectedTimes] = useState<Map<string, string[]>>(new Map())
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const session = getSession()
  const isOwner = session.isAuthenticated && session.user?.memberId === meeting?.hostMemberId

  const fetchMeeting = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const meetingData = await getMeetingByUrl(meetingUrl)
      setMeeting(meetingData)
      setDates([...meetingData.dates].sort())

      // recommend()가 aggregate된 TimeTable을 읽으므로 /timetable 먼저 호출
      await getTimeTable(meetingData.meetingId).catch(() => {})

      const [participantData, slots, confirmed] = await Promise.all([
        getParticipantSchedules(meetingData.meetingId),
        getRecommendedSlots(meetingData.meetingId),
        meetingData.status === 'CONFIRMED'
          ? getConfirmedSchedule(meetingData.meetingId)
          : Promise.resolve(null),
      ])

      setParticipants(participantData)
      setRecommendedSlots(slots)
      setConfirmedSchedule(confirmed)
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

    const now = new Date()
    const allDateTimes: string[] = []
    selectedTimes.forEach((times, date) => {
      times.forEach(time => {
        allDateTimes.push(`${date} ${time}`)
      })
    })

    const futureDateTimes = allDateTimes.filter(dt => {
      const [d, t] = dt.split(' ')
      return new Date(`${d}T${t}:00`) > now
    })

    if (futureDateTimes.length === 0) {
      throw new Error('선택한 시간이 모두 현재 이전입니다. 미래 시간을 선택해주세요.')
    }

    await joinMeeting(meeting.roomUrl, { guestName: name, guestPassword: password })

    await participateAsGuest(meeting.meetingId, {
      guestName: name,
      guestPassword: password,
      availableDateTimes: futureDateTimes,
    })

    setIsInputMode(false)
    setSelectedTimes(new Map())
    await fetchMeeting()
  }

  const handleDeleteSchedule = async (name: string, password: string) => {
    if (!meeting) return
    await deleteParticipantSchedule(meeting.meetingId, {
      guestName: name,
      guestPassword: password,
    })
    await fetchMeeting()
  }

  const handleCancelConfirm = async () => {
    if (!meeting || !isOwner) return
    const confirmed = confirm('확정된 일정을 취소하시겠습니까?')
    if (!confirmed) return
    await cancelConfirmedMeeting(meeting.meetingId)
    setConfirmedSchedule(null)
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
    const startTime = sortedTimes[0]
    const endTime = addMinutes(startTime, meeting.duration)

    const confirmed = confirm(`${formatDateKorean(date)} ${startTime} - ${endTime}로 일정을 확정하시겠습니까?`)
    if (!confirmed) return

    try {
      await confirmMeeting(meeting.meetingId, { date, time: startTime })
      setIsOrganizerPickMode(false)
      setSelectedTimes(new Map())
      await fetchMeeting()
    } catch (err) {
      alert(err instanceof Error ? err.message : '일정 확정에 실패했습니다.')
    }
  }

  const handleConfirmSlot = async (slot: RecommendedTimeSlot) => {
    if (!meeting || !isOwner) return
    const startTime = slot.startTime.slice(0, 5)
    const endTime = addMinutes(startTime, meeting.duration)
    const confirmed = confirm(`${formatDateKorean(slot.date)} ${startTime} - ${endTime}로 일정을 확정하시겠습니까?`)
    if (!confirmed) return

    try {
      await confirmMeeting(meeting.meetingId, { date: slot.date, time: startTime })
      await fetchMeeting()
    } catch (err) {
      alert(err instanceof Error ? err.message : '일정 확정에 실패했습니다.')
    }
  }

  const handleCopyMeetingLink = () => {
    if (!meeting?.roomUrl) return
    const fullUrl = `${window.location.origin}/meetings/${meeting.roomUrl}`
    const text = `"${meeting.title}" 일정 조율에 참여해 주세요:\n${fullUrl}`
    navigator.clipboard.writeText(text)
    alert('링크가 복사되었습니다!')
  }

  const handleCopyConfirmedText = () => {
    if (!confirmedSchedule || !meeting) return
    navigator.clipboard.writeText(confirmedSchedule.message)
    alert('텍스트가 복사되었습니다!\n일정 확정 메세지를 참여자에게 전달해주세요.')
  }

  if (isLoading) {
    return <LoadingState message="모임 정보를 불러오는 중..." />
  }

  if (error || !meeting) {
    return <ErrorState message={error || '모임을 찾을 수 없습니다.'} onRetry={fetchMeeting} />
  }

  const categoryLabel = MEETING_CATEGORIES.find(c => c.value === meeting.category)?.label || meeting.category
  const status = STATUS_CONFIG[meeting.status] ?? STATUS_CONFIG.PENDING

  const confirmedSlotForDisplay = confirmedSchedule
    ? {
        date: confirmedSchedule.date,
        startTime: confirmedSchedule.time.slice(0, 5),
        endTime: addMinutes(confirmedSchedule.time, meeting.duration),
      }
    : undefined

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline">{categoryLabel}</Badge>
            <Badge
              variant={status.variant}
              className={meeting.status === 'CONFIRMED' ? 'bg-primary text-primary-foreground' : ''}
            >
              {status.label}
            </Badge>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-4">{meeting.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{dates.length}개 날짜</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>최소 {formatDuration(meeting.duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{participants.length}명 참여</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleCopyMeetingLink}>
                <Link className="w-3 h-3 mr-1" />
                링크 복사
              </Button>
            </div>
          </div>

          {confirmedSchedule && confirmedSlotForDisplay && (
            <div className="mt-4 p-3 bg-accent rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-accent-foreground">
                  {formatDateKorean(confirmedSlotForDisplay.date)} {confirmedSlotForDisplay.startTime} - {confirmedSlotForDisplay.endTime}
                </span>
                <Button variant="ghost" size="sm" onClick={handleCopyConfirmedText}>
                  <Copy className="w-4 h-4 mr-1" />
                  일정 확정 메세지
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  : '시간표에 마우스를 올리면 해당 시간에 참여 가능 사람을 확인할 수 있습니다'
                }
              </p>

              <TimeGrid
                dates={dates}
                participants={participants}
                isInputMode={isInputMode}
                isOrganizerPickMode={isOrganizerPickMode}
                selectedTimes={selectedTimes}
                onTimeSelect={handleTimeSelect}
                maxParticipants={participants.length || 1}
                confirmedSlot={confirmedSlotForDisplay}
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
                    일정 확정
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <RecommendedSlots
            slots={recommendedSlots}
            isOwner={isOwner}
            onConfirm={handleConfirmSlot}
            onCancelConfirm={handleCancelConfirm}
            onManualSelect={handleManualSelect}
            confirmedSlot={confirmedSlotForDisplay}
          />
          <ParticipantList participants={participants} />
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
