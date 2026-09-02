import { NextResponse } from 'next/server'

const limit = new Map<string, { count: number; reset: number }>()
const maxText = 1000

/** Creates a structured, safety-focused first-aid response through Gemini. */
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const now = Date.now(); const current = limit.get(ip)
  if (current && current.reset > now && current.count >= 10) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  limit.set(ip, current && current.reset > now ? { count: current.count + 1, reset: current.reset } : { count: 1, reset: now + 60_000 })
  try {
    const body = await request.json() as { description?: unknown; image?: unknown }
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, maxText) : ''
    const image = typeof body.image === 'string' && body.image.startsWith('data:image/') ? body.image : undefined
    if (description.length < 3 && !image) return NextResponse.json({ error: 'Describe the situation or add an image.' }, { status: 400 })
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ title: 'Basic safety check', summary: 'AI guidance is not configured yet. Keep calm, move away from danger, and contact a trusted person or local emergency services.', urgency: 'medium', steps: ['Move to a safe place if you can do so without worsening the situation.', 'Contact campus safety or local emergency services for personalized help.', 'Do not delay professional care if symptoms are severe or worsening.'], warnings: ['Call emergency services for trouble breathing, heavy bleeding, loss of consciousness, or immediate danger.'], sources: [] })
    const parts: Array<Record<string, unknown>> = [{ text: `You are a cautious first-aid assistant. Return ONLY JSON with title, summary, urgency (low|medium|high), steps (3-5 short strings), warnings (2-4 strings), sources (strings). Never diagnose. Recommend emergency services for serious symptoms. Situation: ${description}` }]
    if (image) parts.push({ inline_data: { mime_type: image.match(/^data:(image\/[a-z0-9.+-]+);base64,/)?.[1] ?? 'image/jpeg', data: image.split(',')[1] } })
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: 'application/json', temperature: 0.1 } }), signal: AbortSignal.timeout(20_000) })
    if (!response.ok) throw new Error('Gemini request failed')
    const data = await response.json(); const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    return NextResponse.json(JSON.parse(text))
  } catch { return NextResponse.json({ error: 'Unable to analyze safely right now.' }, { status: 502 }) }
}
