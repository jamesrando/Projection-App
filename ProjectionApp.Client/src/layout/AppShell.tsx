import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/finances', label: 'Your finances' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/salary', label: 'Take-home pay' },
  { to: '/projections', label: 'Saved' },
]

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
              <span className="app-shell__tagline">Quick financial projections</span>
            </span>
          </NavLink>
          <nav className="app-shell__nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `app-shell__link${isActive ? ' app-shell__link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  )
}
