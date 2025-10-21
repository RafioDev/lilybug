import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { FloatingActionButton } from './FloatingActionButton'
import { cn } from '../utils/cn'
import type { QuickAction } from './fabUtils'

export interface ExpandableFABProps {
  // Primary FAB props
  primaryIcon?: React.ReactNode
  primaryLabel: string
  onPrimaryAction?: () => void

  // Quick actions
  quickActions?: QuickAction[]

  // Positioning
  position?: {
    bottom?: string
    right?: string
    left?: string
    top?: string
  }

  // State control
  isExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void

  // Styling
  className?: string

  // Accessibility
  'aria-label'?: string
}

export const ExpandableFAB = React.memo<ExpandableFABProps>(
  ({
    primaryIcon = <Plus className='h-6 w-6' />,
    primaryLabel,
    onPrimaryAction,
    quickActions = [],
    position = { bottom: '1.5rem', right: '1.5rem' },
    isExpanded: controlledExpanded,
    onExpandedChange,
    className = '',
    'aria-label': ariaLabel,
  }) => {
    // Internal state for expansion (used when not controlled)
    const [internalExpanded, setInternalExpanded] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Determine if component is controlled
    const isControlled = controlledExpanded !== undefined
    const isExpanded = isControlled ? controlledExpanded : internalExpanded

    // Handle expansion state changes
    const setExpanded = useCallback(
      (expanded: boolean) => {
        if (isControlled) {
          onExpandedChange?.(expanded)
        } else {
          setInternalExpanded(expanded)
        }
      },
      [isControlled, onExpandedChange]
    )

    // Toggle expansion
    const toggleExpanded = useCallback(() => {
      setExpanded(!isExpanded)
    }, [isExpanded, setExpanded])

    // Handle primary action
    const handlePrimaryAction = useCallback(() => {
      if (onPrimaryAction) {
        onPrimaryAction()
      } else {
        // Default behavior: toggle expansion
        toggleExpanded()
      }
    }, [onPrimaryAction, toggleExpanded])

    // Handle quick action
    const handleQuickAction = useCallback(
      (action: QuickAction) => {
        action.action()
        // Close the FAB after action
        setExpanded(false)
      },
      [setExpanded]
    )

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          isExpanded &&
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setExpanded(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isExpanded, setExpanded])

    // Close on escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isExpanded) {
          setExpanded(false)
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }, [isExpanded, setExpanded])

    // Calculate positions for secondary FABs in arc pattern
    const getSecondaryFABPosition = useCallback(
      (index: number, total: number) => {
        // Arc configuration
        const radius = 80 // Distance from primary FAB
        const arcAngle = 90 // Total arc angle in degrees
        const startAngle = 90 // Start angle (pointing up)

        // Calculate angle for this FAB
        const angleStep = total > 1 ? arcAngle / (total - 1) : 0
        const angle = startAngle + index * angleStep
        const radians = (angle * Math.PI) / 180

        // Calculate position
        const x = Math.cos(radians) * radius
        const y = Math.sin(radians) * radius

        return {
          transform: `translate(${-x}px, ${-y}px)`,
          transitionDelay: `${index * 50}ms`,
        }
      },
      []
    )

    // Build position styles for container
    const positionStyles: React.CSSProperties = {}
    if (position.bottom) positionStyles.bottom = position.bottom
    if (position.right) positionStyles.right = position.right
    if (position.left) positionStyles.left = position.left
    if (position.top) positionStyles.top = position.top

    return (
      <div
        ref={containerRef}
        className={cn('fixed z-50', className)}
        style={positionStyles}
        role='group'
        aria-label={ariaLabel || 'Quick actions menu'}
      >
        {/* Secondary FABs */}
        {quickActions.map((action, index) => (
          <div
            key={action.id}
            className={cn(
              'absolute transition-all duration-300 ease-out',
              isExpanded
                ? 'pointer-events-auto scale-100 opacity-100'
                : 'pointer-events-none scale-75 opacity-0'
            )}
            style={
              isExpanded
                ? getSecondaryFABPosition(index, quickActions.length)
                : { transform: 'translate(0, 0)' }
            }
          >
            <FloatingActionButton
              icon={action.icon}
              variant={action.color}
              size='sm'
              onClick={() => handleQuickAction(action)}
              aria-label={action.label}
              position={{ bottom: '0', right: '0' }}
              className='relative'
              animate={false}
            />

            {/* Tooltip */}
            <div
              className={cn(
                'absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white transition-all duration-200 dark:bg-gray-100 dark:text-gray-900',
                isExpanded
                  ? 'scale-100 opacity-100'
                  : 'pointer-events-none scale-75 opacity-0'
              )}
              style={{
                transitionDelay: isExpanded ? `${(index + 1) * 100}ms` : '0ms',
              }}
            >
              {action.label}
              <div className='absolute top-1/2 left-full -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-100' />
            </div>
          </div>
        ))}

        {/* Primary FAB */}
        <FloatingActionButton
          icon={isExpanded ? <X className='h-6 w-6' /> : primaryIcon}
          variant='primary'
          size='lg'
          onClick={handlePrimaryAction}
          aria-label={isExpanded ? 'Close quick actions' : primaryLabel}
          aria-expanded={isExpanded}
          aria-haspopup='menu'
          position={{ bottom: '0', right: '0' }}
          className={cn(
            'relative transition-transform duration-300',
            isExpanded && 'rotate-45'
          )}
          animate={!isExpanded}
        />

        {/* Backdrop overlay when expanded */}
        {isExpanded && (
          <div
            className='fixed inset-0 -z-10 bg-black/20 dark:bg-black/40'
            onClick={() => setExpanded(false)}
            aria-hidden='true'
          />
        )}
      </div>
    )
  }
)

ExpandableFAB.displayName = 'ExpandableFAB'

// Export default
export default ExpandableFAB
