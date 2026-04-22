'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  selectedDates: string[]
  onChange: (dates: string[]) => void
  maxDays?: number
}

export function DateRangePicker({ selectedDates, onChange, maxDays = 31 }: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<string | null>(null)
  const [baseSelection, setBaseSelection] = useState<string[]>([])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dateLimit = new Date(today)
  dateLimit.setDate(today.getDate() + maxDays - 1)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: Date[] = []

    const startPadding = firstDay.getDay()
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i))
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const formatDateString = (date: Date): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const isSelected = (date: Date): boolean => selectedDates.includes(formatDateString(date))
  const isPastDate = (date: Date): boolean => date < today
  const isBeyondLimit = (date: Date): boolean => date > dateLimit
  const isDisabled = (date: Date): boolean => isPastDate(date) || isBeyondLimit(date)
  const isCurrentMonth = (date: Date): boolean => date.getMonth() === currentMonth.getMonth()

  const canGoPrev = (): boolean => {
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    return currentMonthStart > todayMonthStart
  }

  const canGoNext = (): boolean => {
    const nextMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    return nextMonthStart <= dateLimit
  }

  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) return
    const dateStr = formatDateString(date)
    if (isSelected(date)) {
      onChange(selectedDates.filter(d => d !== dateStr))
    } else {
      if (selectedDates.length >= maxDays) {
        alert(`최대 ${maxDays}일까지만 선택할 수 있습니다.`)
        return
      }
      onChange([...selectedDates, dateStr].sort())
    }
  }

  const handleDragStart = (date: Date) => {
    if (isDisabled(date)) return
    setIsDragging(true)
    setDragStart(formatDateString(date))
    setBaseSelection(selectedDates)
  }

  const handleDragEnter = useCallback((date: Date) => {
    if (!isDragging || !dragStart || isDisabled(date)) return

    const [sy, sm, sd] = dragStart.split('-').map(Number)
    const start = new Date(sy, sm - 1, sd)
    const end = date
    const rangeMin = start < end ? start : end
    const rangeMax = start < end ? end : start

    const dragRange: string[] = []
    const current = new Date(rangeMin)
    while (current <= rangeMax) {
      if (current >= today && current <= dateLimit) {
        dragRange.push(formatDateString(current))
      }
      current.setDate(current.getDate() + 1)
    }

    const merged = Array.from(new Set([...baseSelection, ...dragRange])).sort()
    if (merged.length <= maxDays) {
      onChange(merged)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragStart, baseSelection, maxDays, onChange])

  const handleDragEnd = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div
      className="select-none"
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          disabled={!canGoPrev()}
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-semibold">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </span>
        <Button
          variant="ghost"
          size="icon"
          disabled={!canGoNext()}
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {days.map((date, idx) => {
          const disabled = isDisabled(date)
          const selected = isSelected(date)
          const inMonth = isCurrentMonth(date)

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              className={cn(
                'aspect-square flex items-center justify-center text-sm rounded-md transition-colors',
                !inMonth && 'text-muted-foreground/40',
                disabled && 'text-muted-foreground/30 cursor-not-allowed',
                !disabled && !selected && inMonth && 'hover:bg-muted cursor-pointer',
                selected && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              onClick={() => handleDateClick(date)}
              onMouseDown={() => handleDragStart(date)}
              onMouseEnter={() => handleDragEnter(date)}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {selectedDates.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          {selectedDates.length}일 선택됨 (최대 {maxDays}일)
        </p>
      )}
    </div>
  )
}
