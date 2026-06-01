import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import VisualSearchTest from './pages/VisualSearchTest'
import SmoothPursuitTest from './pages/SmoothPursuitTest'
import FixationTest from './pages/FixationTest'
import SessionReport from './pages/SessionReport'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sessionData, setSessionData] = useState({
    participantId: null,
    startTime: null,
    tests: {}
  })

  const navigate = (page, data) => {
    if (data) setSessionData(prev => ({ ...prev, ...data }))
    setCurrentPage(page)
  }

  const saveTestResult = (testName, result) => {
    setSessionData(prev => ({
      ...prev,
      tests: { ...prev.tests, [testName]: result }
    }))
  }

  const pages = {
    dashboard: <Dashboard navigate={navigate} sessionData={sessionData} />,
    'visual-search': <VisualSearchTest navigate={navigate} onComplete={(r) => { saveTestResult('visualSearch', r); navigate('dashboard') }} />,
    'smooth-pursuit': <SmoothPursuitTest navigate={navigate} onComplete={(r) => { saveTestResult('smoothPursuit', r); navigate('dashboard') }} />,
    'fixation': <FixationTest navigate={navigate} onComplete={(r) => { saveTestResult('fixation', r); navigate('dashboard') }} />,
    'report': <SessionReport navigate={navigate} sessionData={sessionData} />
  }

  return (
    <>
      <div className="scanline" />
      {pages[currentPage] || pages['dashboard']}
    </>
  )
}
