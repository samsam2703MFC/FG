/* global React, window */
// Franchise Generation — Back Office Central Hub
// Single-file SaaS shell: sidebar nav + topbar + module router.
// Data-driven from window.FG_DATA + window.PORTAL_DATA.

const { useState: bState, useMemo: bMemo, useEffect: bEffect } = React;

// ====================================================================
// ICONS — thin-line
// ====================================================================
const BoIcon = {
  dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  brand:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4"/><path d="M3 17l9 4 9-4"/></svg>,
  candidate: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
  investor:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>,
  developer: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V13h6v8"/></svg>,
  consultant:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/><path d="M19 5l2-2M19 5l-2-2"/></svg>,
  shop:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9v11h18V9"/><path d="M9 20v-7h6v7"/></svg>,
  opportunity:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M5 9l7-7 7 7"/></svg>,
  crm:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h6v6H3zM15 5h6v6h-6zM3 13h6v6H3zM15 13h6v6h-6z"/></svg>,
  doc:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>,
  comm:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>,
  training:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 24l28-12 28 12-28 12L4 24z" transform="scale(0.42) translate(2 2)"/><path d="M2 10l10-4 10 4-10 4z"/><path d="M5 12v5c0 2 3 3 7 3s7-1 7-3v-5"/><path d="M22 10v6"/></svg>,
  finance:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 19V5M3 19h18"/><rect x="6" y="11" width="3" height="6"/><rect x="11" y="7" width="3" height="10"/><rect x="16" y="13" width="3" height="4"/></svg>,
  web:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>,
  roles:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><circle cx="17" cy="10" r="2.5"/><path d="M14.5 19a4.5 4.5 0 0 1 7.5 0"/></svg>,
  visibility:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  preview:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8M12 18v4"/></svg>,
  automate:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H15.5M6 8.5V15.5M18 8.5V15.5M8.5 18H15.5"/></svg>,
  settings:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  search:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  bell:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>,
  plus:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  chevron:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
};

// ====================================================================
// NAV STRUCTURE
// ====================================================================
const NAV_GROUPS = [
  { label: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: BoIcon.dashboard }
  ]},
  { label: 'Pipeline', items: [
    { id: 'opportunities', label: 'Opportunities', icon: BoIcon.opportunity, badgeKey: 'opps' },
    { id: 'candidates',   label: 'Candidates',    icon: BoIcon.candidate,   badgeKey: 'leads' },
    { id: 'crm',          label: 'CRM & Leads',   icon: BoIcon.crm,         badgeKey: 'newleads' }
  ]},
  { label: 'Network', items: [
    { id: 'brands',      label: 'Brands',      icon: BoIcon.brand,     badgeKey: 'brands' },
    { id: 'shops',       label: 'Shops',       icon: BoIcon.shop,      badgeKey: 'shops' },
    { id: 'franchisees', label: 'Franchisees', icon: BoIcon.candidate }
  ]},
  { label: 'People', items: [
    { id: 'investors',   label: 'Investors',   icon: BoIcon.investor },
    { id: 'consultants', label: 'Consultants', icon: BoIcon.consultant },
    { id: 'developers',  label: 'Developers',  icon: BoIcon.developer }
  ]},
  { label: 'Platform', items: [
    { id: 'documents',     label: 'Documents',    icon: BoIcon.doc },
    { id: 'finance',       label: 'Finance',      icon: BoIcon.finance },
    { id: 'communication', label: 'Messages',     icon: BoIcon.comm,      badgeKey: 'unread' },
    { id: 'settings',      label: 'Settings',     icon: BoIcon.settings }
  ]}
];

const COUNTRIES = [
  { id: 'all', label: 'All countries' },
  { id: 'be',  label: '🇧🇪 Belgium' },
  { id: 'fr',  label: '🇫🇷 France' },
  { id: 'nl',  label: '🇳🇱 Netherlands' }
];

const STEP_LABELS = {
  'interested':            'Intérêt exprimé',
  'consultant-review':     'En revue consultant',
  'first-contact-planned': '1er contact planifié',
  'first-contact-done':    '1er contact effectué',
  'financing-precheck':    'Pré-check financement',
  'location-validation':   'Validation local',
  'business-plan':         'Business plan',
  'committee':             'Comité de validation',
  'contract-prep':         'Préparation contrat',
  'training-planning':     'Formation',
  'opening-planning':      'Planification ouverture',
};
const STEP_WEIGHT = Object.fromEntries(Object.keys(STEP_LABELS).map((k, i) => [k, i]));
function stepTone(step) {
  const w = STEP_WEIGHT[step] ?? 0;
  return w >= 7 ? 'success' : w >= 4 ? 'info' : 'neutral';
}
function addBusinessDays(days) {
  const d = new Date();
  let added = 0;
  while (added < days) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) added++; }
  return d.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long' });
}

// ====================================================================
// MAIN SHELL
// ====================================================================
function BackOffice({ currentUser, onLogout }) {
  return (
    <BoToastProvider>
      <BoMain currentUser={currentUser} onLogout={onLogout} />
    </BoToastProvider>
  );
}

function BoMain({ currentUser, onLogout }) {
  const FG = window.FG_DATA;
  const A = window.PORTAL_DATA;
  const [view, setView] = bState(new URLSearchParams(location.search).get('view') || 'dashboard');
  const [brandScope, setBrandScope] = bState('all');
  const [country, setCountry] = bState('all');
  const [search, setSearch] = bState('');
  const [brandDropdown, setBrandDropdown] = bState(false);
  const [countryDropdown, setCountryDropdown] = bState(false);
  const [userMenu, setUserMenu] = bState(false);

  const badges = bMemo(() => ({
    brands:   FG.BRANDS.length,
    shops:    A.PROJECTS.length + Object.values(FG.BRAND_PORTFOLIOS).reduce((a, b) => a + b.shops.length, 0),
    opps:     FG.ONBOARDING_OPPORTUNITIES.length,
    leads:    FG.CANDIDATES.length,
    newleads: FG.CANDIDATE_LEADS.length + (FG.NEW_BRAND_LEADS?.length || 0),
    unread:   FG.SUPPORT_TICKETS.filter(t => t.messages.some(m => m.unread)).length
  }), []);

  const ctx = { FG, A, view, setView, brandScope, country, search, setSearch, badges };

  return (
    <div className="bo">
      {/* SIDEBAR */}
      <aside className="bo-side">
        <div className="bo-side__head">
          <a href="landing.html" className="bo-side__logo">
            <img src="img/fg-logo.png" alt="Franchise Generation" />
          </a>
          <span className="bo-side__badge">SaaS</span>
        </div>

        {/* Multi-brand + country */}
        <div className="bo-side__scopes">
          <button className={'bo-scope' + (brandDropdown ? ' is-open' : '')} onClick={() => setBrandDropdown(v => !v)}>
            <span className="bo-scope__l">Brand scope</span>
            <span className="bo-scope__v">
              {brandScope === 'all' ? 'All brands' : FG.brandById(brandScope)?.name}
              <BoIcon.chevron />
            </span>
            {brandDropdown && (
              <div className="bo-dropdown">
                <button onClick={() => { setBrandScope('all'); setBrandDropdown(false); }}>All brands</button>
                {FG.BRANDS.map(b => (
                  <button key={b.id} onClick={() => { setBrandScope(b.id); setBrandDropdown(false); }}>
                    <span className="bo-dropdown__dot" style={{ background: b.tokens.primary }}></span>{b.name}
                  </button>
                ))}
              </div>
            )}
          </button>
          <button className={'bo-scope' + (countryDropdown ? ' is-open' : '')} onClick={() => setCountryDropdown(v => !v)}>
            <span className="bo-scope__l">Country</span>
            <span className="bo-scope__v">
              {COUNTRIES.find(c => c.id === country)?.label}
              <BoIcon.chevron />
            </span>
            {countryDropdown && (
              <div className="bo-dropdown">
                {COUNTRIES.map(c => (
                  <button key={c.id} onClick={() => { setCountry(c.id); setCountryDropdown(false); }}>{c.label}</button>
                ))}
              </div>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="bo-nav">
          {NAV_GROUPS.map(g => (
            <div key={g.label} className="bo-nav__group">
              <p className="bo-nav__group-label">{g.label}</p>
              {g.items.map(it => (
                <button key={it.id}
                  className={'bo-nav__item' + (view === it.id ? ' is-active' : '')}
                  onClick={() => setView(it.id)}>
                  <span className="bo-nav__icon"><it.icon /></span>
                  <span className="bo-nav__label">{it.label}</span>
                  {it.badgeKey && badges[it.badgeKey] > 0 && (
                    <span className="bo-nav__badge">{badges[it.badgeKey]}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="bo-main">
        {/* TOPBAR */}
        <header className="bo-top">
          <div className="bo-search">
            <BoIcon.search />
            <input type="text" placeholder="Search anything — candidates, brands, opportunities, documents…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
            <kbd>⌘K</kbd>
          </div>
          <div className="bo-top__actions">
            <button className="bo-top__btn" onClick={() => openModal('new-lead')}><BoIcon.plus /><span>Quick add</span></button>
            <button className="bo-top__icon" title="Notifications" onClick={() => toast('info', 'Notifications center coming soon.')}>
              <BoIcon.bell />
              <span className="bo-top__dot"></span>
            </button>
            <button className={'bo-user' + (userMenu ? ' is-open' : '')} onClick={() => setUserMenu(v => !v)}>
              <span className="bo-user__avatar">
                {(currentUser?.name || currentUser?.email || 'A')[0].toUpperCase()}
              </span>
              <span className="bo-user__col">
                <span className="bo-user__name">{currentUser?.name || 'Admin'}</span>
                <span className="bo-user__role">{currentUser?.role === 'admin' ? 'Group Admin' : 'Consultant'}</span>
              </span>
              <BoIcon.chevron />
              {userMenu && (
                <div className="bo-dropdown bo-dropdown--right">
                  <button>My profile</button>
                  <button>Audit log</button>
                  <button onClick={onLogout} style={{ color: '#c0392b' }}>Sign out</button>
                </div>
              )}
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="bo-content">
          {view === 'dashboard'     && <BoDashboard ctx={ctx} />}
          {view === 'opportunities' && <BoOpportunities ctx={ctx} />}
          {view === 'candidates'    && <BoCandidates ctx={ctx} />}
          {view === 'crm'           && <BoCRM ctx={ctx} />}
          {view === 'brands'        && <BoBrands ctx={ctx} />}
          {view === 'shops'         && <BoShops ctx={ctx} />}
          {view === 'franchisees'   && <BoFranchisees ctx={ctx} />}
          {view === 'investors'     && <BoInvestors ctx={ctx} />}
          {view === 'consultants'   && <BoConsultants ctx={ctx} />}
          {view === 'developers'    && <BoDevelopers ctx={ctx} />}
          {view === 'documents'     && <BoDocuments ctx={ctx} />}
          {view === 'finance'       && <BoFinance ctx={ctx} />}
          {view === 'communication' && <BoCommunication ctx={ctx} />}
          {view === 'settings'      && <BoSettings ctx={ctx} />}
        </div>
      </main>
      <BoModalsRoot ctx={ctx} />
    </div>
  );
}

// ====================================================================
// PAGE HEADER (shared)
// ====================================================================
function BoHead({ eyebrow, title, sub, actions }) {
  return (
    <header className="bo-head">
      <div>
        <p className="bo-head__eyebrow">{eyebrow}</p>
        <h1 className="bo-head__title">{title}</h1>
        {sub && <p className="bo-head__sub">{sub}</p>}
      </div>
      {actions && <div className="bo-head__actions">{actions}</div>}
    </header>
  );
}

// ====================================================================
// DASHBOARD
// ====================================================================
function BoDashboard({ ctx }) {
  const { FG, A, badges } = ctx;
  const totalInvested = A.PROJECTS.reduce((a, p) => a + p.invested, 0) +
    Object.values(FG.BRAND_PORTFOLIOS).reduce((a, b) => a + b.summary.invested, 0);
  const pipelineLeads = FG.CANDIDATE_LEADS.length;
  const blockedProjects = FG.CANDIDATES.flatMap(c => c.opportunities).filter(o => o.validationStatus === 'on-hold').length;
  const pendingSign = FG.FG_DOCS.filter(d => d.status === 'pending').length;
  const newOpps = FG.ONBOARDING_OPPORTUNITIES.length;
  const newBrand = FG.NEW_BRAND_LEADS?.length || 0;
  const newCandidate = FG.CANDIDATE_LEADS.filter(l => l.currentStep === 'interested' || l.currentStep === 'consultant-review').length;

  return (
    <>
      <BoHead eyebrow="Overview" title="Group dashboard"
        sub="Vue consolidée — multi-marques, multi-pays."
        actions={(
          <>
            <button className="bo-btn bo-btn--ghost" onClick={() => toast('info', 'Saved views · coming soon.')}>Saved views ▾</button>
            <button className="bo-btn bo-btn--ghost" onClick={() => toast('success', 'Export started · you’ll receive an email when ready.')}>Export</button>
            <button className="bo-btn bo-btn--primary" onClick={() => openModal('new-lead')}><BoIcon.plus />New widget</button>
          </>
        )}
      />

      <div className="bo-kpis">
        {[
          { l: 'New leads · 7d',         v: newCandidate + newBrand, foot: 'All sources',                    trend: '+18 %' },
          { l: 'Active candidates',      v: FG.CANDIDATES.length,    foot: 'Across all brands',              trend: '+2' },
          { l: 'Active investors',       v: 1,                       foot: FG.INVESTOR.name + ' + 0 others' },
          { l: 'New opportunities',      v: newOpps,                 foot: 'Open + pre-launch' },
          { l: 'Shops opening',          v: FG.ONBOARDING_OPPORTUNITIES.filter(o => o.opening.startsWith('Q3') || o.opening.startsWith('Q4')).length, foot: 'Within 6 months' },
          { l: 'Capital placed',         v: FG.fmtEur(totalInvested),foot: 'Network-wide' },
          { l: 'Blocked projects',       v: blockedProjects,         foot: 'Need review',                    flag: blockedProjects > 0 },
          { l: 'Signatures pending',     v: pendingSign,             foot: 'Across all docs',                flag: pendingSign > 0 }
        ].map((k, i) => (
          <article key={i} className="bo-kpi">
            <p className="bo-kpi__l">{k.l}</p>
            <p className="bo-kpi__v">{k.v}</p>
            <p className={'bo-kpi__foot' + (k.flag ? ' is-flag' : '')}>{k.foot}{k.trend && <span className="bo-kpi__trend">{k.trend}</span>}</p>
          </article>
        ))}
      </div>

      <div className="bo-grid">
        {/* Pipeline */}
        <article className="bo-card bo-card--span2">
          <header className="bo-card__head">
            <h2 className="bo-card__title">Sales pipeline</h2>
            <button className="bo-card__more">Open CRM →</button>
          </header>
          <div className="bo-pipeline">
            {['Interested','Consultant review','Contact','Validation','Committee','Contract','Closed'].map((stage, i) => {
              const count = i === 0 ? newCandidate
                : i === 1 ? FG.CANDIDATE_LEADS.filter(l => l.currentStep === 'consultant-review').length
                : i === 2 ? FG.CANDIDATE_LEADS.filter(l => ['first-contact-planned','first-contact-done'].includes(l.currentStep)).length
                : i === 3 ? FG.CANDIDATE_LEADS.filter(l => ['financing-precheck','location-validation','business-plan'].includes(l.currentStep)).length
                : i === 4 ? FG.CANDIDATE_LEADS.filter(l => l.currentStep === 'committee').length
                : i === 5 ? 1
                : 4;
              const max = 6;
              return (
                <div key={stage} className="bo-pipe-step">
                  <div className="bo-pipe-step__bar" style={{ height: 12 + (count / max) * 80 + 'px' }}></div>
                  <p className="bo-pipe-step__num">{count}</p>
                  <p className="bo-pipe-step__label">{stage}</p>
                </div>
              );
            })}
          </div>
        </article>

        {/* Network growth */}
        <article className="bo-card">
          <header className="bo-card__head">
            <h2 className="bo-card__title">Network growth</h2>
          </header>
          <div className="bo-growth">
            <p className="bo-growth__num">+{Math.round(badges.shops * 0.18)}</p>
            <p className="bo-growth__sub">new shops planned over 12 months</p>
          </div>
          <div className="bo-growth__bar">
            {FG.BRANDS.map(b => (
              <div key={b.id} className="bo-growth__seg" style={{ background: b.tokens.primary, flex: 1 }}>
                <span>{b.logoMark}</span>
              </div>
            ))}
          </div>
          <p className="bo-card__foot">Distribution across {FG.BRANDS.length} brands</p>
        </article>

        {/* Urgent tasks */}
        <article className="bo-card">
          <header className="bo-card__head">
            <h2 className="bo-card__title">Urgent tasks</h2>
            <span className="bo-card__count">5</span>
          </header>
          <ul className="bo-tasks">
            <li><span className="bo-tasks__dot bo-tasks__dot--red"></span>Comité Couq Anvers · présentation due 24 mai</li>
            <li><span className="bo-tasks__dot bo-tasks__dot--amber"></span>Justificatif de domicile expiré — Claire Vermeulen</li>
            <li><span className="bo-tasks__dot bo-tasks__dot--red"></span>Closing Mania Pizza Namur · 12 jours restants</li>
            <li><span className="bo-tasks__dot bo-tasks__dot--amber"></span>Avenant contrat à signer — L'Atelier Liège</li>
            <li><span className="bo-tasks__dot bo-tasks__dot--blue"></span>Onboarding Marie Lemoine · pré-check financement</li>
          </ul>
        </article>

        {/* Latest activity */}
        <article className="bo-card bo-card--span2">
          <header className="bo-card__head">
            <h2 className="bo-card__title">Latest activity</h2>
            <button className="bo-card__more">View audit log →</button>
          </header>
          <ul className="bo-activity">
            <li><strong>Léa Dupuis</strong> submitted a new brand concept "Maison Ortie" · 14 may</li>
            <li><strong>Sophie Renard</strong> moved Marie Lemoine to "Pre-check financement" · 15 may</li>
            <li><strong>Karim Boulahia</strong> opened ticket "Closing imminent · Mania Namur" · 4h</li>
            <li><strong>System</strong> generated April monthly reports for the 5 L'Atelier shops · 02 may</li>
            <li><strong>Estelle Marchand</strong> uploaded BP v2 — Cookie's Outremeuse · 6h</li>
            <li><strong>Sam Verheyden</strong> approved brand presentation update — Couq · yesterday</li>
          </ul>
        </article>
      </div>
    </>
  );
}

// ====================================================================
// REUSABLE TABLE
// ====================================================================
function BoTable({ columns, rows, onRow }) {
  return (
    <div className="bo-table">
      <table>
        <thead><tr>{columns.map(c => <th key={c.k} style={c.align && { textAlign: c.align }}>{c.l}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i} onClick={() => onRow?.(r)}>
              {columns.map(c => <td key={c.k} style={c.align && { textAlign: c.align }}>{c.render ? c.render(r) : r[c.k]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BoFilters({ filters }) {
  return (
    <div className="bo-filters">
      {filters.map((f, i) => (
        <div key={i} className="bo-filter">
          <label>{f.label}</label>
          {f.kind === 'search' ? (
            <input type="text" placeholder={f.placeholder} />
          ) : (
            <select>{f.options.map(o => <option key={o}>{o}</option>)}</select>
          )}
        </div>
      ))}
    </div>
  );
}

function BoStatus({ tone, children }) {
  return <span className={'bo-status bo-status--' + (tone || 'neutral')}>● {children}</span>;
}

// ====================================================================
// BRANDS
// ====================================================================
function BoBrands({ ctx }) {
  const { FG } = ctx;
  return (
    <>
      <BoHead eyebrow="Network · Brands" title="Brand management"
        sub="Gérer l'identité, les équipes, les KPI et les paramètres de chaque marque."
        actions={(
          <>
            <button className="bo-btn bo-btn--ghost" onClick={() => toast('info', 'Import wizard coming soon.')}>Import</button>
            <a className="bo-btn bo-btn--primary" href="brand-create.html"><BoIcon.plus />New brand</a>
          </>
        )}
      />
      <BoFilters filters={[
        { label: 'Search', kind: 'search', placeholder: 'Brand name…' },
        { label: 'Country', kind: 'select', options: ['All', 'Belgium', 'France', 'Netherlands'] },
        { label: 'Status', kind: 'select', options: ['All', 'Active', 'Pilot', 'Paused'] }
      ]}/>
      <BoTable
        columns={[
          { k: 'brand', l: 'Brand', render: (r) => (
            <span className="bo-cell-brand">
              <span className="bo-cell-brand__mark" style={{ background: r.tokens.primary, color: '#fff' }}>{r.logoMark}</span>
              <span>
                <p className="bo-cell-brand__name">{r.name}</p>
                <p className="bo-cell-brand__kind">{r.kind} · {r.headquarters}</p>
              </span>
            </span>
          )},
          { k: 'shops',     l: 'Shops',     render: (r) => (FG.BRAND_PORTFOLIOS[r.id]?.shops.length || 5) + ' active' },
          { k: 'opps',     l: 'Open opps', render: (r) => FG.ONBOARDING_OPPORTUNITIES.filter(o => o.brand === r.id).length },
          { k: 'team',     l: 'Team',      render: (r) => (FG.BRAND_PRESENTATION[r.id]?.team?.length || 0) + ' members' },
          { k: 'status',   l: 'Status',    render: () => <BoStatus tone="success">Active</BoStatus> },
          { k: 'updated',  l: 'Updated',   render: () => 'Today' },
          { k: 'go',       l: '',          align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Open →</button> }
        ]}
        rows={FG.BRANDS}
      />
    </>
  );
}

// ====================================================================
// CANDIDATES
// ====================================================================
function CandidateDetailPanel({ candidate, leads, allOpps, closedMap, onClose, onRequestValidate }) {
  const region = null; // resolved by parent
  return (
    <>
      <div className="bo-panel-backdrop" onClick={onClose} />
      <aside className="bo-panel" style={{ maxWidth: 560 }}>
        <header className="bo-panel__head">
          <div>
            <p className="bo-panel__eyebrow">Candidate · Profil</p>
            <h2 className="bo-panel__title">{candidate.firstName} {candidate.lastName}</h2>
            <p className="bo-panel__sub">{candidate.email} · {candidate.phone}</p>
          </div>
          <button className="bo-panel__close" onClick={onClose}>✕</button>
        </header>

        <div className="bo-panel__body">
          {/* Info block */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 32, fontSize: 13 }}>
            <div><p style={{ color: 'rgba(14,27,40,.5)', marginBottom: 2 }}>Budget</p><strong>{candidate.budget?.toLocaleString('fr-BE')} €</strong></div>
            <div><p style={{ color: 'rgba(14,27,40,.5)', marginBottom: 2 }}>Apport estimé</p><strong>{candidate.financingCapacity ? candidate.financingCapacity.slice(0, 30) + '…' : '—'}</strong></div>
            <div><p style={{ color: 'rgba(14,27,40,.5)', marginBottom: 2 }}>Statut</p><BoStatus tone="warning">{candidate.generalStatus}</BoStatus></div>
          </div>

          {candidate.motivation && (
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'rgba(14,27,40,.7)', fontStyle: 'italic' }}>
              "{candidate.motivation}"
            </div>
          )}

          {/* Leads / opportunities */}
          <div style={{ padding: '12px 20px 6px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', color: 'rgba(14,27,40,.45)', textTransform: 'uppercase', marginBottom: 10 }}>
              Opportunités ({leads.length})
            </p>
          </div>

          {!leads.length && (
            <div className="bo-panel__empty">Aucun lead actif pour ce candidat.</div>
          )}

          {leads.map(lead => {
            const opp = allOpps.find(o => o.id === lead.opportunity) || { id: lead.opportunity, name: lead.opportunity };
            const isClosed = opp.status === 'closed-won' || !!closedMap[opp.id];
            const isWinner = isClosed && opp.validatedCandidateId === lead.id;
            const portalId = closedMap[opp.id]?.onboardingId || null;

            return (
              <div key={lead.id} className={`bo-candidate-card${lead.priority === 'high' ? ' bo-candidate-card--high' : ''}`}>
                <div className="bo-candidate-card__top">
                  <div className="bo-candidate-card__info" style={{ flex: 1 }}>
                    <p className="bo-candidate-card__name" style={{ fontSize: 14 }}>{opp.name}</p>
                    <p className="bo-candidate-card__contact">
                      {opp.city || opp.location || ''}{opp.brand ? ` · ${opp.brand}` : ''}
                    </p>
                    <p className="bo-candidate-card__meta">
                      <span>Consultant: {lead.assignedTo?.name || '—'}</span>
                      <span> · Source: {lead.source}</span>
                    </p>
                  </div>
                  {!isClosed && (
                    <button className="bo-btn bo-btn--primary bo-btn--sm"
                      onClick={() => onRequestValidate(lead, opp)}>
                      ✓ Valider
                    </button>
                  )}
                  {isWinner && <span className="bo-validated-badge">✓ Validé</span>}
                  {isClosed && !isWinner && <BoStatus tone="muted">Non retenu</BoStatus>}
                </div>

                <div className="bo-candidate-card__pipeline">
                  <BoStatus tone={stepTone(lead.currentStep)}>
                    {STEP_LABELS[lead.currentStep] || lead.currentStep}
                  </BoStatus>
                  {isWinner && portalId && (
                    <a className="bo-btn bo-btn--ghost bo-btn--xs"
                       href={`franchise-portal.html?id=${portalId}`}
                       target="_blank" rel="noopener noreferrer"
                       onClick={e => e.stopPropagation()}>
                      Portail franchisé →
                    </a>
                  )}
                </div>

                {lead.notes && (
                  <p className="bo-candidate-card__notes">{lead.notes}</p>
                )}

                <div className="bo-candidate-card__foot">
                  <span>Prochaine action: {lead.nextAction || '—'}</span>
                  <span>Créé: {lead.createdAt?.slice(0, 10)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}

function BoCandidates({ ctx }) {
  const { FG } = ctx;
  const currentUser = window.FG_CURRENT_USER || {};
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);
  const [confirmLead,       setConfirmLead]       = React.useState(null); // { lead, opp }
  const [successData,       setSuccessData]       = React.useState(null);
  const [closedMap,         setClosedMap]         = React.useState({});

  const allOpps = FG.ONBOARDING_OPPORTUNITIES;

  // Find leads for a candidate by email match
  const leadsFor = (candidate) =>
    FG.CANDIDATE_LEADS.filter(l => l.candidate.email === candidate.email);

  const handleConfirmValidate = async () => {
    const { lead, opp } = confirmLead;
    const capturedOpp = opp;

    setConfirmLead(null);
    await new Promise(r => setTimeout(r, 0));

    let onboardingId = null;
    try {
      const token = (() => { try { return JSON.parse(localStorage.getItem('fg_auth') || '{}').token || ''; } catch { return ''; } })();
      const res = await fetch(`/api/opportunities/${opp.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ candidateId: lead.id }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast('error', err.error || `Validation failed (${res.status})`);
        return;
      }
      const json = await res.json();
      onboardingId = json?.data?.onboardingRecord?.id || null;
    } catch (err) {
      toast('error', err.name === 'TimeoutError' ? 'Request timed out — please retry.' : 'Network error — validation not saved.');
      return;
    }

    setClosedMap(m => ({
      ...m,
      [opp.id]: { validatedCandidateId: lead.id, validatedBy: currentUser.email, validatedAt: new Date().toISOString(), onboardingId }
    }));
    const liveOpp = allOpps.find(o => o.id === opp.id);
    if (liveOpp) { liveOpp.status = 'closed-won'; liveOpp.validatedCandidateId = lead.id; }

    setSelectedCandidate(null);
    setSuccessData({ lead, opp: capturedOpp, onboardingId });
  };

  return (
    <>
      <BoHead eyebrow="People · Candidates" title="Candidate management"
        sub="Profils, leads multiples, scoring et pré-analyse consultant."
        actions={(<>
          <button className="bo-btn bo-btn--ghost" onClick={() => toast('success', 'Export started.')}>Export</button>
          <button className="bo-btn bo-btn--primary" onClick={() => openModal('new-lead', { type: 'candidate' })}><BoIcon.plus />New candidate</button>
        </>)}
      />
      <BoFilters filters={[
        { label: 'Search', kind: 'search', placeholder: 'Name, email, phone…' },
        { label: 'Region', kind: 'select', options: ['All', ...FG.REGIONS.map(r => r.label)] },
        { label: 'Status', kind: 'select', options: ['All', 'Pre-analysis', 'In workflow', 'Validated', 'On hold'] },
        { label: 'Capital', kind: 'select', options: ['Any', '< 25k', '25k–75k', '75k–150k', '150k+'] }
      ]}/>
      <BoTable
        onRow={setSelectedCandidate}
        columns={[
          { k: 'name', l: 'Candidate', render: (r) => (
            <span className="bo-cell-brand">
              <span className="bo-cell-brand__mark" style={{ background: 'var(--brand-primary)' }}>
                {r.firstName[0]}{r.lastName[0]}
              </span>
              <span>
                <p className="bo-cell-brand__name">{r.firstName} {r.lastName}</p>
                <p className="bo-cell-brand__kind">{r.email}</p>
              </span>
            </span>
          )},
          { k: 'region',  l: 'Region',  render: (r) => FG.REGIONS.find(x => x.id === r.preferredRegion)?.label },
          { k: 'budget',  l: 'Budget',  render: (r) => FG.fmtEur(r.budget) },
          { k: 'opps',    l: 'Opportunities', render: (r) => `${leadsFor(r).length} leads` },
          { k: 'status',  l: 'Status',  render: (r) => <BoStatus tone={r.opportunities.some(o => o.validationStatus === 'validated') ? 'success' : 'warning'}>{r.generalStatus}</BoStatus> },
          { k: 'go', l: '', align: 'right', render: (r) => (
            <button className="bo-btn bo-btn--ghost bo-btn--xs" onClick={e => { e.stopPropagation(); setSelectedCandidate(r); }}>Voir →</button>
          )}
        ]}
        rows={FG.CANDIDATES}
      />

      {/* Slide-in panel */}
      {selectedCandidate && (
        <CandidateDetailPanel
          candidate={selectedCandidate}
          leads={leadsFor(selectedCandidate)}
          allOpps={allOpps}
          closedMap={closedMap}
          onClose={() => setSelectedCandidate(null)}
          onRequestValidate={(lead, opp) => setConfirmLead({ lead, opp })}
        />
      )}

      {/* Step 1 — confirm modal */}
      {confirmLead && (
        <ValidateConfirmModal
          candidate={confirmLead.lead}
          opp={confirmLead.opp}
          losersCount={FG.CANDIDATE_LEADS.filter(l => l.opportunity === confirmLead.opp?.id && l.id !== confirmLead.lead.id).length}
          onClose={() => setConfirmLead(null)}
          onConfirm={handleConfirmValidate}
        />
      )}

      {/* Step 2 — success modal with portal link */}
      {successData && (
        <ValidationSuccessModal
          candidate={successData.lead}
          opp={successData.opp}
          onboardingId={successData.onboardingId}
          onClose={() => setSuccessData(null)}
        />
      )}
    </>
  );
}

// ====================================================================
// INVESTORS
// ====================================================================
function BoInvestors({ ctx }) {
  const { FG } = ctx;
  const [investors, setInvestors] = bState([FG.INVESTOR]);
  const [loading, setLoading] = bState(true);

  bEffect(() => {
    const token = (() => { try { return JSON.parse(localStorage.getItem('fg_auth') || '{}').token || ''; } catch { return ''; } })();
    fetch('/api/investors', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data) setInvestors(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Compute KYC counts from real documents
  const kycDocs   = FG.FG_DOCS.filter(d => d.type === 'kyc' || d.type === 'identity' || d.type === 'contract');
  const kycCounts = {
    validated: kycDocs.filter(d => d.status === 'validated' || d.status === 'signed').length,
    pending:   kycDocs.filter(d => d.status === 'pending' || d.status === 'review').length,
    expired:   kycDocs.filter(d => d.status === 'expired').length,
    missing:   kycDocs.filter(d => d.status === 'missing').length
  };

  return (
    <>
      <BoHead eyebrow="People · Investors" title="Investor management"
        sub="Profils, budgets, ROI recherchés et investissements actifs."
        actions={(<>
          <button className="bo-btn bo-btn--ghost" onClick={() => openModal('detail', { title: 'KYC overview', eyebrow: 'Compliance', rows: [
            { l: 'Validated', v: String(kycCounts.validated) },
            { l: 'Pending',   v: String(kycCounts.pending) },
            { l: 'Expired',   v: String(kycCounts.expired) },
            { l: 'Missing',   v: String(kycCounts.missing) }
          ] })}>KYC overview</button>
          <button className="bo-btn bo-btn--primary" onClick={() => openModal('new-lead', { type: 'investor' })}><BoIcon.plus />New investor</button>
        </>)}
      />
      <BoFilters filters={[
        { label: 'Search', kind: 'search', placeholder: 'Investor name…' },
        { label: 'Tier', kind: 'select', options: ['All', 'Privilège', 'Premium', 'Standard', 'Pilot'] },
        { label: 'Status', kind: 'select', options: ['All', 'funded', 'signed', 'prospect'] }
      ]}/>
      {loading && <p style={{ padding: 24, color: 'rgba(14,27,40,.4)' }}>Loading investors…</p>}
      {!loading && (
        <BoTable
          columns={[
            { k: 'name', l: 'Investor', render: (r) => (
              <span className="bo-cell-brand">
                <span className="bo-cell-brand__mark" style={{ background: 'var(--brand-primary)' }}>{r.initials || r.name?.[0]}</span>
                <span>
                  <p className="bo-cell-brand__name">{r.name}</p>
                  <p className="bo-cell-brand__kind">{r.email}</p>
                </span>
              </span>
            )},
            { k: 'tier',      l: 'Tier',     render: (r) => <BoStatus tone={r.tier === 'Privilège' || r.tier === 'Premium' ? 'success' : 'info'}>{r.tier || '—'}</BoStatus> },
            { k: 'invested',  l: 'Invested',  render: (r) => FG.fmtEur(r.totalInvested || 0) },
            { k: 'brands',    l: 'Brands',    render: (r) => (r.brands || []).length },
            { k: 'since',     l: 'Since',     render: (r) => r.since || '—' },
            { k: 'go', l: '', align: 'right', render: (r) => <a className="bo-btn bo-btn--ghost bo-btn--xs" href={`investor-profile.html?investor=${r.id}`}>Open →</a> }
          ]}
          rows={investors}
        />
      )}
    </>
  );
}

// ====================================================================
// DEVELOPERS (real estate)
// ====================================================================
function BoDevelopers({ ctx }) {
  const { FG } = ctx;
  const devs = FG.DEVELOPERS || [];
  return (
    <>
      <BoHead eyebrow="People · Developers" title="Real estate developers"
        sub="Cellules commerciales et projets immobiliers proposés au réseau."
        actions={(<button className="bo-btn bo-btn--primary" onClick={() => openModal('new-lead', { type: 'developer' })}><BoIcon.plus />New developer</button>)}
      />
      <BoFilters filters={[
        { label: 'Search', kind: 'search', placeholder: 'Developer or city…' },
        { label: 'Region', kind: 'select', options: ['All', ...FG.REGIONS.map(r => r.label)] },
        { label: 'Status', kind: 'select', options: ['All', 'pending', 'active', 'inactive', 'archived'] }
      ]}/>
      <BoTable
        columns={[
          { k: 'developer', l: 'Developer', render: (r) => (
            <span className="bo-cell-brand">
              <span className="bo-cell-brand__mark" style={{ background: 'var(--brand-primary)' }}>
                {(r.name || '?')[0]}
              </span>
              <span>
                <p className="bo-cell-brand__name">{r.name}</p>
                <p className="bo-cell-brand__kind">{r.contactName} · {r.email}</p>
              </span>
            </span>
          )},
          { k: 'regions', l: 'Regions', render: (r) => (r.regions || []).map(rid => FG.REGIONS.find(x => x.id === rid)?.label || rid).join(', ') || '—' },
          { k: 'locations', l: 'Locations', render: (r) => `${(r.locations || []).length} loc.`, align: 'right' },
          { k: 'status', l: 'Status', render: (r) => <BoStatus tone={r.status === 'active' ? 'success' : r.status === 'pending' ? 'warning' : 'neutral'}>{r.status || 'pending'}</BoStatus> },
          { k: 'go', l: '', align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Open →</button> }
        ]}
        rows={devs}
      />
      {devs.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(14,27,40,.4)', fontSize: 14 }}>No developers yet — add one above.</p>}
    </>
  );
}

// ====================================================================
// CONSULTANTS
// ====================================================================
function BoConsultants({ ctx }) {
  const consultants = [
    { id: 'c1', name: 'Sophie Renard', role: 'Consultante · Réseau Bruxelles', leads: 8, perf: 'Top 10%' },
    { id: 'c2', name: 'Karim Boulahia', role: 'Consultant · Réseau Wallonie', leads: 5, perf: 'Top 20%' },
    { id: 'c3', name: 'Lara Wauters', role: 'Consultante · Couq',           leads: 6, perf: 'Top 15%' },
    { id: 'c4', name: 'Niels Vandenberg', role: 'Consultant · Flandre',      leads: 4, perf: 'Standard' }
  ];
  return (
    <>
      <BoHead eyebrow="People · Consultants" title="Consultants & operations"
        sub="Pipelines, scoring et KPI consultants."
        actions={(<button className="bo-btn bo-btn--primary" onClick={() => openModal('new-lead', { type: 'consultant' })}><BoIcon.plus />Add consultant</button>)}
      />
      <BoTable
        columns={[
          { k: 'name', l: 'Consultant', render: (r) => (
            <span className="bo-cell-brand">
              <span className="bo-cell-brand__mark" style={{ background: 'var(--brand-primary)' }}>{r.name.split(' ').map(s => s[0]).join('')}</span>
              <span>
                <p className="bo-cell-brand__name">{r.name}</p>
                <p className="bo-cell-brand__kind">{r.role}</p>
              </span>
            </span>
          )},
          { k: 'leads', l: 'Active leads' },
          { k: 'perf', l: 'Performance', render: (r) => <BoStatus tone="success">{r.perf}</BoStatus> },
          { k: 'go', l: '', align: 'right', render: () => <a className="bo-btn bo-btn--ghost bo-btn--xs" href="consultant.html">Open →</a> }
        ]}
        rows={consultants}
      />
    </>
  );
}

// ====================================================================
// FRANCHISEES
// ====================================================================
function BoFranchisees({ ctx }) {
  const { FG, A } = ctx;
  const rows = [];
  A.PROJECTS.forEach(p => rows.push({ id: p.id, name: 'Franchisé pilote', shop: p.name, brand: 'atelier', tier: 'Or', perf: 4.6 }));
  Object.entries(FG.BRAND_PORTFOLIOS).forEach(([brandId, b]) => b.shops.forEach(s => rows.push({ id: s.id, name: s.franchisee.name, shop: s.name, brand: brandId, tier: s.franchisee.tier, perf: s.franchisee.overall })));
  return (
    <>
      <BoHead eyebrow="People · Franchisees" title="Active franchisees"
        sub="Performance, royalties, audits et formation continue."
      />
      <BoTable
        columns={[
          { k: 'name',  l: 'Franchisee', render: (r) => <strong>{r.name}</strong> },
          { k: 'shop',  l: 'Shop' },
          { k: 'brand', l: 'Brand', render: (r) => {
            const b = FG.brandById(r.brand);
            return b ? <span><span className="bo-dot" style={{ background: b.tokens.primary }}></span>{b.name}</span> : '—';
          }},
          { k: 'tier',  l: 'Tier',  render: (r) => <BoStatus tone={r.tier === 'Or' ? 'success' : r.tier === 'Argent' ? 'warning' : 'info'}>{r.tier}</BoStatus> },
          { k: 'perf',  l: 'Score 360°', render: (r) => r.perf.toFixed(1) + ' / 5' },
          { k: 'go', l: '', align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Open →</button> }
        ]}
        rows={rows}
      />
    </>
  );
}

// ====================================================================
// SHOPS
// ====================================================================
function BoShops({ ctx }) {
  const { FG, A } = ctx;
  const rows = [];
  A.PROJECTS.forEach(p => rows.push({ id: p.id, name: p.name, brand: 'atelier', city: p.city, kind: p.kind, opened: p.opened, ca: p.kpi.ca.at(-1) }));
  Object.entries(FG.BRAND_PORTFOLIOS).forEach(([brandId, b]) => b.shops.forEach(s => rows.push({ id: s.id, name: s.name, brand: brandId, city: s.city, kind: s.kind, opened: s.opened, ca: s.kpiSnapshot.ca })));
  return (
    <>
      <BoHead eyebrow="Network · Shops" title="Shop management"
        sub={`${rows.length} shops across ${FG.BRANDS.length} brands.`}
        actions={(<button className="bo-btn bo-btn--primary" onClick={() => openModal('new-shop')}><BoIcon.plus />New shop</button>)}
      />
      <BoTable
        columns={[
          { k: 'name', l: 'Shop', render: (r) => <strong>{r.name}</strong> },
          { k: 'brand', l: 'Brand', render: (r) => {
            const b = FG.brandById(r.brand);
            return <span><span className="bo-dot" style={{ background: b.tokens.primary }}></span>{b.name}</span>;
          }},
          { k: 'city',   l: 'City' },
          { k: 'kind',   l: 'Format' },
          { k: 'opened', l: 'Opened' },
          { k: 'ca',     l: 'CA / mois', align: 'right', render: (r) => FG.fmtEur(r.ca) },
          { k: 'go', l: '', align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Open →</button> }
        ]}
        rows={rows}
      />
    </>
  );
}

// ====================================================================
// OPPORTUNITIES — table + candidates panel + validate flow
// ====================================================================

// Candidates side panel — pure presenter; no modal state lives here.
// "Valider" delegates up to onRequestValidate(lead) so the parent owns sequencing.
function CandidatesPanel({ opp, candidates, readOnly, onClose, onRequestValidate }) {
  return (
    <>
      <div className="bo-panel-backdrop" onClick={onClose} />
      <aside className="bo-panel">
        <header className="bo-panel__head">
          <div>
            <p className="bo-panel__eyebrow">Candidates</p>
            <h2 className="bo-panel__title">{opp.name}</h2>
            <p className="bo-panel__sub">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
              {readOnly && <> · <span className="bo-panel__closed-tag">Closed — Won</span></>}
            </p>
          </div>
          <button className="bo-panel__close" onClick={onClose}>✕</button>
        </header>

        <div className="bo-panel__body">
          {!candidates.length && (
            <div className="bo-panel__empty">No candidates for this opportunity yet.</div>
          )}
          {candidates.map(lead => (
            <div key={lead.id} className={`bo-candidate-card${lead.priority === 'high' ? ' bo-candidate-card--high' : ''}`}>
              <div className="bo-candidate-card__top">
                <div className="bo-candidate-card__avatar">
                  {lead.candidate.name[0]}
                </div>
                <div className="bo-candidate-card__info">
                  <p className="bo-candidate-card__name">{lead.candidate.name}</p>
                  <p className="bo-candidate-card__contact">
                    {lead.candidate.email} · {lead.candidate.phone}
                  </p>
                  <p className="bo-candidate-card__meta">
                    <span>Source: {lead.source}</span>
                    <span> · Budget: {lead.candidate.capital}</span>
                  </p>
                </div>
                {!readOnly && (
                  <button className="bo-btn bo-btn--primary bo-btn--sm"
                    onClick={() => onRequestValidate(lead)}>
                    ✓ Valider
                  </button>
                )}
                {readOnly && lead.id === opp.validatedCandidateId && (
                  <span className="bo-validated-badge">✓ Validé</span>
                )}
              </div>

              <div className="bo-candidate-card__pipeline">
                <BoStatus tone={stepTone(lead.currentStep)}>
                  {STEP_LABELS[lead.currentStep] || lead.currentStep}
                </BoStatus>
                <span className="bo-candidate-card__last">
                  Dernière activité: {lead.lastUpdate}
                </span>
              </div>

              {lead.notes && (
                <p className="bo-candidate-card__notes">{lead.notes}</p>
              )}

              <div className="bo-candidate-card__foot">
                <span>Consultant: {lead.assignedTo?.name}</span>
                <span>Créé: {lead.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

// Step 1 — confirmation modal.
// Rendered as a scrim+modal Fragment at BoOpportunities level (sibling to the panel, not child).
// z-index 400/401 guarantees it appears above the panel (z-index 301) with a single backdrop.
function ValidateConfirmModal({ candidate, opp, losersCount, onClose, onConfirm }) {
  const [busy, setBusy] = React.useState(false);
  const modalRef = React.useRef(null);
  React.useEffect(() => { modalRef.current?.focus(); }, []);

  const confirm = () => {
    if (busy) return;
    setBusy(true);
    // Short visual delay so the user sees the button activate, then hand off to parent.
    // The modal will be unmounted by the parent; no setBusy(false) needed.
    setTimeout(onConfirm, 400);
  };

  return (
    <>
      <div className="bo-scrim" style={{ zIndex: 400 }} onClick={busy ? undefined : onClose} />
      <div className="bo-modal bo-modal--confirm" style={{ zIndex: 401 }}
           ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true"
           aria-labelledby="vcm-title">
        <header className="bo-modal__head">
          <p className="bo-modal__eyebrow">Confirmer la validation</p>
          <h2 className="bo-modal__title" id="vcm-title">Valider {candidate.candidate.name} ?</h2>
        </header>
        <div className="bo-modal__body" style={{ padding: '0 24px 8px' }}>
          <div className="bo-confirm-effect">
            <div className="bo-confirm-effect__item bo-confirm-effect__item--win">
              <span className="bo-confirm-effect__icon">🏆</span>
              <div>
                <strong>{candidate.candidate.name}</strong>
                <p>Dossier onboarding créé · étape initiale: <em>Préparation contrat</em></p>
              </div>
            </div>
            {losersCount > 0 && (
              <div className="bo-confirm-effect__item">
                <span className="bo-confirm-effect__icon">📋</span>
                <div>
                  <strong>{losersCount} autre{losersCount > 1 ? 's' : ''} candidat{losersCount > 1 ? 's' : ''}</strong>
                  <p>Tâche CRM créée · type: <em>Rappel — opportunité clôturée</em> · échéance: {addBusinessDays(3)}</p>
                </div>
              </div>
            )}
            <div className="bo-confirm-effect__item">
              <span className="bo-confirm-effect__icon">🔒</span>
              <div>
                <strong>Opportunité {opp?.name}</strong>
                <p>Statut → <em>Closed — Won</em> · journal d'audit enregistré</p>
              </div>
            </div>
          </div>
          <p className="bo-confirm-warn">Cette action est irréversible.</p>
        </div>
        <footer className="bo-modal__actions">
          <button className="bo-btn bo-btn--ghost" onClick={onClose} disabled={busy}>Annuler</button>
          <button className="bo-btn bo-btn--primary" onClick={confirm} disabled={busy}>
            {busy ? 'Validation…' : 'Confirmer la validation'}
          </button>
        </footer>
      </div>
    </>
  );
}

// Step 2 — success / onboarding detail modal.
// Only ever mounts after ValidateConfirmModal is fully unmounted (parent guarantees sequencing).
// Same z-index pattern: single backdrop, no overlap possible.
function ValidationSuccessModal({ candidate, opp, onboardingId, onClose }) {
  const modalRef = React.useRef(null);
  React.useEffect(() => { modalRef.current?.focus(); }, []);

  return (
    <>
      <div className="bo-scrim" style={{ zIndex: 400 }} onClick={onClose} />
      <div className="bo-modal" style={{ zIndex: 401, maxWidth: 520 }}
           ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true"
           aria-labelledby="vsm-title">
        <header className="bo-modal__head">
          <div>
            <p className="bo-modal__eyebrow">Onboarding démarré</p>
            <h2 className="bo-modal__title" id="vsm-title">✓ {candidate.candidate.name} validé(e)</h2>
            <p className="bo-modal__sub">{opp?.name}</p>
          </div>
          <button className="bo-modal__close" onClick={onClose}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
          </button>
        </header>
        <div className="bo-modal__body" style={{ padding: '0 24px 8px' }}>
          <div className="bo-confirm-effect">
            <div className="bo-confirm-effect__item bo-confirm-effect__item--win">
              <span className="bo-confirm-effect__icon">🏆</span>
              <div>
                <strong>Dossier onboarding créé</strong>
                <p>Candidat: <strong>{candidate.candidate.name}</strong> · Étape: <em>Préparation contrat</em></p>
              </div>
            </div>
            <div className="bo-confirm-effect__item">
              <span className="bo-confirm-effect__icon">📅</span>
              <div>
                <strong>Prochaine action</strong>
                <p>Signature du contrat de franchise planifiée avant le <em>{addBusinessDays(5)}</em></p>
              </div>
            </div>
            <div className="bo-confirm-effect__item">
              <span className="bo-confirm-effect__icon">📋</span>
              <div>
                <strong>Tâches CRM créées</strong>
                <p>Rappel envoyé aux autres candidats · échéance: <em>{addBusinessDays(3)}</em></p>
              </div>
            </div>
            <div className="bo-confirm-effect__item">
              <span className="bo-confirm-effect__icon">🔒</span>
              <div>
                <strong>Opportunité clôturée</strong>
                <p>{opp?.name} → <em>Closed — Won</em> · Journal d'audit enregistré</p>
              </div>
            </div>
          </div>
        </div>
        <footer className="bo-modal__actions">
          {onboardingId && (
            <a className="bo-btn bo-btn--primary"
               href={`franchise-portal.html?id=${onboardingId}`}
               target="_blank" rel="noopener noreferrer">
              Ouvrir le portail franchisé →
            </a>
          )}
          <button className={`bo-btn ${onboardingId ? 'bo-btn--ghost' : 'bo-btn--primary'}`} onClick={onClose}>Fermer</button>
        </footer>
      </div>
    </>
  );
}

function BoOpportunities({ ctx }) {
  const { FG } = ctx;
  const currentUser = window.FG_CURRENT_USER || {};
  const [closedFilter, setClosedFilter] = React.useState(false);
  const [panelOppId,   setPanelOppId]   = React.useState(null);
  const [confirmLead,  setConfirmLead]  = React.useState(null); // step-1 modal
  const [successData,  setSuccessData]  = React.useState(null); // step-2 modal
  const [closedMap,    setClosedMap]    = React.useState({});

  const getCandidates = (oppId) =>
    FG.CANDIDATE_LEADS.filter(l => l.opportunity === oppId);

  const allOpps = FG.ONBOARDING_OPPORTUNITIES;
  const shownOpps = allOpps.filter(r => {
    const isClosed = r.status === 'closed-won' || !!closedMap[r.id];
    return closedFilter ? isClosed : !isClosed;
  });

  const panelOpp = panelOppId ? (allOpps.find(o => o.id === panelOppId) || null) : null;
  const panelCandidates = panelOppId ? getCandidates(panelOppId) : [];
  const panelReadOnly = panelOpp && (panelOpp.status === 'closed-won' || !!closedMap[panelOpp?.id]);

  // Two-step modal sequencing:
  //   1. setConfirmLead(null)  — unmounts first modal immediately
  //   2. await setTimeout(0)   — yields so React commits that unmount
  //   3. API call + local state — transaction
  //   4. setPanelOppId + setSuccessData — close panel, mount second modal (same batch)
  const handleConfirmValidate = async () => {
    const lead        = confirmLead;
    const oppId       = panelOppId; // capture before any state mutation
    const capturedOpp = allOpps.find(o => o.id === oppId) || { id: oppId, name: oppId };

    setConfirmLead(null); // step 1 — first modal unmounts
    await new Promise(r => setTimeout(r, 0)); // step 2 — let React commit

    let onboardingId = null;
    try { // step 3 — transaction
      const token = (() => { try { return JSON.parse(localStorage.getItem('fg_auth') || '{}').token || ''; } catch { return ''; } })();
      const res = await fetch(`/api/opportunities/${oppId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ candidateId: lead.id }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast('error', err.error || `Validation failed (${res.status})`);
        return;
      }
      const json = await res.json();
      onboardingId = json?.data?.onboardingRecord?.id || null;
    } catch (err) {
      toast('error', err.name === 'TimeoutError' ? 'Request timed out — please retry.' : 'Network error — validation not saved.');
      return;
    }

    setClosedMap(m => ({
      ...m,
      [oppId]: { validatedCandidateId: lead.id, validatedBy: currentUser.email, validatedAt: new Date().toISOString() }
    }));
    const opp = allOpps.find(o => o.id === oppId);
    if (opp) { opp.status = 'closed-won'; opp.validatedCandidateId = lead.id; }

    setPanelOppId(null);          // step 4 — close panel…
    setSuccessData({ lead, opp: capturedOpp, onboardingId }); // …and open second modal in same batch
  };

  return (
    <>
      <BoHead eyebrow="Network · Opportunities" title="Opportunity management"
        sub="Levées, ouvertures, nouveaux concepts, reprises et projets immobiliers."
        actions={(
          <>
            <button className="bo-btn bo-btn--ghost" onClick={() => openModal('new-opportunity')}>Closed ({Object.keys(closedMap).length + allOpps.filter(o => o.status === 'closed-won').length})</button>
            <div className="bo-filter-toggle">
              <button className={`bo-filter-toggle__btn${!closedFilter ? ' is-active' : ''}`} onClick={() => setClosedFilter(false)}>Active</button>
              <button className={`bo-filter-toggle__btn${closedFilter ? ' is-active' : ''}`} onClick={() => setClosedFilter(true)}>Closed</button>
            </div>
            <button className="bo-btn bo-btn--primary" onClick={() => openModal('new-opportunity')}><BoIcon.plus />New opportunity</button>
          </>
        )}
      />
      <BoFilters filters={[
        { label: 'Search', kind: 'search', placeholder: 'Project or city…' },
        { label: 'Brand', kind: 'select', options: ['All', ...FG.BRANDS.map(b => b.name)] },
        { label: 'Type', kind: 'select', options: ['All', 'Boutique', 'Pizzeria', 'Restaurant', 'Kiosque', 'Concept store'] },
        { label: 'Region', kind: 'select', options: ['All', ...FG.REGIONS.map(r => r.label)] }
      ]}/>
      <BoTable
        columns={[
          { k: 'name', l: 'Project', render: (r) => {
            const b = FG.brandById(r.brand);
            const isClosed = r.status === 'closed-won' || !!closedMap[r.id];
            return (
              <span className="bo-cell-brand" style={{ opacity: isClosed ? 0.6 : 1 }}>
                <span className="bo-cell-brand__mark" style={{ background: b.tokens.primary }}>{b.logoMark}</span>
                <span>
                  <p className="bo-cell-brand__name">{r.name}</p>
                  <p className="bo-cell-brand__kind">{b.name} · {r.city}</p>
                </span>
              </span>
            );
          }},
          { k: 'format',  l: 'Format' },
          { k: 'opening', l: 'Opening' },
          { k: 'budget',  l: 'Required', align: 'right', render: (r) => FG.fmtEur(r.requiredInvest) },
          { k: 'candidates', l: 'Candidates', align: 'center', render: (r) => {
            const count = getCandidates(r.id).length;
            const isClosed = r.status === 'closed-won' || !!closedMap[r.id];
            if (isClosed) return <span className="bo-closed-won-badge">✓ Closed</span>;
            return count > 0
              ? <button className="bo-count-badge bo-count-badge--btn" onClick={() => setPanelOppId(r.id)}
                  title="Click to review candidates">{count}</button>
              : <span style={{ color: 'rgba(14,27,40,.25)', fontSize: 12 }}>—</span>;
          }},
          { k: 'status', l: 'Status', render: (r) => {
            const isClosed = r.status === 'closed-won' || !!closedMap[r.id];
            return <BoStatus tone={isClosed ? 'success' : 'info'}>{isClosed ? 'Closed — Won' : (r.status || 'Open')}</BoStatus>;
          }},
          { k: 'go', l: '', align: 'right', render: (r) => (
            <button className="bo-btn bo-btn--ghost bo-btn--xs"
              onClick={() => setPanelOppId(r.id)}>
              {getCandidates(r.id).length > 0 ? 'Candidates →' : 'Open →'}
            </button>
          )}
        ]}
        rows={shownOpps}
      />

      {/* Slide-over panel — no modal state inside it */}
      {panelOpp && (
        <CandidatesPanel
          opp={{ ...panelOpp, ...(closedMap[panelOpp.id] || {}) }}
          candidates={panelCandidates}
          readOnly={panelReadOnly}
          onClose={() => setPanelOppId(null)}
          onRequestValidate={setConfirmLead}
        />
      )}

      {/* Step 1 — confirm modal: sibling to panel, z-index 400/401, single backdrop */}
      {confirmLead && (
        <ValidateConfirmModal
          candidate={confirmLead}
          opp={panelOpp}
          losersCount={panelCandidates.length - 1}
          onClose={() => setConfirmLead(null)}
          onConfirm={handleConfirmValidate}
        />
      )}

      {/* Step 2 — success modal: only mounts after confirmLead=null (first modal unmounted) */}
      {successData && (
        <ValidationSuccessModal
          candidate={successData.lead}
          opp={successData.opp}
          onboardingId={successData.onboardingId}
          onClose={() => setSuccessData(null)}
        />
      )}
    </>
  );
}


function BoCRM({ ctx }) {
  const { FG } = ctx;
  const [crmTasks, setCrmTasks] = bState([]);

  bEffect(() => {
    const token = (() => { try { return JSON.parse(localStorage.getItem('fg_auth') || '{}').token || ''; } catch { return ''; } })();
    fetch('/api/backoffice/tasks', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data) setCrmTasks(j.data); })
      .catch(() => {});
  }, []);
  const sources = [
    { id: 'candidate', label: 'Candidate', count: FG.CANDIDATE_LEADS.length },
    { id: 'investor',  label: 'Investor',  count: 0 },
    { id: 'brand',     label: 'Brand',     count: 0 },
    { id: 'developer', label: 'Developer', count: 3 },
    { id: 'new-brand', label: 'New Brand', count: FG.NEW_BRAND_LEADS?.length || 0 }
  ];
  return (
    <>
      <BoHead eyebrow="Network · CRM" title="CRM & Leads"
        sub="Pipeline drag & drop, scoring, prochaine action, assignation consultant."
        actions={(<><button className="bo-btn bo-btn--ghost" onClick={() => openModal('detail', { title: 'Lead sources', eyebrow: 'CRM', rows: [{ l: 'Candidate carousel', v: '63 %' }, { l: 'Brand applications', v: '14 %' }, { l: 'New brand concepts', v: '12 %' }, { l: 'Developer submissions', v: '7 %' }, { l: 'Other', v: '4 %' }] })}>Sources</button><button className="bo-btn bo-btn--primary" onClick={() => openModal('new-lead')}><BoIcon.plus />New lead</button></>)}
      />
      <div className="bo-source-tabs">
        {sources.map(s => (
          <button key={s.id} className={'bo-source-tab' + (s.id === 'candidate' ? ' is-active' : '')}>
            {s.label} <span className="bo-source-tab__count">{s.count}</span>
          </button>
        ))}
      </div>
      <BoFilters filters={[
        { label: 'Search', kind: 'search', placeholder: 'Lead name…' },
        { label: 'Status', kind: 'select', options: ['All', 'New', 'Contact phase', 'Validation', 'Committee'] },
        { label: 'Brand', kind: 'select', options: ['All', ...FG.BRANDS.map(b => b.name)] }
      ]}/>
      <div className="bo-kanban">
        {[
          { label: 'New leads', leads: FG.CANDIDATE_LEADS.filter(l => ['interested','consultant-review'].includes(l.currentStep)) },
          { label: 'Contact phase', leads: FG.CANDIDATE_LEADS.filter(l => ['first-contact-planned','first-contact-done'].includes(l.currentStep)) },
          { label: 'Validation', leads: FG.CANDIDATE_LEADS.filter(l => ['financing-precheck','location-validation','business-plan'].includes(l.currentStep)) },
          { label: 'Closing', leads: FG.CANDIDATE_LEADS.filter(l => ['committee','contract-prep','training-planning','opening-planning'].includes(l.currentStep)) }
        ].map(col => (
          <div key={col.label} className="bo-kcol">
            <header className="bo-kcol__head">
              <h3>{col.label}</h3>
              <span className="bo-kcol__count">{col.leads.length}</span>
            </header>
            {col.leads.map(l => {
              const opp = FG.ONBOARDING_OPPORTUNITIES.find(o => o.id === l.opportunity);
              const b = opp ? FG.brandById(opp.brand) : null;
              return (
                <article key={l.id} className="bo-lead">
                  <header className="bo-lead__head">
                    <strong>{l.candidate.name}</strong>
                    <span className={'bo-lead__prio bo-lead__prio--' + l.priority}>{l.priority}</span>
                  </header>
                  <p className="bo-lead__opp">{opp?.name}</p>
                  <div className="bo-lead__pills">
                    {b && <span className="bo-lead__pill" style={{ background: b.tokens.primary + '20', color: b.tokens.primary }}>● {b.name}</span>}
                    <span className="bo-lead__pill">{l.candidate.capital}</span>
                  </div>
                  <p className="bo-lead__meta">{l.assignedTo.name} · {l.lastUpdate}</p>
                </article>
              );
            })}
            {col.leads.length === 0 && <p className="bo-kcol__empty">No leads.</p>}
          </div>
        ))}
      </div>

      {/* CRM Tasks — created by validation flow for losing candidates */}
      {crmTasks.length > 0 && (
        <>
          <h3 style={{ margin: '32px 0 12px', fontSize: 14, fontWeight: 600, color: 'rgba(14,27,40,.6)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Follow-up tasks ({crmTasks.length})
          </h3>
          <BoTable
            columns={[
              { k: 'type',          l: 'Type',      render: (r) => <strong>{r.type}</strong> },
              { k: 'candidateName', l: 'Candidate' },
              { k: 'opportunityId', l: 'Opportunity' },
              { k: 'assignedTo',    l: 'Assigned to' },
              { k: 'dueAt',         l: 'Due',        render: (r) => r.dueAt?.slice(0, 10) },
              { k: 'status',        l: 'Status',     render: (r) => <BoStatus tone={r.status === 'done' ? 'success' : 'warning'}>{r.status}</BoStatus> }
            ]}
            rows={crmTasks}
          />
        </>
      )}
    </>
  );
}

// ====================================================================
// PLACEHOLDER MODULES — concise list view templates
// ====================================================================
function BoPlaceholder({ ctx, title, eyebrow, sub, columns, rows, actions, filters, foot }) {
  return (
    <>
      <BoHead eyebrow={eyebrow} title={title} sub={sub} actions={actions} />
      {filters && <BoFilters filters={filters} />}
      {rows && <BoTable columns={columns} rows={rows} />}
      {foot}
    </>
  );
}

function BoDocuments({ ctx }) {
  const { FG } = ctx;
  return <BoPlaceholder ctx={ctx} eyebrow="Operations · Documents" title="Document management"
    sub="DIP, contrats, business plans, finance, marketing, ops, formation."
    actions={(<button className="bo-btn bo-btn--primary" onClick={() => openModal('upload-doc')}><BoIcon.plus />Upload</button>)}
    filters={[
      { label: 'Search', kind: 'search', placeholder: 'Document title…' },
      { label: 'Type', kind: 'select', options: ['All', ...FG.DOC_TYPES.map(t => t.label)] },
      { label: 'Brand', kind: 'select', options: ['All', ...FG.BRANDS.map(b => b.name)] },
      { label: 'Status', kind: 'select', options: ['All', 'Validated', 'Pending', 'Expired'] }
    ]}
    columns={[
      { k: 'title',  l: 'Document', render: (r) => <strong>{r.title}</strong> },
      { k: 'type',   l: 'Type',   render: (r) => FG.DOC_TYPES.find(t => t.id === r.type)?.label || r.type },
      { k: 'brand',  l: 'Brand',  render: (r) => r.brand ? FG.brandById(r.brand)?.name : '— global' },
      { k: 'date',   l: 'Date' },
      { k: 'status', l: 'Status', render: (r) => <BoStatus tone={['validated','signed'].includes(r.status) ? 'success' : ['pending','review'].includes(r.status) ? 'warning' : 'danger'}>{r.status}</BoStatus> },
      { k: 'go', l: '', align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Open →</button> }
    ]}
    rows={FG.FG_DOCS.slice(0, 14)}
  />;
}

function BoCommunication({ ctx }) {
  const { FG } = ctx;
  return <BoPlaceholder ctx={ctx} eyebrow="Operations · Communication" title="Communication center"
    sub="Chat interne, messages candidats/investisseurs, emails automatiques."
    actions={(<><button className="bo-btn bo-btn--ghost" onClick={() => openModal('detail', { title: 'Email templates', eyebrow: 'Communication', rows: [{ l: 'Welcome candidate', v: 'Live' }, { l: 'Lead assigned', v: 'Live' }, { l: 'Document reminder', v: 'Live' }] })}>Templates</button><button className="bo-btn bo-btn--primary" onClick={() => openModal('add-note', { target: 'New thread' })}><BoIcon.plus />New thread</button></>)}
    columns={[
      { k: 'subject', l: 'Thread', render: (r) => <strong>{r.subject}</strong> },
      { k: 'category', l: 'Category', render: (r) => FG.SUPPORT_CATEGORIES.find(c => c.id === r.category)?.label },
      { k: 'assignedTo', l: 'Assigned' },
      { k: 'status',  l: 'Status', render: (r) => <BoStatus tone={r.status === 'resolved' ? 'success' : 'info'}>{r.status}</BoStatus> },
      { k: 'updatedAt', l: 'Updated' },
      { k: 'go', l: '', align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Open →</button> }
    ]}
    rows={FG.SUPPORT_TICKETS}
  />;
}

function BoFinance({ ctx }) {
  const { FG, A } = ctx;
  const tot = A.PROJECTS.reduce((a, p) => a + p.invested, 0) + Object.values(FG.BRAND_PORTFOLIOS).reduce((a, b) => a + b.summary.invested, 0);
  const repaid = A.PROJECTS.reduce((a, p) => a + p.repaid, 0) + Object.values(FG.BRAND_PORTFOLIOS).reduce((a, b) => a + b.summary.repaid, 0);
  return (
    <>
      <BoHead eyebrow="Operations · Finance" title="Finance & investment"
        sub="Royalties, franchise fees, remboursements, cashflow."
      />
      <div className="bo-kpis">
        {[
          { l: 'Capital placed',       v: FG.fmtEur(tot) },
          { l: 'Repaid to investors',  v: FG.fmtEur(repaid) },
          { l: 'Royalties Q1 2026',    v: FG.fmtEur(Math.round(tot * 0.012)) },
          { l: 'Pending payments',     v: '12', foot: 'Across all brands' },
          { l: 'Avg target IRR',       v: '8,4 %' },
          { l: 'Cashflow next 90d',    v: FG.fmtEur(Math.round(tot * 0.05)), foot: 'Projected' }
        ].map((k, i) => <article key={i} className="bo-kpi"><p className="bo-kpi__l">{k.l}</p><p className="bo-kpi__v">{k.v}</p>{k.foot && <p className="bo-kpi__foot">{k.foot}</p>}</article>)}
      </div>
    </>
  );
}


function BoSettings({ ctx }) {
  const { FG } = ctx;
  const [tab, setTab] = bState('workspace');
  const tabs = [
    { id: 'workspace',  label: 'Workspace' },
    { id: 'roles',      label: 'Roles' },
    { id: 'visibility', label: 'Visibility' },
    { id: 'automation', label: 'Automation' },
    { id: 'website',    label: 'Website' },
  ];
  return (
    <>
      <BoHead eyebrow="Platform · Settings" title="Settings"
        sub="Workspace, roles, visibility, automation and public site."
      />
      <div className="bo-filter-toggle" style={{ margin: '0 0 24px' }}>
        {tabs.map(t => (
          <button key={t.id}
            className={'bo-filter-toggle__btn' + (tab === t.id ? ' is-active' : '')}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'workspace' && (
        <div className="bo-grid">
          {[
            { title: 'Workspace',    items: ['Group name', 'Logo', 'Default language', 'Default currency', 'Time zone'] },
            { title: 'Localization', items: ['Languages: FR · NL · EN', 'Active countries: BE · FR · NL', 'Date format', 'Number format'] },
            { title: 'Billing & plan', items: ['Plan: SaaS Pro', 'Seats: 24 / 30', 'Renewal: 12 May 2027', 'Invoices archive'] },
            { title: 'Integrations', items: ['DocuSign', 'BNP Paribas Fortis (IBAN)', 'SendGrid', 'Slack', 'Google Workspace', 'Stripe'] },
            { title: 'Audit log',    items: ['Last 90 days', 'Export CSV', 'Retention 24 months'] },
            { title: 'Data',         items: ['Backups: daily', 'Export workspace', 'Delete workspace'] }
          ].map((c, i) => (
            <article key={i} className="bo-card">
              <header className="bo-card__head"><h2 className="bo-card__title">{c.title}</h2></header>
              <ul className="bo-settings-list">{c.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
            </article>
          ))}
        </div>
      )}

      {tab === 'roles' && (
        <BoTable
          columns={[
            { k: 'role',    l: 'Role',    render: (r) => <strong>{r.role}</strong> },
            { k: 'members', l: 'Members', align: 'right' },
            { k: 'scope',   l: 'Scope' },
            { k: 'perms',   l: 'Permissions' },
            { k: 'go', l: '', align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Edit →</button> }
          ]}
          rows={[
            { id: 1, role: 'Super Admin',   members: 2,   scope: 'All',           perms: 'Full access' },
            { id: 2, role: 'Group Admin',   members: 4,   scope: 'All',           perms: 'Read + Write all' },
            { id: 3, role: 'Brand Manager', members: 6,   scope: 'Per brand',     perms: 'Manage brand + team' },
            { id: 4, role: 'Consultant',    members: 8,   scope: 'Per region',    perms: 'Manage leads + candidates' },
            { id: 5, role: 'Franchisee',    members: 14,  scope: 'Per shop',      perms: 'View shop KPI + reports' },
            { id: 6, role: 'Investor',      members: 180, scope: 'Per portfolio', perms: 'View investments + docs' },
            { id: 7, role: 'Candidate',     members: 42,  scope: 'Self',          perms: 'Onboarding workspace' },
            { id: 8, role: 'Developer',     members: 6,   scope: 'Self',          perms: 'Submit locations' },
            { id: 9, role: 'Trainer',       members: 3,   scope: 'Training',      perms: 'Manage modules + certs' },
            { id: 10, role: 'Finance',      members: 2,   scope: 'Finance',       perms: 'Read all · write finance' },
            { id: 11, role: 'Legal',        members: 2,   scope: 'Legal',         perms: 'Read all · write contracts' }
          ]}
        />
      )}

      {tab === 'visibility' && (
        <BoTable
          columns={[
            { k: 'field',      l: 'Field',            render: (r) => <strong>{r.field}</strong> },
            { k: 'public',     l: 'Public site',      render: (r) => <BoToggle on={r.public} /> },
            { k: 'candidate',  l: 'Candidate portal', render: (r) => <BoToggle on={r.candidate} /> },
            { k: 'investor',   l: 'Investor portal',  render: (r) => <BoToggle on={r.investor} /> },
            { k: 'consultant', l: 'Consultant',        render: (r) => <BoToggle on={r.consultant} /> }
          ]}
          rows={[
            { id: 'royalties',    field: 'Royalties %',        public: false, candidate: false, investor: true,  consultant: true },
            { id: 'contacts',     field: 'Direct contacts',    public: false, candidate: false, investor: false, consultant: true },
            { id: 'kpi',          field: 'KPI per shop',       public: false, candidate: true,  investor: true,  consultant: true },
            { id: 'team',         field: 'Brand team',         public: true,  candidate: true,  investor: true,  consultant: true },
            { id: 'roi',          field: 'Expected ROI',       public: true,  candidate: true,  investor: true,  consultant: true },
            { id: 'docs',         field: 'Brand documents',    public: false, candidate: true,  investor: true,  consultant: true },
            { id: 'gallery',      field: 'Photo gallery',      public: true,  candidate: true,  investor: true,  consultant: true },
            { id: 'opportunities', field: 'Open opportunities', public: true, candidate: true,  investor: true,  consultant: true }
          ]}
        />
      )}

      {tab === 'automation' && (
        <BoTable
          columns={[
            { k: 'name',    l: 'Rule',          render: (r) => <strong>{r.name}</strong> },
            { k: 'trigger', l: 'Trigger' },
            { k: 'action',  l: 'Action' },
            { k: 'runs',    l: 'Runs / 30d', align: 'right' },
            { k: 'status',  l: 'Active', render: (r) => <BoToggle on={r.status} /> }
          ]}
          rows={[
            { id: 1, name: 'Auto-assign candidate to consultant by region', trigger: 'Lead created',           action: 'Assign consultant', runs: 42, status: true },
            { id: 2, name: 'Email "Document expired" reminder',             trigger: '14 days before expiry',  action: 'Send email',        runs: 18, status: true },
            { id: 3, name: 'Auto-score lead by capital × experience',       trigger: 'Profile updated',        action: 'Update score',      runs: 64, status: true },
            { id: 4, name: 'Block workflow if no opportunity validated',    trigger: 'Workflow start',         action: 'Block + notify',    runs: 7,  status: true },
            { id: 5, name: 'Weekly digest to brand managers',               trigger: 'Monday 09:00',           action: 'Send email',        runs: 4,  status: true },
            { id: 6, name: 'Alert if closing < 14 days unfunded',           trigger: 'Closing date approaches', action: 'Slack + email',   runs: 3,  status: false }
          ]}
        />
      )}

      {tab === 'website' && <>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button className="bo-btn bo-btn--ghost" onClick={() => window.open('landing.html', '_blank')}>Preview site →</button>
          <button className="bo-btn bo-btn--primary" onClick={() => toast('success', 'Site published.')}>Publish</button>
        </div>
        <BoTable
          columns={[
            { k: 'page',    l: 'Page',    render: (r) => <strong>{r.page}</strong> },
            { k: 'updated', l: 'Updated' },
            { k: 'author',  l: 'Author' },
            { k: 'status',  l: 'Status',  render: (r) => <BoStatus tone={r.status === 'live' ? 'success' : 'warning'}>{r.status}</BoStatus> },
            { k: 'go', l: '', align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Edit →</button> }
          ]}
          rows={[
            { id: 'p1', page: 'landing.html · Homepage',              updated: 'Today',     author: 'Sam Verheyden',  status: 'live' },
            { id: 'p2', page: 'ecosystem.html · Ecosystem',            updated: 'Yesterday', author: 'Loïc Verheyden', status: 'live' },
            { id: 'p3', page: 'login.html · Sign in',                  updated: '2 days',    author: 'Sam Verheyden',  status: 'live' },
            { id: 'p4', page: 'opportunity-detail.html · Modal copy',  updated: '3 days',    author: 'Sophie Renard',  status: 'draft' },
            { id: 'p5', page: 'who-are-you.html · Carousel tiles',     updated: '4 days',    author: 'Sam Verheyden',  status: 'live' }
          ]}
        />
      </>}
    </>
  );
}

window.BackOffice = BackOffice;

// ====================================================================
// TOAST SYSTEM — global success/error feedback
// ====================================================================
const BoToastCtx = React.createContext(null);
function BoToastProvider({ children }) {
  const [toasts, setToasts] = bState([]);
  const push = (kind, message) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, kind, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  };
  const api = { success: (m) => push('success', m), error: (m) => push('error', m), info: (m) => push('info', m) };
  return (
    <BoToastCtx.Provider value={api}>
      {children}
      <div className="bo-toasts">
        {toasts.map(t => (
          <div key={t.id} className={'bo-toast bo-toast--' + t.kind}>
            <span className="bo-toast__dot"></span>{t.message}
          </div>
        ))}
      </div>
    </BoToastCtx.Provider>
  );
}
const useToast = () => React.useContext(BoToastCtx) || { success: () => {}, error: () => {}, info: () => {} };

// ====================================================================
// MODAL SHELL
// ====================================================================
function BoModal({ open, title, eyebrow, sub, onClose, onSubmit, submitLabel, busy, children, danger }) {
  if (!open) return null;
  return (
    <>
      <div className="bo-scrim" onClick={onClose}></div>
      <div className="bo-modal" role="dialog">
        <header className="bo-modal__head">
          <div>
            {eyebrow && <p className="bo-modal__eyebrow">{eyebrow}</p>}
            <h2 className="bo-modal__title">{title}</h2>
            {sub && <p className="bo-modal__sub">{sub}</p>}
          </div>
          <button className="bo-modal__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>
        <form className="bo-modal__body" onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}>
          {children}
          {onSubmit && (
            <footer className="bo-modal__actions">
              <button type="button" className="bo-btn bo-btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
              <button type="submit" className={'bo-btn ' + (danger ? 'bo-btn--danger' : 'bo-btn--primary')} disabled={busy}>
                {busy ? <span className="bo-spinner"></span> : null}
                {busy ? 'Saving…' : (submitLabel || 'Save')}
              </button>
            </footer>
          )}
        </form>
      </div>
    </>
  );
}

function BoField({ label, hint, children }) {
  return (
    <div className="bo-field">
      <label>{label}</label>
      {children}
      {hint && <p className="bo-field__hint">{hint}</p>}
    </div>
  );
}

// ====================================================================
// MODALS REGISTRY — open via window.__BO.openModal('kind', payload)
// ====================================================================
function BoModalsRoot({ ctx }) {
  const [state, setState] = bState({ kind: null, payload: null });
  const t = useToast();
  bEffect(() => {
    window.__BO = window.__BO || {};
    window.__BO.openModal = (kind, payload) => setState({ kind, payload });
    window.__BO.toast = t;
  }, [t]);
  const close = () => setState({ kind: null, payload: null });

  if (!state.kind) return null;
  const props = { ctx, payload: state.payload, onClose: close, toast: t };
  switch (state.kind) {
    case 'new-lead':        return <ModalNewLead {...props} />;
    case 'new-brand':       return <ModalNewBrand {...props} />;
    case 'new-shop':        return <ModalNewShop {...props} />;
    case 'new-opportunity': return <ModalNewOpportunity {...props} />;
    case 'upload-doc':      return <ModalUploadDoc {...props} />;
    case 'sign-doc':        return <ModalSignDoc {...props} />;
    case 'book-meeting':    return <ModalBookMeeting {...props} />;
    case 'add-note':        return <ModalAddNote {...props} />;
    case 'assign':          return <ModalAssign {...props} />;
    case 'status-change':   return <ModalStatusChange {...props} />;
    case 'confirm':         return <ModalConfirm {...props} />;
    case 'delete':          return <ModalDelete {...props} />;
    case 'detail':          return <ModalDetail {...props} />;
    default: return null;
  }
}
const openModal = (kind, payload) => window.__BO?.openModal?.(kind, payload);
const toast = (kind, msg) => window.__BO?.toast?.[kind]?.(msg);

// ====================================================================
// CONCRETE MODALS
// ====================================================================
function useFakeSubmit(onDone) {
  const [busy, setBusy] = bState(false);
  return [busy, () => {
    setBusy(true);
    setTimeout(() => { setBusy(false); onDone?.(); }, 700);
  }];
}

function ModalNewLead({ ctx, payload, onClose }) {
  const { FG } = ctx;
  const [type,            setType]            = bState(payload?.type || 'candidate');
  const [name,            setName]            = bState('');
  const [contactName,     setContactName]     = bState('');
  const [email,           setEmail]           = bState('');
  const [phone,           setPhone]           = bState('');
  const [brand,           setBrand]           = bState('');
  const [notes,           setNotes]           = bState('');
  const [busy,            setBusy]            = bState(false);
  const [err,             setErr]             = bState('');
  // Investor-specific
  const [invType,         setInvType]         = bState('individual');
  const [invClass,        setInvClass]        = bState('');
  const [invAmount,       setInvAmount]       = bState('');
  const [invStatus,       setInvStatus]       = bState('prospect');
  const [invTier,         setInvTier]         = bState('Pilot');
  const [fsma,            setFsma]            = bState(false);
  // Developer-specific
  const [devRegions,      setDevRegions]      = bState('');
  const [devType,         setDevType]         = bState('');

  const getToken = () => { try { return JSON.parse(localStorage.getItem('fg_auth') || '{}').token || ''; } catch { return ''; } };

  const onSubmit = async () => {
    if (!name || !email) { setErr('Name and email are required.'); return; }
    setErr('');
    setBusy(true);

    try {
      let url, body;

      if (type === 'investor') {
        url = '/api/investors';
        body = { name, email, phone: phone || undefined, type: invType, tier: invTier,
          investmentClass: invClass || undefined, amountCommitted: invAmount ? Number(invAmount) : undefined,
          status: invStatus, brands: brand ? [brand] : [], fsmaAccepted: fsma, notes: notes || undefined };
      } else if (type === 'developer') {
        url = '/api/developers';
        body = { name, contactName: contactName || name, email, phone: phone || undefined,
          type: devType || undefined,
          regions: devRegions ? devRegions.split(',').map(s => s.trim()).filter(Boolean) : [],
          notes: notes || undefined };
      } else {
        url = '/api/candidates';
        body = { firstName: name.split(' ')[0], lastName: name.split(' ').slice(1).join(' ') || '—',
          email, phone: phone || undefined, brandPreference: brand ? [brand] : [], generalStatus: 'En pré-analyse' };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(json.error || `Error ${res.status}`); setBusy(false); return; }

      toast('success', `${name} added as ${type}.`);
      onClose();
    } catch (e) {
      setErr(e.name === 'TimeoutError' ? 'Request timed out.' : 'Network error.');
      setBusy(false);
    }
  };

  return (
    <BoModal open title="New lead" eyebrow="CRM" sub="Create a new profile and route it to the right consultant."
      onClose={onClose} onSubmit={onSubmit} submitLabel={`Create ${type}`} busy={busy}>

      <BoField label="Type">
        <div className="bo-segment">
          {['candidate', 'investor', 'developer'].map(t => (
            <button key={t} type="button" className={'bo-segment__opt' + (type === t ? ' is-active' : '')} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
      </BoField>

      {/* Developer: company name + contact person */}
      {type === 'developer' ? (
        <div className="bo-form-row">
          <BoField label="Company name *"><input value={name} onChange={e => setName(e.target.value)} placeholder="BH Immobilier" /></BoField>
          <BoField label="Contact person *"><input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Jean Dupont" /></BoField>
        </div>
      ) : (
        <BoField label="Full name *"><input value={name} onChange={e => setName(e.target.value)} /></BoField>
      )}

      <div className="bo-form-row">
        <BoField label="Email *"><input type="email" value={email} onChange={e => setEmail(e.target.value)} /></BoField>
        <BoField label="Phone"><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></BoField>
      </div>

      {/* Investor-specific fields */}
      {type === 'investor' && (<>
        <div className="bo-form-row">
          <BoField label="Type">
            <select value={invType} onChange={e => setInvType(e.target.value)}>
              <option value="individual">Individual</option>
              <option value="entity">Legal entity</option>
            </select>
          </BoField>
          <BoField label="Investment class">
            <select value={invClass} onChange={e => setInvClass(e.target.value)}>
              <option value="">— None —</option>
              <option value="A">Class A — Founding</option>
              <option value="B">Class B — Strategic</option>
              <option value="C">Class C — Standard</option>
              <option value="D">Class D — Observer</option>
            </select>
          </BoField>
        </div>
        <div className="bo-form-row">
          <BoField label="Amount committed (€)">
            <input type="number" value={invAmount} onChange={e => setInvAmount(e.target.value)} placeholder="25 000" />
          </BoField>
          <BoField label="Tier">
            <select value={invTier} onChange={e => setInvTier(e.target.value)}>
              <option value="Pilot">Pilot</option>
              <option value="Standard">Standard</option>
              <option value="Privilège">Privilège</option>
              <option value="Premium">Premium</option>
            </select>
          </BoField>
        </div>
        <div className="bo-form-row">
          <BoField label="Status">
            <select value={invStatus} onChange={e => setInvStatus(e.target.value)}>
              <option value="prospect">Prospect</option>
              <option value="signed">Signed</option>
              <option value="funded">Funded</option>
            </select>
          </BoField>
          <BoField label="Linked brand">
            <select value={brand} onChange={e => setBrand(e.target.value)}>
              <option value="">— Any —</option>
              {FG.BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </BoField>
        </div>
        <BoField label="FSMA disclaimer">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 400 }}>
            <input type="checkbox" checked={fsma} onChange={e => setFsma(e.target.checked)} />
            Investor has read and accepted the FSMA information document
          </label>
        </BoField>
      </>)}

      {/* Developer-specific fields */}
      {type === 'developer' && (<>
        <div className="bo-form-row">
          <BoField label="Developer type">
            <select value={devType} onChange={e => setDevType(e.target.value)}>
              <option value="">— Select —</option>
              <option value="Propriétaire individuel">Propriétaire individuel</option>
              <option value="Société immobilière">Société immobilière</option>
              <option value="Agent immobilier">Agent immobilier</option>
              <option value="Promoteur">Promoteur</option>
            </select>
          </BoField>
          <BoField label="Regions (comma-separated)" hint="e.g. bxl, wal">
            <input value={devRegions} onChange={e => setDevRegions(e.target.value)} placeholder="bxl, wal" />
          </BoField>
        </div>
      </>)}

      {/* Candidate-specific */}
      {type === 'candidate' && (
        <BoField label="Preferred brand">
          <select value={brand} onChange={e => setBrand(e.target.value)}>
            <option value="">— Any —</option>
            {FG.BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </BoField>
      )}

      <BoField label="Notes"><textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} /></BoField>
      {err && <p className="bo-form-error">{err}</p>}
    </BoModal>
  );
}

function ModalNewBrand({ ctx, onClose }) {
  const [name,        setName]        = bState('');
  const [tagline,     setTagline]     = bState('');
  const [kind,        setKind]        = bState('');
  const [city,        setCity]        = bState('');
  const [yearFounded, setYearFounded] = bState(String(new Date().getFullYear()));
  const [busy,        setBusy]        = bState(false);
  const [err,         setErr]         = bState('');

  const onSubmit = async () => {
    if (!name.trim()) { toast('error', 'Brand name is required.'); return; }
    setBusy(true); setErr('');
    try {
      const token = (() => { try { return JSON.parse(localStorage.getItem('fg_auth') || '{}').token || ''; } catch { return ''; } })();
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), tagline, kind, city, yearFounded: Number(yearFounded) || new Date().getFullYear() })
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.error || json.message || 'Failed to create brand.'); setBusy(false); return; }
      toast('success', `${name.trim()} added as new brand.`);
      onClose();
    } catch (_) { setErr('Network error — please retry.'); setBusy(false); }
  };

  return (
    <BoModal open title="New brand" eyebrow="Brand management" onClose={onClose} onSubmit={onSubmit} submitLabel="Create brand" busy={busy}>
      {err && <p style={{color:'var(--danger,#c0392b)',marginBottom:8,fontSize:13}}>{err}</p>}
      <BoField label="Brand name *"><input value={name} onChange={e => setName(e.target.value)} required /></BoField>
      <div className="bo-form-row">
        <BoField label="Tagline"><input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Boulangerie de quartier · Belgique" /></BoField>
        <BoField label="Sector"><input value={kind} onChange={e => setKind(e.target.value)} placeholder="Boulangerie · Pâtisserie" /></BoField>
      </div>
      <div className="bo-form-row">
        <BoField label="HQ city"><input value={city} onChange={e => setCity(e.target.value)} /></BoField>
        <BoField label="Year founded"><input type="number" value={yearFounded} onChange={e => setYearFounded(e.target.value)} /></BoField>
      </div>
    </BoModal>
  );
}

function ModalNewShop({ ctx, onClose }) {
  const { FG } = ctx;
  const [name, setName] = bState('');
  const [brand, setBrand] = bState(FG.BRANDS[0].id);
  const [city, setCity] = bState('');
  const [busy, submit] = useFakeSubmit(() => { toast('success', `${name} created.`); onClose(); });
  return (
    <BoModal open title="New shop" eyebrow="Shops" onClose={onClose} onSubmit={() => name ? submit() : toast('error', 'Shop name required.')} submitLabel="Create shop" busy={busy}>
      <BoField label="Shop name *"><input value={name} onChange={e => setName(e.target.value)} required /></BoField>
      <div className="bo-form-row">
        <BoField label="Brand">
          <select value={brand} onChange={e => setBrand(e.target.value)}>
            {FG.BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </BoField>
        <BoField label="City"><input value={city} onChange={e => setCity(e.target.value)} /></BoField>
      </div>
    </BoModal>
  );
}

function ModalNewOpportunity({ ctx, onClose }) {
  const { FG } = ctx;
  const DEVS = FG.DEVELOPERS || [];

  const [brand,     setBrand]     = bState(FG.BRANDS[0].id);
  const [oppName,   setOppName]   = bState('');
  const [city,      setCity]      = bState('');
  const [devId,     setDevId]     = bState('');
  const [locId,     setLocId]     = bState('');
  const [budget,    setBudget]    = bState('');
  const [ticketMin, setTicketMin] = bState('');
  const [ticketMax, setTicketMax] = bState('');
  const [roiTarget, setRoiTarget] = bState('');
  const [status,    setStatus]    = bState('En recherche candidat');
  const [busy,      setBusy]      = bState(false);
  const [err,       setErr]       = bState('');

  const dev       = DEVS.find(d => d.id === devId) || null;
  const locations = dev ? dev.locations.filter(l => l.status === 'available' || l.status === 'under-review') : [];
  const loc       = locations.find(l => l.id === locId) || null;

  const handleDevChange = (id) => { setDevId(id); setLocId(''); };
  const handleLocChange = (id) => {
    setLocId(id);
    const l = locations.find(x => x.id === id);
    if (l) {
      if (!city) setCity(l.city || '');
      if (!oppName) setOppName(`${FG.brandById(brand)?.name || ''} ${l.city || ''}`.trim());
    }
  };

  const onSubmit = async () => {
    if (!brand)          { toast('error', 'Please select a brand.');          return; }
    if (!oppName.trim()) { toast('error', 'Opportunity name is required.');   return; }
    if (!city.trim())    { toast('error', 'City is required.');                return; }
    setBusy(true); setErr('');
    try {
      const token = (() => { try { return JSON.parse(localStorage.getItem('fg_auth') || '{}').token || ''; } catch { return ''; } })();
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          brand, name: oppName.trim(), city: city.trim(), status,
          developerId: devId || null, locationId: locId || null,
          budget:    budget    ? Number(budget)    : null,
          ticketMin: ticketMin ? Number(ticketMin) : null,
          ticketMax: ticketMax ? Number(ticketMax) : null,
          roiTarget: roiTarget ? Number(roiTarget) : null,
        })
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.error || json.message || 'Failed to create opportunity.'); setBusy(false); return; }
      toast('success', `Opportunity created · ${json.data?.name}`);
      onClose();
    } catch (_) { setErr('Network error — please retry.'); setBusy(false); }
  };

  return (
    <BoModal open title="New opportunity" eyebrow="Opportunities" onClose={onClose}
      onSubmit={onSubmit} submitLabel="Create opportunity" busy={busy}>

      {err && <p style={{color:'var(--danger,#c0392b)',marginBottom:8,fontSize:13}}>{err}</p>}

      <BoField label="Brand *">
        <select value={brand} onChange={e => { setBrand(e.target.value); setOppName(''); }}>
          {FG.BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </BoField>

      <div className="bo-form-row">
        <BoField label="Opportunity name *">
          <input value={oppName} onChange={e => setOppName(e.target.value)} placeholder="L'Atelier By Saint-Gilles" />
        </BoField>
        <BoField label="City *">
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="Bruxelles" />
        </BoField>
      </div>

      <div className="bo-form-row">
        <BoField label="Developer">
          <select value={devId} onChange={e => handleDevChange(e.target.value)}>
            <option value="">— No developer —</option>
            {DEVS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </BoField>
        <BoField label="Status">
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="En recherche candidat">En recherche candidat</option>
            <option value="Pré-lancement">Pré-lancement</option>
            <option value="Closing imminent">Closing imminent</option>
            <option value="Co-investissement ouvert">Co-investissement ouvert</option>
          </select>
        </BoField>
      </div>

      {devId && (
        <BoField label="Location">
          <select value={locId} onChange={e => handleLocChange(e.target.value)}>
            <option value="">— Select location —</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.address} · {l.surface}</option>
            ))}
            {!locations.length && <option disabled>No available locations for this developer</option>}
          </select>
        </BoField>
      )}

      {loc && (
        <div className="bo-location-card">
          <div className="bo-location-card__row">
            <span className="bo-location-card__label">Address</span>
            <span>{loc.address}</span>
          </div>
          <div className="bo-location-card__row">
            <span className="bo-location-card__label">Surface</span>
            <span>{loc.surface}</span>
          </div>
          <div className="bo-location-card__row">
            <span className="bo-location-card__label">Available from</span>
            <span>{loc.availability}</span>
          </div>
          <div className="bo-location-card__row">
            <span className="bo-location-card__label">Monthly rent</span>
            <span>€{loc.rent?.toLocaleString()}/month</span>
          </div>
          {dev && (
            <div className="bo-location-card__row">
              <span className="bo-location-card__label">Contact</span>
              <span>{dev.contactName} · {dev.email}</span>
            </div>
          )}
        </div>
      )}

      <BoField label="Approximate total budget (€)">
        <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="180 000" />
      </BoField>
      <div className="bo-form-row">
        <BoField label="Min ticket (€)">
          <input type="number" value={ticketMin} onChange={e => setTicketMin(e.target.value)} placeholder="25 000" />
        </BoField>
        <BoField label="Max ticket (€)">
          <input type="number" value={ticketMax} onChange={e => setTicketMax(e.target.value)} placeholder="200 000" />
        </BoField>
      </div>
      <BoField label="ROI target (%)">
        <input type="number" value={roiTarget} onChange={e => setRoiTarget(e.target.value)} placeholder="8.0" step="0.1" />
      </BoField>
    </BoModal>
  );
}

function ModalUploadDoc({ ctx, payload, onClose }) {
  const { FG } = ctx;
  const [title, setTitle] = bState('');
  const [type, setType] = bState(FG.DOC_TYPES[0].id);
  const [files, setFiles] = bState([]);
  const fileRef = React.useRef(null);
  const [busy, submit] = useFakeSubmit(() => { toast('success', 'Document uploaded.'); onClose(); });
  return (
    <BoModal open title="Upload document" eyebrow="Documents" onClose={onClose}
      onSubmit={() => { if (!title || files.length === 0) { toast('error', 'Title and a file are required.'); return; } submit(); }}
      submitLabel="Upload" busy={busy}>
      <BoField label="Title *"><input value={title} onChange={e => setTitle(e.target.value)} required /></BoField>
      <div className="bo-form-row">
        <BoField label="Type">
          <select value={type} onChange={e => setType(e.target.value)}>
            {FG.DOC_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </BoField>
        <BoField label="Linked brand">
          <select defaultValue="">
            <option value="">— Global —</option>
            {FG.BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </BoField>
      </div>
      <BoField label="File *">
        <div className="bo-dropzone" onClick={() => fileRef.current?.click()}>
          {files.length === 0 ? (
            <span>Click to choose or drop a file here</span>
          ) : (
            files.map((f, i) => <span key={i} className="bo-pill">📎 {f.name}</span>)
          )}
          <input ref={fileRef} type="file" multiple style={{ display: 'none' }}
            onChange={e => setFiles(Array.from(e.target.files || []))} />
        </div>
      </BoField>
    </BoModal>
  );
}

function ModalSignDoc({ payload, onClose }) {
  const [busy, submit] = useFakeSubmit(() => { toast('success', 'Document sent to DocuSign.'); onClose(); });
  return (
    <BoModal open title="Sign document" eyebrow="Signatures" onClose={onClose} onSubmit={submit} submitLabel="Send for signature" busy={busy}>
      <BoField label="Document">
        <input defaultValue={payload?.title || 'Selected document'} readOnly />
      </BoField>
      <BoField label="Signers (comma-separated emails)">
        <input defaultValue="claire.vermeulen@example.com, sophie.renard@franchisegeneration.com" />
      </BoField>
      <BoField label="Provider">
        <select defaultValue="docusign"><option value="docusign">DocuSign</option><option value="yousign">Yousign</option></select>
      </BoField>
    </BoModal>
  );
}

function ModalBookMeeting({ payload, onClose }) {
  const [busy, submit] = useFakeSubmit(() => { toast('success', 'Meeting booked.'); onClose(); });
  return (
    <BoModal open title="Book meeting" eyebrow="Calendar" onClose={onClose} onSubmit={submit} submitLabel="Book" busy={busy}>
      <div className="bo-form-row">
        <BoField label="With"><input defaultValue={payload?.with || ''} placeholder="Name or email" /></BoField>
        <BoField label="Channel">
          <select defaultValue="video"><option value="video">Visioconférence</option><option value="onsite">On-site</option><option value="call">Phone call</option></select>
        </BoField>
      </div>
      <div className="bo-form-row">
        <BoField label="Date"><input type="date" defaultValue="2026-05-24" /></BoField>
        <BoField label="Time"><input type="time" defaultValue="14:00" /></BoField>
      </div>
      <BoField label="Subject"><input defaultValue="First contact" /></BoField>
    </BoModal>
  );
}

function ModalAddNote({ payload, onClose }) {
  const [note, setNote] = bState('');
  const [busy, submit] = useFakeSubmit(() => { toast('success', 'Note added.'); onClose(); });
  return (
    <BoModal open title="Add note" eyebrow={payload?.target || 'Note'} onClose={onClose}
      onSubmit={() => note ? submit() : toast('error', 'Note cannot be empty.')} submitLabel="Save note" busy={busy}>
      <BoField label="Note (internal)" hint="Visible only to consultants and admins.">
        <textarea rows={5} value={note} onChange={e => setNote(e.target.value)} placeholder="Add your note…"></textarea>
      </BoField>
    </BoModal>
  );
}

function ModalAssign({ ctx, payload, onClose }) {
  const consultants = ['Sophie Renard', 'Karim Boulahia', 'Lara Wauters', 'Niels Vandenberg'];
  const [c, setC] = bState(consultants[0]);
  const [busy, submit] = useFakeSubmit(() => { toast('success', `Assigned to ${c}.`); onClose(); });
  return (
    <BoModal open title="Assign consultant" eyebrow={payload?.target || 'Lead'} onClose={onClose} onSubmit={submit} submitLabel="Assign" busy={busy}>
      <BoField label="Consultant">
        <select value={c} onChange={e => setC(e.target.value)}>{consultants.map(x => <option key={x}>{x}</option>)}</select>
      </BoField>
      <BoField label="Priority">
        <div className="bo-segment">
          {['Low','Normal','High','Urgent'].map(p => <button key={p} type="button" className="bo-segment__opt">{p}</button>)}
        </div>
      </BoField>
      <BoField label="Hand-off note"><textarea rows={3} placeholder="Context for the consultant…"></textarea></BoField>
    </BoModal>
  );
}

function ModalStatusChange({ payload, onClose }) {
  const statuses = ['To analyse', 'In discussion', 'Recommended', 'Validated', 'Rejected', 'On hold'];
  const [s, setS] = bState(payload?.current || statuses[0]);
  const [busy, submit] = useFakeSubmit(() => { toast('success', `Status updated to "${s}".`); onClose(); });
  return (
    <BoModal open title="Change status" eyebrow={payload?.target || ''} onClose={onClose} onSubmit={submit} submitLabel="Update" busy={busy}>
      <BoField label="New status">
        <select value={s} onChange={e => setS(e.target.value)}>{statuses.map(x => <option key={x}>{x}</option>)}</select>
      </BoField>
      <BoField label="Reason / note"><textarea rows={3}></textarea></BoField>
    </BoModal>
  );
}

function ModalConfirm({ payload, onClose }) {
  const [busy, submit] = useFakeSubmit(() => { toast('success', payload?.successMessage || 'Done.'); payload?.onConfirm?.(); onClose(); });
  return (
    <BoModal open title={payload?.title || 'Confirm'} eyebrow={payload?.eyebrow}
      sub={payload?.sub} onClose={onClose} onSubmit={submit} submitLabel={payload?.confirmLabel || 'Confirm'} busy={busy}>
      <p style={{ fontSize: 13, color: 'rgba(14,27,40,0.75)', margin: 0 }}>{payload?.body}</p>
    </BoModal>
  );
}

function ModalDelete({ payload, onClose }) {
  const [busy, submit] = useFakeSubmit(() => { toast('success', `${payload?.target || 'Item'} deleted.`); onClose(); });
  return (
    <BoModal open danger title={'Delete ' + (payload?.target || 'item')} eyebrow="Destructive action"
      sub="This action cannot be undone." onClose={onClose} onSubmit={submit} submitLabel="Delete permanently" busy={busy}>
      <p style={{ fontSize: 13, color: 'rgba(14,27,40,0.75)', margin: 0 }}>
        You are about to delete <strong>{payload?.name || 'this record'}</strong>. All linked data (documents, history, notes) will be archived for 30 days, then permanently removed.
      </p>
    </BoModal>
  );
}

function ModalDetail({ payload, onClose }) {
  return (
    <BoModal open title={payload?.title || 'Detail'} eyebrow={payload?.eyebrow} onClose={onClose}>
      {payload?.rows && (
        <dl className="bo-detail-dl">
          {payload.rows.map((r, i) => (
            <React.Fragment key={i}><dt>{r.l}</dt><dd>{r.v}</dd></React.Fragment>
          ))}
        </dl>
      )}
      <footer className="bo-modal__actions">
        <button type="button" className="bo-btn bo-btn--ghost" onClick={onClose}>Close</button>
        {payload?.href && <a className="bo-btn bo-btn--primary" href={payload.href}>Open full page →</a>}
      </footer>
    </BoModal>
  );
}
