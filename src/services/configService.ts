import type { FeedingType } from '../types'

export interface UserConfig {
  feedingTypeOrder: FeedingType[]
}

const DEFAULT_CONFIG: UserConfig = {
  feedingTypeOrder: ['breast_left', 'breast_right', 'bottle'],
}

const CONFIG_KEY = 'baby_tracker_config'

export const configService = {
  getConfig(): UserConfig {
    try {
      const stored = localStorage.getItem(CONFIG_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Ensure all required feeding types are present
        const allTypes: FeedingType[] = [
          'breast_left',
          'breast_right',
          'bottle',
        ]
        const missingTypes = allTypes.filter(
          (type) => !parsed.feedingTypeOrder?.includes(type)
        )

        if (missingTypes.length > 0) {
          // Add missing types to the end
          parsed.feedingTypeOrder = [
            ...(parsed.feedingTypeOrder || []),
            ...missingTypes,
          ]
        }

        return { ...DEFAULT_CONFIG, ...parsed }
      }
    } catch (error) {
      console.error('Error loading config:', error)
    }
    return DEFAULT_CONFIG
  },

  updateConfig(config: Partial<UserConfig>): void {
    try {
      const currentConfig = this.getConfig()
      const newConfig = { ...currentConfig, ...config }
      localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig))
    } catch (error) {
      console.error('Error saving config:', error)
    }
  },

  updateFeedingTypeOrder(order: FeedingType[]): void {
    this.updateConfig({ feedingTypeOrder: order })
  },
}
