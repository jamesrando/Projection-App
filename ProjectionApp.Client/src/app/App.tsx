import { BrowserRouter } from 'react-router-dom'
import '@/app/styles/index.css'
import { AppProviders } from './providers'
import { AppRoutes } from './routes'

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  )
}

export default App
