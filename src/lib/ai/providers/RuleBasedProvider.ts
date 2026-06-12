import { BaseAIProvider, AIMessage, AIResponse } from '../AIProvider'
import { knowledgeService } from '@/lib/knowledge/KnowledgeService'

export class RuleBasedProvider extends BaseAIProvider {
  getName() { return 'rule-based' }
  isAvailable() { return true }

  async generateResponse(messages: AIMessage[], _systemPrompt?: string): Promise<AIResponse> {
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUser) return { content: "How can I help you today?" }
    const msg = lastUser.content.toLowerCase()
    const turn = messages.filter(m => m.role === 'user').length
    return { content: this.buildResponse(msg, turn) }
  }

  private buildResponse(msg: string, turn: number): string {
    // Farewell
    if (/bye|goodbye|thank you|thanks/.test(msg)) {
      return "Thank you for visiting! Feel free to reach out anytime. 👋"
    }

    // Experience ratings — positive
    if (/😊|excellent|🙂|good|amazing|great|wonderful|loved|impressive/.test(msg)) {
      return "That's wonderful to hear! 🎉 What impressed you the most?"
    }

    // Experience ratings — average
    if (/😐|average|okay|alright|so.so/.test(msg)) {
      return "Thank you for the honest feedback. What could we have done better?"
    }

    // Experience ratings — negative
    if (/😕|needs improvement|😞|poor|bad|disappointed/.test(msg)) {
      return "We appreciate your feedback and want to do better. Could you share what fell short?"
    }

    // Robotics — reception
    if (/reception robot|atr|front desk|check.in/.test(msg)) {
      return "The ATR V3 handles 24/7 reception with touchscreen interaction. Want to see it in action?"
    }

    // Robotics — cleaning
    if (/cleaning robot|floor|scrub|sweep/.test(msg)) {
      return "Our cleaning robots cover up to 10,700 sq ft per charge. Which environment — hospital, office, or factory?"
    }

    // Robotics — serving
    if (/serving robot|deliver|food|restaurant/.test(msg)) {
      return "Our serving robots handle food and item delivery in hotels and restaurants. Want a demo?"
    }

    // Robotics — warehouse / AMR
    if (/amr|warehouse|logistics|payload|heavy/.test(msg)) {
      return "Our AT300 carries 300kg and AT600 carries 600kg autonomously. Interested in warehouse automation?"
    }

    // General robotics
    if (/robot|allbotix/.test(msg)) {
      return "ALLBOTIX has 7 robot categories — from reception to warehouse. Which type interests you most?"
    }

    // Computer Vision / AI
    if (/face recognition|face detection/.test(msg)) {
      return "NTRA face recognition works with existing cameras — no hardware upgrade needed. What's your use case?"
    }
    if (/vehicle|car|anpr|license plate/.test(msg)) {
      return "NTRA detects vehicles and reads license plates in real time. Interested in parking or access control?"
    }
    if (/security|surveillance|threat|weapon/.test(msg)) {
      return "NTRA detects threats including weapons and suspicious behavior at 99% accuracy. Want to see it in action?"
    }
    if (/computer vision|camera|ntra|\bai\b|detection/.test(msg)) {
      return "NTRA gives your existing cameras 39+ AI capabilities — no new hardware needed. Which area interests you?"
    }

    // AV
    if (/meeting room|conference/.test(msg)) {
      return "We design complete meeting room AV setups — panels, cameras, audio, integration. What's your room size?"
    }
    if (/led|display|screen|panel/.test(msg)) {
      return "We have interactive AI panels from 55\" to 98\" and Active LED displays. Indoor or outdoor use?"
    }
    if (/\bav\b|audio.visual/.test(msg)) {
      return "Nanta Tech AV covers panels, LED walls, video bars, and full integration. What space are you designing?"
    }

    // Demo
    if (/demo|demonstration|book|schedule/.test(msg)) {
      return "We'd love to show you! Leave your details and our team will reach out to book a session."
    }

    // Pricing
    if (/price|cost|budget|quote|how much/.test(msg)) {
      return "Pricing is tailored to your deployment. Email contact@nantatech.com for a quick quote."
    }

    // Contact
    if (/contact|email|phone|whatsapp|call|sales/.test(msg)) {
      return "Reach us at contact@nantatech.com or WhatsApp +91 99090 41675 — Monday to Friday, 10am–7pm IST."
    }

    // Topics introduced by user
    if (/smart city|iot|automation/.test(msg)) {
      return "Smart automation can transform how a space operates. What process are you looking to automate?"
    }

    if (/hospital|healthcare|medical/.test(msg)) {
      return "We serve healthcare with reception robots, AI monitoring, and AV systems. What's your specific need?"
    }
    if (/hotel|hospitality/.test(msg)) {
      return "Hotels use our robots for reception, room service, and concierge. Want to see the full setup?"
    }
    if (/factory|manufactur|warehouse/.test(msg)) {
      return "We deploy AMR robots and AI safety monitoring in manufacturing. What's your main challenge?"
    }

    // Default engagement
    const defaults = [
      "Interesting — can you tell me a bit more about what you're looking for?",
      "Which area is most relevant to your organization — Robotics, AI, or AV?",
      "I'd love to point you to the right solution. What challenge are you trying to solve?",
      "Great topic! What specific use case do you have in mind?",
    ]
    return defaults[turn % defaults.length]
  }
}
