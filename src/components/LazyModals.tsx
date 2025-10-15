import { lazy } from 'react'

// Lazy load modal components to reduce initial bundle size
export const BabyModal = lazy(() =>
  import('./BabyModal').then((module) => ({ default: module.BabyModal }))
)
export const ActivityModal = lazy(() =>
  import('./ActivityModal').then((module) => ({
    default: module.ActivityModal,
  }))
)
