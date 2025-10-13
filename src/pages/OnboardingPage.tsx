import React, { useState } from 'react'
import { Baby } from 'lucide-react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { profileService } from '../services/profileService'
import { babyService } from '../services/babyService'

interface OnboardingPageProps {
  onComplete: () => void
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    babyName: '',
    babyBirthdate: '',
    parent1Name: '',
    parent2Name: '',
  })

  const handleSubmit = async () => {
    try {
      // Create the profile
      await profileService.createOrUpdateProfile({
        parent1_name: formData.parent1Name,
        parent2_name: formData.parent2Name || null,
      })

      // Create the first baby
      await babyService.createBaby({
        name: formData.babyName,
        birthdate: formData.babyBirthdate,
        is_active: true,
      })

      onComplete()
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='inline-flex p-4 bg-blue-500 rounded-full mb-4'>
            <Baby size={48} className='text-white' />
          </div>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            Welcome to Lilybug
          </h1>
          <p className='text-gray-600'>Your companion through the first year</p>
        </div>

        <Card padding='lg'>
          {step === 1 && (
            <div className='space-y-5'>
              <div>
                <h2 className='text-xl font-semibold text-gray-800 mb-2'>
                  Let's get started
                </h2>
                <p className='text-gray-600 text-sm'>Tell us about your baby</p>
              </div>

              <Input
                label="Baby's Name"
                value={formData.babyName}
                onChange={(val) => setFormData({ ...formData, babyName: val })}
                placeholder='e.g., Emma'
                required
              />

              <Input
                label="Baby's Birthdate"
                type='date'
                value={formData.babyBirthdate}
                onChange={(val) =>
                  setFormData({ ...formData, babyBirthdate: val })
                }
                required
                max={new Date().toISOString().split('T')[0]}
              />

              <Button
                onClick={() => setStep(2)}
                fullWidth
                disabled={!formData.babyName || !formData.babyBirthdate}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className='space-y-5'>
              <div>
                <h2 className='text-xl font-semibold text-gray-800 mb-2'>
                  Parent Information
                </h2>
                <p className='text-gray-600 text-sm'>
                  Help us personalize your experience
                </p>
              </div>

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
                <Button onClick={() => setStep(1)} variant='outline' fullWidth>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  fullWidth
                  disabled={!formData.parent1Name}
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </Card>

        <p className='text-center text-sm text-gray-500 mt-6'>
          You can update this information anytime in settings
        </p>
      </div>
    </div>
  )
}
