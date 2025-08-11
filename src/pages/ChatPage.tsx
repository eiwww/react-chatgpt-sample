import React, { useState, useEffect, useRef } from 'react'
import { useSocket } from '../contexts/SocketContext'
import Navbar from '../components/Navbar'
import ChatMessage from '../components/ChatMessage'
import MessageInput from '../components/MessageInput'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../contexts/AuthContext'
import { chatAPI } from '../services/api'
import type { Message, Chat } from '../types'

const ChatPage: React.FC = () => {
  const token = localStorage.getItem('token') || ''
  const [messages, setMessages] = useState<Message[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { socket, isConnected } = useSocket()
  const { user } = useAuth()

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory()
  }, [])

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getChats(token)
      setChats(response.data)
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const loadChatMessages = async (chatId: string) => {
    try {
      setIsLoading(true)
      const response = await chatAPI.getChatMessages(token, chatId)
      console.log(response);
      const formattedMessages: Message[] = response.data.map((msg: any) => ({
        id: msg.id.toString(),
        content: msg.content,
        sender: msg.authorId === user?.id ? 'user' : 'assistant',
        timestamp: msg.createdAt,
        chatId: msg.chatId.toString()
      }))
      setMessages(formattedMessages)
      setCurrentChatId(chatId)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading chat messages:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (socket) {
      // Listen for incoming messages from your backend
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received from backend:', data);

          setIsLoading(false);

          // Update chatId if it was created by backend (for new chats)
          if (!currentChatId) {
            setCurrentChatId(data.chatId);
            // Refresh chat history to show new chat in sidebar
            loadChatHistory();
          }

          // Add assistant response to messages
          const assistantMessage: Message = {
            id: Date.now().toString() + '_assistant',
            content: data.response,
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            chatId: data.chatId
          };

          setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
          console.error('Error parsing backend response:', error);
          setIsLoading(false);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsLoading(false);
      };

      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.onmessage = null;
          socket.onerror = null;
        }
      };
    }
  }, [socket, currentChatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (content: string): void => {
    if (socket && isConnected && socket.readyState === WebSocket.OPEN && !isLoading) {
      // Create message object matching your backend expectations
      const messageToSend = {
        content,
        chatId: currentChatId || 0 // Your backend expects 0 or falsy for new chats
      };

      // Add user message to local state immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date().toISOString(),
        chatId: currentChatId ?? undefined
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true); // Show loading state

      // Send to your backend (matches your existing message handler)
      socket.send(JSON.stringify(messageToSend));
    }
  }

  const handleNewChat = (): void => {
    // Reset local state for new chat
    setCurrentChatId(null);
    setMessages([]);
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar onNewChat={handleNewChat} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={loadChatMessages}
          onDeleteChat={async (chatId) => {
            try {
              await chatAPI.deleteChat(token, chatId)
              setChats(chats.filter(chat => chat.id !== chatId))
              if (currentChatId === chatId) {
                setCurrentChatId(null)
                setMessages([])
              }
            } catch (error) {
              console.error('Error deleting chat:', error)
            }
          }}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-800">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 custom-scroll">
            <div className="ml-[10%] mr-[10%]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-full w-full text-gray-500" style={{ minHeight: 'calc(100vh - 64px)' }}>
                  <img src="../../public/home.png" alt="No messages" className="w-36 h-36 mb-4 rounded-full" />
                  <p>まだメッセージはありません。会話を始めましょう！</p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <ChatMessage key={message.id || index} message={message} />
                  ))}

                  {/* Loading indicator while waiting for AI response */}
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Message Input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!isConnected || isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatPage