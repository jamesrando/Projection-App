import { useEffect, useState } from 'react'
import { getProjections } from './api/projections'
import type { ProjectionSummary } from './types/projection'
import './App.css'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

function ProjectionCard({ projection }: { projection: ProjectionSummary }) {
  const netClass =
    projection.net >= 0 ? 'projection-card__net--positive' : 'projection-card__net--negative'

  return (
    <article className="projection-card">
      <header className="projection-card__header">
        <h2>{projection.name}</h2>
        <p className="projection-card__period">
          {formatDate(projection.startDate)} – {formatDate(projection.endDate)}
        </p>
      </header>

      <dl className="projection-card__metrics">
        <div>
          <dt>Income</dt>
          <dd className="projection-card__income">{currency.format(projection.totalIncome)}</dd>
        </div>
        <div>
          <dt>Expenses</dt>
          <dd className="projection-card__expense">{currency.format(projection.totalExpenses)}</dd>
        </div>
        <div>
          <dt>Net</dt>
          <dd className={`projection-card__net ${netClass}`}>{currency.format(projection.net)}</dd>
        </div>
      </dl>
    </article>
  )
}

function App() {
  const [projections, setProjections] = useState<ProjectionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProjections() {
      try {
        const data = await getProjections()
        if (!cancelled) {
          setProjections(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load projections')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProjections()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="app__eyebrow">Projection App</p>
          <h1>Financial Projections</h1>
          <p className="app__subtitle">Forecast income, expenses, and net position.</p>
        </div>
      </header>

      <main className="app__main">
        {loading && <p className="app__status">Loading projections…</p>}

        {error && (
          <div className="app__error" role="alert">
            <strong>Unable to load projections</strong>
            <p>{error}</p>
            <p className="app__hint">Make sure the API is running on http://localhost:5171.</p>
          </div>
        )}

        {!loading && !error && projections.length === 0 && (
          <p className="app__status">No projections found.</p>
        )}

        {!loading && !error && projections.length > 0 && (
          <section className="projection-grid" aria-label="Projection summaries">
            {projections.map((projection) => (
              <ProjectionCard key={projection.id} projection={projection} />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
