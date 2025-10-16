import React from 'react'

/**
 * ButtonGroup component for organizing related buttons with consistent spacing and layout.
 *
 * @example
 * // Horizontal button group (default)
 * <ButtonGroup>
 *   <Button variant="primary">Save</Button>
 *   <Button variant="outline">Cancel</Button>
 * </ButtonGroup>
 *
 * @example
 * // Vertical button group
 * <ButtonGroup orientation="vertical">
 *   <Button variant="primary">Option 1</Button>
 *   <Button variant="outline">Option 2</Button>
 * </ButtonGroup>
 *
 * @example
 * // Action buttons with icons (responsive)
 * <ActionButtonGroup>
 *   <IconButton icon={<Edit />} aria-label="Edit" />
 *   <IconButton icon={<Trash />} aria-label="Delete" />
 * </ActionButtonGroup>
 */

interface ButtonGroupProps {
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'sm' | 'md' | 'lg'
  className?: string
  responsive?: boolean // Automatically stack on mobile
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'md',
  className = '',
  responsive = true,
}) => {
  // Spacing configurations for different orientations
  const spacingStyles = {
    horizontal: {
      sm: 'gap-2', // 8px
      md: 'gap-3', // 12px
      lg: 'gap-4', // 16px
    },
    vertical: {
      sm: 'gap-2', // 8px
      md: 'gap-3', // 12px
      lg: 'gap-4', // 16px
    },
  }

  // Base styles for the button group container
  const baseStyles = 'inline-flex'

  // Orientation styles
  const orientationStyles = {
    horizontal: 'flex-row items-center',
    vertical: 'flex-col items-stretch',
  }

  // Responsive behavior - stack horizontally on mobile if responsive is true
  const responsiveStyles =
    responsive && orientation === 'horizontal'
      ? 'flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3'
      : `${orientationStyles[orientation]} ${spacingStyles[orientation][spacing]}`

  // Combine all styles
  const groupStyles = `${baseStyles} ${responsiveStyles} ${className}`

  // Process children to ensure proper button group behavior
  const processedChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) {
      return child
    }

    // Type-safe props handling
    const childProps = child.props as Record<string, unknown>
    const additionalProps: Record<string, unknown> = {
      // Add data attribute to identify buttons within a group
      'data-button-group-item': true,
      'data-button-group-index': index,
    }

    // Ensure buttons in vertical groups are full width unless explicitly set
    if (orientation === 'vertical' && !childProps.fullWidth) {
      additionalProps.fullWidth = true
    }

    // Clone child with additional props for button group context
    return React.cloneElement(child, {
      ...childProps,
      ...additionalProps,
    })
  })

  return (
    <div className={groupStyles} role='group' aria-label='Button group'>
      {processedChildren}
    </div>
  )
}

// Utility component for common button group patterns
export const ActionButtonGroup: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <ButtonGroup
    orientation='horizontal'
    spacing='md'
    responsive={true}
    className={className}
  >
    {children}
  </ButtonGroup>
)

// Utility component for form button groups (typically Cancel/Submit)
export const FormButtonGroup: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <ButtonGroup
    orientation='horizontal'
    spacing='md'
    responsive={true}
    className={`justify-end ${className}`}
  >
    {children}
  </ButtonGroup>
)

// Utility component for toolbar-style button groups
export const ToolbarButtonGroup: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <ButtonGroup
    orientation='horizontal'
    spacing='sm'
    responsive={false}
    className={className}
  >
    {children}
  </ButtonGroup>
)
