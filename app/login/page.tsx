import { Logo } from '@/components/common/Logo'
import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Logo size="lg" href={undefined} />
      </div>
      
      <LoginForm />
      
      <p className="mt-8 text-sm text-muted-foreground text-center">
        모임 참여만 하시려면 로그인 없이{' '}
        <span className="text-primary font-medium">
          초대 링크
        </span>
        로 접속하세요
      </p>
    </main>
  )
}
