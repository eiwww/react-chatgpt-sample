import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { User, LogOut } from 'lucide-react'
import ProfileModal from '../modals/ProfileModal'

interface NavbarProps {
  onNewChat: () => void
  onToggleSidebar: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onNewChat, onToggleSidebar }) => {
  const { user, logout } = useAuth()
  const { isConnected } = useSocket()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
      <nav className="bg-gray-800 text-white p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded hover:bg-gray-700 transition-colors"
            title="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-xl font-semibold">チャットアプリ</h1>
          
          <button
            onClick={onNewChat}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
          >
            新しいチャット
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{isConnected ? '接続された' : '切断された'}</span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 hover:bg-gray-700 px-3 py-2 rounded transition-colors"
            >
              <img src={`${import.meta.env.VITE_API_IMAGE}/${user?.img}` || ''} alt="" className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center" />
              <span>{user?.name || 'User'}</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10">
                <div>
                  <button
                    onClick={() => {
                      setProfileOpen(true)
                      setDropdownOpen(false)
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <User size={16} className='mr-2' />
                    プロフィール
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => {
                      logout()
                      setDropdownOpen(false)
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut size={16} className='mr-2' />
                    ログアウト
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
      />

      {/* Overlay to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </>
  )
}

export default Navbar