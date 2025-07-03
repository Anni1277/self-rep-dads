import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  Bot,
  User,
  FileText,
  Scale,
  Clock,
  Heart
} from 'lucide-react'

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm FatherBot, your AI legal assistant. I'm here to help you navigate family court proceedings. How can I assist you today?",
      timestamp: new Date(),
      agent: 'FatherBot'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('FatherBot')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const agents = [
    {
      id: 'FatherBot',
      name: 'FatherBot',
      icon: Bot,
      description: 'General guidance and emotional support',
      color: 'bg-blue-500'
    },
    {
      id: 'DocuBot',
      name: 'DocuBot',
      icon: FileText,
      description: 'Document preparation assistance',
      color: 'bg-green-500'
    },
    {
      id: 'StrategyBot',
      name: 'StrategyBot',
      icon: Scale,
      description: 'Legal strategy and case analysis',
      color: 'bg-purple-500'
    },
    {
      id: 'CourtBot',
      name: 'CourtBot',
      icon: Clock,
      description: 'Court preparation and procedures',
      color: 'bg-orange-500'
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getAgentResponse = async (message, agent) => {
    try {
      const response = await fetch('https://xlhyimcjjx61.manus.space/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          agent: agent,
          conversation_id: `conv_${Date.now()}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('Error getting AI response:', error)
      return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      agent: selectedAgent
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(async () => {
      const response = await getAgentResponse(inputMessage, selectedAgent)
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: response,
        timestamp: new Date(),
        agent: selectedAgent
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const switchAgent = (agentId) => {
    setSelectedAgent(agentId)
    const agent = agents.find(a => a.id === agentId)
    const switchMessage = {
      id: messages.length + 1,
      type: 'bot',
      content: `Hi! I'm ${agent.name}. ${agent.description}. How can I help you today?`,
      timestamp: new Date(),
      agent: agentId
    }
    setMessages(prev => [...prev, switchMessage])
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 ${isMinimized ? 'h-16' : 'h-[600px]'} shadow-2xl transition-all duration-300`}>
        {/* Header */}
        <CardHeader className="p-4 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {React.createElement(agents.find(a => a.id === selectedAgent)?.icon || Bot, {
                className: "h-6 w-6"
              })}
              <div>
                <CardTitle className="text-lg">{selectedAgent}</CardTitle>
                <p className="text-sm text-blue-100">
                  {agents.find(a => a.id === selectedAgent)?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-blue-700"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[536px]">
            {/* Agent Selector */}
            <div className="p-4 border-b bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Choose your AI assistant:</p>
              <div className="grid grid-cols-2 gap-2">
                {agents.map((agent) => (
                  <Button
                    key={agent.id}
                    variant={selectedAgent === agent.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => switchAgent(agent.id)}
                    className="text-xs p-2 h-auto flex flex-col items-center"
                  >
                    {React.createElement(agent.icon, { className: "h-4 w-4 mb-1" })}
                    {agent.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.type === 'bot' && (
                      <div className="flex items-center space-x-2 mb-1">
                        {React.createElement(agents.find(a => a.id === message.agent)?.icon || Bot, {
                          className: "h-4 w-4"
                        })}
                        <span className="text-xs font-medium">{message.agent}</span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {React.createElement(agents.find(a => a.id === selectedAgent)?.icon || Bot, {
                        className: "h-4 w-4"
                      })}
                      <span className="text-xs font-medium">{selectedAgent}</span>
                    </div>
                    <div className="flex space-x-1 mt-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${selectedAgent} anything...`}
                  className="flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This AI provides information, not legal advice. Consult an attorney for complex matters.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export default ChatWidget

