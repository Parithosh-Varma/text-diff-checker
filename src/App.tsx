import { useState, useMemo, useEffect } from 'react'

type DiffType = 'equal' | 'added' | 'removed'

interface DiffToken {
  text: string
  type: DiffType
}

function tokenize(text: string): string[] {
  const tokens: string[] = []
  const parts = text.split(/(\s+)/)
  for (const part of parts) {
    if (part.length === 0) continue
    const ws = part.match(/^\s+$/)
    if (ws) {
      if (tokens.length === 0) tokens.push(part)
      else if (tokens[tokens.length - 1].match(/^\s+$/)) tokens[tokens.length - 1] += part
      else tokens.push(part)
    } else {
      tokens.push(part)
      if (tokens.length > 0) tokens.push(' ')
    }
  }
  return tokens
}

function diff(a: string[], b: string[]): { removed: DiffToken[]; added: DiffToken[] } {
  const n = a.length
  const m = b.length
  const removed: DiffToken[] = []
  const added: DiffToken[] = []
  if (n === 0 && m === 0) return { removed, added }
  if (n * m > 8_000_000) {
    const setB = new Set(b)
    const setA = new Set(a)
    for (const t of a) if (!setB.has(t)) removed.push({ text: t, type: 'removed' })
    for (const t of b) if (!setA.has(t)) added.push({ text: t, type: 'added' })
    return { removed, added }
  }
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      removed.push({ text: a[i], type: 'equal' })
      added.push({ text: b[j], type: 'equal' })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      removed.push({ text: a[i], type: 'removed' })
      i++
    } else {
      added.push({ text: b[j], type: 'added' })
      j++
    }
  }
  while (i < n) removed.push({ text: a[i++], type: 'removed' })
  while (j < m) added.push({ text: b[j++], type: 'added' })
  return { removed, added }
}

function countChanged(tokens: DiffToken[]): number {
  return tokens.filter((t) => t.type !== 'equal').filter((t) => !/^\s+$/.test(t.text)).length
}

const SAMPLE_A = `The quick brown fox jumps over the lazy dog.
This is version one of the document.
Colors: #6366f1 is indigo, #ef4444 is red.`

const SAMPLE_B = `The quick brown fox leaps over the sleepy dog.
This is version two of the document.
Colors: #6366f1 is indigo, #22c55e is green.`

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved === 'dark') return 'dark'
      if (saved === 'light') return 'light'
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [mode, setMode] = useState<'side' | 'combined'>('side')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const result = useMemo(() => diff(tokenize(left), tokenize(right)), [left, right])

  const hasContent = left.length > 0 || right.length > 0

  const copyDiff = async () => {
    if (!hasContent) return
    const lines: string[] = []
    for (const t of result.removed) if (t.type === 'removed') lines.push('- ' + t.text.replace(/\n/g, ' '))
    for (const t of result.added) if (t.type === 'added') lines.push('+ ' + t.text.replace(/\n/g, ' '))
    if (lines.length === 0) lines.push('(identical)')
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const stats = {
    added: countChanged(result.added),
    removed: countChanged(result.removed),
  }
  const identical = hasContent && stats.added === 0 && stats.removed === 0

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center transition-colors duration-300">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 border-b border-border bg-card/60 backdrop-blur-md w-full">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full object-cover border border-border shadow-sm" />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">Text Diff Checker</h1>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/parithosh-varma/text-diff-checker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold transition-all border border-border bg-background hover:bg-muted text-foreground rounded-lg shadow-sm hover:border-muted-foreground/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            <span className="hidden sm:inline">Repo</span>
          </a>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="inline-flex items-center justify-center w-9 h-9 border border-border bg-background hover:bg-muted text-foreground rounded-lg transition-all hover:border-muted-foreground/30 shadow-sm"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl px-6 sm:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Compare any two texts</h2>
            <p className="text-muted-foreground mt-1">Word-level diff with instant highlighting. Everything stays in your browser.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['side', 'combined'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all border ${
                  mode === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'side' ? 'Side by side' : 'Combined'}
              </button>
            ))}
            <button
              onClick={() => { setLeft(SAMPLE_A); setRight(SAMPLE_B) }}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all shadow-sm"
            >
              Load sample
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="border border-border rounded-2xl bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Original</span>
              <span className="text-xs font-mono text-muted-foreground">{tokenize(left).length} words</span>
            </div>
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              placeholder="Paste or type the original text here..."
              className="w-full h-56 resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground/50"
              spellCheck={false}
            />
          </div>
          <div className="border border-border rounded-2xl bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Modified</span>
              <span className="text-xs font-mono text-muted-foreground">{tokenize(right).length} words</span>
            </div>
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              placeholder="Paste or type the modified text here..."
              className="w-full h-56 resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground/50"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            {stats.added} added
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 12h14"/><path d="m12 19-7-7 7-7"/></svg>
            {stats.removed} removed
          </div>
          {identical && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/40 text-foreground text-sm font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M20 6 9 17l-5-5"/></svg>
              Texts are identical
            </div>
          )}
          <div className="flex-1" />
          <button
            onClick={() => { setLeft(''); setRight('') }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            Clear
          </button>
          <button
            onClick={copyDiff}
            disabled={!hasContent}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M20 6 9 17l-5-5"/></svg>
                Copied!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                Copy diff
              </>
            )}
          </button>
        </div>

        {mode === 'side' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DiffPanel title="Removed" tokens={result.removed} kind="removed" empty={!hasContent} />
            <DiffPanel title="Added" tokens={result.added} kind="added" empty={!hasContent} />
          </div>
        ) : (
          <div className="border border-border rounded-2xl bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Combined view</span>
            </div>
            <div className="min-h-32 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
              {!hasContent ? (
                <span className="text-muted-foreground/60">Nothing to compare yet — paste two texts above.</span>
              ) : (
                <CombinedView removed={result.removed} added={result.added} />
              )}
            </div>
          </div>
        )}

        <div className="mt-6 border border-border rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-primary shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span>Diffing happens entirely in your browser. Paste code, prose, or config and review changes instantly.</span>
        </div>
      </main>

      <footer className="w-full text-center py-8 border-t border-border text-sm text-muted-foreground">
        <p>Built with ❤️ by <a href="https://github.com/parithosh-varma" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">Parithosh Varma</a></p>
      </footer>
    </div>
  )
}

function DiffPanel({ title, tokens, kind, empty }: { title: string; tokens: DiffToken[]; kind: 'added' | 'removed'; empty: boolean }) {
  const isAdded = kind === 'added'
  return (
    <div className="border border-border rounded-2xl bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
        <span className={`text-xs font-bold uppercase tracking-widest ${isAdded ? 'text-green-500' : 'text-red-500'}`}>{title}</span>
      </div>
      <div className="min-h-32 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
        {empty ? (
          <span className="text-muted-foreground/60">Nothing to compare yet — paste two texts above.</span>
        ) : (
          tokens.map((tok, i) => (
            <span
              key={i}
              className={
                tok.type === 'equal'
                  ? 'text-foreground'
                  : isAdded
                    ? 'text-green-700 dark:text-green-400 bg-green-500/15 rounded px-0.5'
                    : 'text-red-600 dark:text-red-400 bg-red-500/10 rounded px-0.5 line-through decoration-red-400/50'
              }
            >
              {tok.text}
            </span>
          ))
        )}
      </div>
    </div>
  )
}

function CombinedView({ removed, added }: { removed: DiffToken[]; added: DiffToken[] }) {
  const out: DiffToken[] = []
  let i = 0
  let j = 0
  while (i < removed.length || j < added.length) {
    if (i < removed.length && removed[i].type === 'equal' && j < added.length && added[j].type === 'equal') {
      out.push(removed[i])
      i++
      j++
    } else if (i < removed.length && (j >= added.length || removed[i].type === 'removed')) {
      out.push(removed[i])
      i++
    } else if (j < added.length) {
      out.push(added[j])
      j++
    }
  }
  return (
    <>
      {out.map((tok, k) => (
        <span
          key={k}
          className={
            tok.type === 'added'
              ? 'text-green-700 dark:text-green-400 bg-green-500/15 rounded px-0.5'
              : tok.type === 'removed'
                ? 'text-red-600 dark:text-red-400 bg-red-500/10 rounded px-0.5 line-through decoration-red-400/50'
                : 'text-foreground'
          }
        >
          {tok.text}
        </span>
      ))}
    </>
  )
}

export default App