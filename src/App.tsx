import { TopBar } from './components'
import { navigate, useRoute } from './lib/router'
import { Landing } from './pages/Landing'
import { Templates } from './pages/Templates'
import { HowItWorks } from './pages/HowItWorks'
import { Studio } from './screens/Studio'

export default function App() {
  const route = useRoute()

  if (route === '/studio') {
    // The studio manages its own top bar (action changes per screen).
    return <Studio key="studio" />
  }

  const page = route === '/templates' ? <Templates /> : route === '/how-it-works' ? <HowItWorks /> : <Landing />

  return (
    <>
      <TopBar current={route} action="Open studio" onAction={() => navigate('/studio')} />
      {page}
    </>
  )
}
