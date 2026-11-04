import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardScreen } from '@/features/dashboard/DashboardScreen'
import { FlowGuard } from '@/features/flow/FlowGuard'
import { GoalScreen } from '@/features/goals/GoalScreen'
import { ResultsScreen } from '@/features/goals/ResultsScreen'
import { UserProfileScreen } from '@/features/profile/UserProfileScreen'
import { TakeHomeScreen } from '@/features/salary/TakeHomeScreen'
import { AppShell } from './AppShell'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardScreen />} />
        <Route path="finances" element={<UserProfileScreen />} />
        <Route
          path="calculator"
          element={
            <FlowGuard step="calculator">
              <GoalScreen />
            </FlowGuard>
          }
        />
        <Route
          path="results"
          element={
            <FlowGuard step="results">
              <ResultsScreen />
            </FlowGuard>
          }
        />
        <Route path="projections" element={<Navigate to="/results" replace />} />
        <Route
          path="salary"
          element={
            <FlowGuard step="salary">
              <TakeHomeScreen />
            </FlowGuard>
          }
        />
        <Route path="profile" element={<Navigate to="/finances" replace />} />
        <Route path="goals" element={<Navigate to="/calculator" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
