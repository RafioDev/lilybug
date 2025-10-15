import React, { useState, useEffect } from 'react'
import {
  Baby as BabyIcon,
  Wine,
  Moon,
  Droplets,
  Plus,
  Play,
  Square,
  Clock,
  Settings,
  ArrowUp,
  ArrowDown,
  MessageCircle,
} from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { Input } from '../components/Input'

import { trackerService } from '../services/trackerService'
import { configService } from '../services/configService'
import { babyService } from '../services/babyService'
import type { EntryType, FeedingType, DiaperType, Baby } from '../types'

export const TrackerPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<EntryType | null>(null)
  const [activeBaby, setActiveBaby] = useState<Baby | null>(null)

  // Timer states for feeding
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [feedingTab, setFeedingTab] = useState<'timer' | 'manual'>('timer')

  // Configuration states
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [feedingTypeOrder, setFeedingTypeOrder] = useState<FeedingType[]>([])
  const [tempFeedingOrder, setTempFeedingOrder] = useState<FeedingType[]>([])

  const [formData, setFormData] = useState({
    startTime: new Date().toISOString().slice(0, 16),
    endTime: '',
    quantity: '',
    feedingType: 'bottle' as FeedingType,
    diaperType: 'wet' as DiaperType,
    notes: '',
  })

  const loadConfig = () => {
    const config = configService.getConfig()
    setFeedingTypeOrder(config.feedingTypeOrder)
  }

  const loadBabyData = async () => {
    try {
      const activeBabyData = await babyService.getActiveBaby()
      setActiveBaby(activeBabyData)
    } catch (error) {
      console.error('Error loading baby data:', error)
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      loadConfig()
      await loadBabyData()
    }
    initializeData()
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && timerStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - timerStartTime.getTime())
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timerStartTime])

  const openModal = (type: EntryType) => {
    setSelectedType(type)
    setFormData({
      startTime: new Date().toISOString().slice(0, 16),
      endTime: '',
      quantity: '',
      feedingType: feedingTypeOrder[0] || 'both', // Use first in order as default
      diaperType: 'wet',
      notes: '',
    })
    // Reset feeding tab to timer when opening feeding modal
    if (type === 'feeding') {
      setFeedingTab('timer')
    }
    setIsModalOpen(true)
  }

  const openConfigModal = () => {
    setTempFeedingOrder([...feedingTypeOrder])
    setIsConfigModalOpen(true)
  }

  const moveFeedingType = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...tempFeedingOrder]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      ;[newOrder[index], newOrder[targetIndex]] = [
        newOrder[targetIndex],
        newOrder[index],
      ]
      setTempFeedingOrder(newOrder)
    }
  }

  const saveConfig = () => {
    configService.updateFeedingTypeOrder(tempFeedingOrder)
    setFeedingTypeOrder(tempFeedingOrder)
    setIsConfigModalOpen(false)
  }

  const getFeedingTypeLabel = (type: FeedingType) => {
    switch (type) {
      case 'both':
        return 'Both Breasts'
      case 'breast_left':
        return 'Breast Left'
      case 'breast_right':
        return 'Breast Right'
      case 'bottle':
        return 'Bottle'
    }
  }

  const startTimer = () => {
    const now = new Date()
    setTimerStartTime(now)
    setIsTimerRunning(true)
    setElapsedTime(0)
    setFormData((prev) => ({
      ...prev,
      startTime: now.toISOString().slice(0, 16),
    }))
  }

  const stopTimer = () => {
    if (timerStartTime) {
      const now = new Date()
      setIsTimerRunning(false)
      setFormData((prev) => ({
        ...prev,
        endTime: now.toISOString().slice(0, 16),
      }))
    }
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimerStartTime(null)
    setElapsedTime(0)
    setFormData((prev) => ({
      ...prev,
      startTime: new Date().toISOString().slice(0, 16),
      endTime: '',
    }))
  }

  const formatElapsedTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(
        seconds % 60
      )
        .toString()
        .padStart(2, '0')}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    if (!selectedType || !activeBaby) return

    try {
      const entry = {
        entry_type: selectedType,
        start_time: formData.startTime,
        end_time: formData.endTime || null,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        feeding_type: selectedType === 'feeding' ? formData.feedingType : null,
        diaper_type: selectedType === 'diaper' ? formData.diaperType : null,
        notes: formData.notes || null,
        baby_id: activeBaby.id,
      }

      await trackerService.createEntry(entry)

      // Reset timer state if this was a feeding entry
      if (selectedType === 'feeding') {
        resetTimer()
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error creating entry:', error)
    }
  }

  const trackerTypes = [
    {
      type: 'feeding' as EntryType,
      label: 'Feeding',
      icon: Wine,
      color: 'from-blue-500 to-blue-600',
    },
    {
      type: 'sleep' as EntryType,
      label: 'Sleep',
      icon: Moon,
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      type: 'diaper' as EntryType,
      label: 'Diaper',
      icon: BabyIcon,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      type: 'pumping' as EntryType,
      label: 'Pumping',
      icon: Droplets,
      color: 'from-pink-500 to-pink-600',
    },
  ]

  return (
    <Layout title='Tracker'>
      {/* Voice Tracking Welcome Banner */}
      <div className='mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-white/20 rounded-full'>
            <MessageCircle className='w-6 h-6' />
          </div>
          <div className='flex-1'>
            <h3 className='font-semibold text-lg'>🎤 Just Talk to Track</h3>
            <p className='text-sm opacity-90'>
              Click the assistant (bottom right) and say things like:
            </p>
            <div className='mt-2 text-xs opacity-80 space-y-1'>
              <div>• "Log a bottle feeding of 120ml"</div>
              <div>• "Record a wet diaper change"</div>
              <div>• "Add a 2 hour nap"</div>
            </div>
          </div>
        </div>
      </div>

      <div className='space-y-6'>
        {/* Quick Actions */}
        <div>
          <h2 className='text-lg font-semibold text-gray-800 mb-4 px-1 lg:text-xl'>
            Quick Actions
          </h2>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
            {trackerTypes.map((item) => {
              const Icon = item.icon
              return (
                <Card
                  key={item.type}
                  padding='none'
                  className='overflow-hidden'
                >
                  <button
                    onClick={() => openModal(item.type)}
                    className='w-full p-4 lg:p-6 flex flex-col lg:flex-row items-center gap-2 lg:gap-4 hover:bg-gray-50 transition-colors'
                  >
                    <div
                      className={`p-3 rounded-full bg-gradient-to-r ${item.color} flex-shrink-0`}
                    >
                      <Icon size={28} className='text-white' />
                    </div>
                    <div className='flex flex-col lg:flex-1 lg:items-start'>
                      <span className='text-sm lg:text-base font-semibold text-gray-700'>
                        {item.label}
                      </span>
                      <Plus size={18} className='text-gray-400 lg:hidden' />
                    </div>
                    <Plus size={20} className='text-gray-400 hidden lg:block' />
                  </button>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Log ${selectedType}`}
      >
        <div className='space-y-4'>
          {selectedType === 'feeding' ? (
            <>
              {/* Feeding Tabs */}
              <div className='flex bg-gray-100 rounded-lg p-1'>
                <button
                  onClick={() => setFeedingTab('timer')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    feedingTab === 'timer'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Clock size={16} className='inline mr-2' />
                  Timer
                </button>
                <button
                  onClick={() => setFeedingTab('manual')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    feedingTab === 'manual'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Manual
                </button>
              </div>

              {feedingTab === 'timer' ? (
                <>
                  {/* Timer Interface */}
                  <div className='text-center py-6'>
                    <div className='text-4xl font-mono font-bold text-gray-800 mb-4'>
                      {formatElapsedTime(elapsedTime)}
                    </div>
                    <div className='flex justify-center gap-3'>
                      {!isTimerRunning ? (
                        <Button
                          onClick={startTimer}
                          className='bg-green-500 hover:bg-green-600'
                        >
                          <Play size={16} className='mr-2' />
                          Start Feeding
                        </Button>
                      ) : (
                        <Button
                          onClick={stopTimer}
                          className='bg-red-500 hover:bg-red-600'
                        >
                          <Square size={16} className='mr-2' />
                          Stop Feeding
                        </Button>
                      )}
                      {(elapsedTime > 0 || timerStartTime) && (
                        <Button onClick={resetTimer} variant='outline'>
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Feeding Type Selection */}
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <label className='text-sm font-medium text-gray-700 px-1'>
                        Feeding Type
                      </label>
                      <button
                        onClick={openConfigModal}
                        className='text-gray-400 hover:text-gray-600 transition-colors'
                        title='Configure feeding type order'
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      {feedingTypeOrder.map((type) => (
                        <button
                          key={type}
                          onClick={() =>
                            setFormData({ ...formData, feedingType: type })
                          }
                          className={`p-3 rounded-xl border-2 transition-all ${
                            formData.feedingType === type
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          <span className='text-sm font-medium'>
                            {getFeedingTypeLabel(type)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.feedingType === 'bottle' && (
                    <Input
                      label='Amount (oz)'
                      type='number'
                      step='0.5'
                      value={formData.quantity}
                      onChange={(val) =>
                        setFormData({ ...formData, quantity: val })
                      }
                      placeholder='e.g., 4'
                    />
                  )}
                </>
              ) : (
                <>
                  {/* Manual Input Interface */}
                  <Input
                    label='Start Time'
                    type='datetime-local'
                    value={formData.startTime}
                    onChange={(val) =>
                      setFormData({ ...formData, startTime: val })
                    }
                  />

                  <Input
                    label='End Time (optional)'
                    type='datetime-local'
                    value={formData.endTime}
                    onChange={(val) =>
                      setFormData({ ...formData, endTime: val })
                    }
                  />

                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <label className='text-sm font-medium text-gray-700 px-1'>
                        Feeding Type
                      </label>
                      <button
                        onClick={openConfigModal}
                        className='text-gray-400 hover:text-gray-600 transition-colors'
                        title='Configure feeding type order'
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      {feedingTypeOrder.map((type) => (
                        <button
                          key={type}
                          onClick={() =>
                            setFormData({ ...formData, feedingType: type })
                          }
                          className={`p-3 rounded-xl border-2 transition-all ${
                            formData.feedingType === type
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          <span className='text-sm font-medium'>
                            {getFeedingTypeLabel(type)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.feedingType === 'bottle' && (
                    <Input
                      label='Amount (oz)'
                      type='number'
                      step='0.5'
                      value={formData.quantity}
                      onChange={(val) =>
                        setFormData({ ...formData, quantity: val })
                      }
                      placeholder='e.g., 4'
                    />
                  )}
                </>
              )}

              <Input
                label='Notes (optional)'
                type='textarea'
                value={formData.notes}
                onChange={(val) => setFormData({ ...formData, notes: val })}
                placeholder='Any additional details...'
                rows={2}
              />
            </>
          ) : (
            <>
              {/* Non-feeding entries */}
              <Input
                label='Start Time'
                type='datetime-local'
                value={formData.startTime}
                onChange={(val) => setFormData({ ...formData, startTime: val })}
              />

              {selectedType === 'sleep' && (
                <Input
                  label='End Time (optional)'
                  type='datetime-local'
                  value={formData.endTime}
                  onChange={(val) => setFormData({ ...formData, endTime: val })}
                />
              )}

              {selectedType === 'pumping' && (
                <Input
                  label='Amount (oz)'
                  type='number'
                  step='0.5'
                  value={formData.quantity}
                  onChange={(val) =>
                    setFormData({ ...formData, quantity: val })
                  }
                  placeholder='e.g., 4'
                />
              )}

              {selectedType === 'diaper' && (
                <div>
                  <label className='text-sm font-medium text-gray-700 px-1 block mb-2'>
                    Type
                  </label>
                  <div className='grid grid-cols-3 gap-2'>
                    {(['wet', 'dirty', 'both'] as DiaperType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setFormData({ ...formData, diaperType: type })
                        }
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.diaperType === type
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        <span className='text-sm font-medium capitalize'>
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Input
                label='Notes (optional)'
                type='textarea'
                value={formData.notes}
                onChange={(val) => setFormData({ ...formData, notes: val })}
                placeholder='Any additional details...'
                rows={2}
              />
            </>
          )}

          <Button onClick={handleSubmit} fullWidth>
            Save Entry
          </Button>
        </div>
      </Modal>

      {/* Configuration Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title='Feeding Type Preferences'
      >
        <div className='space-y-4'>
          <p className='text-sm text-gray-600'>
            Customize the order of feeding types. The first option will be
            selected by default.
          </p>

          <div className='space-y-2'>
            {tempFeedingOrder.map((type, index) => (
              <div
                key={type}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <span className='font-medium text-gray-700'>
                  {getFeedingTypeLabel(type)}
                </span>
                <div className='flex gap-1'>
                  <button
                    onClick={() => moveFeedingType(index, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded ${
                      index === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveFeedingType(index, 'down')}
                    disabled={index === tempFeedingOrder.length - 1}
                    className={`p-1 rounded ${
                      index === tempFeedingOrder.length - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className='flex gap-3'>
            <Button
              onClick={() => setIsConfigModalOpen(false)}
              variant='outline'
              fullWidth
            >
              Cancel
            </Button>
            <Button onClick={saveConfig} fullWidth>
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
