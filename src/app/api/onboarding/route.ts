import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateSessionToken } from '@/lib/auth/jwt'
import { leadRepo } from '@/repositories/LeadRepository'
import { conversationRepo } from '@/repositories/ConversationRepository'
import { sendLeadEmail } from '@/lib/mail/mailer'

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

        // Always create a lead — name + company are required fields so this always fires
        await leadRepo.createOrUpdate({
          conversationId: conv.id,
          name:        s.visitorName        || undefined,
          email:       s.visitorEmail       || undefined,
          phone:       s.visitorPhone       || undefined,
          company:     s.visitorCompany     || undefined,
          designation: s.visitorDesignation || undefined,
          industry:    s.visitorIndustry    || undefined,
          interestedIn: s.selectedInterests || undefined,
        })

        // Build an initial summary from selected interests + ratings for Finish (no-chat) path
        let interests: string[] = []
        try { if (s.selectedInterests) interests = JSON.parse(s.selectedInterests) } catch {}
        const ratings: string[] = []
        if (s.aiRating)         ratings.push(`AI Solutions: ${s.aiRating}/5`)
        if (s.avRating)         ratings.push(`AV: ${s.avRating}/5`)
        if (s.roboticsRating)   ratings.push(`Robotics: ${s.roboticsRating}/5`)
        if (s.automationRating) ratings.push(`Automation: ${s.automationRating}/5`)
        if (s.experienceRating) ratings.push(`Overall Experience: ${s.experienceRating}/5`)
        if (interests.length > 0 || ratings.length > 0) {
          const summaryParts: string[] = []
          if (interests.length) summaryParts.push(`Interested in: ${interests.join(', ')}.`)
          if (ratings.length)   summaryParts.push(`Ratings — ${ratings.join(', ')}.`)
          await prisma.conversation.update({
            where: { id: conv.id },
            data: { summary: summaryParts.join(' ') },
          })
        }

        // Send lead email (fire-and-forget — don't block the response)
        sendLeadEmail({
          name:        s.visitorName,
          company:     s.visitorCompany,
          designation: s.visitorDesignation,
          email:       s.visitorEmail,
          phone:       s.visitorPhone,
          industry:    s.visitorIndustry,
          interests,
          aiRating:         s.aiRating,
          avRating:         s.avRating,
          roboticsRating:   s.roboticsRating,
          automationRating: s.automationRating,
          experienceRating: s.experienceRating,
          path: 'finish', // updated to 'chat' by KioskApp when chat path is used
        }).catch(err => console.error('[Onboarding] Lead email failed:', err))

        return NextResponse.json({ sessionToken: session.sessionToken, conversationId: conv.id })
      }
    }

    return NextResponse.json({ sessionToken: session.sessionToken })
  } catch (error) {
    console.error('Onboarding API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
