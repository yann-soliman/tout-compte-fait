import { useEffect, useRef, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import type { ReportOffer } from '../domain/decision-report'
import { preciseEuro } from '../domain/result-visuals'
import { Robustness } from './Robustness'

const money = (n: number) => preciseEuro.format(n / 100)
export function DecisionReport({
  offers,
  onClose,
}: {
  offers: ReportOffer[]
  onClose: () => void
}) {
  const dialog = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const root = document.getElementById('root')
    const wasInert = root?.inert ?? false
    if (root) root.inert = true
    dialog.current?.focus()
    return () => {
      if (root) root.inert = wasInert
      previous?.focus()
    }
  }, [])
  useEffect(() => {
    // Printing can move focus outside the dialog: Escape must still close the modal.
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [onClose])
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return
    const elements = [...(dialog.current?.querySelectorAll<HTMLElement>('button, a[href]') ?? [])]
    const first = elements[0]
    const last = elements.at(-1)
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === dialog.current)
    ) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
  return createPortal(
    <div
      className="decision-report"
      role="dialog"
      aria-modal="true"
      aria-label="Rapport de comparaison"
      tabIndex={-1}
      ref={dialog}
      onKeyDown={keyboard}
    >
      <div className="report-paper">
        <div className="report-actions">
          <button type="button" onClick={() => window.print()}>
            Imprimer / Enregistrer en PDF
          </button>
          <button type="button" onClick={onClose}>
            Fermer le rapport
          </button>
        </div>
        <header className="report-header">
          <span className="visual-kicker">Tout compte fait · Décision</span>
          <h2>Rapport de comparaison · 2026</h2>
          <p>
            Valeurs annuelles avant impôt sur le revenu, hors retraite. Calcul local selon les
            règles générales 2026; aucune garantie de revenus ni de droits futurs.
          </p>
        </header>
        {offers.map((offer, index) => {
          const { micro, employee } = offer.scenario
          return (
            <article className="report-offer" key={offer.id} data-report-offer={offer.id}>
              <h3>{offer.name}</h3>
              <section className="report-assumptions">
                <h4>Hypothèses annuelles</h4>
                <div className="report-assumptions-grid">
                  <div>
                    <h5>Micro-entreprise · BNC non réglementé</h5>
                    <ul>
                      <li>TJM : {money(micro.dailyRate)}/j</li>
                      <li>Jours facturés : {micro.billedDays}</li>
                      <li>Frais professionnels : {money(micro.professionalExpenses)}/an</li>
                      <li>Mutuelle : {money(micro.healthInsuranceMonthly)}/mois</li>
                      <li>
                        CFE :{' '}
                        {micro.cfeAnnual === undefined ? 'non renseignée' : money(micro.cfeAnnual)}{' '}
                        · exonération {micro.cfeExemptionConfirmed ? 'confirmée' : 'non confirmée'}
                      </li>
                      <li>
                        Début d’activité :{' '}
                        {offer.scenario.activityStartDate ?? 'année complète modélisée'}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h5>Salariat privé</h5>
                    <ul>
                      <li>Salaire brut : {money(employee.grossAnnualSalary)}/an</li>
                      <li>Catégorie : {employee.category === 'cadre' ? 'cadre' : 'non-cadre'}</li>
                      <li>
                        Quotité : {employee.workRatioPercent}% · salaire effectif saisi, non
                        proratisé une seconde fois
                      </li>
                      <li>
                        Congés : {employee.paidLeaveWeeks} semaines · RTT : {employee.rttDays} jours
                      </li>
                      <li>Avantages valorisés : {money(employee.annualBenefits)}/an</li>
                    </ul>
                  </div>
                </div>
              </section>
              <section className="report-results">
                <h4>Résultats annuels</h4>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Indicateur</th>
                      <th scope="col">Micro</th>
                      <th scope="col">Salariat</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Revenu net avant impôt</th>
                      <td>{money(offer.result.micro.netIncome)}</td>
                      <td>{money(offer.result.employee.netIncome)}</td>
                    </tr>
                    <tr>
                      <th scope="row">Valeur économique</th>
                      <td>{money(offer.result.micro.totalValue)}</td>
                      <td>{money(offer.result.employee.totalValue)}</td>
                    </tr>
                    <tr>
                      <th scope="row">Jours modélisés</th>
                      <td>{offer.result.micro.workedDays}</td>
                      <td>{offer.result.employee.workedDays}</td>
                    </tr>
                  </tbody>
                </table>
                <p>
                  Écart de valeur économique (micro − salariat) :{' '}
                  <strong>
                    {money(offer.result.micro.totalValue - offer.result.employee.totalValue)}
                  </strong>
                </p>
                <p>
                  Plafond micro applicable :{' '}
                  {money(offer.result.micro.eligibility!.applicableCeiling)} · chiffre d’affaires :{' '}
                  {money(offer.result.micro.eligibility!.turnover)}
                </p>
              </section>
              <section className="report-alerts">
                <h4>Alertes et limites du scénario</h4>
                {[
                  ...(offer.result.micro.warnings ?? []),
                  ...(offer.result.employee.warnings ?? []),
                ].map((warning, i) => (
                  <p key={`${warning.code}:${i}`}>{warning.message}</p>
                ))}
                <p>
                  Avantages valorisés non nécessairement versés en espèces; salaire brut différent
                  du coût employeur. CFE dépendante de la commune. Temps de prospection non saisi.
                  Fiscalité personnelle et retraite de carrière non modélisées.
                </p>
              </section>
              <Robustness
                scenario={offer.scenario}
                data={offer.robustness}
                ariaLabel={`Robustesse — offre ${index + 1} · ${offer.name}`}
              />
              <section className="report-sources">
                <h4>Sources réglementaires</h4>
                <p>Date d’effet et date de vérification propres à chaque référence.</p>
                <ul>
                  {offer.sources.map((source) => (
                    <li key={JSON.stringify(source)}>
                      <strong>
                        {source.authority} · {source.documentTitle}
                      </strong>
                      <span>
                        Effet : {source.effectiveDate} · Vérification : {source.verificationDate} ·
                        Statut : {source.status}
                      </span>
                      <a href={source.canonicalUrl} target="_blank" rel="noreferrer">
                        {source.canonicalUrl}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </article>
          )
        })}
        <footer className="report-footer">
          Document indicatif · hypothèses indépendantes, pas une recommandation juridique ou
          fiscale. Éligibilité micro non confirmée sans historique des deux années précédentes.
          Impression ou PDF via le dialogue du navigateur; aucun envoi automatique.
        </footer>
      </div>
    </div>,
    document.body,
  )
}
