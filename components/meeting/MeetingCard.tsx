'use client'

import { useRouter } from 'next/navigation'
import { Calendar, Clock, Copy, Eye, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Meeting } from '@/types/meeting'
import { formatDateKorean, formatDuration } from '@/mock/meeting'
import { MEETING_CATEGORIES } from '@/types/meeting'

interface MeetingCardProps {
  meeting: Meeting
  dates: string[]
  participantCount?: number
  confirmedDateTime?: {
    date: string
    startTime: string
    endTime: string
  }
  onDelete: (meetingId: number) => void
}

export function MeetingCard({ meeting, dates, participantCount, confirmedDateTime, onDelete }: MeetingCardProps) {
  const router = useRouter()
  
  const categoryLabel = MEETING_CATEGORIES.find(c => c.value === meeting.category)?.label || meeting.category
  
  const statusConfig = {
    adjusting: { label: '조율 중', variant: 'secondary' as const },
    confirmed: { label: '확정됨', variant: 'default' as const },
    ended: { label: '종료', variant: 'outline' as const },
  }
  
  const status = meeting.status ? statusConfig[meeting.status] : statusConfig.adjusting

  const handleCopyLink = () => {
    if (meeting.random_url) {
      const fullUrl = `${window.location.origin}/meetings/${meeting.random_url}`
      const text = `"${meeting.title}" 일정 조율에 참여해 주세요.\n가능한 시간을 아래 링크에서 선택해 주세요:\n${fullUrl}`
      navigator.clipboard.writeText(text)
      alert('링크가 복사되었습니다!')
    }
  }

  const handleViewDetail = () => {
    router.push(`/meetings/${meeting.random_url}`)
  }

  const handleDelete = () => {
    if (confirm('정말 이 모임을 삭제하시겠습니까?')) {
      onDelete(meeting.meeting_id)
    }
  }

  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{categoryLabel}</Badge>
            <Badge variant={status.variant} className={meeting.status === 'confirmed' ? 'bg-primary text-primary-foreground' : ''}>
              {status.label}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">{meeting.title}</h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          생성일: {meeting.created_at ? formatDateKorean(meeting.created_at.split('T')[0]) : '-'}
        </p>

        {meeting.status === 'confirmed' && confirmedDateTime ? (
          <div className="mb-4 p-3 bg-accent rounded-lg">
            <div className="flex items-center gap-2 text-accent-foreground font-medium">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDateKorean(confirmedDateTime.date)} {confirmedDateTime.startTime} - {confirmedDateTime.endTime}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>날짜: {dates.map(d => formatDateKorean(d).split(' ')[0] + formatDateKorean(d).split(' ')[1]).join(', ')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>진행 시간: {meeting.duration ? formatDuration(meeting.duration) : '-'}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <Users className="w-4 h-4" />
          <span>{participantCount ?? 0}명 참여 중</span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
            <Copy className="w-4 h-4 mr-2" />
            링크 복사
          </Button>
          <Button className="flex-1" onClick={handleViewDetail}>
            <Eye className="w-4 h-4 mr-2" />
            내용 확인
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
