import { NavLink, Outlet } from 'react-router-dom'
import { FlowStepper } from '@/features/flow/FlowStepper'

export function AppShell() {
  return (
    <div className="app">
      <header className="app-shell">
        <div className="app-shell__inner">
          <NavLink to="/" className="app-shell__brand">
            <span className="app-shell__logo" aria-hidden="true">
              £
            </span>
            <span className="app-shell__brand-text">
              <span className="app-shell__title">Projection Calculator</span>
              <span className="app-shell__tagline">Guided savings goal calculator</span>
            </span>
          </NavLink>
          <FlowStepper />
        </div>
      </header>
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  )
}
