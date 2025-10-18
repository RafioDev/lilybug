/**
 * Utility functions for handling dates, especially birthdate calculations
 * that avoid timezone issues with date-only strings
 */

export const dateUtils = {
  /**
   * Format a birthdate string for display, avoiding timezone issues
   */
  formatBirthdate(birthdate: string): string {
    // Add time to avoid timezone issues with date-only strings
    return new Date(birthdate + 'T00:00:00').toLocaleDateString()
  },

  /**
   * Calculate age from birthdate string, avoiding timezone issues
   */
  calculateAge(birthdate: string): string {
    // Add time to avoid timezone issues with date-only strings
    const birth = new Date(birthdate + 'T00:00:00')
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - birth.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays}d`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months}m`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      return `${years}y ${remainingMonths}m`
    }
  },

  /**
   * Calculate detailed age for display (e.g., "6 days old", "2 months old")
   */
  calculateDetailedAge(birthdate: string): string {
    // Add time to avoid timezone issues with date-only strings
    const birth = new Date(birthdate + 'T00:00:00')
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - birth.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} days old`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''} old`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      return `${years} year${years > 1 ? 's' : ''} ${
        remainingMonths > 0
          ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
          : ''
      } old`
    }
  },

  /**
   * Create a safe date object from a date-only string
   */
  createSafeDate(dateString: string): Date {
    return new Date(dateString + 'T00:00:00')
  },

  /**
   * Calculate duration between two timestamps in minutes
   */
  calculateDurationMinutes(startTime: string, endTime: string): number {
    const start = new Date(startTime)
    const end = new Date(endTime)
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  },

  /**
   * Format duration in minutes to human-readable string
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
      return `${hours}h`
    }

    return `${hours}h ${remainingMinutes}m`
  },

  /**
   * Calculate and format duration from start and end timestamps
   */
  calculateAndFormatDuration(
    startTime: string,
    endTime?: string | null
  ): string | null {
    if (!endTime) return null

    const minutes = this.calculateDurationMinutes(startTime, endTime)
    return this.formatDuration(minutes)
  },

  /**
   * Format relative time (e.g., "2h ago", "30m ago", "yesterday")
   */
  formatRelativeTime(timestamp: string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) {
      return 'just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays === 1) {
      return 'yesterday'
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  },

  /**
   * Format quantity with appropriate units
   */
  formatQuantity(quantity: number, entryType: string): string {
    if (entryType === 'pumping') {
      return `${quantity}oz`
    } else if (entryType === 'feeding') {
      return `${quantity}ml`
    }
    return quantity.toString()
  },

  /**
   * Get current local datetime formatted for datetime-local input
   * This avoids timezone issues by using local time components directly
   */
  getCurrentLocalDateTime(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  },

  /**
   * Convert a Date object or timestamp to datetime-local format
   * This preserves the local time representation for datetime-local inputs
   */
  toLocalDateTimeString(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  },
}
