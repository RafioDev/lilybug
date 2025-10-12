import React, { useState, useEffect } from 'react'
import { Clock, Trash2 } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { trackerService } from '../services/trackerService'
import type { TrackerEntry } from '../types'

export const ActivitiesPage: React.FC = () => {
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TrackerEntry | null>(null)

  useEffect(() => {
    loadEntries()
  }, [])

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

  const deleteEntry = async (id: string) => {
    try {
      await trackerService.deleteEntry(id)
      await loadEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const openDetailsModal = (entry: TrackerEntry) => {
    setSelectedEntry(entry)
    setIsDetailsModalOpen(true)
  }

  const getEntryIcon = (type: string) => {
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

  const getEntryDetails = (entry: TrackerEntry) => {
    const startTime = new Date(entry.start_time)
    const timeStr = startTime.toLocaleString()

    switch (entry.entry_type) {
      case 'feeding':
        const feedingType = entry.feeding_type?.replace('_', ' ') || 'feeding'
        const quantity = entry.quantity ? ` (${entry.quantity}ml)` : ''
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
        const diaperType = entry.diaper_type || 'diaper'
        return `${diaperType} diaper at ${timeStr}`

      case 'pumping':
        const pumpQuantity = entry.quantity ? ` (${entry.quantity}oz)` : ''
        return `Pumping${pumpQuantity} at ${timeStr}`

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

  if (loading) {
    return (
      <Layout title='Recent Activities'>
        <Card>
          <p className='text-center text-gray-500'>Loading activities...</p>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout title='Recent Activities' onDataRefresh={loadEntries}>
      <div className='space-y-4'>
        {/* Header */}
        <Card className='bg-gradient-to-r from-green-500 to-blue-600 text-white border-0 p-6'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-white/20 rounded-full'>
              <Clock className='w-6 h-6' />
            </div>
            <div>
              <h2 className='text-xl font-semibold'>Recent Activities</h2>
              <p className='text-sm opacity-90'>
                View and manage all tracked activities
              </p>
            </div>
          </div>
        </Card>

        {/* Activities List */}
        {entries.length === 0 ? (
          <Card>
            <div className='text-center py-8'>
              <Clock className='w-12 h-12 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500 mb-2'>No activities tracked yet</p>
              <p className='text-sm text-gray-400'>
                Use the AI assistant or Baby Tracker to log activities
              </p>
            </div>
          </Card>
        ) : (
          <div className='space-y-3'>
            {entries.map((entry) => (
              <Card
                key={entry.id}
                padding='md'
                className='hover:shadow-md transition-shadow cursor-pointer'
                onClick={() => openDetailsModal(entry)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl'>
                      {getEntryIcon(entry.entry_type)}
                    </span>
                    <div>
                      <p className='font-medium text-gray-900 capitalize'>
                        {getEntryDetails(entry)}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {formatEntryTime(entry)}
                      </p>
                      {entry.notes && (
                        <p className='text-xs text-gray-400 mt-1 italic'>
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteEntry(entry.id)
                    }}
                    className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

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
                  {getEntryIcon(selectedEntry.entry_type)}
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
                        return hours > 0
                          ? `${hours}h ${minutes}m`
                          : `${minutes}m`
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
      </div>
    </Layout>
  )
}
