import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, CheckCircle } from 'lucide-react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { PageErrorBoundary } from '../components/PageErrorBoundary'
import { SectionErrorBoundary } from '../components/SectionErrorBoundary'
import { supabase } from '../lib/supabase'
import { LilybugLogo } from '@/components/LilybugLogo'
import { clearAuthStorage } from '../utils/authUtils'

const AuthContent: React.FC = () => {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [signUpEmail, setSignUpEmail] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        navigate('/', { replace: true })
      }
    }
    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        navigate('/', { replace: true })
      } else if (event === 'SIGNED_OUT') {
        clearAuthStorage()
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
        setSignUpEmail(email)
        setShowEmailVerification(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Email verification view
  if (showEmailVerification) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 via-white to-blue-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='w-full max-w-md'>
          <LilybugLogo className='mb-4 text-center' />
          <SectionErrorBoundary sectionName='Email Verification'>
            <Card padding='lg'>
              <div className='space-y-6 text-center'>
                <div className='flex justify-center'>
                  <div className='rounded-full bg-green-100 p-3 dark:bg-green-900/20'>
                    <CheckCircle
                      size={32}
                      className='text-green-600 dark:text-green-400'
                    />
                  </div>
                </div>

                <div>
                  <h2 className='mb-2 text-xl font-semibold text-gray-800 dark:text-white'>
                    Check Your Email
                  </h2>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>
                    We've sent a verification link to
                  </p>
                  <p className='mt-1 text-sm font-medium text-blue-600 dark:text-blue-400'>
                    {signUpEmail}
                  </p>
                </div>

                <div className='rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
                  <div className='flex items-start space-x-3'>
                    <Mail
                      size={20}
                      className='mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400'
                    />
                    <div className='text-left'>
                      <p className='text-sm font-medium text-blue-800 dark:text-blue-300'>
                        Click the link in your email
                      </p>
                      <p className='mt-1 text-xs text-blue-700 dark:text-blue-400'>
                        Follow the link in the email we just sent to confirm
                        your account and complete your signup.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='space-y-3'>
                  <Button
                    type='button'
                    fullWidth
                    onClick={() => {
                      setShowEmailVerification(false)
                      setIsSignUp(false)
                      setEmail('')
                      setPassword('')
                      setError('')
                    }}
                  >
                    Back to Sign In
                  </Button>

                  <button
                    type='button'
                    onClick={() => {
                      setShowEmailVerification(false)
                      setEmail(signUpEmail)
                      setPassword('')
                      setError('')
                    }}
                    className='w-full text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    Try a different email address
                  </button>
                </div>

                <div className='text-xs text-gray-500 dark:text-gray-400'>
                  <p>Didn't receive the email? Check your spam folder or</p>
                  <button
                    type='button'
                    onClick={async () => {
                      setLoading(true)
                      try {
                        await supabase.auth.resend({
                          type: 'signup',
                          email: signUpEmail,
                        })
                      } catch {
                        setError('Failed to resend email')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className='font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    {loading ? 'Sending...' : 'resend the verification email'}
                  </button>
                </div>
              </div>
            </Card>
          </SectionErrorBoundary>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 via-white to-blue-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='w-full max-w-md'>
        <LilybugLogo className='mb-4 text-center' />
        <SectionErrorBoundary sectionName='Authentication Form'>
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
                  className='cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                >
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </Card>
        </SectionErrorBoundary>

        <div className='mt-4'>
          <Card className='border-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'>
            <div className='text-center'>
              <p className='mb-2 text-sm font-medium text-amber-900 dark:text-amber-100'>
                Want to try before signing up?
              </p>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/demo')}
                className='border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40'
              >
                View Demo
              </Button>
            </div>
          </Card>
        </div>

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
