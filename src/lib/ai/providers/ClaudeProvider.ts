import { BaseAIProvider, AIMessage, AIResponse } from '../AIProvider'

export class ClaudeProvider extends BaseAIProvider {
  getName() { return 'claude' }

  isAvailable(): boolean {
    return !!(process.env.ANTHROPIC_API_KEY)
  }

  async generateResponse(messages: AIMessage[], systemPrompt?: string): Promise<AIResponse> {
    if (!this.isAvailable()) throw new Error('Claude API key not configured')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-sonnet-4-6',
        max_tokens: this.config.maxTokens || 1024,
        system: systemPrompt,
        messages: messages.filter(m => m.role !== 'system'),
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json() as {
      content: { type: string; text: string }[]
      usage?: { input_tokens: number; output_tokens: number }
    }
    const content = data.content[0]?.text || ''
    const tokensUsed = data.usage
      ? data.usage.input_tokens + data.usage.output_tokens
      : undefined

    return { content, tokensUsed }
  }
}
