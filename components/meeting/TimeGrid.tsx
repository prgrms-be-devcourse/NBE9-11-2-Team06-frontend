'use client'

import { Fragment, useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { ParticipantWithAvailability } from '@/types/meeting'

interface TimeGridProps {
  dates: string[]
  participants: ParticipantWithAvailability[]
  isInputMode: boolean
  isOrganizerPickMode?: boolean
  selectedTimes: Map<string, string[]>
  onTimeSelect?: (date: string, times: string[]) => void
  maxParticipants?: number
  confirmedSlot?: { date: string; startTime: string; endTime: string }
}

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, '0')
  const minutes = i % 2 === 0 ? '00' : '30'
  return `${hours}:${minutes}`
})

type ConfirmedPos = 'first' | 'middle' | 'last' | 'only' | null

export function TimeGrid({
  dates,
  participants,
  isInputMode,
  isOrganizerPickMode = false,
  selectedTimes,
  onTimeSelect,
  maxParticipants = 1,
  confirmedSlot,
}: TimeGridProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ date: string; timeIdx: number } | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ date: string; time: string } | null>(null)
  const [baseTimesForDate, setBaseTimesForDate] = useState<string[]>([])

  const availabilityMap = useMemo(() => {
    const map = new Map<string, { count: number; names: string[] }>()
    for (const participant of participants) {
      for (const availability of participant.availableTimes) {
        for (const time of availability.times) {
          const key = `${availability.date}-${time}`
          const existing = map.get(key) || { count: 0, names: [] }
          existing.count++
          existing.names.push(participant.guest_name || '익명')
          map.set(key, existing)
        }
      }
    }
    return map
  }, [participants])

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr)
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    return {
      display: `${date.getMonth() + 1}/${date.getDate()}`,
      weekday: weekdays[date.getDay()],
    }
  }

  const getIntensityClass = (count: number) => {
    const ratio = count / Math.max(maxParticipants, 1)
    if (ratio >= 0.8) return 'bg-primary'
    if (ratio >= 0.6) return 'bg-primary/80'
    if (ratio >= 0.4) return 'bg-primary/60'
    if (ratio >= 0.2) return 'bg-primary/40'
    return 'bg-primary/20'
  }

  const getConfirmedPos = (date: string, time: string): ConfirmedPos => {
    if (!confirmedSlot || date !== confirmedSlot.date) return null
    const toMins = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }
    const startMins = toMins(confirmedSlot.startTime)
    const endMins = toMins(confirmedSlot.endTime)
    const timeMins = toMins(time)
    if (timeMins < startMins || timeMins >= endMins) return null
    if (startMins + 30 >= endMins) return 'only'
    if (timeMins === startMins) return 'first'
    if (timeMins + 30 >= endMins) return 'last'
    return 'middle'
  }

  const getConfirmedStyle = (pos: ConfirmedPos): React.CSSProperties => {
    if (!pos) return {}
    const b = '2px solid var(--primary)'
    return {
      borderLeft: b,
      borderRight: b,
      borderTop: pos === 'first' || pos === 'only' ? b : 'none',
      borderBottom: pos === 'last' || pos === 'only' ? b : 'none',
    }
  }

  const handleCellClick = (date: string, timeIdx: number) => {
    if (!isInputMode && !isOrganizerPickMode) return
    if (!onTimeSelect) return
    const time = TIME_SLOTS[timeIdx]
    const current = selectedTimes.get(date) || []
    if (current.includes(time)) {
      onTimeSelect(date, current.filter(t => t !== time))
    } else {
      onTimeSelect(date, [...current, time].sort())
    }
  }

  const handleDragStart = (date: string, timeIdx: number) => {
    if (!isInputMode && !isOrganizerPickMode) return
    setIsDragging(true)
    setDragStart({ date, timeIdx })
    setBaseTimesForDate(selectedTimes.get(date) || [])
  }

  const handleDragEnter = useCallback((date: string, timeIdx: number) => {
    if (!isDragging || !dragStart || (!isInputMode && !isOrganizerPickMode) || !onTimeSelect) return
    if (date !== dragStart.date) return
    const minIdx = Math.min(dragStart.timeIdx, timeIdx)
    const maxIdx = Math.max(dragStart.timeIdx, timeIdx)
    const dragRange = TIME_SLOTS.slice(minIdx, maxIdx + 1)
    const merged = Array.from(new Set([...baseTimesForDate, ...dragRange])).sort()
    onTimeSelect(date, merged)
  }, [isDragging, dragStart, isInputMode, isOrganizerPickMode, onTimeSelect, baseTimesForDate])

  const handleDragEnd = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const isTimeSelected = (date: string, time: string) =>
    selectedTimes.get(date)?.includes(time) || false

  const cols = `60px repeat(${dates.length}, minmax(80px, 1fr))`

  return (
    <div
      className="overflow-x-auto"
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div className="min-w-fit">
        {/* 날짜 헤더 */}
        <div className="grid gap-px bg-border" style={{ gridTemplateColumns: cols }}>
          <div className="bg-card" />
          {dates.map(date => {
            const { display, weekday } = formatDateHeader(date)
            return (
              <div key={date} className="bg-card text-center py-2">
                <div className="text-sm font-medium text-foreground">{display}</div>
                <div className="text-xs text-muted-foreground">{weekday}</div>
              </div>
            )
          })}
        </div>

        {/* 시간표 그리드 */}
        <div className="grid gap-px bg-border relative" style={{ gridTemplateColumns: cols }}>
          {TIME_SLOTS.map((time, timeIdx) => {
            const isFullHour = timeIdx % 2 === 0
            return (
              <Fragment key={time}>
                {/* 시간 라벨 */}
                <div className="bg-card h-6 flex items-center justify-end pr-2">
                  {isFullHour && (
                    <span className="text-xs text-muted-foreground">{time}</span>
                  )}
                </div>

                {/* 날짜별 셀 */}
                {dates.map(date => {
                  const key = `${date}-${time}`
                  const availability = availabilityMap.get(key)
                  const isSelected = isTimeSelected(date, time)
                  const isHovered = hoveredCell?.date === date && hoveredCell?.time === time
                  const confirmedPos = getConfirmedPos(date, time)

                  return (
                    <div
                      key={key}
                      className={cn(
                        'bg-card h-6 cursor-pointer transition-colors relative',
                        isFullHour && 'border-t border-border/30',
                        (isInputMode || isOrganizerPickMode) && 'hover:bg-muted',
                        isInputMode && isSelected && 'bg-primary/70',
                        !isInputMode && availability && getIntensityClass(availability.count),
                        isOrganizerPickMode && isSelected && 'ring-2 ring-inset ring-primary z-10',
                      )}
                      style={getConfirmedStyle(confirmedPos)}
                      onClick={() => handleCellClick(date, timeIdx)}
                      onMouseDown={() => handleDragStart(date, timeIdx)}
                      onMouseEnter={() => {
                        handleDragEnter(date, timeIdx)
                        if (availability && !isInputMode) {
                          setHoveredCell({ date, time })
                        }
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {isHovered && availability && !isInputMode && (
                        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap">
                          {availability.names.join(', ')}
                        </div>
                      )}
                    </div>
                  )
                })}
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
