import { useRef, useState } from 'react'
import { useDataStore } from '@/store/useDataStore'
import { createMockCommitSource } from '@/data/source'
import { createPsiSource } from '@/data/adapters/psi'
import { createLhciSource, readJsonFile } from '@/data/adapters/lhci'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/lib/cn'

interface SourceSettingsProps {
  onClose: () => void
}

type Tab = 'mock' | 'psi' | 'lhci'

const TABS: { id: Tab; label: string }[] = [
  { id: 'mock', label: 'Simulator' },
  { id: 'psi', label: 'PageSpeed Insights' },
  { id: 'lhci', label: 'Lighthouse CI' },
]

export const SourceSettings = ({ onClose }: SourceSettingsProps) => {
  const { source, status, error, setSource } = useDataStore()
  const [tab, setTab] = useState<Tab>(source.id as Tab)

  // PSI form
  const [psiUrl, setPsiUrl] = useState('')
  const [psiKey, setPsiKey] = useState('')
  const [psiStrategy, setPsiStrategy] = useState<'mobile' | 'desktop'>('mobile')

  // LHCI form
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [pendingJson, setPendingJson] = useState<unknown>(null)

  const busy = status === 'loading'

  const applyMock = () => {
    setSource(createMockCommitSource()).then(onClose)
  }

  const applyPsi = () => {
    if (!psiUrl.trim()) return
    setSource(createPsiSource({ url: psiUrl.trim(), apiKey: psiKey.trim() || undefined, strategy: psiStrategy }))
      .then(() => { if (useDataStore.getState().status === 'ready') onClose() })
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError(null)
    setFileName(file.name)
    try {
      const json = await readJsonFile(file)
      setPendingJson(json)
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Unknown error')
      setPendingJson(null)
    }
  }

  const applyLhci = () => {
    if (!pendingJson) return
    try {
      const src = createLhciSource(pendingJson)
      setSource(src).then(() => { if (useDataStore.getState().status === 'ready') onClose() })
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Invalid format')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-ink">Data source</div>
            <div className="mt-0.5 text-[11px] text-ink-subtle">
              Current: <span className="font-mono">{source.label}</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-overlay hover:text-ink"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border px-5 pt-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors',
                tab === t.id
                  ? 'border border-b-0 border-border bg-canvas text-ink'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-5 py-5">
          {tab === 'mock' && (
            <div className="space-y-4">
              <p className="text-sm text-ink-muted">
                Seeded deterministic simulator — 20 commits with 3 hand-authored
                regressions covering all three vitals. No network required.
              </p>
              <Button onClick={applyMock} disabled={busy || source.id === 'mock'}>
                {source.id === 'mock' ? 'Already active' : 'Apply simulator'}
              </Button>
            </div>
          )}

          {tab === 'psi' && (
            <div className="space-y-4">
              <p className="text-sm text-ink-muted">
                Runs a live Lighthouse audit via the PageSpeed Insights API and
                shows real vitals for any public URL. An API key removes the
                anonymous rate limit.
              </p>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink">
                    URL <span className="text-poor">*</span>
                  </span>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={psiUrl}
                    onChange={(e) => setPsiUrl(e.target.value)}
                    className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink">
                    API key{' '}
                    <span className="font-normal text-ink-subtle">(optional)</span>
                  </span>
                  <input
                    type="text"
                    placeholder="AIza…"
                    value={psiKey}
                    onChange={(e) => setPsiKey(e.target.value)}
                    className="w-full rounded-lg border border-border bg-canvas px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none"
                  />
                </label>
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-ink">
                    Strategy
                  </span>
                  <div className="flex gap-2">
                    {(['mobile', 'desktop'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPsiStrategy(s)}
                        className={cn(
                          'rounded-md border px-3 py-1 text-xs capitalize transition-colors',
                          psiStrategy === s
                            ? 'border-brand bg-brand-soft text-brand'
                            : 'border-border text-ink-muted hover:border-border-strong',
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                onClick={applyPsi}
                disabled={busy || !psiUrl.trim()}
              >
                {busy && source.id === 'psi' ? 'Fetching…' : 'Fetch audit'}
              </Button>
            </div>
          )}

          {tab === 'lhci' && (
            <div className="space-y-4">
              <p className="text-sm text-ink-muted">
                Load a VitalsWatch LHCI JSON file — an array of run records, each
                with a <code className="font-mono text-xs">hash</code>,{' '}
                <code className="font-mono text-xs">author</code>,{' '}
                <code className="font-mono text-xs">date</code>,{' '}
                <code className="font-mono text-xs">message</code>, and{' '}
                <code className="font-mono text-xs">lhr.audits</code> object.
              </p>
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors',
                  fileName ? 'border-brand/50 bg-brand-soft/30' : 'border-border',
                )}
              >
                {fileName ? (
                  <>
                    <span className="text-sm font-medium text-ink">{fileName}</span>
                    {fileError && (
                      <span className="text-xs text-poor">{fileError}</span>
                    )}
                    {pendingJson && !fileError && (
                      <span className="text-xs text-good">Parsed — ready to load</span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-ink-muted">Drop a JSON file or click to browse</span>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={onFileChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  {fileName ? 'Change file' : 'Browse'}
                </Button>
              </div>
              <Button
                onClick={applyLhci}
                disabled={busy || !pendingJson || Boolean(fileError)}
              >
                {busy && source.id === 'lhci' ? 'Loading…' : 'Load file'}
              </Button>
            </div>
          )}

          {/* Store-level error */}
          {error && (
            <div className="mt-4 rounded-lg border border-poor/30 bg-poor-soft/50 px-3 py-2 text-xs text-poor">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
