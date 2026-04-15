import { Spinner } from '@/components/ui/spinner'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = '로딩 중...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Spinner className="w-8 h-8 text-primary mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
