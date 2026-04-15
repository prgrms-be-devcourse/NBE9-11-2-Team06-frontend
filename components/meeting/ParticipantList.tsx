import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ParticipantWithAvailability } from '@/types/meeting'

interface ParticipantListProps {
  participants: ParticipantWithAvailability[]
}

function formatTimeRanges(availableTimes: { date: string; times: string[] }[]): string[] {
  const ranges: string[] = []

  for (const { date, times } of availableTimes) {
    if (times.length === 0) continue

    const d = new Date(date)
    const datePrefix = `${d.getMonth() + 1}/${d.getDate()}`
    const sorted = [...times].sort()

    let rangeStart = sorted[0]
    let prevTime = sorted[0]

    const closeRange = (end: string) => {
      const [h, m] = end.split(':').map(Number)
      const endMins = h * 60 + m + 30
      const endTime = `${Math.floor(endMins / 60).toString().padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`
      ranges.push(`${datePrefix} ${rangeStart}-${endTime}`)
    }

    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i]
      const [ph, pm] = prevTime.split(':').map(Number)
      const [ch, cm] = curr.split(':').map(Number)
      if (ch * 60 + cm - (ph * 60 + pm) === 30) {
        prevTime = curr
      } else {
        closeRange(prevTime)
        rangeStart = curr
        prevTime = curr
      }
    }
    closeRange(prevTime)
  }

  return ranges
}

export function ParticipantList({ participants }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4" />
            참여자 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            아직 일정을 입력한 참여자가 없습니다
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4" />
          참여자 목록 ({participants.length}명)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {participants.map(participant => {
            const timeRanges = formatTimeRanges(participant.availableTimes)
            return (
              <li key={participant.participant_id} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                    {participant.guest_name?.charAt(0) || '?'}
                  </div>
                  <p className="font-medium text-foreground pt-1">{participant.guest_name || '익명'}</p>
                </div>
                <div className="text-right shrink-0">
                  {timeRanges.length > 0 ? (
                    timeRanges.map((range, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground">{range}</p>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">-</p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
