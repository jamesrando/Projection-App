interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  if (lines === 1) {
    return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />
  }

  return (
    <div className={`skeleton-group ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <div key={index} className="skeleton" />
      ))}
    </div>
  )
}
