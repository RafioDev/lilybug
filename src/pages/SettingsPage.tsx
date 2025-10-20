import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Settings, Baby as BabyIcon } from 'lucide-react'
import { PageErrorBoundary } from '../components/PageErrorBoundary'
import { BabiesTab } from '../components/SettingsPage/BabiesTab'
import { GeneralTab } from '../components/SettingsPage/GeneralTab'

type TabType = 'babies' | 'general'

interface Tab {
  id: TabType
  label: string
  icon: React.ReactNode
  component: React.ComponentType
}

const tabs: Tab[] = [
  {
    id: 'general',
    label: 'General',
    icon: <Settings className='h-4 w-4' />,
    component: GeneralTab,
  },
  {
    id: 'babies',
    label: 'Babies',
    icon: <BabyIcon className='h-4 w-4' />,
    component: BabiesTab,
  },
]

const SettingsContent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive active tab from URL parameters instead of storing in state
  const activeTab: TabType = (() => {
    const tabParam = searchParams.get('tab') as TabType
    return tabParam && tabs.some((tab) => tab.id === tabParam)
      ? tabParam
      : 'babies'
  })()

  // Update URL when tab changes
  const handleTabChange = (tabId: TabType) => {
    setSearchParams({ tab: tabId })
  }

  const ActiveTabComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || BabiesTab

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='mx-auto max-w-6xl px-4 py-8'>
        {/* Tab Navigation */}
        <div className='mb-8'>
          <div className='border-b border-gray-200 dark:border-gray-700'>
            <nav className='-mb-px flex space-x-8' aria-label='Tabs'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex cursor-pointer items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                  }`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className='tab-content'>
          <ActiveTabComponent />
        </div>
      </div>
    </div>
  )
}

export const SettingsPage: React.FC = () => {
  return (
    <PageErrorBoundary pageName='Settings' contextData={{}}>
      <SettingsContent />
    </PageErrorBoundary>
  )
}
