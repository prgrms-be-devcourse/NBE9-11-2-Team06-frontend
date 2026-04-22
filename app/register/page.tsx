import { Logo } from '@/components/common/Logo'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Logo size="lg" href={undefined} />
      </div>
      
      <RegisterForm />
    </main>
  )
}
