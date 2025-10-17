import { useState, useCallback } from 'react'

export interface ConfirmationConfig {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => Promise<void>
  variant?: 'danger' | 'warning'
}

export interface UseConfirmationModalReturn {
  isOpen: boolean
  open: (config: ConfirmationConfig) => void
  close: () => void
  confirm: () => void
  config: ConfirmationConfig | null
  isLoading: boolean
}

export const useConfirmationModal = (): UseConfirmationModalReturn => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ConfirmationConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const open = useCallback((confirmationConfig: ConfirmationConfig) => {
    setConfig(confirmationConfig)
    setIsOpen(true)
    setIsLoading(false)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setIsLoading(false)
    // Clear config after a small delay to allow for exit animations
    setTimeout(() => {
      setConfig(null)
    }, 200)
  }, [])

  const confirm = useCallback(async () => {
    if (!config) return

    try {
      setIsLoading(true)
      await config.onConfirm()
      close()
    } catch (error) {
      // Keep modal open on error to allow retry
      setIsLoading(false)
      console.error('Confirmation action failed:', error)
      // You could also add error handling here, such as showing a toast
    }
  }, [config, close])

  return {
    isOpen,
    open,
    close,
    confirm,
    config,
    isLoading,
  }
}
