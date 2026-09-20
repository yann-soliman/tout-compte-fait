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
import { NumberField } from './components/ui/NumberField'
import { Section } from './components/ui/Section'
import { SegmentedControl } from './components/ui/SegmentedControl'
import { calculateComparison } from './domain/calculate'
import { defaultScenario } from './domain/defaults'
import type { AppView, ComparisonScenario, EmployeeScenario, MicroScenario } from './domain/model'

const ProjectionView = lazy(() =>
  import('./components/ProjectionView').then((module) => ({ default: module.ProjectionView })),
)

export function App() {
  const [view, setView] = useState<AppView>('simulator')
  const [scenario, setScenario] = useState<ComparisonScenario>(defaultScenario)
  const result = useMemo(() => calculateComparison(scenario), [scenario])

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
            value={scenario.period}
            options={[
              { label: 'Annuel', value: 'annual' },
              { label: 'Mensuel', value: 'monthly' },
            ]}
            onChange={(period) => setScenario((current) => ({ ...current, period }))}
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
                Démonstration
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
                  options={[
                    { label: '2025', value: 2025 },
                    { label: '2026', value: 2026 },
                    { label: '2027', value: 2027 },
                  ]}
                  onChange={(referenceYear) =>
                    setScenario((current) => ({ ...current, referenceYear }))
                  }
                  compact
                />
                <SegmentedControl
                  label="Parts fiscales"
                  value={scenario.householdParts}
                  options={[
                    { label: '1', value: 1 },
                    { label: '1,5', value: 1.5 },
                    { label: '2', value: 2 },
                    { label: '2,5', value: 2.5 },
                  ]}
                  onChange={(householdParts) =>
                    setScenario((current) => ({ ...current, householdParts }))
                  }
                  compact
                />
                <NumberField
                  label="Autres revenus imposables"
                  value={scenario.otherTaxableIncome}
                  onChange={(otherTaxableIncome) =>
                    setScenario((current) => ({ ...current, otherTaxableIncome }))
                  }
                  suffix="€/an"
                  compact
                  info="Montant annuel hors revenus comparés. Utiliser plus tard dans le calcul fiscal sourcé."
                />
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
                      <small>Activité BNC · estimation</small>
                    </span>
                  </header>
                  <div className="fields-grid">
                    <NumberField
                      label="Taux journalier"
                      value={scenario.micro.dailyRate}
                      onChange={(dailyRate) => updateMicro({ dailyRate })}
                      suffix="€/j"
                      info="Montant facturé hors taxes pour une journée travaillée."
                    />
                    <NumberField
                      label="Jours facturés"
                      value={scenario.micro.workedDays}
                      onChange={(workedDays) => updateMicro({ workedDays })}
                      suffix="j/an"
                      max={366}
                    />
                    <NumberField
                      label="Frais professionnels"
                      value={scenario.micro.annualExpenses}
                      onChange={(annualExpenses) => updateMicro({ annualExpenses })}
                      suffix="€/an"
                    />
                    <NumberField
                      label="Mutuelle"
                      value={scenario.micro.healthInsuranceMonthly}
                      onChange={(healthInsuranceMonthly) => updateMicro({ healthInsuranceMonthly })}
                      suffix="€/mois"
                    />
                    <NumberField
                      label="CFE"
                      value={scenario.micro.cfeAnnual}
                      onChange={(cfeAnnual) => updateMicro({ cfeAnnual })}
                      suffix="€/an"
                      info="Cotisation foncière des entreprises. Renseigner le montant annuel réel."
                    />
                  </div>
                </article>

                <article className="status-panel status-panel--employee">
                  <header>
                    <span className="status-icon">
                      <BriefcaseBusiness size={19} />
                    </span>
                    <span>
                      <h3>Salariat</h3>
                      <small>CDI · estimation</small>
                    </span>
                  </header>
                  <div className="fields-grid">
                    <NumberField
                      label="Salaire brut"
                      value={scenario.employee.grossAnnualSalary}
                      onChange={(grossAnnualSalary) => updateEmployee({ grossAnnualSalary })}
                      suffix="€/an"
                    />
                    <SegmentedControl
                      label="Temps de travail"
                      value={scenario.employee.workRatio}
                      options={[
                        { label: '100 %', value: 100 },
                        { label: '90 %', value: 90 },
                        { label: '80 %', value: 80 },
                      ]}
                      onChange={(workRatio) => updateEmployee({ workRatio })}
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
                      value={scenario.employee.annualBenefits}
                      onChange={(annualBenefits) => updateEmployee({ annualBenefits })}
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
              subtitle="Inclure la valeur des cotisations"
              icon={<Landmark size={20} />}
            >
              <div className="retirement-grid">
                <label className="toggle-card">
                  <span className="toggle-card__icon">
                    <PiggyBank size={19} />
                  </span>
                  <span>
                    <strong>Inclure les cotisations retraite</strong>
                    <small>Afficher la valeur estimée dans le résultat</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={scenario.retirement.includeContributions}
                    onChange={(event) =>
                      setScenario((current) => ({
                        ...current,
                        retirement: {
                          ...current.retirement,
                          includeContributions: event.target.checked,
                        },
                      }))
                    }
                  />
                  <span className="switch" aria-hidden="true" />
                </label>
                <SegmentedControl
                  label="Projection"
                  value={scenario.retirement.comparisonYears}
                  options={[
                    { label: '5 ans', value: 5 },
                    { label: '10 ans', value: 10 },
                    { label: '20 ans', value: 20 },
                  ]}
                  onChange={(comparisonYears) =>
                    setScenario((current) => ({
                      ...current,
                      retirement: { ...current.retirement, comparisonYears },
                    }))
                  }
                  compact
                />
                <NumberField
                  label="Évolution annuelle"
                  value={scenario.retirement.annualGrowth}
                  onChange={(annualGrowth) =>
                    setScenario((current) => ({
                      ...current,
                      retirement: { ...current.retirement, annualGrowth },
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

            <Results result={result} period={scenario.period} />
          </div>
        ) : (
          <div id="panel-projection" role="tabpanel" aria-labelledby="tab-projection">
            <Suspense fallback={<div className="loading-panel">Charger la projection…</div>}>
              <ProjectionView
                result={result}
                retirement={scenario.retirement}
                onChange={(retirement) => setScenario((current) => ({ ...current, retirement }))}
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
