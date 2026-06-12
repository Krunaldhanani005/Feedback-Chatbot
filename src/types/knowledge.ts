export interface Company {
  id: string
  name: string
  tagline: string
  description: string
  mission: string
  vision: string
  contact: Contact
  stats?: Record<string, string>
  industries?: string[]
  technologies?: string[]
}

export interface Contact {
  email: string
  whatsapp: string[]
  address: string
  hours?: string
}

export interface Product {
  id: string
  company: string
  name: string
  category: string
  description: string
  features?: string[]
  specifications?: Record<string, string>
  use_cases?: string[]
  industries?: string[]
  image_path?: string
  pdf_url?: string
  related_products?: string[]
}

export interface Solution {
  id: string
  company: string
  name: string
  category: string
  description: string
  capabilities?: string[]
  industries?: string[]
  products?: string[]
  benefits?: string[]
  image_path?: string
}

export interface FAQ {
  question: string
  answer: string
  source?: string
  company?: string
  category?: string
}

export interface ChatbotQA {
  question: string
  answer: string
  company: string
  category: string
}

export interface MediaEntry {
  id?: string
  image_path: string
  title: string
  alt_text: string
  related_product?: string
  related_solution?: string
  company: string
  type?: string
}

export interface KnowledgeChunk {
  id: string
  title: string
  company: string
  content: string
  keywords: string[]
}

export interface KnowledgeGraph {
  entities: KGEntity[]
  relationships: KGRelationship[]
  product_to_company_map: Record<string, string>
  solution_to_industry_map: Record<string, string[]>
}

export interface KGEntity {
  id: string
  type: string
  name: string
  description?: string
  company?: string
}

export interface KGRelationship {
  from: string
  relation: string
  to: string
}

export interface SearchResult {
  type: 'product' | 'solution' | 'faq' | 'chunk' | 'qa'
  item: Product | Solution | FAQ | KnowledgeChunk | ChatbotQA
  score: number
}
