import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateSessionToken } from '@/lib/auth/jwt'
import { leadRepo } from '@/repositories/LeadRepository'
import { conversationRepo } from '@/repositories/ConversationRepository'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      sessionToken?: string
      step: 'init' | 'ratings' | 'interests' | 'details' | 'complete'
      ratings?: { ai?: number; av?: number; robotics?: number; automation?: number; experience?: number }
      interests?: string[]
      details?: {
        name?: string; email?: string; phone?: string
        company?: string; designation?: string; industry?: string
      }
    }

    let session = body.sessionToken
      ? await prisma.session.findUnique({ where: { sessionToken: body.sessionToken } })
      : null

    if (!session) {
      const token = await generateSessionToken()
      session = await prisma.session.create({
        data: {
          sessionToken: token,
          deviceType: req.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
          userAgent: req.headers.get('user-agent') || undefined,
        },
      })
    }

    if (body.step === 'ratings' && body.ratings) {
      await prisma.session.update({
        where: { id: session.id },
        data: {
          aiRating: body.ratings.ai,
          avRating: body.ratings.av,
          roboticsRating: body.ratings.robotics,
          automationRating: body.ratings.automation,
          experienceRating: body.ratings.experience,
        },
      })
    }

    if (body.step === 'interests' && body.interests) {
      await prisma.session.update({
        where: { id: session.id },
        data: { selectedInterests: JSON.stringify(body.interests) },
      })
    }

    if (body.step === 'details' && body.details) {
      await prisma.session.update({
        where: { id: session.id },
        data: {
          visitorName: body.details.name || null,
          visitorEmail: body.details.email || null,
          visitorPhone: body.details.phone || null,
          visitorCompany: body.details.company || null,
          visitorDesignation: body.details.designation || null,
          visitorIndustry: body.details.industry || null,
        },
      })
    }

    if (body.step === 'complete') {
      await prisma.session.update({
        where: { id: session.id },
        data: { onboardingComplete: true },
      })

      // Create an initial conversation for this session
      const s = await prisma.session.findUnique({ where: { id: session.id } })
      if (s) {
        const conv = await conversationRepo.create({ sessionId: session.id })

        // Save visitor as a lead if they provided contact info
        if (s.visitorEmail || s.visitorPhone || s.visitorName) {
          await leadRepo.createOrUpdate({
            conversationId: conv.id,
            name: s.visitorName || undefined,
            email: s.visitorEmail || undefined,
            phone: s.visitorPhone || undefined,
            company: s.visitorCompany || undefined,
            designation: s.visitorDesignation || undefined,
            industry: s.visitorIndustry || undefined,
            interestedIn: s.selectedInterests || undefined,
          })
        }

        return NextResponse.json({ sessionToken: session.sessionToken, conversationId: conv.id })
      }
    }

    return NextResponse.json({ sessionToken: session.sessionToken })
  } catch (error) {
    console.error('Onboarding API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
