import {
  BriefcaseBusiness,
  Building2,
  Calculator,
  ChartNoAxesCombined,
  Landmark,
  PiggyBank,
  ReceiptText,
  Sparkles,
  WalletCards,
} from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { Results } from './components/Results'
import { ResultNotice } from './components/ui/ResultNotice'
import { NumberField } from './components/ui/NumberField'
import { Section } from './components/ui/Section'
import { SegmentedControl } from './components/ui/SegmentedControl'
import { calculateComparison } from './domain/calculate'
import { defaultScenario } from './domain/defaults'
import type { AppView, ComparisonScenario, EmployeeScenario, MicroScenario } from './domain/model'
import { assertMoneyCents } from './domain/money'
import { rules2026 } from './domain/rules/2026'

const ProjectionView = lazy(() =>
  import('./components/ProjectionView').then((module) => ({ default: module.ProjectionView })),
)

export function App() {
  const [view, setView] = useState<AppView>('simulator')
  const [scenario, setScenario] = useState<ComparisonScenario>(defaultScenario)
  const calculation = useMemo(() => {
    try {
      return { result: calculateComparison(scenario, rules2026), error: undefined }
    } catch (error) {
      return {
        result: undefined,
        error: error instanceof Error ? error.message : 'Scénario invalide.',
      }
    }
  }, [scenario])

  const updateMicro = (patch: Partial<MicroScenario>) =>
    setScenario((current) => ({ ...current, micro: { ...current.micro, ...patch } }))
  const updateEmployee = (patch: Partial<EmployeeScenario>) =>
    setScenario((current) => ({ ...current, employee: { ...current.employee, ...patch } }))

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="Tout compte fait — accueil">
          <span className="brand-mark" aria-hidden="true">
            <Calculator size={20} strokeWidth={2.25} />
          </span>
          <span>
            <strong>Tout compte fait</strong>
            <small>Comparer micro-entreprise et salariat</small>
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
          <button
            id="tab-simulator"
            type="button"
            aria-selected={view === 'simulator'}
            aria-controls="panel-simulator"
            role="tab"
            className={view === 'simulator' ? 'is-active' : undefined}
            onClick={() => setView('simulator')}
          >
            <Calculator size={17} aria-hidden="true" />
            Simulateur
          </button>
          <button
            id="tab-projection"
            type="button"
            aria-selected={view === 'projection'}
            aria-controls="panel-projection"
            role="tab"
            className={view === 'projection' ? 'is-active' : undefined}
            onClick={() => setView('projection')}
          >
            <ChartNoAxesCombined size={17} aria-hidden="true" />
            Projection
          </button>
        </nav>

        {view === 'simulator' ? (
          <div
            className="simulator"
            id="panel-simulator"
            role="tabpanel"
            aria-labelledby="tab-simulator"
          >
            <div className="page-intro">
              <div>
                <span className="eyebrow">Comparaison rapide</span>
                <h1>Renseigner. Comparer. Projeter.</h1>
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
                      onChange={(dailyRate) =>
                        updateMicro({ dailyRate: assertMoneyCents(dailyRate * 100) })
                      }
                      suffix="€/j"
                      info="Montant facturé hors taxes pour une journée travaillée."
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
                  </div>
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

            <Section
              number={3}
              title="Retraite et projection"
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
                <SegmentedControl
                  label="Projection"
                  value={scenario.projection.years}
                  options={[
                    { label: '5 ans', value: 5 },
                    { label: '10 ans', value: 10 },
                    { label: '20 ans', value: 20 },
                  ]}
                  onChange={(years) =>
                    setScenario((current) => ({
                      ...current,
                      projection: { ...current.projection, years },
                    }))
                  }
                  compact
                />
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
              </div>
            </Section>

            {calculation.error && (
              <ResultNotice warning={{ code: 'invalid-scenario', message: calculation.error }} />
            )}
            {calculation.result && (
              <Results result={calculation.result} period={scenario.displayPeriod} />
            )}
          </div>
        ) : (
          <div id="panel-projection" role="tabpanel" aria-labelledby="tab-projection">
            <Suspense fallback={<div className="loading-panel">Charger la projection…</div>}>
              <ProjectionView
                result={calculation.result ?? calculateComparison(defaultScenario, rules2026)}
                projection={scenario.projection}
                onChange={(projection) => setScenario((current) => ({ ...current, projection }))}
              />
            </Suspense>
          </div>
        )}
      </main>

      <footer>
        <span>Tout compte fait</span>
        <span>Calculs locaux · aucune donnée transmise</span>
      </footer>
    </div>
  )
}
