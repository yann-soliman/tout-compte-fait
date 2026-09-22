import { describe, expect, it } from 'vitest'
import { assertUsableCatalog, rules2026 } from '../../src/domain/rules/2026'

describe('2026 regulatory catalogue contract', () => {
  it('rejects a catalogue/scenario year mismatch', () => {
    expect(() => assertUsableCatalog(rules2026, 2025)).toThrow(/année/i)
  })

  it('rejects an absent required rule', () => {
    const incomplete = { ...rules2026, microSocial: undefined }
    expect(() => assertUsableCatalog(incomplete, 2026, ['microSocial'])).toThrow(/microSocial/)
  })

  it('carries complete source metadata on every established rule', () => {
    for (const rule of [
      rules2026.microSocial,
      rules2026.professionalTraining,
      rules2026.microTurnoverCeiling,
      rules2026.socialSecurityCeilingAnnual,
    ]) {
      expect(rule.source).toMatchObject({ status: 'known', verificationDate: '2026-09-22' })
      expect(rule.source.authority).not.toBe('')
      expect(rule.source.documentTitle).not.toBe('')
      expect(rule.source.canonicalUrl).toMatch(/^https:\/\//)
      expect(rule.source.effectiveDate).not.toBe('')
    }
  })

  it('does not accept provisional rules as established results', () => {
    const provisional = {
      ...rules2026,
      microSocial: {
        ...rules2026.microSocial,
        source: { ...rules2026.microSocial.source, status: 'provisional' as const },
      },
    }
    expect(() => assertUsableCatalog(provisional, 2026, ['microSocial'])).toThrow(/provisoire/i)
  })

  it('keeps every encoded employee and base-retirement rule directly sourced', () => {
    assertUsableCatalog(rules2026, 2026, ['employeeContributions', 'baseRetirement'])
    expect(rules2026.employeeContributions).toHaveLength(12)
    expect(rules2026.complementaryRetirement).toBeUndefined()
  })
})
