import type { ReactNode } from 'react'

interface SectionProps {
  number: number
  title: string
  subtitle?: string
  icon: ReactNode
  children: ReactNode
  className?: string
}

export function Section({ number, title, subtitle, icon, children, className = '' }: SectionProps) {
  return (
    <section className={`section-card ${className}`}>
      <header className="section-heading">
        <span className="section-number">{number}</span>
        <span className="section-icon" aria-hidden="true">
          {icon}
        </span>
        <span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </span>
      </header>
      <div className="section-content">{children}</div>
    </section>
  )
}
