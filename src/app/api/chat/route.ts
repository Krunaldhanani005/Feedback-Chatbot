import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getAIProviderWithFallback, buildSystemPrompt } from '@/lib/ai/factory'
import { knowledgeService } from '@/lib/knowledge/KnowledgeService'
import { conversationRepo } from '@/repositories/ConversationRepository'
import { messageRepo } from '@/repositories/MessageRepository'
import { generateSessionToken } from '@/lib/auth/jwt'
import { sendRequirementEmail } from '@/lib/mail/mailer'
import type { MessageMetadata, ProductCard, SolutionCard } from '@/types/chat'
import fs from 'fs'
import path from 'path'

const KB = path.join(process.cwd(), 'knowledge_base')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allbotixData: any = JSON.parse(fs.readFileSync(path.join(KB, 'allbotix_products.json'), 'utf-8'))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ntraData: any = JSON.parse(fs.readFileSync(path.join(KB, 'ntra_solutions.json'), 'utf-8'))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const avData: any = JSON.parse(fs.readFileSync(path.join(KB, 'av_solutions.json'), 'utf-8'))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const avProductsData: any = JSON.parse(fs.readFileSync(path.join(KB, 'av_products.json'), 'utf-8'))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const aiSolutionsData: any = JSON.parse(fs.readFileSync(path.join(KB, 'ai_solutions.json'), 'utf-8'))

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      message: string
      conversationId?: string
      sessionToken?: string
    }
    const { message, conversationId, sessionToken } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Get or create session
    let session = sessionToken
      ? await prisma.session.findUnique({ where: { sessionToken } })
      : null

    if (!session) {
      const token = sessionToken || await generateSessionToken()
      session = await prisma.session.create({
        data: {
          sessionToken: token,
          deviceType: req.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
          userAgent: req.headers.get('user-agent') || undefined,
        },
      })
    }

    // Get or create conversation
    let conversation = conversationId
      ? await prisma.conversation.findUnique({ where: { id: conversationId } })
      : null

    if (!conversation) {
      conversation = await conversationRepo.create({ sessionId: session.id })
    }

    // Check for quick-action direct responses (fixed catalog responses)
    const quickActionResult = getQuickActionDirectResponse(message)
    if (quickActionResult) {
      // Save messages to DB
      await messageRepo.create({ conversationId: conversation.id, role: 'user', content: message, metadata: null })
      await messageRepo.create({
        conversationId: conversation.id,
        role: 'assistant',
        content: quickActionResult.message,
        metadata: JSON.stringify({ ...quickActionResult.metadata, quickReplies: undefined }),
      })
      await conversationRepo.incrementMessageCount(conversation.id)

      // When "Discuss Requirements" is clicked — flag conversation so admin sees it needs followup
      const msgLower = message.toLowerCase().trim()
      if (msgLower === '__discuss__' || msgLower === 'discuss requirements' || msgLower === 'discuss your requirements') {
        await conversationRepo.updateAnalytics(conversation.id, {
          userIntent: 'discuss_requirements',
          summary: 'Visitor requested to discuss requirements — awaiting their message',
        }).catch(() => {})
      }

      return NextResponse.json({
        message: quickActionResult.message,
        conversationId: conversation.id,
        metadata: quickActionResult.metadata,
        quickReplies: quickActionResult.quickReplies,
      })
    }

    // Build visitor context
    let interests: string[] = []
    try {
      if (session.selectedInterests) interests = JSON.parse(session.selectedInterests)
    } catch { /* ignore */ }

    const visitorContext = {
      name: session.visitorName,
      company: session.visitorCompany,
      interests,
      ratings: {
        ai: session.aiRating, av: session.avRating, robotics: session.roboticsRating,
        automation: session.automationRating, experience: session.experienceRating,
      },
    }

    // Save user message
    await messageRepo.create({ conversationId: conversation.id, role: 'user', content: message, metadata: null })

    // Fetch recent message history (desc order: [0]=current user msg, [1]=previous assistant msg)
    const recentMessages = await messageRepo.getRecentMessages(conversation.id, 14)
    const userMsgCount = recentMessages.filter(m => m.role === 'user').length

    // Detect if this message is a reply to "Discuss Requirements" prompt → save to Lead as notes
    const prevMsg = recentMessages[1]
    if (prevMsg?.role === 'assistant' && prevMsg.content.toLowerCase().includes('discuss your requirements')) {
      await captureRequirementNote(conversation.id, message)
    }
    const aiMessages = recentMessages
      .reverse()
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    // Generate AI response
    const systemPrompt = buildSystemPrompt(visitorContext)
    const provider = getAIProviderWithFallback()
    let aiResponse: { content: string }

    try {
      aiResponse = await provider.generateResponse(aiMessages, systemPrompt)
    } catch (err) {
      console.error('AI provider failed:', err)
      const { RuleBasedProvider } = await import('@/lib/ai/providers/RuleBasedProvider')
      aiResponse = await new RuleBasedProvider().generateResponse(aiMessages)
    }

    // Determine intent and quick replies
    const { intent } = knowledgeService.detectIntent(message)
    const quickReplies = getQuickReplies(message, intent, userMsgCount)

    // Show product/solution cards for explicit product queries
    const metadata: MessageMetadata = { quickReplies }
    if (userMsgCount >= 2) {
      const card = buildProductCard(message, intent)
      if (card.products) metadata.products = card.products
      if (card.solutions) metadata.solutions = card.solutions
      if (card.showContactInfo) metadata.showContactInfo = card.showContactInfo
    }

    // Save assistant message (quickReplies not persisted — ephemeral UI)
    await messageRepo.create({
      conversationId: conversation.id,
      role: 'assistant',
      content: aiResponse.content,
      metadata: JSON.stringify({ ...metadata, quickReplies: undefined }),
    })

    // Update conversation analytics
    await conversationRepo.incrementMessageCount(conversation.id)
    const analytics = analyzeConversation(message, intent, conversation, interests)
    await conversationRepo.updateAnalytics(conversation.id, analytics)

    return NextResponse.json({
      message: aiResponse.content,
      conversationId: conversation.id,
      metadata,
      quickReplies,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

// ─── Quick-Action Direct Responses ────────────────────────────────────────────
// These return fixed, rich catalog responses without AI generation

interface QuickActionResponse {
  message: string
  metadata: MessageMetadata
  quickReplies: string[]
}

function getQuickActionDirectResponse(message: string): QuickActionResponse | null {
  const msg = message.toLowerCase().trim()

  // ── ALLBOTIX overview
  if (msg === 'tell me about allbotix robots' || msg === 'learn about allbotix') {
    return {
      message: `🤖 **ALLBOTIX Robotics** — ${allbotixData.stats.robots_delivered} robots delivered, ${allbotixData.stats.happy_clients} happy clients.\n\nChoose a category to explore our robot solutions:`,
      metadata: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      quickReplies: allbotixData.categories.map((c: any) => `${c.emoji} ${c.name}`),
    }
  }

  // ── ALLBOTIX category drill-down
  for (const cat of allbotixData.categories) {
    if (msg.includes(cat.name.toLowerCase()) || msg.includes(cat.id.toLowerCase())) {
      const products: ProductCard[] = [{
        id: cat.id,
        name: cat.name,
        company: 'ALLBOTIX',
        category: cat.tagline,
        description: cat.description,
        features: cat.key_features?.slice(0, 5),
        industries: cat.industries?.slice(0, 4),
        image: cat.image,
        learnMoreUrl: cat.learn_more_url,
      }]
      return {
        message: `${cat.emoji} **${cat.name}** — ${cat.tagline}`,
        metadata: { products },
        quickReplies: ['Other Robots', 'Discuss Requirements', 'Contact Us', 'AI Solutions', 'AV Products'],
      }
    }
  }

  // ── AI Solutions overview (replaces Computer Vision)
  if (
    msg === 'show ai solutions' ||
    msg === 'ai solutions' ||
    msg === 'what is computer vision and what can ntra do?' ||
    msg === 'computer vision' ||
    msg === 'know about ai' ||
    msg === 'tell me about ai solutions'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryLabels = aiSolutionsData.categories.map((c: any) => `${c.emoji} ${c.name}`)
    return {
      message: `🧠 **AI Solutions by NTRA** — ${aiSolutionsData.stats.capabilities} capabilities on your existing cameras. No hardware replacement needed.\n\nChoose a solution to explore:`,
      metadata: {},
      quickReplies: categoryLabels,
    }
  }

  // ── AI Solutions category drill-down
  for (const cat of aiSolutionsData.categories) {
    if (
      msg.includes(cat.name.toLowerCase()) ||
      msg.includes(cat.id.toLowerCase()) ||
      msg === `${cat.emoji} ${cat.name}`.toLowerCase()
    ) {
      const solutions: SolutionCard[] = [{
        id: cat.id,
        name: cat.name,
        company: 'NTRA — Nanta Tech',
        description: cat.description,
        features: cat.capabilities.slice(0, 5),
        industries: cat.industries?.slice(0, 4),
        learnMoreUrl: cat.learn_more_url,
      }]
      return {
        message: `${cat.emoji} **${cat.name}** — ${cat.tagline}`,
        metadata: { solutions },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        quickReplies: ['Other AI Solutions', 'Discuss Requirements', 'Contact Us', ...aiSolutionsData.categories.filter((c: any) => c.id !== cat.id).slice(0, 3).map((c: any) => `${c.emoji} ${c.name}`)],
      }
    }
  }

  // ── "Other AI Solutions" — back to AI Solutions overview
  if (msg === 'other ai solutions' || msg === 'other solutions') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryLabels = aiSolutionsData.categories.map((c: any) => `${c.emoji} ${c.name}`)
    return {
      message: `🧠 **AI Solutions by NTRA** — ${aiSolutionsData.stats.capabilities} capabilities across 8 domains:`,
      metadata: {},
      quickReplies: [...categoryLabels.slice(0, 6), 'Discuss Requirements', 'Contact Us'],
    }
  }

  // ── Legacy NTRA solution drill-down (keep for backward compat)
  for (const sol of ntraData.solutions) {
    if (msg.includes(sol.name.toLowerCase()) || msg.includes(sol.id.toLowerCase())) {
      const solutions: SolutionCard[] = [{
        id: sol.id,
        name: sol.name,
        company: ntraData.display_name,
        description: sol.description,
        features: sol.capabilities.slice(0, 5),
        industries: sol.industries,
        learnMoreUrl: sol.learn_more_url,
      }]
      return {
        message: `${sol.emoji} **${sol.name}** — ${sol.tagline}`,
        metadata: { solutions },
        quickReplies: ['Other AI Solutions', 'Discuss Requirements', 'Contact Us', 'ALLBOTIX Robots', 'AV Solutions'],
      }
    }
  }

  // ── AV Products overview (product catalog from nantatech.com)
  if (
    msg === 'show av products' ||
    msg === 'av products' ||
    msg === 'show me av products' ||
    msg === '📺 av products'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryLabels = avProductsData.categories.map((c: any) => `${c.emoji} ${c.name}`)
    return {
      message: `📺 **AV Products by Nanta Tech** — ${avProductsData.stats.products_count} products across ${avProductsData.stats.categories_count} categories. Choose a category to explore:`,
      metadata: {},
      quickReplies: [...categoryLabels, 'View All AV Products'],
    }
  }

  // ── AV Products keyword aliases (handle natural language queries like "audio products")
  const avProductKeywordMap: Record<string, string[]> = {
    'conference-audio': ['audio product', 'audio products', 'microphone', 'speakerphone', 'speaker phone', 'conference mic', 'conference speaker', 'nt-m702', 'nt-a10w'],
    'ptz-cameras': ['ptz camera', 'ptz cameras', 'zoom camera', 'auto tracking camera', 'nt-vx71', 'nt-vx630', 'nt-ec-hd'],
    'conference-video': ['video bar', 'video conferencing camera', 'conference camera', 'webcam', 'nt-ec-vb', 'nt-m2000', 'ntjx1700'],
    'digital-signage': ['digital signage', 'floor totem', 'wall mount display', 'standee display'],
    'active-led': ['active led', 'led display', 'led standee', 'modular led'],
    'interactive-panels': ['interactive panel', 'smart board', 'whiteboard panel', 'ai board', 'digital board', 'x75 pro'],
  }
  for (const [catId, keywords] of Object.entries(avProductKeywordMap)) {
    if (keywords.some(kw => msg.includes(kw))) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cat = avProductsData.categories.find((c: any) => c.id === catId)
      if (cat) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const products: ProductCard[] = cat.products.map((p: any) => ({
          id: p.id, name: p.name, company: 'Nanta Tech', category: cat.name,
          description: p.description, features: p.key_features?.slice(0, 4),
          industries: p.industries?.slice(0, 4), image: p.image, learnMoreUrl: p.learn_more_url,
        }))
        return {
          message: `${cat.emoji} **${cat.name}** — ${cat.tagline}`,
          metadata: { products },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          quickReplies: ['Other AV Products', 'Discuss Requirements', 'Contact Us', ...avProductsData.categories.filter((c: any) => c.id !== catId).slice(0, 3).map((c: any) => `${c.emoji} ${c.name}`)],
        }
      }
    }
  }

  // ── AV Products category drill-down
  for (const cat of avProductsData.categories) {
    if (
      msg.includes(cat.name.toLowerCase()) ||
      msg.includes(cat.id.toLowerCase()) ||
      msg === `${cat.emoji} ${cat.name}`.toLowerCase()
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const products: ProductCard[] = cat.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        company: 'Nanta Tech',
        category: cat.name,
        description: p.description,
        features: p.key_features?.slice(0, 4),
        industries: p.industries?.slice(0, 4),
        image: p.image,
        learnMoreUrl: p.learn_more_url,
      }))
      return {
        message: `${cat.emoji} **${cat.name}** — ${cat.tagline}`,
        metadata: { products },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        quickReplies: ['Other AV Products', 'Discuss Requirements', 'Contact Us', ...avProductsData.categories.filter((c: any) => c.id !== cat.id).slice(0, 3).map((c: any) => `${c.emoji} ${c.name}`)],
      }
    }
  }

  // ── AV Products individual product drill-down
  for (const cat of avProductsData.categories) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const p of cat.products as any[]) {
      if (
        msg.includes(p.id.toLowerCase()) ||
        msg.includes(p.name.toLowerCase().substring(0, 15))
      ) {
        const product: ProductCard = {
          id: p.id,
          name: p.name,
          company: 'Nanta Tech',
          category: cat.name,
          description: p.description,
          features: p.key_features?.slice(0, 5),
          industries: p.industries?.slice(0, 4),
          image: p.image,
          learnMoreUrl: p.learn_more_url,
        }
        return {
          message: `📦 **${p.name}**`,
          metadata: { products: [product] },
          quickReplies: [`${cat.emoji} ${cat.name}`, 'Other AV Products', 'Discuss Requirements', 'Contact Us'],
        }
      }
    }
  }

  // ── AV Technologies overview
  if (msg === 'tell me about av technology products' || msg === 'view av technologies') {
    return {
      message: `📡 **AV Solutions by Nanta Tech** — ${avData.stats.integrations_shipped} integrations shipped across corporate, education, healthcare & more.\n\nChoose a solution to explore:`,
      metadata: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      quickReplies: avData.solutions.map((s: any) => `${s.emoji} ${s.name}`),
    }
  }

  // ── AV solution drill-down
  for (const sol of avData.solutions) {
    if (msg.includes(sol.name.toLowerCase()) || msg.includes(sol.id.toLowerCase())) {
      const products: ProductCard[] = [{
        id: sol.id,
        name: sol.name,
        company: 'Nanta Tech',
        category: sol.tagline,
        description: sol.description,
        features: sol.key_features,
        industries: sol.industries,
        learnMoreUrl: sol.learn_more_url,
      }]
      return {
        message: `${sol.emoji} **${sol.name}** — ${sol.tagline}`,
        metadata: { products },
        quickReplies: ['Other AV Solutions', 'Discuss Requirements', 'Contact Us', 'ALLBOTIX Robots', 'AI Solutions'],
      }
    }
  }

  // ── "Other AV Products" or "View All AV Products" — go back to category overview
  if (msg === 'other av products' || msg === 'view all av products') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryLabels = avProductsData.categories.map((c: any) => `${c.emoji} ${c.name}`)
    return {
      message: `📺 **AV Products by Nanta Tech** — ${avProductsData.stats.products_count} products across ${avProductsData.stats.categories_count} categories:`,
      metadata: {},
      quickReplies: [...categoryLabels, 'Discuss Requirements', 'Contact Us'],
    }
  }

  // ── Discuss Requirements sentinel
  if (msg === '__discuss__' || msg === 'discuss requirements' || msg === 'discuss your requirements') {
    return {
      message: '🤝 **Let\'s discuss your requirements** — tell us what you\'re looking for and our team will get in touch.',
      metadata: {},
      quickReplies: [],
    }
  }

  // ── Contact Us
  if (msg === 'contact us' || msg === '__contact_us__') {
    return {
      message: '📞 **Get in touch with Nanta Tech** — we\'re happy to help!',
      metadata: { showContactInfo: true },
      quickReplies: ['Discuss Requirements', 'ALLBOTIX Robots', 'AI Solutions', 'AV Solutions'],
    }
  }

  return null
}

// ─── Capture visitor requirement into Lead notes ──────────────────────────────

async function captureRequirementNote(conversationId: string, requirement: string) {
  try {
    // Summarize the requirement using AI (1 sentence, key details only)
    let summary = requirement.substring(0, 120) // fallback if AI fails
    try {
      const provider = getAIProviderWithFallback()
      const result = await provider.generateResponse(
        [{ role: 'user', content: requirement }],
        'You are a CRM assistant. Summarize the visitor\'s business requirement in ONE short sentence (max 20 words). Keep product type, quantity, and use case. No filler words. Reply with only the summary sentence.',
      )
      if (result.content?.trim()) summary = result.content.trim()
    } catch { /* use fallback */ }

    const noteText = `[Requirement]: ${summary}`
    const lead = await prisma.lead.findUnique({ where: { conversationId } })
    if (lead) {
      await prisma.lead.update({
        where: { conversationId },
        data: {
          notes: lead.notes ? `${lead.notes}\n${noteText}` : noteText,
          status: lead.status === 'new' ? 'qualified' : lead.status,
          priority: lead.priority === 'low' ? 'medium' : lead.priority,
          updatedAt: new Date(),
        },
      })
    }
    // Update conversation summary with the same AI-generated summary
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        userIntent: 'discuss_requirements',
        summary,
        updatedAt: new Date(),
      },
    })

    // Send requirement email — fetch session info for contact details
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { session: { select: { visitorName: true, visitorCompany: true, visitorEmail: true, visitorPhone: true, selectedInterests: true } } },
    })
    if (conv?.session) {
      let interests: string[] = []
      try { if (conv.session.selectedInterests) interests = JSON.parse(conv.session.selectedInterests) } catch {}
      sendRequirementEmail({
        name:    conv.session.visitorName,
        company: conv.session.visitorCompany,
        email:   conv.session.visitorEmail,
        phone:   conv.session.visitorPhone,
        interests,
        requirement: summary,
      }).catch(() => {})
    }
  } catch { /* non-critical */ }
}

// ─── Context-aware quick replies ──────────────────────────────────────────────

function getQuickReplies(userMessage: string, intent: string, userMsgCount: number): string[] {
  const msg = userMessage.toLowerCase()

  // After experience rating — positive
  if (/😊|excellent|🙂|good|amazing|great|wonderful|loved|impressive|fantastic/.test(msg)) {
    return ['AI Solutions', 'ALLBOTIX Robots', 'AV Solutions', 'Automation', 'Other']
  }

  if (/😐|average|okay|ok\b|so.so/.test(msg)) {
    return ['Tell us more', 'What could be better?', 'Ask a question', 'Discuss Requirements']
  }

  if (/😕|needs improvement|😞|poor|bad|disappointing|not good/.test(msg)) {
    return ['Share feedback', 'Speak to a representative', 'Contact Us']
  }

  // Topic: Robotics
  if (intent === 'robotics' || /robot|allbotix|cleaning robot|reception robot|amr/.test(msg)) {
    return ['🤝 Reception & Information Robot', '🧹 Autonomous Cleaning Robot', '🍽️ Autonomous Serving Robot', '📦 Autonomous Mobile Robot (AMR)', 'Discuss Requirements']
  }

  // Topic: Computer Vision / AI
  if (intent === 'ai_vision' || /computer vision|camera|ntra|detection|recognition|surveillance/.test(msg)) {
    return ['👤 Face Recognition', '🚧 Restricted Area Monitoring', '🚗 Vehicle Detection', '🦺 PPE Detection', 'Discuss Requirements']
  }

  // Topic: AV Products (specific product type queries → show product categories)
  if (/audio|microphone|speakerphone|ptz|webcam|video bar|interactive panel|smart board|digital signage|led display/.test(msg)) {
    return ['🎙️ Conference Audio', '📹 Conference Video', '🎥 PTZ Cameras', '🖥️ Digital Signage', 'Other AV Products']
  }

  // Topic: AV Solutions (integration/room solutions)
  if (intent === 'av' || /\bav\b|display|panel|projector|meeting room|conference/.test(msg)) {
    return ['AV Products', '💼 Meeting Room Solution', '📺 Video Wall Solution', '📢 Public Address System', 'Discuss Requirements']
  }

  // Topic: Automation / Smart
  if (/automation|smart city|smart building|iot/.test(msg)) {
    return ['Smart Offices', 'AI Solutions', 'ALLBOTIX Robots', 'Discuss Requirements']
  }

  // Demo intent
  if (intent === 'demo' || /demo|book|schedule/.test(msg)) {
    return ['Yes, book a demo', 'Online session preferred', 'Visit the center', 'Maybe later']
  }

  // Contact intent
  if (intent === 'contact' || /contact|email|phone|sales|reach/.test(msg)) {
    return ['Send an email', 'WhatsApp us', 'Request a callback']
  }

  // Later turns
  if (userMsgCount >= 4) {
    return ['AI Solutions', 'Discuss Requirements', 'Contact Us', 'Other topics']
  }

  return ['AI Solutions', 'ALLBOTIX Robots', 'AV Solutions', 'Discuss Requirements']
}

// ─── Product card builder (for organic AI conversations) ─────────────────────

function buildProductCard(message: string, intent: string): MessageMetadata {
  const lower = message.toLowerCase()

  if (intent === 'contact') return { showContactInfo: true }

  if (intent === 'robotics' || lower.includes('robot')) {
    const products = knowledgeService.searchProducts(message, 'ALLBOTIX').slice(0, 2)
    if (products.length > 0) {
      return {
        products: products.map(p => ({
          id: p.id, name: p.name, company: p.company, category: p.category,
          description: p.description.substring(0, 120),
          features: p.features?.slice(0, 4),
          learnMoreUrl: 'https://www.allbotix.ai/products',
        })),
      }
    }
  }

  if (intent === 'ai_vision') {
    const solutions = knowledgeService.searchSolutions(message, 'NTRA').slice(0, 2)
    if (solutions.length > 0) {
      return {
        solutions: solutions.map(s => ({
          id: s.id, name: s.name, company: 'AI Solutions',
          description: s.description.substring(0, 120),
          industries: s.industries?.slice(0, 4),
          learnMoreUrl: 'https://ntra.nantatech.com/solutions',
        })),
      }
    }
  }

  if (intent === 'av') {
    const products = knowledgeService.searchProducts(message, 'Nanta Tech').slice(0, 2)
    if (products.length > 0) {
      return {
        products: products.map(p => ({
          id: p.id, name: p.name, company: p.company, category: p.category,
          description: p.description.substring(0, 120),
          features: p.features?.slice(0, 4),
          learnMoreUrl: 'https://www.nantatech.com/products/av-integrations',
        })),
      }
    }
  }

  return {}
}

// ─── Conversation analytics ───────────────────────────────────────────────────

interface ConvRecord {
  messageCount: number
  sentiment?: string | null
  topicsDiscussed?: string | null
  leadScore?: number | null
}

function analyzeConversation(
  userMessage: string,
  intent: string,
  conversation: ConvRecord,
  interests: string[]
): {
  userIntent?: string; sentiment?: string; topicsDiscussed?: string[]
  leadScore?: number; title?: string
} {
  const msg = userMessage.toLowerCase()

  const positive = ['great', 'excellent', 'amazing', 'loved', 'interested', 'perfect', 'impressive', 'good', 'fantastic', '😊', '🙂']
  const negative = ['bad', 'poor', 'disappointing', 'boring', 'confusing', 'not interested', 'waste', '😕', '😞']
  let sentiment = conversation.sentiment || 'neutral'
  if (positive.some(w => msg.includes(w))) sentiment = 'positive'
  else if (negative.some(w => msg.includes(w))) sentiment = 'negative'

  const existing: string[] = []
  try { if (conversation.topicsDiscussed) existing.push(...JSON.parse(conversation.topicsDiscussed)) } catch { /* ignore */ }

  const topicMap: Record<string, string> = {
    robot: 'Robotics', allbotix: 'Robotics', 'cleaning robot': 'Cleaning Robots',
    amr: 'Warehouse Robotics', 'reception robot': 'Reception Robots', humanoid: 'Humanoid Robots',
    ntra: 'AI Solutions', camera: 'Camera Analytics', detection: 'AI Detection',
    'face recognition': 'Face Recognition', vehicle: 'Vehicle Detection', security: 'Security',
    panel: 'AV Panels', display: 'Digital Displays', 'meeting room': 'AV Integration',
    led: 'LED Technology', conference: 'Video Conferencing',
    automation: 'Automation', 'smart city': 'Smart Cities',
    demo: 'Demo Request', price: 'Pricing Inquiry', cost: 'Pricing Inquiry',
    hospital: 'Healthcare', hotel: 'Hospitality', retail: 'Retail', warehouse: 'Warehousing',
  }

  for (const [kw, topic] of Object.entries(topicMap)) {
    if (msg.includes(kw) && !existing.includes(topic)) existing.push(topic)
  }

  for (const interest of interests) {
    if (!existing.includes(interest)) existing.push(interest)
  }

  let score = conversation.leadScore ?? 20
  if (conversation.messageCount > 2) score += 8
  if (conversation.messageCount > 6) score += 8
  if (sentiment === 'positive') score += 10
  if (sentiment === 'negative') score -= 5
  if (/demo|book|schedule/.test(msg)) score += 25
  if (/price|cost|budget|quote/.test(msg)) score += 20
  if (/my company|our company|we need/.test(msg)) score += 15
  if (/want to purchase|implement|deploy/.test(msg)) score += 20
  if (interests.length >= 3) score += 10
  score = Math.max(0, Math.min(100, score))

  return {
    userIntent: intent !== 'general' ? intent : undefined,
    sentiment,
    topicsDiscussed: existing.slice(0, 10),
    leadScore: score,
    title: userMessage.substring(0, 60),
  }
}
