import { useEffect, useState } from 'react'
import { ThemeProvider } from './state/theme'
import { getRoute, onRouteChange } from './router'
import App from './App'
import AdminApp from './admin/AdminApp'

// Decide qual superfície renderizar (cliente vs admin) e mantém o tema compartilhado.
export default function Root() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => onRouteChange(() => setRoute(getRoute())), [])

  return (
    <ThemeProvider>
      {route.name === 'admin' ? <AdminApp /> : <App token={route.token} />}
    </ThemeProvider>
  )
}
