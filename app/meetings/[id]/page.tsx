import { Header } from '@/components/common/Header'
import { MeetingDetail } from '@/components/meeting/MeetingDetail'

interface MeetingDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const { id } = await params
  
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <MeetingDetail meetingUrl={id} />
      </main>
    </div>
  )
}
