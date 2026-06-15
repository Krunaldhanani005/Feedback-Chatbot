import { NextResponse } from 'next/server'
import { sendLeadEmail } from '@/lib/mail/mailer'

export async function GET() {
  const config = {
    EMAIL_HOST: process.env.EMAIL_HOST || '❌ NOT SET',
    EMAIL_PORT: process.env.EMAIL_PORT || '❌ NOT SET',
    EMAIL_USER: process.env.EMAIL_USER || '❌ NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? `✅ SET (${process.env.EMAIL_PASS.length} chars)` : '❌ NOT SET',
    EMAIL_TO:   process.env.EMAIL_TO?.trim() || '❌ NOT SET',
  }

  try {
    await sendLeadEmail({
      name: 'Test Visitor',
      company: 'Nanta Tech',
      designation: 'CEO',
      email: 'test@example.com',
      phone: '+91 99000 00000',
      industry: 'Technology',
      interests: ['AI Solutions', 'Robotics'],
      aiRating: 5,
      avRating: 4,
      roboticsRating: 5,
      automationRating: 4,
      experienceRating: 5,
      path: 'finish',
    })
    return NextResponse.json({
      success: true,
      message: `✅ Email sent to ${process.env.EMAIL_TO?.trim()}`,
      config,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
      config,
    }, { status: 500 })
  }
}
