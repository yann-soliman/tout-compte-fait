import type { ComparisonResult } from '../domain/model'
import { preciseEuro } from '../domain/result-visuals'

const money = (n: number) => preciseEuro.format(n / 100)
export function MicroCycleNotice({
  result,
  id = 'micro-cycle',
  details = true,
}: {
  result: ComparisonResult
  id?: string
  details?: boolean
}) {
  const cycle = result.microCycle
  if (!cycle) return null
  return (
    <section className="micro-cycle-notice projection-caveat" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`}>Micro — moyenne sur deux ans</h3>
      <p>
        Alterner le CA saisi ({money(cycle.firstTurnover)}) et une année limitée au plafond (
        {money(cycle.secondTurnover)}). {money(result.micro.totalValue)} : moyenne annuelle
        disponible avant IR, pas un encaissement identique chaque année.
      </p>
      <p>
        Frais, CFE, mutuelle et jours d’effort conservés chaque année. Sans augmentation
        artificielle d’un CA inférieur au plafond. Plafond micro distinct des seuils de TVA ;
        montants hors taxes. Le lissage ne confirme pas l’éligibilité : l’historique des deux années
        précédentes reste nécessaire.
      </p>
      <p>
        Moyennes des deux années arrondies indépendamment au centime : écarts d’arrondi possibles
        entre totaux et composantes, notamment d’un centime. Ces moyennes ne sont pas les assiettes
        ni les cotisations d’une déclaration annuelle.
      </p>
      {details && (
        <details className="chart-data">
          <summary>Détail du cycle micro sur deux ans</summary>
          <div
            className="chart-table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Tableau défilant des montants annuels"
          >
            <table>
              <caption>Recettes et disponible micro avant IR par année du cycle</caption>
              <thead>
                <tr>
                  <th scope="col">Année</th>
                  <th scope="col">CA réalisé HT</th>
                  <th scope="col">Prélèvements</th>
                  <th scope="col">Disponible après frais</th>
                </tr>
              </thead>
              <tbody>
                {[cycle.first, cycle.second].map((year, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{money(year.grossIncome ?? 0)}</td>
                    <td>
                      {money(
                        year.statutoryDeductions?.reduce((sum, line) => sum + line.amount, 0) ?? 0,
                      )}
                    </td>
                    <td>{money(year.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Sortie du régime après deux dépassements consécutifs, au 1er janvier suivant.
            L’alternance est une hypothèse de limitation réelle du CA, pas un plafond calculé sur la
            moyenne des recettes.
          </p>
          <a
            href="https://entreprendre.service-public.gouv.fr/vosdroits/F23267"
            target="_blank"
            rel="noreferrer"
          >
            Régime fiscal micro — Service Public
          </a>
        </details>
      )}
    </section>
  )
}
