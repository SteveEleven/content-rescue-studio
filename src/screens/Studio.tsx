import { useCallback, useEffect, useState } from 'react'
import type { Intake, Pack, SavedPack } from '../lib/types'
import { EMPTY_INTAKE } from '../lib/types'
import { DEMO_INTAKE, DEMO_PACK } from '../lib/demoPack'
import { generatePack } from '../lib/api'
import { clearHandoff, peekHandoff } from '../lib/handoff'
import { navigate } from '../lib/router'
import { deletePack, loadSavedPacks, savePack, MAX_SAVED } from '../lib/storage'
import { StartScreen } from './StartScreen'
import { GenerateScreen } from './GenerateScreen'
import { PackScreen } from './PackScreen'
import { Toast, TopBar, useToast } from '../components'

type Screen = 'start' | 'generate' | 'pack'

/** Minimum time the progress screen stays up so the cycling messages are readable in a demo. */
const MIN_GENERATE_MS = 2600

interface Result {
  pack: Pack
  intake: Intake
  fallback: boolean
  savedId: string | null
}

/** The three-screen rescue flow: Start → Generate → Pack. */
export function Studio() {
  // A marketing page may hand us a prefilled intake and/or a pack to open immediately.
  const [initial] = useState(() => peekHandoff())
  const [screen, setScreen] = useState<Screen>(initial?.pack ? 'pack' : 'start')
  const [intake, setIntake] = useState<Intake>(initial?.intake ?? EMPTY_INTAKE)
  const [result, setResult] = useState<Result | null>(
    initial?.pack ? { pack: initial.pack, intake: initial.intake, fallback: false, savedId: null } : null,
  )
  const [saved, setSaved] = useState<SavedPack[]>(() => loadSavedPacks())
  const [toast, showToast] = useToast()

  // Consume the handoff once mounted (not in the initializer — StrictMode runs that twice).
  useEffect(() => {
    clearHandoff()
  }, [])

  // Scroll to top on each screen change (feels like native navigation).
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [screen])

  const build = useCallback(async () => {
    setScreen('generate')
    const started = Date.now()
    const snapshot = intake
    const { pack, fallback } = await generatePack(snapshot)
    const wait = MIN_GENERATE_MS - (Date.now() - started)
    if (wait > 0) await new Promise((r) => setTimeout(r, wait))
    setResult({ pack, intake: snapshot, fallback, savedId: null })
    setScreen('pack')
  }, [intake])

  const openSaved = (p: SavedPack) => {
    setIntake(p.intake)
    setResult({ pack: p.pack, intake: p.intake, fallback: false, savedId: p.id })
    setScreen('pack')
  }

  const save = () => {
    if (!result || result.savedId) return
    const next = savePack(result.intake, result.pack, isDemoPack(result))
    setSaved(next)
    setResult({ ...result, savedId: next[0]?.id ?? null })
    showToast(next.length >= MAX_SAVED ? 'Saved (keeping your 3 newest)' : 'Pack saved')
  }

  const remove = (id: string) => {
    setSaved(deletePack(id))
    if (result?.savedId === id) setResult({ ...result, savedId: null })
  }

  const startNew = () => {
    setResult(null)
    setIntake(EMPTY_INTAKE)
    setScreen('start')
  }

  const scrollToSaved = () => {
    document.getElementById('saved-packs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (screen === 'generate') {
    return (
      <>
        <TopBar current="/studio" />
        <GenerateScreen businessName={intake.business_name} />
      </>
    )
  }

  if (screen === 'pack' && result) {
    return (
      <>
        <TopBar current="/studio" action="New rescue" onAction={startNew} />
        <PackScreen
          key={result.savedId ?? 'fresh'}
          pack={result.pack}
          businessName={result.intake.business_name}
          platform={result.intake.platform}
          isDemo={isDemoPack(result)}
          showFallbackBadge={result.fallback}
          isSaved={!!result.savedId}
          canSave={saved.length < MAX_SAVED}
          onSave={save}
          onStartNew={startNew}
        />
      </>
    )
  }

  return (
    <>
      <TopBar
        current="/studio"
        action={saved.length > 0 ? `Saved · ${saved.length}` : 'Templates'}
        onAction={saved.length > 0 ? scrollToSaved : () => navigate('/templates')}
      />
      <StartScreen
        intake={intake}
        onChange={setIntake}
        onSubmit={build}
        savedPacks={saved}
        onOpenSaved={openSaved}
        onDeleteSaved={remove}
      />
      <Toast message={toast} />
    </>
  )
}

function isDemoPack(r: Result): boolean {
  return r.fallback || r.pack === DEMO_PACK || r.intake.business_name === DEMO_INTAKE.business_name
}
