import { useEffect, useRef } from 'react'

interface PageHeaderProps {
  phase?: string
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ phase, title, subtitle, actions }: PageHeaderProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [title])

  return (
    <header className="page-header">
      {phase && <p className="profile__phase">{phase}</p>}
      <div className="page-header__row">
        <div>
          <h1 ref={headingRef} tabIndex={-1} className="page-header__title">
            {title}
          </h1>
          {subtitle && <p className="profile__subtitle">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </header>
  )
}
