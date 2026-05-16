/* global React, window */
// Generic brand-scoped views — used for Couq, Cookie's & Milk, Mania Pizza.
// L'Atelier By has its own legacy views in portal-views.jsx; we route to
// those when scope === 'atelier'.

const { useState: bvUseState } = React;

// ====================================================================
// BRAND DASHBOARD (brand-level overview for any brand)
// ====================================================================
function BrandDashboard({ brand, goTo, fgData }) {
  const D = fgData;
  const port = D.BRAND_PORTFOLIOS[brand.id];
  if (!port) return null;
  const summary = port.summary;
  const expected = summary.invested * (1 + summary.roiTarget / 100 * 5);
  const ca = port.ca12m;
  const budget = port.budget12m;
  const lastCa = ca.at(-1);
  const lastBudget = budget.at(-1);
  const vsBudget = ((lastCa / lastBudget) - 1) * 100;
  const ytd = ca.reduce((a, b) => a + b, 0);
  const ytdBudget = budget.reduce((a, b) => a + b, 0);

  return (
    <div className="fg-content">
      {/* Brand hero — uses brand colors at full intensity */}
      <section className="brand-hero">
        <p className="brand-hero__eyebrow">Écosystème {brand.name}</p>
        <h1 className="brand-hero__h">{brand.name}</h1>
        <p className="brand-hero__sub">
          {brand.tagline} · Fondée en {brand.founded} · {brand.established}. {summary.networkSize} {summary.networkSize > 1 ? brand.copy.ecoNounPlural : brand.copy.ecoNoun} dans votre portefeuille.
        </p>
        <div className="brand-hero__metrics">
          <div>
            <p className="brand-hero__metric-label">Capital placé</p>
            <p className="brand-hero__metric-val">{D.fmtEur(summary.invested)}</p>
          </div>
          <div>
            <p className="brand-hero__metric-label">Valorisation</p>
            <p className="brand-hero__metric-val">{D.fmtEur(summary.valuation)}</p>
          </div>
          <div>
            <p className="brand-hero__metric-label">Remboursé</p>
            <p className="brand-hero__metric-val">{D.fmtEur(summary.repaid)}</p>
          </div>
          <div>
            <p className="brand-hero__metric-label">TRI cible / réel</p>
            <p className="brand-hero__metric-val">{summary.roiTarget.toFixed(1)} / {summary.roiCurrent.toFixed(1)} %</p>
          </div>
        </div>
      </section>

      {/* Performance vs budget */}
      <section className="fg-sec">
        <div className="fg-sec__head">
          <div>
            <h2 className="fg-sec__title">Performance — 12 derniers mois</h2>
            <p className="fg-sec__sub">Marque consolidée · CA réel vs budget</p>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: vsBudget >= 0 ? 'rgba(45,106,79,0.12)' : 'rgba(156,42,31,0.12)',
            color: vsBudget >= 0 ? '#2d6a4f' : '#9c2a1f',
            fontSize: 11, fontFamily: 'var(--brand-font-ui)', fontWeight: 500
          }}>
            Mois en cours · {vsBudget >= 0 ? '+' : ''}{vsBudget.toFixed(1)} % vs budget
          </span>
        </div>

        <div className="brand-card">
          <BrandCaBudgetChart ca={ca} budget={budget} brand={brand} />
          <div style={{ display: 'flex', gap: 24, marginTop: 16, paddingTop: 16, borderTop: '0.5px solid rgba(26,27,25,0.06)' }}>
            <div>
              <p className="brand-shop-card__kpi-l">CA cumulé 12m</p>
              <p className="brand-shop-card__kpi-v">{D.fmtEur(ytd)}</p>
            </div>
            <div>
              <p className="brand-shop-card__kpi-l">Budget cumulé</p>
              <p className="brand-shop-card__kpi-v">{D.fmtEur(ytdBudget)}</p>
            </div>
            <div>
              <p className="brand-shop-card__kpi-l">Écart cumulé</p>
              <p className="brand-shop-card__kpi-v" style={{ color: ytd >= ytdBudget ? '#2d6a4f' : '#9c2a1f' }}>
                {((ytd / ytdBudget - 1) * 100).toFixed(1)} %
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shops in this brand */}
      <section className="fg-sec">
        <div className="fg-sec__head">
          <div>
            <h2 className="fg-sec__title">Mes {brand.copy.ecoNounPlural} {brand.name}</h2>
            <p className="fg-sec__sub">{port.shops.length} {port.shops.length > 1 ? brand.copy.ecoNounPlural : brand.copy.ecoNoun} actif{port.shops.length > 1 ? 's' : ''} · cliquez pour ouvrir le détail</p>
          </div>
        </div>
        <div className="brand-shops">
          {port.shops.map(s => (
            <div key={s.id} className="brand-shop-card" onClick={() => goTo(brand.id, 'dashboard', s.id)}>
              <div className="brand-shop-card__head">
                <div>
                  <p className="brand-shop-card__city">{s.city} · ouvert {s.opened}</p>
                  <p className="brand-shop-card__name">{s.name.replace(brand.name + ' ', '')}</p>
                </div>
                <span className="brand-shop-card__pill">{s.kind}</span>
              </div>
              <div className="brand-shop-card__kpis">
                <div>
                  <p className="brand-shop-card__kpi-l">{brand.kpiLabels.ca}</p>
                  <p className="brand-shop-card__kpi-v">{D.fmtEur(s.kpiSnapshot.ca)}</p>
                </div>
                <div>
                  <p className="brand-shop-card__kpi-l">vs Budget</p>
                  <p className="brand-shop-card__kpi-v" style={{ color: s.kpiSnapshot.vsBudget >= 0 ? '#2d6a4f' : '#9c2a1f' }}>
                    {s.kpiSnapshot.vsBudget >= 0 ? '+' : ''}{s.kpiSnapshot.vsBudget.toFixed(1)} %
                  </p>
                </div>
                <div>
                  <p className="brand-shop-card__kpi-l">TRI réel</p>
                  <p className="brand-shop-card__kpi-v">{s.roiCurrent.toFixed(1)} %</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand opportunities */}
      <section className="fg-sec">
        <div className="fg-sec__head">
          <div>
            <h2 className="fg-sec__title">Opportunités {brand.name}</h2>
            <p className="fg-sec__sub">Projets {brand.name} en levée de fonds</p>
          </div>
          <button className="fg-sec__action" onClick={() => goTo('fg', 'opportunites')}>Marketplace globale →</button>
        </div>
        <div className="fg-tiles">
          {D.FG_OPPORTUNITIES.filter(o => o.brand === brand.id).map(o => {
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
                  <div className="fg-tile__progress">
                    <div className="fg-tile__progress-track">
                      <div className="fg-tile__progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="fg-tile__progress-legend">
                      <span>{D.fmtEur(o.raised)} levés · {progress.toFixed(0)} %</span>
                    </div>
                  </div>
                </div>
                <div className="fg-tile__foot">
                  <span>{o.city} · {o.kind}</span>
                  <span className="fg-tile__foot-cta">Manifester intérêt →</span>
                </div>
              </div>
            );
          })}
          {D.FG_OPPORTUNITIES.filter(o => o.brand === brand.id).length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', background: 'var(--brand-surface)', border: '0.5px solid rgba(26,27,25,0.10)', borderRadius: 10, fontFamily: 'var(--brand-font-ui)', fontSize: 13, color: 'rgba(26,27,25,0.55)' }}>
              Pas d'ouverture en cours pour {brand.name}. Activez les alertes pour être prévenue.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ====================================================================
// MINI CA vs Budget Chart (SVG, no chart lib dep)
// ====================================================================
function BrandCaBudgetChart({ ca, budget, brand }) {
  const w = 800, h = 220;
  const padX = 40, padY = 20;
  const max = Math.max(...ca, ...budget) * 1.1;
  const min = Math.min(...ca, ...budget) * 0.85;
  const xs = (i) => padX + (i / (ca.length - 1)) * (w - 2 * padX);
  const ys = (v) => padY + (1 - (v - min) / (max - min)) * (h - 2 * padY);
  const months = ['Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr'];
  const linePath = (data) => data.map((v, i) => (i === 0 ? 'M' : 'L') + xs(i) + ',' + ys(v)).join(' ');
  const areaPath = (data) => linePath(data) + ` L ${xs(data.length - 1)},${h - padY} L ${xs(0)},${h - padY} Z`;
  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 220, fontFamily: 'var(--brand-font-mono, JetBrains Mono, monospace)' }}>
        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={padX} x2={w - padX} y1={padY + t * (h - 2 * padY)} y2={padY + t * (h - 2 * padY)} stroke="rgba(26,27,25,0.06)" strokeWidth="0.5" />
        ))}
        {/* budget — dashed line */}
        <path d={linePath(budget)} fill="none" stroke="rgba(26,27,25,0.35)" strokeWidth="1.25" strokeDasharray="3 3" />
        {/* ca — filled area in brand primary */}
        <path d={areaPath(ca)} fill={brand.tokens.primary} fillOpacity="0.10" />
        <path d={linePath(ca)} fill="none" stroke={brand.tokens.primary} strokeWidth="2" />
        {/* points */}
        {ca.map((v, i) => (
          <circle key={i} cx={xs(i)} cy={ys(v)} r="2.5" fill={brand.tokens.primary} />
        ))}
        {/* x labels */}
        {months.map((m, i) => (
          <text key={i} x={xs(i)} y={h - 4} fontSize="9" fill="rgba(26,27,25,0.5)" textAnchor="middle">{m}</text>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 11, color: 'rgba(26,27,25,0.65)', fontFamily: 'var(--brand-font-ui)' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 2, background: brand.tokens.primary, marginRight: 6, verticalAlign: 'middle' }}></span>CA réel</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 2, background: 'rgba(26,27,25,0.35)', marginRight: 6, verticalAlign: 'middle', borderBottom: '1px dashed' }}></span>Budget</span>
      </div>
    </div>
  );
}

// ====================================================================
// BRAND SHOP DETAIL (per-shop view for any brand other than atelier)
// ====================================================================
function BrandShopDetail({ shop, brand, goTo, fgData }) {
  const D = fgData;
  const k = shop.kpiSnapshot;
  const expected = shop.invested * (1 + shop.roiTarget / 100 * 5);
  const progress = (shop.repaid / expected) * 100;

  return (
    <div className="fg-content">
      <button className="fg-btn fg-btn--ghost" onClick={() => goTo(brand.id, 'dashboard')} style={{ marginBottom: 16 }}>
        ← Retour à {brand.name}
      </button>

      <section className="brand-hero">
        <p className="brand-hero__eyebrow">{brand.name} · {shop.kind} · ouvert {shop.opened}</p>
        <h1 className="brand-hero__h">{shop.name.replace(brand.name + ' ', '')}</h1>
        <p className="brand-hero__sub">
          {shop.city} · Rang #{shop.networkRank}/{shop.networkTotal} dans le réseau {brand.name}.
          TRI cible {shop.roiTarget.toFixed(1)} % · réel {shop.roiCurrent.toFixed(1)} %.
        </p>
        <div className="brand-hero__metrics">
          <div>
            <p className="brand-hero__metric-label">{brand.kpiLabels.ca}</p>
            <p className="brand-hero__metric-val">{D.fmtEur(k.ca)}</p>
          </div>
          <div>
            <p className="brand-hero__metric-label">{brand.kpiLabels.profit}</p>
            <p className="brand-hero__metric-val">{k.profit.toFixed(1)} %</p>
          </div>
          <div>
            <p className="brand-hero__metric-label">{brand.kpiLabels.cust}</p>
            <p className="brand-hero__metric-val">{D.fmtNum(k.cust)}</p>
          </div>
          <div>
            <p className="brand-hero__metric-label">{brand.kpiLabels.basket}</p>
            <p className="brand-hero__metric-val">{D.fmtNum(k.basket, 1)} €</p>
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Consultant report */}
        <div className="brand-card">
          <div className="brand-card__head">
            <p className="brand-card__title">Reporting consultant</p>
            <p className="brand-card__sub">Dernière visite · {shop.consultant.lastVisit}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--brand-bg)', border: '0.5px solid rgba(26,27,25,0.10)',
              display: 'grid', placeItems: 'center', fontFamily: 'var(--brand-font-ui)',
              fontSize: 13, fontWeight: 500, color: 'var(--brand-ink)'
            }}>{shop.consultant.name.split(' ').map(s => s[0]).slice(0, 2).join('')}</div>
            <div>
              <div style={{ fontFamily: 'var(--brand-font-display)', fontSize: 15, color: 'var(--brand-ink)' }}>{shop.consultant.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(26,27,25,0.55)' }}>Consultant opérationnel · {brand.name}</div>
            </div>
            <span style={{
              marginLeft: 'auto', padding: '4px 10px', borderRadius: 999,
              background: 'rgba(45,106,79,0.12)', color: '#2d6a4f',
              fontSize: 11, fontWeight: 500
            }}>{brand.copy.verdict}</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--brand-ink)', margin: '0 0 16px' }}>{shop.consultant.summary}</p>
          <div style={{
            padding: 12, background: 'var(--brand-bg)',
            borderLeft: '2px solid var(--brand-primary)',
            borderRadius: '0 6px 6px 0'
          }}>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(26,27,25,0.55)', margin: '0 0 4px' }}>Action prioritaire</p>
            <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>{shop.consultant.action}</p>
          </div>
        </div>

        {/* Franchisee score */}
        <div className="brand-card">
          <div className="brand-card__head">
            <p className="brand-card__title">Scoring franchisé</p>
            <p className="brand-card__sub">Évaluation 360° · trim. en cours</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14, borderBottom: '0.5px solid rgba(26,27,25,0.06)', marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--brand-bg)', border: '0.5px solid rgba(26,27,25,0.10)',
              display: 'grid', placeItems: 'center', fontFamily: 'var(--brand-font-ui)',
              fontSize: 14, fontWeight: 500, color: 'var(--brand-ink)'
            }}>{shop.franchisee.name.split(' ').map(s => s[0]).slice(0, 2).join('')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--brand-font-display)', fontSize: 16, color: 'var(--brand-ink)' }}>{shop.franchisee.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(26,27,25,0.55)' }}>Franchisé(e) depuis {shop.franchisee.since}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: 'var(--brand-font-display)', fontSize: 28, color: 'var(--brand-primary)' }}>{shop.franchisee.overall.toFixed(1)}</span>
              <span style={{ fontSize: 11, color: 'rgba(26,27,25,0.55)', marginLeft: 2 }}>/ 5</span>
            </div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            border: '0.5px solid var(--brand-secondary)',
            color: 'var(--brand-secondary)', fontSize: 11, fontWeight: 500
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-secondary)' }}></span>
            Tier {shop.franchisee.tier}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(26,27,25,0.55)', fontStyle: 'italic', margin: '14px 0 0' }}>
            Méthodologie : pilotage P&L + engagement réseau + reporting + innovation produit.
          </p>
        </div>

        {/* Repayment + network position (wide) */}
        <div className="brand-card" style={{ gridColumn: '1 / -1' }}>
          <div className="brand-card__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
            <div>
              <p className="brand-card__title">Remboursement & position réseau</p>
              <p className="brand-card__sub">Capital investi {D.fmtEur(shop.invested)} · à percevoir {D.fmtEur(expected)} sur 5 ans</p>
            </div>
            <span style={{ fontFamily: 'var(--brand-font-display)', fontSize: 22 }}>{progress.toFixed(1)} %</span>
          </div>
          <div style={{ height: 8, background: 'rgba(26,27,25,0.08)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, progress)}%`, background: 'var(--brand-primary)' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'rgba(26,27,25,0.55)' }}>
            <span>{D.fmtEur(shop.repaid)} déjà versés</span>
            <span>{D.fmtEur(expected - shop.repaid)} restant · maturité 5 ans</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '0.5px solid rgba(26,27,25,0.06)' }}>
            <div>
              <p className="brand-shop-card__kpi-l">Rang réseau {brand.name}</p>
              <p className="brand-shop-card__kpi-v">#{shop.networkRank} / {shop.networkTotal}</p>
            </div>
            <div>
              <p className="brand-shop-card__kpi-l">TRI cible vs réel</p>
              <p className="brand-shop-card__kpi-v">{shop.roiTarget.toFixed(1)} → <span style={{ color: shop.roiCurrent >= shop.roiTarget ? '#2d6a4f' : '#9c6a1f' }}>{shop.roiCurrent.toFixed(1)} %</span></p>
            </div>
            <div>
              <p className="brand-shop-card__kpi-l">vs Budget mois</p>
              <p className="brand-shop-card__kpi-v" style={{ color: k.vsBudget >= 0 ? '#2d6a4f' : '#9c2a1f' }}>{k.vsBudget >= 0 ? '+' : ''}{k.vsBudget.toFixed(1)} %</p>
            </div>
            <div>
              <p className="brand-shop-card__kpi-l">Statut</p>
              <p className="brand-shop-card__kpi-v" style={{ color: '#2d6a4f' }}>● Sur trajectoire</p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="brand-card" style={{ gridColumn: '1 / -1' }}>
          <div className="brand-card__head">
            <p className="brand-card__title">Documents — {brand.name}</p>
            <p className="brand-card__sub">Contrat, rapport mensuel, attestations · spécifiques à ce {brand.copy.ecoNoun}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { kind: 'Contrat', title: 'Convention de prêt — ' + shop.name, date: shop.opened, action: 'Télécharger' },
              { kind: 'Rapport', title: 'Rapport mensuel · Avril 2026', date: '02/05/2026', action: 'Télécharger' },
              { kind: 'Fiscal', title: 'Attestation fiscale 2025', date: '15/02/2026', action: 'Télécharger' },
              { kind: 'Note', title: 'Note d\'évaluation consultant', date: shop.consultant.lastVisit, action: 'Lire' }
            ].map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 14, border: '0.5px solid rgba(26,27,25,0.10)', borderRadius: 8,
                background: 'var(--brand-bg)'
              }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(26,27,25,0.55)' }}>{d.kind}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(26,27,25,0.55)', marginTop: 2 }}>{d.date}</div>
                </div>
                <button className="fg-btn fg-btn--ghost" style={{ fontSize: 11 }}>{d.action}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// BRAND OPPORTUNITIES (brand-scoped marketplace)
// ====================================================================
function BrandOpportunities({ brand, goTo, fgData }) {
  const D = fgData;
  const opps = D.FG_OPPORTUNITIES.filter(o => o.brand === brand.id);
  return (
    <div className="fg-content">
      <section className="brand-hero">
        <p className="brand-hero__eyebrow">{brand.name} · Levées en cours</p>
        <h1 className="brand-hero__h">Opportunités {brand.name}</h1>
        <p className="brand-hero__sub">
          {opps.length} {opps.length > 1 ? 'projets' : 'projet'} en recherche de financement dans l'écosystème {brand.name}.
        </p>
      </section>

      <div className="fg-tiles">
        {opps.map(o => {
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
                <div><p className="fg-tile__kpi-label">Objectif</p><p className="fg-tile__kpi-val">{D.fmtEur(o.target)}</p></div>
                <div><p className="fg-tile__kpi-label">TRI cible</p><p className="fg-tile__kpi-val">{o.roiTarget.toFixed(1)} %</p></div>
                <div><p className="fg-tile__kpi-label">Ticket min</p><p className="fg-tile__kpi-val">{D.fmtEur(o.ticketMin)}</p></div>
                <div><p className="fg-tile__kpi-label">Payback</p><p className="fg-tile__kpi-val">{o.payback}</p></div>
                <div className="fg-tile__progress">
                  <div className="fg-tile__progress-track">
                    <div className="fg-tile__progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="fg-tile__progress-legend">
                    <span>{D.fmtEur(o.raised)} / {D.fmtEur(o.target)}</span>
                    <span>{progress.toFixed(0)} %</span>
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1', fontSize: 12, color: 'rgba(26,27,25,0.65)', fontStyle: 'italic', borderTop: '0.5px solid rgba(26,27,25,0.06)', paddingTop: 12 }}>
                  {o.concept}
                </div>
                <button className="fg-btn fg-btn--accent" style={{ gridColumn: '1 / -1' }}>Manifester intérêt</button>
              </div>
            </div>
          );
        })}
        {opps.length === 0 && (
          <div style={{
            gridColumn: '1 / -1', padding: 60, textAlign: 'center',
            background: 'var(--brand-surface)', border: '0.5px solid rgba(26,27,25,0.10)',
            borderRadius: 10, fontFamily: 'var(--brand-font-ui)', fontSize: 14, color: 'rgba(26,27,25,0.55)'
          }}>
            Aucune levée ouverte pour {brand.name} en ce moment.
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  BrandDashboard, BrandShopDetail, BrandOpportunities
});
