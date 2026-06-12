import { BaseAIProvider, AIMessage, AIResponse } from '../AIProvider'

interface GroqChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface GroqAPIResponse {
  choices: Array<{
    message: { content: string }
    finish_reason: string
  }>
  usage?: { total_tokens: number }
}

export class GroqProvider extends BaseAIProvider {
  private apiKey: string
  private model: string

  constructor() {
    super()
    this.apiKey = process.env.GROQ_API_KEY || ''
    this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  }

  getName() { return 'groq' }
  isAvailable() { return !!this.apiKey }

  async generateResponse(messages: AIMessage[], systemPrompt?: string): Promise<AIResponse> {
    const groqMessages: GroqChatMessage[] = []

    if (systemPrompt) {
      groqMessages.push({ role: 'system', content: systemPrompt })
    }

    for (const m of messages) {
      if (m.role === 'user' || m.role === 'assistant') {
        groqMessages.push({ role: m.role, content: m.content })
      }
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: groqMessages,
        max_tokens: 600,
        temperature: 0.72,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Groq API error ${response.status}: ${err}`)
    }

    const data = await response.json() as GroqAPIResponse
    return {
      content: data.choices[0]?.message?.content || 'I apologize — please try again.',
      tokensUsed: data.usage?.total_tokens,
    }
  }
}
