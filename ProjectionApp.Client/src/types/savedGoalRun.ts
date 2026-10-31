import type { SavingsGoalResult } from './goal'

export interface SavedGoalRun {
  id: string
  savedAt: string
  result: SavingsGoalResult
  /** Profile version used for this run; omitted on runs saved before versioning. */
  profileVersion?: number
}
