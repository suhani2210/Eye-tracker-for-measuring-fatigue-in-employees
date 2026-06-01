import { useState } from 'react'
import { Eye, Activity, Target, Crosshair, FileText, Wifi, WifiOff, ChevronRight, Clock, CheckCircle2, Circle, Zap } from 'lucide-react'
import styles from './Dashboard.module.css'

const TESTS = [
  {
    id: 'visual-search',
    label: 'Visual Search',
    description: 'Track attention & reaction speed via target acquisition in distractor fields',
    icon: Target,
    duration: '~3 min',
    rounds: 40,
    difficulty: 'MEDIUM',
    color: '#00e5ff',
  },
  {
    id: 'smooth-pursuit',
    label: 'Smooth Pursuit',
    description: 'Follow a moving target to measure ocular motor control and tracking accuracy',
    icon: Activity,
    duration: '~2 min',
    rounds: 12,
    difficulty: 'EASY',
    color: '#00ff88',
  },
  {
    id: 'fixation',
    label: 'Fixation Stability',
    description: 'Maintain gaze on a static point to assess fixation drift under fatigue',
    icon: Crosshair,
    duration: '~2 min',
    rounds: 8,
    difficulty: 'HARD',
    color: '#a855f7',
  },
]

export default function Dashboard({ navigate, sessionData }) {
  const [trackerConnected, setTrackerConnected] = useState(false)
  const [participantId, setParticipantId] = useState(sessionData.participantId || '')
  const [time] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }))

  const completedTests = Object.keys(sessionData.tests || {})

  const testIdMap = {
    'visual-search': 'visualSearch',
    'smooth-pursuit': 'smoothPursuit',
    'fixation': 'fixation'
  }

  const handleStart = (testId) => {
    if (!participantId.trim()) return
    navigate(testId, {
      participantId: participantId.trim(),
      startTime: sessionData.startTime || new Date().toISOString()
    })
  }

  return (
    <div className={styles.root}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Eye size={20} color="#00e5ff" />
          <span>Eye Tracker Research</span>
        </div>

        <div className={styles.sideSection}>
          <div className={styles.sideLabel}>SYSTEM</div>
          <div
            className={styles.trackerBtn}
            onClick={() => setTrackerConnected(p => !p)}
            style={{ borderColor: trackerConnected ? '#00ff88' : '#ff3860' }}
          >
            {trackerConnected
              ? <><Wifi size={13} color="#00ff88" /> <span style={{ color: '#00ff88' }}>TRACKER ONLINE</span></>
              : <><WifiOff size={13} color="#ff3860" /> <span style={{ color: '#ff3860' }}>TRACKER OFFLINE</span></>
            }
          </div>
          <div className={styles.sideHint}>{trackerConnected ? 'Click to disconnect' : 'Click to simulate connect'}</div>
        </div>

        <div className={styles.sideSection}>
          <div className={styles.sideLabel}>PARTICIPANT ID</div>
          <input
            className={styles.pidInput}
            value={participantId}
            onChange={e => setParticipantId(e.target.value)}
            placeholder="e.g. P-042"
            maxLength={12}
          />
        </div>

        <div className={styles.sideSection}>
          <div className={styles.sideLabel}>SESSION</div>
          <div className={styles.sessionStat}>
            <Clock size={11} color="#6b6b8a" />
            <span>{time}</span>
          </div>
          <div className={styles.sessionStat}>
            <CheckCircle2 size={11} color="#00ff88" />
            <span>{completedTests.length} / {TESTS.length} complete</span>
          </div>
        </div>

        <div className={styles.sideBottom}>
          {completedTests.length === TESTS.length && (
            <button className={styles.reportBtn} onClick={() => navigate('report')}>
              <FileText size={13} />
              View Full Report
            </button>
          )}
         
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headline}>Fatigue Levels Measurement</h1>
            <p className={styles.subhead}>Eye-tracking tests for fatigue levels measurement research</p>
          </div>
          
        </header>

        {!participantId.trim() && (
          <div className={styles.warning}>
            ⚠ Enter a Participant ID in the sidebar before starting any test.
          </div>
        )}

        <div className={styles.grid}>
          {TESTS.map(test => {
            const key = testIdMap[test.id]
            const done = completedTests.includes(key)
            const Icon = test.icon
            return (
              <div
                key={test.id}
                className={styles.card}
                style={{ '--card-accent': test.color }}
              >
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon} style={{ background: `${test.color}15`, border: `1px solid ${test.color}40` }}>
                    <Icon size={20} color={test.color} />
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.difficulty} style={{ color: test.color, borderColor: `${test.color}40` }}>
                      {test.difficulty}
                    </span>
                    {done
                      ? <span className={styles.done}><CheckCircle2 size={12} color="#00ff88" /> DONE</span>
                      : <span className={styles.pending}><Circle size={12} color="#3a3a55" /> PENDING</span>
                    }
                  </div>
                </div>

                <h2 className={styles.cardTitle}>{test.label}</h2>
                <p className={styles.cardDesc}>{test.description}</p>

                <div className={styles.cardStats}>
                  <span>{test.duration}</span>
                  <span>{test.rounds} rounds</span>
                </div>

                <button
                  className={styles.startBtn}
                  style={{ '--btn-color': test.color, opacity: participantId.trim() ? 1 : 0.4 }}
                  disabled={!participantId.trim()}
                  onClick={() => handleStart(test.id)}
                >
                  {done ? 'Retake Test' : 'Begin Test'}
                  <ChevronRight size={14} />
                </button>

                <div className={styles.cardGlow} style={{ background: `radial-gradient(ellipse at bottom right, ${test.color}10, transparent 70%)` }} />
              </div>
            )
          })}
        </div>

        <div className={styles.footer}>
          <span>Session ID: {sessionData.startTime ? sessionData.startTime.slice(0,19) : 'Not started'}</span>
        </div>
      </main>
    </div>
  )
}
