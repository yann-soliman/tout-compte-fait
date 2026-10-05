import {
  BriefcaseBusiness,
  Building2,
  Calculator,
  Landmark,
  PiggyBank,
  ReceiptText,
  Sparkles,
  WalletCards,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ComparisonOverview } from './components/ComparisonOverview'
import { Results, RetirementRights } from './components/Results'
import { EiComparison } from './components/EiComparison'
import { IncomeTaxInputs, IncomeTaxComparison } from './components/IncomeTaxComparison'
import { ResultVisuals } from './components/ResultVisuals'
import { DecisionTools } from './components/DecisionTools'
import { NumberField } from './components/ui/NumberField'
import { Section } from './components/ui/Section'
import { SegmentedControl } from './components/ui/SegmentedControl'
import { formatCents, calculateComparison } from './domain/calculate'
import { defaultScenario } from './domain/defaults'
import type { AppView, ComparisonScenario, EmployeeScenario, MicroScenario } from './domain/model'
import { assertMoneyCents, eurosToMoneyCents } from './domain/money'
import { rules2026 } from './domain/rules/2026'
import { defaultTaxSettings } from './domain/tax-settings'

import { ProjectionView } from './components/ProjectionView'

const views = [
  ['hypotheses', 'Hypothèses'],
  ['results', 'Résultats'],
  ['exploration', 'Exploration'],
  ['scenarios', 'Scénarios'],
] as const

export function App() {
  const [view, setView] = useState<AppView>('hypotheses')
  const focusHeading = useRef(false)
  const [hasExplored, setHasExplored] = useState(false)
  const openView = (next: AppView, guided = false) => {
    focusHeading.current = guided
    setView(next)
    if (next === 'exploration') setHasExplored(true)
  }
  useEffect(() => {
    if (focusHeading.current) {
      document.getElementById(`view-title-${view}`)?.focus()
      focusHeading.current = false
    }
  }, [view])
  const [scenario, setScenario] = useState<ComparisonScenario>(defaultScenario)
  const [dailyRateError, setDailyRateError] = useState<string>()
  const [eiCfeExemptionConfirmed, setEiCfeExemptionConfirmed] = useState(false)
  const [taxSettings, setTaxSettings] = useState(defaultTaxSettings)
  const calculation = useMemo(() => {
    if (dailyRateError) return { result: undefined, error: dailyRateError }
    try {
      return { result: calculateComparison(scenario, rules2026), error: undefined }
    } catch (error) {
      return {
        result: undefined,
        error: error instanceof Error ? error.message : 'Scénario invalide.',
      }
    }
  }, [scenario, dailyRateError])

  const applyHypothesis = useCallback(
    (patch: Pick<MicroScenario, 'dailyRate' | 'billedDays'>) => {
      setScenario((current) => ({ ...current, micro: { ...current.micro, ...patch } }))
      setDailyRateError(undefined)
    },
    [setScenario, setDailyRateError],
  )

  const updateMicro = (patch: Partial<MicroScenario>) =>
    setScenario((current) => ({ ...current, micro: { ...current.micro, ...patch } }))
  const updateEmployee = (patch: Partial<EmployeeScenario>) =>
    setScenario((current) => ({ ...current, employee: { ...current.employee, ...patch } }))
  const updateDailyRate = (euros: number) => {
    try {
      updateMicro({ dailyRate: eurosToMoneyCents(euros) })
      setDailyRateError(undefined)
    } catch (error) {
      if (!(error instanceof RangeError)) throw error
      setDailyRateError(error.message)
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="Tout compte fait — accueil">
          <span className="brand-mark" aria-hidden="true">
            <Calculator size={20} strokeWidth={2.25} />
          </span>
          <span>
            <strong>Tout compte fait</strong>
            <small>Comparer micro, EI au réel et salariat</small>
          </span>
        </a>
        <div className="header-controls">
          <SegmentedControl
            label="Période d’affichage"
            value={scenario.displayPeriod}
            options={[
              { label: 'Annuel', value: 'annual' },
              { label: 'Mensuel', value: 'monthly' },
            ]}
            onChange={(displayPeriod) => setScenario((current) => ({ ...current, displayPeriod }))}
            compact
          />
        </div>
      </header>

      <main>
        <nav className="view-tabs" aria-label="Vues du comparateur" role="tablist">
          {views.map(([key, label]) => (
            <button
              key={key}
              id={`tab-${key}`}
              type="button"
              role="tab"
              aria-selected={view === key}
              aria-controls={`panel-${key}`}
              tabIndex={view === key ? 0 : -1}
              className={view === key ? 'is-active' : undefined}
              onClick={() => openView(key)}
              onKeyDown={(event) => {
                const index = views.findIndex(([candidate]) => candidate === key)
                const next =
                  event.key === 'ArrowRight'
                    ? (index + 1) % views.length
                    : event.key === 'ArrowLeft'
                      ? (index + views.length - 1) % views.length
                      : event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? views.length - 1
                          : undefined
                if (next !== undefined) {
                  event.preventDefault()
                  const nextView = views[next]![0]
                  openView(nextView)
                  document.getElementById(`tab-${nextView}`)?.focus()
                }
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div
          className="simulator"
          id="panel-hypotheses"
          role="tabpanel"
          aria-labelledby="tab-hypotheses"
          hidden={view !== 'hypotheses'}
        >
          <div className="page-intro">
            <div>
              <span className="eyebrow">Comparaison rapide</span>
              <h1 id="view-title-hypotheses" tabIndex={-1}>
                Renseigner. Comparer. Projeter.
              </h1>
            </div>
            <span className="demo-badge">
              <Sparkles size={14} aria-hidden="true" />
              Règles 2026
            </span>
          </div>

          <Section
            number={1}
            title="Situation commune"
            subtitle="Définir le cadre de comparaison"
            icon={<ReceiptText size={20} />}
          >
            <div className="common-grid">
              <SegmentedControl
                label="Année de référence"
                value={scenario.referenceYear}
                options={[{ label: '2026', value: 2026 }]}
                onChange={() => undefined}
                compact
              />
              <label className="field">
                <span className="field__label">Début d’activité micro</span>
                <span className="field__control">
                  <input
                    type="date"
                    min="2026-01-01"
                    max="2026-12-31"
                    value={scenario.activityStartDate ?? ''}
                    onChange={(event) =>
                      setScenario((current) => ({
                        ...current,
                        activityStartDate: event.target.value || undefined,
                      }))
                    }
                  />
                </span>
              </label>
            </div>
          </Section>

          <Section
            number={2}
            title="Revenus à comparer"
            subtitle="Renseigner les deux activités"
            icon={<WalletCards size={20} />}
          >
            <div className="status-grid">
              <article className="status-panel status-panel--micro">
                <header>
                  <span className="status-icon">
                    <Building2 size={19} />
                  </span>
                  <span>
                    <h3>Micro-entreprise</h3>
                    <small>Activité libérale BNC hors Cipav</small>
                  </span>
                </header>
                <div className="fields-grid">
                  <NumberField
                    label="Taux journalier"
                    value={scenario.micro.dailyRate / 100}
                    onChange={updateDailyRate}
                    suffix="€/j"
                    step={0.01}
                    info="Montant facturé hors taxes pour une journée travaillée."
                    error={dailyRateError}
                  />
                  <NumberField
                    label="Jours facturés"
                    value={scenario.micro.billedDays}
                    onChange={(billedDays) => updateMicro({ billedDays })}
                    suffix="j/an"
                    max={366}
                  />
                  <NumberField
                    label="Frais professionnels"
                    value={scenario.micro.professionalExpenses / 100}
                    onChange={(professionalExpenses) =>
                      updateMicro({
                        professionalExpenses: assertMoneyCents(professionalExpenses * 100),
                      })
                    }
                    suffix="€/an"
                  />
                  <NumberField
                    label="Mutuelle"
                    value={scenario.micro.healthInsuranceMonthly / 100}
                    onChange={(healthInsuranceMonthly) =>
                      updateMicro({
                        healthInsuranceMonthly: assertMoneyCents(healthInsuranceMonthly * 100),
                      })
                    }
                    suffix="€/mois"
                  />
                  <NumberField
                    label="CFE"
                    value={(scenario.micro.cfeAnnual ?? 0) / 100}
                    onChange={(cfeAnnual) =>
                      updateMicro({ cfeAnnual: assertMoneyCents(cfeAnnual * 100) })
                    }
                    suffix="€/an"
                    info="Cotisation foncière des entreprises. Renseigner le montant annuel réel."
                  />
                  <label className="toggle-card toggle-card--compact">
                    <span>Exonération de CFE confirmée</span>
                    <input
                      type="checkbox"
                      checked={scenario.micro.cfeExemptionConfirmed}
                      onChange={(event) =>
                        updateMicro({ cfeExemptionConfirmed: event.target.checked })
                      }
                    />
                    <span className="switch" aria-hidden="true" />
                  </label>
                  <label className="toggle-card toggle-card--compact">
                    <span>Confirmer une exonération CFE pour l’EI</span>
                    <input
                      type="checkbox"
                      checked={eiCfeExemptionConfirmed}
                      onChange={(event) => setEiCfeExemptionConfirmed(event.target.checked)}
                    />
                    <span className="switch" aria-hidden="true" />
                  </label>
                </div>
                <p className="field__hint">
                  TJM, jours, frais et montant CFE communs à la micro et à l’EI.
                </p>
              </article>

              <article className="status-panel status-panel--employee">
                <header>
                  <span className="status-icon">
                    <BriefcaseBusiness size={19} />
                  </span>
                  <span>
                    <h3>Salariat</h3>
                    <small>Salarié privé · régime général</small>
                  </span>
                </header>
                <div className="fields-grid">
                  <NumberField
                    label="Salaire brut"
                    value={scenario.employee.grossAnnualSalary / 100}
                    onChange={(grossAnnualSalary) =>
                      updateEmployee({
                        grossAnnualSalary: assertMoneyCents(grossAnnualSalary * 100),
                      })
                    }
                    suffix="€/an"
                  />
                  <SegmentedControl
                    label="Catégorie"
                    value={scenario.employee.category}
                    options={[
                      { label: 'Non-cadre', value: 'non-cadre' },
                      { label: 'Cadre', value: 'cadre' },
                    ]}
                    onChange={(category) => updateEmployee({ category })}
                  />
                  <NumberField
                    label="Quotité de travail"
                    value={scenario.employee.workRatioPercent}
                    onChange={(workRatioPercent) => updateEmployee({ workRatioPercent })}
                    suffix="%"
                    min={1}
                    max={100}
                  />
                  <NumberField
                    label="Congés payés"
                    value={scenario.employee.paidLeaveWeeks}
                    onChange={(paidLeaveWeeks) => updateEmployee({ paidLeaveWeeks })}
                    suffix="sem."
                    max={52}
                    step={0.5}
                  />
                  <NumberField
                    label="RTT"
                    value={scenario.employee.rttDays}
                    onChange={(rttDays) => updateEmployee({ rttDays })}
                    suffix="j/an"
                    max={366}
                  />
                  <NumberField
                    label="Avantages"
                    value={scenario.employee.annualBenefits / 100}
                    onChange={(annualBenefits) =>
                      updateEmployee({ annualBenefits: assertMoneyCents(annualBenefits * 100) })
                    }
                    suffix="€/an"
                    info="Participation, abondement et autres montants valorisables."
                  />
                </div>
              </article>
            </div>
          </Section>

          <details className="view-details advanced-inputs">
            <summary>Paramètres avancés</summary>
            <Section
              number={3}
              title="Droits retraite"
              subtitle="Afficher les droits acquis séparément"
              icon={<Landmark size={20} />}
            >
              <div className="retirement-grid">
                <label className="toggle-card">
                  <span className="toggle-card__icon">
                    <PiggyBank size={19} />
                  </span>
                  <span>
                    <strong>Afficher les droits retraite 2026</strong>
                    <small>Sans les ajouter au revenu ni à la valeur économique</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={scenario.retirement.includeRights}
                    onChange={(event) =>
                      setScenario((current) => ({
                        ...current,
                        retirement: {
                          ...current.retirement,
                          includeRights: event.target.checked,
                        },
                      }))
                    }
                  />
                  <span className="switch" aria-hidden="true" />
                </label>
              </div>
            </Section>
          </details>
          <IncomeTaxInputs settings={taxSettings} onChange={setTaxSettings} />
          <button
            className="decision-action primary-action"
            type="button"
            onClick={() => openView('results', true)}
          >
            Voir la comparaison
          </button>
          <button
            className="decision-action decision-reset"
            type="button"
            onClick={() => {
              if (window.confirm('Réinitialiser les entrées du simulateur ?')) {
                setScenario(defaultScenario)
                setDailyRateError(undefined)
                setEiCfeExemptionConfirmed(false)
                setTaxSettings(defaultTaxSettings)
              }
            }}
          >
            Réinitialiser les entrées
          </button>
        </div>
        <div
          id="panel-results"
          role="tabpanel"
          aria-labelledby="tab-results"
          hidden={view !== 'results'}
        >
          <h1 id="view-title-results" tabIndex={-1}>
            Comparer les trois statuts
          </h1>
          <button
            className="decision-action"
            type="button"
            onClick={() => openView('hypotheses', true)}
          >
            Modifier les hypothèses
          </button>
          {calculation.error && (
            <p className="decision-error" role="alert">
              {calculation.error}
            </p>
          )}
          {calculation.result && (
            <>
              <section className="hypothesis-summary" aria-label="Hypothèses utilisées">
                <strong>Hypothèses utilisées</strong>
                <p>
                  {formatCents(scenario.micro.dailyRate)}/jour · {scenario.micro.billedDays} jours ·
                  salaire {formatCents(scenario.employee.grossAnnualSalary)}/an ·{' '}
                  {taxSettings.enabled
                    ? `${taxSettings.status === 'couple' ? 'Couple' : 'Célibataire'}, ${taxSettings.children} enfant(s), projection IR activée`
                    : 'Avant IR'}
                </p>
              </section>
              <ComparisonOverview
                scenario={scenario}
                comparison={calculation.result}
                settings={taxSettings}
                eiCfeExemptionConfirmed={eiCfeExemptionConfirmed}
              />
              <details className="view-details">
                <summary>Détails avant IR</summary>
                <Results
                  result={calculation.result}
                  period={scenario.displayPeriod}
                  includeRetirement={false}
                />
                <EiComparison
                  scenario={scenario}
                  comparison={calculation.result}
                  cfeExemptionConfirmed={eiCfeExemptionConfirmed}
                />
              </details>
              {scenario.retirement.includeRights && (
                <details className="view-details">
                  <summary>Retraite — droits 2026 (hors cash)</summary>
                  <p>
                    Droits annuels estimés, micro/salariat uniquement ; pas une pension de carrière
                    ni du disponible.
                  </p>
                  <RetirementRights result={calculation.result.employee} />
                  <RetirementRights result={calculation.result.micro} />
                </details>
              )}
              {taxSettings.enabled && (
                <details className="view-details">
                  <summary>Détails fiscaux</summary>
                  <IncomeTaxComparison
                    settings={taxSettings}
                    scenario={scenario}
                    comparison={calculation.result}
                    eiCfeExemptionConfirmed={eiCfeExemptionConfirmed}
                  />
                </details>
              )}
            </>
          )}
        </div>
        <div
          id="panel-exploration"
          role="tabpanel"
          aria-labelledby="tab-exploration"
          hidden={view !== 'exploration'}
        >
          <h1 id="view-title-exploration" tabIndex={-1}>
            Explorer les hypothèses
          </h1>
          <p className="projection-caveat">
            Exploration avant IR, micro-entreprise et salariat uniquement — EI non incluse.
          </p>
          {calculation.error && (
            <p className="decision-error" role="alert">
              {calculation.error}
            </p>
          )}
          <DecisionTools
            mode="exploration"
            scenarioError={calculation.error}
            scenario={scenario}
            onScenarioChange={(next) => {
              setScenario(next)
              setDailyRateError(undefined)
            }}
            onReset={() => {
              if (window.confirm('Réinitialiser les entrées du simulateur ?')) {
                setScenario(defaultScenario)
                setDailyRateError(undefined)
                setEiCfeExemptionConfirmed(false)
                setTaxSettings(defaultTaxSettings)
              }
            }}
            catalog={rules2026}
          />
          {calculation.result && (
            <>
              <h2>Comprendre les écarts</h2>
              <ResultVisuals
                scenario={scenario}
                result={calculation.result}
                catalog={rules2026}
                onApply={applyHypothesis}
              />
              <details className="view-details">
                <summary>Projection pluriannuelle</summary>
                <NumberField
                  label="Évolution annuelle"
                  value={scenario.projection.annualGrowthRate}
                  onChange={(annualGrowthRate) =>
                    setScenario((current) => ({
                      ...current,
                      projection: { ...current.projection, annualGrowthRate },
                    }))
                  }
                  suffix="%"
                  min={-100}
                  max={100}
                  step={0.5}
                  compact
                />
                {hasExplored && (
                  <>
                    <ProjectionView
                      result={calculation.result}
                      projection={scenario.projection}
                      onChange={(projection) =>
                        setScenario((current) => ({ ...current, projection }))
                      }
                    />
                  </>
                )}
              </details>
            </>
          )}
        </div>
        <div
          id="panel-scenarios"
          role="tabpanel"
          aria-labelledby="tab-scenarios"
          hidden={view !== 'scenarios'}
        >
          <h1 id="view-title-scenarios" tabIndex={-1}>
            Gérer les scénarios
          </h1>
          <p className="projection-caveat">
            Scénarios, offres, exports et rapport : avant IR, micro-entreprise et salariat
            uniquement.
          </p>
          <h2>Bibliothèque et comparaison</h2>
          <DecisionTools
            mode="scenarios"
            scenarioError={calculation.error}
            scenario={scenario}
            onScenarioChange={(next) => {
              setScenario(next)
              setDailyRateError(undefined)
              setEiCfeExemptionConfirmed(false)
              setTaxSettings(defaultTaxSettings)
              openView('hypotheses', true)
            }}
            onReset={() => {
              if (window.confirm('Réinitialiser les entrées du simulateur ?')) {
                setScenario(defaultScenario)
                setDailyRateError(undefined)
                setEiCfeExemptionConfirmed(false)
                setTaxSettings(defaultTaxSettings)
              }
            }}
            catalog={rules2026}
          />
        </div>
      </main>

      <footer>
        <span>Tout compte fait</span>
        <span>Calculs locaux · aucune donnée transmise</span>
      </footer>
    </div>
  )
}
