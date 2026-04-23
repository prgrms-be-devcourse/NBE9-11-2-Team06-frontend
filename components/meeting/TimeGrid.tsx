'use client'

import { Fragment, useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { ParticipantSchedule } from '@/types/meeting'

interface TimeGridProps {
  dates: string[]
  participants: ParticipantSchedule[]
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

function expandTimeRange(startTime: string, endTime: string): string[] {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const slots: string[] = []
  let current = sh * 60 + sm
  // 백엔드 toRanges는 마지막 슬롯(23:30)에 +30분 = 00:00(자정)으로 endTime을 계산.
  // 00:00을 0분으로 해석하면 루프가 동작하지 않으므로 1440분(24시간)으로 처리.
  const end = (eh === 0 && em === 0) ? 24 * 60 : eh * 60 + em
  while (current < end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0')
    const m = (current % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
    current += 30
  }
  return slots
}

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
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const [baseTimesForDate, setBaseTimesForDate] = useState<string[]>([])

  const availabilityMap = useMemo(() => {
    const map = new Map<string, { count: number; names: string[] }>()
    for (const participant of participants) {
      for (const range of participant.availableTimeRanges) {
        const slots = expandTimeRange(range.startTime, range.endTime)
        for (const time of slots) {
          const key = `${range.date}-${time}`
          const existing = map.get(key) || { count: 0, names: [] }
          existing.count++
          existing.names.push(participant.name)
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
    const b = '2px solid #14532d'
    return {
      backgroundColor: '#14532d',
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
  <>
    <div
      className="overflow-x-auto"
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div className="min-w-fit">
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

        <div className="grid gap-px bg-border relative" style={{ gridTemplateColumns: cols }}>
          {TIME_SLOTS.map((time, timeIdx) => {
            const isFullHour = timeIdx % 2 === 0
            return (
              <Fragment key={time}>
                <div className="bg-card h-6 flex items-center justify-end pr-2">
                  {isFullHour && (
                    <span className="text-xs text-muted-foreground">{time}</span>
                  )}
                </div>

                {dates.map(date => {
                  const key = `${date}-${time}`
                  const availability = availabilityMap.get(key)
                  const isSelected = isTimeSelected(date, time)
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
                        isOrganizerPickMode && isSelected && 'ring-2 ring-inset ring-yellow-400 bg-yellow-200 z-10',
                      )}
                      style={getConfirmedStyle(confirmedPos)}
                      onClick={() => handleCellClick(date, timeIdx)}
                      onMouseDown={() => handleDragStart(date, timeIdx)}
                      onMouseEnter={(e) => {
                        handleDragEnter(date, timeIdx)
                        if (availability && !isInputMode) {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setHoveredCell({ date, time })
                          setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
                        }
                      }}
                      onMouseLeave={() => { setHoveredCell(null); setTooltipPos(null) }}
                    >
                    </div>
                  )
                })}
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>

    {hoveredCell && tooltipPos && (() => {
      const availability = availabilityMap.get(`${hoveredCell.date}-${hoveredCell.time}`)
      if (!availability) return null
      return (
        <div
          className="fixed z-50 px-2 py-1 bg-foreground text-background text-xs rounded pointer-events-none"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 8, transform: 'translate(-50%, -100%)' }}
        >
          {availability.names.map(name => (
            <div key={name}>{name}</div>
          ))}
        </div>
      )
    })()}
  </>
  )
}
