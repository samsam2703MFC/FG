/* global React, window */
// Franchise Generation — shell + global views (dashboard, portfolio,
// opportunities, documents, notifications). Each view is brand-agnostic
// and lives in the "FG neutral" theme. Drilling into a brand swaps the
// theme class on <body> and routes to brand-specific views.

const { useState, useEffect, useMemo } = React;

// ====================================================================
// ICONS (mono, 16px stroke=1.5)
// ====================================================================
const FgIcon = {
  dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  portfolio: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4"/><path d="M3 17l9 4 9-4"/></svg>,
  opp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M5 9l7-7 7 7M5 15l7 7 7-7"/></svg>,
  doc: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/></svg>,
  bell: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>,
  user: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
  search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  arrow: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  back: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  pulse: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>
};

// ====================================================================
// Logo color inversion — compute filter based on background luminance.
// Returns CSS filter that flips the source logo to white-on-dark or
// black-on-light depending on the brand's primary color.
// ====================================================================
function logoFilter(hex) {
  if (!hex) return 'brightness(0) invert(1)';
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const adj = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L = 0.2126 * adj(r) + 0.7152 * adj(g) + 0.0722 * adj(b);
  return L > 0.55 ? 'brightness(0)' : 'brightness(0) invert(1)';
}

// ====================================================================
// BRAND CHIP MARK (sidebar + topbar + tiles)
// ====================================================================
function BrandMark({ brand, size = 26 }) {
  const t = brand.tokens;
  const filter = logoFilter(t.primary);
  const style = {
    background: t.primary,
    color: filter === 'brightness(0)' ? t.ink : '#fff',
    width: size, height: size,
    fontFamily: 'DM Sans, system-ui, sans-serif',
    fontSize: size * 0.46,
    borderRadius: size * 0.25,
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    fontWeight: 600,
    letterSpacing: '-0.01em'
  };
  if (brand.logoSrc) {
    return (
      <div className="fg-brand-chip__mark" style={style}>
        <img src={brand.logoSrc} alt={brand.name}
          style={{ filter, padding: size * 0.14, width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    );
  }
  return <div style={style}>{brand.logoMark}</div>;
}

// ====================================================================
// SIDEBAR
// ====================================================================
function FgSidebar({ scope, brand, route, goTo, fgNav, brands, fgData, currentUser, onLogout }) {
  return (
    <aside className="fg-sidebar">
      {/* FG header */}
      <div className="fg-brand-head">
        <button className="fg-brand-head__logo" onClick={() => goTo('fg', 'dashboard')}>
          <img src="img/fg-logo.png" alt="Franchise Generation" className="fg-brand-head__img" />
        </button>
        <p className="fg-brand-head__sub">Espace investisseur</p>
      </div>

      {/* FG-scope nav */}
      <p className="fg-section-label">Vue globale</p>
      <nav className="fg-nav">
        {fgNav.map(n => (
          <button key={n.id}
            className={'fg-nav__item' + (scope === 'fg' && route.section === n.id ? ' is-active' : '')}
            onClick={() => goTo('fg', n.id)}>
            <span className="fg-nav__icon">{n.icon}</span>
            <span>{n.label}</span>
            {n.count > 0 && <span className="fg-nav__count">{n.count}</span>}
          </button>
        ))}
      </nav>

      {/* Brand switcher */}
      <p className="fg-section-label">Mes marques</p>
      <div className="fg-brand-switch">
        {brands.map(b => {
          const portfolio = b.id === 'atelier'
            ? window.PORTAL_DATA.PROJECTS.reduce((acc, p) => acc + p.invested, 0)
            : (fgData.BRAND_PORTFOLIOS[b.id]?.summary.invested || 0);
          const isActive = scope === b.id;
          const chipStyle = { '--chip-color': b.tokens.primary, '--chip-font': b.tokens.fontDisplay };
          return (
            <button key={b.id}
              className={'fg-brand-chip' + (isActive ? ' is-active' : '')}
              onClick={() => goTo(b.id, 'presentation')}
              style={chipStyle}>
              <BrandMark brand={b} size={26} />
              <div style={{ minWidth: 0 }}>
                <div className="fg-brand-chip__name">{b.name}</div>
                <div className="fg-brand-chip__sub">{b.established}</div>
              </div>
              <div className="fg-brand-chip__amount">{fgData.fmtEur(portfolio)}</div>
            </button>
          );
        })}
      </div>

      {/* User footer */}
      {(currentUser || onLogout) && (
        <div className="fg-sidebar-footer">
          {currentUser && (
            <div className="fg-sidebar-user">
              <div className="fg-sidebar-user__avatar">
                {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
              </div>
              <div className="fg-sidebar-user__info">
                <div className="fg-sidebar-user__name">{currentUser.name || currentUser.email}</div>
                <div className="fg-sidebar-user__role">{currentUser.role || 'Investisseur'}</div>
              </div>
            </div>
          )}
          {onLogout && (
            <button className="fg-sidebar-logout" onClick={onLogout} title="Se déconnecter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

// ====================================================================
// TOPBAR (breadcrumb + context badge)
// ====================================================================
function FgTopbar({ scope, brand, route, goTo, unread }) {
  const crumb = [
    { label: 'Franchise Generation', onClick: () => goTo('fg', 'dashboard') }
  ];
  if (scope !== 'fg') crumb.push({ label: brand.name, onClick: () => goTo(scope, 'dashboard') });
  if (scope !== 'fg' && route.shopId) {
    const shop = (window.FG_DATA.BRAND_PORTFOLIOS[scope]?.shops.find(s => s.id === route.shopId))
      || (scope === 'atelier' ? window.PORTAL_DATA.PROJECTS.find(p => p.id === route.shopId) : null);
    if (shop) crumb.push({ label: shop.name, onClick: null });
  }
  const sectionLabels = window.FG_DATA.SECTION_LABELS;
  if (scope !== 'fg' && route.section !== 'dashboard' && !route.shopId) {
    crumb.push({ label: sectionLabels[route.section] || route.section, onClick: null });
  } else if (scope === 'fg' && route.section !== 'dashboard') {
    crumb.push({ label: sectionLabels[route.section] || route.section, onClick: null });
  }

  return (
    <header className="fg-topbar">
      <div className="fg-crumb">
        {crumb.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="fg-crumb__sep">›</span>}
            {c.onClick && i < crumb.length - 1
              ? <button onClick={c.onClick}>{c.label}</button>
              : <span className="fg-crumb__here">{c.label}</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="fg-topbar__right">
        {scope !== 'fg' && (
          <span className="fg-ctx-badge" style={{ '--chip-color': brand.tokens.primary }}>
            <span className="fg-ctx-badge__mark" style={{ background: brand.tokens.primary }}>
              {brand.logoSrc
                ? <img src={brand.logoSrc} alt="" style={{ filter: logoFilter(brand.tokens.primary), padding: 3, width: '100%', height: '100%', objectFit: 'contain' }} />
                : brand.logoMark}
            </span>
            Écosystème {brand.name}
          </span>
        )}
        <button className="fg-icon-btn" title="Rechercher"><FgIcon.search /></button>
        <button className="fg-icon-btn" title="Notifications" onClick={() => goTo('fg', 'notifications')}>
          <FgIcon.bell />
          {unread > 0 && <span className="fg-icon-btn__dot"></span>}
        </button>
        <button className="fg-btn" onClick={() => goTo('fg', 'opportunites')}>
          Investir <FgIcon.arrow />
        </button>
        <button className={'fg-topbar-profile' + (route.scope === 'fg' && route.section === 'profil' ? ' is-active' : '')}
          onClick={() => goTo('fg', 'profil')}
          title="Mon profil · Documents · Préférences"
          aria-label="Mon profil">
          <span className="fg-topbar-profile__avatar">{window.FG_DATA.INVESTOR.initials}</span>
        </button>
      </div>
    </header>
  );
}

// ====================================================================
// WELCOME TOAST (shown on brand entry)
// ====================================================================
function FgToast({ brand, visible }) {
  if (!brand) return null;
  const style = {
    '--toast-color': brand.tokens.primary
  };
  return (
    <div className={'fg-toast' + (visible ? ' is-visible' : '')} style={style}>
      <span className="fg-toast__mark" style={{ background: brand.tokens.primary }}>
        {brand.logoSrc
          ? <img src={brand.logoSrc} alt="" style={{ filter: logoFilter(brand.tokens.primary), padding: 4, width: '100%', height: '100%', objectFit: 'contain' }} />
          : brand.logoMark}
      </span>
      <span>
        <span className="fg-toast__sub">Vous entrez dans</span> {brand.name} · {brand.kind}
      </span>
    </div>
  );
}

// ====================================================================
// FG GLOBAL DASHBOARD
// ====================================================================
function FgDashboard({ goTo, fgData }) {
  const D = fgData;
  const A = window.PORTAL_DATA;

  // Aggregate portfolio across all brands
  const atelierInvested = A.PROJECTS.reduce((a, p) => a + p.invested, 0);
  const atelierRepaid = A.PROJECTS.reduce((a, p) => a + p.repaid, 0);
  const atelierValuation = A.PROJECTS.reduce((a, p) => a + p.invested * (1 + p.roiCurrent / 100 * (p.monthsElapsed / 12)), 0);

  const otherInvested = Object.values(D.BRAND_PORTFOLIOS).reduce((a, b) => a + b.summary.invested, 0);
  const otherRepaid = Object.values(D.BRAND_PORTFOLIOS).reduce((a, b) => a + b.summary.repaid, 0);
  const otherValuation = Object.values(D.BRAND_PORTFOLIOS).reduce((a, b) => a + b.summary.valuation, 0);

  const totalInvested = atelierInvested + otherInvested;
  const totalRepaid = atelierRepaid + otherRepaid;
  const totalValuation = atelierValuation + otherValuation;

  // Expected total return (cum interest at maturity)
  const totalExpected = A.PROJECTS.reduce((a, p) => a + p.invested * (1 + p.roiTarget / 100 * p.maturityYears), 0)
    + Object.values(D.BRAND_PORTFOLIOS).reduce((a, b) => a + b.summary.invested * (1 + b.summary.roiTarget / 100 * 5), 0);
  const remaining = totalExpected - totalRepaid;

  // Build investment tiles
  const tiles = [];
  A.PROJECTS.forEach(p => {
    const last = p.kpi.ca.at(-1), budget = p.kpi.budget.at(-1);
    const vsBudget = ((last / budget) - 1) * 100;
    tiles.push({
      kind: 'investment',
      brandId: 'atelier',
      id: p.id,
      name: p.name.replace("L'Atelier ", ''),
      brandLabel: "L'Atelier By",
      shopKind: p.kind,
      city: p.city,
      invested: p.invested,
      repaid: p.repaid,
      valuation: p.invested * (1 + p.roiCurrent / 100 * (p.monthsElapsed / 12)),
      roiCurrent: p.roiCurrent,
      vsBudget,
      ca: last,
      health: p.health
    });
  });
  ['couq', 'cookies', 'mania'].forEach(brandId => {
    D.BRAND_PORTFOLIOS[brandId].shops.forEach(s => {
      tiles.push({
        kind: 'investment',
        brandId,
        id: s.id,
        name: s.name.replace(/^(Couq|Cookie's & Milk|Mania Pizza)\s*/, ''),
        brandLabel: D.brandById(brandId).name,
        shopKind: s.kind,
        city: s.city,
        invested: s.invested,
        repaid: s.repaid,
        valuation: s.invested * (1 + s.roiCurrent / 100 * 0.5),
        roiCurrent: s.roiCurrent,
        vsBudget: s.kpiSnapshot.vsBudget,
        ca: s.kpiSnapshot.ca,
        health: s.health
      });
    });
  });

  // Top opportunities (3 most urgent)
  const opps = [...D.FG_OPPORTUNITIES].sort((a, b) => a.closingDays - b.closingDays).slice(0, 3);

  return (
    <div className="fg-content">
      {/* Compact KPI summary bar */}
      <section className="fg-kpi-bar">
        <div className="fg-kpi">
          <p className="fg-kpi__label">Capital placé</p>
          <p className="fg-kpi__val">{D.fmtEur(totalInvested)}</p>
          <p className="fg-kpi__foot">Sur {tiles.length} projets · {D.BRANDS.length} marques</p>
        </div>
        <div className="fg-kpi">
          <p className="fg-kpi__label">Valorisation actuelle</p>
          <p className="fg-kpi__val">{D.fmtEur(totalValuation)}</p>
          <p className="fg-kpi__foot fg-kpi__foot--up">
            <span className="fg-kpi__arrow">▴</span> +{((totalValuation / totalInvested - 1) * 100).toFixed(1)} % vs origine
          </p>
        </div>
        <div className="fg-kpi">
          <p className="fg-kpi__label">Déjà remboursé</p>
          <p className="fg-kpi__val">{D.fmtEur(totalRepaid)}</p>
          <p className="fg-kpi__foot">{((totalRepaid / totalExpected) * 100).toFixed(1)} % du plan</p>
        </div>
        <div className="fg-kpi">
          <p className="fg-kpi__label">Reste à percevoir</p>
          <p className="fg-kpi__val">{D.fmtEur(remaining)}</p>
          <p className="fg-kpi__foot">Sur maturité moyenne 5 ans</p>
        </div>
      </section>

      {/* Investments */}
      <section className="fg-sec">
        <div className="fg-sec__head">
          <div>
            <h2 className="fg-sec__title">Mes investissements actifs</h2>
            <p className="fg-sec__sub">{tiles.length} projets répartis sur {D.BRANDS.length} marques · cliquez pour ouvrir le détail</p>
          </div>
          <button className="fg-sec__action" onClick={() => goTo('fg', 'portfolio')}>Tout voir →</button>
        </div>
        <FgCarousel ariaLabel="Mes investissements actifs">
          {tiles.map(t => {
            const brand = D.brandById(t.brandId);
            const tileStyle = { '--tile-color': brand.tokens.primary, '--tile-font': brand.tokens.fontDisplay };
            const progress = (t.repaid / (t.invested * (1 + t.roiCurrent / 100 * 5))) * 100;
            return (
              <button key={t.id} className="fg-tile" style={tileStyle}
                onClick={() => goTo(t.brandId, t.brandId === 'atelier' ? 'magasins' : 'dashboard', t.id)}>
                <div className="fg-tile__head">
                  <BrandMark brand={brand} size={36} />
                  <div>
                    <p className="fg-tile__brand">{t.brandLabel}</p>
                    <p className="fg-tile__name">{t.name}</p>
                  </div>
                  <span className={'fg-tile__status fg-tile__status--' + (t.health === 'warn' ? 'warn' : 'active')}>
                    {t.health === 'warn' ? 'À surveiller' : 'Actif'}
                  </span>
                </div>
                <div className="fg-tile__body">
                  <div>
                    <p className="fg-tile__kpi-label">Investi</p>
                    <p className="fg-tile__kpi-val">{D.fmtEur(t.invested)}</p>
                  </div>
                  <div>
                    <p className="fg-tile__kpi-label">Valorisation</p>
                    <p className="fg-tile__kpi-val">{D.fmtEur(t.valuation)}</p>
                    <p className="fg-tile__kpi-delta is-up">+{((t.valuation / t.invested - 1) * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="fg-tile__kpi-label">TRI réel</p>
                    <p className="fg-tile__kpi-val">{t.roiCurrent.toFixed(1)} %</p>
                  </div>
                  <div>
                    <p className="fg-tile__kpi-label">CA mois</p>
                    <p className="fg-tile__kpi-val">{D.fmtEur(t.ca)}</p>
                    <p className={'fg-tile__kpi-delta ' + (t.vsBudget >= 0 ? 'is-up' : 'is-down')}>
                      {t.vsBudget >= 0 ? '+' : ''}{t.vsBudget.toFixed(1)} % vs budget
                    </p>
                  </div>
                  <div className="fg-tile__progress">
                    <div className="fg-tile__progress-track">
                      <div className="fg-tile__progress-fill" style={{ width: `${Math.min(100, progress)}%` }}></div>
                    </div>
                    <div className="fg-tile__progress-legend">
                      <span>{D.fmtEur(t.repaid)} remboursés</span>
                      <span>{progress.toFixed(1)} % du plan</span>
                    </div>
                  </div>
                </div>
                <div className="fg-tile__foot">
                  <span>{t.city} · {t.shopKind}</span>
                  <span className="fg-tile__foot-cta">Voir investissement →</span>
                </div>
              </button>
            );
          })}
        </FgCarousel>
      </section>

      {/* Opportunities */}
      <section className="fg-sec">
        <div className="fg-sec__head">
          <div>
            <h2 className="fg-sec__title">Projets en recherche de financement</h2>
            <p className="fg-sec__sub">{D.FG_OPPORTUNITIES.length} opportunités cross-marques · pré-engagement en 2 clics</p>
          </div>
          <button className="fg-sec__action" onClick={() => goTo('fg', 'opportunites')}>Voir toutes →</button>
        </div>
        <FgCarousel ariaLabel="Projets en recherche de financement">
          {D.FG_OPPORTUNITIES.map(o => {
            const brand = D.brandById(o.brand);
            const tileStyle = { '--tile-color': brand.tokens.primary, '--tile-font': brand.tokens.fontDisplay };
            const progress = (o.raised / o.target) * 100;
            return (
              <button key={o.id} className="fg-tile fg-tile--opp" style={tileStyle}
                onClick={() => goTo('fg', 'opportunites')}>
                <div className="fg-tile__head">
                  <BrandMark brand={brand} size={36} />
                  <div>
                    <p className="fg-tile__brand">{brand.name}</p>
                    <p className="fg-tile__name">{o.name.replace(brand.name + ' ', '')}</p>
                  </div>
                  <span className="fg-tile__status fg-tile__status--open">Ouvert</span>
                </div>
                <div className="fg-tile__body">
                  <div>
                    <p className="fg-tile__kpi-label">Objectif</p>
                    <p className="fg-tile__kpi-val">{D.fmtEur(o.target)}</p>
                  </div>
                  <div>
                    <p className="fg-tile__kpi-label">TRI cible</p>
                    <p className="fg-tile__kpi-val">{o.roiTarget.toFixed(1)} %</p>
                  </div>
                  <div>
                    <p className="fg-tile__kpi-label">Ticket min</p>
                    <p className="fg-tile__kpi-val">{D.fmtEur(o.ticketMin)}</p>
                  </div>
                  <div>
                    <p className="fg-tile__kpi-label">Retour estimé</p>
                    <p className="fg-tile__kpi-val">{o.payback}</p>
                  </div>
                  <div className="fg-tile__progress">
                    <div className="fg-tile__progress-track">
                      <div className="fg-tile__progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="fg-tile__progress-legend">
                      <span>{D.fmtEur(o.raised)} levés · {progress.toFixed(0)} %</span>
                      <span className="fg-tile__urgency">Closing dans {o.closingDays}j</span>
                    </div>
                  </div>
                </div>
                <div className="fg-tile__foot">
                  <span>{o.city} · {o.kind} · Risque {o.risk.toLowerCase()}</span>
                  <span className="fg-tile__foot-cta">Manifester intérêt →</span>
                </div>
              </button>
            );
          })}
        </FgCarousel>
      </section>
    </div>
  );
}

// ====================================================================
// FG PORTFOLIO (table view of all investments)
// ====================================================================
function FgPortfolio({ goTo, fgData }) {
  const D = fgData;
  const A = window.PORTAL_DATA;

  const rows = [];
  A.PROJECTS.forEach(p => {
    rows.push({
      brandId: 'atelier', id: p.id, name: p.name, city: p.city, kind: p.kind, opened: p.opened,
      invested: p.invested, repaid: p.repaid, roiTarget: p.roiTarget, roiCurrent: p.roiCurrent,
      vsBudget: ((p.kpi.ca.at(-1) / p.kpi.budget.at(-1)) - 1) * 100,
      maturity: p.maturityYears
    });
  });
  Object.entries(D.BRAND_PORTFOLIOS).forEach(([brandId, port]) => {
    port.shops.forEach(s => {
      rows.push({
        brandId, id: s.id, name: s.name, city: s.city, kind: s.kind, opened: s.opened,
        invested: s.invested, repaid: s.repaid, roiTarget: s.roiTarget, roiCurrent: s.roiCurrent,
        vsBudget: s.kpiSnapshot.vsBudget, maturity: 5
      });
    });
  });

  return (
    <div className="fg-content">
      <section className="fg-hero" style={{ gridTemplateColumns: '1fr' }}>
        <div>
          <p className="fg-hero__eyebrow">Portefeuille consolidé</p>
          <h1 className="fg-hero__h">Tous mes <em>investissements</em></h1>
          <p className="fg-hero__sub">{rows.length} projets actifs sur {D.BRANDS.length} marques. Trié par marque puis par ouverture.</p>
        </div>
      </section>

      <div className="fg-portfolio-table">
        <table>
          <thead>
            <tr>
              <th>Projet</th>
              <th>Ville</th>
              <th>Ouvert</th>
              <th style={{ textAlign: 'right' }}>Investi</th>
              <th style={{ textAlign: 'right' }}>Remboursé</th>
              <th style={{ textAlign: 'right' }}>TRI cible / réel</th>
              <th style={{ textAlign: 'right' }}>vs Budget</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const brand = D.brandById(r.brandId);
              const ptStyle = { '--tile-color': brand.tokens.primary, '--tile-font': brand.tokens.fontDisplay };
              return (
                <tr key={r.id} onClick={() => goTo(r.brandId, r.brandId === 'atelier' ? 'magasins' : 'dashboard', r.id)}>
                  <td>
                    <div className="fg-pt-shop" style={ptStyle}>
                      <div className="fg-pt-shop__mark"><BrandMark brand={brand} size={28} /></div>
                      <div>
                        <div className="fg-pt-shop__name">{r.name}</div>
                        <div className="fg-pt-shop__brand">{brand.name} · {r.kind}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.city}</td>
                  <td>{r.opened}</td>
                  <td style={{ textAlign: 'right' }}><span className="fg-num">{D.fmtEur(r.invested)}</span></td>
                  <td style={{ textAlign: 'right' }}><span className="fg-num">{D.fmtEur(r.repaid)}</span></td>
                  <td style={{ textAlign: 'right' }}><span className="fg-num">{r.roiTarget.toFixed(1)} / {r.roiCurrent.toFixed(1)} %</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 12, color: r.vsBudget >= 0 ? '#2d6a4f' : '#9c2a1f' }}>
                      {r.vsBudget >= 0 ? '+' : ''}{r.vsBudget.toFixed(1)} %
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 12, color: 'var(--brand-ink)' }}>Ouvrir →</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ====================================================================
// FG OPPORTUNITIES (cross-brand marketplace)
// ====================================================================
function FgOpportunities({ goTo, fgData }) {
  const D = fgData;
  return (
    <div className="fg-content">
      <section className="fg-hero" style={{ gridTemplateColumns: '1fr' }}>
        <div>
          <p className="fg-hero__eyebrow">Marketplace cross-marques</p>
          <h1 className="fg-hero__h">Nouvelles <em>opportunités</em></h1>
          <p className="fg-hero__sub">{D.FG_OPPORTUNITIES.length} projets ouverts sur {D.BRANDS.length} marques. Pré-engagez votre ticket — l'équipe vous recontacte sous 48 h.</p>
        </div>
      </section>

      <div className="fg-tiles">
        {D.FG_OPPORTUNITIES.map(o => {
          const brand = D.brandById(o.brand);
          const tileStyle = { '--tile-color': brand.tokens.primary, '--tile-font': brand.tokens.fontDisplay };
          const progress = (o.raised / o.target) * 100;
          return (
            <div key={o.id} className="fg-tile fg-tile--opp" style={tileStyle}>
              <div className="fg-tile__head">
                <BrandMark brand={brand} size={36} />
                <div>
                  <p className="fg-tile__brand">{brand.name}</p>
                  <p className="fg-tile__name">{o.name.replace(brand.name + ' ', '')}</p>
                </div>
                <span className="fg-tile__status fg-tile__status--open">{o.closingDays}j</span>
              </div>
              <div className="fg-tile__body">
                <div>
                  <p className="fg-tile__kpi-label">Objectif</p>
                  <p className="fg-tile__kpi-val">{D.fmtEur(o.target)}</p>
                </div>
                <div>
                  <p className="fg-tile__kpi-label">TRI cible</p>
                  <p className="fg-tile__kpi-val">{o.roiTarget.toFixed(1)} %</p>
                </div>
                <div>
                  <p className="fg-tile__kpi-label">Ticket min</p>
                  <p className="fg-tile__kpi-val">{D.fmtEur(o.ticketMin)}</p>
                </div>
                <div>
                  <p className="fg-tile__kpi-label">Payback</p>
                  <p className="fg-tile__kpi-val">{o.payback}</p>
                </div>
                <div className="fg-tile__progress">
                  <div className="fg-tile__progress-track">
                    <div className="fg-tile__progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="fg-tile__progress-legend">
                    <span>{D.fmtEur(o.raised)} levés · {progress.toFixed(0)} %</span>
                    <span style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>Risque {o.risk.toLowerCase()}</span>
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1', fontSize: 12, color: 'rgba(26,27,25,0.65)', fontStyle: 'italic', borderTop: '0.5px solid rgba(26,27,25,0.06)', paddingTop: 12 }}>
                  {o.concept}
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                  <button className="fg-btn" style={{ flex: 1 }}>Manifester intérêt</button>
                  <button className="fg-btn fg-btn--ghost">Business plan</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ====================================================================
// FG NOTIFICATIONS (cross-brand)
// ====================================================================
function FgNotifications({ goTo, fgData }) {
  const D = fgData;
  return (
    <div className="fg-content">
      <section className="fg-hero" style={{ gridTemplateColumns: '1fr' }}>
        <div>
          <p className="fg-hero__eyebrow">Flux cross-marques</p>
          <h1 className="fg-hero__h">Notifications</h1>
          <p className="fg-hero__sub">{D.FG_NOTIFS.filter(n => n.unread).length} non lues · versements, rapports, opportunités et documents à signer.</p>
        </div>
      </section>
      <div className="fg-portfolio-table">
        <table>
          <tbody>
            {D.FG_NOTIFS.map(n => {
              const brand = D.brandById(n.brand);
              return (
                <tr key={n.id} onClick={() => goTo(n.brand, 'dashboard')}>
                  <td style={{ width: 56 }}><BrandMark brand={brand} size={32} /></td>
                  <td>
                    <div style={{ fontWeight: n.unread ? 500 : 400, color: 'var(--brand-ink)' }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(26,27,25,0.55)', marginTop: 2 }}>{n.sub}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: 12, color: 'rgba(26,27,25,0.55)' }}>{n.time}</td>
                  <td style={{ width: 80, textAlign: 'right' }}>
                    {n.unread && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-primary)' }}></span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ====================================================================
// FG DOCUMENTS (cross-brand aggregator)
// ====================================================================
function FgDocuments({ goTo, fgData }) {
  const D = fgData;
  const A = window.PORTAL_DATA;
  return (
    <div className="fg-content">
      <section className="fg-hero" style={{ gridTemplateColumns: '1fr' }}>
        <div>
          <p className="fg-hero__eyebrow">Bibliothèque consolidée</p>
          <h1 className="fg-hero__h">Documents & <em>contrats</em></h1>
          <p className="fg-hero__sub">Tous vos contrats, attestations fiscales et rapports — toutes marques confondues.</p>
        </div>
      </section>
      <div className="fg-portfolio-table">
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>Marque</th>
              <th>Type</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {A.DOCS.map(d => {
              const proj = A.PROJECTS.find(p => p.id === d.project);
              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{d.title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(26,27,25,0.55)' }}>{d.sub}</div>
                  </td>
                  <td><BrandMark brand={D.brandById('atelier')} size={22} /></td>
                  <td style={{ fontSize: 12 }}>{d.kind}</td>
                  <td style={{ fontSize: 12 }}>{d.date}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="fg-btn fg-btn--ghost" style={{ fontSize: 11 }}>
                      {d.pending ? 'Signer' : 'Télécharger'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ====================================================================
// BRAND SECTION TABS (horizontal, sits below the topbar when in a brand)
// ====================================================================
function FgBrandTabs({ scope, brand, route, goTo, fgData }) {
  if (scope === 'fg' || !brand) return null;
  const shopSectionId = scope === 'atelier' ? 'magasins' : 'shops';
  const oppCount = fgData.FG_OPPORTUNITIES.filter(o => o.brand === brand.id).length;
  const tabs = [
    { id: 'presentation', label: 'Présentation' },
    { id: 'dashboard',    label: 'Tableau de bord' },
    { id: shopSectionId,  label: 'Mes ' + brand.copy.ecoNounPlural },
    { id: 'opportunites', label: 'Opportunités', count: oppCount }
  ];
  // Map both magasins/shops to the same active state regardless of brand
  const activeId = (route.section === 'magasins' || route.section === 'shops')
    ? shopSectionId : route.section;
  return (
    <nav className="fg-brand-tabs">
      <div className="fg-brand-tabs__inner">
        {tabs.map(t => (
          <button key={t.id}
            className={'fg-brand-tab' + (activeId === t.id ? ' is-active' : '')}
            onClick={() => goTo(scope, t.id)}>
            <span>{t.label}</span>
            {t.count > 0 && <span className="fg-brand-tab__count">{t.count}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ====================================================================
// HORIZONTAL CAROUSEL — Netflix-style, used in dashboard sections
// One row, scroll-snap, arrow nav on desktop, touch-swipe on mobile,
// partial peek of the next tile to hint at more content.
// ====================================================================
function FgCarousel({ children, ariaLabel }) {
  const trackRef = React.useRef(null);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(true);

  const update = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, children]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const tile = el.querySelector('.fg-tile');
    const step = tile ? tile.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div className="fg-car" aria-label={ariaLabel}>
      <button className="fg-car__arrow fg-car__arrow--prev" disabled={!canPrev}
        onClick={() => scroll(-1)} aria-label="Précédent">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div className="fg-car__track" ref={trackRef} onScroll={update}>
        {children}
      </div>
      <button className="fg-car__arrow fg-car__arrow--next" disabled={!canNext}
        onClick={() => scroll(1)} aria-label="Suivant">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      <div className="fg-car__fade fg-car__fade--right" aria-hidden="true"></div>
    </div>
  );
}

Object.assign(window, {
  FgIcon, BrandMark, FgSidebar, FgTopbar, FgToast, FgBrandTabs, FgCarousel,
  FgDashboard, FgPortfolio, FgOpportunities, FgNotifications, FgDocuments,
  logoFilter
});
