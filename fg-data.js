/* global window */
// =============================================================
// Franchise Generation — API MOCK LAYER
// =============================================================
// This file is the single source of truth for ALL investor-facing data.
// In production every named export becomes a typed REST/GraphQL endpoint
// (or React Query hook). The UI never reads anything not exposed here.
//
//   BRANDS                  -> GET /brands
//   INVESTOR                -> GET /me
//   INVESTOR_PREFERENCES    -> GET /me/preferences
//   BRAND_PORTFOLIOS        -> GET /me/portfolio?brand=…
//   BRAND_PRESENTATION      -> GET /brands/:id/presentation (CMS-managed)
//   FG_OPPORTUNITIES        -> GET /opportunities
//   FG_NOTIFS               -> GET /me/notifications
//   FG_DOCS / DOC_TYPES     -> GET /me/documents
//   SUPPORT_*               -> GET /me/support/{tickets,categories,priorities}
//   SECTION_LABELS          -> GET /i18n/sections   (translatable)
//
// Everything that touches a brand identity (color, font, logo, KPI labels,
// franchise rules, tone of voice…) lives under BRANDS[].tokens or
// BRAND_PRESENTATION[brandId]. The UI is brand-agnostic: it renders
// whatever the API returns.
//
// portal-data.js extends window.FG_DATA with L'Atelier By's shop-level
// data (PROJECTS, KPI, REPORTS) — historical schema kept intact.
// =============================================================

(function () {
  'use strict';

  // ====================================================================
  // BRAND DESIGN SYSTEMS
  // Each brand declares its own tokens — colors, type, logo mark, copy
  // tone. The FG shell reads tokens.theme to apply a brand-themed shell
  // when the investor drills into a brand. Tokens are normalized to a
  // common contract so the generic brand views can render any brand.
  // ====================================================================

  const BRANDS = [
    {
      id: 'atelier',
      name: "L'Atelier By",
      tagline: 'Boulangerie de quartier · Belgique',
      kind: 'Boulangerie · Pâtisserie',
      city: 'Bruxelles',
      headquarters: 'Bruxelles, BE',
      founded: 2022,
      established: '5 magasins',
      logoSrc: 'img/logo.png',
      logoMark: 'A',                          // Letter mark fallback
      theme: 'atelier',                        // CSS class on shell
      tokens: {
        primary:   '#8D1D2C',
        secondary: '#F2C9A0',
        ink:       '#1c1a17',
        bg:        '#EAE4DC',
        surface:   '#FFFFFF',
        accent:    '#8D1D2C',
        fontDisplay: '"DM Sans", system-ui, sans-serif',
        fontUi:      '"DM Sans", system-ui, sans-serif',
        fontAccent:  '"DM Sans", system-ui, sans-serif'
      },
      kpiLabels: { ca: 'Chiffre d\'affaires', profit: 'Profit net', cust: 'Clients / jour', basket: 'Panier moyen' },
      copy: { ecoNoun: 'magasin', ecoNounPlural: 'magasins', verdict: 'Sur la trajectoire' }
    },
    {
      id: 'couq',
      name: 'Couq',
      tagline: 'Couques au beurre & boulangerie de quartier · Liège',
      kind: 'Boulangerie · Café',
      city: 'Liège',
      headquarters: 'Liège, BE',
      founded: 2024,
      established: '1 magasin · Saint-Géry en pré-ouverture',
      logoSrc: 'img/couq-logo.jpg',
      logoMark: 'C',
      theme: 'couq',
      tokens: {
        primary:   '#B8862E',        // Ocre forestier
        secondary: '#8B3A2A',        // Brique de Liège
        ink:       '#1A1612',        // Noir houille
        bg:        '#E8DCC0',        // Sarrasin
        surface:   '#F4EBD2',        // Sarrasin clair
        accent:    '#B8862E',
        fontDisplay: '"DM Sans", system-ui, sans-serif',
        fontUi:      '"DM Sans", system-ui, sans-serif',
        fontAccent:  '"DM Sans", system-ui, sans-serif'
      },
      kpiLabels: { ca: 'Ventes', profit: 'Marge nette', cust: 'Couverts / jour', basket: 'Ticket moyen' },
      copy: { ecoNoun: 'magasin', ecoNounPlural: 'magasins', verdict: 'Pilote validé' }
    },
    {
      id: 'cookies',
      name: "Cookie's & Milk",
      tagline: 'Cookies maison & lait frappé · Belgique',
      kind: 'Dessert bar · To-go',
      city: 'Liège',
      headquarters: 'Liège, BE',
      founded: 2024,
      established: '1 magasin pilote',
      logoSrc: null,
      logoMark: '◐',
      theme: 'cookies',
      tokens: {
        primary:   '#D98AA6',        // rose
        secondary: '#8B5A3C',        // baked
        ink:       '#3E2A28',
        bg:        '#FFF6EE',
        surface:   '#FFFFFF',
        accent:    '#8B5A3C',
        fontDisplay: '"DM Sans", system-ui, sans-serif',
        fontUi:      '"DM Sans", system-ui, sans-serif',
        fontAccent:  '"DM Sans", system-ui, sans-serif'
      },
      kpiLabels: { ca: 'Recettes', profit: 'Marge', cust: 'Visites / jour', basket: 'Ticket moyen' },
      copy: { ecoNoun: 'kiosque', ecoNounPlural: 'kiosques', verdict: 'Pilote — bons signaux' }
    },
    {
      id: 'mania',
      name: 'Mania Pizza',
      tagline: 'Pizza romaine al taglio · Mons',
      kind: 'Pizzeria · Slice bar',
      city: 'Mons',
      headquarters: 'Mons, BE',
      founded: 2024,
      established: '1 magasin · 2 en levée',
      logoSrc: null,
      logoMark: 'M',
      theme: 'mania',
      tokens: {
        primary:   '#C7212A',        // Italian red
        secondary: '#1E5435',        // basil
        ink:       '#0F0E0C',
        bg:        '#F4ECDD',
        surface:   '#FFFAF1',
        accent:    '#C7212A',
        fontDisplay: '"DM Sans", system-ui, sans-serif',
        fontUi:      '"DM Sans", system-ui, sans-serif',
        fontAccent:  '"DM Sans", system-ui, sans-serif'
      },
      kpiLabels: { ca: 'Ventes', profit: 'Marge nette', cust: 'Parts / jour', basket: 'Ticket moyen' },
      copy: { ecoNoun: 'pizzeria', ecoNounPlural: 'pizzerias', verdict: 'Lancement en cours' }
    }
  ];

  // ====================================================================
  // INVESTOR NOTIFICATION PREFERENCES  → GET /me/preferences
  // ====================================================================
  const INVESTOR_PREFERENCES = [
    { id: 'pay-email',     label: 'E-mail · versements reçus',                 channel: 'email', enabled: true  },
    { id: 'reports-email', label: 'E-mail · rapports mensuels par marque',     channel: 'email', enabled: true  },
    { id: 'docs-email',    label: 'E-mail · documents à signer',               channel: 'email', enabled: true  },
    { id: 'opps-email',    label: 'E-mail · nouvelles opportunités cross-marques', channel: 'email', enabled: false },
    { id: 'crit-sms',      label: 'SMS · alertes critiques uniquement',        channel: 'sms',   enabled: true  },
    { id: 'newsletter',    label: 'Newsletter trimestrielle Franchise Generation', channel: 'email', enabled: true  }
  ];

  // ====================================================================
  // I18N · SECTION LABELS  → GET /i18n/sections
  // ====================================================================
  const SECTION_LABELS = {
    dashboard:    'Tableau de bord',
    portfolio:    'Portefeuille',
    opportunites: 'Opportunités',
    documents:    'Documents',
    notifications:'Notifications',
    profil:       'Profil',
    magasins:     'Magasins',
    shops:        'Magasins',
    presentation: 'Présentation'
  };

  // ====================================================================
  // PUBLIC LANDING PAGE  → GET /landing  (CMS-managed copy & programs)
  // ====================================================================
  const LANDING = {
    hero: {
      eyebrow: 'Franchise Generation',
      title: 'The franchise ecosystem for ambitious brands, operators and investors.',
      sub: 'One structured platform that connects brands ready to scale, future franchisees ready to operate, and investors ready to back proven concepts.',
      primaryCta: { label: 'Investor login', action: 'login' },
      secondaryCta: { label: 'See how it works', action: 'about' }
    },
    whoAreYou: {
      title: 'Who are you?',
      sub: 'Five ways to enter the network — pick yours and we open the right door.',
      tiles: [
        {
          id: 'wru-candidate',
          eyebrow: 'I am a Candidate',
          title: 'Open an existing franchise',
          body: 'Je souhaite ouvrir une franchise existante avec une marque éprouvée.',
          ctaLabel: 'Discover opportunities',
          action: 'scroll-opps',
          tone: 'a',
          accent: '#0E5A5C'
        },
        {
          id: 'wru-brand',
          eyebrow: 'I am a Brand',
          title: 'Develop my brand into a network',
          body: 'Je possède déjà une marque et souhaite la déployer en franchise.',
          ctaLabel: 'Develop my brand',
          action: 'brand-application',
          tone: 'b',
          accent: '#1FB48C'
        },
        {
          id: 'wru-investor',
          eyebrow: 'I want to invest',
          title: 'Invest in a project or a brand',
          body: 'Je souhaite investir dans un magasin, une franchise ou une marque en développement.',
          ctaLabel: 'Discover investment opportunities',
          action: 'investor-onboarding',
          tone: 'e',
          accent: '#3a4030'
        },
        {
          id: 'wru-real-estate',
          eyebrow: 'I am a Real Estate Developer',
          title: 'Propose a location',
          body: 'Je possède des cellules commerciales ou des projets immobiliers à proposer au réseau.',
          ctaLabel: 'Propose a location',
          action: 'real-estate',
          tone: 'c',
          accent: '#8B5A3C'
        },
        {
          id: 'wru-creator',
          eyebrow: 'I want to create my own brand',
          title: 'Build a new concept',
          body: 'Je souhaite créer un nouveau concept avec accompagnement complet.',
          ctaLabel: 'Start my concept',
          action: 'new-brand-concept',
          tone: 'd',
          accent: '#9c2a1f'
        }
      ]
    },
    portals: [
      { id: 'brand',     label: 'Brand',     tooltip: 'Manage your network',           href: 'login.html?portal=brand' },
      { id: 'candidate', label: 'Candidate', tooltip: 'Open your franchise',           href: 'login.html?portal=candidate' },
      { id: 'investor',  label: 'Investor',  tooltip: 'Track your investments',        href: 'login.html?portal=investor' },
      { id: 'developer', label: 'Developer', tooltip: 'Propose locations & projects',  href: 'login.html?portal=developer' }
    ],
    investorOnboarding: {
      investmentTypes: [
        { id: 'shop',       label: 'Magasin existant' },
        { id: 'opening',    label: 'Nouvelle ouverture' },
        { id: 'brand',      label: 'Marque entière' },
        { id: 'real-estate', label: 'Immobilier commercial' }
      ],
      preferences: [
        { id: 'single',  label: 'Magasin unique' },
        { id: 'multi',   label: 'Multi-sites' },
        { id: 'whole',   label: 'Marque entière' },
        { id: 're',      label: 'Immobilier commercial' }
      ],
      involvement: [
        { id: 'passive',  label: 'Passif',           sub: 'Investissement financier · reporting trimestriel.' },
        { id: 'active',   label: 'Actif',            sub: 'Visites trimestrielles · participation au comité.' },
        { id: 'operator', label: 'Associé opérateur', sub: 'Engagement opérationnel ou présence terrain.' }
      ],
      budgets: ['Sous 25 000 €', '25 000 – 75 000 €', '75 000 – 150 000 €', '150 000 – 500 000 €', '500 000 €+']
    },
    currentOpportunities: {
      title: 'Current Opportunities',
      sub: 'Real openings, live financing rounds — apply in two clicks.',
      // Drawn from ONBOARDING_OPPORTUNITIES via the view layer; badges defined here
      badges: {
        'op-gent':         { label: 'INVESTOR READY', tone: 'green' },
        'op-namur-pizza':  { label: 'HOT',            tone: 'red' },
        'op-anvers-couq':  { label: 'NEW',            tone: 'blue' },
        'op-bxl-cookies':  { label: 'AVAILABLE',      tone: 'amber' }
      }
    },
    pillars: [
      { id: 'brands',     label: 'Brands',     value: '4',  foot: 'Active ecosystems' },
      { id: 'shops',      label: 'Shops',      value: '12', foot: 'Operated across the network' },
      { id: 'investors',  label: 'Investors',  value: '180+', foot: 'Backing the network' },
      { id: 'tri',        label: 'Avg target IRR', value: '8,4 %', foot: 'Across all brands' }
    ],
    join: {
      title: 'Join Franchise Generation',
      sub: 'We connect ambitious brands, future franchisees and investors inside one structured franchise ecosystem.',
      programs: [
        {
          id: 'brand',
          icon: 'brand',
          title: 'Are you a brand?',
          body: 'Join our ecosystem and structure your growth with franchise, investment, operations and development support.',
          ctaLabel: 'Join Us',
          ctaAction: 'brand-application',
          tone: 'primary'
        },
        {
          id: 'candidate',
          icon: 'shop',
          title: 'Do you want to open your own shop?',
          body: 'Apply as a future franchisee and start your onboarding journey with one of our partner brands.',
          ctaLabel: 'Start Onboarding',
          ctaAction: 'candidate-onboarding',
          tone: 'secondary'
        },
        {
          id: 'creator',
          icon: 'spark',
          title: 'Make Your Own Brand',
          body: 'You have an idea — or just the ambition. We co-build the concept, the brand, the operations and the network around it.',
          ctaLabel: 'Build With Us',
          ctaAction: 'new-brand-concept',
          tone: 'accent'
        }
      ]
    },
    finalCta: {
      eyebrow: 'Already onboard?',
      title: 'Access your investor portal',
      sub: 'Track your investments, review reports, sign documents and discover new opportunities across every brand.',
      ctaLabel: 'Investor login',
      ctaAction: 'login'
    },
    ecosystemTeaser: {
      eyebrow: 'Our ecosystem',
      title: 'A complete network, not just a brand.',
      sub: 'Production, logistics, suppliers, products, consultants, training, marketing and reporting — fully structured. You open. We handle the rest.',
      pillars: [
        { id: 'production',  label: 'Production' },
        { id: 'logistics',   label: 'Logistique' },
        { id: 'suppliers',   label: 'Fournisseurs' },
        { id: 'products',    label: 'Produits' },
        { id: 'consultants', label: 'Consultants' },
        { id: 'training',    label: 'Formation' },
        { id: 'marketing',   label: 'Marketing' },
        { id: 'finance',     label: 'Finance & reporting' }
      ],
      cta: { label: 'Explore the full ecosystem →', href: 'ecosystem.html' }
    }
  };

  // ====================================================================
  // REGIONS  → GET /regions
  // ====================================================================
  const REGIONS = [
    { id: 'bxl',     label: 'Bruxelles-Capitale' },
    { id: 'wal',     label: 'Wallonie' },
    { id: 'fla',     label: 'Flandre' },
    { id: 'fr-nord', label: 'France · Hauts-de-France' },
    { id: 'nl',      label: 'Pays-Bas' }
  ];

  // ====================================================================
  // ONBOARDING OPPORTUNITIES  → GET /opportunities/onboarding
  // Each is a candidate-facing project (open shop) with financing layout.
  // ====================================================================
  const ONBOARDING_OPPORTUNITIES = [
    {
      id: 'op-gent', brand: 'atelier', name: "L'Atelier Gand",
      city: 'Gent', region: 'fla', format: 'Boutique 84 m²',
      opening: 'Q3 2026', requiredInvest: 320000, candidateContrib: 60000,
      financingNeed: 'Tax shelter + prêt investisseur',
      payback: '4,8 ans', status: 'Closing imminent',
      description: 'Centre-ville Gand · emplacement validé, équipe identifiée. Ouverture sous 4 mois.',
      image: 'img/shop-1.png'
    },
    {
      id: 'op-namur-pizza', brand: 'mania', name: 'Mania Pizza Namur',
      city: 'Namur', region: 'wal', format: 'Pizzeria 95 m²',
      opening: 'Q3 2026', requiredInvest: 180000, candidateContrib: 35000,
      financingNeed: 'Prêt investisseur + apport candidat',
      payback: '4,2 ans', status: 'Co-investissement ouvert',
      description: 'Rue de Fer · zone passante. Recette validée, équipe à former.',
      image: 'img/shop-3.png'
    },
    {
      id: 'op-anvers-couq', brand: 'couq', name: 'Couq Anvers',
      city: 'Antwerpen', region: 'fla', format: 'Boulangerie 80 m²',
      opening: 'Q4 2026', requiredInvest: 240000, candidateContrib: 50000,
      financingNeed: 'Tax shelter + prêt investisseur',
      payback: '4,5 ans', status: 'En recherche candidat',
      description: 'Quartier Zuid · 1er Couq en Flandre. Bail négocié, travaux à planifier.',
      image: 'img/couq-logo.jpg'
    },
    {
      id: 'op-bxl-cookies', brand: 'cookies', name: "Cookie's & Milk Bruxelles",
      city: 'Bruxelles', region: 'bxl', format: 'Kiosque 38 m²',
      opening: 'Q4 2026', requiredInvest: 95000, candidateContrib: 18000,
      financingNeed: 'Apport candidat + prêt investisseur',
      payback: '5,1 ans', status: 'Pré-lancement',
      description: 'Galerie Toison d\'Or · format kiosque. Ticket d\'entrée le plus accessible.',
      image: 'img/shop-2.png'
    },
    {
      id: 'op-lille-atelier', brand: 'atelier', name: "L'Atelier Lille",
      city: 'Lille (FR)', region: 'fr-nord', format: 'Concept store 120 m²',
      opening: 'Q1 2027', requiredInvest: 480000, candidateContrib: 95000,
      financingNeed: 'Mix tax shelter + apport + prêt',
      payback: '5,2 ans', status: 'En recherche candidat',
      description: 'Premier ancrage en France. Format flagship 120 m² · zone hyper-centre.',
      image: 'img/shop-1.png'
    },
    {
      id: 'op-rdam-atelier', brand: 'atelier', name: "L'Atelier Rotterdam",
      city: 'Rotterdam', region: 'nl', format: 'Boutique 95 m²',
      opening: 'Q2 2027', requiredInvest: 380000, candidateContrib: 80000,
      financingNeed: 'Tax shelter + prêt investisseur',
      payback: '4,9 ans', status: 'En recherche candidat',
      description: 'Witte de Withstraat · 2e flagship aux Pays-Bas. Étude marché validée.',
      image: 'img/shop-2.png'
    }
  ];

  // ====================================================================
  // CANDIDATE LEAD PIPELINE  → GET /candidate-leads/steps
  // ====================================================================
  const LEAD_STEPS = [
    { id: 'interested',          label: 'Intérêt exprimé' },
    { id: 'consultant-review',   label: 'Revue consultant' },
    { id: 'first-contact-planned', label: '1er contact planifié' },
    { id: 'first-contact-done',  label: '1er contact réalisé' },
    { id: 'financing-precheck',  label: 'Pré-check financement' },
    { id: 'location-validation', label: 'Validation emplacement' },
    { id: 'business-plan',       label: 'Business plan' },
    { id: 'committee',           label: 'Comité de validation' },
    { id: 'contract-prep',       label: 'Préparation contrat' },
    { id: 'training-planning',   label: 'Planning formation' },
    { id: 'opening-planning',    label: 'Planning ouverture' }
  ];

  // ====================================================================
  // CANDIDATE LEADS (consultant-side + candidate-side)
  // → GET /candidate-leads
  // ====================================================================
  const CANDIDATE_LEADS = [
    {
      id: 'lead-001',
      candidate: { name: 'Marie Lemoine', email: 'marie.lemoine@example.com', phone: '+32 478 11 22 33', region: 'bxl', capital: '€75k – €150k' },
      opportunity: 'op-bxl-cookies',
      currentStep: 'first-contact-done',
      assignedTo: { name: 'Sophie Renard', role: 'Consultante · Réseau Bruxelles' },
      priority: 'high',
      source: 'Candidate opportunity carousel',
      createdAt: '12 mai 2026',
      lastUpdate: 'Aujourd\'hui · 09:24',
      notes: 'Profil très motivé. Expérience retail 8 ans · ex-store manager Decathlon.',
      nextAction: 'Pré-check financement bancaire · échéance 22/05',
      requestedDocuments: ['Pièce d\'identité', 'Justificatif de revenus 3 mois', 'Lettre de motivation'],
      appointments: [
        { kind: 'Visioconférence', when: '15 mai 2026 · 14:00', status: 'done' },
        { kind: 'Visite kiosque pilote · Liège', when: '24 mai 2026 · 10:30', status: 'planned' }
      ],
      messages: [
        { from: 'consultant', name: 'Sophie Renard', body: 'Bonjour Marie, merci pour votre candidature. Je vous propose un appel jeudi 14:00 — ça vous va ?', time: '13 mai · 10:15' },
        { from: 'candidate', name: 'Marie Lemoine', body: 'Parfait, je confirme jeudi 14h. À très vite.', time: '13 mai · 14:42' },
        { from: 'consultant', name: 'Sophie Renard', body: 'Super échange tout à l\'heure. Je vous envoie la liste des documents à préparer pour le pré-check financement.', time: '15 mai · 15:08' }
      ],
      history: [
        { step: 'interested',          at: '12 mai 2026', by: 'Candidate' },
        { step: 'consultant-review',   at: '12 mai 2026', by: 'Système · attribution Sophie Renard' },
        { step: 'first-contact-planned', at: '13 mai 2026', by: 'Sophie Renard' },
        { step: 'first-contact-done',  at: '15 mai 2026', by: 'Sophie Renard' }
      ]
    },
    {
      id: 'lead-002',
      candidate: { name: 'Karim Bensaïd', email: 'k.bensaid@example.com', phone: '+32 471 88 22 19', region: 'wal', capital: '€25k – €75k' },
      opportunity: 'op-namur-pizza',
      currentStep: 'consultant-review',
      assignedTo: { name: 'Karim Boulahia', role: 'Consultant · Réseau Wallonie' },
      priority: 'normal',
      source: 'Candidate opportunity carousel',
      createdAt: '14 mai 2026',
      lastUpdate: 'Hier · 16:48',
      notes: 'Candidat en reconversion. À approfondir sur la capacité opérationnelle.',
      nextAction: 'Premier appel à planifier · cette semaine',
      requestedDocuments: ['CV à jour', 'Justificatif de revenus'],
      appointments: [],
      messages: [
        { from: 'consultant', name: 'Karim Boulahia', body: 'Bonjour Karim, votre profil a été reçu. Je vous propose un appel cette semaine — créneaux disponibles ?', time: '14 mai · 17:00' }
      ],
      history: [
        { step: 'interested',        at: '14 mai 2026', by: 'Candidate' },
        { step: 'consultant-review', at: '14 mai 2026', by: 'Système · attribution Karim Boulahia' }
      ]
    },
    {
      id: 'lead-003',
      candidate: { name: 'Sophie Vermeulen', email: 's.vermeulen@example.com', phone: '+32 495 33 44 55', region: 'fla', capital: '€150k+' },
      opportunity: 'op-anvers-couq',
      currentStep: 'committee',
      assignedTo: { name: 'Lara Wauters', role: 'Consultante · Couq' },
      priority: 'high',
      source: 'Candidate opportunity carousel',
      createdAt: '02 mai 2026',
      lastUpdate: 'Il y a 3h',
      notes: 'Dossier solide. Expérience F&B confirmée, financement validé. À présenter au comité du 24/05.',
      nextAction: 'Comité validation · 24 mai',
      requestedDocuments: ['BP finalisé', 'Engagement bancaire'],
      appointments: [
        { kind: 'Comité de validation', when: '24 mai 2026 · 09:00', status: 'planned' }
      ],
      messages: [
        { from: 'consultant', name: 'Lara Wauters', body: 'Bonjour Sophie, votre dossier est complet. Nous le présentons au comité le 24 mai. Je vous tiens informée.', time: '15 mai · 11:00' }
      ],
      history: [
        { step: 'interested',          at: '02 mai 2026', by: 'Candidate' },
        { step: 'consultant-review',   at: '02 mai 2026', by: 'Système' },
        { step: 'first-contact-planned', at: '03 mai 2026', by: 'Lara Wauters' },
        { step: 'first-contact-done',  at: '06 mai 2026', by: 'Lara Wauters' },
        { step: 'financing-precheck',  at: '09 mai 2026', by: 'Lara Wauters' },
        { step: 'location-validation', at: '12 mai 2026', by: 'Lara Wauters' },
        { step: 'business-plan',       at: '15 mai 2026', by: 'Lara Wauters' },
        { step: 'committee',           at: '16 mai 2026', by: 'Système' }
      ]
    }
  ];

  // ====================================================================
  // CANDIDATE PROFILES  → GET /candidates
  // A candidate can be linked to multiple leads/opportunities.
  // Workflow can only start once at least one opportunity has been
  // VALIDATED by the consultant during the pre-analysis stage.
  // ====================================================================
  const OPP_VALIDATION_STATUSES = [
    { id: 'to-analyse',     label: 'À analyser',           tone: 'neutral' },
    { id: 'in-discussion',  label: 'En discussion',        tone: 'info' },
    { id: 'recommended',    label: 'Opportunité recommandée', tone: 'warning' },
    { id: 'validated',      label: 'Validée pour lancement', tone: 'success' },
    { id: 'rejected',       label: 'Refusée',              tone: 'danger' },
    { id: 'on-hold',        label: 'Mise en attente',      tone: 'muted' }
  ];

  const CANDIDATES = [
    {
      id: 'cand-001',
      // Identity
      firstName: 'Marie', lastName: 'Lemoine',
      email: 'marie.lemoine@example.com',
      phone: '+32 478 11 22 33',
      address: 'Avenue Louise 142 · 1050 Bruxelles',
      preferredRegion: 'bxl',
      language: 'Français · Néerlandais (B2) · Anglais (C1)',
      // Career
      experience: 'Store Manager Decathlon Bruxelles (5 ans) · Assistante manager Carrefour (3 ans)',
      currentSituation: 'En poste · disponible à 3 mois',
      motivation: 'Envie d\'entreprendre dans un cadre structuré. Passion produit, fibre managériale.',
      // Finance
      budget: 75000,
      financingCapacity: 'Apport personnel + prêt bancaire pré-accepté (BNP Fortis) jusqu\'à 150 000 €.',
      // Preferences
      brandPreference: ['cookies', 'couq'],
      locationPreference: 'Bruxelles centre-ville · Ixelles · Etterbeek',
      // Internal
      internalNotes: 'Profil très solide, lien fort possible avec Cookie\'s & Milk. À présenter au comité après validation BP.',
      generalStatus: 'En pré-analyse',
      createdAt: '12 mai 2026',
      // Multiple opportunities — leads
      opportunities: [
        {
          id: 'opp-link-001',
          opportunityId: 'op-bxl-cookies',
          brand: 'cookies',
          projectType: 'Kiosque',
          location: 'Bruxelles · Galerie Toison d\'Or',
          validationStatus: 'recommended',
          fitScore: 92,
          consultantNotes: 'Très bon match. Budget aligné, expérience retail forte, localisation cohérente.',
          documents: ['CV', 'Lettre de motivation', 'Pré-accord bancaire'],
          history: [
            { at: '12 mai 2026', author: 'Système',        body: 'Intérêt exprimé via le carousel d\'opportunités.' },
            { at: '13 mai 2026', author: 'Sophie Renard',  body: '1er appel · candidate motivée, profil très adapté.' },
            { at: '15 mai 2026', author: 'Sophie Renard',  body: 'Pré-check financement validé · pré-accord bancaire fourni.' }
          ]
        },
        {
          id: 'opp-link-002',
          opportunityId: 'op-anvers-couq',
          brand: 'couq',
          projectType: 'Boulangerie',
          location: 'Antwerpen · Quartier Zuid',
          validationStatus: 'in-discussion',
          fitScore: 68,
          consultantNotes: 'Match correct mais éloignement géographique. À discuter — la candidate vit à Bruxelles.',
          documents: ['CV'],
          history: [
            { at: '13 mai 2026', author: 'Marie Lemoine',  body: 'A demandé spontanément à voir cette opportunité aussi.' },
            { at: '14 mai 2026', author: 'Sophie Renard',  body: 'Discussion en cours sur la mobilité. À trancher avec elle.' }
          ]
        },
        {
          id: 'opp-link-003',
          opportunityId: 'op-namur-pizza',
          brand: 'mania',
          projectType: 'Pizzeria',
          location: 'Namur · Rue de Fer',
          validationStatus: 'on-hold',
          fitScore: 41,
          consultantNotes: 'Profil moins adapté · pas de fibre F&B opérationnelle, budget en-dessous du contribuable nécessaire.',
          documents: [],
          history: [
            { at: '14 mai 2026', author: 'Sophie Renard',  body: 'Mise en attente · à reconsidérer si les options Cookie\'s tombent.' }
          ]
        }
      ]
    },
    {
      id: 'cand-002',
      firstName: 'Karim', lastName: 'Bensaïd',
      email: 'k.bensaid@example.com',
      phone: '+32 471 88 22 19',
      address: 'Rue de Bruxelles 45 · 5000 Namur',
      preferredRegion: 'wal',
      language: 'Français · Anglais (B2)',
      experience: 'Cadre commercial 8 ans · reconversion en cours.',
      currentSituation: 'En reconversion · disponible immédiatement',
      motivation: 'Quitter le salariat pour entreprendre en franchise · attirance pour la restauration rapide.',
      budget: 45000,
      financingCapacity: 'Apport personnel + recherche prêt à hauteur de 100 000 €.',
      brandPreference: ['mania', 'atelier'],
      locationPreference: 'Namur · Charleroi · Liège',
      internalNotes: 'Profil à approfondir sur la capacité opérationnelle terrain.',
      generalStatus: 'À analyser',
      createdAt: '14 mai 2026',
      opportunities: [
        {
          id: 'opp-link-101',
          opportunityId: 'op-namur-pizza',
          brand: 'mania',
          projectType: 'Pizzeria',
          location: 'Namur · Rue de Fer',
          validationStatus: 'to-analyse',
          fitScore: 64,
          consultantNotes: 'Localisation parfaite. À valider sur l\'expérience F&B et le tour de table financier.',
          documents: ['CV'],
          history: [
            { at: '14 mai 2026', author: 'Système', body: 'Intérêt exprimé via le carousel d\'opportunités.' }
          ]
        }
      ]
    }
  ];

  // ====================================================================
  // DEVELOPERS (real estate partners) → GET /developers
  // ====================================================================
  const DEVELOPERS = [
    {
      id: 'dev-001',
      name: 'Immobilière Belge SA',
      contactName: 'Jean-Luc Fontaine',
      email: 'jl.fontaine@immobel.be',
      phone: '+32 2 345 67 89',
      type: 'Promoteur institutionnel',
      status: 'active',
      locations: [
        { id: 'loc-001', address: 'Chaussée de Charleroi 200, 1060 Bruxelles', city: 'Bruxelles', surface: '85 m²', type: 'Cellule commerciale rez', availability: '2026-09-01', rent: 2800, notes: 'Angle rue · forte visibilité piétonne', status: 'available' },
      ]
    },
    {
      id: 'dev-002',
      name: 'Retail Spaces BV',
      contactName: 'Dirk Van Meerbeek',
      email: 'd.vanmeerbeek@retailspaces.be',
      phone: '+32 3 456 78 90',
      type: 'Gestionnaire patrimonial',
      status: 'active',
      locations: [
        { id: 'loc-002', address: 'Nationalestraat 88, 2000 Antwerpen', city: 'Antwerpen', surface: '72 m²', type: 'Cellule en galerie', availability: '2026-07-01', rent: 3200, notes: 'Dans galerie piétonne · trafic 12k/jour', status: 'under-review' },
      ]
    },
    {
      id: 'dev-003',
      name: 'Centr\'Im',
      contactName: 'Sophie Maes',
      email: 's.maes@centrim.be',
      phone: '+32 71 234 56 78',
      type: 'Promoteur regional',
      status: 'active',
      locations: [
        { id: 'loc-003', address: 'Rue de la Montagne 14, 6000 Charleroi', city: 'Charleroi', surface: '110 m²', type: 'Cellule centre-ville', availability: '2026-10-01', rent: 1900, notes: 'Rue piétonne centrale · fort flux', status: 'available' },
        { id: 'loc-004', address: 'Place de la Digue 3, 5000 Namur', city: 'Namur', surface: '95 m²', type: 'Rez galerie', availability: '2026-08-15', rent: 2100, notes: 'Galerie couverte · parking 400 places', status: 'available' },
      ]
    },
  ];

  // NEW BRAND / CONCEPT LEADS  → POST /consultant/new-brand-leads
  // Submitted from landing "Make Your Own Brand" CTA, routed to the
  // consultant portal under a dedicated "New Brand Concepts" section.
  // ====================================================================
  const CONCEPT_TYPES = [
    { id: 'bakery',     label: 'Boulangerie' },
    { id: 'coffee',     label: 'Coffee shop' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'foodcourt',  label: 'Food court' },
    { id: 'retail',     label: 'Retail' },
    { id: 'other',      label: 'Autre' }
  ];

  const NEW_BRAND_LEADS = [
    {
      id: 'nbl-001',
      candidate: { name: 'Léa Dupuis', email: 'lea.dupuis@example.com', phone: '+32 471 22 33 44' },
      projectName: 'Maison Ortie',
      conceptType: 'bakery',
      location: 'Bruxelles · Châtelain',
      budget: 95000,
      description: 'Boulangerie végétale autour des plantes locales et des céréales anciennes belges. Pain levé long + boutique d\'épicerie de quartier.',
      inspirations: 'Bourke Street Bakery, Maison Aleph, Du Pain et des Idées.',
      attachments: ['mood-board.pdf'],
      status: 'to-analyse',
      assignedTo: 'Sam Verheyden · Brand strategy',
      createdAt: '14 mai 2026'
    },
    {
      id: 'nbl-002',
      candidate: { name: 'Tom Janssen', email: 'tom.janssen@example.com', phone: '+32 478 55 88 22' },
      projectName: 'Stir',
      conceptType: 'coffee',
      location: 'Antwerpen · Zuid',
      budget: 65000,
      description: 'Coffee bar single-origin avec lab pâtisserie maison. Service rapide, retail beans et un comptoir de degustation.',
      inspirations: 'Blue Bottle, Hard Beans.',
      attachments: [],
      status: 'in-discussion',
      assignedTo: 'Loïc Verheyden · Assistance Manager',
      createdAt: '12 mai 2026'
    }
  ];

  // ====================================================================
  // INVESTOR PROFILE
  // ====================================================================
  const INVESTOR = {
    id: 'inv_001',
    name: 'Claire Vermeulen',
    initials: 'CV',
    since: 'Juin 2023',
    email: 'claire.vermeulen@example.com',
    role: 'Investisseur particulier',
    tier: 'Privilège',
    phone: '+32 477 12 34 56',
    address: 'Avenue Louise 142 · 1050 Bruxelles',
    nationality: 'Belge',
    iban: 'BE68 5390 0754 7034'
  };

  // ====================================================================
  // INVESTOR DOCUMENTS (cross-brand, typed, statused)
  // Lives in profile only — not in sidebar.
  // ====================================================================
  const DOC_TYPES = [
    { id: 'investment', label: 'Documents d\'investissement' },
    { id: 'ownership',  label: 'Documents de propriété' },
    { id: 'kyc',        label: 'KYC' },
    { id: 'aml',        label: 'AML' },
    { id: 'banking',    label: 'Documents bancaires' },
    { id: 'tax',        label: 'Documents fiscaux' },
    { id: 'contract',   label: 'Contrats' },
    { id: 'schedule',   label: 'Échéanciers' },
    { id: 'statement',  label: 'Relevés' }
  ];

  // status: 'validated' | 'pending' | 'expired' | 'missing' | 'signed' | 'review'
  const FG_DOCS = [
    // KYC / AML / Banking — investor-level
    { id: 'd-kyc-id',     type: 'kyc',     brand: null, project: null, title: 'Pièce d\'identité — Carte d\'identité belge', sub: 'Recto + verso', date: '15/06/2023', expiry: '15/06/2033', status: 'validated', size: '2,4 MB' },
    { id: 'd-kyc-addr',   type: 'kyc',     brand: null, project: null, title: 'Justificatif de domicile', sub: 'Composition de ménage · Commune Ixelles', date: '15/06/2023', expiry: '15/06/2026', status: 'expired', size: '320 KB' },
    { id: 'd-aml-decl',   type: 'aml',     brand: null, project: null, title: 'Déclaration d\'origine des fonds', sub: 'Formulaire AML signé', date: '20/06/2023', expiry: null, status: 'validated', size: '180 KB' },
    { id: 'd-aml-pep',    type: 'aml',     brand: null, project: null, title: 'Déclaration PEP / sanctions', sub: 'Annuel · 2026', date: '15/01/2026', expiry: '15/01/2027', status: 'validated', size: '120 KB' },
    { id: 'd-bank-iban',  type: 'banking', brand: null, project: null, title: 'Attestation bancaire IBAN', sub: 'BE68 53.. · BNP Paribas Fortis', date: '15/06/2023', expiry: null, status: 'validated', size: '95 KB' },
    { id: 'd-bank-rib',   type: 'banking', brand: null, project: null, title: 'RIB — versements & remboursements', sub: 'Mis à jour 02/2026', date: '12/02/2026', expiry: null, status: 'validated', size: '180 KB' },

    // Ownership — investor profile
    { id: 'd-own-shares', type: 'ownership', brand: null, project: null, title: 'Récapitulatif de portefeuille', sub: 'Édition trimestrielle · Q1 2026', date: '05/04/2026', expiry: null, status: 'validated', size: '1,1 MB' },
    { id: 'd-own-cert',   type: 'ownership', brand: null, project: null, title: 'Attestation de participation', sub: 'Toutes marques · 2025', date: '15/01/2026', expiry: null, status: 'validated', size: '420 KB' },

    // Tax — global
    { id: 'd-tax-2025',   type: 'tax',     brand: null, project: null, title: 'Attestation fiscale 2025', sub: 'Tax shelter · exercice 2025', date: '15/02/2026', expiry: null, status: 'validated', size: '320 KB' },
    { id: 'd-tax-recap',  type: 'tax',     brand: null, project: null, title: 'Récapitulatif intérêts perçus 2025', sub: 'Déclaration IPP · case 1156', date: '15/02/2026', expiry: null, status: 'validated', size: '210 KB' },

    // Per-investment — Atelier
    { id: 'd-c-chat',   type: 'contract',   brand: 'atelier', project: 'chatelain', title: "Convention de prêt — L'Atelier Châtelain", sub: 'Signé DocuSign le 12/03/2024', date: '12/03/2024', expiry: '12/03/2029', status: 'signed',   size: '1,2 MB' },
    { id: 'd-c-sab',    type: 'contract',   brand: 'atelier', project: 'sablon',    title: "Convention de prêt — L'Atelier Sablon",   sub: 'Signé DocuSign le 04/09/2024', date: '04/09/2024', expiry: '04/09/2029', status: 'signed',   size: '1,1 MB' },
    { id: 'd-c-ucc',    type: 'contract',   brand: 'atelier', project: 'uccle',     title: "Convention de prêt — L'Atelier Uccle",    sub: 'Signé DocuSign le 19/01/2025', date: '19/01/2025', expiry: '19/01/2030', status: 'signed',   size: '1,2 MB' },
    { id: 'd-c-anv',    type: 'contract',   brand: 'atelier', project: 'antwerpen', title: "Convention de prêt — L'Atelier Anvers",   sub: 'Signé DocuSign le 08/06/2023', date: '08/06/2023', expiry: '08/06/2028', status: 'signed',   size: '1,3 MB' },
    { id: 'd-c-lie',    type: 'contract',   brand: 'atelier', project: 'liege',     title: "Convention de prêt — L'Atelier Liège",    sub: 'Avenant n°1 à signer · prolongation Pop-Up', date: '02/05/2026', expiry: null,  status: 'pending', size: '480 KB' },
    { id: 'd-s-chat',   type: 'schedule',   brand: 'atelier', project: 'chatelain', title: 'Échéancier de remboursement — Châtelain', sub: 'Tableau d\'amortissement 60 mois', date: '12/03/2024', expiry: null, status: 'validated', size: '180 KB' },
    { id: 'd-s-anv',    type: 'schedule',   brand: 'atelier', project: 'antwerpen', title: 'Échéancier de remboursement — Anvers',    sub: 'Tableau d\'amortissement 60 mois', date: '08/06/2023', expiry: null, status: 'validated', size: '180 KB' },
    { id: 'd-rep-apr',  type: 'statement',  brand: 'atelier', project: 'all',       title: 'Relevé mensuel — Avril 2026',             sub: 'Versements & intérêts cumulés', date: '02/05/2026', expiry: null, status: 'validated', size: '240 KB' },
    { id: 'd-rep-mar',  type: 'statement',  brand: 'atelier', project: 'all',       title: 'Relevé mensuel — Mars 2026',              sub: 'Versements & intérêts cumulés', date: '02/04/2026', expiry: null, status: 'validated', size: '240 KB' },

    // Per-investment — Couq
    { id: 'd-c-couqchat', type: 'contract', brand: 'couq', project: 'couq-chatelain', title: 'Convention de prêt — Couq Châtelain',   sub: 'Signé DocuSign le 04/06/2024', date: '04/06/2024', expiry: '04/06/2029', status: 'signed', size: '980 KB' },
    { id: 'd-c-couqsg',   type: 'contract', brand: 'couq', project: 'couq-saintgery', title: 'Convention de prêt — Couq Saint-Géry',  sub: 'Signé DocuSign le 18/12/2024', date: '18/12/2024', expiry: '18/12/2029', status: 'signed', size: '1,0 MB' },
    { id: 'd-s-couqchat', type: 'schedule', brand: 'couq', project: 'couq-chatelain', title: 'Échéancier — Couq Châtelain',          sub: 'Tableau d\'amortissement 60 mois', date: '04/06/2024', expiry: null, status: 'validated', size: '160 KB' },

    // Per-investment — Cookies
    { id: 'd-c-coook',  type: 'contract', brand: 'cookies', project: 'cookies-outremeuse', title: "Convention de prêt — Cookie's Outremeuse", sub: 'Signé DocuSign le 02/09/2025', date: '02/09/2025', expiry: '02/09/2030', status: 'signed', size: '920 KB' },

    // Per-investment — Mania
    { id: 'd-c-mania',  type: 'contract', brand: 'mania', project: 'mania-mons', title: 'Convention de prêt — Mania Pizza Mons', sub: 'Signé DocuSign le 03/10/2025', date: '03/10/2025', expiry: '03/10/2030', status: 'signed', size: '1,1 MB' },
    { id: 'd-s-mania',  type: 'schedule', brand: 'mania', project: 'mania-mons', title: 'Échéancier — Mania Pizza Mons', sub: 'Tableau d\'amortissement 60 mois', date: '03/10/2025', expiry: null, status: 'validated', size: '170 KB' },

    // Investment deck snapshots (when investor expressed interest)
    { id: 'd-i-gent',   type: 'investment', brand: 'atelier', project: null, title: "Memorandum d'investissement — L'Atelier Gand", sub: 'Q3 2026 · pré-engagement', date: '02/04/2026', expiry: null, status: 'validated', size: '2,4 MB' },
    { id: 'd-i-namur',  type: 'investment', brand: 'mania',   project: null, title: 'Memorandum d\'investissement — Mania Pizza Namur', sub: 'Closing 12j', date: '10/05/2026', expiry: null, status: 'validated', size: '2,1 MB' },

    // Missing docs (incomplete profile)
    { id: 'd-m-resi',   type: 'kyc',     brand: null, project: null, title: 'Justificatif de domicile — renouvellement', sub: 'Document expiré · à renouveler', date: null, expiry: null, status: 'missing', size: null }
  ];

  // ====================================================================
  // GENERIC BRAND PORTFOLIOS
  // L'Atelier By's shops live in portal-data.js (legacy detailed mock).
  // For the 3 new brands we keep a lighter mock: 1-3 shops + summary
  // numbers + 12-month CA series for the brand dashboard charts.
  // ====================================================================

  function genSeries(base, growth, jitter = 0.05, n = 12, seed = 7) {
    // tiny seeded RNG so the chart doesn't flicker on rerender
    let s = seed;
    const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const out = [];
    for (let i = 0; i < n; i++) {
      const ramp = 1 + growth * (i / (n - 1));
      const seasonal = 1 + 0.06 * Math.sin(i / n * Math.PI * 2 - 1);
      const noise = 1 + (r() - 0.5) * jitter;
      out.push(Math.round(base * ramp * seasonal * noise));
    }
    return out;
  }

  const BRAND_PORTFOLIOS = {
    couq: {
      summary: { invested: 45000, repaid: 6200, valuation: 49600, roiTarget: 8.2, roiCurrent: 7.6, networkSize: 3 },
      ca12m: genSeries(52000, 0.28, 0.07, 12, 17),
      budget12m: genSeries(50000, 0.20, 0.03, 12, 18),
      shops: [
        {
          id: 'couq-chatelain', brand: 'couq',
          name: 'Couq Châtelain', city: 'Bruxelles', kind: 'Boulangerie',
          opened: 'Juin 2024', invested: 25000, repaid: 4100,
          roiTarget: 8.2, roiCurrent: 8.0, networkRank: 1, networkTotal: 2,
          health: 'good',
          kpiSnapshot: { ca: 64000, profit: 14.2, cust: 220, basket: 6.9, vsBudget: 6.8 },
          consultant: { name: 'Lara Wauters', lastVisit: '12 mai 2026', verdict: 'on-track',
            summary: 'Excellent tempo matinal. Vente de couques signature 38 % du CA.',
            action: 'Tester une box dégustation 6 couques pour la vente du soir.' },
          franchisee: { name: 'Tom Verstraeten', tier: 'Argent', overall: 4.4, since: 'Mai 2024' }
        },
        {
          id: 'couq-saintgery', brand: 'couq',
          name: 'Couq Saint-Géry', city: 'Bruxelles', kind: 'Boulangerie',
          opened: 'Janvier 2025', invested: 20000, repaid: 2100,
          roiTarget: 8.2, roiCurrent: 7.2, networkRank: 2, networkTotal: 2,
          health: 'good',
          kpiSnapshot: { ca: 48000, profit: 11.8, cust: 168, basket: 6.4, vsBudget: -2.4 },
          consultant: { name: 'Lara Wauters', lastVisit: '06 mai 2026', verdict: 'on-track',
            summary: 'Démarrage solide. Devanture brique fonctionne comme appel de loin.',
            action: 'Élargir le four pour absorber la fournée du dimanche.' },
          franchisee: { name: 'Mila De Vos', tier: 'Argent', overall: 4.1, since: 'Décembre 2024' }
        }
      ]
    },
    cookies: {
      summary: { invested: 18000, repaid: 1400, valuation: 19200, roiTarget: 7.5, roiCurrent: 7.1, networkSize: 1 },
      ca12m: genSeries(22000, 0.22, 0.08, 12, 33),
      budget12m: genSeries(21000, 0.18, 0.03, 12, 34),
      shops: [
        {
          id: 'cookies-outremeuse', brand: 'cookies',
          name: "Cookie's & Milk Outremeuse", city: 'Liège', kind: 'Kiosque',
          opened: 'Septembre 2025', invested: 18000, repaid: 1400,
          roiTarget: 7.5, roiCurrent: 7.1, networkRank: 1, networkTotal: 1,
          health: 'good',
          kpiSnapshot: { ca: 26800, profit: 9.4, cust: 86, basket: 8.9, vsBudget: 3.2 },
          consultant: { name: 'Sophie Renard', lastVisit: '09 mai 2026', verdict: 'on-track',
            summary: 'Concept dessert bien adopté localement. Pic du goûter (15h-18h) très fort.',
            action: 'Tester une offre boîte de 6 cookies à emporter pour les écoles.' },
          franchisee: { name: 'Estelle Marchand', tier: 'Bronze', overall: 4.0, since: 'Août 2025' }
        }
      ]
    },
    mania: {
      summary: { invested: 22000, repaid: 980, valuation: 23200, roiTarget: 8.8, roiCurrent: 8.4, networkSize: 1 },
      ca12m: genSeries(38000, 0.35, 0.08, 12, 41),
      budget12m: genSeries(36000, 0.30, 0.03, 12, 42),
      shops: [
        {
          id: 'mania-mons', brand: 'mania',
          name: 'Mania Pizza Mons', city: 'Mons', kind: 'Pizzeria',
          opened: 'Octobre 2025', invested: 22000, repaid: 980,
          roiTarget: 8.8, roiCurrent: 8.4, networkRank: 1, networkTotal: 1,
          health: 'good',
          kpiSnapshot: { ca: 51200, profit: 13.6, cust: 240, basket: 7.4, vsBudget: 4.8 },
          consultant: { name: 'Karim Boulahia', lastVisit: '04 mai 2026', verdict: 'on-track',
            summary: 'Démarrage en force, file d\'attente le vendredi soir. Équipe à renforcer.',
            action: 'Recrutement immédiat : 1 pizzaiolo + 1 caisse pour week-end.' },
          franchisee: { name: 'Dario Sartori', tier: 'Argent', overall: 4.3, since: 'Septembre 2025' }
        }
      ]
    }
  };

  // ====================================================================
  // CROSS-BRAND OPPORTUNITIES (Franchise Generation marketplace)
  // ====================================================================
  const FG_OPPORTUNITIES = [
    {
      id: 'mania-namur', brand: 'mania',
      name: 'Mania Pizza Namur',
      city: 'Namur', kind: 'Pizzeria',
      concept: 'Ouverture rue de Fer · 95 m². Pré-engagement ouvert.',
      target: 180000, raised: 132000, ticketMin: 5000,
      roiTarget: 8.6, maturity: 5, closingDays: 12,
      risk: 'Modéré', payback: '4,2 ans',
      teaser: 'Co-investissement avec 3 investisseurs Mania historiques.'
    },
    {
      id: 'couq-anvers', brand: 'couq',
      name: 'Couq Anvers',
      city: 'Antwerpen', kind: 'Boulangerie',
      concept: '1er Couq en Flandre. Quartier Zuid · 80 m².',
      target: 240000, raised: 88000, ticketMin: 7500,
      roiTarget: 8.4, maturity: 5, closingDays: 34,
      risk: 'Modéré', payback: '4,5 ans',
      teaser: 'Tax shelter applicable. Documents disponibles.'
    },
    {
      id: 'atelier-gent', brand: 'atelier',
      name: "L'Atelier Gand",
      city: 'Gent', kind: 'Boutique',
      concept: 'Centre-ville · 84 m². Ouverture prévue Q3 2026.',
      target: 320000, raised: 248000, ticketMin: 5000,
      roiTarget: 8.6, maturity: 5, closingDays: 18,
      risk: 'Faible', payback: '4,8 ans',
      teaser: 'Le réseau le plus mature du portefeuille.'
    },
    {
      id: 'cookies-bxl', brand: 'cookies',
      name: "Cookie's & Milk Bruxelles",
      city: 'Bruxelles', kind: 'Kiosque',
      concept: '2e ouverture. Galerie Toison d\'Or · 38 m².',
      target: 95000, raised: 18000, ticketMin: 2500,
      roiTarget: 7.8, maturity: 4, closingDays: 56,
      risk: 'Modéré', payback: '5,1 ans',
      teaser: 'Brand en lancement — ticket d\'entrée accessible.'
    }
  ];

  // ====================================================================
  // GLOBAL NOTIFICATIONS (cross-brand feed)
  // ====================================================================
  const FG_NOTIFS = [
    { id: 'n1', kind: 'payment', brand: 'atelier', title: 'Versement reçu · L\'Atelier Châtelain', sub: '1 248 € versés (échéance Mai)', time: 'Il y a 2h', unread: true },
    { id: 'n2', kind: 'opp',     brand: 'mania',   title: 'Closing imminent · Mania Pizza Namur', sub: '12 jours restants · 73 % levés', time: '4h', unread: true },
    { id: 'n3', kind: 'report',  brand: 'couq',    title: 'Rapport mensuel · Couq Flagey', sub: '+6,8 % vs budget · Avril 2026', time: 'Hier', unread: true },
    { id: 'n4', kind: 'doc',     brand: 'mania',   title: 'Avenant à signer · Mania Pizza Mons', sub: 'Extension horaires soir · DocuSign', time: '2j', unread: true },
    { id: 'n5', kind: 'payment', brand: 'cookies', title: 'Versement reçu · Cookie\'s Outremeuse', sub: '124 € versés (échéance Avril)', time: '3j', unread: false },
    { id: 'n6', kind: 'report',  brand: 'atelier', title: 'Rapport mensuel · L\'Atelier Anvers', sub: '+8,1 % vs budget · Avril 2026', time: '4j', unread: false },
    { id: 'n7', kind: 'opp',     brand: 'cookies', title: 'Nouvelle opportunité · Cookie\'s Bruxelles', sub: 'Galerie Toison d\'Or · TRI cible 7,8 %', time: '1 sem.', unread: false }
  ];

  // ====================================================================
  // FORMAT HELPERS (shared with portal-data.js, exposed here too)
  // ====================================================================
  const fmtEur = (n, d = 0) => new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const fmtNum = (n, d = 0) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const fmtPct = (n, d = 1) => `${n >= 0 ? '+' : ''}${fmtNum(n, d)}%`;

  // ====================================================================
  // BRAND PRESENTATION — identical schema for every brand. The template
  // is brand-agnostic; this object drives every section.
  // ====================================================================
  const BRAND_PRESENTATION = {
    atelier: {
      hero: {
        baseline: 'La boulangerie de quartier, au geste artisanal.',
        concept: 'Un réseau de boulangeries-pâtisseries de proximité qui ramène le pain levé long, les viennoiseries pur beurre et le service de quartier au cœur de chaque ville belge.',
        message: 'Investissez dans un réseau de 47 magasins en pleine expansion · TRI cible 8,4 %.',
        cta: 'Manifester un intérêt',
        secondaryCta: 'Télécharger le deck',
        media: 'img/shop-1.png'
      },
      carousel: [
        { kind: 'image', src: 'img/shop-1.png', caption: 'L\'Atelier Châtelain — Bruxelles, 2024' },
        { kind: 'kpi', metrics: [{ label: 'Magasins', value: '47' }, { label: 'TRI moyen', value: '8,4 %' }, { label: 'CA moyen / mag.', value: '1,1 M€' }, { label: 'Maturité', value: '5 ans' }], title: 'Le réseau en chiffres', sub: 'Données 2025 · réseau consolidé' },
        { kind: 'image', src: 'img/shop-2.png', caption: 'L\'Atelier Sablon — Bruxelles, 2024' },
        { kind: 'concept', title: 'Le geste artisanal, multiplié', body: 'Chaque magasin produit sur place. Pas de pré-pétri, pas de surgelé. La fournée du matin est le contrat passé avec le quartier.' },
        { kind: 'image', src: 'img/shop-3.png', caption: 'L\'Atelier Anvers — Antwerpen, 2023' },
        { kind: 'text', title: 'Positionnement', body: 'Entre la boulangerie de tradition et le concept lifestyle. Un produit haut-de-gamme accessible, une expérience de quartier premium.' },
        { kind: 'highlight', title: 'Investment highlight', body: 'Tax shelter applicable · 8,4 % TRI cible · maturité 5 ans · ticket dès 5 000 €.' }
      ],
      videos: [
        { kind: 'main',    thumb: 'img/shop-1.png', title: "L'Atelier By en 90 secondes", desc: 'Le concept, la promesse, le réseau.', duration: '1:32' },
        { kind: 'founder', thumb: 'img/shop-2.png', title: 'Message des fondateurs', desc: 'Camille & Thibaut · histoire et vision.', duration: '3:18' },
        { kind: 'tour',    thumb: 'img/shop-3.png', title: 'Visite de magasin', desc: 'L\'Atelier Anvers, derrière le comptoir.', duration: '2:45' }
      ],
      concept: {
        explanation: 'Nous remettons le pain levé long et le service de quartier au centre. Les magasins sont compacts (70–110 m²), ouverts 7j/7, opérés par un binôme franchisé + chef de production.',
        targetCustomers: ['Familles urbaines 28–55 ans', 'Riverains du quartier', 'Bureaux à proximité (déjeuner)', 'Clientèle weekend (brunch)'],
        positioning: 'Boulangerie artisanale premium — produit haut-de-gamme à un prix accessible, expérience client de quartier.',
        strengths: [
          { title: 'Production sur place', body: '100 % fait maison, pétrissage long, viennoiseries pur beurre.' },
          { title: 'Réseau mature', body: '47 magasins ouverts depuis 2022, dont 5 en franchise investisseur.' },
          { title: 'Marque reconnue', body: 'Présence presse Bruxelles, communauté Instagram 38k.' },
          { title: 'Économie unitaire prouvée', body: 'Profit net 17,8 % en moyenne réseau, payback 4,8 ans.' }
        ],
        franchiseModel: 'Franchise opérée : le franchisé pilote son magasin, la marque apporte la production, la formation, le marketing, l\'IT et le sourcing. Royalty 5 %, marketing pool 1,5 %.',
        vision: 'D\'ici 2030 : 120 magasins en Belgique, déploiement en France (Lille, Roubaix, Paris) et Pays-Bas (Amsterdam, Rotterdam).'
      },
      investment: {
        minTicket: 5000, roiTarget: 8.4, payback: '4,8 ans',
        openOpps: 1, networkSize: 47, networkPerfLabel: '+8,4 % CA moyen vs budget 2025'
      },
      documents: [
        { kind: 'Brand deck',          title: "L'Atelier By — Deck investisseur 2026", size: '4,2 MB' },
        { kind: 'Dossier franchise',   title: 'Dossier franchise complet',              size: '6,8 MB' },
        { kind: 'Dossier investissement', title: 'Memorandum investisseur 2026',         size: '2,4 MB' },
        { kind: 'Projections',         title: 'Modèle financier 5 ans',                 size: '1,1 MB' },
        { kind: 'Contrat type',        title: 'Convention de prêt — modèle',            size: '480 KB' },
        { kind: 'Légal',               title: 'Statuts & gouvernance',                  size: '720 KB' }
      ],
      team: [
        { role: 'Co-fondateur',                person: { name: 'Sam Verheyden',     desc: 'Co-fondateur · stratégie & gouvernance', contact: true } },
        { role: 'Co-fondateur',                person: { name: 'Loïc Verheyden',    desc: 'Co-fondateur · opérations & développement', contact: true } },
        { role: 'Brand strategy & structure',  person: { name: 'Sam Verheyden',     desc: 'Pilote l’identité et l’architecture de la marque.', contact: true } },
        { role: 'Assistance Manager',          person: { name: 'Loïc Verheyden',    desc: 'Référent franchisés + accompagnement réseau.', contact: true } },
        { role: 'Marketing Manager',           person: { name: 'Sam Verheyden',     desc: 'Communication, contenu et activation locale.', contact: false } },
        { role: 'Operational Manager',         person: { name: 'Claire Dubois',     desc: 'Production, qualité, achats et logistique.', contact: false } },
        { role: 'Development & Marketing',     person: { name: 'Nora Vandenberg',   desc: 'Développement territorial Belgique + France.', contact: false } }
      ],
      opportunitiesPitch: 'Le réseau le plus mature du portefeuille. Le projet Gand est en pré-closing — co-investissement disponible.'
    },

    couq: {
      hero: {
        baseline: 'La couque au beurre, vraie, fourrée, fournée chaque matin.',
        concept: 'Couq est une boulangerie-pâtisserie de quartier centrée sur la couque au beurre fourrée. Pâte feuilletée 3 jours, beurre AOP, fournée à 6h30. Première adresse à Saint-Géry, Bruxelles.',
        message: 'Pilote en pré-ouverture · TRI cible 8,2 % · ticket dès 7 500 €.',
        cta: 'Manifester un intérêt',
        secondaryCta: 'Télécharger le deck',
        media: 'img/couq-logo.jpg'
      },
      carousel: [
        { kind: 'image', placeholder: 'Couq Saint-Géry — vitrine brique', label: 'Couq Saint-Géry · 2025' },
        { kind: 'kpi', metrics: [{ label: 'Magasins', value: '1' }, { label: 'Ticket moyen', value: '6,80 €' }, { label: 'Marge nette', value: '13 %' }, { label: 'Visites / jour', value: '180' }], title: 'Le pilote en chiffres', sub: 'Données 12 derniers mois · 1 magasin' },
        { kind: 'concept', title: 'La couque, vingt façons', body: 'Pâte feuilletée pétrie 3 jours à l\'avance · beurre AOP Échiré · 8 fourrages signature, des classiques (vanille, chocolat) aux saisons (rhubarbe, marron grillé).' },
        { kind: 'image', placeholder: 'Couques au beurre fourrées N°01', label: 'Produit signature' },
        { kind: 'text', title: 'Positionnement', body: 'Entre la boulangerie de tradition et le concept lifestyle. Un produit signature reconnaissable, une devanture brique, une couleur de marque qui signe.' },
        { kind: 'image', placeholder: 'Comptoir & étagères ocre', label: 'Architecture intérieure' },
        { kind: 'highlight', title: 'Investment highlight', body: 'Concept à signature visuelle forte · format 60–95 m² · break-even mois 10 · TRI cible 8,2 % · ticket dès 7 500 €.' }
      ],
      videos: [
        { kind: 'main',    thumb: null, placeholder: 'Vidéo : Couq, le concept', title: 'Couq — 90 secondes', desc: 'La pâte, la fournée, la marque.', duration: '1:24' },
        { kind: 'founder', thumb: null, placeholder: 'Vidéo : Message du fondateur', title: 'Mot du fondateur', desc: 'Tom Verstraeten · pourquoi la couque.', duration: '2:50' },
        { kind: 'tour',    thumb: null, placeholder: 'Vidéo : Visite Saint-Géry', title: 'Visite Couq Saint-Géry', desc: 'Une journée derrière le comptoir.', duration: '3:10' }
      ],
      concept: {
        explanation: 'Couq est une boulangerie-pâtisserie de quartier centrée sur la couque au beurre fourrée. Pâte feuilletée 3 jours, beurre AOP, fournée matin et après-midi. Architecture brique et sarrasin, produit signature reconnaissable.',
        targetCustomers: ['Riverains 25–55 ans', 'Bureaux pause sucrée', 'Tourisme & shopping centre-ville', 'Cadeau (boîte de 6 couques)'],
        positioning: 'Boulangerie artisanale premium à signature visuelle forte · une couque signature, plusieurs fourrages, un univers brique-sarrasin reconnaissable de loin.',
        strengths: [
          { title: 'Produit signature', body: 'La couque au beurre fourrée — 8 variantes, recette propriétaire, fait minute.' },
          { title: 'Identité forte', body: 'Devanture brique de Liège, sac kraft sarrasin, étiquettes ocre — signe à 30 m.' },
          { title: 'Process documenté', body: 'Pâte préparée à J-3, fournée 2× / jour. Formation 4 semaines au pilote.' },
          { title: 'CapEx maîtrisé', body: 'Format 60–95 m² · pas de cuisine chaude lourde · break-even mois 10.' }
        ],
        franchiseModel: 'Franchise opérée. Royalty 5 %, marketing pool 1 %. Formation 4 semaines au pilote Saint-Géry, accompagnement 6 mois.',
        vision: '2030 : 8 magasins en Belgique (Bruxelles, Anvers, Gand, Liège) + 2 à Paris.'
      },
      investment: {
        minTicket: 7500, roiTarget: 8.2, payback: '4,5 ans',
        openOpps: 1, networkSize: 1, networkPerfLabel: '+3,9 % CA moyen vs budget 2025 (pilote)'
      },
      documents: [
        { kind: 'Brand deck',          title: 'Couq — Deck investisseur 2026',          size: '3,1 MB' },
        { kind: 'Dossier franchise',   title: 'Dossier franchise 2026',                 size: '4,2 MB' },
        { kind: 'Dossier investissement', title: 'Memorandum investisseur',              size: '1,8 MB' },
        { kind: 'Projections',         title: 'Modèle financier 5 ans',                 size: '920 KB' },
        { kind: 'Contrat type',        title: 'Convention de prêt — modèle',            size: '480 KB' },
        { kind: 'Légal',               title: 'Statuts & gouvernance',                  size: '640 KB' }
      ],
      team: [
        { role: 'Co-fondateur',                person: { name: 'Tom Verstraeten',   desc: 'Co-fondateur · produit & opérations.', contact: true } },
        { role: 'Brand strategy & structure',  person: { name: 'Sam Verheyden',     desc: 'Identité visuelle, architecture de marque, retail design.', contact: true } },
        { role: 'Assistance Manager',          person: { name: 'Loïc Verheyden',    desc: 'Accompagnement franchisés et coordination réseau.', contact: true } },
        { role: 'Marketing Manager',           person: { name: 'Nathan Charlot',    desc: 'Activation locale, contenu et partenariats.', contact: true } },
        { role: 'Operational Manager',         person: { name: 'Mila De Vos',       desc: 'Production, formation équipes, qualité produit.', contact: false } }
      ],
      opportunitiesPitch: 'Couq Saint-Géry en pré-ouverture — co-investissement avec 3 investisseurs fondateurs. Concept à signature visuelle forte.'
    },

    cookies: {
      hero: {
        baseline: 'Cookies maison, lait frappé, après-midi sucrée.',
        concept: 'Un dessert bar en format kiosque : cookies cuits à la minute, milkshakes onctueux, café spécialité. Premier pilote à Liège, validation du modèle en cours.',
        message: 'Brand en lancement · ticket d\'entrée accessible · TRI cible 7,5 %.',
        cta: 'Manifester un intérêt',
        secondaryCta: 'Télécharger le deck',
        media: null
      },
      carousel: [
        { kind: 'image', placeholder: 'Cookie\'s & Milk — Comptoir Outremeuse', label: 'Cookie\'s Outremeuse · 2025' },
        { kind: 'kpi', metrics: [{ label: 'Kiosque pilote', value: '1' }, { label: 'Ticket moyen', value: '8,90 €' }, { label: 'Visites / jour', value: '86' }, { label: 'Marge', value: '9 %' }], title: 'Le pilote en chiffres', sub: '8 premiers mois d\'exploitation' },
        { kind: 'concept', title: 'Cuit à la minute', body: 'Pâtes préparées chaque matin, cuisson à la commande. La douzaine de cookies sort du four en moins de 11 minutes.' },
        { kind: 'image', placeholder: 'Box dégustation 6 cookies', label: 'Box signature' },
        { kind: 'text', title: 'Positionnement', body: 'Le dessert d\'après-midi : créneau 14h–19h dominant, ticket bas, fréquence élevée.' },
        { kind: 'image', placeholder: 'Milkshake signature — Vanille caramel', label: 'Milkshake signature' },
        { kind: 'highlight', title: 'Investment highlight', body: 'Format kiosque 38 m² · CapEx 95 K€ · payback 5,1 ans · ticket dès 2 500 €.' }
      ],
      videos: [
        { kind: 'main',    thumb: null, placeholder: 'Vidéo : Cookie\'s & Milk', title: 'Cookie\'s & Milk — Le pilote', desc: 'Le concept, le produit, le pari.', duration: '1:18' },
        { kind: 'founder', thumb: null, placeholder: 'Vidéo : Message d\'Estelle', title: 'Mot d\'Estelle Marchand', desc: 'Fondatrice & franchisée pilote.', duration: '2:24' },
        { kind: 'tour',    thumb: null, placeholder: 'Vidéo : Visite Outremeuse', title: 'Visite Outremeuse', desc: 'Cuisson, service, créneau goûter.', duration: '2:08' }
      ],
      concept: {
        explanation: 'Cookie\'s & Milk est un dessert bar en kiosque. Cookies cuits à la commande, milkshakes signature, café spécialité. Créneau goûter (14h–19h) dominant.',
        targetCustomers: ['Familles avec enfants 6–16 ans', 'Étudiants en sortie', 'Adultes pause goûter (à emporter)', 'Cadeau / partage (box)'],
        positioning: 'Dessert bar moderne · produit fait minute · accessible (ticket bas) · expérience instagrammable.',
        strengths: [
          { title: 'Format compact', body: '38 m² suffisent — kiosque en galerie commerciale ou rue passante.' },
          { title: 'CapEx limité', body: '95 K€ tout équipement compris · pas de cuisine chaude lourde.' },
          { title: 'Créneau dominant', body: 'Goûter 14h–19h capture 62 % du CA · faible concurrence sur ce créneau.' },
          { title: 'Produit photogénique', body: 'Box, milkshakes signature, latte art — engagement Instagram natif.' }
        ],
        franchiseModel: 'Franchise opérée. Royalty 5 %, marketing pool 1 %. Formation 3 semaines à Liège.',
        vision: '2030 : 8 kiosques en Belgique + 2 en Allemagne (Cologne, Aix).'
      },
      investment: {
        minTicket: 2500, roiTarget: 7.5, payback: '5,1 ans',
        openOpps: 1, networkSize: 1, networkPerfLabel: '+3,2 % CA moyen vs budget 2025 (pilote)'
      },
      documents: [
        { kind: 'Brand deck',          title: "Cookie's & Milk — Deck investisseur",    size: '2,8 MB' },
        { kind: 'Dossier franchise',   title: 'Dossier franchise 2026',                 size: '3,4 MB' },
        { kind: 'Dossier investissement', title: 'Memorandum investisseur',              size: '1,4 MB' },
        { kind: 'Projections',         title: 'Modèle financier 4 ans',                 size: '880 KB' },
        { kind: 'Contrat type',        title: 'Convention de prêt — modèle',            size: '480 KB' },
        { kind: 'Légal',               title: 'Statuts & gouvernance',                  size: '560 KB' }
      ],
      team: [
        { role: 'Co-fondatrice',               person: { name: 'Estelle Marchand',  desc: 'Co-fondatrice · produit & franchisée pilote.', contact: true } },
        { role: 'Brand strategy & structure',  person: { name: 'Sam Verheyden',     desc: 'Identité visuelle et architecture du concept.', contact: true } },
        { role: 'Assistance Manager',          person: { name: 'Loïc Verheyden',    desc: 'Référent franchisés, formation et lancement.', contact: true } },
        { role: 'Marketing Manager',           person: { name: 'Nathan Charlot',    desc: 'Communauté, contenus et partenariats locaux.', contact: true } }
      ],
      opportunitiesPitch: 'Cookie\'s Bruxelles en pré-lancement (Galerie Toison d\'Or). Ticket d\'entrée le plus accessible du portefeuille.'
    },

    mania: {
      hero: {
        baseline: 'Pizza romaine al taglio · à la part, au poids.',
        concept: 'Pizza romaine al taglio servie à la part, au poids. Pâte 72h, cuisson en plaque, débit élevé. Premier magasin à Mons, deux ouvertures programmées en 2026.',
        message: 'Lancement en force · TRI cible 8,8 %.',
        cta: 'Manifester un intérêt',
        secondaryCta: 'Télécharger le deck',
        media: null
      },
      carousel: [
        { kind: 'image', placeholder: 'Mania Pizza Mons — Comptoir', label: 'Mania Pizza Mons · 2025' },
        { kind: 'kpi', metrics: [{ label: 'Magasins', value: '1' }, { label: 'Parts / jour', value: '240' }, { label: 'Ticket moyen', value: '7,40 €' }, { label: 'Marge nette', value: '14 %' }], title: 'Le pilote en chiffres', sub: '6 mois d\'exploitation' },
        { kind: 'concept', title: 'Romaine al taglio', body: 'Pâte fermentée 72 heures, cuisson en plaque, découpe aux ciseaux, service au poids. Le rythme italien, l\'efficacité belge.' },
        { kind: 'image', placeholder: 'Pâte fermentée 72h', label: 'Process · pâte longue' },
        { kind: 'text', title: 'Positionnement', body: 'Entre la pizzeria assise et le fast-food : qualité produit pizzeria, débit fast-food, prix accessible.' },
        { kind: 'image', placeholder: 'Pizza Margherita al taglio', label: 'Pizza signature' },
        { kind: 'highlight', title: 'Investment highlight', body: 'Volume 240 parts/jour · marge 14 % · payback 4,2 ans · ticket dès 5 000 €.' }
      ],
      videos: [
        { kind: 'main',    thumb: null, placeholder: 'Vidéo : Mania Pizza', title: 'Mania Pizza — 90 secondes', desc: 'Le concept, la pâte, le service.', duration: '1:28' },
        { kind: 'founder', thumb: null, placeholder: 'Vidéo : Mot de Dario', title: 'Mot du fondateur', desc: 'Dario Sartori · l\'école romaine.', duration: '3:02' },
        { kind: 'tour',    thumb: null, placeholder: 'Vidéo : Service vendredi soir', title: 'Visite Mania Mons', desc: 'Rush vendredi soir 18h–21h.', duration: '2:34' }
      ],
      concept: {
        explanation: 'Mania Pizza est une pizza romaine al taglio servie à la part et au poids. Pâte fermentée 72h, cuisson en plaque, débit élevé.',
        targetCustomers: ['Actifs déjeuner rapide', 'Étudiants & jeunes actifs', 'Familles emporter / livraison', 'Soirées informelles'],
        positioning: 'Slice bar premium · qualité pizzeria, format fast-food, prix accessible.',
        strengths: [
          { title: 'Process industriel', body: 'Pâte préparée à J-3 · cuisson en plaque · découpe minute. Débit 240 parts/jour.' },
          { title: 'Marge solide', body: 'Coût matière 26 %, marge nette 14 % dès le mois 6.' },
          { title: 'Format urbain', body: '60–95 m², comptoir en façade, 8–15 tabourets · à emporter dominant (62 %).' },
          { title: 'École romaine', body: 'Recette validée par Dario Sartori, ex-Bonci. Process documenté, formation 6 semaines.' }
        ],
        franchiseModel: 'Franchise opérée. Royalty 5 %, marketing pool 1,5 %. Centrale de production de la pâte sur Mons (livraison J).',
        vision: '2030 : 12 pizzerias en Wallonie + Hainaut français (Lille, Valenciennes).'
      },
      investment: {
        minTicket: 5000, roiTarget: 8.8, payback: '4,2 ans',
        openOpps: 1, networkSize: 1, networkPerfLabel: '+4,8 % CA moyen vs budget 2025 (pilote)'
      },
      documents: [
        { kind: 'Brand deck',          title: 'Mania Pizza — Deck investisseur',         size: '3,6 MB' },
        { kind: 'Dossier franchise',   title: 'Dossier franchise 2026',                 size: '4,8 MB' },
        { kind: 'Dossier investissement', title: 'Memorandum investisseur',              size: '2,1 MB' },
        { kind: 'Projections',         title: 'Modèle financier 5 ans',                 size: '960 KB' },
        { kind: 'Contrat type',        title: 'Convention de prêt — modèle',            size: '480 KB' },
        { kind: 'Légal',               title: 'Statuts & gouvernance',                  size: '620 KB' }
      ],
      team: [
        { role: 'Co-fondateur',                person: { name: 'Dario Sartori',     desc: 'Co-fondateur · produit, pâte & process (ex-Bonci).', contact: true } },
        { role: 'Brand strategy & structure',  person: { name: 'Sam Verheyden',     desc: 'Identité, retail design, architecture de marque.', contact: true } },
        { role: 'Assistance Manager',          person: { name: 'Loïc Verheyden',    desc: 'Référent franchisés, lancement et réseau.', contact: true } },
        { role: 'Marketing Manager',           person: { name: 'Nathan Charlot',    desc: 'Activation locale, contenu et partenariats.', contact: true } },
        { role: 'Operational Manager',         person: { name: 'Marco Bellucci',    desc: 'Centrale de production pâte · logistique J.', contact: false } },
        { role: 'Development & Marketing',     person: { name: 'Sophie Renard',     desc: 'Développement territorial Wallonie + Nord France.', contact: false } }
      ],
      opportunitiesPitch: 'Mania Namur en closing — co-investissement ouvert. Pilote Mons en avance sur plan.'
    }
  };

  // ====================================================================
  // HELPDESK / SUPPORT
  // ====================================================================
  const SUPPORT_CATEGORIES = [
    { id: 'investment',  label: 'Question d\'investissement' },
    { id: 'repayment',   label: 'Question de remboursement' },
    { id: 'technical',   label: 'Problème technique' },
    { id: 'document',    label: 'Problème de document' },
    { id: 'legal',       label: 'Juridique / conformité' },
    { id: 'opportunity', label: 'Opportunité de financement' },
    { id: 'general',     label: 'Support général' }
  ];

  const SUPPORT_PRIORITIES = [
    { id: 'low',     label: 'Faible' },
    { id: 'normal',  label: 'Normale' },
    { id: 'high',    label: 'Élevée' },
    { id: 'urgent',  label: 'Urgente' }
  ];

  // Tickets list — mix of investor-initiated threads and admin-pushed notices
  const SUPPORT_TICKETS = [
    {
      id: 't-001',
      category: 'document',
      subject: 'Justificatif de domicile à renouveler',
      priority: 'high',
      status: 'awaiting-investor',
      brand: null,
      project: null,
      assignedTo: 'Émilie Devos · Conformité',
      origin: 'admin',
      updatedAt: 'Il y a 1h',
      messages: [
        { id: 'm-001', author: 'admin', name: 'Émilie Devos', body: 'Bonjour Claire, votre justificatif de domicile date de plus de 2 ans. Pourriez-vous nous transmettre une composition de ménage récente (moins de 3 mois) ? Vous pouvez la déposer directement depuis votre profil.', time: '04 mai · 09:12', attachments: [] },
        { id: 'm-002', author: 'investor', name: 'Claire Vermeulen', body: 'Bonjour, c\'est noté. Je récupère cela auprès de ma commune cette semaine.', time: '04 mai · 14:30', attachments: [] },
        { id: 'm-003', author: 'admin', name: 'Émilie Devos', body: 'Parfait, merci. Je relance dans 10 jours si rien n\'est déposé. Bonne journée.', time: 'Aujourd\'hui · 08:45', attachments: [], unread: true }
      ]
    },
    {
      id: 't-002',
      category: 'opportunity',
      subject: 'Pré-engagement · Mania Pizza Namur',
      priority: 'normal',
      status: 'open',
      brand: 'mania',
      project: 'mania-namur',
      assignedTo: 'Karim Boulahia · Investor Relations',
      origin: 'investor',
      updatedAt: '2j',
      messages: [
        { id: 'm-101', author: 'investor', name: 'Claire Vermeulen', body: 'Bonsoir, je suis intéressée par un pré-engagement sur le projet Mania Pizza Namur. Pourriez-vous m\'envoyer le business plan détaillé ?', time: '12 mai · 19:42', attachments: [] },
        { id: 'm-102', author: 'admin', name: 'Karim Boulahia', body: 'Bonjour Claire, ravi de vous lire. Vous trouverez le BP et les projections financières en pièce jointe. N\'hésitez pas si vous voulez en discuter de vive voix — calendrier ci-dessous.', time: '13 mai · 09:08', attachments: [{ name: 'Mania-Namur-BP-2026.pdf', size: '4,2 MB' }, { name: 'Mania-Namur-Projections.xlsx', size: '320 KB' }] }
      ]
    },
    {
      id: 't-003',
      category: 'repayment',
      subject: 'Calendrier de remboursement L\'Atelier Liège',
      priority: 'normal',
      status: 'resolved',
      brand: 'atelier',
      project: 'liege',
      assignedTo: 'Sophie Renard · Investor Relations',
      origin: 'investor',
      updatedAt: '1 sem.',
      messages: [
        { id: 'm-201', author: 'investor', name: 'Claire Vermeulen', body: 'Bonjour, le versement d\'avril sur Liège est arrivé avec 5 jours de retard. Est-ce normal ?', time: '07 mai · 11:15', attachments: [] },
        { id: 'm-202', author: 'admin', name: 'Sophie Renard', body: 'Bonjour Claire, retard lié à une fermeture bancaire de Pâques. Tous les versements suivants seront le 15 comme prévu. Désolée pour la gêne.', time: '07 mai · 14:22', attachments: [] },
        { id: 'm-203', author: 'investor', name: 'Claire Vermeulen', body: 'Merci pour la clarification.', time: '07 mai · 14:30', attachments: [] }
      ]
    },
    {
      id: 't-004',
      category: 'general',
      subject: 'Rapport annuel réseau 2025 disponible',
      priority: 'low',
      status: 'open',
      brand: null,
      project: null,
      assignedTo: 'Franchise Generation',
      origin: 'admin',
      updatedAt: '2 sem.',
      messages: [
        { id: 'm-301', author: 'admin', name: 'Franchise Generation', body: 'Bonjour, le rapport annuel consolidé du réseau Franchise Generation 2025 est disponible dans votre profil → Documents. Il couvre les 4 marques et les performances par magasin. Bonne lecture.', time: '28 avril · 10:00', attachments: [{ name: 'FG-Rapport-Annuel-2025.pdf', size: '4,8 MB' }] }
      ]
    }
  ];
  window.FG_DATA = {
    BRANDS, INVESTOR, INVESTOR_PREFERENCES, SECTION_LABELS, LANDING,
    BRAND_PORTFOLIOS, BRAND_PRESENTATION,
    FG_OPPORTUNITIES, FG_NOTIFS, FG_DOCS, DOC_TYPES,
    SUPPORT_TICKETS, SUPPORT_CATEGORIES, SUPPORT_PRIORITIES,
    REGIONS, ONBOARDING_OPPORTUNITIES, LEAD_STEPS, CANDIDATE_LEADS,
    CANDIDATES, OPP_VALIDATION_STATUSES,
    NEW_BRAND_LEADS, CONCEPT_TYPES, DEVELOPERS,
    fmtEur, fmtNum, fmtPct,
    brandById: (id) => BRANDS.find(b => b.id === id) || null,

    // API helpers — fetch from real API, fall back to mock data silently
    api: {
      BASE: window.FG_API_BASE || '',
      async get(path) {
        try {
          const r = await fetch(this.BASE + '/api' + path);
          if (!r.ok) return null;
          const j = await r.json();
          return j.data;
        } catch (_) { return null; }
      },
      async post(path, body) {
        try {
          const r = await fetch(this.BASE + '/api' + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const j = await r.json();
          return j;
        } catch (_) { return null; }
      },
      async submitLead(type, payload) {
        return this.post('/leads', { type, ...payload });
      },
    }
  };
})();
