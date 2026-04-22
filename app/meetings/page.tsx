import { Header } from '@/components/common/Header'
import { MeetingList } from '@/components/meeting/MeetingList'

export default function MeetingsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <MeetingList />
      </main>
    </div>
  )
}
