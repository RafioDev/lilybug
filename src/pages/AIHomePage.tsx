import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from 'react'
import { Mic, MicOff, Send, Sparkles, Clock } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Button, IconButton } from '../components/Button'
import { Input } from '../components/Input'
import { chatActionService } from '../services/chatActionService'
import { smartSearchService } from '../services/smartSearchService'
import { aiService } from '../services/aiService'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'
import {
  useEntries,
  useCreateEntry,
  useDeleteEntry,
} from '../hooks/queries/useTrackerQueries'
import { activityUtils } from '../utils/activityUtils'
import { dateUtils } from '../utils/dateUtils'
import { Modal } from '../components/Modal'
import { ActivityModal } from '../components/LazyModals'
import { GroupedActivitiesList } from '../components/GroupedActivitiesList'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { useConfirmationModal } from '../hooks/useConfirmationModal'
import type { TrackerEntry, EntryType, FeedingType, DiaperType } from '../types'

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
  const [todayStats, setTodayStats] = useState({
    feedings: 0,
    sleepHours: 0,
    diapers: 0,
  })

  // Use React Query for data
  const { data: activeBaby, isLoading: babyLoading } = useActiveBaby()
  const { data: entries = [], isLoading: entriesLoading } = useEntries(
    100,
    activeBaby?.id
  )
  const createEntryMutation = useCreateEntry()
  const deleteEntryMutation = useDeleteEntry()

  const isLoading = babyLoading || entriesLoading

  // Confirmation modal for deletions
  const confirmationModal = useConfirmationModal()

  // Activities state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TrackerEntry | null>(null)
  const [formData, setFormData] = useState({
    entryType: 'feeding' as EntryType,
    startTime: dateUtils.getCurrentLocalDateTime(),
    endTime: '',
    quantity: '',
    feedingType: 'bottle' as FeedingType,
    diaperType: 'wet' as DiaperType,
    notes: '',
  })

  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Calculate today's stats when entries change
  useEffect(() => {
    if (entries.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEntries = entries.filter(
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
    }
  }, [entries])

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

            // React Query will automatically refetch after mutations
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
    [activeBaby, entries]
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

  // Initial setup - runs only once
  useEffect(() => {
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
  }, []) // Empty dependency array - runs only once

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

  // Activities functions
  const deleteEntry = async (id: string) => {
    try {
      await deleteEntryMutation.mutateAsync(id)
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const handleDeleteEntry = (entry: TrackerEntry) => {
    const activityType = entry.entry_type

    confirmationModal.open({
      title: 'Delete Activity',
      message: `Are you sure you want to delete this ${activityType}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        await deleteEntry(entry.id)
      },
    })
  }

  const openDetailsModal = (entry: TrackerEntry) => {
    setSelectedEntry(entry)
    setIsDetailsModalOpen(true)
  }

  const openEditModal = (entry: TrackerEntry) => {
    setSelectedEntry(entry)
    setIsEditModalOpen(true)
  }

  const handleEditSave = async () => {
    // React Query will automatically update the cache
    setIsEditModalOpen(false)
  }

  const handleEditError = (error: string) => {
    console.error('Edit error:', error)
    // You could add a toast notification here
  }

  const openManualEntryModal = () => {
    setFormData({
      entryType: 'feeding',
      startTime: dateUtils.getCurrentLocalDateTime(),
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

      await createEntryMutation.mutateAsync(entry)
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

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <Layout>
        <div className='mx-auto max-w-4xl space-y-6'>
          {/* Header */}
          <div className='space-y-2 text-center'>
            <div className='flex items-center justify-center gap-3'>
              <div className='rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-3'>
                <Sparkles className='h-8 w-8 text-white' />
              </div>
              <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-100'>
                Lilybug
              </h1>
            </div>
            <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
          </div>

          {/* Loading Stats */}
          <div className='grid grid-cols-3 gap-4'>
            <Card className='text-center'>
              <div className='mx-auto mb-2 h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
              <div className='text-sm text-gray-400 dark:text-gray-500'>
                Loading...
              </div>
            </Card>
            <Card className='text-center'>
              <div className='mx-auto mb-2 h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
              <div className='text-sm text-gray-400 dark:text-gray-500'>
                Loading...
              </div>
            </Card>
            <Card className='text-center'>
              <div className='mx-auto mb-2 h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
              <div className='text-sm text-gray-400 dark:text-gray-500'>
                Loading...
              </div>
            </Card>
          </div>

          {/* Loading Voice Interface */}
          <Card className='p-8'>
            <div className='flex flex-col items-center space-y-6'>
              <div className='h-24 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700'></div>
              <div className='text-center'>
                <div className='mx-auto mb-2 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                <div className='mx-auto h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
              </div>
            </div>
          </Card>

          {/* Loading Activities */}
          <Card>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Clock className='h-5 w-5 text-gray-400 dark:text-gray-500' />
                <div className='h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
              </div>
            </div>
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700'
                >
                  <div className='h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-600'></div>
                  <div className='flex-1'>
                    <div className='mb-1 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-600'></div>
                    <div className='h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600'></div>
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
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* Header */}
        <div className='space-y-2 text-center'>
          <div className='flex items-center justify-center gap-3'>
            <div className='rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-3'>
              <Sparkles className='h-8 w-8 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-100'>
              Lilybug
            </h1>
          </div>
          <p className='text-gray-600 dark:text-gray-400'>
            {activeBaby
              ? `Tracking ${activeBaby.name}`
              : 'Add a baby to start tracking'}
          </p>
        </div>

        {/* Today's Summary */}
        {activeBaby && (
          <div className='grid grid-cols-3 gap-4'>
            <Card className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {todayStats.feedings}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-300'>
                Feedings Today
              </div>
            </Card>
            <Card className='text-center'>
              <div className='text-2xl font-bold text-cyan-600'>
                {`${todayStats.sleepHours.toFixed(1)}h`}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-300'>
                Sleep Today
              </div>
            </Card>
            <Card className='text-center'>
              <div className='text-2xl font-bold text-emerald-600'>
                {todayStats.diapers}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-300'>
                Diapers Today
              </div>
            </Card>
          </div>
        )}

        {/* AI Voice Command Interface */}
        <Card className='p-8'>
          <div className='flex flex-col items-center space-y-6'>
            {/* Primary Voice Button */}
            <IconButton
              icon={isListening ? <MicOff /> : <Mic />}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isLoading}
              variant={isListening ? 'danger' : 'primary'}
              size='lg'
              iconSize='2xl'
              fullRounded
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              className={`h-24 w-24 transition-all duration-200 ${
                isListening
                  ? 'scale-110 animate-pulse !bg-red-500 shadow-lg hover:!bg-red-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 hover:shadow-lg'
              }`}
            />

            {/* Status Text */}
            {isListening ? (
              <div className='text-center'>
                <div className='animate-pulse text-lg font-medium text-blue-600 dark:text-blue-400'>
                  🎤 Listening...
                </div>
                <div className='text-sm text-gray-500 dark:text-gray-400'>
                  {aiService.isConfigured()
                    ? "Say anything naturally - I'll understand!"
                    : "Say something like 'Log a bottle feeding'"}
                </div>
              </div>
            ) : isProcessing ? (
              <div className='text-center'>
                <div className='text-lg font-medium text-blue-600 dark:text-blue-400'>
                  {aiService.isConfigured()
                    ? '🤖 AI Processing...'
                    : 'Processing...'}
                </div>
                <div className='mt-2 flex justify-center space-x-1'>
                  <div className='h-2 w-2 animate-bounce rounded-full bg-blue-400'></div>
                  <div
                    className='h-2 w-2 animate-bounce rounded-full bg-blue-400'
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className='h-2 w-2 animate-bounce rounded-full bg-blue-400'
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className='text-center'>
                <div className='text-lg font-medium text-gray-700 dark:text-gray-200'>
                  Tap to speak
                  {aiService.isConfigured() && (
                    <span className='ml-2 text-green-600 dark:text-green-400'>
                      🤖 AI Ready
                    </span>
                  )}
                </div>
                <div className='text-sm text-gray-500 dark:text-gray-400'>
                  {aiService.isConfigured()
                    ? 'Speak naturally - no specific phrases needed!'
                    : 'Or type below if needed'}
                </div>
              </div>
            )}

            {/* Secondary Text Input */}
            <div className='flex w-full max-w-md gap-2'>
              <Input
                type='text'
                value={inputText}
                onChange={setInputText}
                placeholder='Or type your request here...'
                className='flex-1'
                disabled={isLoading}
              />
              <IconButton
                icon={<Send />}
                onClick={handleTextInput}
                disabled={!inputText.trim() || isProcessing || isLoading}
                aria-label='Send message'
                className='min-w-[60px]'
              />
            </div>
          </div>
        </Card>

        {/* Activities List */}
        <Card>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Clock className='h-5 w-5 text-gray-600 dark:text-gray-400' />
              <h3 className='font-semibold text-gray-800 dark:text-gray-200'>
                Recent Activities
              </h3>
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

          <GroupedActivitiesList
            entries={entries.slice(0, 50)} // Show more entries with grouping
            onEditEntry={openEditModal}
            onDeleteEntry={handleDeleteEntry}
            onViewDetails={openDetailsModal}
            isLoading={entriesLoading}
            className='max-h-96 overflow-y-auto'
          />
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
            <div className='flex items-center gap-3 rounded-lg bg-gray-100 p-3 dark:bg-gray-700'>
              <span className='text-3xl'>
                {activityUtils.getActivityIcon(selectedEntry.entry_type)}
              </span>
              <div>
                <p className='font-medium text-gray-900 capitalize dark:text-gray-100'>
                  {selectedEntry.entry_type}
                </p>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {new Date(selectedEntry.start_time).toLocaleString()}
                </p>
              </div>
            </div>

            <div className='space-y-3'>
              {selectedEntry.feeding_type && (
                <div>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Feeding Type
                  </label>
                  <p className='text-gray-900 capitalize dark:text-gray-100'>
                    {selectedEntry.feeding_type.replace('_', ' ')}
                  </p>
                </div>
              )}

              {selectedEntry.quantity && (
                <div>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Quantity
                  </label>
                  <p className='text-gray-900 dark:text-gray-100'>
                    {selectedEntry.quantity}
                    {selectedEntry.entry_type === 'pumping' ? 'oz' : 'ml'}
                  </p>
                </div>
              )}

              {selectedEntry.diaper_type && (
                <div>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Diaper Type
                  </label>
                  <p className='text-gray-900 capitalize dark:text-gray-100'>
                    {selectedEntry.diaper_type}
                  </p>
                </div>
              )}

              {selectedEntry.end_time && (
                <div>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Duration
                  </label>
                  <p className='text-gray-900 dark:text-gray-100'>
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
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Notes
                  </label>
                  <p className='text-gray-900 dark:text-gray-100'>
                    {selectedEntry.notes}
                  </p>
                </div>
              )}
            </div>

            <div className='flex gap-2 pt-4'>
              <Button
                onClick={() => {
                  setIsDetailsModalOpen(false)
                  handleDeleteEntry(selectedEntry)
                }}
                variant='outline'
                className='flex-1 border-red-200 text-red-600 hover:bg-red-50'
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
          <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30'>
            <p className='text-sm text-blue-800 dark:text-blue-200'>
              💡 <strong>Tip:</strong> For faster tracking, try using the voice
              assistant above! Just say "Log a bottle feeding of 4 ounces" or
              similar.
            </p>
          </div>

          {/* Entry Type Selection */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
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
                    className={`rounded-xl border-2 p-3 capitalize transition-all ${
                      formData.entryType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {activityUtils.getActivityIcon(type)} {type}
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
                <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
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
                      className={`rounded-xl border-2 p-3 text-sm transition-all ${
                        formData.feedingType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
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
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Diaper Type
              </label>
              <div className='grid grid-cols-3 gap-2'>
                {(['wet', 'dirty', 'both'] as DiaperType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setFormData({ ...formData, diaperType: type })
                    }
                    className={`rounded-xl border-2 p-3 capitalize transition-all ${
                      formData.diaperType === type
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
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
      <Suspense fallback={<div>Loading modal...</div>}>
        <ActivityModal
          isOpen={isEditModalOpen}
          entry={selectedEntry}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
          onError={handleEditError}
        />
      </Suspense>

      {/* Confirmation Modal */}
      {confirmationModal.config && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={confirmationModal.close}
          onConfirm={confirmationModal.confirm}
          title={confirmationModal.config.title}
          message={confirmationModal.config.message}
          confirmText={confirmationModal.config.confirmText}
          cancelText={confirmationModal.config.cancelText}
          isLoading={confirmationModal.isLoading}
          variant={confirmationModal.config.variant}
        />
      )}
    </Layout>
  )
}
