import { describe, expect, it } from 'vitest'
import { flowUnlocks, pathToStepId, redirectPathForStep } from './flowSteps'

describe('flowSteps', () => {
  it('maps routes to step ids', () => {
    expect(pathToStepId('/')).toBe('home')
    expect(pathToStepId('/finances')).toBe('finances')
    expect(pathToStepId('/calculator')).toBe('calculator')
    expect(pathToStepId('/results')).toBe('results')
    expect(pathToStepId('/projections')).toBe('results')
    expect(pathToStepId('/salary')).toBe('salary')
  })

  it('keeps calculator and results locked until finances are established', () => {
    const locked = flowUnlocks({
      financesComplete: false,
      hasResults: true,
      canAccessSalary: true,
    })

    expect(locked.calculator).toBe(false)
    expect(locked.results).toBe(false)

    const financesOnly = flowUnlocks({
      financesComplete: true,
      hasResults: false,
      canAccessSalary: false,
    })

    expect(financesOnly.calculator).toBe(true)
    expect(financesOnly.results).toBe(false)

    const ready = flowUnlocks({
      financesComplete: true,
      hasResults: true,
      canAccessSalary: false,
    })

    expect(ready.results).toBe(true)
  })

  it('redirects locked steps to the nearest valid step', () => {
    expect(redirectPathForStep('calculator', false)).toBe('/finances')
    expect(redirectPathForStep('calculator', true)).toBe('/calculator')
    expect(redirectPathForStep('results', true)).toBe('/calculator')
  })
})
