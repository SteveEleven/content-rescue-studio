// Proves the browser wait is 90s and that a hung /api/generate falls back when that timer fires.
// Bundles the TypeScript module with the esbuild already installed for Vite. Does not call Gemini.
import { readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const root = fileURLToPath(new URL('..', import.meta.url))
const serverSrc = readFileSync(new URL('../server/index.mjs', import.meta.url), 'utf8')
if (!serverSrc.includes('Number(process.env.LLM_TIMEOUT_MS || 50_000)')) {
  throw new Error('backend LLM_TIMEOUT_MS default is no longer 50 seconds')
}
if (serverSrc.includes('90_000')) throw new Error('backend source contains the client timeout')

const dir = mkdtempSync(join(tmpdir(), 'crs-client-timeout-'))
const outfile = join(dir, 'api.mjs')
try {
  await build({
    absWorkingDir: root,
    entryPoints: ['src/lib/api.ts'],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile,
    logLevel: 'silent',
  })
  const { GENERATE_TIMEOUT_MS, generatePack } = await import(pathToFileURL(outfile).href)
  if (GENERATE_TIMEOUT_MS !== 90_000) {
    throw new Error(`GENERATE_TIMEOUT_MS is ${GENERATE_TIMEOUT_MS}, expected 90000`)
  }

  const originalFetch = globalThis.fetch
  globalThis.fetch = (url, init) => new Promise((_resolve, reject) => {
    if (url !== '/api/generate') {
      reject(new Error(`unexpected url ${url}`))
      return
    }
    const signal = init?.signal
    if (!signal) {
      reject(new Error('generatePack did not pass an abort signal'))
      return
    }
    const abort = () => {
      const err = new Error('The operation was aborted')
      err.name = 'AbortError'
      reject(err)
    }
    if (signal.aborted) abort()
    else signal.addEventListener('abort', abort, { once: true })
  })

  try {
    const started = Date.now()
    const result = await Promise.race([
      generatePack({ business_name: 'Timeout check' }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('client timeout did not fire within 100s')), 100_000)),
    ])
    const elapsed = Date.now() - started
    if (!result.fallback) throw new Error('hung generatePack did not fall back')
    if (elapsed < 89_000 || elapsed >= 100_000) throw new Error(`fallback fired at ${elapsed}ms, expected about 90000`)
    console.log(`PASS client timeout is 90000ms (fell back at ${elapsed}ms)`)
    console.log('PASS backend generation timeout is still 50s')
  } finally {
    globalThis.fetch = originalFetch
  }
} finally {
  rmSync(dir, { recursive: true, force: true })
}
