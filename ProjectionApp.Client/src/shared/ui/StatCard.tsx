interface StatCardProps {
  label: string
  value: string
  tone?: 'default' | 'accent' | 'money'
}

export function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  return (
    <div className={`goal-stat goal-stat--${tone}`}>
      <span className="goal-stat__label">{label}</span>
      <span className="goal-stat__value">{value}</span>
    </div>
  )
}
