'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Copy } from 'lucide-react'
import { Logo } from './Logo'
import { Button } from '@/components/ui/button'
import { logout, getSession } from '@/lib/api/auth'
import type { AuthSession } from '@/types/auth'

interface HeaderProps {
  showAuth?: boolean
  showCopyLink?: boolean
  copyLinkUrl?: string
}

export function Header({ showAuth = true, showCopyLink = false, copyLinkUrl }: HeaderProps) {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession>({ isAuthenticated: false, member: null })

  useEffect(() => {
    setSession(getSession())
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleCopyLink = () => {
    if (copyLinkUrl) {
      const fullUrl = `${window.location.origin}/meetings/${copyLinkUrl}`
      navigator.clipboard.writeText(fullUrl)
      alert('링크가 복사되었습니다!')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo href="/meetings" />
        
        <div className="flex items-center gap-4">
          {showCopyLink && copyLinkUrl && (
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="w-4 h-4 mr-2" />
              링크 복사
            </Button>
          )}
          
          {showAuth && session.isAuthenticated && (
            <>
              <span className="text-sm text-muted-foreground">
                {session.member?.nickname || session.member?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
