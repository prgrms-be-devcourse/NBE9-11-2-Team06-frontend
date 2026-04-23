'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MeetingCard } from './MeetingCard'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { getMyMeetings, deleteMeeting } from '@/lib/api/meeting'
import { getSession } from '@/lib/api/auth'
import type { MeetingEntry } from '@/types/meeting'

export async function deleteMember() {
  const res = await fetch('/api/members', {
    method: 'DELETE',
    credentials: 'include',
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message ?? data.msg ?? '회원 탈퇴 실패')
  }

  return data
}

export function MeetingList() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<MeetingEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchMeetings = async () => {
    const session = getSession()

    if (!session.isAuthenticated || !session.user) {
      router.push('/login')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await getMyMeetings()
      setMeetings(data)
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
      setMeetings(prev => prev.filter(m => m.meetingId !== meetingId))
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

  const handleDeleteMember = async () => {
    try {
      const res = await deleteMember()
  
      alert(res.message ?? res.msg)
      router.push('/')
    } catch (e: any) {
      alert(e?.message ?? '탈퇴 실패')
    }
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
          {meetings.map(meeting => (
            <MeetingCard
              key={meeting.meetingId}
              meeting={meeting}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      <Button
        className="fixed bottom-6 right-6 bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800"
        onClick={() => setShowDeleteConfirm(true)}
      >
        회원 탈퇴
      </Button>
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="mb-4 font-semibold">정말 탈퇴하시겠습니까?</p>

            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </Button>

              <Button
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDeleteMember}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}
