# Inogration AI Experience & Feedback Assistant

**Production-ready AI chatbot and digital receptionist** for Nanta Tech Limited — ALLBOTIX Robotics, NTRA AI Vision, and AV Solutions.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your settings

# 3. Set up database
npm run db:push
npm run db:seed

# 4. Start development server
npm run dev
```

Open http://localhost:3000

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with product overview |
| `/chat` | Full AI chatbot experience |
| `/products` | Product catalog |
| `/solutions` | Solutions catalog |
| `/about` | Company overview |
| `/contact` | Contact information |
| `/admin` | Admin dashboard (login required) |
| `/admin/login` | Admin sign-in |
| `/admin/conversations` | All chat conversations |
| `/admin/feedback` | Customer feedback management |
| `/admin/leads` | Lead pipeline management |
| `/admin/knowledge` | Knowledge base status |

---

## Admin Credentials

Default (set in `.env`):
- **Email:** admin@nantatech.com
- **Password:** Admin@123!

---

## AI Provider Configuration

Set `AI_PROVIDER` in `.env`:

```env
# Options: rule-based | claude | openai | gemini
AI_PROVIDER=rule-based

# For Claude
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your-key
CLAUDE_MODEL=claude-sonnet-4-6

# For OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4o
```

---

## Architecture

```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── api/          # REST API endpoints
│   ├── admin/        # Admin panel (server-rendered)
│   ├── chat/         # Chatbot page
│   └── ...
├── components/
│   ├── chat/         # ChatInterface, MessageBubble, WelcomeScreen, FeedbackModal
│   └── ui/           # Button, Card, Input, Badge
├── lib/
│   ├── ai/           # AI provider abstraction (rule-based, Claude, OpenAI, Gemini)
│   ├── auth/         # JWT authentication
│   ├── db/           # Prisma client
│   └── knowledge/    # Knowledge base loader and search service
├── repositories/     # Data access layer (Conversation, Message, Lead, Feedback)
└── types/            # TypeScript type definitions

knowledge_base/
├── company_profile.json
├── products.json
├── solutions.json
├── faq.json
├── chatbot_qa.json
├── media.json
├── knowledge_graph.json
└── knowledge_chunks.json

prisma/
└── schema.prisma     # SQLite database schema
```

---

## Database

Uses **Prisma ORM** with **SQLite** by default. Change `DATABASE_URL` to use PostgreSQL or MySQL:

```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/inogration"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/inogration"
```

---

## Deployment

### Vercel
```bash
npm run build
# Push to GitHub → connect to Vercel → add environment variables
```

### Hostinger (Node.js hosting)
```bash
# Set in .env
HOSTINGER=true

npm run build
npm run start  # runs on port 3000
```

### Self-hosted (standalone)
```bash
# Set in .env
BUILD_STANDALONE=true

npm run build
node .next/standalone/server.js
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `ADMIN_SECRET_KEY` | JWT signing secret (min 32 chars) | — |
| `ADMIN_EMAIL` | Admin login email | `admin@nantatech.com` |
| `ADMIN_PASSWORD` | Admin login password | `Admin@123!` |
| `AI_PROVIDER` | AI provider: `rule-based`, `claude`, `openai`, `gemini` | `rule-based` |
| `ANTHROPIC_API_KEY` | Claude API key | — |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `GEMINI_API_KEY` | Gemini API key | — |

---

## Knowledge Base Updates

Replace any JSON file in `knowledge_base/` and restart the server. The in-memory cache is automatically refreshed.

---

Built with Next.js 15 · TypeScript · Tailwind CSS · Prisma · SQLite
# Feedback-Chatbot
