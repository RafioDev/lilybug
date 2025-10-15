import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Send, Sparkles, Clock } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { chatActionService } from '../services/chatActionService'
import { smartSearchService } from '../services/smartSearchService'
import { trackerService } from '../services/trackerService'
import { babyService } from '../services/babyService'
import { aiService } from '../services/aiService'
import type { TrackerEntry, Baby } from '../types'

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
  const [activeBaby, setActiveBaby] = useState<Baby | null>(null)
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [recentActivity, setRecentActivity] = useState<TrackerEntry | null>(
    null
  )
  const [todayStats, setTodayStats] = useState({
    feedings: 0,
    sleepHours: 0,
    diapers: 0,
  })

  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadData = useCallback(async () => {
    try {
      const activeBabyData = await babyService.getActiveBaby()
      const entriesData = await trackerService.getEntries(
        100,
        activeBabyData?.id
      )

      setActiveBaby(activeBabyData)
      setEntries(entriesData)

      // Get most recent activity
      if (entriesData.length > 0) {
        setRecentActivity(entriesData[0])
      }

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

            // Refresh data
            await loadData()
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

  useEffect(() => {
    loadData()

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

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript
          handleVoiceInput(transcript)
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
  }, [handleVoiceInput, loadData])

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  return (
    <Layout>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <div className='flex items-center justify-center gap-3'>
            <div className='p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full'>
              <Sparkles className='w-8 h-8 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-gray-800'>
              AI Baby Tracker
            </h1>
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
            <Card className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {todayStats.feedings}
              </div>
              <div className='text-sm text-gray-600'>Feedings Today</div>
            </Card>
            <Card className='text-center'>
              <div className='text-2xl font-bold text-cyan-600'>
                {todayStats.sleepHours.toFixed(1)}h
              </div>
              <div className='text-sm text-gray-600'>Sleep Today</div>
            </Card>
            <Card className='text-center'>
              <div className='text-2xl font-bold text-emerald-600'>
                {todayStats.diapers}
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
              disabled={isProcessing}
              className={`w-24 h-24 rounded-full transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 animate-pulse shadow-lg scale-110'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:scale-105'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              />
              <Button
                onClick={handleTextInput}
                disabled={!inputText.trim() || isProcessing}
                className='px-4'
              >
                <Send className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        {recentActivity && (
          <Card>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-semibold text-gray-800'>Recent Activity</h3>
                <div className='flex items-center gap-2 mt-1'>
                  <span className='text-2xl'>
                    {getActivityIcon(recentActivity.entry_type)}
                  </span>
                  <span className='text-gray-600 capitalize'>
                    {recentActivity.entry_type}
                  </span>
                  <span className='text-sm text-gray-500'>
                    {formatTime(new Date(recentActivity.start_time))}
                  </span>
                </div>
              </div>
              <Clock className='w-5 h-5 text-gray-400' />
            </div>
          </Card>
        )}

        {/* Quick Examples */}
        <Card>
          <h3 className='font-semibold text-gray-800 mb-3'>
            Try saying these:
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm'>
            <div className='p-2 bg-blue-50 rounded-lg'>
              "Log a bottle feeding of 4 ounces"
            </div>
            <div className='p-2 bg-cyan-50 rounded-lg'>
              "Record a 2 hour nap"
            </div>
            <div className='p-2 bg-emerald-50 rounded-lg'>
              "Add a wet diaper change"
            </div>
            <div className='p-2 bg-pink-50 rounded-lg'>
              "Log pumping session 3 ounces"
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
