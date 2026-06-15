import nodemailer from 'nodemailer'

function getTransporter() {
  const host = process.env.EMAIL_HOST?.trim()
  const port = parseInt(process.env.EMAIL_PORT?.trim() || '587')
  const user = process.env.EMAIL_USER?.trim()
  const pass = process.env.EMAIL_PASS?.trim()

  if (!host || !user || !pass) {
    console.warn('[Mailer] EMAIL_HOST / EMAIL_USER / EMAIL_PASS not set — skipping email')
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,   // true only for port 465 (SSL), false for 587 (STARTTLS)
    requireTLS: port !== 465, // force STARTTLS upgrade on port 587
    auth: { user, pass },
    tls: { rejectUnauthorized: false }, // allow self-signed certs (needed on some hosts)
  })
}

const FROM   = () => `"Nanta Tech Kiosk" <${process.env.EMAIL_USER}>`
const TO     = () => process.env.EMAIL_TO || process.env.EMAIL_USER || ''

function ratingStars(value: number | null | undefined): string {
  if (!value) return '—'
  return '★'.repeat(value) + '☆'.repeat(5 - value) + ` (${value}/5)`
}

function pill(text: string, color = '#DC2626'): string {
  return `<span style="display:inline-block;background:${color}1a;color:${color};border:1px solid ${color}33;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:600;margin:2px 3px 2px 0">${text}</span>`
}

function section(title: string, body: string): string {
  return `
    <div style="margin:18px 0 0;background:#F8F7F4;border:1px solid #E5E4DF;border-radius:12px;padding:14px 16px">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9B9B97">${title}</p>
      ${body}
    </div>`
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return ''
  return `<div style="display:flex;gap:8px;margin-bottom:6px">
    <span style="color:#9B9B97;font-size:13px;min-width:110px;flex-shrink:0">${label}</span>
    <span style="color:#0F0F0E;font-size:13px;font-weight:500">${value}</span>
  </div>`
}

function emailWrapper(subject: string, badge: string, badgeColor: string, body: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F0EFEB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #E5E4DF;box-shadow:0 4px 24px rgba(0,0,0,0.06)">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#DC2626 0%,#EF4444 100%);padding:24px 28px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0;color:rgba(255,255,255,0.8);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.1em">Nanta Tech Experience Days</p>
                <h1 style="margin:4px 0 0;color:#FFFFFF;font-size:20px;font-weight:700">${subject}</h1>
              </td>
              <td align="right" valign="middle">
                <span style="display:inline-block;background:rgba(255,255,255,0.2);color:#fff;border-radius:999px;padding:4px 12px;font-size:12px;font-weight:700;border:1px solid rgba(255,255,255,0.3)">${badge}</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:24px 28px;color:#0F0F0E">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 28px;border-top:1px solid #E5E4DF;background:#F8F7F4">
          <p style="margin:0;font-size:11px;color:#9B9B97">Nanta Tech Limited · Shivalik Sharda Harmony, Ambawadi, Ahmedabad 380015 · This is an automated notification from the Experience Days kiosk.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`
}

// ─── Email: New Lead (Finish / Chat with Agent) ───────────────────────────────

export interface LeadEmailData {
  name?: string | null
  company?: string | null
  designation?: string | null
  email?: string | null
  phone?: string | null
  industry?: string | null
  interests?: string[]
  aiRating?: number | null
  avRating?: number | null
  roboticsRating?: number | null
  automationRating?: number | null
  experienceRating?: number | null
  path: 'finish' | 'chat'
}

export async function sendLeadEmail(data: LeadEmailData) {
  const transporter = getTransporter()
  if (!transporter || !TO()) return

  const interestTags = (data.interests || []).map(i => pill(i)).join('')
  const hasRatings = data.aiRating || data.avRating || data.roboticsRating || data.automationRating || data.experienceRating

  const body = `
    <p style="margin:0 0 4px;font-size:15px;color:#4B4B47">A visitor just submitted their details at the <strong>Nanta Tech Experience Days</strong> kiosk.</p>

    ${section('Visitor Info', `
      ${row('Name',        data.name)}
      ${row('Company',     data.company)}
      ${row('Designation', data.designation)}
      ${row('Email',       data.email ? `<a href="mailto:${data.email}" style="color:#DC2626">${data.email}</a>` : null)}
      ${row('Phone',       data.phone ? `<a href="tel:${data.phone}" style="color:#DC2626">${data.phone}</a>` : null)}
      ${row('Industry',    data.industry)}
      ${row('Submitted via', data.path === 'chat' ? 'Chat with Agent' : 'Finish (no chat)')}
    `)}

    ${data.interests?.length ? section('Areas of Interest', `<div style="margin-top:2px">${interestTags}</div>`) : ''}

    ${hasRatings ? section('Department Ratings', `
      ${row('AI Solutions',  ratingStars(data.aiRating))}
      ${row('AV Technology', ratingStars(data.avRating))}
      ${row('Robotics',      ratingStars(data.roboticsRating))}
      ${row('Automation',    ratingStars(data.automationRating))}
      ${row('Experience',    ratingStars(data.experienceRating))}
    `) : ''}
  `

  try {
    await transporter.sendMail({
      from: FROM(),
      to:   TO().trim(),
      subject: `🎯 New Lead: ${data.name || 'Visitor'} — ${data.company || 'Unknown Company'}`,
      html: emailWrapper('New Lead Captured', data.path === 'chat' ? 'Chat Path' : 'Finish Path', '#DC2626', body),
    })
    console.log(`[Mailer] Lead email sent to ${TO()} for ${data.name}`)
  } catch (err) {
    console.error('[Mailer] Failed to send lead email:', err)
    throw err
  }
}

// ─── Email: Discuss Requirements ─────────────────────────────────────────────

export interface RequirementEmailData {
  name?: string | null
  company?: string | null
  email?: string | null
  phone?: string | null
  interests?: string[]
  requirement: string
}

export async function sendRequirementEmail(data: RequirementEmailData) {
  const transporter = getTransporter()
  if (!transporter || !TO()) return

  const interestTags = (data.interests || []).map(i => pill(i)).join('')

  const body = `
    <p style="margin:0 0 4px;font-size:15px;color:#4B4B47">A visitor submitted a <strong>business requirement</strong> at the kiosk.</p>

    ${section('Visitor Info', `
      ${row('Name',    data.name)}
      ${row('Company', data.company)}
      ${row('Email',   data.email ? `<a href="mailto:${data.email}" style="color:#DC2626">${data.email}</a>` : null)}
      ${row('Phone',   data.phone ? `<a href="tel:${data.phone}" style="color:#DC2626">${data.phone}</a>` : null)}
    `)}

    ${data.interests?.length ? section('Areas of Interest', `<div style="margin-top:2px">${interestTags}</div>`) : ''}

    <div style="margin:18px 0 0;background:#FEF2F2;border:1.5px solid #FECACA;border-radius:12px;padding:16px 18px">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#DC2626">📋 Their Requirement</p>
      <p style="margin:0;font-size:15px;color:#7F1D1D;font-weight:600;line-height:1.6">${data.requirement}</p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: FROM(),
      to:   TO().trim(),
      subject: `📋 Requirement: ${data.name || 'Visitor'} (${data.company || 'Unknown'}) — Action Required`,
      html: emailWrapper('New Requirement Submitted', '⚡ Needs Followup', '#DC2626', body),
    })
    console.log(`[Mailer] Requirement email sent to ${TO()}`)
  } catch (err) {
    console.error('[Mailer] Failed to send requirement email:', err)
    throw err
  }
}

// ─── Email: Chat Feedback (star rating) ──────────────────────────────────────

export interface FeedbackEmailData {
  rating: number
  ratingLabel: string
  visitorName?: string | null
  visitorCompany?: string | null
  visitorEmail?: string | null
  interestedIn?: string[]
  comments?: string | null
}

export async function sendFeedbackEmail(data: FeedbackEmailData) {
  const transporter = getTransporter()
  if (!transporter || !TO()) return

  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating)
  const ratingColor = data.rating >= 4 ? '#16A34A' : data.rating >= 3 ? '#D97706' : '#DC2626'
  const interestTags = (data.interestedIn || []).map(i => pill(i)).join('')

  const body = `
    <p style="margin:0 0 4px;font-size:15px;color:#4B4B47">A visitor submitted a <strong>chat feedback rating</strong>.</p>

    <div style="margin:18px 0 0;background:#F8F7F4;border:1px solid #E5E4DF;border-radius:12px;padding:14px 16px;text-align:center">
      <p style="margin:0;font-size:32px;color:${ratingColor};letter-spacing:3px">${stars}</p>
      <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:${ratingColor};text-transform:capitalize">${data.ratingLabel}</p>
    </div>

    ${section('Visitor', `
      ${row('Name',    data.visitorName)}
      ${row('Company', data.visitorCompany)}
      ${row('Email',   data.visitorEmail ? `<a href="mailto:${data.visitorEmail}" style="color:#DC2626">${data.visitorEmail}</a>` : null)}
    `)}

    ${data.interestedIn?.length ? section('Interested In', `<div style="margin-top:2px">${interestTags}</div>`) : ''}

    ${data.comments ? section('Comments', `<p style="margin:0;font-size:14px;color:#4B4B47;font-style:italic">"${data.comments}"</p>`) : ''}
  `

  try {
    await transporter.sendMail({
      from: FROM(),
      to:   TO().trim(),
      subject: `${stars} Feedback: ${data.ratingLabel} — ${data.visitorName || 'Anonymous'}`,
      html: emailWrapper('Chat Feedback Received', `${data.rating}/5 Stars`, ratingColor, body),
    })
    console.log(`[Mailer] Feedback email sent to ${TO()}`)
  } catch (err) {
    console.error('[Mailer] Failed to send feedback email:', err)
    throw err
  }
}
