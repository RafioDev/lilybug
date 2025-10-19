import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'

interface HeaderContextType {
  title?: string
  subtitle?: string
  actions?: ReactNode
  setHeaderInfo: (info: {
    title?: string
    subtitle?: string
    actions?: ReactNode
  }) => void
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export const useHeader = () => {
  const context = useContext(HeaderContext)
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider')
  }
  return context
}

interface HeaderProviderProps {
  children: ReactNode
}

export const HeaderProvider: React.FC<HeaderProviderProps> = ({ children }) => {
  const [headerInfo, setHeaderInfo] = useState<{
    title?: string
    subtitle?: string
    actions?: ReactNode
  }>({})

  const setHeaderInfoHandler = useCallback(
    (info: { title?: string; subtitle?: string; actions?: ReactNode }) => {
      setHeaderInfo(info)
    },
    []
  )

  const contextValue = useMemo(
    () => ({
      ...headerInfo,
      setHeaderInfo: setHeaderInfoHandler,
    }),
    [headerInfo, setHeaderInfoHandler]
  )

  return (
    <HeaderContext.Provider value={contextValue}>
      {children}
    </HeaderContext.Provider>
  )
}
