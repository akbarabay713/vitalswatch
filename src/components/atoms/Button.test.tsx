// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, buttonVariants } from './Button'

describe('Button', () => {
  it('renders its children and defaults to type="button"', () => {
    render(<Button>Click me</Button>)
    const btn = screen.getByRole('button', { name: 'Click me' })
    expect(btn).toHaveAttribute('type', 'button')
  })

  it('applies CVA variant + size classes', () => {
    render(
      <Button variant="secondary" size="sm">
        Go
      </Button>,
    )
    const btn = screen.getByRole('button', { name: 'Go' })
    // secondary -> border utility; sm -> h-8
    expect(btn.className).toContain('h-8')
    expect(btn.className).toContain('border')
  })

  it('merges a custom className over the variant classes', () => {
    render(<Button className="w-full">Full</Button>)
    expect(screen.getByRole('button').className).toContain('w-full')
  })

  it('fires onClick when enabled and not when disabled', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(<Button onClick={onClick}>Tap</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <Button onClick={onClick} disabled>
        Tap
      </Button>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1) // unchanged
  })

  it('exposes buttonVariants for composing styles on other elements', () => {
    const cls = buttonVariants({ variant: 'outline' })
    expect(typeof cls).toBe('string')
    expect(cls.length).toBeGreaterThan(0)
  })
})
