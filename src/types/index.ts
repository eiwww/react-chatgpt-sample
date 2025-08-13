export interface User {
  image: string | File | undefined
  id: string
  username: string
  name: string
  img: string
}

export interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: string
  chatId?: string
}

export interface Chat {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}

export interface SocketContextType {
  socket: WebSocket | null
  isConnected: boolean
}

export interface UpdateProfileRequest {
  name: string
  profileImage?: File[]
}