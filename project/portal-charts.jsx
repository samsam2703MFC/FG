/* global React */
// L'Atelier Investor Portal — chart primitives (SVG, no external lib)
// Renders bar / line / area / donut / sparkline using brand colors.
// Style switches based on `kind` prop or global tweak.

const { useMemo } = React;

// ---------- Sparkline -----------------------------------------------------
function Sparkline({ data, color, fill = true, height = 36, strokeWidth = 1.6 }) {
  const w = 120, h = height, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {fill && (
        <path d={`${d} L${last[0]},${h} L${pts[0][0]},${h} Z`} fill={color} opacity="0.10" />
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill={color} />
    </svg>
  );
}

// ---------- Time-series chart (line / bar / area) ------------------------
function TimeChart({ series, labels, kind = 'line', height = 260, showAxes = true }) {
  // series: [{ name, color, data, dashed?: bool, fill?: bool }, ...]
  const w = 800, h = height;
  const padL = 44, padR = 16, padT = 12, padB = 28;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const all = series.flatMap(s => s.data);
  const min = Math.min(0, ...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const xStep = innerW / (labels.length - 1);
  const yFor = v => padT + (1 - (v - min) / range) * innerH;
  // 4 grid lines
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map(t => min + t * range);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      {/* grid + y labels */}
      {showAxes && gridVals.map((v, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={yFor(v)} y2={yFor(v)} stroke="rgba(34,34,34,0.06)" strokeWidth="1" />
          <text x={padL - 8} y={yFor(v) + 4} fontSize="10" textAnchor="end" fill="#9b9690" fontFamily="Gotham, sans-serif">
            {Math.round(v / 1000)}k
          </text>
        </g>
      ))}
      {/* x labels */}
      {showAxes && labels.map((l, i) => (
        <text key={i} x={padL + i * xStep} y={h - 8} fontSize="10" textAnchor="middle" fill="#9b9690" fontFamily="Gotham, sans-serif">
          {l}
        </text>
      ))}
      {/* series */}
      {kind === 'bar' ? (
        // Grouped bars: each label has N bars side by side
        labels.map((_, li) => {
          const groupW = xStep * 0.7;
          const barW = groupW / series.length;
          return series.map((s, si) => {
            const v = s.data[li];
            const y0 = yFor(0);
            const y1 = yFor(v);
            const x = padL + li * xStep - groupW / 2 + si * barW;
            return (
              <rect key={`${li}-${si}`} x={x} y={Math.min(y0, y1)} width={barW - 2}
                height={Math.abs(y0 - y1)} fill={s.color} rx="2" />
            );
          });
        })
      ) : (
        series.map((s, si) => {
          const pts = s.data.map((v, i) => [padL + i * xStep, yFor(v)]);
          const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
          return (
            <g key={si}>
              {(kind === 'area' || s.fill) && (
                <path d={`${d} L${pts[pts.length - 1][0]},${yFor(min)} L${pts[0][0]},${yFor(min)} Z`}
                  fill={s.color} opacity="0.12" />
              )}
              <path d={d} fill="none" stroke={s.color} strokeWidth={s.dashed ? 1.5 : 2}
                strokeDasharray={s.dashed ? '4 3' : 'none'}
                strokeLinecap="round" strokeLinejoin="round" />
              {!s.dashed && pts.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill={s.color} />
              ))}
            </g>
          );
        })
      )}
    </svg>
  );
}

// ---------- Donut --------------------------------------------------------
function Donut({ segments, size = 160, label, sub }) {
  const cx = size / 2, cy = size / 2, r = size * 0.42, rIn = size * 0.32;
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  let acc = 0;
  const arcs = segments.map((s) => {
    const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += s.value;
    const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    const xi0 = cx + Math.cos(a0) * rIn, yi0 = cy + Math.sin(a0) * rIn;
    const xi1 = cx + Math.cos(a1) * rIn, yi1 = cy + Math.sin(a1) * rIn;
    const d = [
      `M${x0},${y0}`,
      `A${r},${r} 0 ${large} 1 ${x1},${y1}`,
      `L${xi1},${yi1}`,
      `A${rIn},${rIn} 0 ${large} 0 ${xi0},${yi0}`,
      'Z'
    ].join(' ');
    return { d, color: s.color, name: s.name, value: s.value };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, flex: '0 0 auto' }}>
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
        {label && (
          <g>
            <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="Vank, Gotham, serif" fontSize="22" fill="#222">
              {label}
            </text>
            {sub && <text x={cx} y={cy + 16} textAnchor="middle" fontFamily="Gotham, sans-serif" fontSize="10" fill="#9b9690"
              letterSpacing="0.1em" style={{ textTransform: 'uppercase' }}>{sub}</text>}
          </g>
        )}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Gotham, sans-serif', fontSize: 12, flex: 1, minWidth: 0 }}>
        {arcs.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: a.color, flex: '0 0 auto' }}></span>
              <span style={{ color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
            </span>
            <span style={{ fontFamily: 'Vank, Gotham, serif', color: '#222', fontSize: 14 }}>{Math.round(a.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Stacked horizontal bars (cost structure) --------------------
function StackedBar({ rows, height = 14 }) {
  // rows: [{ label, segments: [{value, color, name}] }]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {rows.map((row, ri) => {
        const total = row.segments.reduce((a, b) => a + b.value, 0);
        return (
          <div key={ri}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: '#222' }}>{row.label}</span>
              <span style={{ fontFamily: 'Vank, Gotham, serif', fontSize: 14, color: '#222' }}>
                {row.totalLabel || total.toFixed(0)}
              </span>
            </div>
            <div style={{ display: 'flex', height, borderRadius: 999, overflow: 'hidden', background: '#f4efe8' }}>
              {row.segments.map((s, si) => (
                <div key={si} style={{
                  width: `${s.value / total * 100}%`,
                  background: s.color,
                  borderRight: si < row.segments.length - 1 ? '1px solid #fff' : 'none'
                }} title={s.name}></div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Expose to window for other Babel scripts
Object.assign(window, { Sparkline, TimeChart, Donut, StackedBar });
