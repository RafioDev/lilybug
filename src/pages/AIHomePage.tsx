import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Send, Sparkles, Clock, Edit3, Trash2 } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { chatActionService } from '../services/chatActionService'
import { smartSearchService } from '../services/smartSearchService'
import { trackerService } from '../services/trackerService'
import { babyService } from '../services/babyService'
import { aiService } from '../services/aiService'
import { Modal } from '../components/Modal'
import { EditActivityModal } from '../components/EditActivityModal'
import type {
  TrackerEntry,
  Baby,
  EntryType,
  FeedingType,
  DiaperType,
} from '../types'

// Speech Recognition types
interface SpeechRecognitionResult {
  transcript: string
  confidence: number
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult[]
  length: number
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionInterface {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionInterface
    SpeechRecognition?: new () => SpeechRecognitionInterface
  }
}

interface AIMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isVoice?: boolean
}

export const AIHomePage: React.FC = () => {
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Full page loading (initial only)
  const [isUpdatingData, setIsUpdatingData] = useState(false) // Subtle loading for data updates
  const [activeBaby, setActiveBaby] = useState<Baby | null>(null)
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [todayStats, setTodayStats] = useState({
    feedings: 0,
    sleepHours: 0,
    diapers: 0,
  })

  // Activities state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TrackerEntry | null>(null)
  const [formData, setFormData] = useState({
    entryType: 'feeding' as EntryType,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: '',
    quantity: '',
    feedingType: 'bottle' as FeedingType,
    diaperType: 'wet' as DiaperType,
    notes: '',
  })

  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadData = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true)
      } else {
        setIsUpdatingData(true)
      }

      const activeBabyData = await babyService.getActiveBaby()
      const entriesData = await trackerService.getEntries(
        100,
        activeBabyData?.id
      )

      setActiveBaby(activeBabyData)
      setEntries(entriesData)

      // Calculate today's stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEntries = entriesData.filter(
        (entry) => new Date(entry.start_time) >= today
      )

      const stats = {
        feedings: todayEntries.filter((e) => e.entry_type === 'feeding').length,
        sleepHours: todayEntries
          .filter((e) => e.entry_type === 'sleep' && e.end_time)
          .reduce((total, entry) => {
            const start = new Date(entry.start_time)
            const end = new Date(entry.end_time!)
            return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          }, 0),
        diapers: todayEntries.filter((e) => e.entry_type === 'diaper').length,
      }

      setTodayStats(stats)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      if (isInitialLoad) {
        setIsLoading(false)
      } else {
        setIsUpdatingData(false)
      }
    }
  }, [])

  const processMessage = useCallback(
    async (message: string) => {
      setIsProcessing(true)

      try {
        const babyName = activeBaby?.name || 'your baby'

        // Parse the action using AI
        const action = await chatActionService.parseActionFromMessage(
          message,
          babyName
        )

        let responseContent = ''

        if (action.type === 'create_entry') {
          if (!activeBaby) {
            responseContent =
              'Please add a baby first before tracking activities.'
          } else {
            // Execute the action
            const actionResult = await chatActionService.executeAction(
              action,
              babyName,
              activeBaby.id
            )
            responseContent = actionResult

            // Refresh data (not initial load)
            await loadData(false)
          }
        } else if (action.type === 'start_timer') {
          const feedingTypeText =
            action.feedingType === 'breast_left'
              ? 'left breast'
              : action.feedingType === 'breast_right'
              ? 'right breast'
              : action.feedingType === 'both'
              ? 'both breasts'
              : 'bottle'

          responseContent = `I can't start live timers, but I can log completed feedings! Try saying "Log a ${feedingTypeText} feeding of 120ml" or just "Log ${feedingTypeText} feeding".`
        } else {
          // Handle as search query
          try {
            const parsedQuery =
              smartSearchService.parseNaturalLanguageQuery(message)
            const searchResult = smartSearchService.executeSearch(
              entries,
              parsedQuery
            )

            if (searchResult.totalCount === 0) {
              responseContent = `I couldn't find any ${
                parsedQuery.type === 'all' ? 'activities' : parsedQuery.type
              } matching "${message}". ${babyName} might not have had any activities matching those criteria yet.`
            } else {
              responseContent = `Looking at ${babyName}'s data: ${searchResult.summary}`
            }
          } catch (error) {
            console.error('Error generating response:', error)
            responseContent = `I can help you track ${babyName}'s activities! Try saying things like "Log a bottle feeding of 120ml" or "How did ${babyName.toLowerCase()} sleep last night?"`
          }
        }

        const assistantMessage: AIMessage = {
          id: Date.now().toString() + '_assistant',
          type: 'assistant',
          content: responseContent,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error('Error processing message:', error)

        const errorMessage: AIMessage = {
          id: Date.now().toString() + '_error',
          type: 'assistant',
          content:
            "I'm sorry, I had trouble with that request. Could you try again?",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsProcessing(false)
      }
    },
    [activeBaby, entries, loadData]
  )

  const handleVoiceInput = useCallback(
    async (transcript: string) => {
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: transcript,
        timestamp: new Date(),
        isVoice: true,
      }

      setMessages((prev) => [...prev, userMessage])
      await processMessage(transcript)
    },
    [processMessage]
  )

  // Initial data load and setup - runs only once
  useEffect(() => {
    loadData(true)

    // Initialize speech recognition
    if (window.webkitSpeechRecognition || window.SpeechRecognition) {
      const SpeechRecognitionClass =
        window.webkitSpeechRecognition || window.SpeechRecognition
      if (SpeechRecognitionClass) {
        recognitionRef.current = new SpeechRecognitionClass()

        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onstart = () => {
          setIsListening(true)
        }

        recognitionRef.current.onerror = (
          event: SpeechRecognitionErrorEvent
        ) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    // Add welcome message
    const welcomeMessage: AIMessage = {
      id: 'welcome',
      type: 'assistant',
      content: `Hi! I'm your AI baby tracking assistant. Just talk to me to log activities! Try saying "Log a bottle feeding of 4 ounces" or "Record a wet diaper change".`,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [loadData]) // Empty dependency array - runs only once

  // Update speech recognition handler when handleVoiceInput changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        handleVoiceInput(transcript)
      }
    }
  }, [handleVoiceInput])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleTextInput = async () => {
    if (!inputText.trim()) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
      isVoice: false,
    }

    setMessages((prev) => [...prev, userMessage])
    const message = inputText
    setInputText('')
    await processMessage(message)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'feeding':
        return '🍼'
      case 'sleep':
        return '😴'
      case 'diaper':
        return '👶'
      case 'pumping':
        return '🥛'
      default:
        return '📝'
    }
  }

  // Activities functions
  const deleteEntry = async (id: string) => {
    try {
      await trackerService.deleteEntry(id)
      await loadData(false)
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const openDetailsModal = (entry: TrackerEntry) => {
    setSelectedEntry(entry)
    setIsDetailsModalOpen(true)
  }

  const openEditModal = (entry: TrackerEntry) => {
    setSelectedEntry(entry)
    setIsEditModalOpen(true)
  }

  const handleEditSave = async (updatedEntry: TrackerEntry) => {
    // Update the entries list with the updated entry
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    )

    // Refresh data to ensure consistency
    await loadData(false)
    setIsEditModalOpen(false)
  }

  const handleEditError = (error: string) => {
    console.error('Edit error:', error)
    // You could add a toast notification here
  }

  const openManualEntryModal = () => {
    setFormData({
      entryType: 'feeding',
      startTime: new Date().toISOString().slice(0, 16),
      endTime: '',
      quantity: '',
      feedingType: 'bottle',
      diaperType: 'wet',
      notes: '',
    })
    setIsManualEntryModalOpen(true)
  }

  const handleManualSubmit = async () => {
    if (!activeBaby) {
      console.error('No active baby selected')
      return
    }

    try {
      const entry = {
        entry_type: formData.entryType,
        start_time: formData.startTime,
        end_time: formData.endTime || null,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        feeding_type:
          formData.entryType === 'feeding' ? formData.feedingType : null,
        diaper_type:
          formData.entryType === 'diaper' ? formData.diaperType : null,
        notes: formData.notes || null,
        baby_id: activeBaby.id,
      }

      await trackerService.createEntry(entry)
      await loadData(false)
      setIsManualEntryModalOpen(false)
    } catch (error) {
      console.error('Error creating manual entry:', error)
    }
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

  const getEntryDetails = (entry: TrackerEntry) => {
    const startTime = new Date(entry.start_time)
    const timeStr = startTime.toLocaleString()
    const feedingType = entry.feeding_type?.replace('_', ' ') || 'feeding'
    const quantity = entry.quantity ? ` (${entry.quantity}ml)` : ''
    const diaperType = entry.diaper_type || 'diaper'

    switch (entry.entry_type) {
      case 'feeding':
        return `${feedingType}${quantity} at ${timeStr}`

      case 'sleep':
        if (entry.end_time) {
          const endTime = new Date(entry.end_time)
          const duration = Math.round(
            (endTime.getTime() - startTime.getTime()) / (1000 * 60)
          )
          const hours = Math.floor(duration / 60)
          const minutes = duration % 60
          const durationStr =
            hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
          return `Sleep for ${durationStr} at ${timeStr}`
        }
        return `Sleep started at ${timeStr}`

      case 'diaper':
        return `${diaperType} diaper at ${timeStr}`

      case 'pumping': {
        const pumpQuantity = entry.quantity ? ` (${entry.quantity}oz)` : ''
        return `Pumping${pumpQuantity} at ${timeStr}`
      }

      default:
        return `${entry.entry_type} at ${timeStr}`
    }
  }

  const formatEntryTime = (entry: TrackerEntry) => {
    const date = new Date(entry.start_time)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <Layout>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Header */}
          <div className='text-center space-y-2'>
            <div className='flex items-center justify-center gap-3'>
              <div className='p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full'>
                <Sparkles className='w-8 h-8 text-white' />
              </div>
              <h1 className='text-3xl font-bold text-gray-800'>Lilybug</h1>
            </div>
            <p className='text-gray-600'>Loading...</p>
          </div>

          {/* Loading Stats */}
          <div className='grid grid-cols-3 gap-4'>
            <Card className='text-center'>
              <div className='w-8 h-8 bg-gray-200 rounded mx-auto mb-2 animate-pulse'></div>
              <div className='text-sm text-gray-400'>Loading...</div>
            </Card>
            <Card className='text-center'>
              <div className='w-8 h-8 bg-gray-200 rounded mx-auto mb-2 animate-pulse'></div>
              <div className='text-sm text-gray-400'>Loading...</div>
            </Card>
            <Card className='text-center'>
              <div className='w-8 h-8 bg-gray-200 rounded mx-auto mb-2 animate-pulse'></div>
              <div className='text-sm text-gray-400'>Loading...</div>
            </Card>
          </div>

          {/* Loading Voice Interface */}
          <Card className='p-8'>
            <div className='flex flex-col items-center space-y-6'>
              <div className='w-24 h-24 bg-gray-200 rounded-full animate-pulse'></div>
              <div className='text-center'>
                <div className='w-32 h-6 bg-gray-200 rounded mx-auto mb-2 animate-pulse'></div>
                <div className='w-48 h-4 bg-gray-200 rounded mx-auto animate-pulse'></div>
              </div>
            </div>
          </Card>

          {/* Loading Activities */}
          <Card>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <Clock className='w-5 h-5 text-gray-400' />
                <div className='w-32 h-5 bg-gray-200 rounded animate-pulse'></div>
              </div>
            </div>
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'
                >
                  <div className='w-8 h-8 bg-gray-200 rounded animate-pulse'></div>
                  <div className='flex-1'>
                    <div className='w-48 h-4 bg-gray-200 rounded mb-1 animate-pulse'></div>
                    <div className='w-24 h-3 bg-gray-200 rounded animate-pulse'></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <div className='flex items-center justify-center gap-3'>
            <div className='p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full'>
              <Sparkles className='w-8 h-8 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-gray-800'>Lilybug</h1>
          </div>
          <p className='text-gray-600'>
            {activeBaby
              ? `Tracking ${activeBaby.name}`
              : 'Add a baby to start tracking'}
          </p>
        </div>

        {/* Today's Summary */}
        {activeBaby && (
          <div className='grid grid-cols-3 gap-4'>
            <Card
              className={`text-center transition-opacity ${
                isUpdatingData ? 'opacity-60' : ''
              }`}
            >
              <div className='text-2xl font-bold text-blue-600'>
                {isUpdatingData ? (
                  <div className='w-8 h-8 bg-blue-200 rounded mx-auto animate-pulse'></div>
                ) : (
                  todayStats.feedings
                )}
              </div>
              <div className='text-sm text-gray-600'>Feedings Today</div>
            </Card>
            <Card
              className={`text-center transition-opacity ${
                isUpdatingData ? 'opacity-60' : ''
              }`}
            >
              <div className='text-2xl font-bold text-cyan-600'>
                {isUpdatingData ? (
                  <div className='w-8 h-8 bg-cyan-200 rounded mx-auto animate-pulse'></div>
                ) : (
                  `${todayStats.sleepHours.toFixed(1)}h`
                )}
              </div>
              <div className='text-sm text-gray-600'>Sleep Today</div>
            </Card>
            <Card
              className={`text-center transition-opacity ${
                isUpdatingData ? 'opacity-60' : ''
              }`}
            >
              <div className='text-2xl font-bold text-emerald-600'>
                {isUpdatingData ? (
                  <div className='w-8 h-8 bg-emerald-200 rounded mx-auto animate-pulse'></div>
                ) : (
                  todayStats.diapers
                )}
              </div>
              <div className='text-sm text-gray-600'>Diapers Today</div>
            </Card>
          </div>
        )}

        {/* AI Voice Command Interface */}
        <Card className='p-8'>
          <div className='flex flex-col items-center space-y-6'>
            {/* Primary Voice Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isLoading}
              className={`w-24 h-24 rounded-full transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 animate-pulse shadow-lg scale-110'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:scale-105'
              } ${
                isProcessing || isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isListening ? (
                <MicOff className='w-12 h-12 text-white mx-auto' />
              ) : (
                <Mic className='w-12 h-12 text-white mx-auto' />
              )}
            </button>

            {/* Status Text */}
            {isListening ? (
              <div className='text-center'>
                <div className='text-blue-600 font-medium animate-pulse text-lg'>
                  🎤 Listening...
                </div>
                <div className='text-sm text-gray-500'>
                  {aiService.isConfigured()
                    ? "Say anything naturally - I'll understand!"
                    : "Say something like 'Log a bottle feeding'"}
                </div>
              </div>
            ) : isProcessing ? (
              <div className='text-center'>
                <div className='text-blue-600 font-medium text-lg'>
                  {aiService.isConfigured()
                    ? '🤖 AI Processing...'
                    : 'Processing...'}
                </div>
                <div className='flex justify-center space-x-1 mt-2'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full animate-bounce'></div>
                  <div
                    className='w-2 h-2 bg-blue-400 rounded-full animate-bounce'
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className='w-2 h-2 bg-blue-400 rounded-full animate-bounce'
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className='text-center'>
                <div className='text-gray-700 font-medium text-lg'>
                  Tap to speak
                  {aiService.isConfigured() && (
                    <span className='text-green-600 ml-2'>🤖 AI Ready</span>
                  )}
                </div>
                <div className='text-sm text-gray-500'>
                  {aiService.isConfigured()
                    ? 'Speak naturally - no specific phrases needed!'
                    : 'Or type below if needed'}
                </div>
              </div>
            )}

            {/* Secondary Text Input */}
            <div className='w-full max-w-md flex gap-2'>
              <Input
                type='text'
                value={inputText}
                onChange={setInputText}
                placeholder='Or type your request here...'
                className='flex-1'
                disabled={isLoading}
              />
              <Button
                onClick={handleTextInput}
                disabled={!inputText.trim() || isProcessing || isLoading}
                className='px-4'
              >
                <Send className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </Card>

        {/* Activities List */}
        <Card>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <Clock className='w-5 h-5 text-gray-600' />
              <h3 className='font-semibold text-gray-800'>Recent Activities</h3>
              {isUpdatingData && (
                <div className='flex items-center gap-2 text-sm text-blue-600'>
                  <div className='w-3 h-3 bg-blue-400 rounded-full animate-pulse'></div>
                  <span>Updating...</span>
                </div>
              )}
            </div>
            <Button
              onClick={openManualEntryModal}
              variant='outline'
              className='text-sm'
              disabled={isLoading}
            >
              Manual Entry
            </Button>
          </div>

          {entries.length === 0 ? (
            <div className='text-center py-8'>
              <Clock className='w-12 h-12 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500 mb-2'>No activities tracked yet</p>
              <p className='text-sm text-gray-400'>
                Use the voice assistant above to log activities
              </p>
            </div>
          ) : (
            <div
              className={`space-y-3 max-h-96 overflow-y-auto transition-opacity ${
                isUpdatingData ? 'opacity-70' : ''
              }`}
            >
              {entries.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
                  onClick={() => openDetailsModal(entry)}
                >
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl'>
                      {getActivityIcon(entry.entry_type)}
                    </span>
                    <div>
                      <p className='font-medium text-gray-900 text-sm'>
                        {getEntryDetails(entry)}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {formatEntryTime(entry)}
                      </p>
                      {entry.notes && (
                        <p className='text-xs text-gray-400 mt-1 italic'>
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(entry)
                      }}
                      className='p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors'
                      title='Edit entry'
                    >
                      <Edit3 className='w-4 h-4' />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteEntry(entry.id)
                      }}
                      className='p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors'
                      title='Delete entry'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Entry Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title='Activity Details'
      >
        {selectedEntry && (
          <div className='space-y-4'>
            <div className='flex items-center gap-3 p-3 bg-gray-100 rounded-lg'>
              <span className='text-3xl'>
                {getActivityIcon(selectedEntry.entry_type)}
              </span>
              <div>
                <p className='font-medium text-gray-900 capitalize'>
                  {selectedEntry.entry_type}
                </p>
                <p className='text-sm text-gray-500'>
                  {new Date(selectedEntry.start_time).toLocaleString()}
                </p>
              </div>
            </div>

            <div className='space-y-3'>
              {selectedEntry.feeding_type && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Feeding Type
                  </label>
                  <p className='text-gray-900 capitalize'>
                    {selectedEntry.feeding_type.replace('_', ' ')}
                  </p>
                </div>
              )}

              {selectedEntry.quantity && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Quantity
                  </label>
                  <p className='text-gray-900'>
                    {selectedEntry.quantity}
                    {selectedEntry.entry_type === 'pumping' ? 'oz' : 'ml'}
                  </p>
                </div>
              )}

              {selectedEntry.diaper_type && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Diaper Type
                  </label>
                  <p className='text-gray-900 capitalize'>
                    {selectedEntry.diaper_type}
                  </p>
                </div>
              )}

              {selectedEntry.end_time && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Duration
                  </label>
                  <p className='text-gray-900'>
                    {(() => {
                      const start = new Date(selectedEntry.start_time)
                      const end = new Date(selectedEntry.end_time!)
                      const duration = Math.round(
                        (end.getTime() - start.getTime()) / (1000 * 60)
                      )
                      const hours = Math.floor(duration / 60)
                      const minutes = duration % 60
                      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
                    })()}
                  </p>
                </div>
              )}

              {selectedEntry.notes && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Notes
                  </label>
                  <p className='text-gray-900'>{selectedEntry.notes}</p>
                </div>
              )}
            </div>

            <div className='flex gap-2 pt-4'>
              <Button
                onClick={() => deleteEntry(selectedEntry.id)}
                variant='outline'
                className='flex-1 text-red-600 border-red-200 hover:bg-red-50'
              >
                Delete Entry
              </Button>
              <Button
                onClick={() => setIsDetailsModalOpen(false)}
                className='flex-1'
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={isManualEntryModalOpen}
        onClose={() => setIsManualEntryModalOpen(false)}
        title='Manual Entry'
      >
        <div className='space-y-4'>
          <div className='p-3 bg-blue-50 rounded-lg'>
            <p className='text-sm text-blue-800'>
              💡 <strong>Tip:</strong> For faster tracking, try using the voice
              assistant above! Just say "Log a bottle feeding of 4 ounces" or
              similar.
            </p>
          </div>

          {/* Entry Type Selection */}
          <div>
            <label className='text-sm font-medium text-gray-700 block mb-2'>
              Activity Type
            </label>
            <div className='grid grid-cols-2 gap-2'>
              {(['feeding', 'sleep', 'diaper', 'pumping'] as EntryType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setFormData({ ...formData, entryType: type })
                    }
                    className={`p-3 rounded-xl border-2 transition-all capitalize ${
                      formData.entryType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {getActivityIcon(type)} {type}
                  </button>
                )
              )}
            </div>
          </div>

          <Input
            label='Start Time'
            type='datetime-local'
            value={formData.startTime}
            onChange={(val) => setFormData({ ...formData, startTime: val })}
          />

          {formData.entryType === 'sleep' && (
            <Input
              label='End Time (optional)'
              type='datetime-local'
              value={formData.endTime}
              onChange={(val) => setFormData({ ...formData, endTime: val })}
            />
          )}

          {formData.entryType === 'feeding' && (
            <>
              <div>
                <label className='text-sm font-medium text-gray-700 block mb-2'>
                  Feeding Type
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {(
                    [
                      'both',
                      'breast_left',
                      'breast_right',
                      'bottle',
                    ] as FeedingType[]
                  ).map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setFormData({ ...formData, feedingType: type })
                      }
                      className={`p-3 rounded-xl border-2 transition-all text-sm ${
                        formData.feedingType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {getFeedingTypeLabel(type)}
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

          {formData.entryType === 'pumping' && (
            <Input
              label='Amount (oz)'
              type='number'
              step='0.5'
              value={formData.quantity}
              onChange={(val) => setFormData({ ...formData, quantity: val })}
              placeholder='e.g., 4'
            />
          )}

          {formData.entryType === 'diaper' && (
            <div>
              <label className='text-sm font-medium text-gray-700 block mb-2'>
                Diaper Type
              </label>
              <div className='grid grid-cols-3 gap-2'>
                {(['wet', 'dirty', 'both'] as DiaperType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setFormData({ ...formData, diaperType: type })
                    }
                    className={`p-3 rounded-xl border-2 transition-all capitalize ${
                      formData.diaperType === type
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {type}
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

          <div className='flex gap-3'>
            <Button
              onClick={() => setIsManualEntryModalOpen(false)}
              variant='outline'
              fullWidth
            >
              Cancel
            </Button>
            <Button onClick={handleManualSubmit} fullWidth>
              Save Entry
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Activity Modal */}
      <EditActivityModal
        isOpen={isEditModalOpen}
        entry={selectedEntry}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        onError={handleEditError}
      />
    </Layout>
  )
}
