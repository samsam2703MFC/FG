/* global React, Sparkline, TimeChart, Donut, StackedBar */
// L'Atelier Investor Portal — view components.

const { useState } = React;

// =============================================================
// Icons (inline so we keep one file deployment)
// =============================================================
const Icon = {
  dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  shop: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M3 9a3 3 0 005 2 3 3 0 005 0 3 3 0 005 0 3 3 0 003-2"/></svg>,
  doc: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M9 14h6M9 17h6"/></svg>,
  opp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  bell: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 004 0"/></svg>,
  user: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>,
  download: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg>,
  arrow: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>,
  filter: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>,
  check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>,
  euro: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 7a7 7 0 100 10M4 10h9M4 14h9"/></svg>,
  chart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v16h16"/><path d="M8 14l4-4 3 3 5-7"/></svg>,
  alert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/></svg>,
  globe: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>,
  lock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
};

// =============================================================
// Reusable bits
// =============================================================
function KpiTile({ label, value, unit, delta, deltaTrend, foot, sparkData, sparkColor = 'var(--viz-1)' }) {
  const D = window.PORTAL_DATA;
  const trendCls = deltaTrend === 'down' ? ' kpi__delta--down' : (deltaTrend === 'neutral' ? ' kpi__delta--neutral' : '');
  return (
    <div className="kpi">
      <p className="kpi__label">{label}</p>
      <p className="kpi__value">
        <span>{value}</span>
        {unit && <span className="kpi__value-unit">{unit}</span>}
      </p>
      {delta !== undefined && (
        <span className={'kpi__delta' + trendCls}>
          {deltaTrend === 'down' ? '▾' : deltaTrend === 'neutral' ? '·' : '▴'} {delta}
        </span>
      )}
      {sparkData && <div className="kpi__spark"><Sparkline data={sparkData} color={sparkColor} /></div>}
      {foot && <p className="kpi__foot">{foot}</p>}
    </div>
  );
}

function MONTHS() { return ['Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr']; }

// =============================================================
// LOGIN
// =============================================================
function LoginScreen({ onLogin }) {
  return (
    <div className="login">
      <div className="login__left">
        <div className="row" style={{ alignItems: 'center' }}>
          <img src="img/logo.png" alt="L'Atelier By" style={{ height: 30 }} />
          <span className="tag tag--ruby" style={{ marginLeft: 10 }}><span className="dot"></span>Espace Investisseur</span>
        </div>
        <div className="login__form-wrap">
          <p className="eyebrow" style={{ marginBottom: 8 }}>Bon retour</p>
          <h1 className="login__title">Vos projets,<br/><em>en confiance.</em></h1>
          <p className="login__sub">Connectez-vous à votre portail investisseur. Authentification sécurisée par e-mail + code à usage unique.</p>
          <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div className="field">
              <label htmlFor="email">Adresse e-mail</label>
              <input id="email" type="email" defaultValue="claire.vermeulen@example.com" />
            </div>
            <div className="field">
              <label htmlFor="pwd">Mot de passe</label>
              <input id="pwd" type="password" defaultValue="••••••••••" />
            </div>
            <button className="btn btn--primary" style={{ width: '100%', justifyContent: 'center', height: 44, marginTop: 8 }}>
              Se connecter <Icon.arrow />
            </button>
          </form>
          <p className="login__legal" style={{ marginTop: 20 }}>
            <Icon.lock /> Connexion chiffrée TLS · Authentification à deux facteurs activée
          </p>
        </div>
        <p className="muted" style={{ fontSize: 11 }}>© 2026 L'Atelier By · Espace Investisseur · Données réseau anonymisées</p>
      </div>
      <div className="login__right">
        <div className="login__right-card">
          <p className="eyebrow" style={{ color: 'var(--color-secondary)' }}>Avril 2026</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1.05, fontWeight: 400, margin: '8px 0 16px' }}>
            5 magasins.<br/>
            <em style={{ fontFamily: 'var(--font-accent)', color: 'var(--color-secondary)', fontStyle: 'italic' }}>+8,4 % vs budget.</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>
            Performance trimestrielle de votre portefeuille. Détail complet et suivi des remboursements après connexion.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 28, paddingTop: 20, borderTop: '0.5px solid rgba(255,255,255,0.16)' }}>
            <div>
              <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)', margin: 0 }}>Capital placé</p>
              <p className="num-display" style={{ fontSize: 24, margin: '4px 0 0' }}>310 000 €</p>
            </div>
            <div>
              <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)', margin: 0 }}>Déjà remboursé</p>
              <p className="num-display" style={{ fontSize: 24, margin: '4px 0 0' }}>94 200 €</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// DASHBOARD — vue d'ensemble du portefeuille
// =============================================================
function Dashboard({ projects, onSelectProject, onNav, chartKind }) {
  const D = window.PORTAL_DATA;
  const totalInvested = projects.reduce((a, p) => a + p.invested, 0);
  const totalRepaid = projects.reduce((a, p) => a + p.repaid, 0);
  const avgRoi = projects.reduce((a, p) => a + p.roiCurrent, 0) / projects.length;
  const portfolioCa = projects.reduce((a, p) => a + p.kpi.ca[p.kpi.ca.length - 1], 0);
  const portfolioCaSeries = MONTHS().map((_, i) => projects.reduce((a, p) => a + p.kpi.ca[i], 0));
  const portfolioBudgetSeries = MONTHS().map((_, i) => projects.reduce((a, p) => a + p.kpi.budget[i], 0));
  const lastDelta = (portfolioCaSeries.at(-1) / portfolioBudgetSeries.at(-1) - 1) * 100;

  return (
    <div className="content">
      {/* Hero summary card */}
      <div className="summary mb-4">
        <div className="summary__flourish"><img src="img/bread-1.png" alt="" /></div>
        <p className="summary__eyebrow">Avril 2026 · Synthèse portefeuille</p>
        <h1 className="summary__h">Bonsoir Claire,<br/><em>vos projets se portent bien.</em></h1>
        <p className="summary__sub">Performance globale {D.fmtPct(lastDelta)} vs budget · 5 magasins actifs sur {projects[0].networkTotal} dans le réseau.</p>
        <div className="summary__row">
          <div>
            <p className="summary__metric-label">Capital placé</p>
            <p className="summary__metric-val">{D.fmtEur(totalInvested)}</p>
            <p className="summary__metric-foot">Sur {projects.length} magasins</p>
          </div>
          <div>
            <p className="summary__metric-label">Déjà remboursé</p>
            <p className="summary__metric-val">{D.fmtEur(totalRepaid)}</p>
            <p className="summary__metric-foot">{((totalRepaid / totalInvested) * 100).toFixed(1)}% du capital</p>
          </div>
          <div>
            <p className="summary__metric-label">TRI moyen pondéré</p>
            <p className="summary__metric-val">{D.fmtPctRaw(avgRoi)}</p>
            <p className="summary__metric-foot">Cible 8,4 % · réel {D.fmtPctRaw(avgRoi)}</p>
          </div>
          <div>
            <p className="summary__metric-label">Prochain versement</p>
            <p className="summary__metric-val">15 mai</p>
            <p className="summary__metric-foot">5 échéances · {D.fmtEur(7340)}</p>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid-12">
        {/* Project list */}
        <div className="col-12">
          <DashboardProjectList projects={projects} onNav={onNav} onSelect={onSelectProject} />
        </div>

        {/* Repayment progress */}
        <div className="col-6">
          <div className="card">
            <div className="card__head">
              <div>
                <p className="card__title">Progression des remboursements</p>
                <p className="card__sub">Capital + intérêts cumulés</p>
              </div>
              <button className="card__action" onClick={() => onNav('magasins')}>Voir détail →</button>
            </div>
            <div className="repay-progress">
              <div className="repay-progress__bar">
                <div className="repay-progress__fill" style={{ width: `${(totalRepaid / totalInvested * 100)}%` }}></div>
              </div>
              <div className="repay-progress__legend">
                <span><strong>{D.fmtEur(totalRepaid)}</strong> versés</span>
                <span>sur <strong>{D.fmtEur(totalInvested)}</strong></span>
              </div>
            </div>
            <div className="stack stack--gap-md mt-4">
              <div className="row row--between">
                <span className="muted" style={{ fontSize: 12 }}>Versé ce trimestre</span>
                <span className="num-display" style={{ fontSize: 16 }}>{D.fmtEur(11240)}</span>
              </div>
              <div className="row row--between">
                <span className="muted" style={{ fontSize: 12 }}>Prochain versement</span>
                <span className="num-display" style={{ fontSize: 16 }}>15 mai · {D.fmtEur(7340)}</span>
              </div>
              <div className="row row--between">
                <span className="muted" style={{ fontSize: 12 }}>Reste à percevoir (incl. intérêts)</span>
                <span className="num-display" style={{ fontSize: 16 }}>{D.fmtEur(totalInvested * 1.42 - totalRepaid)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spotlight opportunity */}
        <div className="col-6">
          <div className="card card--inverse" style={{ background: 'linear-gradient(135deg, #8D1D2C 0%, #6f1422 100%)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -30, bottom: -30, width: 180, height: 180, opacity: 0.12 }}>
              <img src="img/bread-3.png" alt="" style={{ width: '100%', filter: 'brightness(0) invert(1)' }} />
            </div>
            <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>À la une · Closing dans 18 jours</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, margin: '8px 0 4px', lineHeight: 1.1 }}>
              L'Atelier <em style={{ fontFamily: 'var(--font-accent)', fontStyle: 'italic', color: 'var(--color-secondary)' }}>Gand</em>
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: '0 0 16px', maxWidth: 340 }}>
              Centre-ville. Surface 84 m². TRI cible 8,6 % sur 5 ans · Ticket dès 5 000 €.
            </p>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.18)', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: '77%', background: 'var(--color-secondary)' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
              <span><strong style={{ color: '#fff', fontFamily: 'Vank, sans-serif', fontSize: 14 }}>248 000 €</strong> levés</span>
              <span>sur <strong style={{ color: '#fff', fontFamily: 'Vank, sans-serif', fontSize: 14 }}>320 000 €</strong></span>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn--ghost" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>Voir le projet</button>
              <button className="btn" style={{ background: 'var(--color-secondary)', color: '#5a2814' }}>Pré-engager →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// DASHBOARD PROJECT LIST — paginated 3-at-a-time
// =============================================================
function DashboardProjectList({ projects, onNav, onSelect }) {
  const D = window.PORTAL_DATA;
  const PAGE = 3;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(projects.length / PAGE);
  const start = page * PAGE;
  const visible = projects.slice(start, start + PAGE);
  return (
    <div className="card">
      <div className="card__head">
        <div>
          <p className="card__title">Mes magasins</p>
          <p className="card__sub">Cliquez pour ouvrir le détail · {start + 1}–{Math.min(start + PAGE, projects.length)} sur {projects.length}</p>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="icon-btn" disabled={page === 0} style={{ opacity: page === 0 ? 0.35 : 1 }} onClick={() => setPage(p => Math.max(0, p - 1))} aria-label="Précédents">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
          </button>
          <button className="icon-btn" disabled={page >= totalPages - 1} style={{ opacity: page >= totalPages - 1 ? 0.35 : 1 }} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} aria-label="Suivants">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
          <button className="card__action" style={{ marginLeft: 6 }} onClick={() => onNav('magasins')}>Tout voir →</button>
        </div>
      </div>
      <div className="proj-list">
        {visible.map(p => {
          const lastCa = p.kpi.ca[p.kpi.ca.length - 1];
          const prevCa = p.kpi.ca[p.kpi.ca.length - 2];
          const trend = ((lastCa / prevCa) - 1) * 100;
          return (
            <button key={p.id} className="proj-item" onClick={() => onSelect(p.id)}>
              <div className="proj-item__avatar"><img src={p.illus} alt="" /></div>
              <div className="proj-item__info">
                <p className="proj-item__name">
                  {p.name}
                  <span className={'tag ' + (p.kind === 'Pop-Up' ? 'tag--apricot' : p.kind === 'Concept Store' ? 'tag--ink' : 'tag--ruby')} style={{ fontSize: 9, padding: '2px 8px' }}>
                    <span className="dot"></span>{p.kind}
                  </span>
                </p>
                <p className="proj-item__city">{p.city} · ouvert {p.opened}</p>
              </div>
              <div>
                <p className="proj-item__metric">{D.fmtEur(lastCa).replace('€', '€ ')}</p>
                <p className={'proj-item__delta' + (trend < 0 ? ' proj-item__delta--down' : '')}>
                  {trend >= 0 ? '▴' : '▾'} {D.fmtPctRaw(Math.abs(trend), 1)} CA / mois
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <div className="row row--between mt-3" style={{ borderTop: '0.5px solid var(--color-divider)', paddingTop: 10 }}>
        <span className="muted" style={{ fontSize: 11 }}>Page {page + 1} / {totalPages}</span>
        <div className="row" style={{ gap: 4 }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
              style={{
                width: 6, height: 6, padding: 0, borderRadius: '50%',
                border: 'none',
                background: i === page ? 'var(--color-primary)' : 'var(--color-border-strong)',
                cursor: 'pointer'
              }}></button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// NETWORK RANKING component
// =============================================================
function NetworkRanking({ projects, compact }) {
  const D = window.PORTAL_DATA;
  const proj = projects[0];
  const pctile = ((proj.networkTotal - proj.networkRank + 1) / proj.networkTotal) * 100;

  if (compact) {
    return (
      <div className="ranking-compact">
        <div className="ranking-compact__head">
          <div className="ranking-compact__rank">
            <span className="ranking-compact__num">#{proj.networkRank}</span>
            <span className="ranking-compact__tot">/ {proj.networkTotal}</span>
          </div>
          <div className="ranking-compact__quartile">
            <div className="ranking__quartile" style={{ margin: 0 }}>
              <div className="ranking__quartile-segment" style={{ background: 'var(--color-success-soft)' }}></div>
              <div className="ranking__quartile-segment" style={{ background: '#ecdfd0' }}></div>
              <div className="ranking__quartile-segment" style={{ background: '#e3d4c2' }}></div>
              <div className="ranking__quartile-segment" style={{ background: 'var(--color-warning-soft)' }}></div>
              <div className="ranking__pin" style={{ left: `${pctile}%` }}></div>
            </div>
            <div className="ranking__legend" style={{ marginTop: 6 }}>
              <span>Top 25%</span><span>Médiane</span><span>Bottom 25%</span>
            </div>
          </div>
        </div>
        <div className="bench-grid">
          {Object.entries(D.BENCHMARKS).map(([k, b]) => {
            const better = b.invert ? b.you < b.avg : b.you > b.avg;
            const diff = ((b.you - b.avg) / b.avg) * 100;
            return (
              <div key={k} className="bench-cell">
                <p className="bench-cell__label">{b.label}</p>
                <div className="bench-cell__row">
                  <span className="bench-cell__you">{b.you}{b.suffix || ''}</span>
                  <span className={'bench-cell__delta ' + (better ? 'is-up' : 'is-down')}>
                    {better ? '▴' : '▾'} {Math.abs(diff).toFixed(1)}%
                  </span>
                </div>
                <p className="bench-cell__bench">méd. {b.avg}{b.suffix || ''} · top {b.top}{b.suffix || ''}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="ranking__big">
        <span className="ranking__rank">#{proj.networkRank}</span>
        <span className="ranking__total">/ {proj.networkTotal} magasins</span>
      </div>
      <p className="muted" style={{ fontSize: 12, margin: '0 0 4px' }}>Top {(100 - pctile).toFixed(0)} % · 1<sup>er</sup> quartile du réseau</p>
      <div className="ranking__quartile">
        <div className="ranking__quartile-segment" style={{ background: 'var(--color-success-soft)' }}></div>
        <div className="ranking__quartile-segment" style={{ background: '#ecdfd0' }}></div>
        <div className="ranking__quartile-segment" style={{ background: '#e3d4c2' }}></div>
        <div className="ranking__quartile-segment" style={{ background: 'var(--color-warning-soft)' }}></div>
        <div className="ranking__pin" style={{ left: `${pctile}%` }}></div>
      </div>
      <div className="ranking__legend">
        <span>Top 25%</span><span>Médiane</span><span>Bottom 25%</span>
      </div>

      <div className="ranking__benchmarks">
        {Object.entries(D.BENCHMARKS).map(([k, b]) => {
          const better = b.invert ? b.you < b.avg : b.you > b.avg;
          const diff = ((b.you - b.avg) / b.avg) * 100;
          return (
            <div key={k} className="bench-row">
              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text)' }}>{b.label}</p>
                <p className="bench-row__bench">Moy. réseau {b.avg}{b.suffix || ''} · Top {b.top}{b.suffix || ''}</p>
              </div>
              <div className="bench-row__pos">{b.you}{b.suffix || ''}</div>
              <span className={'tag ' + (better ? 'tag--success' : 'tag--warning')} style={{ fontSize: 10 }}>
                {better ? '▴' : '▾'} {Math.abs(diff).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================
// CONSULTANT REPORT CARD
// =============================================================
function ConsultantCard({ project }) {
  const D = window.PORTAL_DATA;
  const r = D.CONSULTANT_REPORTS[project.id];
  if (!r) return null;
  const initials = r.consultant.split(' ').map(s => s[0]).slice(0, 2).join('');
  return (
    <div className="card consultant-card">
      <div className="card__head">
        <div>
          <p className="card__title">Reporting consultant</p>
          <p className="card__sub">Visite terrain · {r.lastVisit}</p>
        </div>
        <span className={'tag ' + (r.verdict === 'on-track' ? 'tag--success' : 'tag--warning')}>
          <span className="dot"></span>{r.verdict === 'on-track' ? 'Sur la trajectoire' : 'À surveiller'}
        </span>
      </div>
      <div className="consultant-card__person">
        <div className="consultant-card__avatar">{initials}</div>
        <div>
          <p className="consultant-card__name">{r.consultant}</p>
          <p className="consultant-card__role">{r.role}</p>
        </div>
      </div>
      <p className="consultant-card__summary">{r.summary}</p>
      <div className="score-bars">
        {r.scores.map((s, i) => (
          <div key={i} className="score-bar">
            <span className="score-bar__label">{s.label}</span>
            <div className="score-bar__track">
              <div className="score-bar__fill" style={{ width: `${(s.value / 5) * 100}%` }}></div>
            </div>
            <span className="score-bar__val">{s.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
      <div className="consultant-card__action">
        <span className="eyebrow" style={{ display: 'block', marginBottom: 4 }}>Action prioritaire</span>
        <p>{r.action}</p>
      </div>
      <div className="consultant-card__foot">
        <span className="muted" style={{ fontSize: 11 }}>Prochaine visite · {r.nextVisit}</span>
        <button className="btn btn--ghost btn--sm"><Icon.download /> Rapport complet</button>
      </div>
    </div>
  );
}

// =============================================================
// FRANCHISEE SCORING CARD
// =============================================================
function FranchiseeScoreCard({ project }) {
  const D = window.PORTAL_DATA;
  const f = D.FRANCHISEE_SCORES[project.id];
  if (!f) return null;
  const initials = f.name.split(' ').map(s => s[0]).slice(0, 2).join('');
  const tierColor = f.tier === 'Or' ? 'var(--color-secondary)' : f.tier === 'Argent' ? 'var(--color-text-muted)' : 'var(--color-warning)';
  return (
    <div className="card franchisee-card">
      <div className="card__head">
        <div>
          <p className="card__title">Scoring franchisé</p>
          <p className="card__sub">Évaluation 360° · trim. en cours</p>
        </div>
        <span className="tag" style={{ borderColor: tierColor, color: tierColor }}>
          <span className="dot" style={{ background: tierColor }}></span>Tier {f.tier}
        </span>
      </div>
      <div className="franchisee-card__hero">
        <div className="franchisee-card__avatar">{initials}</div>
        <div style={{ flex: 1 }}>
          <p className="franchisee-card__name">{f.name}</p>
          <p className="franchisee-card__sub">Franchisé(e) depuis {f.since}</p>
        </div>
        <div className="franchisee-card__overall">
          <span className="franchisee-card__num">{f.overall.toFixed(1)}</span>
          <span className="franchisee-card__denom">/ 5</span>
        </div>
      </div>
      <div className="score-bars">
        {f.pillars.map((p, i) => (
          <div key={i} className="score-bar">
            <span className="score-bar__label">{p.label}</span>
            <div className="score-bar__track">
              <div className="score-bar__fill score-bar__fill--alt" style={{ width: `${(p.value / 5) * 100}%` }}></div>
            </div>
            <span className="score-bar__val">{p.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
      <div className="franchisee-card__foot">
        <span className="muted" style={{ fontSize: 11 }}>Méthodologie : opérations + finance + engagement</span>
        <button className="btn btn--ghost btn--sm">Détail scoring →</button>
      </div>
    </div>
  );
}

// =============================================================
// MAGASIN DETAIL — KPI + perf vs budget + remboursements + rapports
// =============================================================
function MagasinDetail({ project, onBack, chartKind }) {
  const D = window.PORTAL_DATA;
  const [tab, setTab] = useState('vue');
  const lastCa = project.kpi.ca.at(-1);
  const prevCa = project.kpi.ca.at(-2);
  const trend = ((lastCa / prevCa) - 1) * 100;
  const lastBudget = project.kpi.budget.at(-1);
  const vsBudget = ((lastCa / lastBudget) - 1) * 100;

  return (
    <div className="content">
      <div className="page-head">
        <div className="page-head__copy">
          <button className="btn btn--ghost btn--sm" onClick={onBack} style={{ marginBottom: 12 }}>
            ← Retour aux magasins
          </button>
          <p className="page-head__eyebrow">{project.kind} · {project.city} · Ouvert {project.opened}</p>
          <h1 className="page-head__title">{project.name.split(' ')[0]} <em>{project.name.split(' ').slice(1).join(' ')}</em></h1>
          <p className="page-head__sub">
            Mois {project.monthsElapsed}/{project.totalMonths} · TRI cible {D.fmtPctRaw(project.roiTarget)} · réel {D.fmtPctRaw(project.roiCurrent)}
          </p>
        </div>
        <div className="row">
          <button className="btn btn--ghost"><Icon.download /> Rapport mensuel</button>
          <button className="btn btn--ink">Voir contrat <Icon.arrow /></button>
        </div>
      </div>

      <div className="seg-bar mb-4">
        <button className={tab === 'vue' ? 'is-active' : ''} onClick={() => setTab('vue')}>Vue d'ensemble</button>
        <button className={tab === 'perf' ? 'is-active' : ''} onClick={() => setTab('perf')}>Performances vs budget</button>
        <button className={tab === 'remb' ? 'is-active' : ''} onClick={() => setTab('remb')}>Remboursements</button>
        <button className={tab === 'rapports' ? 'is-active' : ''} onClick={() => setTab('rapports')}>Rapports mensuels</button>
      </div>

      {tab === 'vue' && <MagasinVue project={project} chartKind={chartKind} />}
      {tab === 'perf' && <MagasinPerf project={project} chartKind={chartKind} />}
      {tab === 'remb' && <MagasinRemb project={project} />}
      {tab === 'rapports' && <MagasinRapports project={project} />}
    </div>
  );
}

function MagasinVue({ project, chartKind }) {
  const D = window.PORTAL_DATA;
  const k = project.kpi;
  const tile = (label, valFn, sparkKey, color, suffix = '') => {
    const series = k[sparkKey];
    const last = series.at(-1);
    const prev = series.at(-2);
    const delta = ((last / prev) - 1) * 100;
    return (
      <KpiTile
        label={label}
        value={valFn(last)}
        unit={suffix}
        delta={D.fmtPct(delta, 1)}
        deltaTrend={delta >= 0 ? 'up' : 'down'}
        sparkData={series}
        sparkColor={color}
      />
    );
  };
  return (
    <>
      <div className="grid-12 mb-4">
        <div className="col-3">{tile('Chiffre d\'affaires', v => D.fmtEur(v), 'ca', 'var(--viz-1)')}</div>
        <div className="col-3">{tile('Profit net', v => D.fmtNum(v, 1), 'profit', 'var(--viz-5)', '%')}</div>
        <div className="col-3">{tile('Clients / jour', v => D.fmtNum(v, 0), 'cust', 'var(--viz-3)')}</div>
        <div className="col-3">{tile('Panier moyen', v => D.fmtNum(v, 2), 'basket', 'var(--viz-2)', ' €')}</div>
      </div>

      <div className="grid-12">
        <div className="col-4">
          <div className="card">
            <div className="card__head">
              <div>
                <p className="card__title">Structure des coûts</p>
                <p className="card__sub">Mois en cours · % du CA</p>
              </div>
            </div>
            <Donut
              size={140}
              label={D.fmtNum(k.profit.at(-1), 1) + '%'}
              sub="Profit net"
              segments={[
                { name: 'Food cost', value: k.food.at(-1), color: 'var(--viz-2)' },
                { name: 'Labour cost', value: k.labour.at(-1), color: 'var(--viz-3)' },
                { name: 'Loyer & charges', value: 14, color: 'var(--viz-4)' },
                { name: 'Marketing', value: 4, color: 'var(--color-secondary)' },
                { name: 'Profit net', value: k.profit.at(-1), color: 'var(--viz-5)' }
              ]}
            />
          </div>
        </div>

        <div className="col-4">
          <ConsultantCard project={project} />
        </div>

        <div className="col-4">
          <FranchiseeScoreCard project={project} />
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card__head">
              <div>
                <p className="card__title">Indicateurs détaillés vs réseau (anonymisé)</p>
                <p className="card__sub">Votre magasin vs médiane et top 10 % du réseau</p>
              </div>
            </div>
            <NetworkRanking projects={[project]} compact />
          </div>
        </div>
      </div>
    </>
  );
}

function MagasinPerf({ project, chartKind }) {
  const D = window.PORTAL_DATA;
  const k = project.kpi;
  const last = k.ca.at(-1);
  const budget = k.budget.at(-1);
  const ytd = k.ca.reduce((a, b) => a + b, 0);
  const ytdBudget = k.budget.reduce((a, b) => a + b, 0);
  const rows = [
    { label: 'Chiffre d\'affaires', sub: 'Mois en cours', actual: last, budget, fmt: D.fmtEur },
    { label: 'CA cumulé', sub: '12 derniers mois', actual: ytd, budget: ytdBudget, fmt: D.fmtEur },
    { label: 'Food cost', sub: 'Cible ≤ 30%', actual: k.food.at(-1), budget: 30, fmt: v => D.fmtNum(v, 1) + '%', invert: true, scale: 50 },
    { label: 'Labour cost', sub: 'Cible ≤ 25%', actual: k.labour.at(-1), budget: 25, fmt: v => D.fmtNum(v, 1) + '%', invert: true, scale: 50 },
    { label: 'Profit net', sub: 'Cible ≥ 16%', actual: k.profit.at(-1), budget: 16, fmt: v => D.fmtNum(v, 1) + '%', scale: 30 },
    { label: 'Clients / jour', sub: 'Plan 230/jour', actual: k.cust.at(-1), budget: 230, fmt: v => D.fmtNum(v, 0), scale: 350 },
    { label: 'Panier moyen', sub: 'Plan 12,80 €', actual: k.basket.at(-1), budget: 12.8, fmt: v => D.fmtNum(v, 2) + ' €', scale: 18 }
  ];

  return (
    <>
      <div className="grid-12 mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card__head">
              <div>
                <p className="card__title">Performance vs budget — détail</p>
                <p className="card__sub">Lecture rapide : barre noire = réel, barre grise = budget. Plus la barre dépasse, mieux c'est (sauf coûts en %).</p>
              </div>
            </div>
            <div className="stack stack--gap-md">
              {rows.map((r, i) => {
                const diff = ((r.actual / r.budget) - 1) * 100;
                const better = r.invert ? r.actual < r.budget : r.actual > r.budget;
                const max = r.scale || Math.max(r.actual, r.budget) * 1.4;
                const pctActual = Math.min(100, (r.actual / max) * 100);
                const pctBudget = Math.min(100, (r.budget / max) * 100);
                return (
                  <div key={i} className="perf-row">
                    <div>
                      <p className="perf-row__label">{r.label}</p>
                      <p className="perf-row__sub">{r.sub}</p>
                    </div>
                    <div className="perf-row__bar">
                      <div className="perf-row__bar-budget"></div>
                      <div className={'perf-row__bar-actual ' + (better ? (Math.abs(diff) > 5 ? 'perf-row__bar-actual--good' : '') : (Math.abs(diff) > 10 ? 'perf-row__bar-actual--bad' : 'perf-row__bar-actual--warn'))}
                        style={{ width: `${pctActual}%` }}></div>
                      <div className="perf-row__bar-marker" style={{ left: `${pctBudget}%` }}></div>
                    </div>
                    <div className="perf-row__values">
                      <div>{r.fmt(r.actual)} <span className="muted" style={{ fontWeight: 400 }}>vs {r.fmt(r.budget)}</span></div>
                      <div className={'perf-row__delta ' + (better ? 'perf-row__delta--up' : 'perf-row__delta--down')}>
                        {better ? '▴' : '▾'} {Math.abs(diff).toFixed(1)}% {better ? 'mieux que budget' : 'sous budget'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <div className="card__head">
              <div>
                <p className="card__title">Évolution du profit net</p>
                <p className="card__sub">% du CA · 12 mois</p>
              </div>
            </div>
            <div className="chart-frame chart-frame--sm">
              <TimeChart
                kind={chartKind === 'bar' ? 'bar' : (chartKind === 'area' ? 'area' : 'line')}
                labels={MONTHS()}
                series={[
                  { name: 'Profit net', color: 'var(--viz-5)', data: k.profit, fill: chartKind === 'area' }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <div className="card__head">
              <div>
                <p className="card__title">Trafic & panier</p>
                <p className="card__sub">Clients/jour & panier moyen · 12 mois</p>
              </div>
            </div>
            <div className="chart-frame chart-frame--sm">
              <TimeChart
                kind={chartKind === 'bar' ? 'bar' : (chartKind === 'area' ? 'area' : 'line')}
                labels={MONTHS()}
                series={[
                  { name: 'Clients/jour', color: 'var(--viz-3)', data: k.cust },
                  { name: 'Panier × 20', color: 'var(--viz-2)', data: k.basket.map(v => v * 20) }
                ]}
              />
            </div>
            <div className="chart-legend">
              <span className="chart-legend__item"><span className="chart-legend__sw" style={{ background: 'var(--viz-3)' }}></span>Clients/jour</span>
              <span className="chart-legend__item"><span className="chart-legend__sw" style={{ background: 'var(--viz-2)' }}></span>Panier moyen (× 20 pour échelle)</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MagasinRemb({ project }) {
  const D = window.PORTAL_DATA;
  const schedule = D.buildSchedule(project);
  const expected = project.invested * (1 + project.roiTarget / 100 * project.maturityYears);
  const monthly = expected / project.totalMonths;
  return (
    <div className="grid-12">
      <div className="col-4">
        <div className="card">
          <p className="card__title mb-3">Synthèse du prêt</p>
          <div className="stack stack--gap-md">
            <div className="row row--between">
              <span className="muted" style={{ fontSize: 12 }}>Capital placé</span>
              <span className="num-display" style={{ fontSize: 18 }}>{D.fmtEur(project.invested)}</span>
            </div>
            <div className="row row--between">
              <span className="muted" style={{ fontSize: 12 }}>TRI cible / réel</span>
              <span className="num-display" style={{ fontSize: 18 }}>{D.fmtPctRaw(project.roiTarget)} / {D.fmtPctRaw(project.roiCurrent)}</span>
            </div>
            <div className="row row--between">
              <span className="muted" style={{ fontSize: 12 }}>Maturité</span>
              <span className="num-display" style={{ fontSize: 18 }}>{project.maturityYears} ans</span>
            </div>
            <div className="row row--between">
              <span className="muted" style={{ fontSize: 12 }}>Mensualité</span>
              <span className="num-display" style={{ fontSize: 18 }}>{D.fmtEur(monthly)}</span>
            </div>
            <div className="row row--between" style={{ borderTop: '0.5px solid var(--color-divider)', paddingTop: 12 }}>
              <span className="muted" style={{ fontSize: 12 }}>Total à percevoir</span>
              <span className="num-display" style={{ fontSize: 22, color: 'var(--color-primary)' }}>{D.fmtEur(expected)}</span>
            </div>
          </div>
          <div className="repay-progress mt-4">
            <div className="repay-progress__bar">
              <div className="repay-progress__fill" style={{ width: `${(project.repaid / expected * 100)}%` }}></div>
            </div>
            <div className="repay-progress__legend">
              <span><strong>{D.fmtEur(project.repaid)}</strong></span>
              <span>{((project.repaid / expected) * 100).toFixed(1)}% remboursé</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card__head">
            <div>
              <p className="card__title">Échéancier</p>
              <p className="card__sub">Mois {project.monthsElapsed}/{project.totalMonths} · prochaine échéance le 15 du mois</p>
            </div>
            <button className="btn btn--ghost btn--sm"><Icon.download /> Tableau d'amortissement</button>
          </div>
          <ul className="timeline">
            {schedule.map((s, i) => (
              <li key={i} className={'timeline__item is-' + s.status}>
                <div>
                  <p className="timeline__date">{s.label} · échéance n°{s.idx + 1}</p>
                  <p className="timeline__label">
                    {s.status === 'paid' ? 'Versement encaissé' : s.status === 'due' ? 'À encaisser ce mois-ci' : 'Versement programmé'}
                  </p>
                </div>
                <span className="timeline__amount">{D.fmtEur(s.amount)}</span>
                <span className={'timeline__status ' + (s.status === 'paid' ? 'tag tag--success' : s.status === 'due' ? 'tag tag--ruby' : 'tag')}>
                  {s.status === 'paid' ? '✓ Versé' : s.status === 'due' ? '● En cours' : '○ À venir'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MagasinRapports({ project }) {
  const D = window.PORTAL_DATA;
  const reports = D.REPORTS.filter(r => r.project === project.id);
  return (
    <div className="card">
      <div className="card__head">
        <div>
          <p className="card__title">Rapports mensuels</p>
          <p className="card__sub">Synthèse mensuelle préparée par l'équipe magasin · PDF + données brutes</p>
        </div>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Mois</th>
            <th>Statut</th>
            <th>Synthèse</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, i) => (
            <tr key={i}>
              <td><strong style={{ fontWeight: 500 }}>{r.month}</strong></td>
              <td><span className={'tag ' + (r.status === 'on-track' ? 'tag--success' : 'tag--warning')}><span className="dot"></span>{r.status === 'on-track' ? 'Sur la trajectoire' : 'À surveiller'}</span></td>
              <td className="muted">{r.highlight}</td>
              <td style={{ textAlign: 'right' }}>
                <button className="btn btn--ghost btn--sm"><Icon.download /> PDF</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================
// MAGASINS LIST (catalog of all projects)
// =============================================================
function MagasinsList({ projects, onSelect }) {
  const D = window.PORTAL_DATA;
  return (
    <div className="content">
      <div className="page-head">
        <div className="page-head__copy">
          <p className="page-head__eyebrow">5 projets actifs · 1 en surveillance</p>
          <h1 className="page-head__title">Mes <em>magasins</em></h1>
          <p className="page-head__sub">Cliquez sur une carte pour ouvrir le détail : KPI, performances vs budget, échéancier de remboursement, rapports mensuels.</p>
        </div>
      </div>
      <div className="grid-12">
        {projects.map(p => {
          const last = p.kpi.ca.at(-1);
          const budget = p.kpi.budget.at(-1);
          const vsBudget = ((last / budget) - 1) * 100;
          const better = vsBudget >= 0;
          return (
            <div key={p.id} className="col-4">
              <button className="card" onClick={() => onSelect(p.id)} style={{ width: '100%', height: '100%', textAlign: 'left', padding: 0, overflow: 'hidden', cursor: 'pointer', border: '0.5px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ aspectRatio: '5 / 3', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <img src={p.illus} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.95 }} />
                  <span className={'tag ' + (p.kind === 'Pop-Up' ? 'tag--apricot' : p.kind === 'Concept Store' ? 'tag--ink' : 'tag--ruby')} style={{ position: 'absolute', top: 12, left: 12 }}>
                    <span className="dot"></span>{p.kind}
                  </span>
                  {p.health === 'warn' && (
                    <span className="tag tag--warning" style={{ position: 'absolute', top: 12, right: 12 }}><Icon.alert />À surveiller</span>
                  )}
                </div>
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 220 }}>
                  <p className="eyebrow" style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.city} · ouvert {p.opened}</p>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: '6px 0 12px', fontWeight: 400, lineHeight: 1.15, minHeight: 46, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.name.split(' ')[0]} <em style={{ fontFamily: 'var(--font-accent)', fontStyle: 'italic', color: 'var(--color-primary)' }}>{p.name.split(' ').slice(1).join(' ')}</em>
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 12, borderTop: '0.5px solid var(--color-divider)', marginTop: 'auto' }}>
                    <div>
                      <p className="eyebrow" style={{ margin: 0, fontSize: 9 }}>CA mois</p>
                      <p className="num-display" style={{ fontSize: 13, margin: '2px 0 0', whiteSpace: 'nowrap' }}>{D.fmtEur(last)}</p>
                    </div>
                    <div>
                      <p className="eyebrow" style={{ margin: 0, fontSize: 9 }}>vs budget</p>
                      <p className={'num-display'} style={{ fontSize: 14, margin: '2px 0 0', color: better ? 'var(--color-success)' : 'var(--color-danger)' }}>{D.fmtPct(vsBudget, 1)}</p>
                    </div>
                    <div>
                      <p className="eyebrow" style={{ margin: 0, fontSize: 9 }}>Rang réseau</p>
                      <p className="num-display" style={{ fontSize: 14, margin: '2px 0 0' }}>#{p.networkRank}/{p.networkTotal}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="muted" style={{ fontSize: 12 }}>{D.fmtEur(p.repaid)} remboursés / {D.fmtEur(p.invested)}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 500 }}>Ouvrir <Icon.arrow /></span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================
// MARKETPLACE
// =============================================================
function Marketplace() {
  const D = window.PORTAL_DATA;
  return (
    <div className="content">
      <div className="page-head">
        <div className="page-head__copy">
          <p className="page-head__eyebrow">{D.OPPORTUNITIES.length} projets ouverts · 1 closing imminent</p>
          <h1 className="page-head__title">Projets en <em>recherche de financement</em></h1>
          <p className="page-head__sub">Nouveaux magasins en pré-ouverture. Pré-engagez votre ticket en quelques clics. L'équipe vous recontacte dans les 48h pour finaliser la documentation.</p>
        </div>
        <div className="seg-bar">
          <button className="is-active">Tous</button>
          <button>Boutiques</button>
          <button>Pop-Up</button>
          <button>Concept</button>
        </div>
      </div>
      <div className="opp-grid">
        {D.OPPORTUNITIES.map(o => {
          const pct = (o.raised / o.target) * 100;
          return (
            <article key={o.id} className="opp">
              <div className="opp__media">
                <img src={o.illus} alt="" />
                <span className="opp__kind">{o.kind}</span>
                {o.closingDays <= 10 && (
                  <span className="tag tag--ruby" style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span className="dot"></span>Closing dans {o.closingDays}j
                  </span>
                )}
              </div>
              <div className="opp__body">
                <p className="opp__city">{o.city}</p>
                <h3 className="opp__name">{o.name.split(' ')[0]} <em style={{ fontFamily: 'var(--font-accent)', fontStyle: 'italic', color: 'var(--color-primary)' }}>{o.name.split(' ').slice(1).join(' ')}</em></h3>
                <p className="opp__concept">{o.concept}</p>
                <div className="opp__metrics">
                  <div>
                    <p className="opp__metric-label">TRI cible</p>
                    <p className="opp__metric-val">{D.fmtPctRaw(o.roiTarget)}</p>
                  </div>
                  <div>
                    <p className="opp__metric-label">Maturité</p>
                    <p className="opp__metric-val">{o.maturity} ans</p>
                  </div>
                  <div>
                    <p className="opp__metric-label">Ticket dès</p>
                    <p className="opp__metric-val">{D.fmtEur(o.ticketMin)}</p>
                  </div>
                </div>
                <div className="opp__progress">
                  <div className="opp__progress-fill" style={{ width: `${pct}%` }}></div>
                </div>
                <div className="opp__progress-row">
                  <span><strong>{D.fmtEur(o.raised)}</strong> levés</span>
                  <span>sur <strong>{D.fmtEur(o.target)}</strong> · {pct.toFixed(0)}%</span>
                </div>
                <div className="opp__cta">
                  <button className="btn btn--ghost" style={{ flex: 1, justifyContent: 'center' }}>Mémorandum</button>
                  <button className="btn btn--primary" style={{ flex: 1, justifyContent: 'center' }}>Pré-engager <Icon.arrow /></button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================
// DOCUMENTS
// =============================================================
function Documents() {
  const D = window.PORTAL_DATA;
  return (
    <div className="content">
      <div className="page-head">
        <div className="page-head__copy">
          <p className="page-head__eyebrow">{D.DOCS.length} documents · 1 à signer</p>
          <h1 className="page-head__title">Contrats &amp; <em>documents</em></h1>
          <p className="page-head__sub">Conventions de prêt, avenants, attestations fiscales et rapports annuels du réseau. Tout en un seul endroit.</p>
        </div>
        <div className="row">
          <div className="seg-bar">
            <button className="is-active">Tous</button>
            <button>Contrats</button>
            <button>Fiscal</button>
            <button>Rapports</button>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        {D.DOCS.map(d => (
          <div key={d.id} className="doc-row">
            <div className="doc-row__icon">{d.kind === 'Contrat' ? 'PDF' : d.kind === 'Avenant' ? 'PDF' : d.kind === 'Fiscal' ? 'PDF' : 'PDF'}</div>
            <div>
              <p className="doc-row__title">{d.title} {d.pending && <span className="tag tag--ruby" style={{ marginLeft: 8 }}><span className="dot"></span>À signer</span>}</p>
              <p className="doc-row__sub">{d.sub}</p>
            </div>
            <div className="doc-row__meta">{d.date}</div>
            <div className="doc-row__meta">{d.size}</div>
            <button className="icon-btn" title="Télécharger"><Icon.download /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================
// NOTIFICATIONS PAGE
// =============================================================
function NotifList({ items }) {
  const ICONS = { payment: <Icon.euro />, report: <Icon.chart />, doc: <Icon.doc />, opp: <Icon.opp /> };
  const SHADES = { payment: 'success', report: 'ruby', doc: 'warn', opp: 'ruby' };
  return (
    <div className="notif-list">
      {items.map(n => (
        <button key={n.id} className={'notif-item' + (n.unread ? ' is-unread' : '')}>
          <span className={'notif-item__icon notif-item__icon--' + SHADES[n.kind]}>{ICONS[n.kind]}</span>
          <div>
            <p className="notif-item__title">{n.title}</p>
            <p className="notif-item__sub">{n.sub}</p>
          </div>
          <span className="notif-item__time">{n.time}</span>
        </button>
      ))}
    </div>
  );
}

function NotificationsPage() {
  const D = window.PORTAL_DATA;
  return (
    <div className="content content--narrow">
      <div className="page-head">
        <div className="page-head__copy">
          <p className="page-head__eyebrow">{D.NOTIFS.filter(n => n.unread).length} non lues · {D.NOTIFS.length} au total</p>
          <h1 className="page-head__title">Notifications <em>importantes</em></h1>
          <p className="page-head__sub">Les événements clés de votre portefeuille : versements, rapports mensuels, documents à signer, opportunités.</p>
        </div>
        <button className="btn btn--ghost"><Icon.check /> Tout marquer comme lu</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <NotifList items={D.NOTIFS} />
      </div>
    </div>
  );
}

// =============================================================
// PROFIL
// =============================================================
function Profil() {
  return (
    <div className="content content--narrow">
      <div className="page-head">
        <div className="page-head__copy">
          <p className="page-head__eyebrow">Investisseur depuis juin 2023</p>
          <h1 className="page-head__title">Mon <em>profil</em></h1>
        </div>
      </div>
      <div className="grid-12">
        <div className="col-6">
          <div className="card">
            <p className="card__title mb-3">Informations personnelles</p>
            <div className="stack stack--gap-md">
              <div className="row" style={{ gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 18 }}>CV</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>Claire Vermeulen</p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>claire.vermeulen@example.com</p>
                </div>
              </div>
              <div className="field">
                <label>Téléphone</label>
                <input type="tel" defaultValue="+32 478 12 34 56" />
              </div>
              <div className="field">
                <label>IBAN de versement</label>
                <input type="text" defaultValue="BE68 5390 0754 7034" />
              </div>
              <button className="btn btn--ink" style={{ alignSelf: 'flex-start' }}>Enregistrer les changements</button>
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="card">
            <p className="card__title mb-3">Préférences de notification</p>
            <div className="stack stack--gap-md">
              {[
                ['E-mail · versements reçus', true],
                ['E-mail · rapports mensuels', true],
                ['E-mail · documents à signer', true],
                ['E-mail · nouvelles opportunités', false],
                ['SMS · alertes critiques', true]
              ].map(([label, on], i) => (
                <div key={i} className="row row--between" style={{ padding: '8px 0', borderBottom: '0.5px solid var(--color-divider)' }}>
                  <span style={{ fontSize: 13 }}>{label}</span>
                  <span style={{ position: 'relative', display: 'inline-block', width: 36, height: 20, background: on ? 'var(--color-primary)' : 'var(--color-surface-2)', borderRadius: 999, transition: 'background 0.15s' }}>
                    <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}></span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="card mt-4">
            <p className="card__title mb-3">Sécurité</p>
            <div className="stack stack--gap-md">
              <div className="row row--between">
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 13 }}>Authentification à deux facteurs</p>
                  <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>Active · code SMS au numéro +32 ··· 56</p>
                </div>
                <span className="tag tag--success"><Icon.check />Active</span>
              </div>
              <div className="row row--between">
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 13 }}>Mot de passe</p>
                  <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>Mis à jour il y a 3 mois</p>
                </div>
                <button className="btn btn--ghost btn--sm">Modifier</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Expose
Object.assign(window, {
  Icon, KpiTile, NotifList, MONTHS, DashboardProjectList,
  LoginScreen, Dashboard, MagasinDetail, MagasinsList,
  Marketplace, Documents, NotificationsPage, Profil,
  ConsultantCard, FranchiseeScoreCard, NetworkRanking
});
