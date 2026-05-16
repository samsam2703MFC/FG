/* global window */
// L'Atelier Investor Portal — mock data + helpers (vanilla JS, no JSX).
// Loaded BEFORE the React scripts via plain <script src>.

(function () {
  'use strict';

  const fmtEur = (n, opts = {}) => {
    const d = opts.decimals ?? 0;
    return new Intl.NumberFormat('fr-BE', {
      style: 'currency', currency: 'EUR',
      minimumFractionDigits: d, maximumFractionDigits: d
    }).format(n);
  };
  const fmtNum = (n, d = 0) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const fmtPct = (n, d = 1) => `${n >= 0 ? '+' : ''}${fmtNum(n, d)}%`;
  const fmtPctRaw = (n, d = 1) => `${fmtNum(n, d)}%`;

  // ----- Projects ----------------------------------------------------------
  const PROJECTS = [
    {
      id: 'chatelain',
      name: 'L\'Atelier Châtelain',
      city: 'Bruxelles',
      kind: 'Boutique',
      illus: 'img/shop-2.png',
      opened: 'Mars 2024',
      invested: 75000,
      repaid: 28400,
      roiTarget: 8.4,
      roiCurrent: 9.1,
      maturityYears: 5,
      monthsElapsed: 14,
      totalMonths: 60,
      networkRank: 3, networkTotal: 47,
      health: 'good'
    },
    {
      id: 'sablon',
      name: 'L\'Atelier Sablon',
      city: 'Bruxelles',
      kind: 'Concept Store',
      illus: 'img/shop-1.png',
      opened: 'Septembre 2024',
      invested: 60000,
      repaid: 14200,
      roiTarget: 8.4,
      roiCurrent: 7.9,
      maturityYears: 5,
      monthsElapsed: 8,
      totalMonths: 60,
      networkRank: 11, networkTotal: 47,
      health: 'good'
    },
    {
      id: 'uccle',
      name: 'L\'Atelier Uccle',
      city: 'Bruxelles',
      kind: 'Boutique',
      illus: 'img/shop-1.png',
      opened: 'Janvier 2025',
      invested: 50000,
      repaid: 6700,
      roiTarget: 8.4,
      roiCurrent: 8.6,
      maturityYears: 5,
      monthsElapsed: 4,
      totalMonths: 60,
      networkRank: 14, networkTotal: 47,
      health: 'good'
    },
    {
      id: 'antwerpen',
      name: 'L\'Atelier Anvers',
      city: 'Antwerpen',
      kind: 'Boutique',
      illus: 'img/shop-3.png',
      opened: 'Juin 2023',
      invested: 90000,
      repaid: 41800,
      roiTarget: 8.4,
      roiCurrent: 8.8,
      maturityYears: 5,
      monthsElapsed: 23,
      totalMonths: 60,
      networkRank: 7, networkTotal: 47,
      health: 'good'
    },
    {
      id: 'liege',
      name: 'L\'Atelier Liège',
      city: 'Liège',
      kind: 'Pop-Up',
      illus: 'img/shop-2.png',
      opened: 'Mars 2025',
      invested: 35000,
      repaid: 3100,
      roiTarget: 7.0,
      roiCurrent: 6.2,
      maturityYears: 3,
      monthsElapsed: 2,
      totalMonths: 36,
      networkRank: 22, networkTotal: 47,
      health: 'warn'
    }
  ];

  // ----- KPI snapshots per project, last 12 months -------------------------
  // CA, FoodCost%, LabourCost%, ProfitNet%, Customers/day, BasketAvg
  function genSeries(base, drift, points = 12, jitter = 0.06) {
    const out = [];
    let cur = base;
    for (let i = 0; i < points; i++) {
      cur = cur * (1 + drift / points + (Math.random() - 0.5) * jitter);
      out.push(Math.round(cur));
    }
    return out;
  }
  // Use deterministic seeded values so refresh doesn't change numbers
  function seeded(seed) {
    let s = seed;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  function buildKpi(seed, basis) {
    const r = seeded(seed);
    const ca = []; const cust = []; const basket = []; const food = []; const labour = []; const profit = []; const budget = [];
    let curCa = basis.ca0;
    let curBudget = basis.budget0;
    for (let i = 0; i < 12; i++) {
      const seasonal = 1 + 0.08 * Math.sin(i / 12 * Math.PI * 2 - 1);
      const noise = 1 + (r() - 0.5) * 0.06;
      curCa = basis.ca0 * (1 + basis.growth * (i / 11)) * seasonal * noise;
      curBudget = basis.budget0 * (1 + basis.budgetGrowth * (i / 11)) * seasonal;
      ca.push(Math.round(curCa));
      budget.push(Math.round(curBudget));
      cust.push(Math.round(basis.cust0 * seasonal * (1 + (r() - 0.5) * 0.05)));
      basket.push(+(basis.basket0 * (1 + (r() - 0.5) * 0.03)).toFixed(2));
      food.push(+(basis.food0 + (r() - 0.5) * 1.6).toFixed(1));
      labour.push(+(basis.labour0 + (r() - 0.5) * 1.2).toFixed(1));
      profit.push(+(basis.profit0 + basis.profitDrift * (i / 11) + (r() - 0.5) * 1).toFixed(1));
    }
    return { ca, budget, cust, basket, food, labour, profit };
  }

  PROJECTS[0].kpi = buildKpi(11, { ca0: 92000, growth: 0.18, budget0: 88000, budgetGrowth: 0.10, cust0: 240, basket0: 12.6, food0: 28.4, labour0: 24.1, profit0: 17.8, profitDrift: 1.2 });
  PROJECTS[1].kpi = buildKpi(22, { ca0: 78000, growth: 0.12, budget0: 80000, budgetGrowth: 0.10, cust0: 195, basket0: 13.4, food0: 29.6, labour0: 25.2, profit0: 15.5, profitDrift: 0.8 });
  PROJECTS[2].kpi = buildKpi(33, { ca0: 64000, growth: 0.22, budget0: 60000, budgetGrowth: 0.18, cust0: 170, basket0: 12.1, food0: 27.9, labour0: 23.8, profit0: 18.2, profitDrift: 1.4 });
  PROJECTS[3].kpi = buildKpi(44, { ca0: 105000, growth: 0.10, budget0: 102000, budgetGrowth: 0.08, cust0: 280, basket0: 12.9, food0: 28.0, labour0: 24.4, profit0: 17.4, profitDrift: 0.6 });
  PROJECTS[4].kpi = buildKpi(55, { ca0: 48000, growth: 0.06, budget0: 54000, budgetGrowth: 0.10, cust0: 130, basket0: 11.4, food0: 31.2, labour0: 26.8, profit0: 11.9, profitDrift: -0.4 });

  // ----- Marketplace opportunities ----------------------------------------
  const OPPORTUNITIES = [
    {
      id: 'gent',
      name: 'L\'Atelier Gand',
      city: 'Gent',
      kind: 'Boutique',
      illus: 'img/bread-3.png',
      concept: 'Centre-ville. Surface 84 m². Ouverture prévue Q3 2026.',
      target: 320000,
      raised: 248000,
      ticketMin: 5000,
      roiTarget: 8.6,
      maturity: 5,
      closingDays: 18
    },
    {
      id: 'lille',
      name: 'L\'Atelier Lille',
      city: 'Lille (FR)',
      kind: 'Concept Store',
      illus: 'img/sweet-tart-small.png',
      concept: 'Premier ancrage en France. Format flagship 120 m².',
      target: 480000,
      raised: 142000,
      ticketMin: 10000,
      roiTarget: 9.2,
      maturity: 6,
      closingDays: 42
    },
    {
      id: 'namur',
      name: 'L\'Atelier Namur',
      city: 'Namur',
      kind: 'Pop-Up',
      illus: 'img/cupcake.png',
      concept: 'Pop-Up de saison à la Citadelle. Mai → Septembre.',
      target: 85000,
      raised: 71000,
      ticketMin: 2500,
      roiTarget: 7.4,
      maturity: 2,
      closingDays: 6
    },
    {
      id: 'rotterdam',
      name: 'L\'Atelier Rotterdam',
      city: 'Rotterdam (NL)',
      kind: 'Boutique',
      illus: 'img/bread-4.png',
      concept: 'Ouverture du 2e flagship aux Pays-Bas, Witte de Withstraat.',
      target: 380000,
      raised: 56000,
      ticketMin: 7500,
      roiTarget: 8.8,
      maturity: 5,
      closingDays: 64
    }
  ];

  // ----- Notifications ----------------------------------------------------
  const NOTIFS = [
    { id: 1, kind: 'payment', title: 'Remboursement reçu — L\'Atelier Châtelain', sub: '1 248 € versés sur votre compte (échéance Mai)', time: 'Il y a 2h', unread: true },
    { id: 2, kind: 'report', title: 'Rapport mensuel d\'avril disponible', sub: 'L\'Atelier Anvers · CA +12,3% vs budget', time: 'Hier', unread: true },
    { id: 3, kind: 'doc', title: 'Avenant au contrat à signer', sub: 'L\'Atelier Liège · prolongation de la phase Pop-Up', time: '3 jours', unread: true },
    { id: 4, kind: 'opp', title: 'Nouvelle opportunité : L\'Atelier Gand', sub: 'Ouverture Q3 2026 · TRI cible 8,6 %', time: '1 sem.', unread: false },
    { id: 5, kind: 'report', title: 'Rapport mensuel de mars disponible', sub: 'L\'Atelier Sablon · Performance conforme au plan', time: '1 sem.', unread: false },
    { id: 6, kind: 'payment', title: 'Remboursement reçu — L\'Atelier Anvers', sub: '1 870 € versés sur votre compte (échéance Avril)', time: '2 sem.', unread: false }
  ];

  // ----- Documents --------------------------------------------------------
  const DOCS = [
    { id: 'd1', kind: 'Contrat', title: 'Convention de prêt — L\'Atelier Châtelain', sub: 'Signé le 12 mars 2024 · DocuSign', size: '1,2 Mo', date: '12/03/2024', project: 'chatelain' },
    { id: 'd2', kind: 'Contrat', title: 'Convention de prêt — L\'Atelier Sablon', sub: 'Signé le 4 septembre 2024 · DocuSign', size: '1,1 Mo', date: '04/09/2024', project: 'sablon' },
    { id: 'd3', kind: 'Contrat', title: 'Convention de prêt — L\'Atelier Uccle', sub: 'Signé le 19 janvier 2025 · DocuSign', size: '1,2 Mo', date: '19/01/2025', project: 'uccle' },
    { id: 'd4', kind: 'Contrat', title: 'Convention de prêt — L\'Atelier Anvers', sub: 'Signé le 8 juin 2023 · DocuSign', size: '1,3 Mo', date: '08/06/2023', project: 'antwerpen' },
    { id: 'd5', kind: 'Avenant', title: 'Avenant n°1 — L\'Atelier Liège', sub: 'À signer · prolongation Pop-Up', size: '480 Ko', date: '02/05/2026', project: 'liege', pending: true },
    { id: 'd6', kind: 'Fiscal', title: 'Attestation fiscale 2025 — Tax shelter', sub: 'Tax shelter · exercice 2025', size: '320 Ko', date: '15/02/2026', project: 'all' },
    { id: 'd7', kind: 'Rapport', title: 'Rapport annuel 2025 du réseau', sub: 'Synthèse réseau anonymisée', size: '4,8 Mo', date: '20/03/2026', project: 'all' }
  ];

  // ----- Monthly reports --------------------------------------------------
  const REPORTS = [
    { month: 'Avril 2026', project: 'chatelain', highlight: '+12,4 % vs budget', status: 'on-track' },
    { month: 'Avril 2026', project: 'antwerpen', highlight: '+8,1 % vs budget', status: 'on-track' },
    { month: 'Avril 2026', project: 'sablon', highlight: 'Conforme au plan', status: 'on-track' },
    { month: 'Avril 2026', project: 'uccle', highlight: '+4,2 % vs budget', status: 'on-track' },
    { month: 'Avril 2026', project: 'liege', highlight: '−7,8 % vs budget', status: 'watch' },
    { month: 'Mars 2026', project: 'chatelain', highlight: '+9,6 % vs budget', status: 'on-track' },
    { month: 'Mars 2026', project: 'antwerpen', highlight: '+11,2 % vs budget', status: 'on-track' },
    { month: 'Mars 2026', project: 'sablon', highlight: '+2,4 % vs budget', status: 'on-track' },
    { month: 'Mars 2026', project: 'uccle', highlight: '+6,8 % vs budget', status: 'on-track' },
    { month: 'Mars 2026', project: 'liege', highlight: '−4,2 % vs budget', status: 'watch' }
  ];

  // ----- Repayment schedule (rolling) -------------------------------------
  function buildSchedule(project) {
    const total = project.totalMonths;
    const elapsed = project.monthsElapsed;
    const monthly = (project.invested * (1 + project.roiTarget / 100 * project.maturityYears)) / total;
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const out = [];
    const startYear = 2025;
    for (let i = elapsed - 3; i < elapsed + 6 && i < total; i++) {
      if (i < 0) continue;
      const m = months[i % 12];
      const y = startYear + Math.floor(i / 12);
      let status = 'paid';
      if (i === elapsed) status = 'due';
      else if (i > elapsed) status = 'future';
      out.push({ idx: i, label: `${m}. ${y}`, amount: Math.round(monthly), status });
    }
    return out;
  }

  // ----- Network ranking benchmarks (anonymized) -------------------------
  const BENCHMARKS = {
    ca:     { you: 102, avg: 100, top: 118, label: 'Chiffre d\'affaires (indice)' },
    food:   { you: 28.4, avg: 29.7, top: 26.5, label: 'Food cost', invert: true, suffix: '%' },
    labour: { you: 24.1, avg: 25.4, top: 22.8, label: 'Labour cost', invert: true, suffix: '%' },
    profit: { you: 17.8, avg: 16.1, top: 21.2, label: 'Profit net', suffix: '%' },
    cust:   { you: 240, avg: 218, top: 295, label: 'Clients / jour' },
    basket: { you: 12.6, avg: 11.9, top: 14.8, label: 'Panier moyen', suffix: ' €' }
  };

  // ----- Consultant reporting (per project) -------------------------------
  const CONSULTANT_REPORTS = {
    chatelain: {
      consultant: 'Émilie Dewael',
      role: 'Consultante opérationnelle · Réseau Bruxelles',
      lastVisit: '24 avril 2026',
      nextVisit: '22 mai 2026',
      verdict: 'on-track',
      summary: 'Dynamique commerciale solide. Équipe stable, hygiène irréprochable, service rapide en heure de pointe.',
      scores: [
        { label: 'Opérations',   value: 4.6 },
        { label: 'Hygiène HACCP', value: 4.9 },
        { label: 'Service client', value: 4.4 },
        { label: 'Gestion stock', value: 4.2 }
      ],
      action: 'Tester le créneau brunch le samedi pour absorber la file d\'attente.'
    },
    sablon: {
      consultant: 'Karim Boulahia',
      role: 'Consultant opérationnel · Réseau Bruxelles',
      lastVisit: '17 avril 2026',
      nextVisit: '15 mai 2026',
      verdict: 'on-track',
      summary: 'Concept store en phase de maturation. Le mix sucré/salé s\'équilibre, panier moyen en hausse régulière.',
      scores: [
        { label: 'Opérations',   value: 4.2 },
        { label: 'Hygiène HACCP', value: 4.7 },
        { label: 'Service client', value: 4.5 },
        { label: 'Gestion stock', value: 3.9 }
      ],
      action: 'Réduire la casse pâtisserie en fin de journée (–8 % visé).'
    },
    uccle: {
      consultant: 'Émilie Dewael',
      role: 'Consultante opérationnelle · Réseau Bruxelles',
      lastVisit: '02 mai 2026',
      nextVisit: '30 mai 2026',
      verdict: 'on-track',
      summary: 'Démarrage prometteur, fidélisation locale en construction. Travail à poursuivre sur la notoriété.',
      scores: [
        { label: 'Opérations',   value: 4.0 },
        { label: 'Hygiène HACCP', value: 4.6 },
        { label: 'Service client', value: 4.3 },
        { label: 'Gestion stock', value: 4.1 }
      ],
      action: 'Activer un partenariat avec 2 écoles du quartier pour le goûter.'
    },
    antwerpen: {
      consultant: 'Niels Vandenberg',
      role: 'Consultant opérationnel · Réseau Flandre',
      lastVisit: '21 avril 2026',
      nextVisit: '19 mai 2026',
      verdict: 'on-track',
      summary: 'Magasin pilote du réseau flamand. Excellente exécution, équipe formatrice pour les nouveaux franchisés.',
      scores: [
        { label: 'Opérations',   value: 4.8 },
        { label: 'Hygiène HACCP', value: 4.9 },
        { label: 'Service client', value: 4.7 },
        { label: 'Gestion stock', value: 4.5 }
      ],
      action: 'Documenter le process de prod du week-end pour réplication réseau.'
    },
    liege: {
      consultant: 'Sophie Renard',
      role: 'Consultante opérationnelle · Réseau Wallonie',
      lastVisit: '28 avril 2026',
      nextVisit: '12 mai 2026',
      verdict: 'watch',
      summary: 'Format Pop-Up sous tension. Trafic en deçà du plan, équipe en sous-effectif les week-ends.',
      scores: [
        { label: 'Opérations',   value: 3.4 },
        { label: 'Hygiène HACCP', value: 4.5 },
        { label: 'Service client', value: 3.8 },
        { label: 'Gestion stock', value: 3.6 }
      ],
      action: 'Plan d\'action 30 jours : 1 recrutement, refonte vitrine, push local.'
    }
  };

  // ----- Franchisee scoring (per project) ---------------------------------
  const FRANCHISEE_SCORES = {
    chatelain: {
      name: 'Florence Bonnet',
      since: 'Mars 2024',
      tier: 'Or',
      overall: 4.6,
      pillars: [
        { label: 'Pilotage P&L',     value: 4.7 },
        { label: 'Engagement réseau', value: 4.8 },
        { label: 'Reporting',         value: 4.5 },
        { label: 'Innovation produit', value: 4.4 }
      ]
    },
    sablon: {
      name: 'Marc Deschamps',
      since: 'Septembre 2024',
      tier: 'Argent',
      overall: 4.2,
      pillars: [
        { label: 'Pilotage P&L',     value: 4.0 },
        { label: 'Engagement réseau', value: 4.4 },
        { label: 'Reporting',         value: 4.3 },
        { label: 'Innovation produit', value: 4.1 }
      ]
    },
    uccle: {
      name: 'Anaïs Lefèvre',
      since: 'Janvier 2025',
      tier: 'Argent',
      overall: 4.1,
      pillars: [
        { label: 'Pilotage P&L',     value: 4.0 },
        { label: 'Engagement réseau', value: 4.3 },
        { label: 'Reporting',         value: 4.2 },
        { label: 'Innovation produit', value: 3.9 }
      ]
    },
    antwerpen: {
      name: 'Jeroen Maes',
      since: 'Juin 2023',
      tier: 'Or',
      overall: 4.7,
      pillars: [
        { label: 'Pilotage P&L',     value: 4.8 },
        { label: 'Engagement réseau', value: 4.9 },
        { label: 'Reporting',         value: 4.6 },
        { label: 'Innovation produit', value: 4.5 }
      ]
    },
    liege: {
      name: 'Thomas Gillet',
      since: 'Mars 2025',
      tier: 'Bronze',
      overall: 3.5,
      pillars: [
        { label: 'Pilotage P&L',     value: 3.2 },
        { label: 'Engagement réseau', value: 3.8 },
        { label: 'Reporting',         value: 3.6 },
        { label: 'Innovation produit', value: 3.4 }
      ]
    }
  };

  // ----- Expose -----------------------------------------------------------
  window.PORTAL_DATA = {
    PROJECTS, OPPORTUNITIES, NOTIFS, DOCS, REPORTS, BENCHMARKS,
    CONSULTANT_REPORTS, FRANCHISEE_SCORES,
    fmtEur, fmtNum, fmtPct, fmtPctRaw,
    buildSchedule
  };
})();
