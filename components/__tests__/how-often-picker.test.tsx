import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HowOftenPicker } from '../how-often-picker'
import type { HowOftenOption } from '@/lib/types'

const options: HowOftenOption[] = [
  { label: 'one time', action: 'advance' },
  { label: 'as needed', action: 'enable' },
  { label: 'specific days', action: 'day-chooser-multi' },
]

describe('HowOftenPicker — advance action', () => {
  it('calls onAdvance only (not onChange) when advance button is tapped and onAdvance is provided', async () => {
    const onChange = vi.fn()
    const onAdvance = vi.fn()

    render(
      <HowOftenPicker
        options={options}
        value=""
        days={[]}
        onChange={onChange}
        onAdvance={onAdvance}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'one time' }))

    expect(onAdvance).toHaveBeenCalledOnce()
    expect(onAdvance).toHaveBeenCalledWith('one time')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('calls onChange (not onAdvance) when advance button is tapped and onAdvance is not provided', async () => {
    const onChange = vi.fn()

    render(
      <HowOftenPicker
        options={options}
        value=""
        days={[]}
        onChange={onChange}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'one time' }))

    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith('one time', [])
  })
})
