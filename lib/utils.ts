import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function copyMeetingLink(roomUrl: string, title: string) {
  const fullUrl = `${window.location.origin}/meetings/${roomUrl}`
  const text = `"${title}" 일정 조율에 참여해 주세요:\n${fullUrl}`
  navigator.clipboard.writeText(text)
  alert('링크가 복사되었습니다!')
}
