/**
 * Utility functions for authentication management
 */

/**
 * Clears all authentication-related storage
 * This ensures a clean slate when signing out or switching accounts
 */
export const clearAuthStorage = () => {
  try {
    // Clear Supabase auth token
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (supabaseUrl) {
      const storageKey =
        'sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token'
      localStorage.removeItem(storageKey)
    }

    // Clear any custom auth storage
    localStorage.removeItem('lilybug-auth')

    // Clear session storage
    sessionStorage.clear()

    // Clear any other Supabase-related keys that might exist
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Error clearing auth storage:', error)
  }
}

/**
 * Forces a complete application reset by clearing storage and reloading
 * Use this as a last resort when auth state gets corrupted
 */
export const forceAuthReset = () => {
  clearAuthStorage()
  window.location.href = '/auth'
}

/**
 * Debug utility to check current auth storage state
 * Useful for troubleshooting auth issues
 */
export const debugAuthStorage = () => {
  console.group('🔍 Auth Storage Debug')

  try {
    // Check Supabase session
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (supabaseUrl) {
      const storageKey =
        'sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token'
      const authToken = localStorage.getItem(storageKey)
      console.log('Supabase Auth Token:', authToken ? 'Present' : 'Missing')
    }

    // Check custom storage
    const customAuth = localStorage.getItem('lilybug-auth')
    console.log('Custom Auth Storage:', customAuth ? 'Present' : 'Missing')

    // Check all Supabase-related keys
    const supabaseKeys = Object.keys(localStorage).filter(
      (key) => key.startsWith('sb-') || key.includes('supabase')
    )
    console.log('All Supabase Keys:', supabaseKeys)

    // Check session storage
    console.log('Session Storage Keys:', Object.keys(sessionStorage))
  } catch (error) {
    console.error('Error debugging auth storage:', error)
  }

  console.groupEnd()
}

/**
 * Check if a user has a profile in the database with retry logic
 * Returns true if profile exists, false if not, throws on persistent error
 */
export const checkUserProfile = async (
  userId: string,
  maxRetries = 3
): Promise<boolean> => {
  const { supabase } = await import('../lib/supabase')

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `🔍 Profile check attempt ${attempt}/${maxRetries} for user ${userId}`
      )

      // Wait a bit longer on subsequent attempts to let auth context settle
      if (attempt > 1) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 200))
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, parent1_name')
        .eq('id', userId)
        .maybeSingle()

      console.log(`📊 Profile check result (attempt ${attempt}):`, {
        profile,
        error,
      })

      if (error) {
        // If it's a "not found" or "no rows" error, that means no profile exists
        if (
          error.code === 'PGRST116' ||
          error.message.includes('no rows') ||
          error.message.includes('not found')
        ) {
          console.log('📝 No profile found (confirmed)')
          return false
        }

        // If it's an auth error and we have retries left, try again
        if (
          (error.message.includes('JWT') ||
            error.message.includes('auth') ||
            error.code === '401') &&
          attempt < maxRetries
        ) {
          console.log(`⏳ Auth error on attempt ${attempt}, retrying...`)
          continue
        }

        // For other errors on final attempt, throw
        if (attempt === maxRetries) {
          console.error('❌ Profile check failed after all retries:', error)
          throw error
        }

        continue
      }

      // Success - profile found or confirmed not found
      const hasProfile = !!profile
      console.log(
        `✅ Profile check complete: ${hasProfile ? 'found' : 'not found'}`
      )
      return hasProfile
    } catch (error) {
      console.error(`❌ Profile check attempt ${attempt} failed:`, error)

      if (attempt === maxRetries) {
        throw error
      }
    }
  }

  // This shouldn't be reached, but just in case
  throw new Error('Profile check failed after all attempts')
}
