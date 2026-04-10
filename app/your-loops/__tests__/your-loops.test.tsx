import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import YourLoopsPage from '../page'

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockReplace = vi.fn()
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}))

vi.mock('@/lib/user-profile-context', () => ({
  useUserProfile: () => ({
    userProfile: { id: 'user-1', username: 'testuser', email: 'test@example.com' },
  }),
}))

vi.mock('@/components/star-count-badge', () => ({
  StarCountBadge: () => <span data-testid="star-count-badge" />,
}))
vi.mock('@/components/feedback-sheet', () => ({
  FeedbackSheet: () => <span data-testid="feedback-sheet" />,
}))
vi.mock('@/components/settings-sheet', () => ({
  SettingsSheet: () => <span data-testid="settings-sheet" />,
}))

const mockUpdate = vi.fn().mockResolvedValue({ error: null })
const mockOrder = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            order: mockOrder,
            single: vi.fn(),
          }),
        }),
      }),
      update: () => ({
        eq: () => ({
          eq: () => mockUpdate(),
        }),
      }),
    }),
  }),
}))

// ── Fixtures ─────────────────────────────────────────────────────────────────

const singleTaskLoop = {
  id: 'loop-1',
  category: 'Kitchen',
  tasks: ['Wash the dishes'],
  how_long: null,
  how_often: 'one time',
  days: null,
  task_state: [false],
}

const multiTaskLoop = {
  id: 'loop-2',
  category: 'Bathroom',
  tasks: ['Clean the sink', 'Clean the toilet', 'Mop the floor'],
  how_long: null,
  how_often: 'weekly',
  days: null,
  task_state: [false, false, false],
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('YourLoopsPage — initial render', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the first incomplete task for a single-task loop', async () => {
    mockOrder.mockResolvedValue({ data: [singleTaskLoop] })
    render(<YourLoopsPage />)
    expect(await screen.findByText('Wash the dishes')).toBeInTheDocument()
  })

  it('shows first incomplete task for a multi-task loop', async () => {
    mockOrder.mockResolvedValue({ data: [multiTaskLoop] })
    render(<YourLoopsPage />)
    expect(await screen.findByText('Clean the sink')).toBeInTheDocument()
    expect(await screen.findByText('+2 more')).toBeInTheDocument()
  })

  it('shows second task when first is already complete', async () => {
    const loop = { ...multiTaskLoop, task_state: [true, false, false] }
    mockOrder.mockResolvedValue({ data: [loop] })
    render(<YourLoopsPage />)
    expect(await screen.findByText('Clean the toilet')).toBeInTheDocument()
    expect(await screen.findByText('+1 more')).toBeInTheDocument()
  })

  it('shows last task with no +N more when two of three are done', async () => {
    const loop = { ...multiTaskLoop, task_state: [true, true, false] }
    mockOrder.mockResolvedValue({ data: [loop] })
    render(<YourLoopsPage />)
    expect(await screen.findByText('Mop the floor')).toBeInTheDocument()
    expect(screen.queryByText(/more/)).not.toBeInTheDocument()
  })

  it('empty state is shown when no open loops', async () => {
    mockOrder.mockResolvedValue({ data: [] })
    render(<YourLoopsPage />)
    expect(await screen.findByText('Nothing open right now.')).toBeInTheDocument()
  })
})

describe('YourLoopsPage — task tapping', () => {
  beforeEach(() => vi.clearAllMocks())

  it('tapping the only task on a single-task loop saves and navigates to loop-closed', async () => {
    mockOrder.mockResolvedValue({ data: [singleTaskLoop] })
    render(<YourLoopsPage />)

    await userEvent.click(await screen.findByText('Wash the dishes'))

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled()
      expect(mockReplace).toHaveBeenCalledWith('/loop-closed?id=loop-1')
    })
  })

  it('tapping a task in a multi-task loop saves but does not navigate', async () => {
    mockOrder.mockResolvedValue({ data: [multiTaskLoop] })
    render(<YourLoopsPage />)

    await userEvent.click(await screen.findByText('Clean the sink'))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled())
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('tapping the last remaining task navigates to loop-closed', async () => {
    const almostDone = { ...multiTaskLoop, task_state: [true, true, false] }
    mockOrder.mockResolvedValue({ data: [almostDone] })
    render(<YourLoopsPage />)

    await userEvent.click(await screen.findByText('Mop the floor'))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/loop-closed?id=loop-2')
    })
  })
})
