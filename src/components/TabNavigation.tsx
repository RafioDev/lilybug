import React, { useRef, useLayoutEffect, useState } from 'react'
import { cn } from '../utils/cn'

export interface TabConfig {
  id: string
  label: string
  component: React.ComponentType
  icon?: React.ComponentType<{ className?: string }>
  'aria-label'?: string // Optional custom aria-label for accessibility
}

interface TabNavigationProps {
  tabs: TabConfig[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
  'aria-label'?: string // Custom aria-label for the tab list
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  'aria-label': ariaLabel = 'Navigation tabs',
}) => {
  const tabsRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<{
    width: number
    left: number
  }>({ width: 0, left: 0 })

  // Update indicator position when active tab changes using layoutEffect
  // to avoid visual flicker and ensure DOM measurements are accurate
  useLayoutEffect(() => {
    const updateIndicator = () => {
      if (tabsRef.current) {
        const activeTabElement = tabsRef.current.querySelector(
          `[data-tab-id="${activeTab}"]`
        ) as HTMLButtonElement

        if (activeTabElement) {
          const { offsetLeft, offsetWidth } = activeTabElement
          setIndicatorStyle({
            left: offsetLeft,
            width: offsetWidth,
          })
        }
      }
    }

    // Update immediately
    updateIndicator()

    // Handle window resize
    const handleResize = () => {
      updateIndicator()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTab, tabs])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === tabId)
    let nextIndex = currentIndex

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
        break
      case 'ArrowRight':
        event.preventDefault()
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
        break
      case 'Home':
        event.preventDefault()
        nextIndex = 0
        break
      case 'End':
        event.preventDefault()
        nextIndex = tabs.length - 1
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onTabChange(tabId)
        return
      default:
        return
    }

    const nextTab = tabs[nextIndex]
    if (nextTab) {
      onTabChange(nextTab.id)
      // Focus the next tab button
      const nextTabElement = tabsRef.current?.querySelector(
        `[data-tab-id="${nextTab.id}"]`
      ) as HTMLButtonElement
      nextTabElement?.focus()
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        ref={tabsRef}
        role='tablist'
        className='relative flex overflow-hidden rounded-xl bg-gray-100 p-1 dark:bg-gray-800'
        aria-label={ariaLabel}
      >
        {/* Animated indicator */}
        <div
          className='absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-out dark:bg-gray-700'
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
          aria-hidden='true'
        />

        {/* Tab buttons */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              role='tab'
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              aria-label={tab['aria-label'] || `${tab.label} tab`}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                'relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800',
                'min-h-[44px]', // Touch-friendly minimum height
                isActive
                  ? 'z-10 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
            >
              {Icon && (
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors duration-200',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-500'
                  )}
                />
              )}
              <span className='truncate'>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
