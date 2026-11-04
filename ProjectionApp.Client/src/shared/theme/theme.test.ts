import { describe, expect, it } from 'vitest'
import { readThemePreference, resolveTheme } from './theme'

describe('theme', () => {
  it('reads a stored preference and falls back to the system', () => {
    expect(readThemePreference('dark')).toBe('dark')
    expect(readThemePreference('light')).toBe('light')
    expect(readThemePreference('system')).toBe('system')
    expect(readThemePreference(null)).toBe('system')
    expect(readThemePreference('blue')).toBe('system')
  })

  it('resolves the system preference only when no explicit theme is stored', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
})
