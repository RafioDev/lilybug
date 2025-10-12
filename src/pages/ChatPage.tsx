import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Bot, User, Lightbulb } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { trackerService } from '../services/trackerService'
import { profileService } from '../services/profileService'
import { smartSearchService } from '../services/smartSearchService'
import { chatActionService } from '../services/chatActionService'
import type { TrackerEntry, Profile } from '../types'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  searchResult?: {
    entries: TrackerEntry[]
    summary: string
    totalCount: number
  }
  quickActions?: Array<{
    label: string
    command: string
  }>
}

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadData = async () => {
    try {
      const [entriesData, profileData] = await Promise.all([
        trackerService.getEntries(500),
        profileService.getProfile(),
      ])

      setEntries(entriesData)
      setProfile(profileData)

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'assistant',
        content: `Hi! I'm your baby tracking assistant. I can help you understand ${
          profileData?.baby_name || 'your baby'
        }'s patterns and answer questions about their sleep, feeding, and diaper changes. What would you like to know?`,
        timestamp: new Date(),
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error('Error loading chat data:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(async () => {
      try {
        const response = await generateResponse(inputMessage)
        setMessages((prev) => [...prev, response])
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: Date.now().toString() + '_error',
          type: 'assistant',
          content:
            "I'm sorry, I had trouble understanding that. Could you try rephrasing your question?",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        console.error('Error generating response:', error)
      } finally {
        setIsTyping(false)
      }
    }, 1000)
  }

  const generateResponse = async (query: string): Promise<ChatMessage> => {
    const babyName = profile?.baby_name || 'your baby'

    // First, check if this is an action command (create entry, start timer, etc.)
    const action = chatActionService.parseActionFromMessage(query)

    if (action.type === 'create_entry') {
      try {
        const actionResult = await chatActionService.executeAction(
          action,
          babyName
        )

        // Reload entries if we created a new one
        const updatedEntries = await trackerService.getEntries(500)
        setEntries(updatedEntries)

        return {
          id: Date.now().toString(),
          type: 'assistant',
          content: actionResult,
          timestamp: new Date(),
        }
      } catch (error) {
        console.error('Error generating response:', error)
        return {
          id: Date.now().toString(),
          type: 'assistant',
          content: `I had trouble creating that entry. Please try again or use the tracker page directly.`,
          timestamp: new Date(),
        }
      }
    }

    // Special handling for timer requests to provide quick actions
    if (action.type === 'start_timer') {
      const feedingTypeText =
        action.feedingType === 'breast_left'
          ? 'left breast'
          : action.feedingType === 'breast_right'
          ? 'right breast'
          : action.feedingType === 'both'
          ? 'both breasts'
          : 'bottle'

      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I can't start live timers from chat, but I can help you log feeding entries! Try one of these quick options:`,
        timestamp: new Date(),
        quickActions: [
          {
            label: `Log ${feedingTypeText} feeding`,
            command: `Log a ${feedingTypeText} feeding`,
          },
          {
            label: `Log ${feedingTypeText} feeding with quantity`,
            command: `Log a ${feedingTypeText} feeding of 120ml`,
          },
        ],
      }
    }

    // Check for greeting patterns
    const greetings = [
      'hi',
      'hello',
      'hey',
      'good morning',
      'good afternoon',
      'good evening',
    ]
    if (greetings.some((greeting) => query.toLowerCase().includes(greeting))) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Hello! I'm here to help you understand ${babyName}'s patterns. You can ask me things like "How did ${babyName.toLowerCase()} sleep last night?" or "Show me feeding patterns this week."`,
        timestamp: new Date(),
      }
    }

    // Check for help patterns
    if (
      query.toLowerCase().includes('help') ||
      query.toLowerCase().includes('what can you do')
    ) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I can help you analyze ${babyName}'s patterns and create new entries! Here are some things you can ask me:

**Ask about patterns:**
• "How many times did ${babyName.toLowerCase()} wake up last night?"
• "Show me all feedings over 100ml this week"
• "What's ${babyName.toLowerCase()}'s longest sleep session?"

**Create new entries:**
• "Log a bottle feeding of 120ml"
• "Record a dirty diaper change"
• "Add a 2 hour nap from 2pm to 4pm"
• "Start a timer for left breast feeding"

Just ask me anything about ${babyName.toLowerCase()}'s patterns or tell me what to log!`,
        timestamp: new Date(),
      }
    }

    // Try to parse as a search query
    try {
      const parsedQuery = smartSearchService.parseNaturalLanguageQuery(
        query,
        profile || undefined
      )
      const searchResult = smartSearchService.executeSearch(
        entries,
        parsedQuery,
        profile || undefined
      )

      let responseContent = searchResult.summary

      // Add conversational context
      if (searchResult.totalCount === 0) {
        responseContent = `I couldn't find any ${
          parsedQuery.type === 'all' ? 'activities' : parsedQuery.type
        } entries matching "${query}". ${babyName} might not have had any activities matching those criteria, or they might not be tracked yet.`
      } else {
        // Make the response more conversational
        if (parsedQuery.type === 'sleep') {
          responseContent = `Looking at ${babyName}'s sleep data: ${searchResult.summary}`
          if (searchResult.averages?.duration) {
            const avgHours = Math.floor(searchResult.averages.duration / 60)
            const avgMinutes = Math.round(searchResult.averages.duration % 60)
            responseContent += ` The average sleep duration was ${avgHours}h ${avgMinutes}m.`
          }
        } else if (parsedQuery.type === 'feeding') {
          responseContent = `Here's what I found about ${babyName}'s feeding: ${searchResult.summary}`
          if (searchResult.averages?.quantity) {
            responseContent += ` The average feeding amount was ${Math.round(
              searchResult.averages.quantity
            )}ml.`
          }
        } else if (parsedQuery.type === 'diaper') {
          responseContent = `Looking at ${babyName}'s diaper changes: ${searchResult.summary}`
        } else {
          responseContent = `Here's what I found: ${searchResult.summary}`
        }
      }

      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        searchResult:
          searchResult.totalCount > 0
            ? {
                entries: searchResult.entries.slice(0, 5), // Show first 5 entries
                summary: searchResult.summary,
                totalCount: searchResult.totalCount,
              }
            : undefined,
      }
    } catch (error) {
      console.error('Error generating response:', error)
      // Fallback response for unrecognized queries
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I'm not sure I understand "${query}". Try asking me about ${babyName.toLowerCase()}'s sleep, feeding, or diaper patterns. For example: "How did ${babyName.toLowerCase()} sleep last night?" or "Show me today's feedings."`,
        timestamp: new Date(),
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatEntryTime = (entry: TrackerEntry) => {
    const date = new Date(entry.start_time)
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    )
  }

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'sleep':
        return '😴'
      case 'feeding':
        return '🍼'
      case 'diaper':
        return '👶'
      default:
        return '📝'
    }
  }

  if (loading) {
    return (
      <Layout title='Chat Assistant'>
        <Card>
          <p className='text-center text-gray-500'>Loading chat...</p>
        </Card>
      </Layout>
    )
  }

  const babyName = profile?.baby_name || 'Baby'
  const suggestions = [
    `Log a bottle feeding of 120ml`,
    `Record a wet diaper change`,
    `Add a 2 hour nap`,
    `Track left breast feeding`,
    `How did ${babyName.toLowerCase()} sleep last night?`,
    `Show me today's feedings`,
  ]

  return (
    <Layout title='Chat Assistant'>
      <div className='flex flex-col h-[calc(100vh-8rem)] max-h-[600px]'>
        {/* Header */}
        <Card className='bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 mb-4'>
          <div className='flex items-center gap-3 p-4'>
            <div className='p-2 bg-white/20 rounded-full'>
              <MessageCircle size={24} />
            </div>
            <div>
              <h2 className='text-lg font-semibold'>
                Chat with {babyName}'s Assistant
              </h2>
              <p className='text-sm opacity-90'>
                Ask me anything about {babyName.toLowerCase()}'s patterns
              </p>
            </div>
          </div>
        </Card>

        {/* Messages */}
        <Card className='flex-1 flex flex-col overflow-hidden'>
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Bot className='w-4 h-4 text-blue-600' />
                  </div>
                )}

                <div
                  className={`max-w-[80%] ${
                    message.type === 'user' ? 'order-1' : ''
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className='text-sm whitespace-pre-line'>
                      {message.content}
                    </p>
                  </div>

                  {/* Search Results */}
                  {message.searchResult &&
                    message.searchResult.totalCount > 0 && (
                      <div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                        <div className='text-xs text-blue-600 font-medium mb-2'>
                          Recent entries ({message.searchResult.totalCount}{' '}
                          total):
                        </div>
                        <div className='space-y-2'>
                          {message.searchResult.entries.map((entry) => (
                            <div
                              key={entry.id}
                              className='flex items-center gap-2 text-xs'
                            >
                              <span>{getEntryIcon(entry.entry_type)}</span>
                              <span className='text-gray-600'>
                                {formatEntryTime(entry)}
                              </span>
                              <span className='text-gray-800 capitalize'>
                                {entry.entry_type}
                                {entry.quantity && ` (${entry.quantity}ml)`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Quick Actions */}
                  {message.quickActions && message.quickActions.length > 0 && (
                    <div className='mt-3 flex flex-wrap gap-2'>
                      {message.quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(action.command)}
                          className='text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition-colors border border-blue-200'
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className='text-xs text-gray-500 mt-1'>
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0'>
                    <User className='w-4 h-4 text-gray-600' />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className='flex gap-3 justify-start'>
                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <Bot className='w-4 h-4 text-blue-600' />
                </div>
                <div className='bg-gray-100 text-gray-900 p-3 rounded-lg'>
                  <div className='flex space-x-1'>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className='p-4 border-t border-gray-200'>
              <div className='flex items-center gap-2 mb-2 text-sm text-gray-600'>
                <Lightbulb className='w-4 h-4' />
                <span>Try asking:</span>
              </div>
              <div className='flex flex-wrap gap-2'>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className='text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors'
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className='p-4 border-t border-gray-200'>
            <div className='flex gap-2'>
              <Input
                type='text'
                value={inputMessage}
                onChange={setInputMessage}
                placeholder={`Ask me about ${babyName.toLowerCase()}'s patterns...`}
                className='flex-1'
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className='px-4'
              >
                <Send className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
