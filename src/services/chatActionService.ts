import { trackerService } from './trackerService'
import type {
  EntryType,
  FeedingType,
  DiaperType,
  NewTrackerEntry,
} from '../types'

export interface ChatAction {
  type: 'create_entry' | 'start_timer' | 'stop_timer' | 'search' | 'none'
  entryType?: EntryType
  feedingType?: FeedingType
  diaperType?: DiaperType
  quantity?: number
  duration?: number
  notes?: string
  startTime?: Date
  endTime?: Date
}

export const chatActionService = {
  parseActionFromMessage(message: string): ChatAction {
    const lowerMessage = message.toLowerCase()

    // Check for timer actions
    if (
      lowerMessage.includes('start') &&
      (lowerMessage.includes('timer') || lowerMessage.includes('feeding'))
    ) {
      return this.parseTimerStart(lowerMessage)
    }

    if (
      lowerMessage.includes('stop') &&
      (lowerMessage.includes('timer') || lowerMessage.includes('feeding'))
    ) {
      return { type: 'stop_timer' }
    }

    // Check for direct entry creation
    if (this.isCreateEntryCommand(lowerMessage)) {
      return this.parseCreateEntry(lowerMessage)
    }

    // Default to search if no action detected
    return { type: 'search' }
  },

  isCreateEntryCommand(message: string): boolean {
    const createKeywords = [
      'log',
      'record',
      'add',
      'create',
      'track',
      'had a',
      'just',
      'finished',
      'completed',
      'done with',
    ]
    const entryKeywords = [
      'feeding',
      'feed',
      'ate',
      'drank',
      'sleep',
      'nap',
      'slept',
      'diaper',
      'poop',
      'wet',
      'dirty',
      'changed',
    ]

    const hasCreateKeyword = createKeywords.some((keyword) =>
      message.includes(keyword)
    )
    const hasEntryKeyword = entryKeywords.some((keyword) =>
      message.includes(keyword)
    )

    // Also detect implicit creation patterns like "Quinn had 120ml" or "bottle feeding 30 minutes ago"
    const implicitPatterns = [
      /\d+\s*(ml|oz|ounce)/i, // Contains quantity
      /\d+\s*(hour|minute)s?\s*ago/i, // Contains time reference
      /(bottle|breast|feeding|sleep|nap|diaper)\s+(of|for|at)/i, // Pattern like "bottle of 120ml"
    ]

    const hasImplicitPattern = implicitPatterns.some((pattern) =>
      pattern.test(message)
    )

    return (hasCreateKeyword && hasEntryKeyword) || hasImplicitPattern
  },

  parseTimerStart(message: string): ChatAction {
    let feedingType: FeedingType = 'bottle'

    if (message.includes('left breast') || message.includes('left side')) {
      feedingType = 'breast_left'
    } else if (
      message.includes('right breast') ||
      message.includes('right side')
    ) {
      feedingType = 'breast_right'
    } else if (
      message.includes('both breast') ||
      message.includes('both sides')
    ) {
      feedingType = 'both'
    } else if (message.includes('bottle')) {
      feedingType = 'bottle'
    } else if (message.includes('breast') || message.includes('nursing')) {
      feedingType = 'breast_left' // Default to left if not specified
    }

    return {
      type: 'start_timer',
      entryType: 'feeding',
      feedingType,
    }
  },

  parseCreateEntry(message: string): ChatAction {
    const action: ChatAction = { type: 'create_entry' }

    // Determine entry type
    if (message.includes('sleep') || message.includes('nap')) {
      action.entryType = 'sleep'
      action.duration = this.extractDuration(message)
    } else if (
      message.includes('feeding') ||
      message.includes('feed') ||
      message.includes('ate') ||
      message.includes('drank')
    ) {
      action.entryType = 'feeding'
      action.feedingType = this.extractFeedingType(message)
      action.quantity = this.extractQuantity(message)
    } else if (
      message.includes('diaper') ||
      message.includes('poop') ||
      message.includes('wet') ||
      message.includes('dirty')
    ) {
      action.entryType = 'diaper'
      action.diaperType = this.extractDiaperType(message)
    }

    // Extract time information
    const timeInfo = this.extractTimeInfo(message)
    if (timeInfo.startTime) action.startTime = timeInfo.startTime
    if (timeInfo.endTime) action.endTime = timeInfo.endTime

    // Extract notes
    action.notes = this.extractNotes(message)

    return action
  },

  extractFeedingType(message: string): FeedingType {
    if (message.includes('left breast') || message.includes('left side')) {
      return 'breast_left'
    } else if (
      message.includes('right breast') ||
      message.includes('right side')
    ) {
      return 'breast_right'
    } else if (
      message.includes('both breast') ||
      message.includes('both sides')
    ) {
      return 'both'
    } else if (message.includes('bottle')) {
      return 'bottle'
    } else if (message.includes('breast') || message.includes('nursing')) {
      return 'breast_left'
    }
    return 'bottle'
  },

  extractDiaperType(message: string): DiaperType {
    if (message.includes('dirty') && message.includes('wet')) {
      return 'both'
    } else if (message.includes('dirty') || message.includes('poop')) {
      return 'dirty'
    } else if (message.includes('wet')) {
      return 'wet'
    }
    return 'wet'
  },

  extractQuantity(message: string): number | undefined {
    // Look for patterns like "120ml", "4oz", "4 oz", "120 ml"
    const mlMatch = message.match(/(\d+)\s*ml/i)
    if (mlMatch) return parseInt(mlMatch[1])

    const ozMatch = message.match(/(\d+(?:\.\d+)?)\s*oz/i)
    if (ozMatch) return Math.round(parseFloat(ozMatch[1]) * 29.5735) // Convert oz to ml

    // Look for standalone numbers that might be quantities
    const numberMatch = message.match(/(\d+)\s*(milliliters?|ounces?)?/i)
    if (
      numberMatch &&
      parseInt(numberMatch[1]) > 10 &&
      parseInt(numberMatch[1]) < 500
    ) {
      return parseInt(numberMatch[1])
    }

    return undefined
  },

  extractDuration(message: string): number | undefined {
    // Look for patterns like "2 hours", "30 minutes", "1h 30m"
    const hourMinuteMatch = message.match(
      /(\d+)\s*h(?:ours?)?\s*(?:and\s*)?(\d+)\s*m(?:inutes?)?/i
    )
    if (hourMinuteMatch) {
      return parseInt(hourMinuteMatch[1]) * 60 + parseInt(hourMinuteMatch[2])
    }

    const hoursMatch = message.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?/i)
    if (hoursMatch) {
      return Math.round(parseFloat(hoursMatch[1]) * 60)
    }

    const minutesMatch = message.match(/(\d+)\s*m(?:inutes?)?/i)
    if (minutesMatch) {
      return parseInt(minutesMatch[1])
    }

    return undefined
  },

  extractTimeInfo(message: string): { startTime?: Date; endTime?: Date } {
    const now = new Date()

    // Look for relative time expressions
    if (message.includes('just now') || message.includes('right now')) {
      return { startTime: now }
    }

    if (message.includes('ago')) {
      const minutesAgoMatch = message.match(/(\d+)\s*minutes?\s*ago/i)
      if (minutesAgoMatch) {
        const minutesAgo = parseInt(minutesAgoMatch[1])
        return { startTime: new Date(now.getTime() - minutesAgo * 60 * 1000) }
      }

      const hoursAgoMatch = message.match(/(\d+)\s*hours?\s*ago/i)
      if (hoursAgoMatch) {
        const hoursAgo = parseInt(hoursAgoMatch[1])
        return {
          startTime: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
        }
      }
    }

    // Look for "from X to Y" patterns
    const fromToMatch = message.match(
      /from\s*(\d{1,2}):(\d{2})\s*to\s*(\d{1,2}):(\d{2})/i
    )
    if (fromToMatch) {
      const startTime = new Date(now)
      startTime.setHours(
        parseInt(fromToMatch[1]),
        parseInt(fromToMatch[2]),
        0,
        0
      )

      const endTime = new Date(now)
      endTime.setHours(parseInt(fromToMatch[3]), parseInt(fromToMatch[4]), 0, 0)

      return { startTime, endTime }
    }

    return {}
  },

  extractNotes(message: string): string | undefined {
    // Look for notes in quotes or after "note:" or "notes:"
    const quotedMatch = message.match(/"([^"]+)"/)
    if (quotedMatch) return quotedMatch[1]

    const noteMatch = message.match(/notes?:\s*(.+)/i)
    if (noteMatch) return noteMatch[1].trim()

    return undefined
  },

  async executeAction(action: ChatAction, babyName: string): Promise<string> {
    try {
      switch (action.type) {
        case 'create_entry':
          return await this.createEntry(action, babyName)
        case 'start_timer':
          return this.startTimer(action, babyName)
        case 'stop_timer':
          return 'Timer functionality would need to be implemented with state management'
        default:
          return ''
      }
    } catch (error) {
      console.error('Error executing chat action:', error)
      return `Sorry, I had trouble ${
        action.type === 'create_entry'
          ? 'creating that entry'
          : 'starting the timer'
      }. Please try again or use the tracker page.`
    }
  },

  async createEntry(action: ChatAction, babyName: string): Promise<string> {
    if (!action.entryType) {
      return "I couldn't determine what type of entry to create. Please be more specific."
    }

    const now = new Date()
    const entry: NewTrackerEntry = {
      entry_type: action.entryType,
      start_time: action.startTime?.toISOString() || now.toISOString(),
      end_time: action.endTime?.toISOString() || null,
      quantity: action.quantity || null,
      feeding_type: action.feedingType || null,
      diaper_type: action.diaperType || null,
      notes: action.notes || null,
    }

    // For sleep entries, calculate end time if duration is provided
    if (action.entryType === 'sleep' && action.duration && !action.endTime) {
      const startTime = action.startTime || now
      entry.end_time = new Date(
        startTime.getTime() + action.duration * 60 * 1000
      ).toISOString()
    }

    await trackerService.createEntry(entry)

    return this.generateSuccessMessage(action, babyName)
  },

  startTimer(action: ChatAction, _babyName: string): string {
    const feedingTypeText =
      action.feedingType === 'breast_left'
        ? 'left breast'
        : action.feedingType === 'breast_right'
        ? 'right breast'
        : action.feedingType === 'both'
        ? 'both breasts'
        : 'bottle'

    return `I can't start live timers from chat, but I can help you log feeding entries! Try saying:

• "Log a ${feedingTypeText} feeding" (for a completed feeding)
• "Record ${feedingTypeText} feeding of 120ml" (with quantity)

For live timers with real-time tracking, visit the tracker page where you can start and stop timers as they happen.`
  },

  generateSuccessMessage(action: ChatAction, babyName: string): string {
    const timeText = action.startTime
      ? ` at ${action.startTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      : ''

    switch (action.entryType) {
      case 'feeding':
        const feedingTypeText =
          action.feedingType === 'breast_left'
            ? 'left breast'
            : action.feedingType === 'breast_right'
            ? 'right breast'
            : action.feedingType === 'both'
            ? 'both breasts'
            : 'bottle'
        const quantityText = action.quantity ? ` (${action.quantity}ml)` : ''
        return `✅ Logged ${feedingTypeText} feeding for ${babyName}${quantityText}${timeText}!`

      case 'sleep':
        const durationText = action.duration
          ? ` for ${Math.floor(action.duration / 60)}h ${action.duration % 60}m`
          : ''
        return `✅ Logged sleep session for ${babyName}${durationText}${timeText}!`

      case 'diaper': {
        const diaperTypeText =
          action.diaperType === 'both' ? 'wet & dirty' : action.diaperType
        return `✅ Logged ${diaperTypeText} diaper change for ${babyName}${timeText}!`
      }

      default:
        return `✅ Logged ${action.entryType} for ${babyName}${timeText}!`
    }
  },
}
