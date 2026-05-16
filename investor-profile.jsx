'use strict';
// Investor Profile — 12-tab management module
const { useState, useEffect, useCallback, useRef, useMemo } = React;

// ─── Config ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',      label: 'Overview',          icon: '◈'  },
  { id: 'personal',      label: 'Personal Info',     icon: '◉'  },
  { id: 'preferences',   label: 'Preferences',       icon: '◎'  },
  { id: 'financial',     label: 'Financial',         icon: '◆'  },
  { id: 'investments',   label: 'Investments',       icon: '◐'  },
  { id: 'opportunities', label: 'Opportunities',     icon: '◑'  },
  { id: 'documents',     label: 'Documents',         icon: '◻'  },
  { id: 'contracts',     label: 'Contracts',         icon: '◈'  },
  { id: 'payments',      label: 'Payments & ROI',    icon: '◉'  },
  { id: 'communication', label: 'Communication',     icon: '◎'  },
  { id: 'notes',         label: 'Notes',             icon: '◆'  },
  { id: 'settings',      label: 'Settings',          icon: '◐'  },
];

const BRAND_COLORS = { atelier: '#8D1D2C', couq: '#B8862E', cookies: '#C0584A', mania: '#2E6B8D' };
const BRAND_NAMES  = { atelier: "L'Atelier By", couq: 'Couq', cookies: "Cookie's & Milk", mania: 'Mania Pizza' };

const INVESTOR_TYPES = ['Private', 'Company', 'Family Office', 'Real Estate', 'Franchise Operator', 'Investment Fund', 'Other'];
const INVESTMENT_TYPES = ['Passive', 'Active', 'Operator Partner', 'Real Estate Only', 'Equity', 'Convertible Loan', 'Revenue Share', 'Debt Financing'];
const RISK_PROFILES = ['Low', 'Moderate', 'High'];
const DOC_CATEGORIES = ['Contracts', 'NDAs', 'Financial', 'Investment Proofs', 'Reports', 'KPI Reports', 'Legal', 'Tax'];
const INTEREST_SECTORS = ['Franchise', 'Bakery', 'Coffee Shop', 'Restaurant', 'Retail', 'Food Court', 'Real Estate', 'Production', 'Logistics', 'Multi-unit', 'Brand Development'];

// ─── API ─────────────────────────────────────────────────────────────────────
function token() { try { return JSON.parse(localStorage.getItem('fg_auth') || '{}').token || ''; } catch { return ''; } }

async function api(path, opts = {}) {
  try {
    const r = await fetch('/api' + path, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
      signal: opts.signal || AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || r.statusText);
    return r.json();
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw e;
  }
}

// ─── SVG Charts ──────────────────────────────────────────────────────────────
function LineChart({ data = [], width = 320, height = 80, color = '#8D1D2C', showDots = true, label }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pad = { t: 8, r: 8, b: 8, l: 8 };
  const w = width - pad.l - pad.r, h = height - pad.t - pad.b;
  const pts = data.map((v, i) => [pad.l + (i / (data.length - 1)) * w, pad.t + h - ((v - min) / range) * h]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
  const area = `${line}L${pts[pts.length - 1][0].toFixed(1)},${(pad.t + h).toFixed(1)}L${pad.l},${(pad.t + h).toFixed(1)}Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`g${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g${color.replace('#', '')})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="#fff" strokeWidth="1.5" />)}
    </svg>
  );
}

function BarChart({ data = [], width = 320, height = 80, color = '#8D1D2C' }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value)) || 1;
  const pad = 12, gap = 4;
  const bw = (width - pad * 2 - gap * (data.length - 1)) / data.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((d, i) => {
        const bh = ((d.value / max) * (height - 24));
        const x = pad + i * (bw + gap);
        const y = height - 16 - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="3" fill={d.color || color} opacity={d.muted ? 0.35 : 1} />
            <text x={x + bw / 2} y={height - 2} textAnchor="middle" fontSize="9" fill="#9e958c">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ segments = [], size = 110, label, sub }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 8, cx = size / 2, cy = size / 2;
  let ang = -Math.PI / 2;
  const arcs = segments.map(seg => {
    const sweep = (seg.value / total) * Math.PI * 2;
    const [x1, y1] = [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
    ang += sweep;
    const [x2, y2] = [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
    const lg = sweep > Math.PI ? 1 : 0;
    return { ...seg, d: `M${cx},${cy}L${x1},${y1}A${r},${r} 0 ${lg},1 ${x2},${y2}Z` };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((arc, i) => <path key={i} d={arc.d} fill={arc.color} />)}
      <circle cx={cx} cy={cy} r={r * 0.58} fill="white" />
      {label && <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1c1a17">{label}</text>}
      {sub && <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#9e958c">{sub}</text>}
    </svg>
  );
}

// ─── UI Primitives ───────────────────────────────────────────────────────────
function Badge({ tone = 'neutral', children }) {
  const tones = { success: '#2E8D5A', warning: '#B8862E', danger: '#c0392b', info: '#2E6B8D', neutral: '#8a7f74', purple: '#6B2E8D' };
  return (
    <span className="ip-badge" style={{ background: (tones[tone] || tones.neutral) + '18', color: tones[tone] || tones.neutral, border: `1px solid ${(tones[tone] || tones.neutral)}30` }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, sub, trend, icon, color = '#8D1D2C', onClick }) {
  return (
    <div className={`ip-stat${onClick ? ' ip-stat--link' : ''}`} onClick={onClick}>
      {icon && <div className="ip-stat__icon" style={{ color }}>{icon}</div>}
      <div className="ip-stat__val" style={{ color }}>{value}</div>
      <div className="ip-stat__label">{label}</div>
      {sub && <div className="ip-stat__sub">{sub}</div>}
      {trend && <div className={`ip-stat__trend ip-stat__trend--${trend.startsWith('+') ? 'up' : 'down'}`}>{trend}</div>}
    </div>
  );
}

function SectionCard({ title, subtitle, action, children, badge }) {
  return (
    <div className="ip-section">
      <div className="ip-section__head">
        <div>
          <h3 className="ip-section__title">{title}{badge && <span style={{ marginLeft: 8 }}><Badge tone={badge.tone}>{badge.label}</Badge></span>}</h3>
          {subtitle && <p className="ip-section__sub">{subtitle}</p>}
        </div>
        {action && <div className="ip-section__action">{action}</div>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', options, help, placeholder, multiline, readOnly }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  if (readOnly) return (
    <div className="ip-field">
      <span className="ip-field__label">{label}</span>
      <span className="ip-field__value">{value || <em className="ip-field__empty">—</em>}</span>
    </div>
  );

  if (!onChange) return (
    <div className="ip-field">
      <span className="ip-field__label">{label}</span>
      <span className="ip-field__value">{value || <em className="ip-field__empty">—</em>}</span>
    </div>
  );

  const commit = () => { if (local !== value) onChange(local); setEditing(false); };

  return (
    <div className={`ip-field ip-field--editable${editing ? ' ip-field--active' : ''}`}>
      <span className="ip-field__label">{label}</span>
      {editing ? (
        multiline
          ? <textarea className="ip-field__input ip-field__input--ta" value={local} onChange={e => setLocal(e.target.value)}
              onBlur={commit} rows={3} autoFocus />
          : options
            ? <select className="ip-field__input" value={local} onChange={e => { setLocal(e.target.value); onChange(e.target.value); setEditing(false); }} autoFocus onBlur={() => setEditing(false)}>
                {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
              </select>
            : <input type={type} className="ip-field__input" value={local} onChange={e => setLocal(e.target.value)}
                onBlur={commit} onKeyDown={e => e.key === 'Enter' && commit()} autoFocus placeholder={placeholder} />
      ) : (
        <span className="ip-field__value ip-field__value--click" onClick={() => setEditing(true)}>
          {value || <em className="ip-field__empty">Click to edit…</em>}
          <svg className="ip-field__edit-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 2l3 3L5 14H2v-3L11 2z"/></svg>
        </span>
      )}
      {help && <span className="ip-field__help">{help}</span>}
    </div>
  );
}

function Toggle({ label, value, onChange, help }) {
  return (
    <div className="ip-toggle-row">
      <div>
        <span className="ip-field__label">{label}</span>
        {help && <span className="ip-field__help">{help}</span>}
      </div>
      <button type="button" className={`ip-toggle${value ? ' ip-toggle--on' : ''}`} onClick={() => onChange && onChange(!value)}>
        <span className="ip-toggle__knob" />
      </button>
    </div>
  );
}

function MultiSelect({ label, options, value = [], onChange, help }) {
  const toggle = (opt) => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt];
    onChange && onChange(next);
  };
  return (
    <div className="ip-field">
      <span className="ip-field__label">{label}</span>
      {help && <span className="ip-field__help">{help}</span>}
      <div className="ip-chips-row">
        {options.map(opt => (
          <button key={opt} type="button"
            className={`ip-chip-btn${value.includes(opt) ? ' ip-chip-btn--active' : ''}`}
            onClick={() => toggle(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

function KYCBadge({ done, label }) {
  return (
    <div className={`ip-kyc-item${done ? ' ip-kyc-item--done' : ''}`}>
      <span className="ip-kyc-check">{done ? '✓' : '○'}</span>
      <span>{label}</span>
    </div>
  );
}

function fmtEur(n) { return n != null ? '€' + Number(n).toLocaleString('fr-BE') : '—'; }
function fmtPct(n) { return n != null ? Number(n).toFixed(1) + ' %' : '—'; }
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('fr-BE', { day: '2-digit', month: 'short', year: 'numeric' }); }

// ─── Tab: Overview ───────────────────────────────────────────────────────────
function TabOverview({ investor, portfolio, repayments, setTab }) {
  const totalInvested = investor.totalInvested || 0;
  const totalRepaid   = investor.totalRepaid || 0;
  const roi = totalInvested > 0 ? ((totalRepaid / totalInvested) * 100).toFixed(1) : '—';
  const activeInvestments = portfolio ? Object.values(portfolio.brands || {}).reduce((s, b) => s + (b.shops?.length || 0), 0) : 0;
  const upcoming = repayments.filter(r => r.status === 'scheduled');
  const delayed  = repayments.filter(r => r.status === 'delayed');

  const quickActions = [
    { label: 'Add Investment',        icon: '＋', tab: 'investments' },
    { label: 'Link Opportunity',      icon: '⟶', tab: 'opportunities' },
    { label: 'Upload Document',       icon: '↑',  tab: 'documents' },
    { label: 'Schedule Meeting',      icon: '📅', tab: 'communication' },
    { label: 'Send Message',          icon: '✉',  tab: 'communication' },
    { label: 'View Contracts',        icon: '📝', tab: 'contracts' },
  ];

  const brandAlloc = Object.entries(portfolio?.brands || {}).map(([id, b]) => ({
    label: BRAND_NAMES[id] || id,
    value: b.summary?.invested || 0,
    color: BRAND_COLORS[id] || '#ccc',
  }));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const roiData = [5.2, 5.8, 6.1, 6.4, 7.0, 7.2, 7.6, 7.8, 8.0, 8.2, 8.4, 8.4];

  return (
    <div className="ip-tab-body">
      {/* KPI strip */}
      <div className="ip-stats-grid">
        <StatCard label="Total Invested"     value={fmtEur(totalInvested)} color="#8D1D2C" onClick={() => setTab('payments')} />
        <StatCard label="Total Returned"     value={fmtEur(totalRepaid)}   color="#2E8D5A" trend="+12%" onClick={() => setTab('payments')} />
        <StatCard label="ROI"                value={fmtPct(roi)}            color="#B8862E" trend="+0.8%" onClick={() => setTab('payments')} />
        <StatCard label="Active Investments" value={activeInvestments}     color="#2E6B8D" onClick={() => setTab('investments')} />
        <StatCard label="Upcoming Payments"  value={upcoming.length}       color="#6B2E8D" sub={fmtEur(upcoming.reduce((s, r) => s + r.amount, 0))} onClick={() => setTab('payments')} />
        <StatCard label="Delayed"            value={delayed.length}        color={delayed.length ? '#c0392b' : '#2E8D5A'} />
      </div>

      <div className="ip-two-col">
        {/* ROI evolution */}
        <SectionCard title="ROI Evolution" subtitle="12-month trailing">
          <div style={{ marginTop: 12 }}>
            <LineChart data={roiData} width={360} height={90} color="#8D1D2C" />
            <div className="ip-chart-x">
              {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Brand allocation */}
        <SectionCard title="Brand Exposure" subtitle="By capital invested">
          <div className="ip-donut-row">
            <DonutChart segments={brandAlloc} size={110}
              label={fmtEur(totalInvested)} sub="invested" />
            <div className="ip-legend">
              {brandAlloc.map((b, i) => (
                <div key={i} className="ip-legend-item">
                  <span className="ip-legend-dot" style={{ background: b.color }} />
                  <span className="ip-legend-label">{b.label}</span>
                  <span className="ip-legend-val">{fmtEur(b.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="ip-two-col">
        {/* Quick actions */}
        <SectionCard title="Quick Actions">
          <div className="ip-quick-actions">
            {quickActions.map(a => (
              <button key={a.label} type="button" className="ip-qa-btn" onClick={() => setTab(a.tab)}>
                <span className="ip-qa-icon">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Recent activity */}
        <SectionCard title="Recent Activity">
          <div className="ip-timeline-mini">
            {repayments.slice(0, 5).map((r, i) => (
              <div key={i} className="ip-tl-mini-item">
                <span className="ip-tl-mini-dot" style={{ background: BRAND_COLORS[r.brand] || '#ccc' }} />
                <div>
                  <p className="ip-tl-mini-title">{r.description}</p>
                  <p className="ip-tl-mini-meta">{fmtDate(r.date)} · <Badge tone={r.status === 'paid' ? 'success' : r.status === 'scheduled' ? 'info' : 'warning'}>{r.status}</Badge></p>
                </div>
                <span className="ip-tl-mini-amount">{fmtEur(r.amount)}</span>
              </div>
            ))}
            {!repayments.length && <p className="ip-empty">No payment history yet.</p>}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Tab: Personal Information ────────────────────────────────────────────────
function TabPersonal({ investor, onSave }) {
  const p = investor.profile || {};
  const patch = (key, val) => onSave({ profile: { ...p, [key]: val } });

  return (
    <div className="ip-tab-body">
      <SectionCard title="Identity">
        <div className="ip-field-grid">
          <Field label="First Name"     value={p.firstName  || investor.name?.split(' ')[0]} onChange={v => patch('firstName', v)} />
          <Field label="Last Name"      value={p.lastName   || investor.name?.split(' ').slice(1).join(' ')} onChange={v => patch('lastName', v)} />
          <Field label="Company Name"   value={p.companyName} onChange={v => patch('companyName', v)} placeholder="If applicable" />
          <Field label="Investor Type"  value={p.investorType || 'Private'}
            options={INVESTOR_TYPES.map(t => ({ value: t, label: t }))} onChange={v => patch('investorType', v)} />
        </div>
      </SectionCard>

      <SectionCard title="Contact">
        <div className="ip-field-grid">
          <Field label="Email"              value={investor.email}       onChange={v => onSave({ email: v })} type="email" />
          <Field label="Phone"              value={investor.phone || p.phone} onChange={v => patch('phone', v)} type="tel" />
          <Field label="Secondary Phone"    value={p.phone2}             onChange={v => patch('phone2', v)} type="tel" />
          <Field label="Website"            value={p.website}            onChange={v => patch('website', v)} type="url" />
          <Field label="LinkedIn"           value={p.linkedin}           onChange={v => patch('linkedin', v)} placeholder="linkedin.com/in/…" />
          <Field label="Preferred Language" value={p.preferredLanguage || 'French'}
            options={['French', 'Dutch', 'English', 'Polish', 'German'].map(l => ({ value: l, label: l }))} onChange={v => patch('preferredLanguage', v)} />
        </div>
      </SectionCard>

      <SectionCard title="Address">
        <div className="ip-field-grid">
          <Field label="Country"      value={p.country || 'Belgium'} options={['Belgium', 'France', 'Netherlands', 'Luxembourg', 'Germany', 'Other'].map(c => ({ value: c, label: c }))} onChange={v => patch('country', v)} />
          <Field label="Region"       value={p.region}       onChange={v => patch('region', v)} />
          <Field label="City"         value={p.city}         onChange={v => patch('city', v)} />
          <Field label="Full Address" value={investor.address || p.fullAddress} onChange={v => patch('fullAddress', v)} />
          <Field label="Postal Code"  value={p.postalCode}   onChange={v => patch('postalCode', v)} />
        </div>
      </SectionCard>

      <SectionCard title="Legal">
        <div className="ip-field-grid">
          <Field label="VAT Number"              value={p.vatNumber}         onChange={v => patch('vatNumber', v)} placeholder="BE0123456789" />
          <Field label="Company Registration №"  value={p.companyRegNumber}  onChange={v => patch('companyRegNumber', v)} />
          <Field label="Nationality"             value={investor.nationality || p.nationality} onChange={v => patch('nationality', v)} />
          <Field label="Date of Birth"           value={p.dob}               onChange={v => patch('dob', v)} type="date" />
          <Field label="ID / Passport №"         value={p.idNumber}          onChange={v => patch('idNumber', v)} />
          <Field label="IBAN"                    value={investor.iban}       onChange={v => onSave({ iban: v })} placeholder="BE68 XXXX XXXX XXXX" />
        </div>
      </SectionCard>

      <SectionCard title="Visibility">
        <div className="ip-field-grid ip-field-grid--toggles">
          <Toggle label="Public Investor Profile" value={p.visibility?.public} onChange={v => patch('visibility', { ...p.visibility, public: v })} help="Visible in public investor directory" />
          <Toggle label="Internal Only"           value={p.visibility?.internalOnly} onChange={v => patch('visibility', { ...p.visibility, internalOnly: v })} help="Profile hidden from non-admin roles" />
          <Toggle label="Anonymous Mode"          value={p.visibility?.anonymous} onChange={v => patch('visibility', { ...p.visibility, anonymous: v })} help="Investment amounts hidden from operators" />
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Investment Preferences ─────────────────────────────────────────────
function TabPreferences({ investor, onSave }) {
  const p = investor.profile || {};
  const prefs = p.preferences || {};
  const patch = (key, val) => onSave({ profile: { ...p, preferences: { ...prefs, [key]: val } } });

  return (
    <div className="ip-tab-body">
      <SectionCard title="Sector Interests">
        <MultiSelect options={INTEREST_SECTORS} value={prefs.sectors || []} onChange={v => patch('sectors', v)} help="Select all relevant sectors" />
      </SectionCard>

      <SectionCard title="Investment Type">
        <MultiSelect options={INVESTMENT_TYPES} value={prefs.investmentTypes || []} onChange={v => patch('investmentTypes', v)} />
      </SectionCard>

      <SectionCard title="Geographic Preferences">
        <div className="ip-field-grid">
          <Field label="Preferred Countries" value={(prefs.countries || []).join(', ')} onChange={v => patch('countries', v.split(',').map(s => s.trim()).filter(Boolean))} placeholder="Belgium, France…" help="Comma-separated" />
          <Field label="Preferred Cities"    value={(prefs.cities || []).join(', ')} onChange={v => patch('cities', v.split(',').map(s => s.trim()).filter(Boolean))} placeholder="Bruxelles, Paris…" />
        </div>
      </SectionCard>

      <SectionCard title="Return & Duration">
        <div className="ip-field-grid">
          <Field label="Minimum ROI Expected (%)"     value={prefs.minRoi}      onChange={v => patch('minRoi', v)} type="number" placeholder="6" />
          <Field label="Maximum Investment Duration (months)" value={prefs.maxDuration} onChange={v => patch('maxDuration', v)} type="number" placeholder="60" />
          <Field label="Preferred Project Size (€)"   value={prefs.projectSize}  onChange={v => patch('projectSize', v)} type="number" placeholder="50000" />
        </div>
      </SectionCard>

      <SectionCard title="Risk Profile">
        <div className="ip-risk-grid">
          {RISK_PROFILES.map(r => (
            <button key={r} type="button"
              className={`ip-risk-btn${prefs.riskProfile === r ? ' ip-risk-btn--active' : ''}`}
              onClick={() => patch('riskProfile', r)}
              data-risk={r.toLowerCase()}>
              <span className="ip-risk-label">{r}</span>
              <span className="ip-risk-desc">{
                r === 'Low' ? 'Capital preservation, stable returns' :
                r === 'Moderate' ? 'Balanced growth and income' :
                'High growth, accepts volatility'
              }</span>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Financial Capacity ──────────────────────────────────────────────────
function TabFinancial({ investor, onSave }) {
  const p = investor.profile || {};
  const fc = p.financialCapacity || {};
  const patch = (key, val) => onSave({ profile: { ...p, financialCapacity: { ...fc, [key]: val } } });

  return (
    <div className="ip-tab-body">
      <SectionCard title="Budget Capacity">
        <div className="ip-field-grid">
          <Field label="Minimum Investment (€)"        value={fc.minInvestment}     onChange={v => patch('minInvestment', v)} type="number" placeholder="10000" />
          <Field label="Maximum Investment (€)"        value={fc.maxInvestment}     onChange={v => patch('maxInvestment', v)} type="number" placeholder="500000" />
          <Field label="Liquid Cash Available (€)"     value={fc.liquidCash}        onChange={v => patch('liquidCash', v)} type="number" placeholder="200000" />
          <Field label="Financing Capacity (€)"        value={fc.financingCapacity} onChange={v => patch('financingCapacity', v)} type="number" placeholder="300000" />
          <Field label="Monthly Investment Capacity (€)" value={fc.monthly}         onChange={v => patch('monthly', v)} type="number" placeholder="5000" />
        </div>
      </SectionCard>

      <SectionCard title="Source of Funds">
        <div className="ip-chips-row" style={{ marginTop: 8 }}>
          {['Personal', 'Company', 'Bank Financing', 'Investment Group', 'Other'].map(src => (
            <button key={src} type="button"
              className={`ip-chip-btn${(fc.fundSources || []).includes(src) ? ' ip-chip-btn--active' : ''}`}
              onClick={() => {
                const s = fc.fundSources || [];
                patch('fundSources', s.includes(src) ? s.filter(x => x !== src) : [...s, src]);
              }}>{src}</button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Compliance Validation" badge={{ label: 'Required', tone: 'warning' }}>
        <div className="ip-kyc-grid">
          {[
            { key: 'kyc',          label: 'KYC Completed' },
            { key: 'aml',          label: 'AML Completed' },
            { key: 'dueDiligence', label: 'Due Diligence Completed' },
            { key: 'solvency',     label: 'Solvency Validated' },
          ].map(item => (
            <div key={item.key} className="ip-kyc-item-row" onClick={() => patch(item.key, !fc[item.key])}>
              <KYCBadge done={fc[item.key]} label={item.label} />
              <Badge tone={fc[item.key] ? 'success' : 'warning'}>{fc[item.key] ? 'Validated' : 'Pending'}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Supporting Documents">
        <div className="ip-doc-upload-list">
          {[{ label: 'Bank Proof', key: 'bankProof' }, { label: 'Tax Documents', key: 'tax' }, { label: 'Company Statements', key: 'company' }, { label: 'Investment Proof', key: 'investProof' }].map(d => (
            <div key={d.key} className="ip-doc-upload-row">
              <span className="ip-doc-upload-label">{d.label}</span>
              <span>{fc[d.key] ? <Badge tone="success">Uploaded</Badge> : <Badge tone="neutral">Missing</Badge>}</span>
              <button type="button" className="ip-btn ip-btn--ghost ip-btn--xs">Upload</button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Active Investments ──────────────────────────────────────────────────
function TabInvestments({ investor, portfolio }) {
  const shops = [];
  Object.entries(portfolio?.brands || {}).forEach(([brandId, b]) => {
    (b.shops || []).forEach(s => shops.push({ ...s, brandId, brandName: BRAND_NAMES[brandId] || brandId, brandColor: BRAND_COLORS[brandId] || '#ccc' }));
  });

  return (
    <div className="ip-tab-body">
      <div className="ip-section-bar">
        <span className="ip-section-bar__count">{shops.length} active investment{shops.length !== 1 ? 's' : ''}</span>
        <button type="button" className="ip-btn ip-btn--primary ip-btn--sm">＋ Add Investment</button>
      </div>

      {!shops.length && <div className="ip-empty-state"><p>No active investments yet.</p></div>}

      <div className="ip-invest-grid">
        {shops.map((s, i) => (
          <div key={i} className="ip-invest-card">
            <div className="ip-invest-card__header" style={{ borderTopColor: s.brandColor }}>
              <div>
                <p className="ip-invest-card__brand" style={{ color: s.brandColor }}>{s.brandName}</p>
                <p className="ip-invest-card__name">{s.name}</p>
                <p className="ip-invest-card__loc">{s.city}</p>
              </div>
              <Badge tone={s.health === 'good' ? 'success' : s.health === 'warning' ? 'warning' : 'neutral'}>
                {s.health || 'Active'}
              </Badge>
            </div>
            <div className="ip-invest-card__body">
              <div className="ip-invest-kpi">
                <div className="ip-invest-kpi-item">
                  <span>Invested</span><strong>{fmtEur(s.invested)}</strong>
                </div>
                <div className="ip-invest-kpi-item">
                  <span>Repaid</span><strong>{fmtEur(s.repaid)}</strong>
                </div>
                <div className="ip-invest-kpi-item">
                  <span>ROI target</span><strong>{fmtPct(s.roiTarget)}</strong>
                </div>
                <div className="ip-invest-kpi-item">
                  <span>ROI current</span><strong style={{ color: (s.roiCurrent >= s.roiTarget) ? '#2E8D5A' : '#B8862E' }}>{fmtPct(s.roiCurrent)}</strong>
                </div>
              </div>
              {s.kpiSnapshot && (
                <div className="ip-invest-kpi ip-invest-kpi--light">
                  <div className="ip-invest-kpi-item"><span>Revenue</span><strong>{fmtEur(s.kpiSnapshot.ca)}</strong></div>
                  <div className="ip-invest-kpi-item"><span>Margin</span><strong>{s.kpiSnapshot.profit}%</strong></div>
                  <div className="ip-invest-kpi-item"><span>vs Budget</span><strong style={{ color: '#2E8D5A' }}>+{s.kpiSnapshot.vsBudget}%</strong></div>
                </div>
              )}
            </div>
            <div className="ip-invest-card__actions">
              <button className="ip-btn ip-btn--ghost ip-btn--xs" onClick={() => alert('Opening project…')}>Project →</button>
              <button className="ip-btn ip-btn--ghost ip-btn--xs" onClick={() => alert('Opening KPI…')}>KPI →</button>
              <button className="ip-btn ip-btn--ghost ip-btn--xs" onClick={() => alert('Opening payments…')}>Payments →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Opportunities ───────────────────────────────────────────────────────
function TabOpportunities({ investor, opportunities = [] }) {
  const [filter, setFilter] = useState('all');
  const filters = [{ id: 'all', label: 'All' }, { id: 'interested', label: 'Interested' }, { id: 'recommended', label: 'Recommended' }, { id: 'favorites', label: 'Favorites' }];

  const scored = opportunities.map(o => ({
    ...o,
    budgetFit: Math.min(100, Math.round(((investor.totalInvested || 50000) * 0.3) / (o.ticketMin || 1) * 100)),
    brandMatch: (investor.brands || []).includes(o.brand) ? 100 : 60,
    geoFit: 80,
  })).map(o => ({ ...o, score: Math.round((o.budgetFit + o.brandMatch + o.geoFit) / 3) }));

  const shown = filter === 'all' ? scored : scored.filter(o => o.status === filter || (filter === 'recommended' && o.score > 70));

  return (
    <div className="ip-tab-body">
      <div className="ip-filter-bar">
        {filters.map(f => (
          <button key={f.id} type="button" className={`ip-filter-btn${filter === f.id ? ' ip-filter-btn--active' : ''}`}
            onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      {!shown.length && <div className="ip-empty-state"><p>No opportunities in this category.</p></div>}

      <div className="ip-opp-grid">
        {shown.map((o, i) => (
          <div key={i} className="ip-opp-card">
            <div className="ip-opp-card__header">
              <div>
                <span className="ip-opp-brand" style={{ color: BRAND_COLORS[o.brand] || '#333' }}>{BRAND_NAMES[o.brand] || o.brand}</span>
                <p className="ip-opp-name">{o.name || o.title || o.id}</p>
                <p className="ip-opp-loc">{o.city || o.location}</p>
              </div>
              {o.score != null && (
                <div className="ip-score-ring">
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#f4f1ee" strokeWidth="4" />
                    <circle cx="22" cy="22" r="18" fill="none" stroke={o.score > 75 ? '#2E8D5A' : o.score > 50 ? '#B8862E' : '#c0392b'} strokeWidth="4"
                      strokeDasharray={`${o.score * 1.131} 113.1`} strokeLinecap="round" strokeDashoffset="28.3" transform="rotate(-90 22 22)" />
                    <text x="22" y="26" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1c1a17">{o.score}</text>
                  </svg>
                </div>
              )}
            </div>
            <div className="ip-opp-scores">
              {[{ label: 'Budget fit', val: o.budgetFit }, { label: 'ROI fit', val: o.brandMatch }, { label: 'Geo fit', val: o.geoFit }].map(s => (
                <div key={s.label} className="ip-opp-score-row">
                  <span>{s.label}</span>
                  <div className="ip-opp-bar"><div className="ip-opp-bar__fill" style={{ width: s.val + '%', background: s.val > 75 ? '#2E8D5A' : s.val > 50 ? '#B8862E' : '#c0392b' }} /></div>
                  <span>{s.val}%</span>
                </div>
              ))}
            </div>
            <div className="ip-opp-foot">
              {o.ticketMin && <span>Min: {fmtEur(o.ticketMin)}</span>}
              {o.roiTarget && <span>ROI: {fmtPct(o.roiTarget)}</span>}
              <button className="ip-btn ip-btn--ghost ip-btn--xs" style={{ marginLeft: 'auto' }}>View →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Documents ───────────────────────────────────────────────────────────
function TabDocuments({ investor, documents = [] }) {
  const [cat, setCat] = useState('All');
  const cats = ['All', ...DOC_CATEGORIES];
  const shown = cat === 'All' ? documents : documents.filter(d => d.category === cat || d.type === cat.toLowerCase());

  return (
    <div className="ip-tab-body">
      <div className="ip-section-bar">
        <div className="ip-filter-bar">
          {cats.slice(0, 5).map(c => (
            <button key={c} type="button" className={`ip-filter-btn${cat === c ? ' ip-filter-btn--active' : ''}`}
              onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <button type="button" className="ip-btn ip-btn--primary ip-btn--sm">↑ Upload</button>
      </div>

      <div className="ip-doc-grid">
        {shown.map((doc, i) => (
          <div key={i} className="ip-doc-card">
            <div className="ip-doc-card__icon">
              {doc.type === 'pdf' ? '📄' : doc.type === 'xlsx' ? '📊' : '📁'}
            </div>
            <div className="ip-doc-card__body">
              <p className="ip-doc-card__name">{doc.name || doc.title}</p>
              <p className="ip-doc-card__meta">
                {doc.brand && <span style={{ color: BRAND_COLORS[doc.brand] || '#333' }}>{BRAND_NAMES[doc.brand] || doc.brand} · </span>}
                {fmtDate(doc.uploadedAt || doc.date)} · {doc.type?.toUpperCase()}
              </p>
              {doc.expiresAt && (
                <p className="ip-doc-card__exp" style={{ color: new Date(doc.expiresAt) < new Date() ? '#c0392b' : '#B8862E' }}>
                  Expires {fmtDate(doc.expiresAt)}
                </p>
              )}
            </div>
            <div className="ip-doc-card__actions">
              <Badge tone={doc.status === 'signed' ? 'success' : doc.status === 'pending' ? 'warning' : 'neutral'}>
                {doc.status || 'Active'}
              </Badge>
              <button className="ip-btn ip-btn--ghost ip-btn--xs">↓</button>
            </div>
          </div>
        ))}
        {!shown.length && (
          <div className="ip-empty-state ip-empty-state--upload">
            <p>No documents in this category.</p>
            <button type="button" className="ip-btn ip-btn--ghost">Upload first document</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Contracts ───────────────────────────────────────────────────────────
function TabContracts({ investor, contracts = [] }) {
  return (
    <div className="ip-tab-body">
      <div className="ip-section-bar">
        <span className="ip-section-bar__count">{contracts.length} contract{contracts.length !== 1 ? 's' : ''}</span>
        <button type="button" className="ip-btn ip-btn--ghost ip-btn--sm">＋ New Contract</button>
      </div>

      <div className="ip-contract-list">
        {contracts.map((c, i) => (
          <div key={i} className="ip-contract-card">
            <div className="ip-contract-card__left">
              <div className="ip-contract-type-badge">
                {c.type === 'investment-agreement' ? '📋' : c.type === 'nda' ? '🔏' : '📝'}
              </div>
              <div>
                <p className="ip-contract-name">{c.type === 'investment-agreement' ? 'Investment Agreement' : c.type?.replace(/-/g, ' ')}</p>
                <p className="ip-contract-meta">
                  <span style={{ color: BRAND_COLORS[c.brand] || '#333' }}>{BRAND_NAMES[c.brand] || c.brand}</span>
                  {c.shopName && ` · ${c.shopName}`}
                </p>
                <p className="ip-contract-dates">{fmtDate(c.startDate)} → {fmtDate(c.endDate)}</p>
              </div>
            </div>
            <div className="ip-contract-card__right">
              {c.amount && <strong>{fmtEur(c.amount)}</strong>}
              <Badge tone={c.status === 'signed' ? 'success' : c.status === 'pending-signature' ? 'warning' : 'neutral'}>
                {c.status === 'signed' ? '✓ Signed' : c.status === 'pending-signature' ? '⏳ Pending signature' : c.status}
              </Badge>
              <div className="ip-contract-actions">
                <button className="ip-btn ip-btn--ghost ip-btn--xs">View</button>
                {c.status === 'pending-signature' && <button className="ip-btn ip-btn--primary ip-btn--xs">Sign via DocuSign →</button>}
              </div>
            </div>
          </div>
        ))}
        {!contracts.length && <div className="ip-empty-state"><p>No contracts yet.</p></div>}
      </div>
    </div>
  );
}

// ─── Tab: Payments & ROI ──────────────────────────────────────────────────────
function TabPayments({ investor, repayments, portfolio }) {
  const paid      = repayments.filter(r => r.status === 'paid');
  const scheduled = repayments.filter(r => r.status === 'scheduled');
  const totalPaid = paid.reduce((s, r) => s + r.amount, 0);
  const totalSched = scheduled.reduce((s, r) => s + r.amount, 0);
  const roi = investor.totalInvested > 0 ? (totalPaid / investor.totalInvested * 100).toFixed(2) : 0;

  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const barData = months.map((m, i) => ({
    label: m,
    value: paid.filter(r => new Date(r.date).getMonth() === i).reduce((s, r) => s + r.amount, 0),
    color: '#8D1D2C',
    muted: i > new Date().getMonth(),
  }));

  const brandPayments = {};
  repayments.forEach(r => {
    if (!brandPayments[r.brand]) brandPayments[r.brand] = 0;
    if (r.status === 'paid') brandPayments[r.brand] += r.amount;
  });
  const brandSegs = Object.entries(brandPayments).map(([b, v]) => ({ label: BRAND_NAMES[b] || b, value: v, color: BRAND_COLORS[b] || '#ccc' }));

  return (
    <div className="ip-tab-body">
      <div className="ip-stats-grid">
        <StatCard label="Total Invested"  value={fmtEur(investor.totalInvested)} color="#1c1a17" />
        <StatCard label="Total Returned"  value={fmtEur(totalPaid)}   color="#2E8D5A" />
        <StatCard label="ROI Achieved"    value={roi + ' %'}          color="#8D1D2C" trend="+0.8% vs target" />
        <StatCard label="Upcoming"        value={fmtEur(totalSched)}   color="#B8862E" sub={`${scheduled.length} payments`} />
      </div>

      <div className="ip-two-col">
        <SectionCard title="Monthly Returns (2026)" subtitle="Paid payments by month">
          <BarChart data={barData} width={360} height={90} />
          <div className="ip-chart-x">{months.map((m, i) => <span key={i}>{m}</span>)}</div>
        </SectionCard>
        <SectionCard title="Returns by Brand">
          <div className="ip-donut-row">
            <DonutChart segments={brandSegs} size={110} label={fmtEur(totalPaid)} sub="returned" />
            <div className="ip-legend">
              {brandSegs.map((s, i) => (
                <div key={i} className="ip-legend-item">
                  <span className="ip-legend-dot" style={{ background: s.color }} />
                  <span className="ip-legend-label">{s.label}</span>
                  <span className="ip-legend-val">{fmtEur(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Payment History">
        <table className="ip-table">
          <thead><tr><th>Date</th><th>Description</th><th>Brand</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {[...repayments].sort((a, b) => new Date(b.date) - new Date(a.date)).map((r, i) => (
              <tr key={i}>
                <td className="ip-td-mono">{fmtDate(r.date)}</td>
                <td>{r.description}</td>
                <td><span className="ip-brand-dot" style={{ background: BRAND_COLORS[r.brand] || '#ccc' }} />{BRAND_NAMES[r.brand] || r.brand}</td>
                <td className="ip-td-mono">{fmtEur(r.amount)}</td>
                <td><Badge tone={r.status === 'paid' ? 'success' : r.status === 'scheduled' ? 'info' : 'warning'}>{r.status}</Badge></td>
              </tr>
            ))}
            {!repayments.length && <tr><td colSpan={5} className="ip-td-empty">No payment records yet.</td></tr>}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Communication ───────────────────────────────────────────────────────
function TabCommunication({ investor, communications = [] }) {
  const [newNote, setNewNote] = useState('');

  const allEvents = [
    ...communications.map(c => ({ ...c, _kind: 'message', date: c.updatedAt || c.createdAt })),
    { _kind: 'event', date: investor.since, label: 'Investor registered', icon: '◉' },
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="ip-tab-body">
      <div className="ip-two-col ip-two-col--wide">
        <div>
          <SectionCard title="Communication Timeline">
            <div className="ip-timeline">
              {allEvents.map((ev, i) => (
                <div key={i} className="ip-tl-item">
                  <div className="ip-tl-dot">
                    {ev._kind === 'message' ? '💬' : ev._kind === 'event' ? '◉' : '📅'}
                  </div>
                  <div className="ip-tl-body">
                    <p className="ip-tl-meta">{fmtDate(ev.date)}</p>
                    {ev._kind === 'message' && (
                      <>
                        <p className="ip-tl-title">{ev.subject}</p>
                        <p className="ip-tl-sub">{ev.category} · <Badge tone={ev.status === 'resolved' ? 'success' : 'info'}>{ev.status}</Badge></p>
                      </>
                    )}
                    {ev._kind === 'event' && <p className="ip-tl-title">{ev.label}</p>}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
        <div>
          <SectionCard title="Send Message">
            <div className="ip-compose">
              <Field label="To" value={investor.email} readOnly />
              <Field label="Subject" value="" onChange={() => {}} placeholder="Subject…" />
              <div className="ip-field">
                <span className="ip-field__label">Message</span>
                <textarea className="ip-field__input ip-field__input--ta" rows={5} placeholder="Write your message…"
                  value={newNote} onChange={e => setNewNote(e.target.value)} />
              </div>
              <button type="button" className="ip-btn ip-btn--primary" style={{ width: '100%' }}>Send Message</button>
            </div>
          </SectionCard>
          <SectionCard title="Upcoming Meetings" action={<button className="ip-btn ip-btn--ghost ip-btn--sm">＋ Schedule</button>}>
            <p className="ip-empty" style={{ paddingTop: 8 }}>No meetings scheduled.</p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Notes & Internal Analysis ──────────────────────────────────────────
function TabNotes({ investor, onSave, currentUser }) {
  const p = investor.profile || {};
  const notes = p.notes || [];
  const [newNote, setNewNote] = useState('');

  const addNote = () => {
    if (!newNote.trim()) return;
    const next = [...notes, { id: Date.now(), author: currentUser?.email || 'admin', text: newNote, createdAt: new Date().toISOString() }];
    onSave({ profile: { ...p, notes: next } });
    setNewNote('');
  };

  const analysis = p.internalAnalysis || {};
  const patchAnalysis = (k, v) => onSave({ profile: { ...p, internalAnalysis: { ...analysis, [k]: v } } });

  return (
    <div className="ip-tab-body">
      <div className="ip-notice ip-notice--private">🔒 This section is visible to admin and consultant roles only.</div>

      <div className="ip-two-col">
        <SectionCard title="Internal Scoring">
          <div className="ip-field-grid">
            <Field label="Investment Behavior" value={analysis.behavior} onChange={v => patchAnalysis('behavior', v)}
              options={['Excellent', 'Good', 'Neutral', 'Cautious', 'Difficult'].map(o => ({ value: o, label: o }))} />
            <Field label="Risk Analysis" value={analysis.riskLevel} onChange={v => patchAnalysis('riskLevel', v)}
              options={['Very Low', 'Low', 'Moderate', 'High', 'Very High'].map(o => ({ value: o, label: o }))} />
            <Field label="Recommendation Status" value={analysis.recommendation} onChange={v => patchAnalysis('recommendation', v)}
              options={['Highly Recommended', 'Recommended', 'Neutral', 'Caution', 'Not Recommended'].map(o => ({ value: o, label: o }))} />
          </div>
        </SectionCard>

        <SectionCard title="Remarks">
          <div className="ip-field-grid">
            <Field label="Legal Remarks"   value={analysis.legalRemarks}   onChange={v => patchAnalysis('legalRemarks', v)} multiline placeholder="Any legal concerns or notes…" />
            <Field label="Finance Remarks" value={analysis.financeRemarks} onChange={v => patchAnalysis('financeRemarks', v)} multiline placeholder="Financial risk observations…" />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Consultant Notes" action={<Badge tone="neutral">Internal</Badge>}>
        <div className="ip-notes-list">
          {notes.map((n, i) => (
            <div key={i} className="ip-note-item">
              <div className="ip-note-avatar">{(n.author || 'A')[0].toUpperCase()}</div>
              <div className="ip-note-body">
                <p className="ip-note-author">{n.author} · {fmtDate(n.createdAt)}</p>
                <p className="ip-note-text">{n.text}</p>
              </div>
            </div>
          ))}
          {!notes.length && <p className="ip-empty">No notes yet.</p>}
        </div>
        <div className="ip-note-compose">
          <textarea className="ip-field__input ip-field__input--ta" rows={3}
            value={newNote} onChange={e => setNewNote(e.target.value)}
            placeholder="Add an internal note…" />
          <button type="button" className="ip-btn ip-btn--primary ip-btn--sm" onClick={addNote}>Add Note</button>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Settings ────────────────────────────────────────────────────────────
function TabSettings({ investor, onSave }) {
  const p = investor.profile || {};
  const settings = p.settings || {};
  const notifs   = settings.notifications || {};
  const patch = (key, val) => onSave({ profile: { ...p, settings: { ...settings, [key]: val } } });
  const patchN = (key, val) => onSave({ profile: { ...p, settings: { ...settings, notifications: { ...notifs, [key]: val } } } });

  return (
    <div className="ip-tab-body">
      <SectionCard title="Notification Preferences">
        <div className="ip-field-grid ip-field-grid--toggles">
          <Toggle label="Repayment Notifications"    value={notifs.repayments}       onChange={v => patchN('repayments', v)} help="Get notified when payments are processed" />
          <Toggle label="New Opportunities"          value={notifs.newOpportunities} onChange={v => patchN('newOpportunities', v)} help="Matching investment opportunities" />
          <Toggle label="Monthly Reports"            value={notifs.monthlyReports}   onChange={v => patchN('monthlyReports', v)} help="Automatic monthly performance reports" />
          <Toggle label="Support Updates"            value={notifs.supportUpdates}   onChange={v => patchN('supportUpdates', v)} help="Replies to your support tickets" />
        </div>
      </SectionCard>

      <SectionCard title="Contact Preferences">
        <div className="ip-field-grid">
          <Field label="Preferred Contact Method" value={settings.contactMethod || 'Email'}
            options={['Email', 'Phone', 'WhatsApp', 'Portal Message'].map(o => ({ value: o, label: o }))} onChange={v => patch('contactMethod', v)} />
          <Field label="Language" value={p.preferences?.language || 'French'}
            options={['French', 'Dutch', 'English', 'Polish'].map(o => ({ value: o, label: o }))} onChange={v => onSave({ profile: { ...p, preferences: { ...(p.preferences || {}), language: v } } })} />
        </div>
      </SectionCard>

      <SectionCard title="Portal Access">
        <div className="ip-field-grid ip-field-grid--toggles">
          <Toggle label="Portal Access Enabled" value={settings.portalAccess !== false} onChange={v => patch('portalAccess', v)} help="Allow investor to log in to investor portal" />
          <Toggle label="Automatic Report Generation" value={settings.autoReports} onChange={v => patch('autoReports', v)} help="Generate and send monthly PDF reports" />
        </div>
        <div className="ip-field-grid" style={{ marginTop: 16 }}>
          <Field label="Investor Tier" value={investor.tier || 'Standard'}
            options={['Standard', 'Privilège', 'Premium', 'Pilot'].map(o => ({ value: o, label: o }))} onChange={v => onSave({ tier: v })} />
          <Field label="Assigned Consultant" value={p.assignedConsultant} onChange={v => patch('assignedConsultant', v)} placeholder="consultant@fg.be" />
        </div>
      </SectionCard>

      <SectionCard title="Access & Roles">
        <div className="ip-field-grid">
          <Field label="User Role" value={investor.role || 'Investor'}
            options={['Investor', 'Consultant', 'Brand Manager', 'Finance', 'Legal', 'Super Admin'].map(o => ({ value: o, label: o }))} onChange={v => onSave({ role: v })} />
          <Field label="Account Status" value={investor.status || 'Active'}
            options={['Active', 'Suspended', 'Pending', 'Archived'].map(o => ({ value: o, label: o }))} onChange={v => onSave({ status: v })} />
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function InvestorProfileApp() {
  const params      = new URLSearchParams(location.search);
  const investorId  = params.get('investor') || 'inv-001';
  const initTab     = params.get('tab') || 'overview';
  const currentUser = window.FG_CURRENT_USER || {};
  const isAdmin = true; // page is admin/consultant only — all tabs visible

  const [tab,          setTabRaw]    = useState(initTab);
  const [investor,     setInvestor]  = useState(null);
  const [portfolio,    setPortfolio] = useState(null);
  const [repayments,   setRepayments]= useState([]);
  const [documents,    setDocuments] = useState([]);
  const [opportunities,setOpps]      = useState([]);
  const [contracts,    setContracts] = useState([]);
  const [communications, setComms]   = useState([]);
  const [loading,      setLoading]   = useState(true);
  const [saving,       setSaving]    = useState(false);
  const [saveMsg,      setSaveMsg]   = useState('');
  const [error,        setError]     = useState('');
  const saveTimer = useRef(null);

  const setTab = useCallback((id) => {
    setTabRaw(id);
    history.replaceState(null, '', `?investor=${investorId}&tab=${id}`);
  }, [investorId]);

  // Load all data in parallel
  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api(`/investors/${investorId}`),
      api(`/investors/${investorId}/portfolio`),
      api(`/investors/${investorId}/repayments?limit=50`),
      api(`/investors/${investorId}/documents`),
      api(`/investors/${investorId}/opportunities`).catch(() => ({ data: { interested: [], recommended: [] } })),
      api(`/investors/${investorId}/contracts`).catch(() => ({ data: [] })),
      api(`/investors/${investorId}/communications`).catch(() => ({ data: [] })),
    ]).then(([inv, port, reps, docs, opps, contr, comms]) => {
      if (inv.status === 'fulfilled') setInvestor(inv.value.data);
      else { setError('Investor not found.'); setLoading(false); return; }
      if (port.status === 'fulfilled') setPortfolio(port.value.data);
      if (reps.status === 'fulfilled') setRepayments(reps.value.data || []);
      if (docs.status === 'fulfilled') setDocuments(docs.value.data || []);
      if (opps.status === 'fulfilled') {
        const d = opps.value.data;
        setOpps(Array.isArray(d) ? d : [...(d.interested || []), ...(d.recommended || [])]);
      }
      if (contr.status === 'fulfilled') setContracts(contr.value.data || []);
      if (comms.status === 'fulfilled') setComms(comms.value.data || []);
      setLoading(false);
    });
  }, [investorId]);

  // Debounced auto-save
  const handleSave = useCallback((patch) => {
    setInvestor(prev => {
      const next = { ...prev };
      Object.entries(patch).forEach(([k, v]) => {
        if (k === 'profile' && typeof v === 'object') {
          next.profile = { ...(prev.profile || {}), ...v };
        } else {
          next[k] = v;
        }
      });
      return next;
    });

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await api(`/investors/${investorId}`, { method: 'PUT', body: JSON.stringify(patch) });
        setSaveMsg('Saved');
      } catch {
        setSaveMsg('Saved locally');
      } finally {
        setSaving(false);
        setTimeout(() => setSaveMsg(''), 2500);
      }
    }, 800);
  }, [investorId]);

  if (loading) return (
    <div className="ip-loading">
      <div className="ip-loading-spinner" />
      <p>Loading investor profile…</p>
    </div>
  );

  if (error || !investor) return (
    <div className="ip-error">
      <p>{error || 'Investor not found.'}</p>
      <a href="backoffice.html" className="ip-btn ip-btn--primary">← Back to Back Office</a>
    </div>
  );

  const initials = investor.initials || investor.name?.split(' ').map(s => s[0]).join('') || '?';
  const totalInvested = investor.totalInvested || 0;
  const totalRepaid   = investor.totalRepaid || 0;
  const roi = totalInvested > 0 ? ((totalRepaid / totalInvested) * 100).toFixed(1) : '0.0';

  const visibleTabs = isAdmin ? TABS : TABS.filter(t => !['notes'].includes(t.id));

  const tabProps = { investor, portfolio, repayments, documents, opportunities, contracts, communications, onSave: handleSave, setTab, currentUser };

  const panels = {
    overview:      <TabOverview      {...tabProps} />,
    personal:      <TabPersonal      {...tabProps} />,
    preferences:   <TabPreferences   {...tabProps} />,
    financial:     <TabFinancial     {...tabProps} />,
    investments:   <TabInvestments   {...tabProps} />,
    opportunities: <TabOpportunities {...tabProps} />,
    documents:     <TabDocuments     {...tabProps} />,
    contracts:     <TabContracts     {...tabProps} />,
    payments:      <TabPayments      {...tabProps} />,
    communication: <TabCommunication {...tabProps} />,
    notes:         <TabNotes         {...tabProps} />,
    settings:      <TabSettings      {...tabProps} />,
  };

  return (
    <div className="ip-app">
      {/* Global header */}
      <header className="ip-header">
        <a href="backoffice.html" className="ip-header__back">← Back Office</a>
        <div className="ip-header__identity">
          <div className="ip-header__avatar">{initials}</div>
          <div>
            <h1 className="ip-header__name">{investor.name}</h1>
            <div className="ip-header__meta">
              <Badge tone={investor.tier === 'Privilège' ? 'purple' : investor.tier === 'Premium' ? 'success' : 'neutral'}>{investor.tier || 'Standard'}</Badge>
              <span className="ip-header__since">Since {fmtDate(investor.since)}</span>
              <span className="ip-header__email">{investor.email}</span>
            </div>
          </div>
        </div>
        <div className="ip-header__kpis">
          <div className="ip-header__kpi"><span>{fmtEur(totalInvested)}</span><em>Invested</em></div>
          <div className="ip-header__kpi-sep" />
          <div className="ip-header__kpi"><span style={{ color: '#2E8D5A' }}>{fmtEur(totalRepaid)}</span><em>Returned</em></div>
          <div className="ip-header__kpi-sep" />
          <div className="ip-header__kpi"><span style={{ color: '#8D1D2C' }}>{roi} %</span><em>ROI</em></div>
        </div>
        <div className="ip-header__actions">
          {saveMsg && <span className="ip-save-msg">{saving ? '⟳ Saving…' : '✓ ' + saveMsg}</span>}
          <a href={`index.html`} className="ip-btn ip-btn--ghost ip-btn--sm">View Portal</a>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="ip-tab-bar">
        {visibleTabs.map(t => (
          <button key={t.id} type="button"
            className={`ip-tab-btn${tab === t.id ? ' ip-tab-btn--active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="ip-main">
        {panels[tab] || panels.overview}
      </main>
    </div>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
.ip-app { min-height: 100vh; background: #f4f1ee; font-family: 'DM Sans', system-ui, sans-serif; color: #1c1a17; }

/* Header */
.ip-header { display: flex; align-items: center; gap: 20px; padding: 14px 32px; background: #fff; border-bottom: 1px solid #e4ddd4; position: sticky; top: 0; z-index: 200; flex-wrap: wrap; }
.ip-header__back { font: 500 12px/1 'DM Sans', sans-serif; color: #8a7f74; text-decoration: none; white-space: nowrap; }
.ip-header__back:hover { color: #1c1a17; }
.ip-header__identity { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
.ip-header__avatar { width: 44px; height: 44px; border-radius: 50%; background: #8D1D2C; color: #fff; font: 700 18px/44px 'DM Sans', sans-serif; text-align: center; flex-shrink: 0; }
.ip-header__name { font: 700 18px/1 'DM Sans', sans-serif; margin: 0 0 5px; }
.ip-header__meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ip-header__since, .ip-header__email { font: 400 12px/1 'DM Sans', sans-serif; color: #8a7f74; }
.ip-header__kpis { display: flex; align-items: center; gap: 4px; }
.ip-header__kpi { text-align: center; padding: 0 16px; }
.ip-header__kpi span { display: block; font: 700 16px/1 'DM Sans', sans-serif; color: #1c1a17; }
.ip-header__kpi em { display: block; font: 400 11px/1 'DM Sans', sans-serif; color: #8a7f74; margin-top: 3px; font-style: normal; }
.ip-header__kpi-sep { width: 1px; height: 32px; background: #e4ddd4; }
.ip-header__actions { display: flex; align-items: center; gap: 8px; }
.ip-save-msg { font: 500 12px/1 'DM Sans', sans-serif; color: #2E8D5A; }

/* Tab bar */
.ip-tab-bar { display: flex; gap: 0; padding: 0 32px; background: #fff; border-bottom: 1px solid #e4ddd4; overflow-x: auto; scrollbar-width: none; }
.ip-tab-bar::-webkit-scrollbar { display: none; }
.ip-tab-btn { padding: 11px 14px; background: none; border: none; border-bottom: 2px solid transparent; font: 500 12.5px/1 'DM Sans', sans-serif; color: #8a7f74; cursor: pointer; white-space: nowrap; transition: all .15s; }
.ip-tab-btn:hover { color: #1c1a17; }
.ip-tab-btn--active { color: #8D1D2C; border-bottom-color: #8D1D2C; }

/* Main */
.ip-main { max-width: 1100px; margin: 0 auto; padding: 32px 24px 80px; }
.ip-tab-body { display: flex; flex-direction: column; gap: 24px; }

/* Stats grid */
.ip-stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.ip-stat { background: #fff; border-radius: 12px; border: 1px solid #e4ddd4; padding: 18px 16px; text-align: center; }
.ip-stat--link { cursor: pointer; transition: box-shadow .15s; }
.ip-stat--link:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
.ip-stat__icon { font-size: 20px; margin-bottom: 6px; }
.ip-stat__val { font: 700 20px/1 'DM Sans', sans-serif; margin-bottom: 4px; }
.ip-stat__label { font: 500 11px/1 'DM Sans', sans-serif; color: #8a7f74; }
.ip-stat__sub { font: 400 11px/1 'DM Sans', sans-serif; color: #9e958c; margin-top: 3px; }
.ip-stat__trend { font: 600 11px/1 'DM Sans', sans-serif; margin-top: 4px; }
.ip-stat__trend--up { color: #2E8D5A; }
.ip-stat__trend--down { color: #c0392b; }

/* Two-column layout */
.ip-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.ip-two-col--wide { grid-template-columns: 1.4fr 1fr; }

/* Section card */
.ip-section { background: #fff; border-radius: 14px; border: 1px solid #e4ddd4; padding: 22px 24px; }
.ip-section__head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
.ip-section__title { font: 600 14px/1 'DM Sans', sans-serif; color: #1c1a17; margin: 0 0 4px; }
.ip-section__sub { font: 400 12px/1 'DM Sans', sans-serif; color: #8a7f74; margin: 0; }
.ip-section__action { flex-shrink: 0; }

/* Field grid */
.ip-field-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.ip-field-grid--toggles { grid-template-columns: 1fr; gap: 2px; }

/* Field */
.ip-field { display: flex; flex-direction: column; gap: 4px; padding: 10px 0; border-bottom: 1px solid #f4f1ee; }
.ip-field:last-child { border-bottom: none; }
.ip-field__label { font: 600 11px/1 'DM Sans', sans-serif; color: #8a7f74; text-transform: uppercase; letter-spacing: .05em; }
.ip-field__value { font: 400 13px/1.5 'DM Sans', sans-serif; color: #1c1a17; }
.ip-field__value--click { display: flex; align-items: center; gap: 6px; cursor: pointer; border-radius: 6px; padding: 4px 6px; margin: -4px -6px; transition: background .15s; }
.ip-field__value--click:hover { background: #f4f1ee; }
.ip-field__edit-icon { width: 12px; height: 12px; color: #c0b9b0; flex-shrink: 0; }
.ip-field__empty { color: #c0b9b0; font-style: normal; font-size: 12px; }
.ip-field__input { padding: 8px 10px; border: 1.5px solid #8D1D2C; border-radius: 7px; font: 400 13px/1 'DM Sans', sans-serif; color: #1c1a17; width: 100%; box-sizing: border-box; }
.ip-field__input--ta { line-height: 1.6; padding: 10px; resize: vertical; }
.ip-field__help { font: 400 11px/1.4 'DM Sans', sans-serif; color: #b0a89f; }

/* Toggle */
.ip-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f4f1ee; }
.ip-toggle-row:last-child { border-bottom: none; }
.ip-toggle { width: 38px; height: 21px; border-radius: 10.5px; background: #e4ddd4; border: none; cursor: pointer; position: relative; transition: background .2s; flex-shrink: 0; }
.ip-toggle--on { background: #2E8D5A; }
.ip-toggle__knob { position: absolute; top: 2.5px; left: 2.5px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .2s; display: block; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.ip-toggle--on .ip-toggle__knob { transform: translateX(17px); }

/* Chips / multi-select */
.ip-chips-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.ip-chip-btn { padding: 6px 12px; border-radius: 20px; border: 1.5px solid #e4ddd4; background: transparent; font: 500 12px/1 'DM Sans', sans-serif; color: #4a443c; cursor: pointer; transition: all .15s; }
.ip-chip-btn--active { background: #1c1a17; color: #fff; border-color: #1c1a17; }
.ip-chip-btn:hover:not(.ip-chip-btn--active) { border-color: #1c1a17; }

/* Risk profile */
.ip-risk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 8px; }
.ip-risk-btn { padding: 18px; border-radius: 12px; border: 2px solid #e4ddd4; background: #fff; cursor: pointer; text-align: left; transition: all .15s; }
.ip-risk-btn--active[data-risk="low"]      { border-color: #2E8D5A; background: #2E8D5A10; }
.ip-risk-btn--active[data-risk="moderate"] { border-color: #B8862E; background: #B8862E10; }
.ip-risk-btn--active[data-risk="high"]     { border-color: #c0392b; background: #c0392b10; }
.ip-risk-label { display: block; font: 700 14px/1 'DM Sans', sans-serif; color: #1c1a17; margin-bottom: 6px; }
.ip-risk-desc { display: block; font: 400 12px/1.4 'DM Sans', sans-serif; color: #8a7f74; }

/* KYC */
.ip-kyc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.ip-kyc-item-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #f9f7f5; border-radius: 8px; cursor: pointer; transition: background .15s; }
.ip-kyc-item-row:hover { background: #f4f1ee; }
.ip-kyc-item { display: flex; align-items: center; gap: 8px; font: 500 13px/1 'DM Sans', sans-serif; }
.ip-kyc-check { width: 20px; height: 20px; border-radius: 50%; background: #e4ddd4; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #8a7f74; }
.ip-kyc-item--done .ip-kyc-check { background: #2E8D5A; color: #fff; }

/* Investment cards */
.ip-invest-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.ip-invest-card { background: #fff; border-radius: 14px; border: 1px solid #e4ddd4; overflow: hidden; }
.ip-invest-card__header { display: flex; align-items: flex-start; justify-content: space-between; padding: 16px 18px 14px; border-top: 3px solid transparent; }
.ip-invest-card__brand { font: 600 11px/1 'DM Sans', sans-serif; text-transform: uppercase; letter-spacing: .06em; margin: 0 0 4px; }
.ip-invest-card__name  { font: 700 15px/1 'DM Sans', sans-serif; color: #1c1a17; margin: 0 0 3px; }
.ip-invest-card__loc   { font: 400 12px/1 'DM Sans', sans-serif; color: #8a7f74; margin: 0; }
.ip-invest-card__body { padding: 0 18px 14px; }
.ip-invest-kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 8px; }
.ip-invest-kpi--light { background: #f9f7f5; border-radius: 8px; padding: 10px; }
.ip-invest-kpi-item { display: flex; flex-direction: column; gap: 3px; }
.ip-invest-kpi-item span { font: 400 10px/1 'DM Sans', sans-serif; color: #8a7f74; }
.ip-invest-kpi-item strong { font: 700 13px/1 'DM Sans', sans-serif; color: #1c1a17; }
.ip-invest-card__actions { display: flex; gap: 6px; padding: 12px 18px; border-top: 1px solid #f4f1ee; }

/* Opportunities */
.ip-opp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.ip-opp-card { background: #fff; border-radius: 14px; border: 1px solid #e4ddd4; padding: 16px 18px; }
.ip-opp-card__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.ip-opp-brand { font: 700 11px/1 'DM Sans', sans-serif; text-transform: uppercase; letter-spacing: .06em; display: block; margin-bottom: 4px; }
.ip-opp-name { font: 700 14px/1.2 'DM Sans', sans-serif; color: #1c1a17; margin: 0 0 3px; }
.ip-opp-loc  { font: 400 12px/1 'DM Sans', sans-serif; color: #8a7f74; margin: 0; }
.ip-score-ring { flex-shrink: 0; }
.ip-opp-scores { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.ip-opp-score-row { display: flex; align-items: center; gap: 8px; font: 400 12px/1 'DM Sans', sans-serif; }
.ip-opp-score-row > span:first-child { width: 70px; color: #8a7f74; font-size: 11px; flex-shrink: 0; }
.ip-opp-score-row > span:last-child  { width: 32px; text-align: right; font-weight: 600; font-size: 11px; }
.ip-opp-bar { flex: 1; height: 4px; background: #f4f1ee; border-radius: 2px; overflow: hidden; }
.ip-opp-bar__fill { height: 100%; border-radius: 2px; transition: width .3s; }
.ip-opp-foot { display: flex; align-items: center; gap: 10px; font: 500 12px/1 'DM Sans', sans-serif; color: #8a7f74; }

/* Documents */
.ip-doc-grid { display: grid; gap: 8px; }
.ip-doc-card { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: #fff; border-radius: 10px; border: 1px solid #e4ddd4; }
.ip-doc-card__icon { font-size: 24px; flex-shrink: 0; }
.ip-doc-card__body { flex: 1; min-width: 0; }
.ip-doc-card__name { font: 600 13px/1 'DM Sans', sans-serif; color: #1c1a17; margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ip-doc-card__meta { font: 400 11px/1 'DM Sans', sans-serif; color: #8a7f74; margin: 0; }
.ip-doc-card__exp  { font: 500 11px/1 'DM Sans', sans-serif; margin: 3px 0 0; }
.ip-doc-card__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ip-doc-upload-list { display: flex; flex-direction: column; gap: 8px; }
.ip-doc-upload-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f4f1ee; }
.ip-doc-upload-row:last-child { border-bottom: none; }
.ip-doc-upload-label { flex: 1; font: 500 13px/1 'DM Sans', sans-serif; }

/* Contracts */
.ip-contract-list { display: flex; flex-direction: column; gap: 10px; }
.ip-contract-card { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #fff; border-radius: 12px; border: 1px solid #e4ddd4; }
.ip-contract-card__left { display: flex; align-items: flex-start; gap: 14px; flex: 1; }
.ip-contract-type-badge { font-size: 24px; flex-shrink: 0; }
.ip-contract-name { font: 700 14px/1 'DM Sans', sans-serif; color: #1c1a17; margin: 0 0 4px; }
.ip-contract-meta { font: 400 12px/1 'DM Sans', sans-serif; color: #8a7f74; margin: 0 0 3px; }
.ip-contract-dates { font: 400 11px/1 'DM Sans', sans-serif; color: #b0a89f; margin: 0; }
.ip-contract-card__right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
.ip-contract-card__right strong { font: 700 15px/1 'DM Sans', sans-serif; color: #1c1a17; }
.ip-contract-actions { display: flex; gap: 6px; }

/* Table */
.ip-table { width: 100%; border-collapse: collapse; font: 400 13px/1 'DM Sans', sans-serif; }
.ip-table th { font: 600 11px/1 'DM Sans', sans-serif; color: #8a7f74; text-transform: uppercase; letter-spacing: .05em; padding: 8px 12px; text-align: left; border-bottom: 1px solid #e4ddd4; }
.ip-table td { padding: 12px 12px; border-bottom: 1px solid #f4f1ee; color: #1c1a17; }
.ip-table tr:last-child td { border-bottom: none; }
.ip-td-mono { font-family: 'DM Mono', monospace; }
.ip-td-empty { text-align: center; color: #8a7f74; padding: 24px; }
.ip-brand-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }

/* Communication */
.ip-timeline { display: flex; flex-direction: column; gap: 0; }
.ip-tl-item { display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid #f4f1ee; }
.ip-tl-item:last-child { border-bottom: none; }
.ip-tl-dot { width: 28px; height: 28px; background: #f4f1ee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }
.ip-tl-body { flex: 1; }
.ip-tl-meta  { font: 400 11px/1 'DM Sans', sans-serif; color: #9e958c; margin: 0 0 4px; }
.ip-tl-title { font: 600 13px/1.3 'DM Sans', sans-serif; color: #1c1a17; margin: 0 0 3px; }
.ip-tl-sub   { font: 400 12px/1 'DM Sans', sans-serif; color: #8a7f74; margin: 0; display: flex; align-items: center; gap: 6px; }
.ip-tl-mini-item { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid #f4f1ee; }
.ip-tl-mini-item:last-child { border-bottom: none; }
.ip-tl-mini-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ip-tl-mini-title { font: 500 12px/1.3 'DM Sans', sans-serif; color: #1c1a17; margin: 0 0 2px; }
.ip-tl-mini-meta  { font: 400 11px/1 'DM Sans', sans-serif; color: #9e958c; display: flex; align-items: center; gap: 6px; }
.ip-tl-mini-amount { font: 700 13px/1 'DM Sans', sans-serif; color: #1c1a17; margin-left: auto; flex-shrink: 0; }
.ip-compose { display: flex; flex-direction: column; gap: 14px; }

/* Notes */
.ip-notice--private { background: #fff8ee; border: 1px solid #f5e6c8; border-radius: 8px; padding: 10px 16px; font: 500 12px/1.5 'DM Sans', sans-serif; color: #8a6020; }
.ip-notes-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.ip-note-item { display: flex; gap: 12px; }
.ip-note-avatar { width: 30px; height: 30px; border-radius: 50%; background: #8D1D2C; color: #fff; font: 700 12px/30px 'DM Sans', sans-serif; text-align: center; flex-shrink: 0; }
.ip-note-author { font: 600 11px/1 'DM Sans', sans-serif; color: #8a7f74; margin: 0 0 5px; }
.ip-note-text   { font: 400 13px/1.5 'DM Sans', sans-serif; color: #1c1a17; margin: 0; }
.ip-note-compose { display: flex; flex-direction: column; gap: 8px; padding-top: 14px; border-top: 1px solid #f4f1ee; }
.ip-internalanalysis { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* Charts */
.ip-chart-x { display: flex; justify-content: space-between; padding: 4px 8px 0; }
.ip-chart-x span { font: 400 9px/1 'DM Sans', sans-serif; color: #b0a89f; }
.ip-donut-row { display: flex; align-items: center; gap: 20px; margin-top: 8px; }
.ip-legend { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.ip-legend-item { display: flex; align-items: center; gap: 8px; }
.ip-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.ip-legend-label { font: 400 12px/1 'DM Sans', sans-serif; color: #4a443c; flex: 1; }
.ip-legend-val { font: 600 12px/1 'DM Sans', sans-serif; color: #1c1a17; }

/* Quick actions */
.ip-quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }
.ip-qa-btn { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #f9f7f5; border: 1.5px solid #e4ddd4; border-radius: 10px; font: 500 13px/1 'DM Sans', sans-serif; color: #1c1a17; cursor: pointer; transition: all .15s; text-align: left; }
.ip-qa-btn:hover { background: #fff; border-color: #1c1a17; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.ip-qa-icon { font-size: 16px; }

/* Utilities */
.ip-badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 5px; font: 600 11px/1 'DM Sans', sans-serif; letter-spacing: .02em; white-space: nowrap; }
.ip-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font: 600 12.5px/1 'DM Sans', sans-serif; cursor: pointer; border: 1.5px solid transparent; transition: all .15s; text-decoration: none; }
.ip-btn--primary { background: #8D1D2C; color: #fff; border-color: #8D1D2C; }
.ip-btn--primary:hover { background: #7a1826; }
.ip-btn--ghost { background: transparent; color: #4a443c; border-color: #e4ddd4; }
.ip-btn--ghost:hover { border-color: #1c1a17; color: #1c1a17; }
.ip-btn--sm { padding: 6px 12px; font-size: 12px; }
.ip-btn--xs { padding: 4px 10px; font-size: 11px; }
.ip-filter-bar { display: flex; gap: 4px; flex-wrap: wrap; }
.ip-filter-btn { padding: 5px 12px; border-radius: 20px; border: 1.5px solid #e4ddd4; background: transparent; font: 500 12px/1 'DM Sans', sans-serif; color: #8a7f74; cursor: pointer; transition: all .15s; }
.ip-filter-btn--active { background: #1c1a17; color: #fff; border-color: #1c1a17; }
.ip-section-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.ip-section-bar__count { font: 500 13px/1 'DM Sans', sans-serif; color: #8a7f74; }
.ip-empty { font: 400 13px/1.5 'DM Sans', sans-serif; color: #9e958c; }
.ip-empty-state { text-align: center; padding: 40px 20px; }
.ip-empty-state p { color: #9e958c; font: 400 14px/1 'DM Sans', sans-serif; margin: 0 0 12px; }

/* Loading / error */
.ip-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; color: #8a7f74; font: 400 14px/1 'DM Sans', sans-serif; }
.ip-loading-spinner { width: 32px; height: 32px; border: 3px solid #e4ddd4; border-top-color: #8D1D2C; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ip-error { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; }

@media (max-width: 900px) {
  .ip-stats-grid { grid-template-columns: repeat(3, 1fr); }
  .ip-two-col, .ip-two-col--wide { grid-template-columns: 1fr; }
  .ip-invest-grid, .ip-opp-grid { grid-template-columns: 1fr; }
  .ip-field-grid { grid-template-columns: 1fr; }
  .ip-header { padding: 12px 16px; }
  .ip-header__kpis { display: none; }
  .ip-tab-bar { padding: 0 16px; }
  .ip-main { padding: 20px 16px 60px; }
  .ip-kyc-grid { grid-template-columns: 1fr; }
  .ip-risk-grid { grid-template-columns: 1fr; }
  .ip-quick-actions { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .ip-stats-grid { grid-template-columns: repeat(2, 1fr); }
}
`;

const styleEl = document.createElement('style');
styleEl.textContent = CSS;
document.head.appendChild(styleEl);

ReactDOM.createRoot(document.getElementById('root')).render(<InvestorProfileApp />);
