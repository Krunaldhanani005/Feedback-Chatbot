import { BaseAIProvider, AIMessage, AIResponse } from '../AIProvider'

export class OpenAIProvider extends BaseAIProvider {
  getName() { return 'openai' }

  isAvailable(): boolean {
    return !!(process.env.OPENAI_API_KEY)
  }

  async generateResponse(messages: AIMessage[], systemPrompt?: string): Promise<AIResponse> {
    if (!this.isAvailable()) throw new Error('OpenAI API key not configured')

    const allMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o',
        max_tokens: this.config.maxTokens || 1024,
        messages: allMessages,
      }),
    })

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`)

    const data = await response.json() as {
      choices: { message: { content: string } }[]
      usage?: { total_tokens: number }
    }
    return {
      content: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens,
    }
  }
}
