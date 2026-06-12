export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  metadata?: MessageMetadata
  quickReplies?: string[]   // ephemeral — not persisted to DB, shown only on last message
  createdAt: Date
}

export interface MessageMetadata {
  products?: ProductCard[]
  solutions?: SolutionCard[]
  quickActions?: QuickAction[]
  images?: MediaItem[]
  feedbackRequest?: boolean
  leadCaptureField?: string
  showContactInfo?: boolean
  quickReplies?: string[]   // inline tap-able reply buttons shown below AI message
}

export interface ProductCard {
  id: string
  name: string
  company: string
  category: string
  description: string
  image?: string
  features?: string[]
  industries?: string[]
  pdfUrl?: string
  learnMoreUrl?: string
}

export interface SolutionCard {
  id: string
  name: string
  company: string
  description: string
  features?: string[]
  industries?: string[]
  image?: string
  learnMoreUrl?: string
}

export interface MediaItem {
  url: string
  title: string
  alt: string
  type: 'image' | 'video' | 'pdf'
}

export interface QuickAction {
  label: string
  value: string
  icon?: string
}

export interface ConversationSession {
  id: string
  sessionToken: string
  conversationId?: string
  userInfo: Partial<UserInfo>
}

export interface UserInfo {
  name: string
  email: string
  phone: string
  company: string
  designation: string
  industry: string
  interestedIn: string[]
}

export interface ChatRequest {
  message: string
  conversationId?: string
  sessionToken: string
  userInfo?: Partial<UserInfo>
}

export interface ChatResponse {
  message: string
  conversationId: string
  metadata?: MessageMetadata
  suggestedQuestions?: string[]
  collectInfo?: {
    field: string
    prompt: string
  }
}

export interface FeedbackData {
  rating: number
  ratingLabel: string
  interestedIn: string[]
  comments?: string
  conversationId?: string
}

export type AIProvider = 'rule-based' | 'claude' | 'openai' | 'gemini'
