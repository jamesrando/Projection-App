import { useState } from 'react'
import { GoalScreen } from './goals/GoalScreen'
import { UserProfileScreen } from './profile/UserProfileScreen'
import './App.css'

type AppPhase = 'profile' | 'goal'

function App() {
  const [phase, setPhase] = useState<AppPhase>('profile')

  return (
    <div className="app">
      <main className="app__main">
        {phase === 'profile' ? (
          <UserProfileScreen onContinue={() => setPhase('goal')} />
        ) : (
          <GoalScreen onBack={() => setPhase('profile')} />
        )}
      </main>
    </div>
  )
}

export default App
