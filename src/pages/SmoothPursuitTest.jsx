import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Activity } from 'lucide-react'
import styles from './SmoothPursuitTest.module.css'

const TOTAL_LAPS = 12
const LAP_DURATION = 8000 // 8s per lap

export default function SmoothPursuitTest({ navigate, onComplete }) {
  const [phase, setPhase] = useState('intro')
  const [lap, setLap] = useState(0)
  const [dotPos, setDotPos] = useState({ x: 0.5, y: 0.5 })
  const [clicks, setClicks] = useState([]) // {lap, hit, distance}
  const animRef = useRef(null)
  const startTimeRef = useRef(null)
  const canvasRef = useRef(null)

  const getDotPos = (t) => {
    const angle = (t / LAP_DURATION) * 2 * Math.PI
    return {
      x: 0.5 + 0.35 * Math.cos(angle),
      y: 0.5 + 0.35 * Math.sin(angle)
    }
  }

  useEffect(() => {
    if (phase !== 'running') return
    startTimeRef.current = Date.now() - lap * LAP_DURATION

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const currentLap = Math.floor(elapsed / LAP_DURATION)
      if (currentLap >= TOTAL_LAPS) {
        setPhase('done')
        const hits = clicks.filter(c => c.hit).length
        onComplete({ hits, total: clicks.length, accuracy: clicks.length ? Math.round((hits / clicks.length) * 100) : 0 })
        return
      }
      setLap(currentLap + 1)
      const t = elapsed % LAP_DURATION
      setDotPos(getDotPos(t))
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [phase])

  const handleCanvasClick = (e) => {
    if (phase !== 'running') return
    const rect = canvasRef.current.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width
    const cy = (e.clientY - rect.top) / rect.height
    const dx = cx - dotPos.x
    const dy = cy - dotPos.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const hit = dist < 0.06
    setClicks(prev => [...prev, { lap, hit, distance: Math.round(dist * 1000) }])
  }

  const hits = clicks.filter(c => c.hit).length

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('dashboard')}>
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div className={styles.headerCenter}>
          <Activity size={14} color="#00ff88" />
          <span className={styles.testName}>Smooth Pursuit Test</span>
        </div>
        <div className={styles.headerStats}>
          <span className={styles.stat}><span className={styles.statLabel}>LAP</span><span className={styles.statVal}>{lap}/{TOTAL_LAPS}</span></span>
          <span className={styles.stat}><span className={styles.statLabel}>CLICKS</span><span className={styles.statVal} style={{ color: '#00ff88' }}>{hits}/{clicks.length}</span></span>
        </div>
      </div>

      <div className={styles.arena}>
        {phase === 'intro' && (
          <div className={styles.card}>
            <Activity size={32} color="#00ff88" />
            <h2 className={styles.cardTitle}>Smooth Pursuit Test</h2>
            <p className={styles.cardDesc}>Follow the moving dot with your eyes as it travels in a circle. Click on it whenever you can to log your tracking accuracy.</p>
            <p className={styles.cardNote}>12 laps · 8 seconds each</p>
            <button className={styles.startBtn} onClick={() => setPhase('running')}>Begin Test</button>
          </div>
        )}

        {phase === 'running' && (
          <div className={styles.testArea}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${(lap / TOTAL_LAPS) * 100}%`, background: '#00ff88' }} />
            </div>
            <div className={styles.canvas} ref={canvasRef} onClick={handleCanvasClick}>
              <div className={styles.orbitRing} />
              <div
                className={styles.movingDot}
                style={{ left: `${dotPos.x * 100}%`, top: `${dotPos.y * 100}%` }}
              />
              {clicks.slice(-8).map((c, i) => (
                <div key={i} className={c.hit ? styles.hitMark : styles.missMark}
                  style={{ left: `${dotPos.x * 100}%`, top: `${dotPos.y * 100}%`, opacity: (i + 1) / 8 }} />
              ))}
            </div>
            <div className={styles.instruction}>Follow the dot with your eyes and click it to mark your gaze position</div>
          </div>
        )}

        {phase === 'done' && (
          <div className={styles.card}>
            <div className={styles.doneTitle}>Test Complete</div>
            <div className={styles.doneStats}>
              <div className={styles.doneStat}>
                <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#00ff88' }}>{hits}/{clicks.length}</div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-dim)' }}>CLICK HITS</div>
              </div>
              <div className={styles.doneStat}>
                <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#00e5ff' }}>
                  {clicks.length ? Math.round((hits / clicks.length) * 100) : 0}%
                </div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-dim)' }}>ACCURACY</div>
              </div>
            </div>
            <button className={styles.startBtn} onClick={() => navigate('dashboard')}>Back to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  )
}
