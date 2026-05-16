'use strict';
// New Brand — 8-step creation wizard (admin only)
const { useState, useEffect, useRef, useCallback } = React;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const LANGS = ['fr', 'nl', 'en', 'pl'];
const LANG_LABELS = { fr: 'FR', nl: 'NL', en: 'EN', pl: 'PL' };

const STEPS = [
  { id: 'identity',    label: 'Identity',    icon: '🏷️'  },
  { id: 'visual',      label: 'Visual',      icon: '🎨'  },
  { id: 'positioning', label: 'Positioning', icon: '🎯'  },
  { id: 'operations',  label: 'Operations',  icon: '🏪'  },
  { id: 'financials',  label: 'Financials',  icon: '💰'  },
  { id: 'legal',       label: 'Legal',       icon: '⚖️'  },
  { id: 'network',     label: 'Network',     icon: '🌐'  },
  { id: 'review',      label: 'Review',      icon: '✅'  },
];

const SHARE_CLASS_COLORS = { A: '#8D1D2C', B: '#2E6B8D', C: '#2E8D5A', D: '#8D6B2E' };

const API_BASE = '/api';

function getToken() {
  try { return JSON.parse(localStorage.getItem('fg_auth') || '{}').token || ''; } catch { return ''; }
}

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || res.statusText);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Empty form state factory
// ---------------------------------------------------------------------------
function emptyML() { return { fr: '', nl: '', en: '', pl: '' }; }
function emptyForm() {
  return {
    // Step 1 — Identity
    name: '',
    legalName: '',
    countryOfOrigin: 'BE',
    yearFounded: new Date().getFullYear(),
    status: 'in-development',
    tagline: emptyML(),
    story: emptyML(),
    brandManager: '',
    internalNotes: '',
    isDraft: true,

    // Step 2 — Visual
    logoUrl: '',
    logoMarkUrl: '',
    palette: { primary: '#333333', secondary: '#F5F5F5', accent: '#333333', ink: '#1c1a17', bg: '#FAFAFA', surface: '#FFFFFF' },
    typography: { fontDisplay: '"DM Sans", system-ui, sans-serif', fontUi: '"DM Sans", system-ui, sans-serif', fontAccent: '"DM Sans", system-ui, sans-serif' },
    taglineVisual: '',

    // Step 3 — Positioning
    mission: emptyML(),
    vision: emptyML(),
    values: emptyML(),
    targetPersonas: [],
    competitors: [],
    usp: emptyML(),

    // Step 4 — Operations
    storeFormat: '',
    avgSurface: '',
    staffCount: '',
    openingHours: '',
    supplyChain: emptyML(),
    trainingProgram: emptyML(),
    techStack: [],

    // Step 5 — Financials
    entryFee: '',
    royaltyRate: '',
    marketingFee: '',
    avgInvestment: '',
    breakEvenMonths: '',
    avgRevenue: '',
    ebitdaMargin: '',
    capTable: [],

    // Step 6 — Legal
    contractDuration: '',
    renewalTerms: emptyML(),
    exclusivityZone: emptyML(),
    gdprCompliant: true,
    auditFrequency: '',
    insuranceRequired: emptyML(),

    // Step 7 — Network
    totalUnits: '',
    countriesPresent: [],
    expansionTargets: [],
    masterFranchise: false,
    internationalRights: emptyML(),

    // Step 8 — Review (no extra fields)
  };
}

// ---------------------------------------------------------------------------
// Reusable field components
// ---------------------------------------------------------------------------

// Multilingual text field with language tabs
function MLField({ label, value, onChange, multiline = false, help, required }) {
  const [activeLang, setActiveLang] = useState('fr');
  const v = value || emptyML();

  return (
    <div className="bc-field">
      {label && <label className="bc-label">{label}{required && <span className="bc-req"> *</span>}</label>}
      <div className="bc-lang-tabs">
        {LANGS.map(l => (
          <button key={l} type="button"
            className={`bc-lang-tab${activeLang === l ? ' bc-lang-tab--active' : ''}`}
            onClick={() => setActiveLang(l)}>
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>
      {multiline ? (
        <textarea
          className="bc-input bc-textarea"
          value={v[activeLang] || ''}
          onChange={e => onChange({ ...v, [activeLang]: e.target.value })}
          rows={4}
          placeholder={`${label} (${activeLang.toUpperCase()})`}
        />
      ) : (
        <input
          type="text"
          className="bc-input"
          value={v[activeLang] || ''}
          onChange={e => onChange({ ...v, [activeLang]: e.target.value })}
          placeholder={`${label} (${activeLang.toUpperCase()})`}
        />
      )}
      {help && <p className="bc-help">{help}</p>}
    </div>
  );
}

// Simple text / number / select field
function Field({ label, value, onChange, type = 'text', options, help, required, placeholder, min, max }) {
  return (
    <div className="bc-field">
      {label && <label className="bc-label">{label}{required && <span className="bc-req"> *</span>}</label>}
      {options ? (
        <select className="bc-input bc-select" value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="bc-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || ''}
          required={required}
          min={min}
          max={max}
        />
      )}
      {help && <p className="bc-help">{help}</p>}
    </div>
  );
}

// Color field with swatch + hex input
function ColorField({ label, value, onChange }) {
  return (
    <div className="bc-field bc-field--color">
      {label && <label className="bc-label">{label}</label>}
      <div className="bc-color-row">
        <input type="color" className="bc-color-swatch" value={value || '#333333'} onChange={e => onChange(e.target.value)} />
        <input type="text" className="bc-input bc-color-hex" value={value || '#333333'}
          onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value); }}
          maxLength={7} />
      </div>
    </div>
  );
}

// Chip-based array field (comma-separated strings)
function ChipField({ label, value = [], onChange, placeholder, help }) {
  const [input, setInput] = useState('');

  const addChip = () => {
    const v = input.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInput('');
  };

  return (
    <div className="bc-field">
      {label && <label className="bc-label">{label}</label>}
      <div className="bc-chips">
        {value.map((c, i) => (
          <span key={i} className="bc-chip">
            {c}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
        <input
          type="text"
          className="bc-chip-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addChip(); }}}
          placeholder={placeholder || 'Add…'}
        />
      </div>
      {help && <p className="bc-help">{help}</p>}
    </div>
  );
}

// Cap table row entry (share class + holder + %)
function CapTableField({ value = [], onChange, shareClasses }) {
  const emptyRow = () => ({ shareClass: 'A', holder: '', percentage: '' });
  const update = (i, patch) => {
    const rows = [...value];
    rows[i] = { ...rows[i], ...patch };
    onChange(rows);
  };

  return (
    <div className="bc-field">
      <label className="bc-label">Cap Table</label>
      <div className="bc-captable">
        {value.map((row, i) => (
          <div key={i} className="bc-captable-row">
            <select className="bc-input bc-select bc-captable-class"
              value={row.shareClass}
              onChange={e => update(i, { shareClass: e.target.value })}
              style={{ borderLeft: `3px solid ${SHARE_CLASS_COLORS[row.shareClass] || '#ccc'}` }}>
              {(shareClasses || []).map(sc => (
                <option key={sc.id} value={sc.id}>Class {sc.id} — {sc.name}</option>
              ))}
            </select>
            <input type="text" className="bc-input bc-captable-holder"
              value={row.holder} onChange={e => update(i, { holder: e.target.value })} placeholder="Holder name" />
            <input type="number" className="bc-input bc-captable-pct"
              value={row.percentage} onChange={e => update(i, { percentage: e.target.value })} placeholder="%" min="0" max="100" />
            <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm"
              onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm"
          onClick={() => onChange([...value, emptyRow()])}>+ Add row</button>
      </div>
      <p className="bc-help">Total: {value.reduce((s, r) => s + (parseFloat(r.percentage) || 0), 0).toFixed(1)}%</p>
    </div>
  );
}

// Toggle / checkbox field
function ToggleField({ label, value, onChange, help }) {
  return (
    <div className="bc-field bc-field--toggle">
      <label className="bc-toggle-row">
        <span className="bc-label" style={{ margin: 0 }}>{label}</span>
        <button type="button" className={`bc-toggle${value ? ' bc-toggle--on' : ''}`} onClick={() => onChange(!value)}>
          <span className="bc-toggle-knob" />
        </button>
      </label>
      {help && <p className="bc-help">{help}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step panels
// ---------------------------------------------------------------------------

function StepIdentity({ form, set }) {
  return (
    <div className="bc-step-body">
      <div className="bc-grid bc-grid--2">
        <Field label="Brand Name" value={form.name} onChange={v => set('name', v)} required placeholder="e.g. L'Atelier By" />
        <Field label="Legal Name" value={form.legalName} onChange={v => set('legalName', v)} placeholder="Registered legal entity name" />
      </div>
      <div className="bc-grid bc-grid--3">
        <Field label="Country of Origin" value={form.countryOfOrigin} onChange={v => set('countryOfOrigin', v)}
          options={[
            {value:'BE',label:'Belgium'},{value:'FR',label:'France'},{value:'NL',label:'Netherlands'},
            {value:'LU',label:'Luxembourg'},{value:'DE',label:'Germany'},{value:'UK',label:'United Kingdom'},
            {value:'US',label:'United States'},{value:'OTHER',label:'Other'},
          ]} />
        <Field label="Year Founded" value={form.yearFounded} onChange={v => set('yearFounded', v)} type="number" min="1900" max={new Date().getFullYear()} />
        <Field label="Status" value={form.status} onChange={v => set('status', v)}
          options={[
            {value:'in-development',label:'In Development'},
            {value:'active',label:'Active'},
            {value:'paused',label:'Paused'},
            {value:'archived',label:'Archived'},
          ]} />
      </div>
      <MLField label="Tagline" value={form.tagline} onChange={v => set('tagline', v)} required help="Short brand promise (max ~80 chars per language)" />
      <MLField label="Brand Story" value={form.story} onChange={v => set('story', v)} multiline help="2–4 paragraphs describing origin, mission and culture." />
      <div className="bc-grid bc-grid--2">
        <Field label="Brand Manager (email)" value={form.brandManager} onChange={v => set('brandManager', v)} type="email" placeholder="manager@fg.be" />
        <ToggleField label="Save as Draft" value={form.isDraft} onChange={v => set('isDraft', v)} help="Draft brands are visible to admins only." />
      </div>
      <div className="bc-field">
        <label className="bc-label">Internal Notes</label>
        <textarea className="bc-input bc-textarea" rows={3} value={form.internalNotes}
          onChange={e => set('internalNotes', e.target.value)} placeholder="Private notes for the team (not shown on any portal)" />
      </div>
    </div>
  );
}

function StepVisual({ form, set }) {
  const preview = {
    name: form.name || 'Brand Name',
    primary: form.palette.primary,
    secondary: form.palette.secondary,
    accent: form.palette.accent,
    ink: form.palette.ink,
    bg: form.palette.bg,
    surface: form.palette.surface,
    fontDisplay: form.typography.fontDisplay,
    tagline: form.taglineVisual || form.tagline?.fr || 'Tagline preview',
    logoMark: form.name ? form.name[0].toUpperCase() : 'B',
  };

  return (
    <div className="bc-step-body bc-step-body--visual">
      <div className="bc-visual-left">
        <div className="bc-grid bc-grid--2">
          <Field label="Logo URL" value={form.logoUrl} onChange={v => set('logoUrl', v)} placeholder="https://…/logo.svg" help="Main horizontal logo (SVG preferred)" />
          <Field label="Logo Mark URL" value={form.logoMarkUrl} onChange={v => set('logoMarkUrl', v)} placeholder="https://…/mark.svg" help="Square icon / mark (used in sidebar)" />
        </div>
        <div className="bc-palette-grid">
          <ColorField label="Primary" value={form.palette.primary} onChange={v => set('palette', { ...form.palette, primary: v })} />
          <ColorField label="Secondary" value={form.palette.secondary} onChange={v => set('palette', { ...form.palette, secondary: v })} />
          <ColorField label="Accent" value={form.palette.accent} onChange={v => set('palette', { ...form.palette, accent: v })} />
          <ColorField label="Ink (text)" value={form.palette.ink} onChange={v => set('palette', { ...form.palette, ink: v })} />
          <ColorField label="Background" value={form.palette.bg} onChange={v => set('palette', { ...form.palette, bg: v })} />
          <ColorField label="Surface" value={form.palette.surface} onChange={v => set('palette', { ...form.palette, surface: v })} />
        </div>
        <div className="bc-grid bc-grid--2" style={{ marginTop: 16 }}>
          <Field label="Display Font" value={form.typography.fontDisplay} onChange={v => set('typography', { ...form.typography, fontDisplay: v })} placeholder='"DM Sans", sans-serif' />
          <Field label="UI Font" value={form.typography.fontUi} onChange={v => set('typography', { ...form.typography, fontUi: v })} placeholder='"DM Sans", sans-serif' />
        </div>
      </div>
      <div className="bc-visual-right">
        <p className="bc-preview-label">Live Preview</p>
        <div className="bc-brand-card-preview" style={{ background: preview.bg, borderColor: preview.secondary }}>
          <div className="bc-bcp-header" style={{ background: preview.primary }}>
            {form.logoUrl
              ? <img src={form.logoUrl} alt="logo" className="bc-bcp-logo" />
              : <div className="bc-bcp-mark" style={{ background: preview.accent, color: '#fff', fontFamily: preview.fontDisplay }}>{preview.logoMark}</div>
            }
          </div>
          <div className="bc-bcp-body" style={{ background: preview.surface }}>
            <p className="bc-bcp-name" style={{ color: preview.ink, fontFamily: preview.fontDisplay }}>{preview.name}</p>
            <p className="bc-bcp-tagline" style={{ color: preview.ink + '99' }}>{preview.tagline}</p>
            <div className="bc-bcp-palette">
              {[preview.primary, preview.secondary, preview.accent, preview.ink].map((c, i) => (
                <span key={i} className="bc-bcp-dot" style={{ background: c }} title={c} />
              ))}
            </div>
            <div className="bc-bcp-btns">
              <button style={{ background: preview.primary, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontFamily: preview.fontDisplay, fontSize: 12 }}>
                Découvrir
              </button>
              <button style={{ background: 'transparent', color: preview.primary, border: `1.5px solid ${preview.primary}`, borderRadius: 6, padding: '6px 14px', fontFamily: preview.fontDisplay, fontSize: 12 }}>
                En savoir +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPositioning({ form, set }) {
  return (
    <div className="bc-step-body">
      <MLField label="Mission" value={form.mission} onChange={v => set('mission', v)} multiline help="What the brand does and for whom." />
      <MLField label="Vision" value={form.vision} onChange={v => set('vision', v)} multiline help="Where the brand aspires to be in 10 years." />
      <MLField label="Values" value={form.values} onChange={v => set('values', v)} multiline help="Core values (one per line recommended)." />
      <MLField label="Unique Selling Proposition" value={form.usp} onChange={v => set('usp', v)} help="The one thing that differentiates this brand." />
      <div className="bc-grid bc-grid--2">
        <ChipField label="Target Personas" value={form.targetPersonas} onChange={v => set('targetPersonas', v)}
          placeholder="e.g. Urban families" help="Press Enter or comma to add" />
        <ChipField label="Competitors" value={form.competitors} onChange={v => set('competitors', v)}
          placeholder="e.g. McDonald's" help="Direct and indirect competitors" />
      </div>
    </div>
  );
}

function StepOperations({ form, set }) {
  return (
    <div className="bc-step-body">
      <div className="bc-grid bc-grid--3">
        <Field label="Store Format" value={form.storeFormat} onChange={v => set('storeFormat', v)}
          options={[
            {value:'',label:'— Select —'},
            {value:'street',label:'Street / High Street'},
            {value:'mall',label:'Shopping Mall'},
            {value:'corner',label:'Corner / Kiosk'},
            {value:'dark-kitchen',label:'Dark Kitchen'},
            {value:'pop-up',label:'Pop-up'},
            {value:'hybrid',label:'Hybrid'},
          ]} />
        <Field label="Avg. Surface (m²)" value={form.avgSurface} onChange={v => set('avgSurface', v)} type="number" placeholder="80" />
        <Field label="Staff Count (typical)" value={form.staffCount} onChange={v => set('staffCount', v)} type="number" placeholder="5" />
      </div>
      <div className="bc-grid bc-grid--2">
        <Field label="Opening Hours" value={form.openingHours} onChange={v => set('openingHours', v)} placeholder="Mon–Sun 08:00–21:00" />
        <ChipField label="Tech Stack" value={form.techStack} onChange={v => set('techStack', v)} placeholder="e.g. Lightspeed POS" help="POS, booking, loyalty tools…" />
      </div>
      <MLField label="Supply Chain" value={form.supplyChain} onChange={v => set('supplyChain', v)} multiline help="Key suppliers, sourcing strategy, delivery frequency." />
      <MLField label="Training Program" value={form.trainingProgram} onChange={v => set('trainingProgram', v)} multiline help="Onboarding process, duration, certifications required." />
    </div>
  );
}

function StepFinancials({ form, set, shareClasses }) {
  return (
    <div className="bc-step-body">
      <div className="bc-grid bc-grid--3">
        <Field label="Entry Fee (€)" value={form.entryFee} onChange={v => set('entryFee', v)} type="number"
          help="One-time franchise entry fee" placeholder="25000" />
        <Field label="Royalty Rate (%)" value={form.royaltyRate} onChange={v => set('royaltyRate', v)} type="number"
          help="Monthly % of revenue paid to FG" placeholder="6" min="0" max="100" />
        <Field label="Marketing Fee (%)" value={form.marketingFee} onChange={v => set('marketingFee', v)} type="number"
          help="Contribution to shared marketing pool" placeholder="2" min="0" max="100" />
      </div>
      <div className="bc-grid bc-grid--3">
        <Field label="Avg. Total Investment (€)" value={form.avgInvestment} onChange={v => set('avgInvestment', v)} type="number"
          help="Fit-out + stock + WC for a new franchisee" placeholder="120000" />
        <Field label="Break-even (months)" value={form.breakEvenMonths} onChange={v => set('breakEvenMonths', v)} type="number"
          help="Average months to operational break-even" placeholder="18" />
        <Field label="Avg. Annual Revenue (€)" value={form.avgRevenue} onChange={v => set('avgRevenue', v)} type="number"
          help="Median store revenue per year" placeholder="500000" />
      </div>
      <Field label="EBITDA Margin (%)" value={form.ebitdaMargin} onChange={v => set('ebitdaMargin', v)} type="number"
        help="Typical franchisee EBITDA margin at maturity" placeholder="14" min="0" max="100" />

      <div className="bc-share-classes">
        <p className="bc-label" style={{ marginBottom: 8 }}>Share Class Reference</p>
        {(shareClasses || []).map(sc => (
          <div key={sc.id} className="bc-sc-card" style={{ borderLeftColor: SHARE_CLASS_COLORS[sc.id] }}>
            <span className="bc-sc-badge" style={{ background: SHARE_CLASS_COLORS[sc.id] }}>Class {sc.id}</span>
            <strong>{sc.name}</strong>
            <span className="bc-sc-desc">{sc.description}</span>
          </div>
        ))}
      </div>
      <CapTableField value={form.capTable} onChange={v => set('capTable', v)} shareClasses={shareClasses} />
    </div>
  );
}

function StepLegal({ form, set }) {
  return (
    <div className="bc-step-body">
      <div className="bc-grid bc-grid--2">
        <Field label="Contract Duration (years)" value={form.contractDuration} onChange={v => set('contractDuration', v)} type="number" placeholder="5" />
        <Field label="Audit Frequency" value={form.auditFrequency} onChange={v => set('auditFrequency', v)}
          options={[
            {value:'',label:'— Select —'},
            {value:'monthly',label:'Monthly'},
            {value:'quarterly',label:'Quarterly'},
            {value:'biannual',label:'Bi-annual'},
            {value:'annual',label:'Annual'},
          ]} />
      </div>
      <div className="bc-grid bc-grid--2">
        <ToggleField label="GDPR Compliant" value={form.gdprCompliant} onChange={v => set('gdprCompliant', v)}
          help="Brand has completed GDPR compliance review" />
      </div>
      <MLField label="Renewal Terms" value={form.renewalTerms} onChange={v => set('renewalTerms', v)} multiline
        help="Conditions for renewal, early exit clauses, notice periods." />
      <MLField label="Exclusivity Zone" value={form.exclusivityZone} onChange={v => set('exclusivityZone', v)}
        help="How the exclusivity territory is defined (radius, commune, etc.)." />
      <MLField label="Insurance Requirements" value={form.insuranceRequired} onChange={v => set('insuranceRequired', v)} multiline
        help="Mandatory insurance policies the franchisee must hold." />
    </div>
  );
}

function StepNetwork({ form, set }) {
  return (
    <div className="bc-step-body">
      <div className="bc-grid bc-grid--3">
        <Field label="Current Total Units" value={form.totalUnits} onChange={v => set('totalUnits', v)} type="number" placeholder="12" />
        <ToggleField label="Master Franchise Available" value={form.masterFranchise} onChange={v => set('masterFranchise', v)} help="Allow master franchise agreements" />
      </div>
      <div className="bc-grid bc-grid--2">
        <ChipField label="Countries Present" value={form.countriesPresent} onChange={v => set('countriesPresent', v)}
          placeholder="BE" help="ISO codes or country names" />
        <ChipField label="Expansion Targets" value={form.expansionTargets} onChange={v => set('expansionTargets', v)}
          placeholder="FR" help="Priority markets for expansion" />
      </div>
      <MLField label="International Rights Policy" value={form.internationalRights} onChange={v => set('internationalRights', v)} multiline
        help="How international rights are granted and managed." />
    </div>
  );
}

function StepReview({ form, shareClasses, error, saving }) {
  const sections = [
    { title: 'Identity', items: [
      ['Name', form.name], ['Legal Name', form.legalName], ['Status', form.status],
      ['Country', form.countryOfOrigin], ['Founded', form.yearFounded],
      ['Tagline (FR)', form.tagline?.fr], ['Manager', form.brandManager],
    ]},
    { title: 'Visual', items: [
      ['Primary', form.palette.primary], ['Secondary', form.palette.secondary],
      ['Accent', form.palette.accent], ['Font Display', form.typography.fontDisplay],
    ]},
    { title: 'Positioning', items: [
      ['Mission (FR)', form.mission?.fr], ['USP (FR)', form.usp?.fr],
      ['Personas', (form.targetPersonas || []).join(', ')],
      ['Competitors', (form.competitors || []).join(', ')],
    ]},
    { title: 'Operations', items: [
      ['Format', form.storeFormat], ['Surface', form.avgSurface ? form.avgSurface + ' m²' : ''],
      ['Staff', form.staffCount], ['Hours', form.openingHours],
    ]},
    { title: 'Financials', items: [
      ['Entry Fee', form.entryFee ? '€' + Number(form.entryFee).toLocaleString() : ''],
      ['Royalty', form.royaltyRate ? form.royaltyRate + '%' : ''],
      ['Avg Investment', form.avgInvestment ? '€' + Number(form.avgInvestment).toLocaleString() : ''],
      ['Break-even', form.breakEvenMonths ? form.breakEvenMonths + ' months' : ''],
      ['Cap Table rows', form.capTable?.length || 0],
    ]},
    { title: 'Legal', items: [
      ['Contract', form.contractDuration ? form.contractDuration + ' years' : ''],
      ['GDPR', form.gdprCompliant ? 'Yes' : 'No'], ['Audits', form.auditFrequency],
    ]},
    { title: 'Network', items: [
      ['Units', form.totalUnits], ['Countries', (form.countriesPresent || []).join(', ')],
      ['Targets', (form.expansionTargets || []).join(', ')],
      ['Master Franchise', form.masterFranchise ? 'Yes' : 'No'],
    ]},
  ];

  return (
    <div className="bc-step-body">
      {error && <div className="bc-alert bc-alert--error">{error}</div>}
      {saving && <div className="bc-alert bc-alert--info">Saving…</div>}
      <div className="bc-review-grid">
        {sections.map(s => (
          <div key={s.title} className="bc-review-card">
            <p className="bc-review-card__title">{s.title}</p>
            {s.items.filter(([, v]) => v !== undefined && v !== '' && v !== null).map(([k, v]) => (
              <div key={k} className="bc-review-row">
                <span className="bc-review-key">{k}</span>
                <span className="bc-review-val">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Auto-save hook
// ---------------------------------------------------------------------------
function useAutoSave(form, key = 'fg_brand_draft') {
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      localStorage.setItem(key, JSON.stringify(form));
      setLastSaved(new Date());
    }, 30000);
    return () => clearInterval(id);
  }, [form, key]);

  const load = useCallback(() => {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }, [key]);

  const clear = useCallback(() => localStorage.removeItem(key), [key]);

  return { lastSaved, load, clear };
}

// ---------------------------------------------------------------------------
// Main app
// ---------------------------------------------------------------------------
function BrandCreateApp() {
  const currentUser = window.FG_CURRENT_USER || {};
  const [step, setStep] = useState(0);
  const [form, setFormRaw] = useState(() => {
    const draft = (() => { try { return JSON.parse(localStorage.getItem('fg_brand_draft')); } catch { return null; } })();
    if (draft) return draft;
    const f = emptyForm();
    f.brandManager = currentUser.email || '';
    return f;
  });
  const [shareClasses, setShareClasses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { lastSaved, clear: clearDraft } = useAutoSave(form);

  // Fetch share classes from API
  useEffect(() => {
    apiFetch('/brands/share-classes')
      .then(r => setShareClasses(r.data || []))
      .catch(() => setShareClasses([
        { id: 'A', name: 'Founders', description: '10× voting rights' },
        { id: 'B', name: 'Investors', description: 'Non-voting preferred' },
        { id: 'C', name: 'Ecosystem Partners', description: 'Advisory role' },
        { id: 'D', name: 'Employee ESOP', description: 'Equity incentive plan' },
      ]));
  }, []);

  function set(key, value) {
    setFormRaw(f => ({ ...f, [key]: value }));
    setError('');
  }

  const totalSteps = STEPS.length;
  const isLast = step === totalSteps - 1;

  const buildPayload = (isDraft) => ({
    name: form.name,
    legalName: form.legalName,
    countryOfOrigin: form.countryOfOrigin,
    yearFounded: parseInt(form.yearFounded) || new Date().getFullYear(),
    status: isDraft ? 'in-development' : form.status,
    isDraft,
    tagline: form.tagline,
    story: form.story,
    brandManager: form.brandManager,
    internalNotes: form.internalNotes,
    visual: {
      logos: { main: form.logoUrl, mark: form.logoMarkUrl },
      palette: {
        primary: { hex: form.palette.primary },
        secondary: { hex: form.palette.secondary },
        accent: { hex: form.palette.accent },
        ink: { hex: form.palette.ink },
        bg: { hex: form.palette.bg },
        surface: { hex: form.palette.surface },
      },
      typography: form.typography,
    },
    'visual.palette.primary.hex': form.palette.primary,
    'visual.palette.secondary.hex': form.palette.secondary,
    'visual.logos.main': form.logoUrl,
    positioning: {
      mission: form.mission,
      vision: form.vision,
      values: form.values,
      usp: form.usp,
      targetPersonas: form.targetPersonas,
      competitors: form.competitors,
    },
    operations: {
      storeFormat: form.storeFormat,
      avgSurface: form.avgSurface,
      staffCount: form.staffCount,
      openingHours: form.openingHours,
      supplyChain: form.supplyChain,
      trainingProgram: form.trainingProgram,
      techStack: form.techStack,
    },
    financials: {
      entryFee: parseFloat(form.entryFee) || 0,
      royaltyRate: parseFloat(form.royaltyRate) || 0,
      marketingFee: parseFloat(form.marketingFee) || 0,
      avgInvestment: parseFloat(form.avgInvestment) || 0,
      breakEvenMonths: parseInt(form.breakEvenMonths) || 0,
      avgRevenue: parseFloat(form.avgRevenue) || 0,
      ebitdaMargin: parseFloat(form.ebitdaMargin) || 0,
      capTable: form.capTable,
    },
    legal: {
      contractDuration: parseInt(form.contractDuration) || 0,
      renewalTerms: form.renewalTerms,
      exclusivityZone: form.exclusivityZone,
      gdprCompliant: form.gdprCompliant,
      auditFrequency: form.auditFrequency,
      insuranceRequired: form.insuranceRequired,
    },
    network: {
      totalUnits: parseInt(form.totalUnits) || 0,
      countriesPresent: form.countriesPresent,
      expansionTargets: form.expansionTargets,
      masterFranchise: form.masterFranchise,
      internationalRights: form.internationalRights,
    },
    tokens: {
      primary: form.palette.primary,
      secondary: form.palette.secondary,
      accent: form.palette.accent,
      ink: form.palette.ink,
      bg: form.palette.bg,
      surface: form.palette.surface,
      fontDisplay: form.typography.fontDisplay,
      fontUi: form.typography.fontUi,
      fontAccent: form.typography.fontAccent || form.typography.fontDisplay,
    },
  });

  const handleSave = async (isDraft) => {
    if (!form.name.trim()) { setError('Brand name is required.'); setStep(0); return; }
    setSaving(true);
    setError('');
    try {
      await apiFetch('/brands', {
        method: 'POST',
        body: JSON.stringify(buildPayload(isDraft)),
      });
      clearDraft();
      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Save failed — check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step === 0 && !form.name.trim()) { setError('Brand name is required before proceeding.'); return; }
    setError('');
    setStep(s => Math.min(s + 1, totalSteps - 1));
  };

  const handleBack = () => { setError(''); setStep(s => Math.max(s - 1, 0)); };

  if (success) {
    return (
      <div className="bc-wrap">
        <div className="bc-success">
          <div className="bc-success-icon">🎉</div>
          <h2>Brand created!</h2>
          <p><strong>{form.name}</strong> has been saved{form.isDraft ? ' as a draft' : ' and published'}.</p>
          <div className="bc-success-actions">
            <a href="backoffice.html" className="bc-btn bc-btn--primary">Back to Back Office</a>
            <button type="button" className="bc-btn bc-btn--ghost"
              onClick={() => { setFormRaw(emptyForm()); setStep(0); setSuccess(false); }}>
              Create another brand
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepProps = { form, set, shareClasses, error, saving };

  const panels = [
    <StepIdentity {...stepProps} />,
    <StepVisual {...stepProps} />,
    <StepPositioning {...stepProps} />,
    <StepOperations {...stepProps} />,
    <StepFinancials {...stepProps} />,
    <StepLegal {...stepProps} />,
    <StepNetwork {...stepProps} />,
    <StepReview {...stepProps} />,
  ];

  return (
    <div className="bc-wrap">
      {/* Header */}
      <header className="bc-header">
        <a href="backoffice.html" className="bc-back-link">← Back Office</a>
        <div className="bc-header-center">
          <h1 className="bc-title">New Brand</h1>
          {lastSaved && (
            <span className="bc-autosave">Auto-saved {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
        <div className="bc-header-actions">
          <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" disabled={saving}
            onClick={() => handleSave(true)}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
        </div>
      </header>

      {/* Stepper */}
      <nav className="bc-stepper">
        {STEPS.map((s, i) => (
          <button key={s.id} type="button"
            className={`bc-step-tab${i === step ? ' bc-step-tab--active' : ''}${i < step ? ' bc-step-tab--done' : ''}`}
            onClick={() => setStep(i)}>
            <span className="bc-step-tab__icon">{i < step ? '✓' : s.icon}</span>
            <span className="bc-step-tab__label">{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Step content */}
      <main className="bc-main">
        <div className="bc-step-header">
          <span className="bc-step-num">Step {step + 1} / {totalSteps}</span>
          <h2 className="bc-step-title">{STEPS[step].icon} {STEPS[step].label}</h2>
        </div>

        {error && <div className="bc-alert bc-alert--error">{error}</div>}

        {panels[step]}

        {/* Navigation */}
        <div className="bc-step-nav">
          <button type="button" className="bc-btn bc-btn--ghost" onClick={handleBack} disabled={step === 0}>
            ← Back
          </button>
          {isLast ? (
            <div className="bc-final-actions">
              <button type="button" className="bc-btn bc-btn--ghost" disabled={saving}
                onClick={() => handleSave(true)}>Save Draft</button>
              <button type="button" className="bc-btn bc-btn--primary" disabled={saving}
                onClick={() => handleSave(false)}>
                {saving ? 'Publishing…' : 'Publish Brand'}
              </button>
            </div>
          ) : (
            <button type="button" className="bc-btn bc-btn--primary" onClick={handleNext}>
              Continue →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline CSS
// ---------------------------------------------------------------------------
const BRAND_CREATE_CSS = `
.bc-wrap { min-height: 100vh; background: #f4f1ee; font-family: 'DM Sans', system-ui, sans-serif; color: #1c1a17; }
.bc-header { display: flex; align-items: center; gap: 16px; padding: 16px 32px; background: #fff; border-bottom: 1px solid #e4ddd4; position: sticky; top: 0; z-index: 100; }
.bc-back-link { font: 500 13px/1 'DM Sans', system-ui, sans-serif; color: #8a7f74; text-decoration: none; white-space: nowrap; }
.bc-back-link:hover { color: #1c1a17; }
.bc-header-center { flex: 1; text-align: center; }
.bc-title { font: 600 18px/1 'DM Sans', system-ui, sans-serif; color: #1c1a17; margin: 0; }
.bc-autosave { display: block; font: 400 11px/1 'DM Sans', system-ui, sans-serif; color: #9e958c; margin-top: 3px; }
.bc-header-actions { display: flex; gap: 8px; }

.bc-stepper { display: flex; gap: 2px; padding: 0 32px; background: #fff; border-bottom: 1px solid #e4ddd4; overflow-x: auto; scrollbar-width: none; }
.bc-stepper::-webkit-scrollbar { display: none; }
.bc-step-tab { display: flex; align-items: center; gap: 6px; padding: 12px 14px; background: none; border: none; cursor: pointer; font: 500 12px/1 'DM Sans', system-ui, sans-serif; color: #8a7f74; border-bottom: 2px solid transparent; white-space: nowrap; transition: all .15s; }
.bc-step-tab:hover { color: #1c1a17; }
.bc-step-tab--active { color: #8D1D2C; border-bottom-color: #8D1D2C; }
.bc-step-tab--done { color: #2E8D5A; }
.bc-step-tab__icon { font-size: 14px; }

.bc-main { max-width: 860px; margin: 0 auto; padding: 32px 24px 80px; }
.bc-step-header { margin-bottom: 28px; }
.bc-step-num { font: 400 12px/1 'DM Sans', system-ui, sans-serif; color: #9e958c; }
.bc-step-title { font: 600 24px/1 'DM Sans', system-ui, sans-serif; color: #1c1a17; margin: 6px 0 0; }
.bc-step-body { display: flex; flex-direction: column; gap: 20px; }
.bc-step-body--visual { flex-direction: row; gap: 32px; align-items: flex-start; }
.bc-visual-left { flex: 1; display: flex; flex-direction: column; gap: 20px; }
.bc-visual-right { width: 240px; flex-shrink: 0; position: sticky; top: 100px; }

.bc-grid { display: grid; gap: 16px; }
.bc-grid--2 { grid-template-columns: repeat(2, 1fr); }
.bc-grid--3 { grid-template-columns: repeat(3, 1fr); }
.bc-palette-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

.bc-field { display: flex; flex-direction: column; gap: 5px; }
.bc-field--color { gap: 6px; }
.bc-field--toggle { }
.bc-label { font: 600 12px/1 'DM Sans', system-ui, sans-serif; color: #4a443c; letter-spacing: .02em; }
.bc-req { color: #c0392b; }
.bc-help { font: 400 11px/1.5 'DM Sans', system-ui, sans-serif; color: #9e958c; margin: 2px 0 0; }
.bc-input { padding: 9px 12px; border: 1.5px solid #e4ddd4; border-radius: 8px; font: 400 14px/1 'DM Sans', system-ui, sans-serif; color: #1c1a17; background: #fff; width: 100%; box-sizing: border-box; transition: border-color .15s; }
.bc-input:focus { outline: none; border-color: #8D1D2C; }
.bc-textarea { resize: vertical; line-height: 1.6; padding-top: 10px; }
.bc-select { cursor: pointer; }

.bc-lang-tabs { display: flex; gap: 4px; margin-bottom: 2px; }
.bc-lang-tab { padding: 3px 10px; border-radius: 4px; border: 1.5px solid #e4ddd4; background: #fff; font: 600 11px/1 'DM Sans', system-ui, sans-serif; color: #8a7f74; cursor: pointer; transition: all .15s; }
.bc-lang-tab--active { background: #1c1a17; color: #fff; border-color: #1c1a17; }
.bc-lang-tab:hover:not(.bc-lang-tab--active) { border-color: #1c1a17; color: #1c1a17; }

.bc-color-row { display: flex; align-items: center; gap: 8px; }
.bc-color-swatch { width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid #e4ddd4; padding: 2px; cursor: pointer; flex-shrink: 0; }
.bc-color-hex { flex: 1; }

.bc-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px; border: 1.5px solid #e4ddd4; border-radius: 8px; background: #fff; min-height: 44px; align-items: flex-start; }
.bc-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px; background: #f4f1ee; border-radius: 6px; font: 500 12px/1 'DM Sans', system-ui, sans-serif; color: #1c1a17; }
.bc-chip button { background: none; border: none; cursor: pointer; color: #8a7f74; font-size: 14px; padding: 0; line-height: 1; }
.bc-chip-input { border: none; outline: none; font: 400 13px/1 'DM Sans', system-ui, sans-serif; color: #1c1a17; flex: 1; min-width: 100px; background: transparent; }

.bc-captable { display: flex; flex-direction: column; gap: 8px; }
.bc-captable-row { display: flex; gap: 8px; align-items: center; }
.bc-captable-class { flex: 2; }
.bc-captable-holder { flex: 2; }
.bc-captable-pct { flex: 1; max-width: 80px; }

.bc-toggle-row { display: flex; align-items: center; justify-content: space-between; }
.bc-toggle { width: 40px; height: 22px; border-radius: 11px; background: #e4ddd4; border: none; cursor: pointer; position: relative; transition: background .2s; flex-shrink: 0; }
.bc-toggle--on { background: #2E8D5A; }
.bc-toggle-knob { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .2s; display: block; }
.bc-toggle--on .bc-toggle-knob { transform: translateX(18px); }

.bc-share-classes { display: flex; flex-direction: column; gap: 6px; }
.bc-sc-card { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #fff; border-radius: 8px; border: 1px solid #e4ddd4; border-left: 3px solid #ccc; }
.bc-sc-badge { font: 700 11px/22px 'DM Sans', system-ui, sans-serif; color: #fff; padding: 0 8px; border-radius: 4px; flex-shrink: 0; }
.bc-sc-desc { font: 400 12px/1 'DM Sans', system-ui, sans-serif; color: #8a7f74; margin-left: auto; }

/* Visual preview card */
.bc-preview-label { font: 600 11px/1 'DM Sans', system-ui, sans-serif; color: #8a7f74; text-transform: uppercase; letter-spacing: .08em; margin: 0 0 10px; }
.bc-brand-card-preview { border-radius: 14px; border: 2px solid #e4ddd4; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
.bc-bcp-header { padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 80px; }
.bc-bcp-logo { max-height: 40px; max-width: 120px; object-fit: contain; }
.bc-bcp-mark { width: 40px; height: 40px; border-radius: 10px; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.bc-bcp-body { padding: 16px; }
.bc-bcp-name { font-size: 16px; font-weight: 700; margin: 0 0 4px; }
.bc-bcp-tagline { font-size: 11px; margin: 0 0 12px; line-height: 1.4; }
.bc-bcp-palette { display: flex; gap: 5px; margin-bottom: 12px; }
.bc-bcp-dot { width: 16px; height: 16px; border-radius: 50%; border: 1px solid rgba(0,0,0,.1); }
.bc-bcp-btns { display: flex; gap: 6px; flex-wrap: wrap; }

/* Review */
.bc-review-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.bc-review-card { background: #fff; border-radius: 12px; border: 1px solid #e4ddd4; padding: 16px; }
.bc-review-card__title { font: 700 13px/1 'DM Sans', system-ui, sans-serif; color: #1c1a17; margin: 0 0 12px; text-transform: uppercase; letter-spacing: .06em; }
.bc-review-row { display: flex; justify-content: space-between; gap: 8px; padding: 5px 0; border-bottom: 1px solid #f4f1ee; }
.bc-review-row:last-child { border-bottom: none; }
.bc-review-key { font: 400 12px/1.4 'DM Sans', system-ui, sans-serif; color: #8a7f74; flex-shrink: 0; }
.bc-review-val { font: 500 12px/1.4 'DM Sans', system-ui, sans-serif; color: #1c1a17; text-align: right; word-break: break-word; max-width: 60%; }

/* Alerts */
.bc-alert { padding: 12px 16px; border-radius: 8px; font: 500 13px/1.5 'DM Sans', system-ui, sans-serif; margin-bottom: 16px; }
.bc-alert--error { background: #fdf0ef; color: #c0392b; border: 1px solid #f5c6c4; }
.bc-alert--info { background: #eef6ff; color: #2c6ca8; border: 1px solid #b5d4f5; }

/* Buttons */
.bc-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font: 600 13px/1 'DM Sans', system-ui, sans-serif; cursor: pointer; border: 1.5px solid transparent; transition: all .15s; }
.bc-btn:disabled { opacity: .5; cursor: not-allowed; }
.bc-btn--primary { background: #8D1D2C; color: #fff; border-color: #8D1D2C; }
.bc-btn--primary:hover:not(:disabled) { background: #7a1826; }
.bc-btn--ghost { background: transparent; color: #4a443c; border-color: #e4ddd4; }
.bc-btn--ghost:hover:not(:disabled) { border-color: #1c1a17; color: #1c1a17; }
.bc-btn--sm { padding: 6px 12px; font-size: 12px; }

/* Nav */
.bc-step-nav { display: flex; align-items: center; justify-content: space-between; margin-top: 40px; padding-top: 24px; border-top: 1px solid #e4ddd4; }
.bc-final-actions { display: flex; gap: 10px; }

/* Success */
.bc-success { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; gap: 16px; padding: 40px; }
.bc-success-icon { font-size: 64px; }
.bc-success h2 { font: 700 28px/1 'DM Sans', system-ui, sans-serif; color: #1c1a17; margin: 0; }
.bc-success p { font: 400 16px/1.6 'DM Sans', system-ui, sans-serif; color: #4a443c; max-width: 400px; margin: 0; }
.bc-success-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }

@media (max-width: 680px) {
  .bc-stepper { padding: 0 16px; }
  .bc-main { padding: 24px 16px 80px; }
  .bc-grid--2, .bc-grid--3, .bc-palette-grid { grid-template-columns: 1fr; }
  .bc-step-body--visual { flex-direction: column; }
  .bc-visual-right { width: 100%; position: static; }
  .bc-review-grid { grid-template-columns: 1fr; }
  .bc-step-tab__label { display: none; }
}
`;

// Inject styles
const styleEl = document.createElement('style');
styleEl.textContent = BRAND_CREATE_CSS;
document.head.appendChild(styleEl);

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
ReactDOM.createRoot(document.getElementById('root')).render(<BrandCreateApp />);
