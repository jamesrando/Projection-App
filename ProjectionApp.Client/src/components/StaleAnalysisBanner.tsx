import { Link } from 'react-router-dom'

interface StaleAnalysisBannerProps {
  className?: string
}

export function StaleAnalysisBanner({ className }: StaleAnalysisBannerProps) {
  return (
    <div
      className={`stale-analysis-banner${className ? ` ${className}` : ''}`}
      role="status"
    >
      <p className="stale-analysis-banner__text">
        Your finances have changed since this calculation. Recalculate to refresh your timeline
        and what-if scenarios.
      </p>
      <Link to="/calculator" className="stale-analysis-banner__action">
        Recalculate
      </Link>
    </div>
  )
}
