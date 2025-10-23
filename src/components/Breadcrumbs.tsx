import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'

interface BreadcrumbItemType {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  className?: string
}

const getBreadcrumbs = (pathname: string): BreadcrumbItemType[] => {
  const breadcrumbs: BreadcrumbItemType[] = []

  // Always start with Activities as the home
  breadcrumbs.push({ label: 'Activities', path: '/' })

  // Add specific breadcrumbs based on path
  if (pathname === '/settings') {
    breadcrumbs.push({ label: 'Settings' })
  }

  return breadcrumbs
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className = '' }) => {
  const location = useLocation()
  const breadcrumbs = getBreadcrumbs(location.pathname)

  // Always show breadcrumbs, but style differently based on context
  const showFullBreadcrumbs = breadcrumbs.length > 1

  if (showFullBreadcrumbs) {
    // Show full breadcrumb navigation when not on root page
    return (
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1

            return (
              <React.Fragment key={breadcrumb.label}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className='text-base font-bold text-gray-800 sm:text-xl dark:text-gray-100'>
                      {breadcrumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={breadcrumb.path!}
                        className='text-base font-bold text-gray-600 transition-colors hover:text-gray-900 sm:text-xl dark:text-gray-400 dark:hover:text-gray-100'
                      >
                        {breadcrumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    )
  } else {
    // Show just the page title when on root page (Activities)
    return (
      <h1
        className={`text-base font-bold text-gray-800 sm:text-xl dark:text-gray-100 ${className}`}
      >
        {breadcrumbs[0]?.label || 'Activities'}
      </h1>
    )
  }
}
