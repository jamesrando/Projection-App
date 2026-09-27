import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GoalProvider } from './context/GoalContext'
import { ProfileProvider } from './context/ProfileContext'
import { DashboardScreen } from './dashboard/DashboardScreen'
import { GoalScreen } from './goals/GoalScreen'
import { AppShell } from './layout/AppShell'
import { UserProfileScreen } from './profile/UserProfileScreen'
import { ProjectionsScreen } from './projections/ProjectionsScreen'
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
              <Route path="calculator" element={<GoalScreen />} />
              <Route path="projections" element={<ProjectionsScreen />} />
              <Route path="salary" element={<TakeHomeScreen />} />
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
