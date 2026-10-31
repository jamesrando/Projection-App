import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { redirectPathForStep, type FlowStepId } from './flowSteps'
import { useFlowProgress } from './useFlowProgress'

interface FlowGuardProps {
  step: FlowStepId
  children: ReactNode
}

export function FlowGuard({ step, children }: FlowGuardProps) {
  const { unlocked, financesComplete } = useFlowProgress()
  const canAccess = unlocked[step]

  if (!canAccess) {
    return <Navigate to={redirectPathForStep(step, financesComplete)} replace />
  }

  return children
}
