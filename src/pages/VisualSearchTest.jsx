import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Eye } from 'lucide-react'
import styles from './VisualSearchTest.module.css'

const TOTAL_ROUNDS = 40
const STAGE1_DURATION = 2000
const STAGE2_DURATION = 2000
const STAGE3_DURATION = 1000
const FEEDBACK_DURATION = 600

// Base 6 distractor positions (on a circle around center)
const BASE_POSITIONS = Array.from({ length: 6 }, (_, i) => {
  const angle = (i * 60 - 90) * (Math.PI / 180)
  return { x: Math.cos(angle) * 36, y: Math.sin(angle) * 36 }
})

// Extra distractor positions for hard rounds (last 4 of every 8)
const EXTRA_POSITIONS = Array.from({ length: 6 }, (_, i) => {
  const angle = (i * 60 - 60) * (Math.PI / 180)
  return { x: Math.cos(angle) * 62, y: Math.sin(angle) * 62 }
})

function isHardRound(round) {
  // Last 4 of every 8 rounds: rounds 5–8, 13–16, 21–24, 29–32, 37–40
  return round % 8 > 4
}

export default function VisualSearchTest({ navigate, onComplete }) {
  const [phase, setPhase] = useState('intro') // intro | running | done
  const [round, setRound] = useState(1)
  const [stage, setStage] = useState(1) // 1 | 2 | 3
  const [targetIndex, setTargetIndex] = useState(0)
  const [gazed, setGazed] = useState(false)
  const [result, setResult] = useState(null) // 'hit' | 'miss'
  const [results, setResults] = useState([]) // per-round results
  const [stageTimer, setStageTimer] = useState(0)
  const timerRef = useRef(null)
  const stageStartRef = useRef(null)

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current) }

  const advanceRound = useCallback((roundResults) => {
    if (round >= TOTAL_ROUNDS) {
      const allResults = [...results, ...roundResults]
      setResults(allResults)
      setPhase('done')
      const hits = allResults.filter(r => r.hit).length
      const avgRT = allResults.filter(r => r.rt !== null).reduce((s, r) => s + r.rt, 0) / (allResults.filter(r => r.rt !== null).length || 1)
      onComplete({ hits, total: TOTAL_ROUNDS, avgRT: Math.round(avgRT), results: allResults })
      return
    }
    setRound(r => r + 1)
    setStage(1)
    setGazed(false)
    setResult(null)
    stageStartRef.current = Date.now()
  }, [round, results, onComplete])

  const startRound = useCallback(() => {
    setStage(1)
    setGazed(false)
    setResult(null)
    const tIdx = Math.floor(Math.random() * 6)
    setTargetIndex(tIdx)
    stageStartRef.current = Date.now()
    clearTimer()
    timerRef.current = setTimeout(() => setStage(2), STAGE1_DURATION)
  }, [])

  useEffect(() => {
    if (phase !== 'running') return
    if (stage === 2) {
      clearTimer()
      timerRef.current = setTimeout(() => setStage(3), STAGE2_DURATION)
    }
    if (stage === 3) {
      stageStartRef.current = Date.now()
      clearTimer()
      timerRef.current = setTimeout(() => {
        // Miss
        setResult('miss')
        const roundResult = { round, hit: false, rt: null, hard: isHardRound(round) }
        setResults(prev => {
          const updated = [...prev, roundResult]
          timerRef.current = setTimeout(() => advanceRound([roundResult]), FEEDBACK_DURATION)
          return updated
        })
      }, STAGE3_DURATION)
    }
  }, [stage, phase, round, advanceRound])

  useEffect(() => {
    if (phase !== 'running') return
    startRound()
    return clearTimer
  }, [round, phase])

  const handleTargetClick = () => {
    if (stage !== 3 || gazed || result) return
    const rt = Date.now() - stageStartRef.current
    setGazed(true)
    setResult('hit')
    clearTimer()
    const roundResult = { round, hit: true, rt, hard: isHardRound(round) }
    setResults(prev => {
      const updated = [...prev, roundResult]
      timerRef.current = setTimeout(() => advanceRound([roundResult]), FEEDBACK_DURATION)
      return updated
    })
  }

  // Countdown display
  useEffect(() => {
    if (phase !== 'running') return
    const iv = setInterval(() => {
      if (stageStartRef.current) {
        const dur = stage === 1 ? STAGE1_DURATION : stage === 2 ? STAGE2_DURATION : STAGE3_DURATION
        setStageTimer(Math.max(0, dur - (Date.now() - stageStartRef.current)))
      }
    }, 50)
    return () => clearInterval(iv)
  }, [stage, phase])

  const hits = results.filter(r => r.hit).length
  const avgRT = results.filter(r => r.rt).length
    ? Math.round(results.filter(r => r.rt).reduce((s, r) => s + r.rt, 0) / results.filter(r => r.rt).length)
    : '--'

  const positions = isHardRound(round) ? [...BASE_POSITIONS, ...EXTRA_POSITIONS] : BASE_POSITIONS

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('dashboard')}>
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div className={styles.headerCenter}>
          <Eye size={14} color="#00e5ff" />
          <span className={styles.testName}>Visual Search Test</span>
        </div>
        <div className={styles.headerStats}>
          <span className={styles.stat}>
            <span className={styles.statLabel}>ROUND</span>
            <span className={styles.statVal}>{phase === 'running' ? round : '—'}/{TOTAL_ROUNDS}</span>
          </span>
          <span className={styles.stat}>
            <span className={styles.statLabel}>HITS</span>
            <span className={styles.statVal} style={{ color: '#00ff88' }}>{hits}</span>
          </span>
          <span className={styles.stat}>
            <span className={styles.statLabel}>AVG RT</span>
            <span className={styles.statVal} style={{ color: '#ffd600' }}>{avgRT}{avgRT !== '--' ? 'ms' : ''}</span>
          </span>
        </div>
      </div>

      {/* Main area */}
      <div className={styles.arena}>
        {phase === 'intro' && (
          <div className={styles.introCard}>
            <div className={styles.introIcon}><Eye size={32} color="#00e5ff" /></div>
            <h2 className={styles.introTitle}>Visual Search Test</h2>
            <div className={styles.introSteps}>
              <div className={styles.introStep}>
                <span className={styles.stepNum}>1</span>
                <span>Fix your gaze on the central yellow dot (2s)</span>
              </div>
              <div className={styles.introStep}>
                <span className={styles.stepNum}>2</span>
                <span>Six red circles appear — keep watching the center (2s)</span>
              </div>
              <div className={styles.introStep}>
                <span className={styles.stepNum}>3</span>
                <span>One circle turns grey — click it within 1 second</span>
              </div>
            </div>
            <p className={styles.introNote}>
              In rounds 5–8, 13–16, 21–24, 29–32, and 37–40, extra distractor circles appear.
            </p>
            <button className={styles.startBtn} onClick={() => setPhase('running')}>
              Begin — 40 Rounds
            </button>
          </div>
        )}

        {phase === 'running' && (
          <div className={styles.testArea}>
            {/* Progress bar */}
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }} />
            </div>

            {/* Stage indicator */}
            <div className={styles.stageRow}>
              {[1, 2, 3].map(s => (
                <div key={s} className={`${styles.stageChip} ${stage === s ? styles.stageActive : stage > s ? styles.stageDone : ''}`}>
                  Stage {s}
                </div>
              ))}
              {isHardRound(round) && <div className={styles.hardBadge}>+ DISTRACTORS</div>}
            </div>

            {/* Canvas */}
            <div className={styles.canvas}>
              <div className={styles.canvasInner}>
                {/* Stage 1 & 2: center dot */}
                {(stage === 1 || stage === 2) && (
                  <div className={styles.centerDot} />
                )}

                {/* Stage 3: center dot (smaller) + target */}
                {stage === 3 && (
                  <div className={styles.centerDotSmall} />
                )}

                {/* Red circles appear in stage 2 and 3 */}
                {(stage === 2 || stage === 3) && positions.map((pos, i) => {
                  const isTarget = stage === 3 && i === targetIndex
                  return (
                    <div
                      key={i}
                      className={`${styles.circle} ${isTarget ? styles.target : ''} ${result === 'hit' && isTarget ? styles.hitCircle : ''} ${result === 'miss' && isTarget ? styles.missTarget : ''}`}
                      style={{
                        transform: `translate(${pos.x * 3.5}px, ${pos.y * 3.5}px)`,
                      }}
                      onClick={isTarget ? handleTargetClick : undefined}
                    />
                  )
                })}

                {/* Feedback overlay */}
                {result === 'hit' && (
                  <div className={styles.feedbackHit}>✓</div>
                )}
                {result === 'miss' && (
                  <div className={styles.feedbackMiss}>✗</div>
                )}
              </div>
            </div>

            {/* Timer bar */}
            <div className={styles.timerRow}>
              <div className={styles.timerLabel}>
                {stage === 1 && 'Fixate on center dot'}
                {stage === 2 && 'Red circles appearing — keep fixating center'}
                {stage === 3 && 'Find and click the grey target!'}
              </div>
              <div className={styles.timerBar}>
                <div
                  className={styles.timerFill}
                  style={{
                    width: `${(stageTimer / (stage === 1 ? STAGE1_DURATION : stage === 2 ? STAGE2_DURATION : STAGE3_DURATION)) * 100}%`,
                    background: stage === 3 ? '#ff3860' : '#00e5ff'
                  }}
                />
              </div>
            </div>

            {/* Round history mini dots */}
            <div className={styles.history}>
              {results.map((r, i) => (
                <div
                  key={i}
                  className={styles.histDot}
                  title={`Round ${r.round}: ${r.hit ? `Hit in ${r.rt}ms` : 'Miss'}`}
                  style={{ background: r.hit ? '#00ff88' : '#ff3860', opacity: r.hard ? 1 : 0.6 }}
                />
              ))}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className={styles.doneCard}>
            <div className={styles.doneTitle}>Test Complete</div>
            <div className={styles.doneStats}>
              <div className={styles.doneStat}>
                <div className={styles.doneStatVal} style={{ color: '#00ff88' }}>{hits}/{TOTAL_ROUNDS}</div>
                <div className={styles.doneStatLabel}>Targets Hit</div>
              </div>
              <div className={styles.doneStat}>
                <div className={styles.doneStatVal} style={{ color: '#ffd600' }}>{avgRT}ms</div>
                <div className={styles.doneStatLabel}>Avg Reaction Time</div>
              </div>
              <div className={styles.doneStat}>
                <div className={styles.doneStatVal} style={{ color: '#00e5ff' }}>{Math.round((hits / TOTAL_ROUNDS) * 100)}%</div>
                <div className={styles.doneStatLabel}>Accuracy</div>
              </div>
            </div>
            <button className={styles.startBtn} onClick={() => navigate('dashboard')}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
