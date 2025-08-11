import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Chat } from '../types'
import { ja } from 'date-fns/locale/ja'

interface SidebarProps {
  isOpen: boolean
  chats: Chat[]
  currentChatId: string | null
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  chats, 
  currentChatId, 
  onSelectChat, 
  onDeleteChat 
}) => {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ja })
    } catch {
      return '最近'
    }
  }

  return (
    <div className="w-80 bg-gray-900 text-white flex flex-col">
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        {chats.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">
            まだチャットはありません
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`group relative p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 ${
                currentChatId === chat.id ? 'bg-gray-700' : ''
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    {chat.title || '無題のチャット'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(chat.updatedAt)}
                  </p>
                </div>
                
                {/* Delete button - shows on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteChat(chat.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded hover:bg-gray-600 transition-opacity"
                  title="チャットを削除"
                >
                  <svg className="w-4 h-4 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Sidebar