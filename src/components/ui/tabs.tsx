import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '../../utils/cn'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-xl bg-gray-100 p-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:focus-visible:ring-offset-gray-800 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// Animated Tabs Components
interface AnimatedTabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: 'default' | 'underline'
}

const AnimatedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  AnimatedTabsListProps
>(({ className, variant = 'default', ...props }, ref) => {
  const [activeTabRect, setActiveTabRect] = React.useState<DOMRect | null>(null)
  const [listRect, setListRect] = React.useState<DOMRect | null>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const updateActiveTabPosition = () => {
      if (!listRef.current) return

      const activeTab = listRef.current.querySelector(
        '[data-state="active"]'
      ) as HTMLElement
      const list = listRef.current

      if (activeTab && list) {
        setActiveTabRect(activeTab.getBoundingClientRect())
        setListRect(list.getBoundingClientRect())
      }
    }

    // Initial position
    updateActiveTabPosition()

    // Update on tab changes
    const observer = new MutationObserver(updateActiveTabPosition)
    if (listRef.current) {
      observer.observe(listRef.current, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-state'],
      })
    }

    // Update on resize
    window.addEventListener('resize', updateActiveTabPosition)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateActiveTabPosition)
    }
  }, [])

  const indicatorStyle = React.useMemo(() => {
    if (!activeTabRect || !listRect) return { opacity: 0 }

    const left = activeTabRect.left - listRect.left
    const width = activeTabRect.width

    return {
      left: `${left}px`,
      width: `${width}px`,
      opacity: 1,
    }
  }, [activeTabRect, listRect])

  if (variant === 'underline') {
    return (
      <div className='relative'>
        <TabsPrimitive.List
          ref={(node) => {
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
            listRef.current = node
          }}
          className={cn(
            'relative inline-flex items-center justify-start bg-transparent p-0',
            className
          )}
          {...props}
        />
        {/* Background underline */}
        <div className='bg-border absolute right-0 bottom-0 left-0 h-px' />
        {/* Active tab background - rounded top only */}
        <div
          className='bg-background border-border/50 absolute top-1 bottom-1 rounded-t-xl border shadow-sm transition-all duration-300 ease-out'
          style={indicatorStyle}
        />
        {/* Active underline - thicker and more prominent with gradient */}
        <div
          className='absolute bottom-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out'
          style={indicatorStyle}
        />
      </div>
    )
  }

  return (
    <div className='relative'>
      <TabsPrimitive.List
        ref={(node) => {
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
          listRef.current = node
        }}
        className={cn(
          'bg-muted text-muted-foreground inline-flex items-center justify-center rounded-xl p-1',
          className
        )}
        {...props}
      />
      <div
        className='bg-background absolute top-1 bottom-1 rounded-lg shadow-sm transition-all duration-300 ease-out'
        style={indicatorStyle}
      />
    </div>
  )
})
AnimatedTabsList.displayName = 'AnimatedTabsList'

interface AnimatedTabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  variant?: 'default' | 'underline'
}

const AnimatedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  AnimatedTabsTriggerProps
>(({ className, variant = 'default', ...props }, ref) => {
  if (variant === 'underline') {
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          'focus-visible:ring-ring text-muted-foreground data-[state=active]:text-primary hover:text-foreground relative z-10 inline-flex cursor-pointer items-center justify-center px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:font-semibold',
          className
        )}
        {...props}
      />
    )
  }

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'focus-visible:ring-ring data-[state=active]:text-foreground hover:text-foreground relative z-10 inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
})
AnimatedTabsTrigger.displayName = 'AnimatedTabsTrigger'

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-gray-800',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AnimatedTabsList,
  AnimatedTabsTrigger,
}
