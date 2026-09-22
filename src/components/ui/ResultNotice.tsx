import type { ResultWarning } from '../../domain/model'

export function ResultNotice({ warning }: { warning: ResultWarning }) {
  return (
    <p className="result-notice" role="status">
      {warning.message}
    </p>
  )
}
