import { ArrowLeft, FileText, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import styles from './SessionReport.module.css'

export default function SessionReport({ navigate, sessionData }) {
  const vs = sessionData.tests?.visualSearch
  const sp = sessionData.tests?.smoothPursuit
  const fx = sessionData.tests?.fixation

  const fatigueScore = () => {
    let score = 0, count = 0
    if (vs) { score += (1 - vs.hits / vs.total) * 100; count++ }
    if (sp) { score += (1 - sp.accuracy / 100) * 100; count++ }
    if (fx) { score += Math.min(100, fx.avgDeviation); count++ }
    return count ? Math.round(score / count) : null
  }

  const fs = fatigueScore()
  const fatigueLevel = fs === null ? null : fs < 25 ? 'LOW' : fs < 55 ? 'MODERATE' : 'HIGH'
  const fatigueCo = fs === null ? '#6b6b8a' : fs < 25 ? '#00ff88' : fs < 55 ? '#ffd600' : '#ff3860'

  const FIcon = fatigueLevel === 'LOW' ? TrendingUp : fatigueLevel === 'HIGH' ? TrendingDown : Minus

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('dashboard')}>
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div className={styles.headerCenter}>
          <FileText size={14} color="#ffd600" />
          <span>Session Report</span>
        </div>
        <div className={styles.pid}>ID: {sessionData.participantId || '—'}</div>
      </div>

      <div className={styles.content}>
        {/* Fatigue summary */}
        <div className={styles.fatigueBanner} style={{ borderColor: `${fatigueCo}40`, background: `${fatigueCo}08` }}>
          <FIcon size={24} color={fatigueCo} />
          <div>
            <div className={styles.fatigueLabel}>Estimated Fatigue Level</div>
            <div className={styles.fatigueVal} style={{ color: fatigueCo }}>{fatigueLevel || 'INCOMPLETE'}</div>
          </div>
          <div className={styles.fatigueScore} style={{ color: fatigueCo }}>{fs !== null ? `${fs}/100` : '—'}</div>
        </div>

        <div className={styles.grid}>
          {/* Visual Search */}
          <div className={styles.card}>
            <div className={styles.cardHeader} style={{ borderColor: '#00e5ff40' }}>
              <span style={{ color: '#00e5ff' }}>Visual Search</span>
              {vs ? <span className={styles.badge} style={{ color: '#00ff88' }}>COMPLETE</span> : <span className={styles.badge}>NOT TAKEN</span>}
            </div>
            {vs ? (
              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricVal} style={{ color: '#00e5ff' }}>{vs.hits}/{vs.total}</span>
                  <span className={styles.metricLabel}>TARGETS HIT</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricVal} style={{ color: '#ffd600' }}>{vs.avgRT}ms</span>
                  <span className={styles.metricLabel}>AVG REACTION TIME</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricVal}>{Math.round((vs.hits / vs.total) * 100)}%</span>
                  <span className={styles.metricLabel}>ACCURACY</span>
                </div>
                <div className={styles.miniHistory}>
                  {vs.results?.map((r, i) => (
                    <div key={i} title={r.hit ? `${r.rt}ms` : 'Miss'}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: r.hit ? '#00ff88' : '#ff3860', opacity: r.hard ? 1 : 0.5, flexShrink: 0 }} />
                  ))}
                </div>
              </div>
            ) : <div className={styles.empty}>Test not completed</div>}
          </div>

          {/* Smooth Pursuit */}
          <div className={styles.card}>
            <div className={styles.cardHeader} style={{ borderColor: '#00ff8840' }}>
              <span style={{ color: '#00ff88' }}>Smooth Pursuit</span>
              {sp ? <span className={styles.badge} style={{ color: '#00ff88' }}>COMPLETE</span> : <span className={styles.badge}>NOT TAKEN</span>}
            </div>
            {sp ? (
              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricVal} style={{ color: '#00ff88' }}>{sp.hits}/{sp.total}</span>
                  <span className={styles.metricLabel}>CLICK HITS</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricVal} style={{ color: '#00e5ff' }}>{sp.accuracy}%</span>
                  <span className={styles.metricLabel}>TRACKING ACCURACY</span>
                </div>
              </div>
            ) : <div className={styles.empty}>Test not completed</div>}
          </div>

          {/* Fixation */}
          <div className={styles.card}>
            <div className={styles.cardHeader} style={{ borderColor: '#a855f740' }}>
              <span style={{ color: '#a855f7' }}>Fixation Stability</span>
              {fx ? <span className={styles.badge} style={{ color: '#00ff88' }}>COMPLETE</span> : <span className={styles.badge}>NOT TAKEN</span>}
            </div>
            {fx ? (
              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricVal} style={{ color: '#a855f7' }}>{fx.avgDeviation}px</span>
                  <span className={styles.metricLabel}>AVG DEVIATION</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricVal} style={{ color: fx.avgDeviation < 20 ? '#00ff88' : fx.avgDeviation < 50 ? '#ffd600' : '#ff3860' }}>
                    {fx.avgDeviation < 20 ? 'STABLE' : fx.avgDeviation < 50 ? 'MODERATE' : 'UNSTABLE'}
                  </span>
                  <span className={styles.metricLabel}>FIXATION QUALITY</span>
                </div>
                <div className={styles.roundBar}>
                  {fx.rounds?.map((m, i) => (
                    <div key={i} style={{ flex: 1, height: Math.min(40, m / 2), background: m < 20 ? '#00ff88' : m < 50 ? '#ffd600' : '#ff3860', borderRadius: 2, alignSelf: 'flex-end' }} />
                  ))}
                </div>
              </div>
            ) : <div className={styles.empty}>Test not completed</div>}
          </div>
        </div>

        <div className={styles.footer}>
          <span>Report generated: {new Date().toLocaleString()} · Participant: {sessionData.participantId || '—'}</span>
          <button className={styles.exportBtn} onClick={() => {
            const data = JSON.stringify(sessionData, null, 2)
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `eyelab-session-${sessionData.participantId || 'unknown'}.json`; a.click()
          }}>Export JSON</button>
        </div>
      </div>
    </div>
  )
}
