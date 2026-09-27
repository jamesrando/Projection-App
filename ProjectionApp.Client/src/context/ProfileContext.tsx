import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { getProfile, saveProfile } from '../api/profile'
import {
  emptyProfileForm,
  hasAnyBalance,
  type ProfileFormState,
} from '../profile/userProfile'
import type { UserProfile } from '../types/profile'

type ProfileField = keyof ProfileFormState

interface ProfileContextValue {
  profile: ProfileFormState
  loading: boolean
  saving: boolean
  error: string | null
  savedToServer: boolean
  profileVersion: number
  hasBalance: boolean
  updateField: (field: ProfileField, value: number | null) => void
  retryLoad: () => void
  retrySave: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

function toFormState(profile: UserProfile): ProfileFormState {
  return {
    annualSalary: profile.annualSalary,
    currentInvestments: profile.currentInvestments,
    currentCashSavings: profile.currentCashSavings,
    investmentInterestRate: profile.investmentInterestRate,
    savingsInterestRate: profile.savingsInterestRate,
    monthlyInvestmentContributions: profile.monthlyInvestmentContributions,
  }
}

const SAVE_DEBOUNCE_MS = 400

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileFormState>(() => emptyProfileForm())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedToServer, setSavedToServer] = useState(false)
  const [profileVersion, setProfileVersion] = useState(0)

  const profileRef = useRef(profile)
  const saveTimerRef = useRef<number | null>(null)
  const pendingSaveRef = useRef<ProfileFormState | null>(null)

  profileRef.current = profile

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getProfile()
      if (data) {
        setProfile(toFormState(data))
        setSavedToServer(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const persistProfile = useCallback(async (nextProfile: ProfileFormState) => {
    setSaving(true)
    setError(null)

    try {
      await saveProfile(nextProfile)
      setSavedToServer(true)
      setProfileVersion((version) => version + 1)
    } catch (err) {
      setSavedToServer(false)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
      pendingSaveRef.current = null
    }
  }, [])

  const scheduleSave = useCallback(
    (nextProfile: ProfileFormState) => {
      pendingSaveRef.current = nextProfile

      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current)
      }

      saveTimerRef.current = window.setTimeout(() => {
        void persistProfile(nextProfile)
      }, SAVE_DEBOUNCE_MS)
    },
    [persistProfile],
  )

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  const updateField = useCallback(
    (field: ProfileField, value: number | null) => {
      const nextProfile = { ...profileRef.current, [field]: value }
      setProfile(nextProfile)
      scheduleSave(nextProfile)
    },
    [scheduleSave],
  )

  const retrySave = useCallback(() => {
    const pending = pendingSaveRef.current ?? profileRef.current
    void persistProfile(pending)
  }, [persistProfile])

  const value: ProfileContextValue = {
    profile,
    loading,
    saving,
    error,
    savedToServer,
    profileVersion,
    hasBalance: hasAnyBalance(profile),
    updateField,
    retryLoad: () => void loadProfile(),
    retrySave,
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider')
  }

  return context
}
