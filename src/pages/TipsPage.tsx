import React, { useState, useEffect } from 'react'
import { Calendar, ChevronRight, Brain, Sparkles } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { tipsService } from '../services/tipsService'
import { profileService } from '../services/profileService'
import { trackerService } from '../services/trackerService'
import { wellnessService } from '../services/wellnessService'
import { aiAssistantService } from '../services/aiAssistantService'
import type { DailyTip, Profile } from '../types'
import type { PersonalizedTip } from '../services/aiAssistantService'

export const TipsPage: React.FC = () => {
  const [tips, setTips] = useState<DailyTip[]>([])
  const [personalizedTips, setPersonalizedTips] = useState<PersonalizedTip[]>(
    []
  )
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [babyAge, setBabyAge] = useState({ weeks: 0, days: 0, totalDays: 0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const profileData = await profileService.getProfile()
      setProfile(profileData)

      if (profileData) {
        const birthDate = new Date(profileData.baby_birthdate)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - birthDate.getTime())
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const weeks = Math.floor(totalDays / 7)
        const days = totalDays % 7

        setBabyAge({ weeks, days, totalDays })

        const tipsData = await tipsService.getTipsForAge(totalDays)
        setTips(tipsData)

        // Load data for AI personalization
        const trackerEntries = await trackerService.getEntries(100)
        const recentWellness = await wellnessService.getRecentWellness(14)

        // Generate personalized tips
        const personalizedTipsData =
          aiAssistantService.generatePersonalizedTips(
            profileData,
            trackerEntries,
            recentWellness,
            tipsData
          )
        setPersonalizedTips(personalizedTipsData)
      }
    } catch (error) {
      console.error('Error loading tips:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout title='Daily Tips'>
        <Card>
          <p className='text-center text-gray-500'>Loading tips...</p>
        </Card>
      </Layout>
    )
  }

  if (!profile) {
    return (
      <Layout title='Daily Tips'>
        <Card>
          <p className='text-center text-gray-600 mb-3'>
            Set up your profile to see personalized tips!
          </p>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout title='Daily Tips'>
      <div className='space-y-6'>
        {/* Baby Age Header */}
        <Card className='bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 lg:p-8'>
          <div className='flex items-start gap-4'>
            <div className='p-3 bg-white/20 rounded-lg'>
              <Calendar size={32} />
            </div>
            <div>
              <p className='text-sm lg:text-base opacity-90'>
                {profile.baby_name || 'Your baby'} is
              </p>
              <p className='text-2xl lg:text-3xl font-bold'>
                {babyAge.weeks} week{babyAge.weeks !== 1 ? 's' : ''}{' '}
                {babyAge.days > 0 &&
                  `& ${babyAge.days} day${babyAge.days !== 1 ? 's' : ''}`}
              </p>
              <p className='text-sm lg:text-base opacity-90 mt-1'>
                {babyAge.totalDays} days old
              </p>
            </div>
          </div>
        </Card>

        {/* Personalized AI Tips Section */}
        {personalizedTips.length > 0 && (
          <div>
            <div className='flex items-center gap-2 mb-4 px-1'>
              <Brain className='w-5 h-5 text-purple-600' />
              <h2 className='text-lg lg:text-xl font-semibold text-gray-800'>
                Personalized for You
              </h2>
              <Sparkles className='w-4 h-4 text-purple-500' />
            </div>

            <div className='space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 mb-8'>
              {personalizedTips
                .filter((tip) => tip.isPersonalized)
                .map((tip) => (
                  <Card
                    key={tip.id}
                    padding='md'
                    className='lg:h-fit border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50'
                  >
                    <div className='flex items-start gap-4'>
                      <div className='text-3xl lg:text-4xl flex-shrink-0'>
                        🤖
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-2'>
                              <h3 className='font-semibold text-gray-800 lg:text-lg'>
                                {tip.title}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  tip.priority === 'high'
                                    ? 'bg-red-100 text-red-700'
                                    : tip.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {tip.priority}
                              </span>
                            </div>
                            <p className='text-sm lg:text-base text-gray-600 leading-relaxed mb-3'>
                              {tip.content}
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {tip.basedOn.map((factor, index) => (
                                <span
                                  key={index}
                                  className='text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded'
                                >
                                  {factor.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight
                            size={20}
                            className='text-gray-400 flex-shrink-0 lg:hidden'
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* General Tips Section */}
        <div>
          <h2 className='text-lg lg:text-xl font-semibold text-gray-800 mb-4 px-1'>
            General Tips for This Stage
          </h2>

          {tips.length === 0 ? (
            <Card>
              <p className='text-center text-gray-500'>
                No tips available for this age range yet.
              </p>
            </Card>
          ) : (
            <div className='space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0'>
              {personalizedTips
                .filter((tip) => !tip.isPersonalized)
                .map((tip) => (
                  <Card key={tip.id} padding='md' className='lg:h-fit'>
                    <div className='flex items-start gap-4'>
                      <div className='text-3xl lg:text-4xl flex-shrink-0'>
                        💡
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='flex-1'>
                            <h3 className='font-semibold text-gray-800 mb-2 lg:text-lg'>
                              {tip.title}
                            </h3>
                            <p className='text-sm lg:text-base text-gray-600 leading-relaxed'>
                              {tip.content}
                            </p>
                            <span className='inline-block mt-3 px-3 py-1 bg-blue-50 text-blue-700 text-xs lg:text-sm font-medium rounded-lg'>
                              {tip.category}
                            </span>
                          </div>
                          <ChevronRight
                            size={20}
                            className='text-gray-400 flex-shrink-0 lg:hidden'
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              {tips.map((tip) => (
                <Card key={tip.id} padding='md' className='lg:h-fit'>
                  <div className='flex items-start gap-4'>
                    {tip.icon && (
                      <div className='text-3xl lg:text-4xl flex-shrink-0'>
                        {tip.icon}
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1'>
                          <h3 className='font-semibold text-gray-800 mb-2 lg:text-lg'>
                            {tip.title}
                          </h3>
                          <p className='text-sm lg:text-base text-gray-600 leading-relaxed'>
                            {tip.content}
                          </p>
                          {tip.category && (
                            <span className='inline-block mt-3 px-3 py-1 bg-blue-50 text-blue-700 text-xs lg:text-sm font-medium rounded-lg'>
                              {tip.category}
                            </span>
                          )}
                        </div>
                        <ChevronRight
                          size={20}
                          className='text-gray-400 flex-shrink-0 lg:hidden'
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Reminder Card */}
        <Card className='bg-emerald-50 border-emerald-200 lg:p-8'>
          <div className='text-center'>
            <p className='text-emerald-800 font-medium mb-2 lg:text-lg'>
              Remember
            </p>
            <p className='text-sm lg:text-base text-emerald-700'>
              Every baby develops at their own pace. These tips are general
              guidance. Trust your instincts and consult your pediatrician with
              concerns.
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
