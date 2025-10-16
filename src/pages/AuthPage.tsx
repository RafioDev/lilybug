import React, { useState } from 'react'
import { Baby, Mail, Lock } from 'lucide-react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { supabase } from '../lib/supabase'

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    <div className='min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='inline-flex p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg'>
            <Baby size={48} className='text-white' />
          </div>
          <h1 className='text-3xl font-bold text-gray-800 dark:text-white mb-2'>
            Lilybug
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Your companion through the first year
          </p>
        </div>

        <Card padding='lg'>
          <form onSubmit={handleAuth} className='space-y-5'>
            <div>
              <h2 className='text-xl font-semibold text-gray-800 dark:text-white mb-2'>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className='text-gray-600 dark:text-gray-300 text-sm'>
                {isSignUp
                  ? 'Start your parenting journey'
                  : 'Sign in to continue'}
              </p>
            </div>

            {error && (
              <div className='p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl'>
                <p className='text-sm text-rose-700 dark:text-rose-400'>
                  {error}
                </p>
              </div>
            )}

            <div className='space-y-4'>
              <div className='relative'>
                <Mail
                  size={20}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500'
                />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Email address'
                  required
                  className='w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors'
                />
              </div>

              <div className='relative'>
                <Lock
                  size={20}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500'
                />
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Password'
                  required
                  minLength={6}
                  className='w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors'
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
                className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium'
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </Card>

        <div className='mt-6 text-center'>
          <p className='text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed'>
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Your data is stored securely and never shared.
          </p>
        </div>
      </div>
    </div>
  )
}
