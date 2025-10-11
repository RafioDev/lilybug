import React, { useState, useEffect } from 'react'
import { Calendar, ChevronRight } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { tipsService } from '../services/tipsService'
import { profileService } from '../services/profileService'
import type { DailyTip, Profile } from '../types'

export const TipsPage: React.FC = () => {
  const [tips, setTips] = useState<DailyTip[]>([])
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

        {/* Tips Section */}
        <div>
          <h2 className='text-lg lg:text-xl font-semibold text-gray-800 mb-4 px-1'>
            Tips for This Stage
          </h2>

          {tips.length === 0 ? (
            <Card>
              <p className='text-center text-gray-500'>
                No tips available for this age range yet.
              </p>
            </Card>
          ) : (
            <div className='space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0'>
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
