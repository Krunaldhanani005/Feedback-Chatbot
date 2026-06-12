import Fuse from 'fuse.js'
import {
  getCompanies, getProducts, getSolutions,
  getFAQs, getChatbotQA, getKnowledgeChunks, getMedia
} from './loader'
import type { Product, Solution, FAQ, ChatbotQA, KnowledgeChunk, SearchResult, MediaEntry } from '@/types/knowledge'

export class KnowledgeService {
  searchProducts(query: string, company?: string): Product[] {
    const products = getProducts().filter(p =>
      company ? p.company.toLowerCase().includes(company.toLowerCase()) : true
    )
    const fuse = new Fuse(products, {
      keys: ['name', 'description', 'category', 'features', 'use_cases', 'industries'],
      threshold: 0.4,
    })
    if (!query || query.trim() === '') return products.slice(0, 6)
    return fuse.search(query).map(r => r.item).slice(0, 6)
  }

  searchSolutions(query: string, company?: string): Solution[] {
    const solutions = getSolutions().filter(s =>
      company ? s.company.toLowerCase().includes(company.toLowerCase()) : true
    )
    const fuse = new Fuse(solutions, {
      keys: ['name', 'description', 'category', 'capabilities', 'industries'],
      threshold: 0.4,
    })
    if (!query || query.trim() === '') return solutions.slice(0, 6)
    return fuse.search(query).map(r => r.item).slice(0, 6)
  }

  searchFAQs(query: string): FAQ[] {
    const faqs = getFAQs()
    const fuse = new Fuse(faqs, {
      keys: ['question', 'answer'],
      threshold: 0.4,
    })
    return fuse.search(query).map(r => r.item).slice(0, 3)
  }

  searchQA(query: string, company?: string): ChatbotQA[] {
    const qas = getChatbotQA().filter(qa =>
      company ? qa.company.toLowerCase().includes(company.toLowerCase()) : true
    )
    const fuse = new Fuse(qas, {
      keys: ['question', 'answer', 'category'],
      threshold: 0.35,
    })
    return fuse.search(query).map(r => r.item).slice(0, 3)
  }

  searchChunks(query: string, company?: string): KnowledgeChunk[] {
    const chunks = getKnowledgeChunks().filter(c =>
      company ? c.company.toLowerCase().includes(company.toLowerCase()) : true
    )
    const fuse = new Fuse(chunks, {
      keys: ['title', 'content', 'keywords'],
      threshold: 0.35,
    })
    if (!query) return chunks.slice(0, 4)
    return fuse.search(query).map(r => r.item).slice(0, 4)
  }

  getMediaForProduct(productName: string): MediaEntry[] {
    return getMedia().filter(m =>
      m.related_product?.toLowerCase().includes(productName.toLowerCase()) ||
      m.title.toLowerCase().includes(productName.toLowerCase())
    ).slice(0, 4)
  }

  getMediaForCompany(company: string): MediaEntry[] {
    return getMedia().filter(m =>
      m.company.toLowerCase().includes(company.toLowerCase())
    ).slice(0, 6)
  }

  getAnswer(query: string): string | null {
    const qaResults = this.searchQA(query)
    if (qaResults.length > 0 && qaResults[0]) {
      return qaResults[0].answer
    }
    const faqResults = this.searchFAQs(query)
    if (faqResults.length > 0 && faqResults[0]) {
      return faqResults[0].answer
    }
    const chunks = this.searchChunks(query)
    if (chunks.length > 0 && chunks[0]) {
      return chunks[0].content
    }
    return null
  }

  getContactInfo(): string {
    const companies = getCompanies()
    const nanta = companies.find(c => c.id === 'nanta_tech') || companies[0]
    if (!nanta) return 'Please contact us at contact@nantatech.com'
    const { contact } = nanta
    return `**Contact Information:**\n\n📧 Email: ${contact.email}\n📱 WhatsApp: ${contact.whatsapp.join(' / ')}\n📍 Address: ${contact.address}${contact.hours ? `\n⏰ Hours: ${contact.hours}` : ''}`
  }

  getCompanyOverview(companyId?: string): string {
    const companies = getCompanies()
    if (companyId) {
      const co = companies.find(c => c.id === companyId || c.name.toLowerCase().includes(companyId.toLowerCase()))
      if (co) return `**${co.name}**\n\n${co.description}\n\n**Mission:** ${co.mission}`
    }
    return companies.map(c => `**${c.name}**: ${c.tagline}`).join('\n\n')
  }

  detectIntent(message: string): IntentResult {
    const lower = message.toLowerCase()

    // Contact / demo
    if (/contact|phone|email|whatsapp|call|reach|address|location/.test(lower)) {
      return { intent: 'contact', confidence: 0.9 }
    }
    if (/demo|schedule|book|appointment|visit|show me|trial|pilot/.test(lower)) {
      return { intent: 'demo', confidence: 0.85 }
    }
    // Pricing
    if (/price|pricing|cost|how much|quote|budget|rate/.test(lower)) {
      return { intent: 'pricing', confidence: 0.9 }
    }
    // Product specific
    if (/robot|robotics|cleaning|serving|reception|humanoid|atr|bolt|alpha|amr|cobot|al series/.test(lower)) {
      return { intent: 'robotics', confidence: 0.85 }
    }
    if (/camera|surveillance|cctv|ai vision|ntra|detection|analytics|face|anpr|traffic|security/.test(lower)) {
      return { intent: 'ai_vision', confidence: 0.85 }
    }
    if (/av|audio|video|panel|display|led|projector|conferenc|meeting room|auditorium/.test(lower)) {
      return { intent: 'av', confidence: 0.85 }
    }
    // Company
    if (/about|company|nanta|allbotix|who are|what do you|history|founded/.test(lower)) {
      return { intent: 'company', confidence: 0.8 }
    }
    // Products / solutions
    if (/product|solution|offer|provide|service|what can|capabilities/.test(lower)) {
      return { intent: 'products_overview', confidence: 0.75 }
    }
    // Industry
    if (/hospital|hotel|hospitality|factory|warehouse|retail|smart city|airport|government|education|manufacture/.test(lower)) {
      return { intent: 'industry', confidence: 0.8 }
    }
    // Brochure
    if (/brochure|pdf|download|spec|catalogue|specification/.test(lower)) {
      return { intent: 'brochure', confidence: 0.85 }
    }
    // Feedback / greetings
    if (/hi|hello|hey|good morning|good afternoon|good evening|namaste/.test(lower)) {
      return { intent: 'greeting', confidence: 0.95 }
    }
    if (/thank|thanks|bye|goodbye|see you|exit/.test(lower)) {
      return { intent: 'farewell', confidence: 0.9 }
    }
    if (/feedback|rating|experience|review/.test(lower)) {
      return { intent: 'feedback', confidence: 0.85 }
    }

    return { intent: 'general', confidence: 0.5 }
  }
}

export interface IntentResult {
  intent: string
  confidence: number
}

export const knowledgeService = new KnowledgeService()
