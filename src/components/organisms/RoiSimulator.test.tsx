// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { RoiSimulator } from './RoiSimulator'
import { useRoiStore } from '@/store/useRoiStore'
import { DEFAULT_ASSUMPTIONS } from '@/lib/roi'

// Reset the shared store before each test so persisted state can't leak across.
beforeEach(() => {
  localStorage.clear()
  useRoiStore.setState({
    assumptions: DEFAULT_ASSUMPTIONS,
    scenarioHash: null,
  })
})

describe('RoiSimulator', () => {
  // Defaults: 250k visitors, 2.5% conversion, $85 AOV, 1%/100ms.
  // At +200ms: drop = 2%, loss = 6250 conv * 2% * $85 = $10,625/mo.
  it('renders the projected monthly loss for the given delay', () => {
    render(
      <RoiSimulator
        scenario={{ addedDelayMs: 200, addedCls: 0 }}
        scenarioLabel="Test scenario"
      />,
    )
    expect(screen.getByText('$10,625')).toBeInTheDocument()
    expect(screen.getByText('Test scenario')).toBeInTheDocument()
  })

  it('recalculates live when the impact assumption slider moves', () => {
    render(
      <RoiSimulator
        scenario={{ addedDelayMs: 200, addedCls: 0 }}
        scenarioLabel="Test scenario"
      />,
    )
    expect(screen.getByText('$10,625')).toBeInTheDocument()

    const slider = screen.getByLabelText('Conversion impact per 100ms')
    // Double the impact assumption → loss should double to $21,250.
    fireEvent.change(slider, { target: { value: '2' } })

    expect(screen.getByText('$21,250')).toBeInTheDocument()
    expect(screen.queryByText('$10,625')).not.toBeInTheDocument()
  })

  it('shows the latency badge for a latency scenario', () => {
    render(
      <RoiSimulator
        scenario={{ addedDelayMs: 3560, addedCls: 0 }}
        scenarioLabel="Hero image"
      />,
    )
    expect(screen.getByText(/3560ms latency/i)).toBeInTheDocument()
  })

  it('prices a layout-shift scenario and shows the CLS badge', () => {
    // 0.29 CLS at default 1.5%/0.1 → 4.35% drop → 6250 * 4.35% * $85 ≈ $23,109.
    render(
      <RoiSimulator
        scenario={{ addedDelayMs: 0, addedCls: 0.29 }}
        scenarioLabel="Font swap"
      />,
    )
    expect(screen.getByText(/0\.290 CLS/)).toBeInTheDocument()
    // A non-zero loss is rendered (exact figure asserted in roi.test.ts).
    expect(screen.getByText(/\$2[0-9],[0-9]{3}/)).toBeInTheDocument()
  })

  it('resets assumptions to defaults via the reset control', () => {
    render(
      <RoiSimulator
        scenario={{ addedDelayMs: 200, addedCls: 0 }}
        scenarioLabel="Test scenario"
      />,
    )
    const slider = screen.getByLabelText('Conversion impact per 100ms')
    fireEvent.change(slider, { target: { value: '2' } })
    expect(screen.getByText('$21,250')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByText('$10,625')).toBeInTheDocument()
  })
})
