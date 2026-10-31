import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { getProfile, saveProfile } from './api'
import {
  applyInvestmentRollupToForm,
  switchInvestmentsEntryMode,
  type InvestmentHoldingRow,
  type InvestmentsEntryMode,
} from './investmentHoldings'
import {
  emptyProfileForm,
  formStateToSaveRequest,
  hasMinimumFinancesInputs,
  profileToFormState,
  type ProfileFormState,
} from './model'
import {
  mergeProfileFormAfterLoad,
  shouldPreferSubmittedHoldings,
} from './profileFormMerge'
import type { UserProfile } from './types'

export const profileQueryKey = ['profile'] as const

type ProfileField = keyof Pick<
  ProfileFormState,
  | 'annualSalary'
  | 'currentInvestments'
  | 'currentCashSavings'
  | 'investmentInterestRate'
  | 'savingsInterestRate'
  | 'monthlyInvestmentContributions'
>

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
  generation: 0,
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

function formStateAfterSave(saved: UserProfile, submitted: ProfileFormState): ProfileFormState {
  const fromServer = profileToFormState(saved)
  const savedHoldings = fromServer.investmentHoldings

  if (shouldPreferSubmittedHoldings(submitted, savedHoldings)) {
    return {
      ...fromServer,
      investmentsEntryMode: submitted.investmentsEntryMode,
      investmentHoldings: submitted.investmentHoldings,
    }
  }

  return fromServer
}

async function loadProfileQuery(
  cachedForm: ProfileFormState | undefined,
): Promise<ProfileQueryData> {
  const data = await getProfile()
  if (!data) {
    return emptyProfileData()
  }

  const form = mergeProfileFormAfterLoad(profileToFormState(data), cachedForm)

  return {
    form,
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
      const current = queryClient.getQueryData<ProfileQueryData>(profileQueryKey)
      const loaded = await loadProfileQuery(current?.form)
      return {
        ...loaded,
        profileVersion: current?.profileVersion ?? loaded.profileVersion,
        savePending: current?.savePending ?? loaded.savePending,
        form: current?.savePending ? current.form : loaded.form,
      }
    },
    staleTime: Infinity,
    refetchOnMount: false,
  })
  const saveMutation = useMutation({
    mutationFn: (form: ProfileFormState) => saveProfile(formStateToSaveRequest(form)),
  })
  const { mutateAsync: saveProfileAsync } = saveMutation

  const data = query.data ?? emptyProfileData()
  const displayProfile = applyInvestmentRollupToForm(data.form)

  const persistProfile = useCallback(
    async (nextProfile: ProfileFormState, generation: number): Promise<number> => {
      try {
        const saved = await saveProfileAsync(nextProfile)

        if (generation !== saveControl.generation) {
          return queryClient.getQueryData<ProfileQueryData>(profileQueryKey)?.profileVersion ?? 0
        }

        let nextVersion = 0
        queryClient.setQueryData<ProfileQueryData>(profileQueryKey, (current) => {
          nextVersion = (current?.profileVersion ?? 0) + 1
          return {
            form: formStateAfterSave(saved, nextProfile),
            savedToServer: true,
            isProfileCompleteForGoals: saved.hasMinimumGoalInputs,
            profileVersion: nextVersion,
            savePending: false,
          }
        })
        saveControl.pending = null
        return nextVersion
      } catch (err) {
        if (generation === saveControl.generation) {
          queryClient.setQueryData<ProfileQueryData>(profileQueryKey, (current) =>
            current ? { ...current, savedToServer: false, savePending: false } : current,
          )
        }
        throw err
      }
    },
    [queryClient, saveProfileAsync],
  )

  const scheduleSave = useCallback(
    (nextProfile: ProfileFormState) => {
      saveControl.generation += 1
      const generation = saveControl.generation
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
        saveControl.timer = null
        void persistProfile(nextProfile, generation)
      }, SAVE_DEBOUNCE_MS)
    },
    [persistProfile, queryClient],
  )

  const flushPendingSave = useCallback(async (): Promise<number> => {
    if (saveControl.timer !== null) {
      window.clearTimeout(saveControl.timer)
      saveControl.timer = null
    }

    if (saveControl.pending === null) {
      return queryClient.getQueryData<ProfileQueryData>(profileQueryKey)?.profileVersion ?? 0
    }

    saveControl.generation += 1
    const generation = saveControl.generation
    const pending = saveControl.pending
    return persistProfile(pending, generation)
  }, [persistProfile, queryClient])

  useEffect(() => {
    return () => {
      if (saveControl.timer !== null) {
        window.clearTimeout(saveControl.timer)
      }
    }
  }, [])

  const updateForm = useCallback(
    (updater: (form: ProfileFormState) => ProfileFormState) => {
      const current = queryClient.getQueryData<ProfileQueryData>(profileQueryKey)
      const nextProfile = applyInvestmentRollupToForm(
        updater(current?.form ?? emptyProfileForm()),
      )
      scheduleSave(nextProfile)
    },
    [queryClient, scheduleSave],
  )

  const updateField = useCallback(
    (field: ProfileField, value: number | null) => {
      updateForm((form) => {
        if (
          form.investmentsEntryMode === 'breakdown' &&
          (field === 'currentInvestments' ||
            field === 'investmentInterestRate' ||
            field === 'monthlyInvestmentContributions')
        ) {
          return form
        }

        return { ...form, [field]: value }
      })
    },
    [updateForm],
  )

  const setInvestmentsEntryMode = useCallback(
    (mode: InvestmentsEntryMode) => {
      updateForm((form) => switchInvestmentsEntryMode(form, mode))
    },
    [updateForm],
  )

  const updateInvestmentHoldings = useCallback(
    (holdings: InvestmentHoldingRow[]) => {
      updateForm((form) => ({
        ...form,
        investmentsEntryMode: 'breakdown',
        investmentHoldings: holdings,
      }))
    },
    [updateForm],
  )

  const retrySave = useCallback(() => {
    const pending =
      saveControl.pending ??
      queryClient.getQueryData<ProfileQueryData>(profileQueryKey)?.form ??
      emptyProfileForm()

    saveControl.generation += 1
    const generation = saveControl.generation
    void persistProfile(pending, generation)
  }, [persistProfile, queryClient])

  const saveError = saveMutation.error instanceof Error ? saveMutation.error.message : null
  const loadError = query.error instanceof Error ? query.error.message : null

  return {
    profile: displayProfile,
    profileForm: data.form,
    loading: query.isLoading,
    saving: saveMutation.isPending,
    savePending: data.savePending,
    error: saveError ?? loadError,
    savedToServer: data.savedToServer,
    isProfileCompleteForGoals: hasMinimumFinancesInputs(displayProfile),
    profileVersion: data.profileVersion,
    investmentsEntryMode: data.form.investmentsEntryMode,
    investmentHoldings: data.form.investmentHoldings,
    updateField,
    setInvestmentsEntryMode,
    updateInvestmentHoldings,
    retryLoad: () => void query.refetch(),
    retrySave,
    flushPendingSave,
  }
}
