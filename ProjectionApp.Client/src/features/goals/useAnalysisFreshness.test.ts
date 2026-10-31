import { describe, expect, it } from 'vitest'

function isAnalysisStale(
  profileVersion: number,
  analyzedProfileVersion: number | null,
  hasBaseline: boolean,
): boolean {
  return (
    hasBaseline &&
    (analyzedProfileVersion === null || profileVersion !== analyzedProfileVersion)
  )
}

describe('analysis freshness', () => {
  it('is fresh when profile version matches analyzed version', () => {
    expect(isAnalysisStale(3, 3, true)).toBe(false)
  })

  it('is stale when profile version changed after analysis', () => {
    expect(isAnalysisStale(4, 3, true)).toBe(true)
  })

  it('is stale when baseline lacks a recorded profile version', () => {
    expect(isAnalysisStale(2, null, true)).toBe(true)
  })

  it('is not stale when there is no baseline', () => {
    expect(isAnalysisStale(2, null, false)).toBe(false)
  })
})
