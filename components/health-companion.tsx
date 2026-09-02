'use client'

import { useMemo, useRef, useState } from 'react'
import { AlertTriangle, Camera, Check, CircleHelp, Cross, Globe2, LocateFixed, MessageSquare, Plus, ShieldCheck, Sparkles, Trash2, Upload, UserRound, X } from 'lucide-react'

type Result = { title: string; summary: string; urgency: 'low' | 'medium' | 'high'; steps: string[]; warnings: string[]; sources: string[] }
type Contact = { id: number; name: string; relationship: string; phone: string; email: string }

const languages = ['English', 'Spanish', 'French', 'Arabic', 'Hindi', 'Mandarin']
const initialContacts: Contact[] = [{ id: 1, name: 'Avery Chen', relationship: 'Roommate', phone: '+1 555 019 2024', email: 'avery@example.com' }]

/** Main client experience for the Health & Safety Companion. */
export function HealthCompanion() {
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [language, setLanguage] = useState('English')
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [location, setLocation] = useState<string | null>(null)
  const [contacts, setContacts] = useState(initialContacts)
  const [showContacts, setShowContacts] = useState(false)
  const [toast, setToast] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const canAnalyze = useMemo(() => description.trim().length > 2 || Boolean(image), [description, image])

  async function analyze() {
    if (!canAnalyze || busy) return
    setBusy(true); setToast('')
    try {
      const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: description.trim(), image }) })
      if (!response.ok) throw new Error('Unable to analyze right now')
      const data = await response.json()
      setResult(data)
    } catch { setToast('We could not connect. Please try again or use the emergency resources below.') }
    finally { setBusy(false) }
  }

  function handleFile(file?: File) {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8_000_000) { setToast('Please choose a JPG, PNG, or WebP image under 8 MB.'); return }
    const reader = new FileReader(); reader.onload = () => setImage(String(reader.result)); reader.readAsDataURL(file)
  }

  function getLocation() {
    if (!navigator.geolocation) { setToast('Location is not available on this device.'); return }
    navigator.geolocation.getCurrentPosition(({ coords }) => setLocation(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`), () => setToast('Location permission was not granted.'))
  }

  function alertContact(contact: Contact) {
    const message = `Health & Safety alert: ${result?.title ?? 'I may need help'}. My location: ${location ?? 'not shared yet'}. Please check in with me.`
    window.location.href = `sms:${contact.phone.replace(/\s/g, '')}?body=${encodeURIComponent(message)}`
  }

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card/90 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
      <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Cross aria-hidden="true" className="size-5" /></div><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Campus care</p><p className="font-serif text-lg font-semibold leading-tight">Health & Safety Companion</p></div></div>
      <nav aria-label="Primary navigation" className="hidden items-center gap-6 text-sm font-medium md:flex"><a href="#how-it-works" className="hover:text-primary">How it works</a><button onClick={() => setShowContacts(true)} className="hover:text-primary">Emergency contacts</button><a href="#resources" className="hover:text-primary">Resources</a></nav>
      <button aria-label="Open emergency contacts" onClick={() => setShowContacts(true)} className="rounded-full border border-border p-2 md:hidden"><UserRound className="size-5" /></button>
    </div></header>
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 lg:px-8 lg:pt-12">
      <section className="mb-10 max-w-3xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> Calm, clear guidance</div><h1 className="max-w-2xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">A steady next step, when you need one.</h1><p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">Describe what happened or share a photo. Get practical first-aid guidance while you decide what to do next.</p></section>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section aria-labelledby="input-heading" className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-7"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">01 / Tell us what happened</p><h2 id="input-heading" className="mt-2 font-serif text-2xl font-semibold">What do you need help with?</h2></div><div className="rounded-2xl bg-secondary p-3"><CircleHelp className="size-5" /></div></div>
          <label htmlFor="description" className="sr-only">Describe the injury or hazard</label><textarea id="description" value={description} onChange={(event) => setDescription(event.target.value.slice(0, 1000))} placeholder="Example: I burned my hand on a hot pan..." className="mt-6 min-h-36 w-full resize-y rounded-2xl border border-input bg-background p-4 text-base leading-6 outline-none transition focus:border-primary focus:ring-4 focus:ring-ring/20" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => fileRef.current?.click()} className="flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/50 bg-secondary px-4 font-semibold transition hover:bg-accent focus:outline-none focus:ring-4 focus:ring-ring/20"><Upload className="size-5" /> Upload photo</button><button type="button" onClick={() => fileRef.current?.click()} className="flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-border px-4 font-semibold transition hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-ring/20"><Camera className="size-5" /> Use camera</button></div><input ref={fileRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => handleFile(event.target.files?.[0])} />
          {image && <div className="relative mt-4 overflow-hidden rounded-2xl border border-border"><img src={image} alt="Selected injury or hazard preview" className="max-h-56 w-full object-cover" /><button aria-label="Remove selected image" onClick={() => setImage(null)} className="absolute right-3 top-3 rounded-full bg-card p-2 shadow"><X className="size-4" /></button></div>}
          <div className="mt-6 flex items-center justify-between gap-3"><LanguageSelector value={language} onChange={setLanguage} /><span className="text-xs text-muted-foreground">{description.length}/1000</span></div><div className="mt-3 flex flex-col gap-3 sm:flex-row"><button onClick={analyze} disabled={!canAnalyze || busy} className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-4 focus:ring-ring/30">{busy ? 'Reviewing safely…' : <><Sparkles className="size-5" /> Get guidance</>}</button><button onClick={getLocation} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-border px-5 font-semibold transition hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-ring/20"><LocateFixed className="size-5" /> {location ? 'Location ready' : 'Add location'}</button></div>
          {toast && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{toast}</p>}
        </section>
        <section aria-labelledby="result-heading" className="rounded-3xl border border-border bg-primary p-5 text-primary-foreground shadow-sm md:p-7"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">02 / Your next steps</p><h2 id="result-heading" className="mt-2 font-serif text-2xl font-semibold">{result?.title ?? 'Your guidance will appear here'}</h2></div><div className="rounded-2xl bg-primary-foreground/10 p-3"><AlertTriangle className="size-5" /></div></div>{result ? <div aria-live="polite" className="mt-6"><p className="text-primary-foreground/80">{result.summary}</p><ol className="mt-5 flex flex-col gap-3">{result.steps.map((step, index) => <li key={step} className="flex gap-3 rounded-2xl bg-primary-foreground/10 p-4"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-sm font-bold text-primary">{index + 1}</span><span className="pt-1 leading-6">{step}</span></li>)}</ol><div className="mt-5 rounded-2xl border border-primary-foreground/20 p-4 text-sm"><p className="font-semibold">When to get more help</p><ul className="mt-2 flex flex-col gap-1 text-primary-foreground/80">{result.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></div></div> : <div className="mt-16 text-center"><div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-foreground/10"><Check className="size-7" /></div><p className="mx-auto mt-5 max-w-xs leading-6 text-primary-foreground/75">Share a description or image and we&apos;ll organize the safest next steps.</p></div>}</section>
      </div>
      <section id="how-it-works" className="mt-12 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-border bg-card p-5"><p className="font-mono text-xs font-semibold text-primary">01</p><h3 className="mt-3 font-serif text-xl font-semibold">Describe or show</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Use your words, a photo, or your camera. You stay in control.</p></div><div className="rounded-2xl border border-border bg-card p-5"><p className="font-mono text-xs font-semibold text-primary">02</p><h3 className="mt-3 font-serif text-xl font-semibold">Get clear steps</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Guidance is organized for a stressful moment and easy to follow.</p></div><div className="rounded-2xl border border-border bg-card p-5"><p className="font-mono text-xs font-semibold text-primary">03</p><h3 className="mt-3 font-serif text-xl font-semibold">Reach your people</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Share your location and alert a trusted contact when needed.</p></div></section>
      <section id="resources" className="mt-10 flex flex-col gap-4 rounded-3xl border border-border bg-secondary p-5 md:flex-row md:items-center md:justify-between md:p-6"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Important</p><p className="mt-2 max-w-2xl text-sm leading-6">This companion is not a replacement for emergency services or professional medical care. If someone is in immediate danger, call local emergency services now.</p></div><button onClick={() => setShowContacts(true)} className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground focus:outline-none focus:ring-4 focus:ring-ring/30"><MessageSquare className="size-4" /> Manage contacts</button></section>
    </main>
    {showContacts && <div role="dialog" aria-modal="true" aria-labelledby="contacts-title" className="fixed inset-0 z-10 flex items-end justify-center bg-foreground/40 p-4 md:items-center"><div className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-xl"><div className="flex items-center justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">Trusted people</p><h2 id="contacts-title" className="mt-1 font-serif text-2xl font-semibold">Emergency contacts</h2></div><button aria-label="Close contacts" onClick={() => setShowContacts(false)} className="rounded-full p-2 hover:bg-secondary"><X className="size-5" /></button></div><div className="mt-5 flex flex-col gap-3">{contacts.map((contact) => <div key={contact.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-4"><div><p className="font-semibold">{contact.name}</p><p className="text-sm text-muted-foreground">{contact.relationship} · {contact.phone}</p></div><div className="flex gap-2"><button aria-label={`Alert ${contact.name}`} onClick={() => alertContact(contact)} className="rounded-xl bg-primary p-3 text-primary-foreground"><MessageSquare className="size-4" /></button><button aria-label={`Delete ${contact.name}`} onClick={() => setContacts((current) => current.filter((item) => item.id !== contact.id))} className="rounded-xl border border-border p-3"><Trash2 className="size-4" /></button></div></div>)}</div><button onClick={() => { const name = window.prompt('Contact name'); const phone = window.prompt('Phone number'); if (name && phone) setContacts((current) => [...current, { id: Date.now(), name, phone, relationship: 'Trusted contact', email: '' }]) }} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary font-semibold text-primary"><Plus className="size-4" /> Add contact</button></div></div>}
  </div>
}

/** Provides the available language choices for future translated guidance. */
export function LanguageSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <label className="flex items-center gap-2 text-sm"><Globe2 className="size-4" /><span className="sr-only">Guidance language</span><select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-border bg-background px-2 py-1">{languages.map((item) => <option key={item}>{item}</option>)}</select></label> }

/** Renders a standalone first-aid result when composed outside the main experience. */
export function FirstAidResult({ result }: { result: Result }) { return <article aria-live="polite"><h2 className="font-serif text-2xl font-semibold">{result.title}</h2><p className="mt-2 text-muted-foreground">{result.summary}</p><ol className="mt-4 flex flex-col gap-2">{result.steps.map((step, index) => <li key={step} className="flex gap-3"><b>{index + 1}.</b>{step}</li>)}</ol></article> }

/** Small contact manager export for focused testing and composition. */
export function ContactManager({ onAlert }: { onAlert?: (contact: Contact) => void }) { return <button onClick={() => onAlert?.(initialContacts[0])} className="rounded-xl border border-border px-4 py-3 font-semibold">Alert {initialContacts[0].name}</button> }

export type { Contact, Result }
