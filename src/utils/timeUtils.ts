import { format } from 'date-fns'

export type TimeFormat = '12h' | '24h'

export const timeUtils = {
  /**
   * Format time based on the user's preference
   */
  formatTime(date: Date, timeFormat: TimeFormat = '12h'): string {
    if (timeFormat === '24h') {
      return format(date, 'HH:mm')
    }
    return format(date, 'h:mm a')
  },

  /**
   * Parse time string to 24-hour format for internal use
   */
  parseTimeString(timeString: string): { hours: number; minutes: number } {
    // Handle both 12h and 24h formats
    const time12hMatch = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (time12hMatch) {
      let hours = parseInt(time12hMatch[1])
      const minutes = parseInt(time12hMatch[2])
      const period = time12hMatch[3].toUpperCase()

      if (period === 'PM' && hours !== 12) {
        hours += 12
      } else if (period === 'AM' && hours === 12) {
        hours = 0
      }

      return { hours, minutes }
    }

    // Handle 24h format
    const time24hMatch = timeString.match(/^(\d{1,2}):(\d{2})$/)
    if (time24hMatch) {
      return {
        hours: parseInt(time24hMatch[1]),
        minutes: parseInt(time24hMatch[2]),
      }
    }

    // Default fallback
    return { hours: 0, minutes: 0 }
  },

  /**
   * Convert 24h time to 12h format
   */
  to12HourFormat(
    hours: number,
    minutes: number
  ): { hours: number; minutes: number; period: 'AM' | 'PM' } {
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours

    return {
      hours: displayHours,
      minutes,
      period,
    }
  },

  /**
   * Convert 12h time to 24h format
   */
  to24HourFormat(
    hours: number,
    minutes: number,
    period: 'AM' | 'PM'
  ): { hours: number; minutes: number } {
    let convertedHours = hours

    if (period === 'PM' && hours !== 12) {
      convertedHours += 12
    } else if (period === 'AM' && hours === 12) {
      convertedHours = 0
    }

    return {
      hours: convertedHours,
      minutes,
    }
  },
}
