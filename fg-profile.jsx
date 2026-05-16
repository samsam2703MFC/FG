/* global React, window */
// Investor Profile — sole entry point for documents.
// Includes profile identity + KYC summary + a full document manager:
// type filter, brand filter, status filter, search, view/download/upload.

const { useState: pState, useMemo: pMemo } = React;

function FgProfile({ goTo, fgData }) {
  const D = fgData;
  const I = D.INVESTOR;
  const A = window.PORTAL_DATA;

  const [activeTab, setActiveTab] = pState('docs');

  // Investment totals for the profile header
  const totalInvested =
    A.PROJECTS.reduce((a, p) => a + p.invested, 0) +
    Object.values(D.BRAND_PORTFOLIOS).reduce((a, b) => a + b.summary.invested, 0);

  // Document validation summary
  const docStatus = pMemo(() => {
    const counts = { validated: 0, pending: 0, expired: 0, missing: 0, signed: 0, review: 0 };
    D.FG_DOCS.forEach(d => { counts[d.status] = (counts[d.status] || 0) + 1; });
    return counts;
  }, [D.FG_DOCS]);

  return (
    <div className="fg-content fg-profile">
      {/* Profile header */}
      <section className="fg-profile-head">
        <div className="fg-profile-head__id">
          <div className="fg-profile-head__avatar">{I.initials}</div>
          <div>
            <h1 className="fg-profile-head__name">{I.name}</h1>
            <p className="fg-profile-head__role">{I.role} · Tier {I.tier} · Investisseur depuis {I.since}</p>
          </div>
        </div>
        <div className="fg-profile-head__metrics">
          <div>
            <p className="fg-kpi__label">Capital placé</p>
            <p className="fg-profile-head__metric-val">{D.fmtEur(totalInvested)}</p>
          </div>
          <div>
            <p className="fg-kpi__label">Documents validés</p>
            <p className="fg-profile-head__metric-val">{docStatus.validated + docStatus.signed} / {D.FG_DOCS.length}</p>
          </div>
        </div>
      </section>

      {/* Sub-tabs */}
      <nav className="fg-profile-tabs">
        <button className={'fg-profile-tab' + (activeTab === 'docs' ? ' is-active' : '')} onClick={() => setActiveTab('docs')}>
          Documents <span className="fg-profile-tab__count">{D.FG_DOCS.length}</span>
        </button>
        <button className={'fg-profile-tab' + (activeTab === 'identity' ? ' is-active' : '')} onClick={() => setActiveTab('identity')}>
          Identité & coordonnées
        </button>
        <button className={'fg-profile-tab' + (activeTab === 'preferences' ? ' is-active' : '')} onClick={() => setActiveTab('preferences')}>
          Préférences
        </button>
      </nav>

      {activeTab === 'docs' && <FgProfileDocs fgData={D} />}
      {activeTab === 'identity' && <FgProfileIdentity fgData={D} />}
      {activeTab === 'preferences' && <FgProfilePreferences fgData={D} />}
    </div>
  );
}

// ====================================================================
// DOCUMENT MANAGER (sole document area in the portal)
// ====================================================================
function FgProfileDocs({ fgData }) {
  const D = fgData;
  const A = window.PORTAL_DATA;
  const [query, setQuery] = pState('');
  const [typeFilter, setTypeFilter] = pState('all');
  const [brandFilter, setBrandFilter] = pState('all');
  const [statusFilter, setStatusFilter] = pState('all');

  const projects = pMemo(() => {
    const list = A.PROJECTS.map(p => ({ id: p.id, brand: 'atelier', name: p.name }));
    Object.entries(D.BRAND_PORTFOLIOS).forEach(([brandId, port]) => {
      port.shops.forEach(s => list.push({ id: s.id, brand: brandId, name: s.name }));
    });
    return list;
  }, []);

  const filtered = pMemo(() => {
    const q = query.trim().toLowerCase();
    return D.FG_DOCS.filter(d => {
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      if (brandFilter !== 'all' && brandFilter !== 'global' && d.brand !== brandFilter) return false;
      if (brandFilter === 'global' && d.brand !== null) return false;
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (q && !(d.title.toLowerCase().includes(q) || (d.sub || '').toLowerCase().includes(q))) return false;
      return true;
    });
  }, [query, typeFilter, brandFilter, statusFilter]);

  // Group by type for the rendered list
  const grouped = pMemo(() => {
    const m = new Map();
    filtered.forEach(d => {
      if (!m.has(d.type)) m.set(d.type, []);
      m.get(d.type).push(d);
    });
    return m;
  }, [filtered]);

  const typeLabel = (id) => D.DOC_TYPES.find(t => t.id === id)?.label || id;
  const statusCounts = pMemo(() => {
    const c = { all: D.FG_DOCS.length };
    D.FG_DOCS.forEach(d => { c[d.status] = (c[d.status] || 0) + 1; });
    return c;
  }, []);

  return (
    <div className="fg-docs">
      {/* Filter bar */}
      <div className="fg-docs-filters">
        <div className="fg-docs-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Rechercher un document, un contrat, une attestation…"
            value={query} onChange={(e) => setQuery(e.target.value)} />
          {query && <button className="fg-docs-search__clear" onClick={() => setQuery('')}>×</button>}
        </div>
        <div className="fg-docs-filter-row">
          <div className="fg-docs-filter">
            <label>Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Tous types</option>
              {D.DOC_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="fg-docs-filter">
            <label>Marque</label>
            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              <option value="all">Toutes marques</option>
              <option value="global">Documents globaux (KYC, fiscal…)</option>
              {D.BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="fg-docs-filter">
            <label>Statut</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous statuts</option>
              <option value="validated">Validé</option>
              <option value="signed">Signé</option>
              <option value="pending">À signer / en attente</option>
              <option value="review">En revue</option>
              <option value="expired">Expiré</option>
              <option value="missing">Manquant</option>
            </select>
          </div>
          <button className="fg-btn fg-btn--ghost" style={{ marginLeft: 'auto' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M12 3v12M5 10l7 7 7-7"/><path d="M5 21h14"/></svg>
            Tout télécharger (.zip)
          </button>
          <button className="fg-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M12 5v14M5 12h14"/></svg>
            Déposer un document
          </button>
        </div>
      </div>

      {/* Status banner if anything missing or expired */}
      {(statusCounts.expired > 0 || statusCounts.missing > 0 || statusCounts.pending > 0) && (
        <div className="fg-docs-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          <div>
            <strong>Action requise sur {(statusCounts.expired || 0) + (statusCounts.missing || 0) + (statusCounts.pending || 0)} document{((statusCounts.expired || 0) + (statusCounts.missing || 0) + (statusCounts.pending || 0)) > 1 ? 's' : ''}.</strong>
            <span> {statusCounts.expired || 0} expiré{(statusCounts.expired || 0) > 1 ? 's' : ''} · {statusCounts.missing || 0} manquant{(statusCounts.missing || 0) > 1 ? 's' : ''} · {statusCounts.pending || 0} en attente de signature.</span>
          </div>
          <button className="fg-btn fg-btn--ghost fg-btn--sm" onClick={() => setStatusFilter('expired')}>Voir →</button>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="fg-docs-empty">
          <p>Aucun document ne correspond à vos filtres.</p>
          <button className="fg-btn fg-btn--ghost fg-btn--sm" onClick={() => { setQuery(''); setTypeFilter('all'); setBrandFilter('all'); setStatusFilter('all'); }}>Réinitialiser</button>
        </div>
      )}

      {/* Grouped list */}
      {[...grouped.entries()].map(([type, docs]) => (
        <section key={type} className="fg-docs-group">
          <div className="fg-docs-group__head">
            <h3>{typeLabel(type)}</h3>
            <span className="fg-docs-group__count">{docs.length} document{docs.length > 1 ? 's' : ''}</span>
          </div>
          <div className="fg-docs-list">
            {docs.map(d => <FgDocRow key={d.id} doc={d} fgData={D} projects={projects} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function FgDocRow({ doc, fgData, projects }) {
  const D = fgData;
  const brand = doc.brand ? D.brandById(doc.brand) : null;
  const project = doc.project && doc.project !== 'all' ? projects.find(p => p.id === doc.project) : null;
  const statusLabel = {
    validated: 'Validé', signed: 'Signé', pending: 'À signer',
    review: 'En revue', expired: 'Expiré', missing: 'Manquant'
  }[doc.status] || doc.status;
  const expiringSoon = doc.expiry && new Date(doc.expiry.split('/').reverse().join('-')) < new Date('2026-08-01');

  return (
    <div className={'fg-doc-row fg-doc-row--' + doc.status}>
      <div className="fg-doc-row__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6"/>
          <path d="M8 13h8M8 17h6"/>
        </svg>
      </div>
      <div className="fg-doc-row__main">
        <p className="fg-doc-row__title">{doc.title}</p>
        <p className="fg-doc-row__sub">
          {doc.sub}
          {brand && <span className="fg-doc-row__chip" style={{ background: brand.tokens.primary + '18', color: brand.tokens.primary }}>● {brand.name}</span>}
          {project && <span className="fg-doc-row__chip">{project.name}</span>}
        </p>
      </div>
      <div className="fg-doc-row__meta">
        {doc.date && <span>{doc.date}</span>}
        {doc.size && <span className="fg-doc-row__size">{doc.size}</span>}
        {doc.expiry && (
          <span className={'fg-doc-row__expiry' + (expiringSoon ? ' is-soon' : '')}>
            Expire {doc.expiry}
          </span>
        )}
      </div>
      <span className={'fg-doc-row__status fg-doc-row__status--' + doc.status}>
        <span className="fg-doc-row__status-dot"></span>{statusLabel}
      </span>
      <div className="fg-doc-row__actions">
        {doc.status === 'missing' ? (
          <button className="fg-btn fg-btn--accent fg-btn--sm">Déposer</button>
        ) : doc.status === 'pending' ? (
          <button className="fg-btn fg-btn--accent fg-btn--sm">Signer</button>
        ) : doc.status === 'expired' ? (
          <button className="fg-btn fg-btn--accent fg-btn--sm">Renouveler</button>
        ) : (
          <>
            <button className="fg-doc-row__icon-btn" title="Voir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button className="fg-doc-row__icon-btn" title="Télécharger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M5 10l7 7 7-7"/><path d="M5 21h14"/></svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ====================================================================
// IDENTITY TAB
// ====================================================================
function FgProfileIdentity({ fgData }) {
  const I = fgData.INVESTOR;
  const rows = [
    { label: 'Nom complet', value: I.name },
    { label: 'E-mail', value: I.email },
    { label: 'Téléphone', value: I.phone },
    { label: 'Adresse', value: I.address },
    { label: 'Nationalité', value: I.nationality },
    { label: 'IBAN remboursements', value: I.iban },
    { label: 'Identifiant investisseur', value: I.id },
    { label: 'Investisseur depuis', value: I.since }
  ];
  return (
    <div className="brand-card" style={{ marginTop: 8 }}>
      <div className="brand-card__head">
        <p className="brand-card__title">Identité & coordonnées</p>
        <p className="brand-card__sub">Modifications soumises à validation par l'équipe Franchise Generation</p>
      </div>
      <div className="fg-identity-grid">
        {rows.map((r, i) => (
          <div key={i} className="fg-identity-row">
            <span className="fg-identity-row__l">{r.label}</span>
            <span className="fg-identity-row__v">{r.value}</span>
            <button className="fg-doc-row__icon-btn" title="Modifier">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====================================================================
// PREFERENCES TAB
// ====================================================================
function FgProfilePreferences({ fgData }) {
  const prefs = fgData.INVESTOR_PREFERENCES;
  return (
    <div className="brand-card" style={{ marginTop: 8 }}>
      <div className="brand-card__head">
        <p className="brand-card__title">Préférences de notification</p>
        <p className="brand-card__sub">Choisissez les canaux et la fréquence des alertes Franchise Generation.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {prefs.map((p) => (
          <div key={p.id} className="fg-pref-row">
            <span>{p.label}</span>
            <span className={'fg-pref-pill' + (p.enabled ? ' is-on' : '')}>{p.enabled ? '● Activé' : '○ Désactivé'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { FgProfile });
