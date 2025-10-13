import type { TrackerEntry, Baby } from '../types'

export interface SearchQuery {
  type: 'sleep' | 'feeding' | 'diaper' | 'all'
  duration?: {
    operator: 'greater' | 'less' | 'equal'
    value: number
    unit: 'minutes' | 'hours'
  }
  timeRange?: {
    start: Date
    end: Date
    description: string
  }
  quantity?: {
    operator: 'greater' | 'less' | 'equal'
    value: number
  }
  feedingType?: string
  diaperType?: string
}

export interface SearchResult {
  entries: TrackerEntry[]
  summary: string
  totalCount: number
  averages?: {
    duration?: number
    quantity?: number
  }
}

export const smartSearchService = {
  parseNaturalLanguageQuery(query: string): SearchQuery {
    const lowerQuery = query.toLowerCase()

    // Initialize search query
    const searchQuery: SearchQuery = {
      type: 'all',
    }

    // Parse activity type
    if (lowerQuery.includes('sleep') || lowerQuery.includes('nap')) {
      searchQuery.type = 'sleep'
    } else if (
      lowerQuery.includes('feed') ||
      lowerQuery.includes('eat') ||
      lowerQuery.includes('bottle') ||
      lowerQuery.includes('breast')
    ) {
      searchQuery.type = 'feeding'
    } else if (
      lowerQuery.includes('diaper') ||
      lowerQuery.includes('poop') ||
      lowerQuery.includes('wet')
    ) {
      searchQuery.type = 'diaper'
    }

    // Parse duration conditions
    const durationRegex =
      /(more than|greater than|over|above|less than|under|below|exactly|equal to)\s*(\d+(?:\.\d+)?)\s*(hour|hr|minute|min)s?/i
    const durationMatch = lowerQuery.match(durationRegex)

    if (durationMatch) {
      const operator =
        durationMatch[1].includes('more') ||
        durationMatch[1].includes('greater') ||
        durationMatch[1].includes('over') ||
        durationMatch[1].includes('above')
          ? 'greater'
          : durationMatch[1].includes('less') ||
            durationMatch[1].includes('under') ||
            durationMatch[1].includes('below')
          ? 'less'
          : 'equal'

      const value = parseFloat(durationMatch[2])
      const unit =
        durationMatch[3].startsWith('hour') || durationMatch[3].startsWith('hr')
          ? 'hours'
          : 'minutes'

      searchQuery.duration = { operator, value, unit }
    }

    // Parse quantity conditions
    const quantityRegex =
      /(more than|greater than|over|above|less than|under|below|exactly|equal to)\s*(\d+(?:\.\d+)?)\s*(ml|oz|ounce)s?/i
    const quantityMatch = lowerQuery.match(quantityRegex)

    if (quantityMatch) {
      const operator =
        quantityMatch[1].includes('more') ||
        quantityMatch[1].includes('greater') ||
        quantityMatch[1].includes('over') ||
        quantityMatch[1].includes('above')
          ? 'greater'
          : quantityMatch[1].includes('less') ||
            quantityMatch[1].includes('under') ||
            quantityMatch[1].includes('below')
          ? 'less'
          : 'equal'

      const value = parseFloat(quantityMatch[2])
      searchQuery.quantity = { operator, value }
    }

    // Parse time ranges
    const now = new Date()

    if (lowerQuery.includes('today')) {
      const startOfDay = new Date(now)
      startOfDay.setHours(0, 0, 0, 0)
      searchQuery.timeRange = {
        start: startOfDay,
        end: now,
        description: 'today',
      }
    } else if (lowerQuery.includes('yesterday')) {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const startOfYesterday = new Date(yesterday)
      startOfYesterday.setHours(0, 0, 0, 0)
      const endOfYesterday = new Date(yesterday)
      endOfYesterday.setHours(23, 59, 59, 999)
      searchQuery.timeRange = {
        start: startOfYesterday,
        end: endOfYesterday,
        description: 'yesterday',
      }
    } else if (
      lowerQuery.includes('last week') ||
      lowerQuery.includes('past week')
    ) {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      searchQuery.timeRange = {
        start: weekAgo,
        end: now,
        description: 'last week',
      }
    } else if (
      lowerQuery.includes('last month') ||
      lowerQuery.includes('past month')
    ) {
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      searchQuery.timeRange = {
        start: monthAgo,
        end: now,
        description: 'last month',
      }
    } else if (
      lowerQuery.includes('last 24 hours') ||
      lowerQuery.includes('past 24 hours')
    ) {
      const dayAgo = new Date(now)
      dayAgo.setHours(dayAgo.getHours() - 24)
      searchQuery.timeRange = {
        start: dayAgo,
        end: now,
        description: 'last 24 hours',
      }
    }

    // Parse specific feeding types
    if (lowerQuery.includes('bottle')) {
      searchQuery.feedingType = 'bottle'
    } else if (
      lowerQuery.includes('breast') ||
      lowerQuery.includes('nursing')
    ) {
      if (lowerQuery.includes('left')) {
        searchQuery.feedingType = 'breast_left'
      } else if (lowerQuery.includes('right')) {
        searchQuery.feedingType = 'breast_right'
      } else if (lowerQuery.includes('both')) {
        searchQuery.feedingType = 'both'
      }
    }

    // Parse diaper types
    if (lowerQuery.includes('wet') && !lowerQuery.includes('dirty')) {
      searchQuery.diaperType = 'wet'
    } else if (lowerQuery.includes('dirty') && !lowerQuery.includes('wet')) {
      searchQuery.diaperType = 'dirty'
    } else if (lowerQuery.includes('dirty') && lowerQuery.includes('wet')) {
      searchQuery.diaperType = 'both'
    }

    return searchQuery
  },

  executeSearch(entries: TrackerEntry[], query: SearchQuery): SearchResult {
    let filteredEntries = [...entries]

    // Filter by type
    if (query.type !== 'all') {
      filteredEntries = filteredEntries.filter(
        (entry) => entry.entry_type === query.type
      )
    }

    // Filter by time range
    if (query.timeRange) {
      filteredEntries = filteredEntries.filter((entry) => {
        const entryTime = new Date(entry.start_time)
        return (
          entryTime >= query.timeRange!.start &&
          entryTime <= query.timeRange!.end
        )
      })
    }

    // Filter by duration
    if (query.duration && query.type === 'sleep') {
      filteredEntries = filteredEntries.filter((entry) => {
        if (!entry.end_time) return false

        const start = new Date(entry.start_time)
        const end = new Date(entry.end_time)
        const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
        const durationHours = durationMinutes / 60

        const duration =
          query.duration!.unit === 'hours' ? durationHours : durationMinutes
        const targetValue = query.duration!.value

        switch (query.duration!.operator) {
          case 'greater':
            return duration > targetValue
          case 'less':
            return duration < targetValue
          case 'equal':
            return Math.abs(duration - targetValue) < 0.1
          default:
            return true
        }
      })
    }

    // Filter by quantity
    if (query.quantity && query.type === 'feeding') {
      filteredEntries = filteredEntries.filter((entry) => {
        if (!entry.quantity) return false

        switch (query.quantity!.operator) {
          case 'greater':
            return entry.quantity > query.quantity!.value
          case 'less':
            return entry.quantity < query.quantity!.value
          case 'equal':
            return Math.abs(entry.quantity - query.quantity!.value) < 1
          default:
            return true
        }
      })
    }

    // Filter by feeding type
    if (query.feedingType && query.type === 'feeding') {
      filteredEntries = filteredEntries.filter(
        (entry) => entry.feeding_type === query.feedingType
      )
    }

    // Filter by diaper type
    if (query.diaperType && query.type === 'diaper') {
      filteredEntries = filteredEntries.filter(
        (entry) => entry.diaper_type === query.diaperType
      )
    }

    // Calculate averages
    const averages: { duration?: number; quantity?: number } = {}

    if (
      query.type === 'sleep' ||
      (query.type === 'all' &&
        filteredEntries.some((e) => e.entry_type === 'sleep'))
    ) {
      const sleepEntries = filteredEntries.filter(
        (e) => e.entry_type === 'sleep' && e.end_time
      )
      if (sleepEntries.length > 0) {
        const totalDuration = sleepEntries.reduce((sum, entry) => {
          const start = new Date(entry.start_time)
          const end = new Date(entry.end_time!)
          return sum + (end.getTime() - start.getTime()) / (1000 * 60)
        }, 0)
        averages.duration = totalDuration / sleepEntries.length
      }
    }

    if (
      query.type === 'feeding' ||
      (query.type === 'all' &&
        filteredEntries.some((e) => e.entry_type === 'feeding'))
    ) {
      const feedingEntries = filteredEntries.filter(
        (e) => e.entry_type === 'feeding' && e.quantity
      )
      if (feedingEntries.length > 0) {
        const totalQuantity = feedingEntries.reduce(
          (sum, entry) => sum + (entry.quantity || 0),
          0
        )
        averages.quantity = totalQuantity / feedingEntries.length
      }
    }

    // Generate summary
    const summary = this.generateSummary(filteredEntries, query, averages)

    return {
      entries: filteredEntries,
      summary,
      totalCount: filteredEntries.length,
      averages,
    }
  },

  generateSummary(
    entries: TrackerEntry[],
    query: SearchQuery,
    averages: { duration?: number; quantity?: number }
  ): string {
    const count = entries.length
    const timeRangeText = query.timeRange
      ? ` ${query.timeRange.description}`
      : ''

    if (count === 0) {
      return `No ${
        query.type === 'all' ? 'activities' : query.type
      } entries found${timeRangeText} matching your criteria.`
    }

    let summary = `Found ${count} ${
      query.type === 'all' ? 'activities' : query.type
    } ${count === 1 ? 'entry' : 'entries'}${timeRangeText}`

    if (query.duration) {
      const durationText = `${query.duration.operator} ${query.duration.value} ${query.duration.unit}`
      summary += ` lasting ${durationText}`
    }

    if (query.quantity) {
      const quantityText = `${query.quantity.operator} ${query.quantity.value}ml`
      summary += ` with quantity ${quantityText}`
    }

    if (averages.duration && query.type === 'sleep') {
      const avgHours = Math.floor(averages.duration / 60)
      const avgMinutes = Math.round(averages.duration % 60)
      summary += `. Average sleep duration: ${avgHours}h ${avgMinutes}m`
    }

    if (averages.quantity && query.type === 'feeding') {
      summary += `. Average feeding quantity: ${Math.round(
        averages.quantity
      )}ml`
    }

    return summary + '.'
  },

  // Predefined common queries for quick access
  getCommonQueries(baby?: Baby): Array<{ text: string; description: string }> {
    const babyName = baby?.name || 'baby'

    return [
      {
        text: `Show me all times ${babyName} slept more than 3 hours last week`,
        description: 'Long sleep sessions from the past week',
      },
      {
        text: `How many feedings did ${babyName} have today?`,
        description: "Today's feeding count",
      },
      {
        text: `Show me all bottle feedings over 100ml yesterday`,
        description: 'Large bottle feedings from yesterday',
      },
      {
        text: `Find all dirty diapers last 24 hours`,
        description: 'Recent dirty diaper changes',
      },
      {
        text: `Show me sleep sessions less than 1 hour this week`,
        description: 'Short naps from this week',
      },
      {
        text: `All breast feedings last month`,
        description: 'Breastfeeding sessions from last month',
      },
    ]
  },
}
