import path from 'path'
import fs from 'fs'
import type {
  Company, Product, Solution, FAQ, ChatbotQA,
  MediaEntry, KnowledgeChunk, KnowledgeGraph
} from '@/types/knowledge'

const KB_DIR = path.join(process.cwd(), 'knowledge_base')

function readJSON<T>(filename: string): T {
  const filePath = path.join(KB_DIR, filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

let _companies: Company[] | null = null
let _products: Product[] | null = null
let _solutions: Solution[] | null = null
let _faqs: FAQ[] | null = null
let _qa: ChatbotQA[] | null = null
let _media: MediaEntry[] | null = null
let _chunks: KnowledgeChunk[] | null = null
let _graph: KnowledgeGraph | null = null

export function getCompanies(): Company[] {
  if (!_companies) {
    const data = readJSON<{ companies: Company[] }>('company_profile.json')
    _companies = data.companies
  }
  return _companies
}

export function getProducts(): Product[] {
  if (!_products) {
    const data = readJSON<{ products: Product[] }>('products.json')
    _products = data.products
  }
  return _products
}

export function getSolutions(): Solution[] {
  if (!_solutions) {
    const data = readJSON<{ solutions: Solution[] }>('solutions.json')
    _solutions = data.solutions
  }
  return _solutions
}

export function getFAQs(): FAQ[] {
  if (!_faqs) {
    const data = readJSON<{ faqs: FAQ[] }>('faq.json')
    _faqs = data.faqs
  }
  return _faqs
}

export function getChatbotQA(): ChatbotQA[] {
  if (!_qa) {
    const data = readJSON<{ chatbot_qa: ChatbotQA[] }>('chatbot_qa.json')
    _qa = data.chatbot_qa
  }
  return _qa
}

export function getMedia(): MediaEntry[] {
  if (!_media) {
    const data = readJSON<{ media: MediaEntry[] }>('media.json')
    _media = data.media
  }
  return _media
}

export function getKnowledgeChunks(): KnowledgeChunk[] {
  if (!_chunks) {
    const data = readJSON<{ knowledge_chunks: KnowledgeChunk[] }>('knowledge_chunks.json')
    _chunks = data.knowledge_chunks
  }
  return _chunks
}

export function getKnowledgeGraph(): KnowledgeGraph {
  if (!_graph) {
    const data = readJSON<{ knowledge_graph: KnowledgeGraph }>('knowledge_graph.json')
    _graph = data.knowledge_graph
  }
  return _graph
}

export function reloadCache() {
  _companies = null
  _products = null
  _solutions = null
  _faqs = null
  _qa = null
  _media = null
  _chunks = null
  _graph = null
}
