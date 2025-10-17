import React, { useState, useEffect, Suspense } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Baby as BabyIcon,
  Check,
  Download,
} from 'lucide-react'
import { migrateBabyData } from '../utils/migrateBabyData'
import { dateUtils } from '../utils/dateUtils'
import { BabyModal } from '../components/LazyModals'
import { LoadingState } from '../components/LoadingState'
import { Button, IconButton } from '../components/Button'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { useConfirmationModal } from '../hooks/useConfirmationModal'
import {
  useBabies,
  useSetActiveBaby,
  useDeleteBaby,
} from '../hooks/queries/useBabyQueries'
import type { Baby } from '../types'

export const BabyManagementPage: React.FC = () => {
  const [editingBaby, setEditingBaby] = useState<Baby | null>(null)
  const [isBabyModalOpen, setIsBabyModalOpen] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [showMigrationButton, setShowMigrationButton] = useState(false)

  // Use React Query for babies data
  const { data: babies = [], isLoading, refetch } = useBabies()
  const setActiveBabyMutation = useSetActiveBaby()
  const deleteBabyMutation = useDeleteBaby()

  // Confirmation modal for baby deletion
  const confirmationModal = useConfirmationModal()

  const checkMigrationNeeded = async () => {
    try {
      const needsMigration = await migrateBabyData.checkIfMigrationNeeded()
      setShowMigrationButton(needsMigration)
    } catch (error) {
      console.error('Error checking migration status:', error)
    }
  }

  useEffect(() => {
    checkMigrationNeeded()
  }, [])

  const handleSetActive = async (babyId: string) => {
    try {
      await setActiveBabyMutation.mutateAsync(babyId)
    } catch (error) {
      console.error('Error setting active baby:', error)
    }
  }

  const handleDelete = (baby: Baby) => {
    confirmationModal.open({
      title: 'Delete Baby Profile',
      message: `Are you sure you want to delete ${baby.name}? This will permanently remove all tracking data including feeding records, sleep logs, and other activities. This action cannot be undone.`,
      confirmText: 'Delete Baby',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        await deleteBabyMutation.mutateAsync(baby.id)
      },
    })
  }

  const startEdit = (baby: Baby) => {
    setEditingBaby(baby)
    setIsBabyModalOpen(true)
  }

  const startAdd = () => {
    setEditingBaby(null)
    setIsBabyModalOpen(true)
  }

  const handleMigration = async () => {
    setMigrating(true)
    try {
      const success = await migrateBabyData.migrateFromProfile()
      if (success) {
        await refetch()
        setShowMigrationButton(false)
        alert('Successfully migrated your baby data!')
      } else {
        alert('No baby data found to migrate, or migration failed.')
      }
    } catch (error) {
      console.error('Migration error:', error)
      alert('Migration failed. Please try again or contact support.')
    } finally {
      setMigrating(false)
    }
  }

  const handleBabySave = async () => {
    // React Query will automatically refetch after mutations
  }

  const handleBabyError = (error: string) => {
    console.error('Baby operation error:', error)
    // You could add a toast notification here
  }

  const handleBabyClose = () => {
    setIsBabyModalOpen(false)
    setEditingBaby(null)
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center'>
        <LoadingState message='Loading babies...' size='lg' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
              Manage Babies
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Add, edit, or switch between your babies
            </p>
          </div>
          <div className='flex gap-3'>
            {showMigrationButton && (
              <Button
                onClick={handleMigration}
                disabled={migrating}
                variant='secondary'
                leftIcon={<Download />}
                loading={migrating}
                loadingText='Migrating...'
              >
                Import Existing Baby
              </Button>
            )}

            <Button onClick={startAdd} variant='primary' leftIcon={<Plus />}>
              Add Baby
            </Button>
          </div>
        </div>

        {/* Babies List */}
        <div className='space-y-4'>
          {babies.length === 0 ? (
            <div className='text-center py-12'>
              <BabyIcon className='w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100 mb-2'>
                No babies added yet
              </h3>
              <p className='text-gray-500 dark:text-gray-400 mb-4'>
                Add your first baby to start tracking
              </p>
              <Button onClick={startAdd} variant='primary'>
                Add Your First Baby
              </Button>
            </div>
          ) : (
            babies.map((baby) => (
              <div
                key={baby.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 transition-all ${
                  baby.is_active
                    ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        baby.is_active
                          ? 'bg-blue-100 dark:bg-blue-900/40'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <BabyIcon
                        className={`w-6 h-6 ${
                          baby.is_active
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                          {baby.name}
                        </h3>
                        {baby.is_active && (
                          <span className='bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium'>
                            Active
                          </span>
                        )}
                      </div>
                      <p className='text-gray-600 dark:text-gray-400'>
                        {dateUtils.calculateDetailedAge(baby.birthdate)}
                      </p>
                      <p className='text-sm text-gray-500 dark:text-gray-500'>
                        Born: {dateUtils.formatBirthdate(baby.birthdate)}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {!baby.is_active && (
                      <Button
                        onClick={() => handleSetActive(baby.id)}
                        variant='outline'
                        size='sm'
                        leftIcon={<Check />}
                        className='bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/60'
                      >
                        Set Active
                      </Button>
                    )}
                    <IconButton
                      onClick={() => startEdit(baby)}
                      variant='outline'
                      size='sm'
                      icon={<Edit2 />}
                      aria-label={`Edit ${baby.name}`}
                      className='text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500'
                    />
                    <IconButton
                      onClick={() => handleDelete(baby)}
                      variant='outline'
                      size='sm'
                      icon={<Trash2 />}
                      aria-label={`Delete ${baby.name}`}
                      className='text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500'
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Baby Modal (unified add/edit) */}
      <Suspense fallback={<LoadingState message='Loading modal...' />}>
        <BabyModal
          isOpen={isBabyModalOpen}
          onClose={handleBabyClose}
          onSave={handleBabySave}
          onError={handleBabyError}
          baby={editingBaby}
          isFirstBaby={babies.length === 0}
        />
      </Suspense>

      {/* Confirmation Modal for Baby Deletion */}
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
    </div>
  )
}
