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
import { emptyProfileForm, type ProfileFormState } from '../profile/userProfile'
import type { UserProfile } from '../types/profile'

type ProfileField = keyof ProfileFormState

interface ProfileContextValue {
  profile: ProfileFormState
  loading: boolean
  saving: boolean
  savePending: boolean
  error: string | null
  savedToServer: boolean
  /** Last server-evaluated completeness; only updated after successful GET/PUT */
  isProfileCompleteForGoals: boolean
  profileVersion: number
  updateField: (field: ProfileField, value: number | null) => void
  retryLoad: () => void
  retrySave: () => void
  flushPendingSave: () => Promise<number>
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

function applyServerProfile(
  data: UserProfile,
  setProfile: (profile: ProfileFormState) => void,
  setIsProfileCompleteForGoals: (complete: boolean) => void,
) {
  setProfile(toFormState(data))
  setIsProfileCompleteForGoals(data.hasMinimumGoalInputs)
}

const SAVE_DEBOUNCE_MS = 400

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileFormState>(() => emptyProfileForm())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savePending, setSavePending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedToServer, setSavedToServer] = useState(false)
  const [isProfileCompleteForGoals, setIsProfileCompleteForGoals] = useState(false)
  const [profileVersion, setProfileVersion] = useState(0)

  const profileRef = useRef(profile)
  const profileVersionRef = useRef(0)
  const saveTimerRef = useRef<number | null>(null)
  const pendingSaveRef = useRef<ProfileFormState | null>(null)

  profileRef.current = profile

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getProfile()
      if (data) {
        applyServerProfile(data, setProfile, setIsProfileCompleteForGoals)
        setSavedToServer(true)
      } else {
        setIsProfileCompleteForGoals(false)
        setSavedToServer(false)
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

  const persistProfile = useCallback(async (nextProfile: ProfileFormState): Promise<number> => {
    setSaving(true)
    setError(null)

    try {
      const saved = await saveProfile(nextProfile)
      applyServerProfile(saved, setProfile, setIsProfileCompleteForGoals)
      setSavedToServer(true)
      profileVersionRef.current += 1
      setProfileVersion(profileVersionRef.current)
      return profileVersionRef.current
    } catch (err) {
      setSavedToServer(false)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
      throw err
    } finally {
      setSaving(false)
      setSavePending(false)
      pendingSaveRef.current = null
    }
  }, [])

  const scheduleSave = useCallback(
    (nextProfile: ProfileFormState) => {
      pendingSaveRef.current = nextProfile
      setSavePending(true)

      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current)
      }

      saveTimerRef.current = window.setTimeout(() => {
        void persistProfile(nextProfile)
      }, SAVE_DEBOUNCE_MS)
    },
    [persistProfile],
  )

  const flushPendingSave = useCallback(async (): Promise<number> => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }

    if (pendingSaveRef.current !== null) {
      return persistProfile(pendingSaveRef.current)
    }

    return profileVersionRef.current
  }, [persistProfile])

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
    savePending,
    error,
    savedToServer,
    isProfileCompleteForGoals,
    profileVersion,
    updateField,
    retryLoad: () => void loadProfile(),
    retrySave,
    flushPendingSave,
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
