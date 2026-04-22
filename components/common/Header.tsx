'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Logo } from './Logo'
import { Button } from '@/components/ui/button'
import { logout, getSession } from '@/lib/api/auth'
import type { AuthSession } from '@/types/auth'

interface HeaderProps {
  showAuth?: boolean
}

export function Header({ showAuth = true }: HeaderProps) {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession>({ isAuthenticated: false, user: null })

  useEffect(() => {
    setSession(getSession())
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo href="/meetings" />

        <div className="flex items-center gap-4">
          {showAuth && session.isAuthenticated && (
            <>
              <span className="text-sm text-muted-foreground">
                {session.user?.nickname}
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
