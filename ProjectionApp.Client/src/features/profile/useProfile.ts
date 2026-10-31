import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { getProfile, saveProfile } from './api'
import { emptyProfileForm, hasMinimumFinancesInputs, type ProfileFormState } from './model'
import type { UserProfile } from './types'

export const profileQueryKey = ['profile'] as const

type ProfileField = keyof ProfileFormState

export interface ProfileQueryData {
  form: ProfileFormState
  savedToServer: boolean
  isProfileCompleteForGoals: boolean
  profileVersion: number
  savePending: boolean
}

const SAVE_DEBOUNCE_MS = 400

const saveControl = {
  timer: null as number | null,
  pending: null as ProfileFormState | null,
}

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

function emptyProfileData(): ProfileQueryData {
  return {
    form: emptyProfileForm(),
    savedToServer: false,
    isProfileCompleteForGoals: false,
    profileVersion: 0,
    savePending: false,
  }
}

async function loadProfileQuery(): Promise<ProfileQueryData> {
  const data = await getProfile()
  if (!data) {
    return emptyProfileData()
  }

  return {
    form: toFormState(data),
    savedToServer: true,
    isProfileCompleteForGoals: data.hasMinimumGoalInputs,
    profileVersion: 0,
    savePending: false,
  }
}

export function useProfile() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const loaded = await loadProfileQuery()
      const current = queryClient.getQueryData<ProfileQueryData>(profileQueryKey)
      return {
        ...loaded,
        profileVersion: current?.profileVersion ?? loaded.profileVersion,
      }
    },
  })
  const saveMutation = useMutation({
    mutationFn: saveProfile,
  })
  const { mutateAsync: saveProfileAsync } = saveMutation

  const data = query.data ?? emptyProfileData()

  const persistProfile = useCallback(
    async (nextProfile: ProfileFormState): Promise<number> => {
      if (saveControl.timer !== null) {
        window.clearTimeout(saveControl.timer)
        saveControl.timer = null
      }
      saveControl.pending = null

      try {
        const saved = await saveProfileAsync(nextProfile)
        let nextVersion = 0
        queryClient.setQueryData<ProfileQueryData>(profileQueryKey, (current) => {
          nextVersion = (current?.profileVersion ?? 0) + 1
          return {
            form: toFormState(saved),
            savedToServer: true,
            isProfileCompleteForGoals: saved.hasMinimumGoalInputs,
            profileVersion: nextVersion,
            savePending: false,
          }
        })
        return nextVersion
      } catch (err) {
        queryClient.setQueryData<ProfileQueryData>(profileQueryKey, (current) =>
          current ? { ...current, savedToServer: false, savePending: false } : current,
        )
        throw err
      }
    },
    [queryClient, saveProfileAsync],
  )

  const scheduleSave = useCallback(
    (nextProfile: ProfileFormState) => {
      saveControl.pending = nextProfile
      queryClient.setQueryData<ProfileQueryData>(profileQueryKey, (current) => ({
        ...(current ?? emptyProfileData()),
        form: nextProfile,
        savePending: true,
      }))

      if (saveControl.timer !== null) {
        window.clearTimeout(saveControl.timer)
      }

      saveControl.timer = window.setTimeout(() => {
        void persistProfile(nextProfile)
      }, SAVE_DEBOUNCE_MS)
    },
    [persistProfile, queryClient],
  )

  const flushPendingSave = useCallback(async (): Promise<number> => {
    if (saveControl.timer !== null) {
      window.clearTimeout(saveControl.timer)
      saveControl.timer = null
    }

    if (saveControl.pending !== null) {
      return persistProfile(saveControl.pending)
    }

    return queryClient.getQueryData<ProfileQueryData>(profileQueryKey)?.profileVersion ?? 0
  }, [persistProfile, queryClient])

  useEffect(() => {
    return () => {
      if (saveControl.timer !== null) {
        window.clearTimeout(saveControl.timer)
      }
    }
  }, [])

  const updateField = useCallback(
    (field: ProfileField, value: number | null) => {
      const current = queryClient.getQueryData<ProfileQueryData>(profileQueryKey)
      const nextProfile = { ...(current?.form ?? emptyProfileForm()), [field]: value }
      scheduleSave(nextProfile)
    },
    [queryClient, scheduleSave],
  )

  const retrySave = useCallback(() => {
    const pending =
      saveControl.pending ??
      queryClient.getQueryData<ProfileQueryData>(profileQueryKey)?.form ??
      emptyProfileForm()
    void persistProfile(pending)
  }, [persistProfile, queryClient])

  const saveError = saveMutation.error instanceof Error ? saveMutation.error.message : null
  const loadError = query.error instanceof Error ? query.error.message : null

  return {
    profile: data.form,
    loading: query.isLoading,
    saving: saveMutation.isPending,
    savePending: data.savePending,
    error: saveError ?? loadError,
    savedToServer: data.savedToServer,
    isProfileCompleteForGoals: hasMinimumFinancesInputs(data.form),
    profileVersion: data.profileVersion,
    updateField,
    retryLoad: () => void query.refetch(),
    retrySave,
    flushPendingSave,
  }
}
