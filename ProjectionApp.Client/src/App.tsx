import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GoalProvider } from './context/GoalContext'
import { ProfileProvider } from './context/ProfileContext'
import { DashboardScreen } from './dashboard/DashboardScreen'
import { GoalScreen } from './goals/GoalScreen'
import { FlowGuard } from './components/FlowGuard'
import { AppShell } from './layout/AppShell'
import { UserProfileScreen } from './profile/UserProfileScreen'
import { ResultsScreen } from './results/ResultsScreen'
import { TakeHomeScreen } from './salary/TakeHomeScreen'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <GoalProvider>
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
        </GoalProvider>
      </ProfileProvider>
    </BrowserRouter>
  )
}

export default App
