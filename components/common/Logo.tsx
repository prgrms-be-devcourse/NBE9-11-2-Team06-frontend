import Link from 'next/link'
import { CalendarCheck } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  href?: string
}

export function Logo({ size = 'md', showText = true, href = '/' }: LogoProps) {
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', iconSize: 18 },
    md: { icon: 'w-10 h-10', text: 'text-xl', iconSize: 22 },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', iconSize: 28 },
  }

  const { icon, text, iconSize } = sizeClasses[size]

  const content = (
    <div className="flex items-center gap-2">
      <div className={`${icon} bg-primary rounded-lg flex items-center justify-center`}>
        <CalendarCheck size={iconSize} className="text-primary-foreground" />
      </div>
      {showText && (
        <span className={`${text} font-bold text-foreground`}>약속잡조</span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
