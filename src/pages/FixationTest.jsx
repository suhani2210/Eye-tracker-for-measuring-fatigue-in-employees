import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Crosshair } from 'lucide-react'
import styles from './FixationTest.module.css'

const TOTAL_ROUNDS = 8
const ROUND_DURATION = 10000 // 10s each
const SAMPLE_RATE = 100 // ms

export default function FixationTest({ navigate, onComplete }) {
  const [phase, setPhase] = useState('intro')
  const [round, setRound] = useState(1)
  const [movements, setMovements] = useState([]) // deviation samples
  const [trail, setTrail] = useState([])
  const canvasRef = useRef(null)
  const timerRef = useRef(null)
  const sampleRef = useRef(null)
  const roundMovements = useRef([])

  const startRound = () => {
    roundMovements.current = []
    setTrail([])
    timerRef.current = setTimeout(() => {
      const avg = roundMovements.current.length
        ? roundMovements.current.reduce((s, v) => s + v, 0) / roundMovements.current.length
        : 0
      setMovements(prev => [...prev, avg])
      if (round >= TOTAL_ROUNDS) {
        setPhase('done')
        const allMovs = [...movements, avg]
        onComplete({ avgDeviation: Math.round(allMovs.reduce((s, v) => s + v, 0) / allMovs.length), rounds: allMovs })
      } else {
        setRound(r => r + 1)
      }
    }, ROUND_DURATION)
  }

  useEffect(() => {
    if (phase !== 'running') return
    startRound()
    return () => { clearTimeout(timerRef.current); clearInterval(sampleRef.current) }
  }, [round, phase])

  const handleMouseMove = (e) => {
    if (phase !== 'running') return
    const rect = canvasRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    roundMovements.current.push(dist)
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setTrail(prev => [...prev.slice(-30), { x, y }])
  }

  const avgDev = movements.length
    ? Math.round(movements.reduce((s, v) => s + v, 0) / movements.length)
    : '--'

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('dashboard')}>
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div className={styles.headerCenter}>
          <Crosshair size={14} color="#a855f7" />
          <span>Fixation Stability Test</span>
        </div>
        <div className={styles.headerStats}>
          <span className={styles.stat}><span className={styles.statLabel}>ROUND</span><span className={styles.statVal}>{round}/{TOTAL_ROUNDS}</span></span>
          <span className={styles.stat}><span className={styles.statLabel}>AVG DEV</span><span className={styles.statVal} style={{ color: '#a855f7' }}>{avgDev}{avgDev !== '--' ? 'px' : ''}</span></span>
        </div>
      </div>

      <div className={styles.arena}>
        {phase === 'intro' && (
          <div className={styles.card}>
            <Crosshair size={32} color="#a855f7" />
            <h2 className={styles.cardTitle}>Fixation Stability Test</h2>
            <p className={styles.cardDesc}>Keep your gaze fixed on the crosshair at the center of the screen. Mouse movements simulate eye drift — try to stay as still as possible.</p>
            <p className={styles.cardNote}>8 rounds · 10 seconds each</p>
            <button className={styles.startBtn} onClick={() => setPhase('running')}>Begin Test</button>
          </div>
        )}

        {phase === 'running' && (
          <div className={styles.testArea}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }} />
            </div>
            <div className={styles.canvas} ref={canvasRef} onMouseMove={handleMouseMove}>
              <div className={styles.crosshair}>
                <div className={styles.crossH} />
                <div className={styles.crossV} />
                <div className={styles.crossDot} />
              </div>
              {trail.map((p, i) => (
                <div key={i} className={styles.trailDot} style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: (i + 1) / trail.length * 0.6 }} />
              ))}
            </div>
            <div className={styles.instruction}>Keep your gaze on the crosshair — minimize all movement</div>
            <div className={styles.roundDots}>
              {movements.map((m, i) => (
                <div key={i} className={styles.roundDot}
                  title={`Round ${i + 1}: ${Math.round(m)}px deviation`}
                  style={{ background: m < 20 ? '#00ff88' : m < 50 ? '#ffd600' : '#ff3860' }} />
              ))}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className={styles.card}>
            <div className={styles.doneTitle}>Test Complete</div>
            <div className={styles.doneStats}>
              <div className={styles.doneStat}>
                <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#a855f7' }}>{avgDev}px</div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-dim)' }}>AVG DEVIATION</div>
              </div>
              <div className={styles.doneStat}>
                <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800, color: avgDev < 20 ? '#00ff88' : avgDev < 50 ? '#ffd600' : '#ff3860' }}>
                  {avgDev < 20 ? 'LOW' : avgDev < 50 ? 'MED' : 'HIGH'}
                </div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-dim)' }}>FATIGUE SIGNAL</div>
              </div>
            </div>
            <button className={styles.startBtn} onClick={() => navigate('dashboard')}>Back to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  )
}
