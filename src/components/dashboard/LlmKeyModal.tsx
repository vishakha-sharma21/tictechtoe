'use client'

import { useCallback, useEffect, useState } from 'react'
import { X, KeyRound, Trash2, ShieldCheck } from 'lucide-react'

type Provider = 'openai' | 'anthropic' | 'groq' | 'openrouter' | 'gemini'
type SavedKey = { provider: Provider; last4: string; is_default: boolean }

const PROVIDERS: { id: Provider; name: string; hint: string; docs: string; note?: string }[] = [
  { id: 'gemini', name: 'Google Gemini', hint: 'AIza… or AQ.…', docs: 'https://aistudio.google.com/apikey', note: 'Free tier with generous limits · strong at planning' },
  { id: 'groq', name: 'Groq', hint: 'gsk_…', docs: 'https://console.groq.com/keys', note: 'Free tier · open-source models (Llama) · very fast' },
  { id: 'openrouter', name: 'OpenRouter', hint: 'sk-or-…', docs: 'https://openrouter.ai/keys', note: 'One key for hundreds of models, incl. open-source' },
  { id: 'openai', name: 'OpenAI', hint: 'sk-…', docs: 'https://platform.openai.com/api-keys', note: 'Most reliable for complex workflows' },
  { id: 'anthropic', name: 'Anthropic (Claude)', hint: 'sk-ant-…', docs: 'https://console.anthropic.com/settings/keys', note: 'Most reliable for complex workflows' },
]

interface Props {
  open: boolean
  /** When true the modal can't be dismissed until a key exists (first-run gate). */
  required?: boolean
  onClose: () => void
  onChange?: (hasKey: boolean) => void
}

export default function LlmKeyModal({ open, required = false, onClose, onChange }: Props) {
  const [provider, setProvider] = useState<Provider>('gemini')
  const [apiKey, setApiKey] = useState('')
  const [keys, setKeys] = useState<SavedKey[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const res = await fetch('/api/llm-keys', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    setKeys(data.keys ?? [])
    onChange?.((data.keys ?? []).length > 0)
  }, [onChange])

  useEffect(() => {
    if (open) refresh()
  }, [open, refresh])

  if (!open) return null

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/llm-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save key')
      setApiKey('')
      setKeys(data.keys)
      onChange?.(true)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const makeActive = async (p: Provider) => {
    setError(null)
    const res = await fetch('/api/llm-keys', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: p }),
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error || 'Could not switch provider')
    setKeys(data.keys)
  }

  const remove = async (p: Provider) => {
    const res = await fetch(`/api/llm-keys?provider=${p}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) {
      setKeys(data.keys)
      onChange?.(data.keys.length > 0)
    }
  }

  const current = PROVIDERS.find((p) => p.id === provider)!

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-large-card border border-border bg-bg-surface p-6 shadow-2xl relative">
        {!required && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-5 h-5 text-accent" />
          <h2 className="font-display text-lg text-text-primary">AI provider</h2>
        </div>
        <p className="text-xs text-text-secondary mb-4 leading-relaxed">
          DAGent plans and runs your workflows with <strong>your</strong> own AI key, so usage is billed to your account.
          No paid plan? Gemini and Groq have free tiers. Open-source models can be less reliable on long workflows.
        </p>

        {keys.length > 0 && (
          <>
          <p className="text-[11px] uppercase tracking-wide text-text-faint mb-1.5">Your saved keys — pick which one DAGent uses</p>
          <ul className="mb-4 space-y-2">
            {keys.map((k) => (
              <li
                key={k.provider}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm"
              >
                <span className="text-text-primary">
                  {PROVIDERS.find((p) => p.id === k.provider)?.name}{' '}
                  <span className="font-mono text-text-secondary">••••{k.last4}</span>
                  {k.is_default && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-accent-green/15 text-accent-green border border-accent-green/30">
                      active
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                {!k.is_default && (
                  <button
                    type="button"
                    onClick={() => makeActive(k.provider)}
                    className="text-[11px] px-2 py-1 rounded-md border border-border text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
                  >
                    Use this
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(k.provider)}
                  className="p-1.5 rounded text-text-secondary hover:text-red-500"
                  aria-label={`Remove ${k.provider} key`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                </span>
              </li>
            ))}
          </ul>
          </>
        )}

        <form onSubmit={save} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setProvider(p.id)
                  setError(null)
                }}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  provider === p.id
                    ? 'border-accent bg-accent/10 text-text-primary'
                    : 'border-border text-text-secondary hover:border-border-emphasis'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`${current.name} API key (${current.hint})`}
            className="w-full rounded-lg border border-border bg-bg-base px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {current.note && <p className="text-[11px] text-text-secondary">{current.note}</p>}
          <a href={current.docs} target="_blank" rel="noreferrer" className="block text-[11px] text-accent hover:underline">
            Where do I find my {current.name} key? →
          </a>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={busy || !apiKey.trim()}
            className="w-full rounded-lg bg-accent text-white py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Verify & save'}
          </button>
        </form>

        <p className="flex items-start gap-1.5 text-[11px] text-text-faint mt-4 leading-relaxed">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-px" />
          Verified with the provider, then encrypted (AES-256-GCM) before it&apos;s stored. It&apos;s never sent back to your browser.
        </p>
      </div>
    </div>
  )
}
