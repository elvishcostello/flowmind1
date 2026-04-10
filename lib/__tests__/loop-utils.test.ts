import { describe, it, expect } from 'vitest'
import { getEmpathyLabel } from '../loop-utils'

const days = (n: number) => n * 24 * 60 * 60 * 1000

describe('getEmpathyLabel', () => {
  it('returns short-turnaround label when same day', () => {
    const created = new Date('2026-04-10T08:00:00Z')
    const updated = new Date('2026-04-10T18:00:00Z')
    expect(getEmpathyLabel(created, updated)).toBe("You didn't let it sit long. That matters.")
  })

  it('returns short-turnaround label when exactly 1 day', () => {
    const created = new Date('2026-04-09T08:00:00Z')
    const updated = new Date('2026-04-10T08:00:00Z')
    expect(getEmpathyLabel(created, updated)).toBe("You didn't let it sit long. That matters.")
  })

  it('returns long-turnaround label when more than 1 day', () => {
    const created = new Date('2026-04-01T08:00:00Z')
    const updated = new Date('2026-04-10T08:00:00Z')
    expect(getEmpathyLabel(created, updated)).toBe("You got it done.")
  })

  it('returns long-turnaround label when exactly 2 days', () => {
    const created = new Date(Date.now() - days(2))
    const updated = new Date()
    expect(getEmpathyLabel(created, updated)).toBe("You got it done.")
  })
})
