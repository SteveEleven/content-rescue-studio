import type { Intake, Pack } from './types'

/**
 * One-shot handoff from marketing pages into the studio:
 * - `intake` prefills the Start screen (templates)
 * - `pack` opens the Pack screen immediately (example pack)
 */
export interface Handoff {
  intake: Intake
  pack?: Pack
}

let pending: Handoff | null = null

export function setHandoff(h: Handoff) {
  pending = h
}

/** Read without consuming — safe to call from a StrictMode-doubled state initializer. */
export function peekHandoff(): Handoff | null {
  return pending
}

export function clearHandoff() {
  pending = null
}
