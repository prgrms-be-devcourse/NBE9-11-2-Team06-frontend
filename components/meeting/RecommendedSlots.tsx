'use client'

import { Sparkles, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { RecommendedTimeSlot } from '@/types/meeting'
import { formatDateKorean } from '@/mock/meeting'

interface RecommendedSlotsProps {
  slots: RecommendedTimeSlot[]
  isOwner: boolean
  onConfirm?: (slot: RecommendedTimeSlot) => void
  onCancelConfirm?: () => void
  onManualSelect?: () => void
  confirmedSlot?: { date: string; startTime: string; endTime: string }
}

export function RecommendedSlots({ slots, isOwner, onConfirm, onCancelConfirm, onManualSelect, confirmedSlot }: RecommendedSlotsProps) {
  if (slots.length === 0 && !confirmedSlot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4" />
            추천 시간대
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground text-center py-2">
            참여자들의 응답이 더 필요합니다
          </p>
          {isOwner && onManualSelect && (
            <Button variant="outline" size="sm" className="w-full" onClick={onManualSelect}>
              직접 일정 선택하기
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4" />
          추천 시간대
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {confirmedSlot && (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Check className="w-4 h-4" />
                확정된 일정
              </div>
              {isOwner && onCancelConfirm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-6 px-2 text-xs"
                  onClick={onCancelConfirm}
                >
                  취소
                </Button>
              )}
            </div>
            <p className="mt-1 text-sm text-foreground">
              {formatDateKorean(confirmedSlot.date)} {confirmedSlot.startTime} - {confirmedSlot.endTime}
            </p>
          </div>
        )}

        {!confirmedSlot && isOwner && onManualSelect && (
          <Button variant="outline" size="sm" className="w-full" onClick={onManualSelect}>
            직접 일정 선택하기
          </Button>
        )}

        {!confirmedSlot && slots.slice(0, 5).map((slot, idx) => (
          <div key={idx} className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">
                {formatDateKorean(slot.date)}
              </span>
              <span className="text-xs text-primary font-medium">
                {slot.availableCount}명 가능
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {slot.startTime} - {slot.endTime}
            </p>
            {isOwner && onConfirm && (
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => onConfirm(slot)}
              >
                이 시간으로 확정
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
