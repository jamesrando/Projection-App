import { describe, expect, it } from 'vitest'
import { pathToStepId, redirectPathForStep } from './flowSteps'

describe('flowSteps', () => {
  it('maps routes to step ids', () => {
    expect(pathToStepId('/')).toBe('home')
    expect(pathToStepId('/finances')).toBe('finances')
    expect(pathToStepId('/calculator')).toBe('calculator')
    expect(pathToStepId('/projections')).toBe('results')
    expect(pathToStepId('/salary')).toBe('salary')
  })

  it('redirects locked steps to the nearest valid step', () => {
    expect(redirectPathForStep('calculator', false)).toBe('/finances')
    expect(redirectPathForStep('calculator', true)).toBe('/calculator')
    expect(redirectPathForStep('results', true)).toBe('/calculator')
  })
})
