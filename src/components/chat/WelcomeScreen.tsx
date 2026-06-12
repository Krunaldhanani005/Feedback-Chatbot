'use client'
import { Bot, Zap, Eye, Volume2, Globe } from 'lucide-react'

interface WelcomeScreenProps {
  onTopicSelect: (topic: string) => void
}

const topics = [
  { icon: Bot, label: 'Robotics', desc: 'Reception, Cleaning, AMR, Cobots', value: 'Tell me about ALLBOTIX robotics products', color: 'text-blue-400' },
  { icon: Eye, label: 'AI Vision', desc: 'Security, Traffic, Retail Analytics', value: 'What AI vision solutions does NTRA offer?', color: 'text-purple-400' },
  { icon: Volume2, label: 'AV Solutions', desc: 'Panels, LED, Conferencing', value: 'Tell me about Nanta Tech AV solutions', color: 'text-green-400' },
  { icon: Zap, label: 'Automation', desc: 'Factory, Warehouse, Industry 4.0', value: 'Show me factory and warehouse automation solutions', color: 'text-yellow-400' },
  { icon: Globe, label: 'Website Services', desc: 'Web Development & Design', value: 'Tell me about your website development services', color: 'text-pink-400' },
]

const quickTopics = [
  'How can I book a demo?',
  'Show me cleaning robots',
  'What is NTRA?',
  'How to contact sales?',
  'Products for hotels',
  'Download brochures',
]

export function WelcomeScreen({ onTopicSelect }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 animate-fade-in">
      {/* Logo / Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center">
          <Bot className="w-10 h-10 text-brand-red" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-bg" />
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-white text-center mb-2">
        Welcome to <span className="text-gradient">Nanta AI</span>
      </h2>
      <p className="text-text-secondary text-center text-sm max-w-sm mb-8">
        Your intelligent guide to explore AI Robotics, Computer Vision, AV Solutions, and more from Nanta Tech Limited.
      </p>

      {/* Topic Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-lg mb-6">
        {topics.map((topic) => {
          const Icon = topic.icon
          return (
            <button
              key={topic.value}
              onClick={() => onTopicSelect(topic.value)}
              className="flex flex-col items-start gap-2 p-4 bg-dark-card border border-dark-border hover:border-brand-red/40 rounded-xl text-left transition-all duration-200 hover:bg-dark-elevated group touch-target"
            >
              <Icon className={`w-5 h-5 ${topic.color} group-hover:scale-110 transition-transform`} />
              <div>
                <p className="text-sm font-semibold text-white">{topic.label}</p>
                <p className="text-xs text-text-muted">{topic.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Quick questions */}
      <div className="w-full max-w-lg">
        <p className="text-xs text-text-muted text-center mb-3">Quick questions</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {quickTopics.map((q) => (
            <button
              key={q}
              onClick={() => onTopicSelect(q)}
              className="text-xs px-3 py-1.5 bg-dark-card border border-dark-border hover:border-brand-red/50 hover:text-brand-red rounded-full transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
