import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { LilybugLogo } from '../components/LilybugLogo'

export const DemoLanding: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:from-gray-900 dark:to-gray-800'>
      <Card className='max-w-md p-8 text-center'>
        <div className='mb-6 flex justify-center'>
          <LilybugLogo className='h-16 w-16' />
        </div>

        <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
          Welcome to Lilybug Demo
        </h1>

        <p className='mb-6 text-gray-600 dark:text-gray-300'>
          Explore Lilybug with sample data. No sign-up required!
        </p>

        <div className='space-y-4'>
          <Button
            onClick={() => navigate('/demo')}
            fullWidth
            className='text-lg'
          >
            Try Demo
          </Button>

          <Button onClick={() => navigate('/auth')} variant='outline' fullWidth>
            Sign In / Sign Up
          </Button>
        </div>

        <div className='mt-6 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20'>
          <p className='text-sm text-amber-800 dark:text-amber-200'>
            💡 Demo mode uses sample data. Changes won't be saved.
          </p>
        </div>
      </Card>
    </div>
  )
}
