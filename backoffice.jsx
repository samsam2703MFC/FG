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
  { label: 'People', items: [
    { id: 'candidates',  label: 'Candidates',  icon: BoIcon.candidate, badgeKey: 'leads' },
    { id: 'investors',   label: 'Investors',   icon: BoIcon.investor },
    { id: 'developers',  label: 'Developers',  icon: BoIcon.developer },
    { id: 'consultants', label: 'Consultants', icon: BoIcon.consultant },
    { id: 'franchisees', label: 'Franchisees', icon: BoIcon.shop }
  ]},
  { label: 'Network', items: [
    { id: 'brands',         label: 'Brands',         icon: BoIcon.brand, badgeKey: 'brands' },
    { id: 'shops',          label: 'Shops',          icon: BoIcon.shop, badgeKey: 'shops' },
    { id: 'opportunities',  label: 'Opportunities',  icon: BoIcon.opportunity, badgeKey: 'opps' },
    { id: 'crm',            label: 'CRM & Leads',    icon: BoIcon.crm, badgeKey: 'newleads' }
  ]},
  { label: 'Operations', items: [
    { id: 'documents',    label: 'Documents',    icon: BoIcon.doc },
    { id: 'communication',label: 'Communication',icon: BoIcon.comm, badgeKey: 'unread' },
    { id: 'training',     label: 'Training',     icon: BoIcon.training },
    { id: 'finance',      label: 'Finance',      icon: BoIcon.finance }
  ]},
  { label: 'Platform', items: [
    { id: 'website',     label: 'Public Website', icon: BoIcon.web },
    { id: 'roles',       label: 'Roles & Permissions', icon: BoIcon.roles },
    { id: 'visibility',  label: 'Visibility',     icon: BoIcon.visibility },
    { id: 'automation',  label: 'Automation',     icon: BoIcon.automate },
    { id: 'settings',    label: 'Settings',       icon: BoIcon.settings }
  ]}
];

const COUNTRIES = [
  { id: 'all', label: 'All countries' },
  { id: 'be',  label: '🇧🇪 Belgium' },
  { id: 'fr',  label: '🇫🇷 France' },
  { id: 'nl',  label: '🇳🇱 Netherlands' }
];

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
          {view === 'brands'        && <BoBrands ctx={ctx} />}
          {view === 'candidates'    && <BoCandidates ctx={ctx} />}
          {view === 'investors'     && <BoInvestors ctx={ctx} />}
          {view === 'developers'    && <BoDevelopers ctx={ctx} />}
          {view === 'consultants'   && <BoConsultants ctx={ctx} />}
          {view === 'franchisees'   && <BoFranchisees ctx={ctx} />}
          {view === 'shops'         && <BoShops ctx={ctx} />}
          {view === 'opportunities' && <BoOpportunities ctx={ctx} />}
          {view === 'crm'           && <BoCRM ctx={ctx} />}
          {view === 'documents'     && <BoDocuments ctx={ctx} />}
          {view === 'communication' && <BoCommunication ctx={ctx} />}
          {view === 'training'      && <BoTraining ctx={ctx} />}
          {view === 'finance'       && <BoFinance ctx={ctx} />}
          {view === 'website'       && <BoWebsite ctx={ctx} />}
          {view === 'roles'         && <BoRoles ctx={ctx} />}
          {view === 'visibility'    && <BoVisibility ctx={ctx} />}
          {view === 'preview'       && <BoPreview ctx={ctx} />}
          {view === 'automation'    && <BoAutomation ctx={ctx} />}
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
function BoCandidates({ ctx }) {
  const { FG } = ctx;
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
          { k: 'opps',    l: 'Opportunities', render: (r) => `${r.opportunities.length} leads` },
          { k: 'status',  l: 'Status',  render: (r) => <BoStatus tone={r.opportunities.some(o => o.validationStatus === 'validated') ? 'success' : 'warning'}>{r.generalStatus}</BoStatus> },
          { k: 'go', l: '', align: 'right', render: (r) => <a className="bo-btn bo-btn--ghost bo-btn--xs" href={'candidate-profile.html?candidate=' + r.id}>Open →</a> }
        ]}
        rows={FG.CANDIDATES}
      />
    </>
  );
}

// ====================================================================
// INVESTORS
// ====================================================================
function BoInvestors({ ctx }) {
  const { FG, A } = ctx;
  const totalInvested = A.PROJECTS.reduce((a, p) => a + p.invested, 0) +
    Object.values(FG.BRAND_PORTFOLIOS).reduce((a, b) => a + b.summary.invested, 0);
  return (
    <>
      <BoHead eyebrow="People · Investors" title="Investor management"
        sub="Profils, budgets, ROI recherchés et investissements actifs."
        actions={(<>
          <button className="bo-btn bo-btn--ghost" onClick={() => openModal('detail', { title: 'KYC overview', eyebrow: 'Compliance', rows: [{ l: 'Validated', v: '6' }, { l: 'Pending', v: '1' }, { l: 'Expired', v: '1' }, { l: 'Missing', v: '1' }] })}>KYC overview</button>
          <button className="bo-btn bo-btn--primary" onClick={() => openModal('new-lead', { type: 'investor' })}><BoIcon.plus />New investor</button>
        </>)}
      />
      <BoFilters filters={[
        { label: 'Search', kind: 'search', placeholder: 'Investor name…' },
        { label: 'Tier', kind: 'select', options: ['All', 'Privilège', 'Standard', 'Pilot'] },
        { label: 'Region', kind: 'select', options: ['All', 'Belgium', 'France', 'NL'] }
      ]}/>
      <BoTable
        columns={[
          { k: 'name', l: 'Investor', render: () => (
            <span className="bo-cell-brand">
              <span className="bo-cell-brand__mark" style={{ background: 'var(--brand-primary)' }}>CV</span>
              <span>
                <p className="bo-cell-brand__name">Claire Vermeulen</p>
                <p className="bo-cell-brand__kind">{FG.INVESTOR.email}</p>
              </span>
            </span>
          )},
          { k: 'tier',     l: 'Tier',           render: () => <BoStatus tone="success">{FG.INVESTOR.tier}</BoStatus> },
          { k: 'invested', l: 'Capital placé',   render: () => FG.fmtEur(totalInvested) },
          { k: 'projects', l: 'Projets',         render: () => A.PROJECTS.length + Object.values(FG.BRAND_PORTFOLIOS).reduce((a, b) => a + b.shops.length, 0) },
          { k: 'tri',      l: 'TRI moyen',       render: () => '8,4 %' },
          { k: 'since',    l: 'Since',           render: () => FG.INVESTOR.since },
          { k: 'go',       l: '', align: 'right', render: (r) => <a className="bo-btn bo-btn--ghost bo-btn--xs" href={`investor-profile.html?investor=${r.id}`}>Open →</a> }
        ]}
        rows={[FG.INVESTOR]}
      />
    </>
  );
}

// ====================================================================
// DEVELOPERS (real estate)
// ====================================================================
function BoDevelopers({ ctx }) {
  const rows = [
    { id: 'd1', name: 'Béatrice Hennion', company: 'BH Immobilier', city: 'Bruxelles · Châtelain', surface: '120 m²', rent: '4 200 €/m', status: 'in-review' },
    { id: 'd2', name: 'Marc Vermast',     company: 'V-Real Estate', city: 'Antwerpen · Zuid',      surface: '95 m²',  rent: '3 600 €/m', status: 'matched' },
    { id: 'd3', name: 'Pierre Lemaire',   company: 'Independent',   city: 'Lille (FR)',            surface: '160 m²', rent: '5 800 €/m', status: 'new' }
  ];
  return (
    <>
      <BoHead eyebrow="People · Developers" title="Real estate developers"
        sub="Cellules commerciales et projets immobiliers proposés au réseau."
        actions={(<button className="bo-btn bo-btn--primary" onClick={() => openModal('new-lead', { type: 'developer' })}><BoIcon.plus />New location</button>)}
      />
      <BoFilters filters={[
        { label: 'Search', kind: 'search', placeholder: 'Developer or city…' },
        { label: 'Surface', kind: 'select', options: ['Any', '< 80 m²', '80–120 m²', '120 m²+'] },
        { label: 'Status', kind: 'select', options: ['All', 'New', 'In review', 'Matched', 'Closed'] }
      ]}/>
      <BoTable
        columns={[
          { k: 'developer', l: 'Developer', render: (r) => <span><strong>{r.name}</strong><br /><span style={{ fontSize: 11, color: 'rgba(14,27,40,0.55)' }}>{r.company}</span></span> },
          { k: 'city',     l: 'Location' },
          { k: 'surface',  l: 'Surface' },
          { k: 'rent',     l: 'Estimated rent' },
          { k: 'status',   l: 'Status', render: (r) => <BoStatus tone={r.status === 'matched' ? 'success' : r.status === 'in-review' ? 'warning' : 'info'}>{r.status}</BoStatus> },
          { k: 'go', l: '', align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Open →</button> }
        ]}
        rows={rows}
      />
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
        actions={(<button className="bo-btn bo-btn--primary" onClick={() => openModal('new-lead', { type: 'candidate' })}><BoIcon.plus />Add consultant</button>)}
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
// OPPORTUNITIES
// ====================================================================
function BoOpportunities({ ctx }) {
  const { FG } = ctx;
  return (
    <>
      <BoHead eyebrow="Network · Opportunities" title="Opportunity management"
        sub="Levées, ouvertures, nouveaux concepts, reprises et projets immobiliers."
        actions={(<button className="bo-btn bo-btn--primary" onClick={() => openModal('new-opportunity')}><BoIcon.plus />New opportunity</button>)}
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
            return (
              <span className="bo-cell-brand">
                <span className="bo-cell-brand__mark" style={{ background: b.tokens.primary }}>{b.logoMark}</span>
                <span><p className="bo-cell-brand__name">{r.name}</p><p className="bo-cell-brand__kind">{b.name}</p></span>
              </span>
            );
          }},
          { k: 'city',   l: 'City' },
          { k: 'format', l: 'Format' },
          { k: 'opening',l: 'Opening' },
          { k: 'budget', l: 'Required', align: 'right', render: (r) => FG.fmtEur(r.requiredInvest) },
          { k: 'candidates', l: 'Candidates', align: 'center', render: (r) => {
            const count = FG.CANDIDATE_LEADS.filter(c =>
              (c.opportunities || []).some(o => o.opportunityId === r.id)
            ).length;
            return count > 0
              ? <span className="bo-count-badge">{count}</span>
              : <span style={{ color: 'rgba(14,27,40,.25)', fontSize: 12 }}>—</span>;
          }},
          { k: 'status', l: 'Status',  render: (r) => <BoStatus tone="success">{r.status}</BoStatus> },
          { k: 'go', l: '', align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Open →</button> }
        ]}
        rows={FG.ONBOARDING_OPPORTUNITIES}
      />
    </>
  );
}

// ====================================================================
// CRM & LEADS — kanban + sources
// ====================================================================
function BoCRM({ ctx }) {
  const { FG } = ctx;
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

function BoTraining({ ctx }) {
  const rows = [
    { id: 't1', module: 'Production · pâte & cuisson',  brand: "L'Atelier By", duration: '4 days', steps: 8 },
    { id: 't2', module: 'Service & relation client',     brand: 'All',           duration: '2 days', steps: 5 },
    { id: 't3', module: 'P&L & pilotage magasin',        brand: 'All',           duration: '3 days', steps: 7 },
    { id: 't4', module: 'Concept Couq · couques au beurre', brand: 'Couq',       duration: '5 days', steps: 9 },
    { id: 't5', module: 'Pizza romaine al taglio',       brand: 'Mania Pizza',   duration: '6 days', steps: 11 }
  ];
  return <BoPlaceholder ctx={ctx} eyebrow="Operations · Training" title="Training management"
    sub="Parcours, modules, certifications et planning."
    actions={(<button className="bo-btn bo-btn--primary" onClick={() => openModal('new-opportunity')}><BoIcon.plus />New module</button>)}
    columns={[
      { k: 'module',   l: 'Module', render: (r) => <strong>{r.module}</strong> },
      { k: 'brand',    l: 'Brand' },
      { k: 'duration', l: 'Duration' },
      { k: 'steps',    l: 'Steps', align: 'right' },
      { k: 'go', l: '', align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Open →</button> }
    ]}
    rows={rows}
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

function BoWebsite({ ctx }) {
  return <BoPlaceholder ctx={ctx} eyebrow="Platform · Public website" title="Public website management"
    sub="Pilotez les landing pages, carrousels, contenus dynamiques, SEO et médias."
    actions={(<><button className="bo-btn bo-btn--ghost" onClick={() => window.open('landing.html', '_blank')}>Preview</button><button className="bo-btn bo-btn--primary" onClick={() => toast('success', 'Site published successfully.')}>Publish</button></>)}
    columns={[
      { k: 'page', l: 'Page', render: (r) => <strong>{r.page}</strong> },
      { k: 'updated', l: 'Last updated' },
      { k: 'author',  l: 'Author' },
      { k: 'status',  l: 'Status', render: (r) => <BoStatus tone={r.status === 'live' ? 'success' : 'warning'}>{r.status}</BoStatus> },
      { k: 'go', l: '', align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Edit →</button> }
    ]}
    rows={[
      { id: 'p1', page: 'landing.html · Homepage',           updated: 'Today',     author: 'Sam Verheyden', status: 'live' },
      { id: 'p2', page: 'ecosystem.html · Ecosystem',         updated: 'Yesterday', author: 'Loïc Verheyden', status: 'live' },
      { id: 'p3', page: 'login.html · Sign in',               updated: '2 days',    author: 'Sam Verheyden', status: 'live' },
      { id: 'p4', page: 'opportunity-detail.html · Modal copy', updated: '3 days',  author: 'Sophie Renard',  status: 'draft' },
      { id: 'p5', page: 'who-are-you.html · Carousel tiles',  updated: '4 days',    author: 'Sam Verheyden', status: 'live' }
    ]}
  />;
}

function BoRoles({ ctx }) {
  return <BoPlaceholder ctx={ctx} eyebrow="Platform · Roles" title="Roles & permissions"
    sub="Permissions granulaires par rôle."
    actions={(<button className="bo-btn bo-btn--primary" onClick={() => openModal('new-lead', { type: 'brand' })}><BoIcon.plus />New role</button>)}
    columns={[
      { k: 'role', l: 'Role', render: (r) => <strong>{r.role}</strong> },
      { k: 'members', l: 'Members', align: 'right' },
      { k: 'scope',   l: 'Scope' },
      { k: 'perms',   l: 'Permissions' },
      { k: 'go', l: '', align: 'right', render: () => <button className="bo-btn bo-btn--ghost bo-btn--xs">Edit →</button> }
    ]}
    rows={[
      { id: 1, role: 'Super Admin',    members: 2, scope: 'All',          perms: 'Full access' },
      { id: 2, role: 'Group Admin',    members: 4, scope: 'All',          perms: 'Read + Write all' },
      { id: 3, role: 'Brand Manager',  members: 6, scope: 'Per brand',    perms: 'Manage brand + team' },
      { id: 4, role: 'Consultant',     members: 8, scope: 'Per region',   perms: 'Manage leads + candidates' },
      { id: 5, role: 'Franchisee',     members: 14, scope: 'Per shop',    perms: 'View shop KPI + reports' },
      { id: 6, role: 'Investor',       members: 180, scope: 'Per portfolio', perms: 'View investments + docs' },
      { id: 7, role: 'Candidate',      members: 42, scope: 'Self',        perms: 'Onboarding workspace' },
      { id: 8, role: 'Developer',      members: 6, scope: 'Self',         perms: 'Submit locations' },
      { id: 9, role: 'Trainer',        members: 3, scope: 'Training',     perms: 'Manage modules + certs' },
      { id: 10, role: 'Finance',       members: 2, scope: 'Finance',      perms: 'Read all · write finance' },
      { id: 11, role: 'Legal',         members: 2, scope: 'Legal',        perms: 'Read all · write contracts' }
    ]}
  />;
}

function BoVisibility({ ctx }) {
  return <BoPlaceholder ctx={ctx} eyebrow="Platform · Visibility" title="Visibility toggles"
    sub="Chaque donnée : ON/OFF · Public · Internal · Hidden."
    actions={(<button className="bo-btn bo-btn--ghost" onClick={() => openModal('confirm', { title: 'Reset visibility?', body: 'All visibility toggles will revert to platform defaults.', successMessage: 'Visibility reset to defaults.' })}>Reset to default</button>)}
    columns={[
      { k: 'field', l: 'Field', render: (r) => <strong>{r.field}</strong> },
      { k: 'public',   l: 'Public site',     render: (r) => <BoToggle on={r.public} /> },
      { k: 'candidate',l: 'Candidate portal',render: (r) => <BoToggle on={r.candidate} /> },
      { k: 'investor', l: 'Investor portal', render: (r) => <BoToggle on={r.investor} /> },
      { k: 'consultant',l:'Consultant',      render: (r) => <BoToggle on={r.consultant} /> }
    ]}
    rows={[
      { id: 'royalties',   field: 'Royalties %',           public: false, candidate: false, investor: true,  consultant: true },
      { id: 'contacts',    field: 'Direct contacts',       public: false, candidate: false, investor: false, consultant: true },
      { id: 'kpi',         field: 'KPI per shop',          public: false, candidate: true,  investor: true,  consultant: true },
      { id: 'team',        field: 'Brand team',            public: true,  candidate: true,  investor: true,  consultant: true },
      { id: 'roi',         field: 'Expected ROI',          public: true,  candidate: true,  investor: true,  consultant: true },
      { id: 'docs',        field: 'Brand documents',       public: false, candidate: true,  investor: true,  consultant: true },
      { id: 'gallery',     field: 'Photo gallery',         public: true,  candidate: true,  investor: true,  consultant: true },
      { id: 'opportunities', field: 'Open opportunities',  public: true,  candidate: true,  investor: true,  consultant: true }
    ]}
  />;
}

function BoToggle({ on }) {
  return <span className={'bo-toggle' + (on ? ' is-on' : '')}><i></i></span>;
}

function BoPreview({ ctx }) {
  return (
    <>
      <BoHead eyebrow="Platform · Preview" title="Multi-context preview"
        sub="Voyez exactement ce que chaque rôle voit."
      />
      <div className="bo-preview-grid">
        {[
          { id: 'public',    label: 'Public site',     href: 'landing.html',          frame: 'desktop' },
          { id: 'mobile',    label: 'Mobile · landing', href: 'landing.html',         frame: 'mobile' },
          { id: 'candidate', label: 'Candidate portal',href: 'candidate.html',        frame: 'desktop' },
          { id: 'investor',  label: 'Investor portal', href: 'index.html',            frame: 'desktop' }
        ].map(p => (
          <article key={p.id} className="bo-preview">
            <header><strong>{p.label}</strong><a href={p.href} className="bo-btn bo-btn--ghost bo-btn--xs">Open →</a></header>
            <div className={'bo-preview__frame bo-preview__frame--' + p.frame}>
              <iframe src={p.href} title={p.label} loading="lazy"></iframe>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function BoAutomation({ ctx }) {
  return <BoPlaceholder ctx={ctx} eyebrow="Platform · Automation" title="Automation engine"
    sub="Emails, notifications, lead assignment, reminders, scoring, status updates."
    actions={(<button className="bo-btn bo-btn--primary" onClick={() => openModal('confirm', { title: 'Create new automation?', body: 'Open the rule builder to define a trigger and an action.', confirmLabel: 'Open builder', successMessage: 'Rule builder opened.' })}><BoIcon.plus />New rule</button>)}
    columns={[
      { k: 'name', l: 'Rule', render: (r) => <strong>{r.name}</strong> },
      { k: 'trigger', l: 'Trigger' },
      { k: 'action', l: 'Action' },
      { k: 'runs', l: 'Runs last 30d', align: 'right' },
      { k: 'status', l: 'Status', render: (r) => <BoToggle on={r.status} /> }
    ]}
    rows={[
      { id: 1, name: 'Auto-assign new candidate to consultant by region', trigger: 'Lead created',          action: 'Assign consultant', runs: 42, status: true },
      { id: 2, name: 'Email "Document expired" reminder',                 trigger: '14 days before expiry', action: 'Send email',        runs: 18, status: true },
      { id: 3, name: 'Auto-score lead by capital × experience',           trigger: 'Profile updated',       action: 'Update score',      runs: 64, status: true },
      { id: 4, name: 'Block workflow if no opportunity validated',        trigger: 'Workflow start',        action: 'Block + notify',    runs: 7,  status: true },
      { id: 5, name: 'Weekly digest to brand managers',                   trigger: 'Monday 09:00',          action: 'Send email',        runs: 4,  status: true },
      { id: 6, name: 'Alert if closing < 14 days unfunded',               trigger: 'Closing date approaches', action: 'Slack + email',  runs: 3,  status: false }
    ]}
  />;
}

function BoSettings({ ctx }) {
  return (
    <>
      <BoHead eyebrow="Platform · Settings" title="Settings"
        sub="Configuration globale du SaaS."
      />
      <div className="bo-grid">
        {[
          { title: 'Workspace',    items: ['Group name', 'Logo', 'Default language', 'Default currency', 'Time zone'] },
          { title: 'Localization', items: ['Languages: FR · NL · EN', 'Active countries: BE · FR · NL', 'Date format', 'Number format'] },
          { title: 'Billing & plan', items: ['Plan: SaaS Pro', 'Seats: 24 / 30', 'Renewal: 12 May 2027', 'Invoices archive'] },
          { title: 'Integrations', items: ['DocuSign', 'BNP Paribas Fortis (IBAN)', 'SendGrid', 'Slack', 'Google Workspace', 'Stripe'] },
          { title: 'Audit log',    items: ['Last 90 days', 'Export CSV', 'Retention 24 months'] },
          { title: 'Data', items: ['Backups: daily', 'Export workspace', 'Delete workspace'] }
        ].map((c, i) => (
          <article key={i} className="bo-card">
            <header className="bo-card__head"><h2 className="bo-card__title">{c.title}</h2></header>
            <ul className="bo-settings-list">{c.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
          </article>
        ))}
      </div>
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
  const [type, setType] = bState(payload?.type || 'candidate');
  const [name, setName] = bState('');
  const [email, setEmail] = bState('');
  const [phone, setPhone] = bState('');
  const [brand, setBrand] = bState(FG.BRANDS[0].id);
  const [notes, setNotes] = bState('');
  const [err, setErr] = bState('');
  const [busy, submit] = useFakeSubmit(() => {
    toast('success', `${name} added as ${type} lead.`);
    onClose();
  });
  const onSubmit = () => {
    if (!name || !email) { setErr('Name and email are required.'); toast('error', 'Please fill in the required fields.'); return; }
    setErr('');
    submit();
  };
  return (
    <BoModal open title="New lead" eyebrow="CRM" sub="Create a new lead and route it to the right consultant."
      onClose={onClose} onSubmit={onSubmit} submitLabel="Create lead" busy={busy}>
      <BoField label="Type">
        <div className="bo-segment">
          {['candidate', 'investor', 'brand', 'developer', 'new-brand'].map(t => (
            <button key={t} type="button" className={'bo-segment__opt' + (type === t ? ' is-active' : '')} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
      </BoField>
      <div className="bo-form-row">
        <BoField label="Full name *"><input value={name} onChange={e => setName(e.target.value)} required /></BoField>
        <BoField label="Email *"><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></BoField>
      </div>
      <div className="bo-form-row">
        <BoField label="Phone"><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></BoField>
        <BoField label="Linked brand">
          <select value={brand} onChange={e => setBrand(e.target.value)}>
            <option value="">— Any —</option>
            {FG.BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </BoField>
      </div>
      <BoField label="Notes"><textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}></textarea></BoField>
      {err && <p className="bo-form-error">{err}</p>}
    </BoModal>
  );
}

function ModalNewBrand({ ctx, onClose }) {
  const [name, setName] = bState('');
  const [kind, setKind] = bState('Boulangerie · Pâtisserie');
  const [city, setCity] = bState('');
  const [busy, submit] = useFakeSubmit(() => { toast('success', `${name} added as new brand.`); onClose(); });
  return (
    <BoModal open title="New brand" eyebrow="Brand management" onClose={onClose} onSubmit={() => {
      if (!name) { toast('error', 'Brand name is required.'); return; }
      submit();
    }} submitLabel="Create brand" busy={busy}>
      <BoField label="Brand name *"><input value={name} onChange={e => setName(e.target.value)} required /></BoField>
      <div className="bo-form-row">
        <BoField label="Sector"><input value={kind} onChange={e => setKind(e.target.value)} /></BoField>
        <BoField label="HQ city"><input value={city} onChange={e => setCity(e.target.value)} /></BoField>
      </div>
      <BoField label="Initial visibility" hint="Public visibility can be configured later under Visibility settings.">
        <select defaultValue="internal"><option value="internal">Internal only</option><option value="public">Public</option><option value="hidden">Hidden</option></select>
      </BoField>
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
  const [devId,     setDevId]     = bState('');
  const [locId,     setLocId]     = bState('');
  const [budget,    setBudget]    = bState('');
  const [ticketMin, setTicketMin] = bState('');
  const [ticketMax, setTicketMax] = bState('');
  const [roiTarget, setRoiTarget] = bState('');
  const [status,    setStatus]    = bState('open');

  const dev       = DEVS.find(d => d.id === devId) || null;
  const locations = dev ? dev.locations.filter(l => l.status === 'available' || l.status === 'under-review') : [];
  const loc       = locations.find(l => l.id === locId) || null;

  // When developer changes, reset location
  const handleDevChange = (id) => { setDevId(id); setLocId(''); };

  const canSubmit = brand && devId && locId;
  const [busy, submit] = useFakeSubmit(() => {
    toast('success', `Opportunity created · ${FG.brandById(brand)?.name} @ ${loc?.city}`);
    onClose();
  });

  return (
    <BoModal open title="New opportunity" eyebrow="Opportunities" onClose={onClose}
      onSubmit={() => canSubmit ? submit() : toast('error', 'Select a brand and a developer location.')}
      submitLabel="Create opportunity" busy={busy}>

      {/* Row 1: Brand + Developer */}
      <div className="bo-form-row">
        <BoField label="Brand *">
          <select value={brand} onChange={e => setBrand(e.target.value)}>
            {FG.BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </BoField>
        <BoField label="Developer *">
          <select value={devId} onChange={e => handleDevChange(e.target.value)}>
            <option value="">— Select developer —</option>
            {DEVS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </BoField>
      </div>

      {/* Location dropdown — only shown once a developer is selected */}
      {devId && (
        <BoField label="Location *">
          <select value={locId} onChange={e => setLocId(e.target.value)}>
            <option value="">— Select location —</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.address} · {l.surface}</option>
            ))}
            {!locations.length && <option disabled>No available locations for this developer</option>}
          </select>
        </BoField>
      )}

      {/* Location details card — shown once a location is selected */}
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
            <span className="bo-location-card__label">Type</span>
            <span>{loc.type}</span>
          </div>
          <div className="bo-location-card__row">
            <span className="bo-location-card__label">Available from</span>
            <span>{loc.availability}</span>
          </div>
          <div className="bo-location-card__row">
            <span className="bo-location-card__label">Monthly rent</span>
            <span>€{loc.rent?.toLocaleString()}/month</span>
          </div>
          {loc.notes && (
            <div className="bo-location-card__row">
              <span className="bo-location-card__label">Notes</span>
              <span className="bo-location-card__note">{loc.notes}</span>
            </div>
          )}
          {dev && (
            <div className="bo-location-card__row">
              <span className="bo-location-card__label">Contact</span>
              <span>{dev.contactName} · {dev.email}</span>
            </div>
          )}
        </div>
      )}

      {/* Financial details */}
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
      <div className="bo-form-row">
        <BoField label="ROI target (%)">
          <input type="number" value={roiTarget} onChange={e => setRoiTarget(e.target.value)} placeholder="8.0" step="0.1" />
        </BoField>
        <BoField label="Status">
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="open">Open</option>
            <option value="pre">Pre-launch</option>
            <option value="closing">Closing imminent</option>
          </select>
        </BoField>
      </div>
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
