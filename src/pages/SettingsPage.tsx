import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Settings, Baby as BabyIcon } from 'lucide-react'
import { PageErrorBoundary } from '../components/PageErrorBoundary'
import { SectionErrorBoundary } from '../components/SectionErrorBoundary'
import { BabiesTab } from '../components/SettingsPage/BabiesTab'
import { GeneralTab } from '../components/SettingsPage/GeneralTab'
import {
  Tabs,
  AnimatedTabsList,
  AnimatedTabsTrigger,
  TabsContent,
} from '../components/ui/tabs'

type TabType = 'babies' | 'general'

const SettingsContent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive active tab from URL parameters instead of storing in state
  const activeTab: TabType = (() => {
    const tabParam = searchParams.get('tab') as TabType
    return tabParam && ['general', 'babies'].includes(tabParam)
      ? tabParam
      : 'general'
  })()

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='mx-auto max-w-6xl px-4 py-8'>
        {/* ShadCN Tabs */}
        <SectionErrorBoundary sectionName='Settings Navigation'>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className='w-full'
          >
            <AnimatedTabsList variant='underline' className='w-full'>
              <AnimatedTabsTrigger
                variant='underline'
                value='general'
                className='flex items-center gap-2'
              >
                <Settings className='h-4 w-4' />
                General
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                variant='underline'
                value='babies'
                className='flex items-center gap-2'
              >
                <BabyIcon className='h-4 w-4' />
                Babies
              </AnimatedTabsTrigger>
            </AnimatedTabsList>

            <TabsContent value='general'>
              <SectionErrorBoundary sectionName='Settings General Tab'>
                <GeneralTab />
              </SectionErrorBoundary>
            </TabsContent>

            <TabsContent value='babies'>
              <SectionErrorBoundary sectionName='Settings Babies Tab'>
                <BabiesTab />
              </SectionErrorBoundary>
            </TabsContent>
          </Tabs>
        </SectionErrorBoundary>
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
