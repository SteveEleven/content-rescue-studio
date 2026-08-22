import type { Intake, Pack, SavedPack } from './types'

const KEY = 'crs.savedPacks.v1'
export const MAX_SAVED = 3

export function loadSavedPacks(): SavedPack[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (p): p is SavedPack =>
        !!p && typeof p === 'object' && typeof (p as SavedPack).id === 'string' && !!(p as SavedPack).pack,
    )
  } catch {
    return []
  }
}

function persist(packs: SavedPack[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(packs))
  } catch {
    /* storage full or unavailable — fail quietly */
  }
}

/** Saves a pack, keeping only the newest MAX_SAVED. Returns the updated list. */
export function savePack(intake: Intake, pack: Pack, isDemo: boolean): SavedPack[] {
  const entry: SavedPack = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: intake.business_name.trim() || pack.content_angle || 'Untitled rescue',
    saved_at: new Date().toISOString(),
    intake,
    pack,
    is_demo: isDemo,
  }
  const next = [entry, ...loadSavedPacks()].slice(0, MAX_SAVED)
  persist(next)
  return next
}

export function deletePack(id: string): SavedPack[] {
  const next = loadSavedPacks().filter((p) => p.id !== id)
  persist(next)
  return next
}
