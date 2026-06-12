import { BaseAIProvider } from './AIProvider'
import { RuleBasedProvider } from './providers/RuleBasedProvider'
import { ClaudeProvider } from './providers/ClaudeProvider'
import { OpenAIProvider } from './providers/OpenAIProvider'
import { GroqProvider } from './providers/GroqProvider'
import { getCompanies, getKnowledgeChunks, getProducts, getSolutions } from '@/lib/knowledge/loader'

export function createAIProvider(): BaseAIProvider {
  const providerName = process.env.AI_PROVIDER || 'rule-based'
  const model = process.env.AI_MODEL

  switch (providerName) {
    case 'groq':
      return new GroqProvider()
    case 'claude':
      return new ClaudeProvider({ model, maxTokens: 1500 })
    case 'openai':
      return new OpenAIProvider({ model, maxTokens: 1500 })
    default:
      return new RuleBasedProvider()
  }
}

export interface VisitorContext {
  name?: string | null
  company?: string | null
  interests?: string[]
  ratings?: {
    ai?: number | null
    av?: number | null
    robotics?: number | null
    automation?: number | null
    experience?: number | null
  }
}

export function buildSystemPrompt(visitor?: VisitorContext): string {
  const companies = getCompanies()
  const chunks = getKnowledgeChunks().slice(0, 8)
  const products = getProducts().slice(0, 6)
  const solutions = getSolutions().slice(0, 4)

  const companyContext = companies.map(c => `${c.name}: ${c.description}`).join('\n')

  const productSummary = products.map(p =>
    `${p.name} (${p.company}): ${p.description.substring(0, 80)}`
  ).join('\n')

  const solutionSummary = solutions.map(s =>
    `${s.name} (${s.company}): ${s.description.substring(0, 80)}`
  ).join('\n')

  const chunkContext = chunks.map(c => `[${c.title}]\n${c.content.substring(0, 200)}`).join('\n\n')

  const visitorInfo = buildVisitorContext(visitor)

  return `You are Nanta AI — visitor engagement specialist at the Nanta Tech Experience Days by Nanta Tech Limited.

## ⚠️ KIOSK RESPONSE FORMAT — CRITICAL
This runs on TOUCHSCREEN KIOSKS at exhibitions, reception desks, and LED displays.
Visitors tap buttons, not type long messages.

STRICT RULES:
- MAXIMUM 2 sentences per response (under 40 words total)
- Simple, friendly words — no technical jargon
- No paragraphs. No bullet lists. No markdown headers.
- One clear thought, then one short question OR a call to action
- Think like a helpful receptionist, not a documentation system

GOOD examples:
"Great choice! 👍 What would you like to know about our robots?"
"Our cleaning robots work in hospitals, offices, and factories. Which environment interests you?"
"Excellent! 🎉 Which area impressed you most during your visit?"

BAD examples (NEVER do this):
"Thank you for your interest in our comprehensive suite of AI-powered solutions which include computer vision, analytics, and intelligent automation systems designed to help enterprises improve their operational efficiency across multiple departments..."

## PRIMARY MISSION
Collect visitor feedback and understand their interests through SHORT, engaging conversation.
Product info is secondary — only when visitor asks.

## CONVERSATION FLOW
1. Ask about their experience (short question)
2. Understand their interest area (short question)
3. Match to relevant solution (1-2 sentences)
4. Offer demo or contact (brief)

## VISITOR CONTEXT
${visitorInfo}

## PRODUCT KNOWLEDGE (use only when asked — keep answers SHORT)
${companyContext}

Products: ${productSummary}
Solutions: ${solutionSummary}

## RULES
- Never invent specs — use knowledge base only
- Never ask 2 questions at once
- Empathy first for negative feedback
- For pricing: "Contact us at contact@nantatech.com"
- For demos: "Book a demo — our team will reach out"`
}

function buildVisitorContext(visitor?: VisitorContext): string {
  if (!visitor) return 'No onboarding data available for this visitor.'

  const lines: string[] = []

  if (visitor.name) lines.push(`Visitor name: ${visitor.name}`)
  if (visitor.company) lines.push(`Visitor company: ${visitor.company}`)

  if (visitor.interests && visitor.interests.length > 0) {
    lines.push(`Selected interests: ${visitor.interests.join(', ')}`)
  }

  if (visitor.ratings) {
    const rated: string[] = []
    const { ai, av, robotics, automation, experience } = visitor.ratings
    if (ai) rated.push(`AI Solutions: ${ai}/5`)
    if (av) rated.push(`AV Technology: ${av}/5`)
    if (robotics) rated.push(`Robotics: ${robotics}/5`)
    if (automation) rated.push(`Automation: ${automation}/5`)
    if (experience) rated.push(`Customer Experience: ${experience}/5`)
    if (rated.length > 0) lines.push(`Department ratings: ${rated.join(', ')}`)

    // Find highest rated for personalization
    const ratingMap: Record<string, number> = {}
    if (ai) ratingMap['AI Solutions'] = ai
    if (av) ratingMap['AV Technology'] = av
    if (robotics) ratingMap['Robotics'] = robotics
    if (automation) ratingMap['Automation'] = automation
    if (experience) ratingMap['Customer Experience'] = experience

    const highestRated = Object.entries(ratingMap).sort(([, a], [, b]) => b - a)[0]
    if (highestRated && highestRated[1] >= 4) {
      lines.push(`Most interested in (highest rating): ${highestRated[0]} (${highestRated[1]}/5)`)
    }
  }

  if (lines.length === 0) return 'Visitor completed onboarding but did not share specific details.'
  return lines.join('\n')
}

// Singleton provider — reset it when provider changes
let _provider: BaseAIProvider | null = null

export function getAIProvider(): BaseAIProvider {
  if (!_provider) {
    _provider = createAIProvider()
  }
  return _provider
}

export function getAIProviderWithFallback(): BaseAIProvider {
  const provider = getAIProvider()
  if (provider.isAvailable()) return provider
  return new RuleBasedProvider()
}
