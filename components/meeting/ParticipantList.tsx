import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ParticipantSchedule } from '@/types/meeting'

interface ParticipantListProps {
  participants: ParticipantSchedule[]
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
          {participants.map((participant, idx) => (
            <li key={idx} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                  {participant.name.charAt(0)}
                </div>
                <p className="font-medium text-foreground pt-1">{participant.name}</p>
              </div>
              <div className="text-right shrink-0">
                {participant.availableTimeRanges.length > 0 ? (
                  participant.availableTimeRanges.map((range, i) => {
                    const d = new Date(range.date)
                    const datePrefix = `${d.getMonth() + 1}/${d.getDate()}`
                    return (
                      <p key={i} className="text-xs text-muted-foreground">
                        {datePrefix} {range.startTime.slice(0, 5)}-{range.endTime.slice(0, 5)}
                      </p>
                    )
                  })
                ) : (
                  <p className="text-xs text-muted-foreground">-</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
