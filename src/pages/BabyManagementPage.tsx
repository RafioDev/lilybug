import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Baby as BabyIcon,
  Check,
  Download,
} from 'lucide-react'
import { babyService } from '../services/babyService'
import { migrateBabyData } from '../utils/migrateBabyData'
import { dateUtils } from '../utils/dateUtils'
import { EditBabyModal } from '../components/EditBabyModal'
import { AddBabyModal } from '../components/AddBabyModal'
import type { Baby } from '../types'

export const BabyManagementPage: React.FC = () => {
  const [babies, setBabies] = useState<Baby[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBaby, setEditingBaby] = useState<Baby | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [showMigrationButton, setShowMigrationButton] = useState(false)

  useEffect(() => {
    loadBabies()
    checkMigrationNeeded()
  }, [])

  const checkMigrationNeeded = async () => {
    try {
      const needsMigration = await migrateBabyData.checkIfMigrationNeeded()
      setShowMigrationButton(needsMigration)
    } catch (error) {
      console.error('Error checking migration status:', error)
    }
  }

  const loadBabies = async () => {
    try {
      const data = await babyService.getBabies()
      setBabies(data)
    } catch (error) {
      console.error('Error loading babies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetActive = async (babyId: string) => {
    try {
      await babyService.setActiveBaby(babyId)
      await loadBabies()
    } catch (error) {
      console.error('Error setting active baby:', error)
    }
  }

  const handleDelete = async (babyId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this baby? This will also delete all associated tracking data.'
      )
    ) {
      return
    }

    try {
      await babyService.deleteBaby(babyId)
      await loadBabies()
    } catch (error) {
      console.error('Error deleting baby:', error)
    }
  }

  const startEdit = (baby: Baby) => {
    setEditingBaby(baby)
    setIsEditModalOpen(true)
  }

  const handleMigration = async () => {
    setMigrating(true)
    try {
      const success = await migrateBabyData.migrateFromProfile()
      if (success) {
        await loadBabies()
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

  const handleAddSave = async () => {
    await loadBabies()
  }

  const handleAddError = (error: string) => {
    console.error('Add error:', error)
    // You could add a toast notification here
  }

  const handleEditSave = async () => {
    await loadBabies()
  }

  const handleEditError = (error: string) => {
    console.error('Edit error:', error)
    // You could add a toast notification here
  }

  const handleEditClose = () => {
    setIsEditModalOpen(false)
    setEditingBaby(null)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center'>
        <div className='animate-pulse space-y-4'>
          <div className='w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full mx-auto'></div>
          <p className='text-gray-500 dark:text-gray-400'>Loading babies...</p>
        </div>
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
              <button
                onClick={handleMigration}
                disabled={migrating}
                className='flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
              >
                <Download className='w-4 h-4' />
                {migrating ? 'Migrating...' : 'Import Existing Baby'}
              </button>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              <Plus className='w-4 h-4' />
              Add Baby
            </button>
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
              <button
                onClick={() => setIsAddModalOpen(true)}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Add Your First Baby
              </button>
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
                      <button
                        onClick={() => handleSetActive(baby.id)}
                        className='flex items-center gap-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors text-sm'
                      >
                        <Check className='w-3 h-3' />
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(baby)}
                      className='p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
                    >
                      <Edit2 className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDelete(baby.id)}
                      className='p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Baby Modal */}
      <AddBabyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSave}
        onError={handleAddError}
        isFirstBaby={babies.length === 0}
      />

      {/* Edit Baby Modal */}
      <EditBabyModal
        isOpen={isEditModalOpen}
        baby={editingBaby}
        onClose={handleEditClose}
        onSave={handleEditSave}
        onError={handleEditError}
      />
    </div>
  )
}
