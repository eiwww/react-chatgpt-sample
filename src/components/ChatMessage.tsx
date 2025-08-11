import React, { useEffect } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import type { Message } from '../types'

// Load languages in the correct order - TSX depends on TypeScript and JSX
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'

interface ChatMessageProps {
  message: Message
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user'

  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      Prism.highlightAll()
    }, 0)
    
    return () => clearTimeout(timer)
  }, [message.content])

  // Parse multi-line code blocks
  const parseContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index)
        if (textBefore.trim()) {
          parts.push({ type: 'text', content: textBefore })
        }
      }
      let language = match[1] || 'text'
      
      // Handle common language aliases
      const languageMap: Record<string, string> = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'html': 'markup',
        'xml': 'markup'
      }
      
      language = languageMap[language] || language
      const code = match[2].trim()
      parts.push({ type: 'code', language, content: code })
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex)
      if (remainingText.trim()) {
        parts.push({ type: 'text', content: remainingText })
      }
    }

    return parts.length ? parts : [{ type: 'text', content }]
  }

  // Parse inline code
  const parseInlineCode = (text: string) => {
    const inlineCodeRegex = /`([^`]+)`/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = inlineCodeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
      }
      parts.push({ type: 'inline-code', content: match[1] })
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) })
    }

    return parts
  }

  const contentParts = parseContent(message.content)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-full lg:max-w-2xl rounded-lg shadow-md overflow-hidden ${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-900 text-gray-100'
        }`}
      >
        <div className="px-4 py-3 space-y-3">
          {contentParts.map((part, index) => {
            if (part.type === 'code') {
              return (
                <div key={index} className="border border-gray-700 rounded-md overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-3 py-1 text-xs font-mono">
                    <span>{part.language}</span>
                    <button
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(part.content)
                        } catch (err) {
                          console.warn('Failed to copy to clipboard:', err)
                        }
                      }}
                      className="hover:text-white transition-colors"
                      title="Copy code"
                    >
                      📋
                    </button>
                  </div>
                  <pre className="bg-gray-900 p-3 overflow-x-auto text-sm">
                    <code className={`language-${part.language}`}>
                      {part.content}
                    </code>
                  </pre>
                </div>
              )
            } else {
              const textParts = parseInlineCode(part.content)
              return (
                <p key={index} className="text-sm leading-relaxed break-words">
                  {textParts.map((t, idx) =>
                    t.type === 'inline-code' ? (
                      <code
                        key={idx}
                        className={`px-1 py-0.5 rounded text-xs font-mono ${
                          isUser
                            ? 'bg-blue-600 text-blue-100'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {t.content}
                      </code>
                    ) : (
                      <span key={idx} className="whitespace-pre-wrap">
                        {t.content}
                      </span>
                    )
                  )}
                </p>
              )
            }
          })}
        </div>

        {/* Timestamp */}
        <div
          className={`px-4 py-1 text-xs opacity-70 ${
            isUser ? 'border-blue-400' : 'border-gray-300'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage