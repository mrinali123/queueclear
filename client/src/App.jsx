import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState('loading...')

  useEffect(() => {
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Health check failed')
        }
        return response.json()
      })
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('server not reachable'))
  }, [])

  return (
    <main>
      <h1>QueueClear</h1>
      <p>Server status: {status}</p>
    </main>
  )
}

export default App
