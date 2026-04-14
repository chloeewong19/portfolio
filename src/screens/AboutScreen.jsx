import Creature from '../components/Creature'

function StatBar({ label, pct, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 4,
          color: '#b07080',
          width: 44,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: 60,
          height: 5,
          background: '#fdf0f4',
          border: '1px solid #e8c0cc',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color || '#f4afc0',
          }}
        />
      </div>
    </div>
  )
}

function Badge({ label }) {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        background: '#fdf0f4',
        border: '1px solid #e8c0cc',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 3,
          color: '#8b3a52',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default function AboutScreen({ navigate, stats, setCreatureAnim }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        gap: 8,
        padding: 10,
        overflow: 'hidden',
      }}
    >
      {/* Left: Creature */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          paddingTop: 16,
        }}
      >
        <Creature animState="study" scale={1} />
      </div>

      {/* Right: Stat sheet */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 6,
            color: '#8b3a52',
            letterSpacing: '0.02em',
          }}
        >
          CHLOE WONG
        </div>

        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 5,
            color: '#b07080',
          }}
        >
          LVL 2 DESIGNER
        </div>

        {/* XP bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 4,
              color: '#b07080',
            }}
          >
            XP
          </span>
          <div
            style={{
              width: 100,
              height: 6,
              background: '#fdf0f4',
              border: '1px solid #c47a8a',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '60%',
                height: '100%',
                background: '#f4afc0',
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: 4 }}>
          <StatBar label="DESIGN" pct={80} color="#f4afc0" />
          <StatBar label="ENGNR" pct={70} color="#f9d4de" />
          <StatBar label="RSCH" pct={65} color="#e8c8d8" />
          <StatBar label="ACCESS" pct={90} color="#f4afc0" />
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Badge label="JC" />
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 3, color: '#b07080' }}>JumboCode</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Badge label="T" />
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 3, color: '#b07080' }}>Tufts</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Badge label="HK" />
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 3, color: '#b07080' }}>HK</span>
          </div>
        </div>
      </div>
    </div>
  )
}
