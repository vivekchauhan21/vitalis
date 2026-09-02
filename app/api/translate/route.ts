import { NextResponse } from 'next/server'

/** Translates structured guidance through Gemini without exposing credentials. */
export async function POST(request: Request) {
  try {
    const body = await request.json() as { text?: unknown; language?: unknown }
    const text = typeof body.text === 'string' ? body.text.slice(0, 6000) : ''
    const language = typeof body.language === 'string' ? body.language.slice(0, 40) : ''
    if (!text || !language) return NextResponse.json({ error: 'Text and language are required.' }, { status: 400 })
    const key = process.env.GEMINI_API_KEY
    if (!key) return NextResponse.json({ text })
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `Translate this safety guidance into ${language}. Preserve the steps and warnings exactly in meaning. Text: ${text}` }] }] }), signal: AbortSignal.timeout(20_000) })
    if (!response.ok) throw new Error('Translation request failed')
    const data = await response.json(); return NextResponse.json({ text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? text })
  } catch { return NextResponse.json({ error: 'Unable to translate right now.' }, { status: 502 }) }
}
