import { Header } from '@/components/common/Header'
import { MeetingCreateForm } from '@/components/meeting/MeetingCreateForm'

export default function NewMeetingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">새 모임 만들기</h1>
        <MeetingCreateForm />
      </main>
    </div>
  )
}
