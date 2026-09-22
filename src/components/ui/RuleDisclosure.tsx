import type { SourceReference } from '../../domain/model'

export function RuleDisclosure({ sources }: { sources: SourceReference[] }) {
  const unique = [...new Map(sources.map((source) => [source.canonicalUrl, source])).values()]
  return (
    <details className="rule-disclosure">
      <summary>Sources réglementaires ({unique.length})</summary>
      <ul>
        {unique.map((source) => (
          <li key={source.canonicalUrl}>
            <a href={source.canonicalUrl} target="_blank" rel="noreferrer">
              {source.documentTitle}
            </a>
            <small>
              {source.authority} · effet {source.effectiveDate} · vérifié le{' '}
              {source.verificationDate} · {source.status === 'known' ? 'établi' : source.status}
            </small>
          </li>
        ))}
      </ul>
    </details>
  )
}
