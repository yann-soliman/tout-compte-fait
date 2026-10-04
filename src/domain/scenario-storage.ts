import {
  decodeScenarioCollectionJson,
  encodeScenarioCollectionJson,
  type NamedScenario,
} from './scenario-library'

export const SCENARIO_STORAGE_KEY = 'tout-compte-fait.scenario-library.v1'

export interface ScenarioStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface ScenarioStorageLoad {
  scenarios: NamedScenario[]
  error?: string
  corrupt: boolean
}

export type ScenarioStorageResult = { ok: true } | { ok: false; error: string }

function storageErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'name' in error) {
    const name = String(error.name)
    if (name === 'QuotaExceededError')
      return 'Quota du stockage local atteint; collection inchangée.'
    if (name === 'SecurityError')
      return 'Stockage local refusé par le navigateur; collection inchangée.'
  }
  return error instanceof Error ? error.message : fallback
}

export function loadScenarioStorage(storage: ScenarioStorage): ScenarioStorageLoad {
  try {
    const serialized = storage.getItem(SCENARIO_STORAGE_KEY)
    if (serialized === null) return { scenarios: [], corrupt: false }
    try {
      return { scenarios: decodeScenarioCollectionJson(serialized), corrupt: false }
    } catch (error) {
      return {
        scenarios: [],
        error: storageErrorMessage(error, 'Données locales illisibles.'),
        corrupt: true,
      }
    }
  } catch (error) {
    return {
      scenarios: [],
      error: storageErrorMessage(error, 'Stockage local indisponible.'),
      corrupt: true,
    }
  }
}

export function replaceScenarioStorage(
  storage: ScenarioStorage,
  scenarios: readonly NamedScenario[],
): ScenarioStorageResult {
  try {
    const serialized = encodeScenarioCollectionJson(scenarios)
    storage.setItem(SCENARIO_STORAGE_KEY, serialized)
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: storageErrorMessage(error, 'Échec de sauvegarde locale.'),
    }
  }
}

export function clearScenarioStorage(storage: ScenarioStorage): ScenarioStorageResult {
  try {
    storage.removeItem(SCENARIO_STORAGE_KEY)
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: storageErrorMessage(error, 'Échec de suppression locale.'),
    }
  }
}
