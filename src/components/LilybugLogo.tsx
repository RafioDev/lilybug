import React from 'react'
import { cn } from '../utils/cn'

interface LilybugLogoProps {
  className?: string
}

export const LilybugLogo: React.FC<LilybugLogoProps> = ({ className = '' }) => {
  return (
    <div className={cn('relative', className)}>
      {/* Light mode logo - hidden in dark mode */}
      <img
        src='/src/images/Lilybug_light.svg'
        alt='Lilybug'
        className='h-full w-auto dark:hidden'
      />

      {/* Dark mode logo - hidden in light mode */}
      <img
        src='/src/images/Lilybug_dark.svg'
        alt='Lilybug'
        className='hidden h-full w-auto dark:block'
      />
    </div>
  )
}
