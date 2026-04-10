import { describe, it, expect } from 'vitest'

// Inline the toggle logic as a pure function matching update-tasks-client.tsx
function toggleTask(taskState: boolean[], index: number): boolean[] {
  return taskState.map((v, i) => (i === index ? true : v))
}

describe('toggleTask — all-complete detection', () => {
  it('marks a single task complete', () => {
    const result = toggleTask([false], 0)
    expect(result).toEqual([true])
    expect(result.every(Boolean)).toBe(true)
  })

  it('marks one of several tasks complete without completing all', () => {
    const result = toggleTask([false, false, false], 0)
    expect(result).toEqual([true, false, false])
    expect(result.every(Boolean)).toBe(false)
  })

  it('completing the last remaining task triggers all-done', () => {
    const result = toggleTask([true, true, false], 2)
    expect(result).toEqual([true, true, true])
    expect(result.every(Boolean)).toBe(true)
  })

  it('does not un-complete an already-complete task (one-way)', () => {
    // update-tasks uses the same map logic — already-true stays true
    const result = toggleTask([true, false], 0)
    expect(result[0]).toBe(true)
  })
})
