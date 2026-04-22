'use client'

import { useRouter } from 'next/navigation'
import { Calendar, Clock, Copy, Eye, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MeetingEntry } from '@/types/meeting'
import { MEETING_CATEGORIES } from '@/types/meeting'
import { formatDateKorean, formatDuration, addMinutes } from '@/lib/format'

interface MeetingCardProps {
  meeting: MeetingEntry
  onDelete: (meetingId: number) => void
}

const STATUS_CONFIG = {
  PENDING: { label: '조율 중', variant: 'secondary' as const },
  CONFIRMED: { label: '확정됨', variant: 'default' as const },
}

export function MeetingCard({ meeting, onDelete }: MeetingCardProps) {
  const router = useRouter()

  const categoryLabel = MEETING_CATEGORIES.find(c => c.value === meeting.category)?.label || meeting.category
  const status = STATUS_CONFIG[meeting.status] ?? STATUS_CONFIG.PENDING

  const handleCopyLink = () => {
    if (meeting.roomUrl) {
      const fullUrl = `${window.location.origin}/meetings/${meeting.roomUrl}`
      const text = `"${meeting.title}" 일정 조율에 참여해 주세요:\n${fullUrl}`
      navigator.clipboard.writeText(text)
      alert('링크가 복사되었습니다!')
    }
  }

  const handleViewDetail = () => {
    router.push(`/meetings/${meeting.roomUrl}`)
  }

  const handleDelete = () => {
    if (confirm('정말 이 모임을 삭제하시겠습니까?')) {
      onDelete(meeting.meetingId)
    }
  }

  const dateList = meeting.dates?.length
    ? meeting.dates.map(d => formatDateKorean(d)).join(', ')
    : '-'

  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{categoryLabel}</Badge>
            <Badge
              variant={status.variant}
              className={meeting.status === 'CONFIRMED' ? 'bg-primary text-primary-foreground' : ''}
            >
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
          생성일: {meeting.createdAt ? formatDateKorean(meeting.createdAt.split('T')[0]) : '-'}
        </p>

        <div className="mb-4 space-y-2">
          {meeting.status === 'CONFIRMED' && meeting.confirmedDate && meeting.confirmedTime ? (
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <CheckCircle className="w-4 h-4" />
              <span>
                {formatDateKorean(meeting.confirmedDate)}{' '}
                {meeting.confirmedTime.slice(0, 5)} ~ {addMinutes(meeting.confirmedTime, meeting.duration)}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{dateList}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>진행 시간: {formatDuration(meeting.duration)}</span>
              </div>
            </>
          )}
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
