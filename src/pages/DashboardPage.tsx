import React, { useState, useEffect } from 'react'
import { Moon, Heart, BookOpen } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { wellnessService } from '../services/wellnessService'
import { profileService } from '../services/profileService'
import type { Profile, ParentWellness } from '../types'

export const DashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [todayWellness, setTodayWellness] = useState<ParentWellness[]>([])
  const [loading, setLoading] = useState(true)

  const [parent1Data, setParent1Data] = useState({
    mood: 3,
    sleep: '',
    journal: '',
  })

  const [parent2Data, setParent2Data] = useState({
    mood: 3,
    sleep: '',
    journal: '',
  })

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊']

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const profileData = await profileService.getProfile()
      setProfile(profileData)

      const today = new Date().toISOString().split('T')[0]
      const wellnessData = await wellnessService.getWellnessForDate(today)
      setTodayWellness(wellnessData)

      const parent1Entry = wellnessData.find((w) => w.parent_name === 'parent1')
      const parent2Entry = wellnessData.find((w) => w.parent_name === 'parent2')

      if (parent1Entry) {
        setParent1Data({
          mood: parent1Entry.mood_score,
          sleep: parent1Entry.sleep_hours?.toString() || '',
          journal: parent1Entry.journal_entry || '',
        })
      }

      if (parent2Entry) {
        setParent2Data({
          mood: parent2Entry.mood_score,
          sleep: parent2Entry.sleep_hours?.toString() || '',
          journal: parent2Entry.journal_entry || '',
        })
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveWellness = async (parentName: string, data: typeof parent1Data) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await wellnessService.createOrUpdateWellness({
        date: today,
        parent_name: parentName,
        mood_score: data.mood,
        sleep_hours: data.sleep ? parseFloat(data.sleep) : null,
        journal_entry: data.journal || null,
      })
    } catch (error) {
      console.error('Error saving wellness:', error)
    }
  }

  if (loading) {
    return (
      <Layout title='Your Wellness'>
        <Card>
          <p className='text-center text-gray-500'>Loading...</p>
        </Card>
      </Layout>
    )
  }

  const parent1Name = profile?.parent1_name || 'Parent 1'
  const parent2Name = profile?.parent2_name || 'Parent 2'
  const hasParent2 = profile?.parent2_name

  return (
    <Layout title='Your Wellness'>
      <div className='space-y-6'>
        {/* Header Card */}
        <Card className='bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 lg:p-8'>
          <div className='flex items-center gap-4'>
            <Heart size={40} className='flex-shrink-0' />
            <div>
              <p className='text-xl lg:text-2xl font-semibold'>
                Take Care of Yourself
              </p>
              <p className='text-sm lg:text-base opacity-90'>
                Your wellness matters too
              </p>
            </div>
          </div>
        </Card>

        {/* Parent Wellness Cards */}
        <div
          className={`space-y-6 ${
            hasParent2 ? 'lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0' : ''
          }`}
        >
          <Card className='lg:h-fit'>
            <h3 className='text-lg lg:text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
              <span className='text-2xl'>👤</span>
              {parent1Name}
            </h3>

            <div className='space-y-6'>
              <div>
                <label className='text-sm font-medium text-gray-700 px-1 block mb-3'>
                  How are you feeling today?
                </label>
                <div className='flex justify-between gap-2 lg:gap-3'>
                  {moodEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setParent1Data({ ...parent1Data, mood: index + 1 })
                      }
                      className={`flex-1 p-3 lg:p-4 rounded-xl border-2 transition-all text-2xl lg:text-3xl ${
                        parent1Data.mood === index + 1
                          ? 'border-pink-500 bg-pink-50 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <Moon size={20} className='text-gray-600 flex-shrink-0' />
                <Input
                  type='number'
                  step='0.5'
                  value={parent1Data.sleep}
                  onChange={(val) =>
                    setParent1Data({ ...parent1Data, sleep: val })
                  }
                  placeholder='Hours of sleep'
                  className='flex-1'
                />
              </div>

              <div className='flex items-start gap-3'>
                <BookOpen
                  size={20}
                  className='text-gray-600 flex-shrink-0 mt-3'
                />
                <Input
                  type='textarea'
                  value={parent1Data.journal}
                  onChange={(val) =>
                    setParent1Data({ ...parent1Data, journal: val })
                  }
                  placeholder="What's on your mind? (optional)"
                  rows={4}
                  className='flex-1'
                />
              </div>

              <Button
                onClick={() => saveWellness('parent1', parent1Data)}
                fullWidth
              >
                Save {parent1Name} Data
              </Button>
            </div>
          </Card>

          {hasParent2 && (
            <Card className='lg:h-fit'>
              <h3 className='text-lg lg:text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
                <span className='text-2xl'>👤</span>
                {parent2Name}
              </h3>

              <div className='space-y-6'>
                <div>
                  <label className='text-sm font-medium text-gray-700 px-1 block mb-3'>
                    How are you feeling today?
                  </label>
                  <div className='flex justify-between gap-2 lg:gap-3'>
                    {moodEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          setParent2Data({ ...parent2Data, mood: index + 1 })
                        }
                        className={`flex-1 p-3 lg:p-4 rounded-xl border-2 transition-all text-2xl lg:text-3xl ${
                          parent2Data.mood === index + 1
                            ? 'border-pink-500 bg-pink-50 scale-110'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Moon size={20} className='text-gray-600 flex-shrink-0' />
                  <Input
                    type='number'
                    step='0.5'
                    value={parent2Data.sleep}
                    onChange={(val) =>
                      setParent2Data({ ...parent2Data, sleep: val })
                    }
                    placeholder='Hours of sleep'
                    className='flex-1'
                  />
                </div>

                <div className='flex items-start gap-3'>
                  <BookOpen
                    size={20}
                    className='text-gray-600 flex-shrink-0 mt-3'
                  />
                  <Input
                    type='textarea'
                    value={parent2Data.journal}
                    onChange={(val) =>
                      setParent2Data({ ...parent2Data, journal: val })
                    }
                    placeholder="What's on your mind? (optional)"
                    rows={4}
                    className='flex-1'
                  />
                </div>

                <Button
                  onClick={() => saveWellness('parent2', parent2Data)}
                  fullWidth
                >
                  Save {parent2Name} Data
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Inspirational Message */}
        <Card className='bg-blue-50 border-blue-200 lg:p-8'>
          <p className='text-sm lg:text-base text-blue-800 text-center'>
            Remember: Taking care of yourself isn't selfish. You can't pour from
            an empty cup. Be kind to yourself today.
          </p>
        </Card>
      </div>
    </Layout>
  )
}
