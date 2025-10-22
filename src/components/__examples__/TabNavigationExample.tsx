import React, { useState } from 'react'
import { Clock, Sparkles } from 'lucide-react'
import { TabNavigation, TabConfig } from '../TabNavigation'

// Example components for demonstration
const ActivitiesTabContent: React.FC = () => (
  <div className='p-4'>
    <h2 className='mb-2 text-lg font-semibold'>Activities Content</h2>
    <p>This would contain the activities tracking interface.</p>
  </div>
)

const InsightsTabContent: React.FC = () => (
  <div className='p-4'>
    <h2 className='mb-2 text-lg font-semibold'>Insights Content</h2>
    <p>This would contain the AI insights and patterns.</p>
  </div>
)

// Example usage of TabNavigation component
export const TabNavigationExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState('activities')

  const tabs: TabConfig[] = [
    {
      id: 'activities',
      label: 'Activities',
      component: ActivitiesTabContent,
      icon: Clock,
    },
    {
      id: 'insights',
      label: 'Insights',
      component: InsightsTabContent,
      icon: Sparkles,
    },
  ]

  const ActiveTabComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || ActivitiesTabContent

  return (
    <div className='mx-auto max-w-4xl p-4'>
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className='mb-6'
      />

      {/* Tab content */}
      <div
        role='tabpanel'
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className='rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'
      >
        <ActiveTabComponent />
      </div>
    </div>
  )
}
