import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Baby, Mail, Lock } from 'lucide-react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { PageErrorBoundary } from '../components/PageErrorBoundary'
import { supabase } from '../lib/supabase'

const AuthContent: React.FC = () => {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        navigate('/', { replace: true })
      }
    }
    checkAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        navigate('/', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 via-white to-blue-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='w-full max-w-md'>
        <div className='mb-8 text-center'>
          <div className='mb-4 inline-flex rounded-full bg-gradient-to-r from-blue-500 to-blue-600 p-4 shadow-lg'>
            <Baby size={48} className='text-white' />
          </div>
          <h1 className='mb-2 text-3xl font-bold text-gray-800 dark:text-white'>
            Lilybug
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Your companion through the first year
          </p>
        </div>

        <Card padding='lg'>
          <form onSubmit={handleAuth} className='space-y-5'>
            <div>
              <h2 className='mb-2 text-xl font-semibold text-gray-800 dark:text-white'>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                {isSignUp
                  ? 'Start your parenting journey'
                  : 'Sign in to continue'}
              </p>
            </div>

            {error && (
              <div className='rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-900/20'>
                <p className='text-sm text-rose-700 dark:text-rose-400'>
                  {error}
                </p>
              </div>
            )}

            <div className='space-y-4'>
              <div className='relative'>
                <Mail
                  size={20}
                  className='absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-500'
                />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Email address'
                  required
                  className='w-full rounded-xl border-2 border-gray-200 py-3 pr-4 pl-11 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400'
                />
              </div>

              <div className='relative'>
                <Lock
                  size={20}
                  className='absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-500'
                />
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Password'
                  required
                  minLength={6}
                  className='w-full rounded-xl border-2 border-gray-200 py-3 pr-4 pl-11 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400'
                />
              </div>
            </div>

            <Button type='submit' fullWidth disabled={loading}>
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>

            <div className='text-center'>
              <button
                type='button'
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                className='text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </Card>

        <div className='mt-6 text-center'>
          <p className='mx-auto max-w-sm text-xs leading-relaxed text-gray-500 dark:text-gray-400'>
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Your data is stored securely and never shared.
          </p>
        </div>
      </div>
    </div>
  )
}

export const AuthPage: React.FC = () => {
  return (
    <PageErrorBoundary pageName='Authentication' contextData={{}}>
      <AuthContent />
    </PageErrorBoundary>
  )
}
