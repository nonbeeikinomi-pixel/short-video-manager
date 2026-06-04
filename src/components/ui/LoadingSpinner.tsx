import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', color = 'border-pink-500', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  return (
    <div
      className={cn(
        'rounded-full border-gray-200 animate-spin',
        sizeClasses[size],
        color,
        className
      )}
      style={{ borderTopColor: 'transparent' }}
    />
  )
}

export function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-400 text-sm">読み込み中...</p>
    </div>
  )
}

export function AiGeneratingState({ message = 'AIが考えています...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        <LoadingSpinner size="lg" color="border-purple-500" />
        <span className="absolute inset-0 flex items-center justify-center text-xl">✨</span>
      </div>
      <div className="text-center">
        <p className="text-gray-700 font-medium">{message}</p>
        <p className="text-gray-400 text-xs mt-1">少々お待ちください</p>
      </div>
    </div>
  )
}
