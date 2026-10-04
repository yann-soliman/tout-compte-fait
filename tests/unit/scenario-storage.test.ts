import { describe, expect, it } from 'vitest'
import { defaultScenario } from '../../src/domain/defaults'
import {
  clearScenarioStorage,
  loadScenarioStorage,
  replaceScenarioStorage,
  type ScenarioStorage,
} from '../../src/domain/scenario-storage'
import type { NamedScenario } from '../../src/domain/scenario-library'

const offer: NamedScenario = {
  id: 'saved-1',
  name: 'Offre enregistrée',
  savedAt: '2026-10-04T10:00:00.000Z',
  scenario: defaultScenario,
}

class MemoryStorage implements ScenarioStorage {
  values = new Map<string, string>()
  failWrite = false
  failRead = false
  failRemove = false

  getItem(key: string): string | null {
    if (this.failRead) throw new DOMException('Storage unavailable', 'SecurityError')
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.failWrite) throw new DOMException('Storage full', 'QuotaExceededError')
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    if (this.failRemove) throw new DOMException('Storage unavailable', 'SecurityError')
    this.values.delete(key)
  }
}

describe('scenario storage boundary', () => {
  it('loads an empty or valid collection without changing the active form', () => {
    const storage = new MemoryStorage()
    expect(loadScenarioStorage(storage).scenarios).toEqual([])
    expect(replaceScenarioStorage(storage, [offer]).ok).toBe(true)
    expect(loadScenarioStorage(storage).scenarios).toEqual([offer])
    expect(defaultScenario.micro.dailyRate).toBe(50_000)
  })

  it('reports persisted corruption and storage read errors instead of crashing', () => {
    const corrupted = new MemoryStorage()
    corrupted.values.set('tout-compte-fait.scenario-library.v1', '{bad')
    const invalid = loadScenarioStorage(corrupted)
    expect(invalid.scenarios).toEqual([])
    expect(invalid.error).toMatch(/JSON|format|corromp/i)

    const unavailable = new MemoryStorage()
    unavailable.failRead = true
    expect(loadScenarioStorage(unavailable).error).toMatch(/stockage|storage/i)
  })

  it('preserves the prior persisted value when quota, validation or clear fails', () => {
    const storage = new MemoryStorage()
    expect(replaceScenarioStorage(storage, [offer]).ok).toBe(true)
    const key = 'tout-compte-fait.scenario-library.v1'
    const before = storage.values.get(key)

    storage.failWrite = true
    expect(replaceScenarioStorage(storage, [])).toMatchObject({ ok: false })
    expect(storage.values.get(key)).toBe(before)

    storage.failWrite = false
    expect(replaceScenarioStorage(storage, [{ ...offer, id: '' }])).toMatchObject({ ok: false })
    expect(storage.values.get(key)).toBe(before)

    storage.failRemove = true
    expect(clearScenarioStorage(storage)).toMatchObject({ ok: false })
    expect(storage.values.get(key)).toBe(before)
  })

  it('replaces an entire validated import in one write', () => {
    const storage = new MemoryStorage()
    expect(replaceScenarioStorage(storage, [offer]).ok).toBe(true)
    const second = { ...offer, id: 'saved-2', name: 'Deuxième offre' }
    expect(replaceScenarioStorage(storage, [second]).ok).toBe(true)
    expect(loadScenarioStorage(storage).scenarios).toEqual([second])
  })
})
