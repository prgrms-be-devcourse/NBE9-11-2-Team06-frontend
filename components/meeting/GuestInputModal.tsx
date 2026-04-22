'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

interface GuestInputModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, password: string) => Promise<void>
  mode: 'create' | 'verify' | 'delete'
}

export function GuestInputModal({ isOpen, onClose, onSubmit, mode }: GuestInputModalProps) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }

    if (name.length > 15) {
      setError('이름은 15자 이하로 입력해주세요.')
      return
    }

    if (!/^\d{4}$/.test(password)) {
      setError('비밀번호는 숫자 4자리로 입력해주세요.')
      return
    }

    setIsLoading(true)

    try {
      await onSubmit(name.trim(), password)
      setName('')
      setPassword('')
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(message || (mode === 'create' ? '저장에 실패했습니다.' : '이름 또는 비밀번호가 올바르지 않습니다.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '일정 저장' : mode === 'delete' ? '내 일정 삭제' : '일정 수정'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? '이름과 비밀번호를 입력하여 일정을 저장하세요. 비밀번호는 수정 시 필요합니다.'
              : mode === 'delete'
              ? '삭제할 일정의 이름과 등록 시 입력한 비밀번호를 입력하세요.'
              : '일정을 수정하려면 등록 시 입력한 이름과 비밀번호를 입력하세요.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName">이름</Label>
            <Input
              id="guestName"
              placeholder="이름 (최대 15자)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              maxLength={15}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestPassword">비밀번호</Label>
            <Input
              id="guestPassword"
              type="password"
              placeholder="숫자 4자리"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
              disabled={isLoading}
              maxLength={4}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? <Spinner className="w-4 h-4 mr-2" /> : null}
              {mode === 'create' ? '저장' : mode === 'delete' ? '삭제' : '확인'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
