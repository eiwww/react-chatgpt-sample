import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { SocketContextType } from '../types'

const SocketContext = createContext<SocketContextType | undefined>(undefined)
const apiSocketUrl = import.meta.env.VITE_API_SOCKET;

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
        console.log(user);
      const ws = new WebSocket(`ws://${apiSocketUrl}?userId=${user.id}`);

      ws.onopen = () => {
        setIsConnected(true)
        console.log('Connected to server')
      }

      ws.onclose = () => {
        setIsConnected(false)
        console.log('Disconnected from server')
      }

      setSocket(ws)

      return () => {
        ws.close()
      }
    }
  }, [isAuthenticated, user])

  const value: SocketContextType = {
    socket,
    isConnected
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}