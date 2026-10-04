import { useMemo, useState, type ChangeEvent } from 'react'
import { createReportOffers } from '../domain/decision-report'
import { OfferComparison } from './OfferComparison'
import { DecisionReport } from './DecisionReport'
import { applyBalanceRate, calculateBalance, type BalanceTarget } from '../domain/balance'
import { formatCents } from '../domain/calculate'
import type { Confidence } from '../domain/model'
import {
  compareRowsToCsv,
  comparisonRow,
  decodeScenarioCollectionJson,
  encodeScenarioCollectionJson,
  MAX_SAVED_SCENARIOS,
  MAX_SCENARIO_IMPORT_BYTES,
  normalizeScenarioName,
  type NamedScenario,
} from '../domain/scenario-library'
import {
  clearScenarioStorage,
  loadScenarioStorage,
  replaceScenarioStorage,
  type ScenarioStorage,
} from '../domain/scenario-storage'
import { calculateStress, type StressInput } from '../domain/risk'
import type { ComparisonScenario, RegulatoryCatalog } from '../domain/model'

interface DecisionToolsProps {
  scenario: ComparisonScenario
  onScenarioChange: (scenario: ComparisonScenario) => void
  onReset: () => void
  catalog: RegulatoryCatalog
}

const initialStress: StressInput = {
  daysLost: 0,
  rateDecreasePercent: 0,
  extraAnnualExpenses: 0,
}

const stressPresets: Array<{ label: string; value: StressInput }> = [
  { label: 'Prudent', value: { daysLost: 5, rateDecreasePercent: 5, extraAnnualExpenses: 25_000 } },
  {
    label: 'Défavorable',
    value: { daysLost: 20, rateDecreasePercent: 15, extraAnnualExpenses: 60_000 },
  },
  {
    label: 'Sévère',
    value: { daysLost: 40, rateDecreasePercent: 30, extraAnnualExpenses: 100_000 },
  },
]

const dailyRateCurrency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatDailyRate(cents: number): string {
  return dailyRateCurrency.format(cents / 100)
}

function euroInputToCents(value: string): number {
  const euros = Number(value)
  if (!value || !Number.isFinite(euros) || euros < 0 || euros > 100_000) return Number.NaN
  const cents = euros * 100
  const rounded = Math.round(cents)
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(cents)) * 8
  return Math.abs(cents - rounded) <= tolerance ? rounded : Number.NaN
}

function confidenceLabel(confidence: Confidence | undefined): string {
  if (confidence === 'established') return 'établie'
  if (confidence === 'estimated') return 'estimative'
  return 'non déterminée'
}

function localStorageAdapter(): ScenarioStorage {
  return window.localStorage
}

function createId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('')
}

function downloadFile(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function resultValue(result: ReturnType<typeof calculateBalance>): number | undefined {
  return result.dailyRateCents ?? result.hypotheticalDailyRateCents
}

export function DecisionTools({
  scenario,
  onScenarioChange,
  onReset,
  catalog,
}: DecisionToolsProps) {
  const [reportOpen, setReportOpen] = useState(false)
  const [target, setTarget] = useState<BalanceTarget>('netIncome')
  const [stress, setStress] = useState<StressInput>(initialStress)
  const [extraExpensesInput, setExtraExpensesInput] = useState('0')
  const [saved, setSaved] = useState<NamedScenario[]>(() => {
    try {
      return loadScenarioStorage(localStorageAdapter()).scenarios
    } catch {
      return []
    }
  })
  const [libraryError, setLibraryError] = useState<string>(() => {
    try {
      return loadScenarioStorage(localStorageAdapter()).error ?? ''
    } catch {
      return 'Stockage local indisponible.'
    }
  })
  const [corruptLibrary, setCorruptLibrary] = useState(() => {
    try {
      return loadScenarioStorage(localStorageAdapter()).corrupt
    } catch {
      return true
    }
  })
  const [name, setName] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const balanceRows = useMemo(
    () =>
      [...new Set([scenario.micro.billedDays, 120, 160, 200])].map((days) => ({
        days,
        result: calculateBalance(scenario, target, days, catalog),
      })),
    [scenario, target, catalog],
  )

  let stressResult: ReturnType<typeof calculateStress> | undefined
  let stressError = ''
  try {
    stressResult = calculateStress(scenario, stress, catalog)
  } catch (error) {
    stressError = error instanceof Error ? error.message : 'Paramètres de sensibilité invalides.'
  }

  const comparison = useMemo(() => {
    try {
      return {
        rows: [
          comparisonRow('Scénario courant', scenario),
          ...saved
            .filter((offer) => selectedIds.includes(offer.id))
            .map((offer) => comparisonRow(offer.name, offer.scenario)),
        ],
        error: '',
      }
    } catch (error) {
      return {
        rows: [],
        error: error instanceof Error ? error.message : 'Comparaison des scénarios impossible.',
      }
    }
  }, [scenario, saved, selectedIds])

  const report = useMemo(() => {
    try {
      return { offers: createReportOffers(scenario, saved, selectedIds, catalog), error: '' }
    } catch (error) {
      return { offers: [], error: error instanceof Error ? error.message : 'Rapport indisponible.' }
    }
  }, [scenario, saved, selectedIds, catalog])

  function persist(next: NamedScenario[]): boolean {
    try {
      const result = replaceScenarioStorage(localStorageAdapter(), next)
      if (!result.ok) {
        setLibraryError(result.error)
        return false
      }
      setSaved(next)
      setLibraryError('')
      setCorruptLibrary(false)
      return true
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : 'Stockage local indisponible.')
      return false
    }
  }

  function saveCurrent(): void {
    try {
      if (corruptLibrary)
        throw new Error('Effacer la collection locale corrompue avant toute sauvegarde.')
      if (saved.length >= MAX_SAVED_SCENARIOS) {
        throw new RangeError('La collection contient déjà 20 scénarios.')
      }
      const offer: NamedScenario = {
        id: createId(),
        name: normalizeScenarioName(name),
        savedAt: new Date().toISOString(),
        scenario,
      }
      if (persist([...saved, offer])) setName('')
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : 'Enregistrement impossible.')
    }
  }

  function loadOffer(offer: NamedScenario): void {
    onScenarioChange(offer.scenario)
    setLibraryError(`Scénario « ${offer.name} » chargé explicitement.`)
  }

  function deleteOffer(offer: NamedScenario): void {
    const next = saved.filter((item) => item.id !== offer.id)
    if (persist(next)) setSelectedIds((current) => current.filter((id) => id !== offer.id))
  }

  function clearLibrary(): void {
    if (!window.confirm('Effacer tous les scénarios enregistrés dans ce navigateur ?')) return
    try {
      const result = clearScenarioStorage(localStorageAdapter())
      if (!result.ok) {
        setLibraryError(result.error)
        return
      }
      setSaved([])
      setSelectedIds([])
      setLibraryError('')
      setCorruptLibrary(false)
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : 'Suppression impossible.')
    }
  }

  function exportJson(): void {
    try {
      downloadFile(
        'tout-compte-fait-scenarios.json',
        encodeScenarioCollectionJson(saved),
        'application/json;charset=utf-8',
      )
      setLibraryError('')
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : 'Export JSON impossible.')
    }
  }

  function exportCsv(): void {
    try {
      if (comparison.error) throw new Error(comparison.error)
      downloadFile(
        'tout-compte-fait-comparaison.csv',
        compareRowsToCsv(comparison.rows),
        'text/csv;charset=utf-8',
      )
      setLibraryError('')
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : 'Export CSV impossible.')
    }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      if (file.size > MAX_SCENARIO_IMPORT_BYTES) {
        throw new RangeError('Le fichier JSON dépasse la limite de 100 Kio.')
      }
      const next = decodeScenarioCollectionJson(await file.text())
      if (persist(next)) setSelectedIds([])
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : 'Import JSON impossible.')
    }
  }

  return (
    <section className="decision-tools" aria-label="Outils de décision">
      <details className="decision-disclosure">
        <summary>Taux d’équilibre</summary>
        <div className="decision-panel" role="group" aria-label="Taux d’équilibre">
          <p className="decision-intro">
            Calcul annuel avant impôt, hors retraite. Les variantes de jours sont des hypothèses,
            pas des prévisions.
          </p>
          <label className="decision-field">
            <span>Cible de comparaison</span>
            <select
              aria-label="Cible de comparaison"
              value={target}
              onChange={(event) => setTarget(event.target.value as BalanceTarget)}
            >
              <option value="netIncome">Revenu net salarié avant impôt</option>
              <option value="totalValue">Valeur économique avec avantages</option>
            </select>
          </label>
          <p className="decision-status">
            Résultats calculés automatiquement à chaque modification.
          </p>
          <div className="balance-grid" aria-live="polite">
            {balanceRows.map(({ days, result }) => {
              const rate = resultValue(result)
              const currentDays = days === scenario.micro.billedDays
              const daysDescription =
                days === 120
                  ? 'pratique basse'
                  : days === 160
                    ? 'pratique centrale'
                    : days === 200
                      ? 'pratique haute'
                      : 'autre hypothèse'
              return (
                <article className="balance-card" key={days}>
                  <h3>
                    {days} j/an
                    {' · '}
                    {daysDescription}
                    {currentDays ? ' · actuel' : ''}
                  </h3>
                  <strong>{rate === undefined ? '—' : `${formatDailyRate(rate)}/j`}</strong>
                  <span>{result.message}</span>
                  {result.state === 'target-above-eligible-ceiling' && (
                    <small>Hors plafond · non éligible · ne pas appliquer</small>
                  )}
                  {currentDays && result.state === 'reachable' && (
                    <button
                      className="decision-action"
                      type="button"
                      onClick={() => onScenarioChange(applyBalanceRate(scenario, result))}
                    >
                      Appliquer ce taux
                    </button>
                  )}
                </article>
              )
            })}
          </div>
          <p className="decision-footnote">
            Plafond micro 2026 proratisé selon la date de début. Un chiffre d’affaires sous plafond
            ne confirme pas l’éligibilité, qui dépend également des chiffres d’affaires des années
            N-1 et N-2. Un taux hors plafond n’est jamais recommandé ni appliqué.
          </p>
        </div>
      </details>

      <details className="decision-disclosure">
        <summary>Sensibilité et aléas</summary>
        <div className="decision-panel" role="group" aria-label="Sensibilité et aléas">
          <p className="decision-intro">
            Hypothèses annuelles; aucune garantie d’emploi ou de droit au chômage. Retraite exclue,
            sans double comptage.
          </p>
          <div className="decision-presets" aria-label="Hypothèses prédéfinies">
            {stressPresets.map((preset) => (
              <button
                className="decision-action"
                key={preset.label}
                type="button"
                onClick={() => {
                  setStress(preset.value)
                  setExtraExpensesInput(String(preset.value.extraAnnualExpenses / 100))
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="decision-input-grid">
            <label className="decision-field">
              <span>Jours perdus</span>
              <input
                aria-label="Jours perdus"
                type="number"
                min={0}
                max={366}
                step={1}
                value={Number.isFinite(stress.daysLost) ? stress.daysLost : ''}
                onChange={(event) =>
                  setStress((current) => ({
                    ...current,
                    daysLost: event.target.value === '' ? Number.NaN : event.target.valueAsNumber,
                  }))
                }
              />
            </label>
            <label className="decision-field">
              <span>% de baisse du taux</span>
              <input
                aria-label="% de baisse du taux"
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={
                  Number.isFinite(stress.rateDecreasePercent) ? stress.rateDecreasePercent : ''
                }
                onChange={(event) =>
                  setStress((current) => ({
                    ...current,
                    rateDecreasePercent:
                      event.target.value === '' ? Number.NaN : event.target.valueAsNumber,
                  }))
                }
              />
            </label>
            <label className="decision-field">
              <span>Frais annuels supplémentaires (€)</span>
              <input
                aria-label="Frais annuels supplémentaires"
                type="number"
                min={0}
                max={100_000}
                step={0.01}
                value={extraExpensesInput}
                onChange={(event) => {
                  const value = event.target.value
                  setExtraExpensesInput(value)
                  setStress((current) => ({
                    ...current,
                    extraAnnualExpenses: euroInputToCents(value),
                  }))
                }}
              />
            </label>
          </div>
          {stressError ? (
            <p className="decision-error" role="alert">
              {stressError}
            </p>
          ) : (
            stressResult && (
              <>
                <p aria-live="polite">
                  {stressResult.remainingDays} jour{stressResult.remainingDays > 1 ? 's' : ''}{' '}
                  restant{stressResult.remainingDays > 1 ? 's' : ''} · taux stressé{' '}
                  {formatDailyRate(stressResult.stressedDailyRateCents)}/j · résultats annuels avant
                  impôt
                </p>
                <p>
                  Confiance des valeurs — courant :{' '}
                  {confidenceLabel(stressResult.currentMicroConfidence)}; stressé :{' '}
                  {confidenceLabel(stressResult.stressedMicroConfidence)}.
                </p>
                {[...stressResult.currentMicroWarnings, ...stressResult.stressedMicroWarnings].map(
                  (warning, index) => (
                    <p className="decision-warning" key={`${warning.code}-${index}`}>
                      {index < stressResult.currentMicroWarnings.length ? 'Courant' : 'Stressé'} :{' '}
                      {warning.message}
                    </p>
                  ),
                )}
                <div
                  className="decision-table-wrap"
                  tabIndex={0}
                  role="region"
                  aria-label="Tableau de comparaison annuel"
                >
                  <table className="decision-table">
                    <caption>Valeurs annuelles, retraite exclue</caption>
                    <thead>
                      <tr>
                        <th scope="col">Indicateur</th>
                        <th scope="col">Courant</th>
                        <th scope="col">Stressé</th>
                        <th scope="col">Écart au salariat</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">Revenu net</th>
                        <td>{formatCents(stressResult.currentMicroNetIncomeCents)}</td>
                        <td>{formatCents(stressResult.stressedMicroNetIncomeCents)}</td>
                        <td>{formatCents(stressResult.netDifferenceVsEmployeeCents)}</td>
                      </tr>
                      <tr>
                        <th scope="row">Valeur économique</th>
                        <td>{formatCents(stressResult.currentMicroEconomicValueCents)}</td>
                        <td>{formatCents(stressResult.stressedMicroEconomicValueCents)}</td>
                        <td>{formatCents(stressResult.economicDifferenceVsEmployeeCents)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )
          )}
        </div>
      </details>

      <details className="decision-disclosure">
        <summary>Scénarios enregistrés</summary>
        <div className="decision-panel" role="group" aria-label="Scénarios enregistrés">
          <p className="decision-intro">
            Données conservées dans le stockage local du navigateur. Aucun envoi automatique,
            télémétrie financière ou partage par URL.
          </p>
          <div className="decision-save-row">
            <label className="decision-field">
              <span>Nom du scénario</span>
              <input
                aria-label="Nom du scénario"
                type="text"
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <button
              className="decision-action"
              type="button"
              disabled={!name.trim() || saved.length >= MAX_SAVED_SCENARIOS || corruptLibrary}
              onClick={saveCurrent}
            >
              Enregistrer le scénario
            </button>
          </div>
          <p>
            {saved.length}/{MAX_SAVED_SCENARIOS} scénarios enregistrés · chargement manuel
          </p>
          {corruptLibrary && (
            <p className="decision-warning">
              Collection locale invalide. L’effacer ou importer un fichier valide avant
              l’enregistrement.
            </p>
          )}
          {saved.length > 0 && (
            <ul className="decision-scenario-list">
              {saved.map((offer) => (
                <li key={offer.id}>
                  <span>{offer.name}</span>
                  <span className="decision-scenario-actions">
                    <button type="button" onClick={() => loadOffer(offer)}>
                      Charger {offer.name}
                    </button>
                    <label>
                      <input
                        type="checkbox"
                        aria-label={`Comparer ${offer.name}`}
                        checked={selectedIds.includes(offer.id)}
                        onChange={(event) =>
                          setSelectedIds((current) =>
                            event.target.checked
                              ? [...current, offer.id]
                              : current.filter((id) => id !== offer.id),
                          )
                        }
                      />
                      Comparer
                    </label>
                    <button type="button" onClick={() => deleteOffer(offer)}>
                      Supprimer {offer.name}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="decision-presets">
            <label className="decision-field">
              <span>Importer une collection JSON</span>
              <input
                aria-label="Importer une collection JSON"
                type="file"
                accept="application/json,.json"
                onChange={(event) => void importFile(event)}
              />
            </label>
            <button className="decision-action" type="button" onClick={exportJson}>
              Exporter JSON
            </button>
            <button className="decision-action" type="button" onClick={exportCsv}>
              Exporter CSV
            </button>
            <button
              className="decision-action decision-action--secondary"
              type="button"
              onClick={clearLibrary}
            >
              Effacer la collection enregistrée
            </button>
          </div>
          {comparison.error && (
            <p className="decision-error" role="alert" aria-live="polite">
              {comparison.error}
            </p>
          )}
          {selectedIds.length > 0 && !report.error && <OfferComparison offers={report.offers} />}
          {selectedIds.length > 0 && !comparison.error && (
            <div
              className="decision-table-wrap"
              tabIndex={0}
              role="region"
              aria-label="Tableau de comparaison annuel"
            >
              <table className="decision-table">
                <caption>Comparaison annuelle avant impôt, retraite exclue</caption>
                <thead>
                  <tr>
                    <th scope="col">Scénario</th>
                    <th scope="col">Année</th>
                    <th scope="col">Jours micro</th>
                    <th scope="col">Jours salariat</th>
                    <th scope="col">Micro net</th>
                    <th scope="col">Salariat net</th>
                    <th scope="col">Micro valeur</th>
                    <th scope="col">Salariat valeur</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.rows.map((row, index) => (
                    <tr
                      key={
                        index === 0
                          ? 'current'
                          : saved.filter((offer) => selectedIds.includes(offer.id))[index - 1]!.id
                      }
                    >
                      <th scope="row">{row.name}</th>
                      <td>{row.referenceYear}</td>
                      <td>{row.microWorkedDays}</td>
                      <td>{row.employeeWorkedDays}</td>
                      <td>{formatCents(row.microAnnualNetIncomeCents)}</td>
                      <td>{formatCents(row.employeeAnnualNetIncomeCents)}</td>
                      <td>{formatCents(row.microAnnualEconomicValueCents)}</td>
                      <td>{formatCents(row.employeeAnnualEconomicValueCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {libraryError && (
            <p className="decision-error" role="alert" aria-live="polite">
              {libraryError}
            </p>
          )}
        </div>
      </details>

      <div className="report-launch">
        <button
          className="decision-action"
          type="button"
          disabled={!!report.error}
          onClick={() => setReportOpen(true)}
        >
          Prévisualiser le rapport
        </button>
        <span>Scénario courant et offres cochées · impression / PDF local</span>
        {report.error && <p className="decision-error">Rapport indisponible : {report.error}</p>}
      </div>
      {reportOpen && !report.error && (
        <DecisionReport offers={report.offers} onClose={() => setReportOpen(false)} />
      )}
      <button className="decision-action decision-reset" type="button" onClick={onReset}>
        Réinitialiser les entrées
      </button>
    </section>
  )
}
