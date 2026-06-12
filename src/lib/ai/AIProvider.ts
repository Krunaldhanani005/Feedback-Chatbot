export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  tokensUsed?: number
}

export interface AIProviderConfig {
  apiKey?: string
  model?: string
  maxTokens?: number
  temperature?: number
}

export abstract class BaseAIProvider {
  protected config: AIProviderConfig

  constructor(config: AIProviderConfig = {}) {
    this.config = config
  }

  abstract generateResponse(
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<AIResponse>

  abstract isAvailable(): boolean
  abstract getName(): string
}
