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
}
