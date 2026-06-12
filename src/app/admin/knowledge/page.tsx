import { getProducts, getSolutions, getFAQs, getKnowledgeChunks, getCompanies } from '@/lib/knowledge/loader'
import { BookOpen, Package, Lightbulb, HelpCircle, Database, Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function KnowledgePage() {
  const [companies, products, solutions, faqs, chunks] = await Promise.all([
    Promise.resolve(getCompanies()),
    Promise.resolve(getProducts()),
    Promise.resolve(getSolutions()),
    Promise.resolve(getFAQs()),
    Promise.resolve(getKnowledgeChunks()),
  ])

  const kbSources = [
    { label: 'Companies',         count: companies.length, icon: Building2, color: 'text-brand-red',  file: 'company_profile.json' },
    { label: 'Products',          count: products.length,  icon: Package,   color: 'text-blue-600',   file: 'products.json' },
    { label: 'Solutions',         count: solutions.length, icon: Lightbulb, color: 'text-purple-600', file: 'solutions.json' },
    { label: 'FAQs',              count: faqs.length,      icon: HelpCircle,color: 'text-amber-600',  file: 'faq.json' },
    { label: 'Knowledge Chunks',  count: chunks.length,    icon: Database,  color: 'text-green-700',  file: 'knowledge_chunks.json' },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Knowledge Base</h1>
        <p className="text-text-secondary text-sm mt-1">Manage the AI chatbot knowledge sources</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kbSources.map(({ label, count, icon: Icon, color, file }) => (
          <div key={label} className="bg-dark-card border border-dark-border rounded-2xl p-5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-3">
              <Icon size={20} className={color} />
              <span className="text-xs text-text-muted font-mono">{file}</span>
            </div>
            <p className="text-3xl font-bold text-text-primary">{count}</p>
            <p className="text-sm text-text-secondary mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-4">
          <BookOpen size={20} className="text-brand-red" />
          <h3 className="font-semibold text-text-primary">Knowledge Base Files</h3>
        </div>
        <p className="text-text-secondary text-sm mb-4">
          All files are in the <code className="text-brand-red bg-red-50 px-1.5 py-0.5 rounded text-xs border border-red-100">knowledge_base/</code> directory at the project root.
        </p>
        <div className="space-y-2">
          {['company_profile.json', 'products.json', 'solutions.json', 'faq.json', 'av_products.json', 'allbotix_products.json', 'ntra_solutions.json', 'av_solutions.json', 'chatbot_qa.json', 'media.json', 'knowledge_graph.json', 'knowledge_chunks.json'].map(file => (
            <div key={file} className="flex items-center gap-3 px-4 py-2.5 bg-dark-elevated border border-dark-border rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-text-primary font-mono">{file}</span>
              <span className="ml-auto text-xs text-green-700 font-medium">Active</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 className="font-semibold text-text-primary mb-2">Update Knowledge Base</h3>
        <p className="text-text-secondary text-sm">
          Replace JSON files in the <code className="text-brand-red bg-red-50 px-1.5 py-0.5 rounded text-xs border border-red-100">knowledge_base/</code> directory and restart the server to reload.
        </p>
      </div>
    </div>
  )
}
