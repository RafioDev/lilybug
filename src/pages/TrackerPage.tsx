import React, { useState, useEffect } from 'react'
import {
  Wine,
  Moon,
  Baby,
  Droplets,
  Plus,
  Play,
  Square,
  Clock,
  Settings,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { Input } from '../components/Input'
import { trackerService } from '../services/trackerService'
import { configService } from '../services/configService'
import type { TrackerEntry, EntryType, FeedingType, DiaperType } from '../types'

export const TrackerPage: React.FC = () => {
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<EntryType | null>(null)
  const [loading, setLoading] = useState(true)

  // Timer states for feeding
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [feedingTab, setFeedingTab] = useState<'timer' | 'manual'>('timer')

  // Configuration states
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [feedingTypeOrder, setFeedingTypeOrder] = useState<FeedingType[]>([])
  const [tempFeedingOrder, setTempFeedingOrder] = useState<FeedingType[]>([])

  // Entry details modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TrackerEntry | null>(null)

  const [formData, setFormData] = useState({
    startTime: new Date().toISOString().slice(0, 16),
    endTime: '',
    quantity: '',
    feedingType: 'bottle' as FeedingType,
    diaperType: 'wet' as DiaperType,
    notes: '',
  })

  useEffect(() => {
    loadEntries()
    loadConfig()
  }, [])

  const loadConfig = () => {
    const config = configService.getConfig()
    setFeedingTypeOrder(config.feedingTypeOrder)
  }

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

  const loadEntries = async () => {
    try {
      const data = await trackerService.getEntries()
      setEntries(data)
    } catch (error) {
      console.error('Error loading entries:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const openDetailsModal = (entry: TrackerEntry) => {
    setSelectedEntry(entry)
    setIsDetailsModalOpen(true)
  }

  const getDetailedEntryInfo = (entry: TrackerEntry) => {
    const startTime = new Date(entry.start_time)
    const endTime = entry.end_time ? new Date(entry.end_time) : null

    let duration = ''
    if (endTime) {
      const durationMs = endTime.getTime() - startTime.getTime()
      const minutes = Math.floor(durationMs / 1000 / 60)
      const hours = Math.floor(minutes / 60)

      if (hours > 0) {
        duration = `${hours}h ${minutes % 60}m`
      } else {
        duration = `${minutes}m`
      }
    }

    return {
      startTime: startTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      endTime: endTime
        ? endTime.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : null,
      duration,
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
    if (!selectedType) return

    try {
      const entry = {
        entry_type: selectedType,
        start_time: formData.startTime,
        end_time: formData.endTime || null,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        feeding_type: selectedType === 'feeding' ? formData.feedingType : null,
        diaper_type: selectedType === 'diaper' ? formData.diaperType : null,
        notes: formData.notes || null,
      }

      await trackerService.createEntry(entry)
      await loadEntries()

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
      icon: Baby,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      type: 'pumping' as EntryType,
      label: 'Pumping',
      icon: Droplets,
      color: 'from-pink-500 to-pink-600',
    },
  ]

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getEntryIcon = (type: EntryType) => {
    const item = trackerTypes.find((t) => t.type === type)
    return item ? item.icon : Baby
  }

  const getEntryDetails = (entry: TrackerEntry) => {
    if (entry.entry_type === 'feeding' && entry.quantity) {
      return `${entry.quantity} oz • ${entry.feeding_type}`
    }
    if (entry.entry_type === 'diaper') {
      return entry.diaper_type
    }
    if (entry.entry_type === 'sleep' && entry.end_time) {
      const duration =
        (new Date(entry.end_time).getTime() -
          new Date(entry.start_time).getTime()) /
        1000 /
        60
      return `${Math.round(duration)} min`
    }
    if (entry.entry_type === 'pumping' && entry.quantity) {
      return `${entry.quantity} oz`
    }
    return ''
  }

  return (
    <Layout title='Baby Tracker'>
      <div className='lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0'>
        {/* Quick Actions - Full width on mobile, left column on desktop */}
        <div className='lg:col-span-1'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4 px-1 lg:text-xl'>
            Quick Actions
          </h2>
          <div className='grid grid-cols-2 lg:grid-cols-1 gap-3'>
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

        {/* Recent Activity - Full width on mobile, right columns on desktop */}
        <div className='lg:col-span-2'>
          <h2 className='text-lg lg:text-xl font-semibold text-gray-800 mb-4 px-1'>
            Recent Activity
          </h2>
          {loading ? (
            <Card>
              <p className='text-center text-gray-500'>Loading entries...</p>
            </Card>
          ) : entries.length === 0 ? (
            <Card>
              <p className='text-center text-gray-500'>
                No entries yet. Use the quick actions to start tracking!
              </p>
            </Card>
          ) : (
            <div className='space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0'>
              {entries.map((entry) => {
                const Icon = getEntryIcon(entry.entry_type)
                return (
                  <Card
                    key={entry.id}
                    padding='none'
                    className='lg:h-fit overflow-hidden'
                  >
                    <button
                      onClick={() => openDetailsModal(entry)}
                      className='w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left'
                    >
                      <div className='p-2 bg-gray-100 rounded-lg flex-shrink-0'>
                        <Icon size={20} className='text-gray-600' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='flex-1'>
                            <p className='font-medium text-gray-800 capitalize'>
                              {entry.entry_type}
                            </p>
                            <p className='text-sm text-gray-500'>
                              {getEntryDetails(entry)}
                            </p>
                            {entry.notes && (
                              <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                                {entry.notes}
                              </p>
                            )}
                          </div>
                          <div className='text-right flex-shrink-0'>
                            <p className='text-sm font-medium text-gray-700'>
                              {formatTime(entry.start_time)}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {formatDate(entry.start_time)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  </Card>
                )
              })}
            </div>
          )}
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

      {/* Entry Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={
          selectedEntry
            ? `${
                selectedEntry.entry_type.charAt(0).toUpperCase() +
                selectedEntry.entry_type.slice(1)
              } Details`
            : 'Entry Details'
        }
      >
        {selectedEntry && (
          <div className='space-y-4'>
            <div className='flex items-center gap-3 pb-4 border-b border-gray-200'>
              {(() => {
                const Icon = getEntryIcon(selectedEntry.entry_type)
                return (
                  <div className='p-3 bg-gray-100 rounded-lg'>
                    <Icon size={24} className='text-gray-600' />
                  </div>
                )
              })()}
              <div>
                <h3 className='text-lg font-semibold text-gray-800 capitalize'>
                  {selectedEntry.entry_type}
                </h3>
                <p className='text-sm text-gray-500'>
                  {formatDate(selectedEntry.start_time)}
                </p>
              </div>
            </div>

            <div className='space-y-3'>
              <div>
                <label className='text-sm font-medium text-gray-700 block mb-1'>
                  Start Time
                </label>
                <p className='text-gray-800'>
                  {getDetailedEntryInfo(selectedEntry).startTime}
                </p>
              </div>

              {selectedEntry.end_time && (
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>
                    End Time
                  </label>
                  <p className='text-gray-800'>
                    {getDetailedEntryInfo(selectedEntry).endTime}
                  </p>
                </div>
              )}

              {getDetailedEntryInfo(selectedEntry).duration && (
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>
                    Duration
                  </label>
                  <p className='text-gray-800'>
                    {getDetailedEntryInfo(selectedEntry).duration}
                  </p>
                </div>
              )}

              {selectedEntry.entry_type === 'feeding' &&
                selectedEntry.feeding_type && (
                  <div>
                    <label className='text-sm font-medium text-gray-700 block mb-1'>
                      Feeding Type
                    </label>
                    <p className='text-gray-800'>
                      {getFeedingTypeLabel(selectedEntry.feeding_type)}
                    </p>
                  </div>
                )}

              {selectedEntry.entry_type === 'diaper' &&
                selectedEntry.diaper_type && (
                  <div>
                    <label className='text-sm font-medium text-gray-700 block mb-1'>
                      Diaper Type
                    </label>
                    <p className='text-gray-800 capitalize'>
                      {selectedEntry.diaper_type}
                    </p>
                  </div>
                )}

              {selectedEntry.quantity && (
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>
                    Amount
                  </label>
                  <p className='text-gray-800'>{selectedEntry.quantity} oz</p>
                </div>
              )}

              {selectedEntry.notes && (
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>
                    Notes
                  </label>
                  <p className='text-gray-800 whitespace-pre-wrap'>
                    {selectedEntry.notes}
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={() => setIsDetailsModalOpen(false)}
              fullWidth
              variant='outline'
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
