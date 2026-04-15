'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MeetingCard } from './MeetingCard'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { getMyMeetings, deleteMeeting, getMeetingDetail } from '@/lib/api/meeting'
import { getSession } from '@/lib/api/auth'
import type { Meeting, MeetingDetail } from '@/types/meeting'

export function MeetingList() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [meetingDetails, setMeetingDetails] = useState<Map<number, MeetingDetail>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMeetings = async () => {
    const session = getSession()
    
    if (!session.isAuthenticated || !session.member) {
      router.push('/login')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await getMyMeetings(session.member.member_id)
      setMeetings(data)
      
      // 각 모임의 상세 정보도 가져옴
      const detailsMap = new Map<number, MeetingDetail>()
      for (const meeting of data) {
        const detail = await getMeetingDetail(meeting.meeting_id)
        if (detail) {
          detailsMap.set(meeting.meeting_id, detail)
        }
      }
      setMeetingDetails(detailsMap)
    } catch {
      setError('모임 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  const handleDelete = async (meetingId: number) => {
    try {
      await deleteMeeting(meetingId)
      setMeetings(prev => prev.filter(m => m.meeting_id !== meetingId))
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  if (isLoading) {
    return <LoadingState message="모임 목록을 불러오는 중..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchMeetings} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">내 모임</h1>
          <p className="text-muted-foreground">내가 만든 모임을 관리하세요</p>
        </div>
        <Button onClick={() => router.push('/meetings/new')}>
          <Plus className="w-4 h-4 mr-2" />
          새 모임
        </Button>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">아직 생성한 모임이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map(meeting => {
            const detail = meetingDetails.get(meeting.meeting_id)
            return (
              <MeetingCard
                key={meeting.meeting_id}
                meeting={meeting}
                dates={detail?.dates || []}
                participantCount={detail?.participants.length}
                confirmedDateTime={detail?.confirmedDateTime}
                onDelete={handleDelete}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
