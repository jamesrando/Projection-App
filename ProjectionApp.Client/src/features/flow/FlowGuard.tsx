import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { redirectPathForStep, type FlowStepId } from './flowSteps'
import { useFlowProgress } from './useFlowProgress'

interface FlowGuardProps {
  step: FlowStepId
  children: ReactNode
}

export function FlowGuard({ step, children }: FlowGuardProps) {
  const { unlocked, financesComplete, profileLoading } = useFlowProgress()
  const canAccess = unlocked[step]

  if (profileLoading) {
    return <p className="app__status">Loading your finances…</p>
  }

  if (!canAccess) {
    return <Navigate to={redirectPathForStep(step, financesComplete)} replace />
  }

  return children
}
