import { useState } from 'react'
import { PLACE_NAME, CITY } from '../config.js'

// "Enquire Now" — sends via the free EmailJS REST API when configured,
// falls back to a mailto: link when the env vars are absent. Pure React,
// no backend required.
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const CONFIGURED = !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

export default function EnquiryModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!CONFIGURED) return
    setStatus('sending')
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: SERVICE_ID,
          template_id: TEMPLATE_ID,
          user_id: PUBLIC_KEY,
          template_params: {
            from_name: form.name,
            reply_to: form.email,
            phone: form.phone,
            message: form.message,
            project: `${PLACE_NAME} · ${CITY}`,
          },
        }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const mailto = `mailto:sales@example.com?subject=${encodeURIComponent(`Enquiry — ${PLACE_NAME} ${CITY}`)}`

  return (
    <div className="aerial-overlay" onClick={onClose}>
      <div className="aerial-modal enq-modal" onClick={(e) => e.stopPropagation()}>
        <div className="aerial-head">
          <span className="serif-title">ENQUIRE — {PLACE_NAME.toUpperCase()}</span>
          <button className="close" onClick={onClose}>✕</button>
        </div>

        {status === 'sent' ? (
          <div className="aerial-status">
            <div style={{ color: '#5ad67d' }}>ENQUIRY SENT</div>
            <div className="dim small">Our team will reach out shortly. Thank you for your interest.</div>
          </div>
        ) : (
          <form className="enq-form" onSubmit={submit}>
            <input required placeholder="Full name" value={form.name} onChange={set('name')} />
            <input required type="email" placeholder="Email" value={form.email} onChange={set('email')} />
            <input placeholder="Phone (optional)" value={form.phone} onChange={set('phone')} />
            <textarea rows={4} placeholder="I'm interested in Ameya Heights…" value={form.message} onChange={set('message')} />
            {CONFIGURED ? (
              <button className="present-btn" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'SENDING…' : 'SEND ENQUIRY'}
              </button>
            ) : (
              <a className="present-btn enq-mailto" href={mailto}>OPEN EMAIL ENQUIRY</a>
            )}
            {status === 'error' && (
              <div className="dim small" style={{ color: '#e8875a' }}>
                Could not send right now — please try again or use email.
              </div>
            )}
            {!CONFIGURED && (
              <div className="dim small">
                Direct in-page sending activates once VITE_EMAILJS_* keys are configured (free · emailjs.com).
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
