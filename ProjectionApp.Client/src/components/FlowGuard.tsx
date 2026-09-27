import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { redirectPathForStep, type FlowStepId } from '../flow/flowSteps'
import { useFlowProgress } from '../hooks/useFlowProgress'

interface FlowGuardProps {
  step: FlowStepId
  children: ReactNode
}

export function FlowGuard({ step, children }: FlowGuardProps) {
  const navigate = useNavigate()
  const { unlocked, financesComplete } = useFlowProgress()
  const canAccess = unlocked[step]

  useEffect(() => {
    if (!canAccess) {
      navigate(redirectPathForStep(step, financesComplete), { replace: true })
    }
  }, [canAccess, financesComplete, navigate, step])

  if (!canAccess) {
    return null
  }

  return children
}
