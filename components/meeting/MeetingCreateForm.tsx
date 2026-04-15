'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { DateRangePicker } from './DateRangePicker'
import { createMeeting } from '@/lib/api/meeting'
import { getSession } from '@/lib/api/auth'
import { MEETING_CATEGORIES, DURATION_OPTIONS } from '@/types/meeting'

export function MeetingCreateForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [duration, setDuration] = useState<number>(60)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('모임 제목을 입력해주세요.')
      return
    }

    if (!category) {
      setError('카테고리를 선택해주세요.')
      return
    }

    if (selectedDates.length === 0) {
      setError('최소 1개 이상의 날짜를 선택해주세요.')
      return
    }

    const session = getSession()
    if (!session.isAuthenticated || !session.member) {
      router.push('/login')
      return
    }

    setIsLoading(true)

    try {
      await createMeeting({
        title: title.trim(),
        category,
        dates: selectedDates,
        duration,
      }, session.member.member_id)

      router.push('/meetings')
    } catch {
      setError('모임 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">모임 제목</Label>
            <Input
              id="title"
              placeholder="예: 팀 프로젝트 회의"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label>카테고리</Label>
            <Select value={category} onValueChange={setCategory} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {MEETING_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>진행 시간</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>날짜 선택</CardTitle>
          <p className="text-sm text-muted-foreground">
            가능한 날짜들을 클릭하거나 드래그해서 선택하세요 (최대 31일)
          </p>
        </CardHeader>
        <CardContent>
          <DateRangePicker
            selectedDates={selectedDates}
            onChange={setSelectedDates}
            maxDays={31}
          />
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          취소
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? <Spinner className="w-4 h-4 mr-2" /> : null}
          모임 생성
        </Button>
      </div>
    </form>
  )
}
