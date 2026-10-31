export type FlowStepId = 'home' | 'finances' | 'calculator' | 'results' | 'salary'

export interface FlowStep {
  id: FlowStepId
  path: string
  label: string
  stepNumber: number | null
}

export const MAIN_FLOW_STEPS: FlowStep[] = [
  { id: 'finances', path: '/finances', label: 'Your finances', stepNumber: 1 },
  { id: 'calculator', path: '/calculator', label: 'Calculator', stepNumber: 2 },
  { id: 'results', path: '/results', label: 'Your results', stepNumber: 3 },
]

export const OPTIONAL_FLOW_STEPS: FlowStep[] = [
  { id: 'salary', path: '/salary', label: 'Take-home pay', stepNumber: null },
]

export function pathToStepId(pathname: string): FlowStepId {
  if (pathname === '/') {
    return 'home'
  }

  if (pathname.startsWith('/finances') || pathname.startsWith('/profile')) {
    return 'finances'
  }

  if (pathname.startsWith('/calculator') || pathname.startsWith('/goals')) {
    return 'calculator'
  }

  if (pathname.startsWith('/results') || pathname.startsWith('/projections')) {
    return 'results'
  }

  if (pathname.startsWith('/salary')) {
    return 'salary'
  }

  return 'home'
}

export function flowUnlocks(input: {
  financesComplete: boolean
  hasResults: boolean
  canAccessSalary: boolean
}): Record<FlowStepId, boolean> {
  return {
    home: true,
    finances: true,
    calculator: input.financesComplete,
    results: input.financesComplete && input.hasResults,
    salary: input.canAccessSalary,
  }
}

export function redirectPathForStep(step: FlowStepId, financesComplete: boolean): string {
  switch (step) {
    case 'calculator':
      return financesComplete ? '/calculator' : '/finances'
    case 'results':
      return financesComplete ? '/calculator' : '/finances'
    case 'salary':
      return '/finances'
    default:
      return '/'
  }
}
