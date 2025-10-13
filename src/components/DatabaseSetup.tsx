import React, { useState, useEffect } from 'react'
import { Database, Copy, Check, AlertCircle } from 'lucide-react'
import { setupDatabase } from '../utils/setupDatabase'

export const DatabaseSetup: React.FC = () => {
  const [tablesStatus, setTablesStatus] = useState({
    babies: false,
    trackerUpdated: false,
  })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkTables()
  }, [])

  const checkTables = async () => {
    setLoading(true)
    try {
      const status = await setupDatabase.checkTablesExist()
      setTablesStatus(status)
    } catch (error) {
      console.error('Error checking tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const copySQL = async () => {
    try {
      await navigator.clipboard.writeText(setupDatabase.getSQLCommands())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy SQL:', error)
    }
  }

  const allTablesReady = tablesStatus.babies && tablesStatus.trackerUpdated

  if (loading) {
    return (
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
        <div className='flex items-center gap-2'>
          <Database className='w-5 h-5 text-blue-600 animate-spin' />
          <span className='text-blue-800'>Checking database setup...</span>
        </div>
      </div>
    )
  }

  if (allTablesReady) {
    return (
      <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
        <div className='flex items-center gap-2'>
          <Check className='w-5 h-5 text-green-600' />
          <span className='text-green-800 font-medium'>Database is ready!</span>
        </div>
        <p className='text-green-700 text-sm mt-1'>
          All required tables exist and are properly configured.
        </p>
      </div>
    )
  }

  return (
    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
      <div className='flex items-start gap-3'>
        <AlertCircle className='w-5 h-5 text-yellow-600 mt-0.5' />
        <div className='flex-1'>
          <h3 className='text-yellow-800 font-medium mb-2'>
            Database Setup Required
          </h3>
          <p className='text-yellow-700 text-sm mb-3'>
            Your database needs to be updated to support multiple babies. Please
            run the following SQL commands in your Supabase dashboard:
          </p>

          <div className='bg-white border border-yellow-300 rounded p-3 mb-3'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700'>
                SQL Commands:
              </span>
              <button
                onClick={copySQL}
                className='flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors'
              >
                {copied ? (
                  <Check className='w-3 h-3' />
                ) : (
                  <Copy className='w-3 h-3' />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className='text-xs text-gray-800 overflow-auto max-h-40 bg-gray-50 p-2 rounded'>
              {setupDatabase.getSQLCommands()}
            </pre>
          </div>

          <div className='space-y-2 text-sm'>
            <h4 className='font-medium text-yellow-800'>Steps:</h4>
            <ol className='list-decimal list-inside space-y-1 text-yellow-700'>
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>Copy and paste the SQL commands above</li>
              <li>Run the commands</li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div className='mt-3 pt-3 border-t border-yellow-300'>
            <h4 className='font-medium text-yellow-800 mb-1'>
              Current Status:
            </h4>
            <div className='space-y-1 text-sm'>
              <div className='flex items-center gap-2'>
                {tablesStatus.babies ? (
                  <Check className='w-4 h-4 text-green-600' />
                ) : (
                  <AlertCircle className='w-4 h-4 text-red-600' />
                )}
                <span
                  className={
                    tablesStatus.babies ? 'text-green-700' : 'text-red-700'
                  }
                >
                  Babies table: {tablesStatus.babies ? 'Ready' : 'Missing'}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                {tablesStatus.trackerUpdated ? (
                  <Check className='w-4 h-4 text-green-600' />
                ) : (
                  <AlertCircle className='w-4 h-4 text-red-600' />
                )}
                <span
                  className={
                    tablesStatus.trackerUpdated
                      ? 'text-green-700'
                      : 'text-red-700'
                  }
                >
                  Tracker updated:{' '}
                  {tablesStatus.trackerUpdated
                    ? 'Ready'
                    : 'Missing baby_id column'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={checkTables}
            className='mt-3 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors'
          >
            Recheck Database
          </button>
        </div>
      </div>
    </div>
  )
}
