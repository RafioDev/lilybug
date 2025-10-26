import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { PageErrorBoundary } from '../components/PageErrorBoundary'
import { SectionErrorBoundary } from '../components/SectionErrorBoundary'

import { useCreateOrUpdateProfile } from '../hooks/queries/useProfileQueries'
import { useCreateBaby } from '../hooks/queries/useBabyQueries'
import { babyService } from '../services/babyService'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { useTour } from '../contexts/TourContext'
import { LilybugLogo } from '@/components/LilybugLogo'

interface BabyInfo {
  name: string
  birthdate: string
}

const OnboardingContent: React.FC = () => {
  const navigate = useNavigate()
  const { startTour, updatePreferences } = useTour()
  const createOrUpdateProfileMutation = useCreateOrUpdateProfile()
  const createBabyMutation = useCreateBaby()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [numberOfBabies, setNumberOfBabies] = useState(1)
  const [currentBabyIndex, setCurrentBabyIndex] = useState(0)
  const [babies, setBabies] = useState<BabyInfo[]>([
    { name: '', birthdate: '' },
  ])
  const [formData, setFormData] = useState({
    parent1Name: '',
    parent2Name: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Helper function to convert index to ordinal words
  const getOrdinalWord = (index: number): string => {
    const ordinals = ['First', 'Second', 'Third', 'Fourth']
    return ordinals[index] || `${index + 1}th`
  }

  // Helper function to get lowercase ordinal
  const getOrdinalWordLower = (index: number): string => {
    return getOrdinalWord(index).toLowerCase()
  }

  const handleNumberOfBabiesChange = (count: number) => {
    setNumberOfBabies(count)
    const newBabies = Array.from(
      { length: count },
      (_, index) => babies[index] || { name: '', birthdate: '' }
    )
    setBabies(newBabies)
  }

  const updateBaby = (index: number, field: keyof BabyInfo, value: string) => {
    const updatedBabies = [...babies]
    updatedBabies[index] = { ...updatedBabies[index], [field]: value }
    setBabies(updatedBabies)
  }

  const isCurrentBabyValid = () => {
    const baby = babies[currentBabyIndex]
    return baby && baby.name.trim() && baby.birthdate
  }

  const areAllBabiesValid = () => {
    return babies.every((baby) => baby.name.trim() && baby.birthdate)
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Create the profile
      await createOrUpdateProfileMutation.mutateAsync({
        parent1_name: formData.parent1Name,
        parent2_name: formData.parent2Name || null,
      })

      // Create all babies
      for (let i = 0; i < babies.length; i++) {
        const baby = babies[i]
        await createBabyMutation.mutateAsync({
          name: baby.name,
          birthdate: baby.birthdate,
          is_active: i === 0, // Only the first baby should be active
        })
      }

      // Ensure there's an active baby (in case something went wrong)
      await babyService.ensureActiveBaby()

      // Manually invalidate all relevant queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile })
      await queryClient.invalidateQueries({ queryKey: queryKeys.babies })
      await queryClient.invalidateQueries({ queryKey: queryKeys.activeBaby })

      // Ensure the user is marked as not having completed the tour yet
      updatePreferences({ hasCompletedInitialTour: false })

      // Navigate to main app with a delay to allow React Query to refetch profile data
      setTimeout(() => {
        navigate('/', { replace: true })

        // Start the tour after navigation completes
        setTimeout(() => {
          startTour()
        }, 1000)
      }, 500)
    } catch (error) {
      console.error('Error during onboarding submission:', error)
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'An error occurred while setting up your account. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 via-white to-blue-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='w-full max-w-md'>
        <LilybugLogo className='mb-4 text-center' />
        <SectionErrorBoundary sectionName={`Onboarding Step ${step}`}>
          <Card padding='lg'>
            {step === 1 && (
              <div className='space-y-5'>
                <div>
                  <h2 className='mb-2 text-xl font-semibold text-gray-800 dark:text-white'>
                    Let's get started
                  </h2>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>
                    How many babies are you tracking?
                  </p>
                </div>

                <div className='space-y-3'>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Number of babies
                  </label>
                  <div className='grid grid-cols-4 gap-2'>
                    {[1, 2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type='button'
                        onClick={() => handleNumberOfBabiesChange(count)}
                        className={`rounded-xl border-2 py-3 text-sm font-medium transition-colors ${
                          numberOfBabies === count
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={() => setStep(2)} fullWidth>
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className='space-y-5'>
                <div>
                  <h2 className='mb-2 text-xl font-semibold text-gray-800 dark:text-white'>
                    {numberOfBabies === 1
                      ? 'Tell us about your baby'
                      : `${getOrdinalWord(currentBabyIndex)} baby`}
                  </h2>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>
                    {numberOfBabies === 1
                      ? "We'll use this to personalize your experience"
                      : `Enter information for your ${getOrdinalWordLower(currentBabyIndex)} baby`}
                  </p>
                </div>

                <Input
                  label={
                    numberOfBabies === 1
                      ? "Baby's Name"
                      : `${getOrdinalWord(currentBabyIndex)} baby's name`
                  }
                  value={babies[currentBabyIndex]?.name || ''}
                  onChange={(val) => updateBaby(currentBabyIndex, 'name', val)}
                  placeholder='e.g., Emma'
                  required
                />

                <Input
                  label={
                    numberOfBabies === 1
                      ? "Baby's Birthdate"
                      : `${getOrdinalWord(currentBabyIndex)} baby's birthdate`
                  }
                  type='date'
                  value={babies[currentBabyIndex]?.birthdate || ''}
                  onChange={(val) =>
                    updateBaby(currentBabyIndex, 'birthdate', val)
                  }
                  required
                  max={new Date().toISOString().split('T')[0]}
                />

                <div className='flex gap-3'>
                  <Button
                    onClick={() => {
                      if (currentBabyIndex > 0) {
                        setCurrentBabyIndex(currentBabyIndex - 1)
                      } else {
                        setStep(1)
                      }
                    }}
                    variant='outline'
                    fullWidth
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (currentBabyIndex < numberOfBabies - 1) {
                        setCurrentBabyIndex(currentBabyIndex + 1)
                      } else {
                        setStep(3)
                      }
                    }}
                    fullWidth
                    disabled={!isCurrentBabyValid()}
                  >
                    {currentBabyIndex < numberOfBabies - 1
                      ? 'Next Baby'
                      : 'Continue'}
                  </Button>
                </div>

                {numberOfBabies > 1 && (
                  <div className='flex justify-center space-x-2'>
                    {babies.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-2 rounded-full ${
                          index === currentBabyIndex
                            ? 'bg-blue-500'
                            : index < currentBabyIndex
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className='space-y-5'>
                <div>
                  <h2 className='mb-2 text-xl font-semibold text-gray-800 dark:text-white'>
                    Parent Information
                  </h2>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>
                    Help us personalize your experience
                  </p>
                </div>

                {submitError && (
                  <div className='rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-900/20'>
                    <p className='text-sm text-rose-700 dark:text-rose-400'>
                      {submitError}
                    </p>
                  </div>
                )}

                <Input
                  label='Your Name'
                  value={formData.parent1Name}
                  onChange={(val) =>
                    setFormData({ ...formData, parent1Name: val })
                  }
                  placeholder='e.g., Sarah'
                  required
                />

                <Input
                  label="Partner's Name (Optional)"
                  value={formData.parent2Name}
                  onChange={(val) =>
                    setFormData({ ...formData, parent2Name: val })
                  }
                  placeholder='e.g., John'
                />

                <div className='flex gap-3'>
                  <Button
                    onClick={() => {
                      setCurrentBabyIndex(numberOfBabies - 1)
                      setStep(2)
                    }}
                    variant='outline'
                    fullWidth
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    fullWidth
                    disabled={
                      !formData.parent1Name ||
                      !areAllBabiesValid() ||
                      isSubmitting
                    }
                  >
                    {isSubmitting
                      ? 'Setting up your account...'
                      : 'Get Started'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </SectionErrorBoundary>

        <p className='mt-6 text-center text-sm text-gray-500 dark:text-gray-400'>
          You can update this information anytime in settings
        </p>
      </div>
    </div>
  )
}

export const OnboardingPage: React.FC = () => {
  return (
    <PageErrorBoundary pageName='Onboarding' contextData={{}}>
      <OnboardingContent />
    </PageErrorBoundary>
  )
}
