/**
 * Franchise Generation — In-Memory Data Store
 *
 * This module is the single source of truth for all mock data.
 * Each exported array is mutable so POST/PUT/DELETE operations
 * work during a server session. When a real PostgreSQL connection
 * is wired in, replace these exports with DB queries.
 *
 * Usage:
 *   const { BRANDS, INVESTORS, ... } = require('../data/seed');
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

// ======================================================================
// BRANDS
// ======================================================================
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
    logoMark: 'A',
    theme: 'atelier',
    tokens: {
      primary:     '#8D1D2C',
      secondary:   '#F2C9A0',
      ink:         '#1c1a17',
      bg:          '#EAE4DC',
      surface:     '#FFFFFF',
      accent:      '#8D1D2C',
      fontDisplay: '"DM Sans", system-ui, sans-serif',
      fontUi:      '"DM Sans", system-ui, sans-serif',
      fontAccent:  '"DM Sans", system-ui, sans-serif'
    },
    kpiLabels: { ca: "Chiffre d'affaires", profit: 'Profit net', cust: 'Clients / jour', basket: 'Panier moyen' },
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
      primary:     '#B8862E',
      secondary:   '#8B3A2A',
      ink:         '#1A1612',
      bg:          '#E8DCC0',
      surface:     '#F4EBD2',
      accent:      '#B8862E',
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
      primary:     '#D98AA6',
      secondary:   '#8B5A3C',
      ink:         '#3E2A28',
      bg:          '#FFF6EE',
      surface:     '#FFFFFF',
      accent:      '#8B5A3C',
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
      primary:     '#C7212A',
      secondary:   '#1E5435',
      ink:         '#0F0E0C',
      bg:          '#F4ECDD',
      surface:     '#FFFAF1',
      accent:      '#C7212A',
      fontDisplay: '"DM Sans", system-ui, sans-serif',
      fontUi:      '"DM Sans", system-ui, sans-serif',
      fontAccent:  '"DM Sans", system-ui, sans-serif'
    },
    kpiLabels: { ca: 'Ventes', profit: 'Marge nette', cust: 'Parts / jour', basket: 'Ticket moyen' },
    copy: { ecoNoun: 'pizzeria', ecoNounPlural: 'pizzerias', verdict: 'Lancement en cours' }
  }
];

// ======================================================================
// REGIONS
// ======================================================================
const REGIONS = [
  { id: 'bxl',     label: 'Bruxelles-Capitale' },
  { id: 'wal',     label: 'Wallonie' },
  { id: 'fla',     label: 'Flandre' },
  { id: 'fr-nord', label: 'France · Hauts-de-France' },
  { id: 'nl',      label: 'Pays-Bas' }
];

// ======================================================================
// ONBOARDING OPPORTUNITIES (candidate-facing)
// ======================================================================
const ONBOARDING_OPPORTUNITIES = [
  {
    id: 'op-gent',
    brand: 'atelier',
    name: "L'Atelier Gand",
    city: 'Gent',
    region: 'fla',
    format: 'Boutique 84 m²',
    opening: 'Q3 2026',
    requiredInvest: 320000,
    candidateContrib: 60000,
    financingNeed: 'Tax shelter + prêt investisseur',
    payback: '4,8 ans',
    status: 'Closing imminent',
    description: 'Centre-ville Gand · emplacement validé, équipe identifiée. Ouverture sous 4 mois.',
    image: 'img/shop-1.png',
    badge: { label: 'INVESTOR READY', tone: 'green' }
  },
  {
    id: 'op-namur-pizza',
    brand: 'mania',
    name: 'Mania Pizza Namur',
    city: 'Namur',
    region: 'wal',
    format: 'Pizzeria 95 m²',
    opening: 'Q3 2026',
    requiredInvest: 180000,
    candidateContrib: 35000,
    financingNeed: 'Prêt investisseur + apport candidat',
    payback: '4,2 ans',
    status: 'Co-investissement ouvert',
    description: 'Rue de Fer · zone passante. Recette validée, équipe à former.',
    image: 'img/shop-3.png',
    badge: { label: 'HOT', tone: 'red' }
  },
  {
    id: 'op-anvers-couq',
    brand: 'couq',
    name: 'Couq Anvers',
    city: 'Antwerpen',
    region: 'fla',
    format: 'Boulangerie 80 m²',
    opening: 'Q4 2026',
    requiredInvest: 240000,
    candidateContrib: 50000,
    financingNeed: 'Tax shelter + prêt investisseur',
    payback: '4,5 ans',
    status: 'En recherche candidat',
    description: 'Quartier Zuid · 1er Couq en Flandre. Bail négocié, travaux à planifier.',
    image: 'img/couq-logo.jpg',
    badge: { label: 'NEW', tone: 'blue' }
  },
  {
    id: 'op-bxl-cookies',
    brand: 'cookies',
    name: "Cookie's & Milk Bruxelles",
    city: 'Bruxelles',
    region: 'bxl',
    format: 'Kiosque 38 m²',
    opening: 'Q4 2026',
    requiredInvest: 95000,
    candidateContrib: 18000,
    financingNeed: 'Apport candidat + prêt investisseur',
    payback: '5,1 ans',
    status: 'Pré-lancement',
    description: "Galerie Toison d'Or · format kiosque. Ticket d'entrée le plus accessible.",
    image: 'img/shop-2.png',
    badge: { label: 'AVAILABLE', tone: 'amber' }
  },
  {
    id: 'op-lille-atelier',
    brand: 'atelier',
    name: "L'Atelier Lille",
    city: 'Lille (FR)',
    region: 'fr-nord',
    format: 'Concept store 120 m²',
    opening: 'Q1 2027',
    requiredInvest: 480000,
    candidateContrib: 95000,
    financingNeed: 'Mix tax shelter + apport + prêt',
    payback: '5,2 ans',
    status: 'En recherche candidat',
    description: 'Premier ancrage en France. Format flagship 120 m² · zone hyper-centre.',
    image: 'img/shop-1.png',
    badge: null
  },
  {
    id: 'op-rdam-atelier',
    brand: 'atelier',
    name: "L'Atelier Rotterdam",
    city: 'Rotterdam',
    region: 'nl',
    format: 'Boutique 95 m²',
    opening: 'Q2 2027',
    requiredInvest: 380000,
    candidateContrib: 80000,
    financingNeed: 'Tax shelter + prêt investisseur',
    payback: '4,9 ans',
    status: 'En recherche candidat',
    description: 'Witte de Withstraat · 2e flagship aux Pays-Bas. Étude marché validée.',
    image: 'img/shop-2.png',
    badge: null
  }
];

// Investor-facing financing opportunities
const FG_OPPORTUNITIES = [
  {
    id: 'mania-namur',
    brand: 'mania',
    name: 'Mania Pizza Namur',
    city: 'Namur',
    kind: 'Pizzeria',
    concept: "Ouverture rue de Fer · 95 m². Pré-engagement ouvert.",
    target: 180000,
    raised: 132000,
    ticketMin: 5000,
    roiTarget: 8.6,
    maturity: 5,
    closingDays: 12,
    risk: 'Modéré',
    payback: '4,2 ans',
    teaser: 'Co-investissement avec 3 investisseurs Mania historiques.',
    status: 'open'
  },
  {
    id: 'couq-anvers',
    brand: 'couq',
    name: 'Couq Anvers',
    city: 'Antwerpen',
    kind: 'Boulangerie',
    concept: '1er Couq en Flandre. Quartier Zuid · 80 m².',
    target: 240000,
    raised: 88000,
    ticketMin: 7500,
    roiTarget: 8.4,
    maturity: 5,
    closingDays: 34,
    risk: 'Modéré',
    payback: '4,5 ans',
    teaser: 'Tax shelter applicable. Documents disponibles.',
    status: 'open'
  },
  {
    id: 'atelier-gent',
    brand: 'atelier',
    name: "L'Atelier Gand",
    city: 'Gent',
    kind: 'Boutique',
    concept: 'Centre-ville · 84 m². Ouverture prévue Q3 2026.',
    target: 320000,
    raised: 248000,
    ticketMin: 5000,
    roiTarget: 8.6,
    maturity: 5,
    closingDays: 18,
    risk: 'Faible',
    payback: '4,8 ans',
    teaser: 'Le réseau le plus mature du portefeuille.',
    status: 'open'
  },
  {
    id: 'cookies-bxl',
    brand: 'cookies',
    name: "Cookie's & Milk Bruxelles",
    city: 'Bruxelles',
    kind: 'Kiosque',
    concept: "2e ouverture. Galerie Toison d'Or · 38 m².",
    target: 95000,
    raised: 18000,
    ticketMin: 2500,
    roiTarget: 7.8,
    maturity: 4,
    closingDays: 56,
    risk: 'Modéré',
    payback: '5,1 ans',
    teaser: "Brand en lancement — ticket d'entrée accessible.",
    status: 'open'
  }
];

// ======================================================================
// LEAD PIPELINE STEPS
// ======================================================================
const LEAD_STEPS = [
  { id: 'interested',              label: 'Intérêt exprimé' },
  { id: 'consultant-review',       label: 'Revue consultant' },
  { id: 'first-contact-planned',   label: '1er contact planifié' },
  { id: 'first-contact-done',      label: '1er contact réalisé' },
  { id: 'financing-precheck',      label: 'Pré-check financement' },
  { id: 'location-validation',     label: 'Validation emplacement' },
  { id: 'business-plan',           label: 'Business plan' },
  { id: 'committee',               label: 'Comité de validation' },
  { id: 'contract-prep',           label: 'Préparation contrat' },
  { id: 'training-planning',       label: 'Planning formation' },
  { id: 'opening-planning',        label: 'Planning ouverture' }
];

// ======================================================================
// CANDIDATE LEADS
// ======================================================================
const CANDIDATE_LEADS = [
  {
    id: 'lead-001',
    candidate: {
      name: 'Marie Lemoine',
      email: 'marie.lemoine@example.com',
      phone: '+32 478 11 22 33',
      region: 'bxl',
      capital: '€75k – €150k'
    },
    opportunity: 'op-bxl-cookies',
    currentStep: 'first-contact-done',
    assignedTo: { name: 'Sophie Renard', role: 'Consultante · Réseau Bruxelles' },
    priority: 'high',
    source: 'Candidate opportunity carousel',
    createdAt: '2026-05-12T00:00:00Z',
    lastUpdate: '2026-05-16T09:24:00Z',
    notes: 'Profil très motivé. Expérience retail 8 ans · ex-store manager Decathlon.',
    nextAction: 'Pré-check financement bancaire · échéance 22/05',
    requestedDocuments: ["Pièce d'identité", 'Justificatif de revenus 3 mois', 'Lettre de motivation'],
    appointments: [
      { kind: 'Visioconférence', when: '2026-05-15T14:00:00Z', status: 'done' },
      { kind: 'Visite kiosque pilote · Liège', when: '2026-05-24T10:30:00Z', status: 'planned' }
    ],
    messages: [
      { id: 'lm-001', from: 'consultant', name: 'Sophie Renard', body: "Bonjour Marie, merci pour votre candidature. Je vous propose un appel jeudi 14:00 — ça vous va ?", time: '2026-05-13T10:15:00Z' },
      { id: 'lm-002', from: 'candidate',  name: 'Marie Lemoine', body: 'Parfait, je confirme jeudi 14h. À très vite.', time: '2026-05-13T14:42:00Z' },
      { id: 'lm-003', from: 'consultant', name: 'Sophie Renard', body: "Super échange tout à l'heure. Je vous envoie la liste des documents à préparer pour le pré-check financement.", time: '2026-05-15T15:08:00Z' }
    ],
    history: [
      { step: 'interested',              at: '2026-05-12', by: 'Candidate' },
      { step: 'consultant-review',       at: '2026-05-12', by: 'Système · attribution Sophie Renard' },
      { step: 'first-contact-planned',   at: '2026-05-13', by: 'Sophie Renard' },
      { step: 'first-contact-done',      at: '2026-05-15', by: 'Sophie Renard' }
    ],
    status: 'active'
  },
  {
    id: 'lead-002',
    candidate: {
      name: 'Karim Bensaïd',
      email: 'k.bensaid@example.com',
      phone: '+32 471 88 22 19',
      region: 'wal',
      capital: '€25k – €75k'
    },
    opportunity: 'op-namur-pizza',
    currentStep: 'consultant-review',
    assignedTo: { name: 'Karim Boulahia', role: 'Consultant · Réseau Wallonie' },
    priority: 'normal',
    source: 'Candidate opportunity carousel',
    createdAt: '2026-05-14T00:00:00Z',
    lastUpdate: '2026-05-15T16:48:00Z',
    notes: 'Candidat en reconversion. À approfondir sur la capacité opérationnelle.',
    nextAction: 'Premier appel à planifier · cette semaine',
    requestedDocuments: ['CV à jour', 'Justificatif de revenus'],
    appointments: [],
    messages: [
      { id: 'lm-101', from: 'consultant', name: 'Karim Boulahia', body: "Bonjour Karim, votre profil a été reçu. Je vous propose un appel cette semaine — créneaux disponibles ?", time: '2026-05-14T17:00:00Z' }
    ],
    history: [
      { step: 'interested',        at: '2026-05-14', by: 'Candidate' },
      { step: 'consultant-review', at: '2026-05-14', by: 'Système · attribution Karim Boulahia' }
    ],
    status: 'active'
  },
  {
    id: 'lead-003',
    candidate: {
      name: 'Sophie Vermeulen',
      email: 's.vermeulen@example.com',
      phone: '+32 495 33 44 55',
      region: 'fla',
      capital: '€150k+'
    },
    opportunity: 'op-anvers-couq',
    currentStep: 'committee',
    assignedTo: { name: 'Lara Wauters', role: 'Consultante · Couq' },
    priority: 'high',
    source: 'Candidate opportunity carousel',
    createdAt: '2026-05-02T00:00:00Z',
    lastUpdate: '2026-05-16T13:00:00Z',
    notes: 'Dossier solide. Expérience F&B confirmée, financement validé. À présenter au comité du 24/05.',
    nextAction: 'Comité validation · 24 mai',
    requestedDocuments: ['BP finalisé', 'Engagement bancaire'],
    appointments: [
      { kind: 'Comité de validation', when: '2026-05-24T09:00:00Z', status: 'planned' }
    ],
    messages: [
      { id: 'lm-201', from: 'consultant', name: 'Lara Wauters', body: 'Bonjour Sophie, votre dossier est complet. Nous le présentons au comité le 24 mai. Je vous tiens informée.', time: '2026-05-15T11:00:00Z' }
    ],
    history: [
      { step: 'interested',              at: '2026-05-02', by: 'Candidate' },
      { step: 'consultant-review',       at: '2026-05-02', by: 'Système' },
      { step: 'first-contact-planned',   at: '2026-05-03', by: 'Lara Wauters' },
      { step: 'first-contact-done',      at: '2026-05-06', by: 'Lara Wauters' },
      { step: 'financing-precheck',      at: '2026-05-09', by: 'Lara Wauters' },
      { step: 'location-validation',     at: '2026-05-12', by: 'Lara Wauters' },
      { step: 'business-plan',           at: '2026-05-15', by: 'Lara Wauters' },
      { step: 'committee',               at: '2026-05-16', by: 'Système' }
    ],
    status: 'active'
  }
];

// ======================================================================
// CANDIDATES
// ======================================================================
const OPP_VALIDATION_STATUSES = [
  { id: 'to-analyse',    label: 'À analyser',              tone: 'neutral' },
  { id: 'in-discussion', label: 'En discussion',           tone: 'info' },
  { id: 'recommended',   label: 'Opportunité recommandée', tone: 'warning' },
  { id: 'validated',     label: 'Validée pour lancement',  tone: 'success' },
  { id: 'rejected',      label: 'Refusée',                 tone: 'danger' },
  { id: 'on-hold',       label: 'Mise en attente',         tone: 'muted' }
];

const CANDIDATES = [
  {
    id: 'cand-001',
    firstName: 'Marie',
    lastName: 'Lemoine',
    email: 'marie.lemoine@example.com',
    phone: '+32 478 11 22 33',
    address: 'Avenue Louise 142 · 1050 Bruxelles',
    preferredRegion: 'bxl',
    language: 'Français · Néerlandais (B2) · Anglais (C1)',
    experience: 'Store Manager Decathlon Bruxelles (5 ans) · Assistante manager Carrefour (3 ans)',
    currentSituation: 'En poste · disponible à 3 mois',
    motivation: "Envie d'entreprendre dans un cadre structuré. Passion produit, fibre managériale.",
    budget: 75000,
    financingCapacity: "Apport personnel + prêt bancaire pré-accepté (BNP Fortis) jusqu'à 150 000 €.",
    brandPreference: ['cookies', 'couq'],
    locationPreference: 'Bruxelles centre-ville · Ixelles · Etterbeek',
    internalNotes: "Profil très solide, lien fort possible avec Cookie's & Milk. À présenter au comité après validation BP.",
    generalStatus: 'En pré-analyse',
    createdAt: '2026-05-12T00:00:00Z',
    opportunities: [
      {
        id: 'opp-link-001',
        opportunityId: 'op-bxl-cookies',
        brand: 'cookies',
        projectType: 'Kiosque',
        location: "Bruxelles · Galerie Toison d'Or",
        validationStatus: 'recommended',
        fitScore: 92,
        consultantNotes: 'Très bon match. Budget aligné, expérience retail forte, localisation cohérente.',
        documents: ['CV', 'Lettre de motivation', 'Pré-accord bancaire'],
        history: [
          { at: '2026-05-12', author: 'Système',       body: "Intérêt exprimé via le carousel d'opportunités." },
          { at: '2026-05-13', author: 'Sophie Renard', body: '1er appel · candidate motivée, profil très adapté.' },
          { at: '2026-05-15', author: 'Sophie Renard', body: 'Pré-check financement validé · pré-accord bancaire fourni.' }
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
          { at: '2026-05-13', author: 'Marie Lemoine', body: 'A demandé spontanément à voir cette opportunité aussi.' },
          { at: '2026-05-14', author: 'Sophie Renard', body: 'Discussion en cours sur la mobilité. À trancher avec elle.' }
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
          { at: '2026-05-14', author: 'Sophie Renard', body: "Mise en attente · à reconsidérer si les options Cookie's tombent." }
        ]
      }
    ]
  },
  {
    id: 'cand-002',
    firstName: 'Karim',
    lastName: 'Bensaïd',
    email: 'k.bensaid@example.com',
    phone: '+32 471 88 22 19',
    address: 'Rue de Bruxelles 45 · 5000 Namur',
    preferredRegion: 'wal',
    language: 'Français · Anglais (B2)',
    experience: 'Cadre commercial 8 ans · reconversion en cours.',
    currentSituation: 'En reconversion · disponible immédiatement',
    motivation: 'Quitter le salariat pour entreprendre en franchise · attirance pour la restauration rapide.',
    budget: 45000,
    financingCapacity: "Apport personnel + recherche prêt à hauteur de 100 000 €.",
    brandPreference: ['mania', 'atelier'],
    locationPreference: 'Namur · Charleroi · Liège',
    internalNotes: 'Profil à approfondir sur la capacité opérationnelle terrain.',
    generalStatus: 'À analyser',
    createdAt: '2026-05-14T00:00:00Z',
    opportunities: [
      {
        id: 'opp-link-101',
        opportunityId: 'op-namur-pizza',
        brand: 'mania',
        projectType: 'Pizzeria',
        location: 'Namur · Rue de Fer',
        validationStatus: 'to-analyse',
        fitScore: 64,
        consultantNotes: "Localisation parfaite. À valider sur l'expérience F&B et le tour de table financier.",
        documents: ['CV'],
        history: [
          { at: '2026-05-14', author: 'Système', body: "Intérêt exprimé via le carousel d'opportunités." }
        ]
      }
    ]
  }
];

// ======================================================================
// NEW BRAND LEADS
// ======================================================================
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
    description: 'Boulangerie végétale autour des plantes locales et des céréales anciennes belges. Pain levé long + boutique épicerie de quartier.',
    inspirations: 'Bourke Street Bakery, Maison Aleph, Du Pain et des Idées.',
    attachments: ['mood-board.pdf'],
    status: 'to-analyse',
    assignedTo: 'Sam Verheyden · Brand strategy',
    createdAt: '2026-05-14T00:00:00Z'
  },
  {
    id: 'nbl-002',
    candidate: { name: 'Tom Janssen', email: 'tom.janssen@example.com', phone: '+32 478 55 88 22' },
    projectName: 'Stir',
    conceptType: 'coffee',
    location: 'Antwerpen · Zuid',
    budget: 65000,
    description: 'Coffee bar single-origin avec lab pâtisserie maison. Service rapide, retail beans et un comptoir de dégustation.',
    inspirations: 'Blue Bottle, Hard Beans.',
    attachments: [],
    status: 'in-discussion',
    assignedTo: 'Loïc Verheyden · Assistance Manager',
    createdAt: '2026-05-12T00:00:00Z'
  }
];

// ======================================================================
// INVESTORS
// ======================================================================
const INVESTORS = [
  {
    id: 'inv-001',
    name: 'Claire Vermeulen',
    initials: 'CV',
    since: '2023-06-01',
    email: 'claire.vermeulen@example.com',
    role: 'Investisseur particulier',
    tier: 'Privilège',
    phone: '+32 477 12 34 56',
    address: 'Avenue Louise 142 · 1050 Bruxelles',
    nationality: 'Belge',
    iban: 'BE68 5390 0754 7034',
    passwordHash: '$2b$10$PLACEHOLDER_HASH_FOR_DEMO',
    brands: ['atelier', 'couq', 'cookies', 'mania'],
    totalInvested: 85000,
    totalRepaid: 8580
  },
  {
    id: 'inv-002',
    name: 'Marc Dubois',
    initials: 'MD',
    since: '2024-01-15',
    email: 'marc.dubois@example.com',
    role: 'Investisseur professionnel',
    tier: 'Premium',
    phone: '+32 475 98 76 54',
    address: 'Rue de la Loi 23 · 1040 Bruxelles',
    nationality: 'Belge',
    iban: 'BE12 3456 7890 1234',
    passwordHash: '$2b$10$PLACEHOLDER_HASH_FOR_DEMO',
    brands: ['mania', 'atelier'],
    totalInvested: 35000,
    totalRepaid: 2100
  }
];

// ======================================================================
// BRAND PORTFOLIOS (per investor)
// ======================================================================

function genSeries(base, growth, jitter = 0.05, n = 12, seed = 7) {
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
        id: 'couq-chatelain',
        brand: 'couq',
        name: 'Couq Châtelain',
        city: 'Bruxelles',
        kind: 'Boulangerie',
        opened: '2024-06-01',
        invested: 25000,
        repaid: 4100,
        roiTarget: 8.2,
        roiCurrent: 8.0,
        networkRank: 1,
        networkTotal: 2,
        health: 'good',
        kpiSnapshot: { ca: 64000, profit: 14.2, cust: 220, basket: 6.9, vsBudget: 6.8 },
        consultant: {
          name: 'Lara Wauters',
          lastVisit: '2026-05-12',
          verdict: 'on-track',
          summary: 'Excellent tempo matinal. Vente de couques signature 38 % du CA.',
          action: 'Tester une box dégustation 6 couques pour la vente du soir.'
        },
        franchisee: { name: 'Tom Verstraeten', tier: 'Argent', overall: 4.4, since: '2024-05-01' }
      },
      {
        id: 'couq-saintgery',
        brand: 'couq',
        name: 'Couq Saint-Géry',
        city: 'Bruxelles',
        kind: 'Boulangerie',
        opened: '2025-01-01',
        invested: 20000,
        repaid: 2100,
        roiTarget: 8.2,
        roiCurrent: 7.2,
        networkRank: 2,
        networkTotal: 2,
        health: 'good',
        kpiSnapshot: { ca: 48000, profit: 11.8, cust: 168, basket: 6.4, vsBudget: -2.4 },
        consultant: {
          name: 'Lara Wauters',
          lastVisit: '2026-05-06',
          verdict: 'on-track',
          summary: 'Démarrage solide. Devanture brique fonctionne comme appel de loin.',
          action: 'Élargir le four pour absorber la fournée du dimanche.'
        },
        franchisee: { name: 'Mila De Vos', tier: 'Argent', overall: 4.1, since: '2024-12-01' }
      }
    ]
  },
  cookies: {
    summary: { invested: 18000, repaid: 1400, valuation: 19200, roiTarget: 7.5, roiCurrent: 7.1, networkSize: 1 },
    ca12m: genSeries(22000, 0.22, 0.08, 12, 33),
    budget12m: genSeries(21000, 0.18, 0.03, 12, 34),
    shops: [
      {
        id: 'cookies-outremeuse',
        brand: 'cookies',
        name: "Cookie's & Milk Outremeuse",
        city: 'Liège',
        kind: 'Kiosque',
        opened: '2025-09-01',
        invested: 18000,
        repaid: 1400,
        roiTarget: 7.5,
        roiCurrent: 7.1,
        networkRank: 1,
        networkTotal: 1,
        health: 'good',
        kpiSnapshot: { ca: 26800, profit: 9.4, cust: 86, basket: 8.9, vsBudget: 3.2 },
        consultant: {
          name: 'Sophie Renard',
          lastVisit: '2026-05-09',
          verdict: 'on-track',
          summary: 'Concept dessert bien adopté localement. Pic du goûter (15h-18h) très fort.',
          action: 'Tester une offre boîte de 6 cookies à emporter pour les écoles.'
        },
        franchisee: { name: 'Estelle Marchand', tier: 'Bronze', overall: 4.0, since: '2025-08-01' }
      }
    ]
  },
  mania: {
    summary: { invested: 22000, repaid: 980, valuation: 23200, roiTarget: 8.8, roiCurrent: 8.4, networkSize: 1 },
    ca12m: genSeries(38000, 0.35, 0.08, 12, 41),
    budget12m: genSeries(36000, 0.30, 0.03, 12, 42),
    shops: [
      {
        id: 'mania-mons',
        brand: 'mania',
        name: 'Mania Pizza Mons',
        city: 'Mons',
        kind: 'Pizzeria',
        opened: '2025-10-01',
        invested: 22000,
        repaid: 980,
        roiTarget: 8.8,
        roiCurrent: 8.4,
        networkRank: 1,
        networkTotal: 1,
        health: 'good',
        kpiSnapshot: { ca: 51200, profit: 13.6, cust: 240, basket: 7.4, vsBudget: 4.8 },
        consultant: {
          name: 'Karim Boulahia',
          lastVisit: '2026-05-04',
          verdict: 'on-track',
          summary: "Démarrage en force, file d'attente le vendredi soir. Équipe à renforcer.",
          action: 'Recrutement immédiat : 1 pizzaiolo + 1 caisse pour week-end.'
        },
        franchisee: { name: 'Dario Sartori', tier: 'Argent', overall: 4.3, since: '2025-09-01' }
      }
    ]
  }
};

// ======================================================================
// BRAND PRESENTATIONS
// ======================================================================
const BRAND_PRESENTATION = {
  atelier: {
    hero: {
      baseline: 'La boulangerie de quartier, au geste artisanal.',
      concept: "Un réseau de boulangeries-pâtisseries de proximité qui ramène le pain levé long, les viennoiseries pur beurre et le service de quartier au cœur de chaque ville belge.",
      message: "Investissez dans un réseau de 47 magasins en pleine expansion · TRI cible 8,4 %.",
      cta: 'Manifester un intérêt',
      secondaryCta: 'Télécharger le deck',
      media: 'img/shop-1.png'
    },
    carousel: [
      { kind: 'image', src: 'img/shop-1.png', caption: "L'Atelier Châtelain — Bruxelles, 2024" },
      { kind: 'kpi', metrics: [{ label: 'Magasins', value: '47' }, { label: 'TRI moyen', value: '8,4 %' }, { label: 'CA moyen / mag.', value: '1,1 M€' }, { label: 'Maturité', value: '5 ans' }], title: 'Le réseau en chiffres', sub: 'Données 2025 · réseau consolidé' },
      { kind: 'image', src: 'img/shop-2.png', caption: "L'Atelier Sablon — Bruxelles, 2024" },
      { kind: 'concept', title: 'Le geste artisanal, multiplié', body: 'Chaque magasin produit sur place. Pas de pré-pétri, pas de surgelé. La fournée du matin est le contrat passé avec le quartier.' },
      { kind: 'image', src: 'img/shop-3.png', caption: "L'Atelier Anvers — Antwerpen, 2023" },
      { kind: 'text', title: 'Positionnement', body: 'Entre la boulangerie de tradition et le concept lifestyle. Un produit haut-de-gamme accessible, une expérience de quartier premium.' },
      { kind: 'highlight', title: 'Investment highlight', body: "Tax shelter applicable · 8,4 % TRI cible · maturité 5 ans · ticket dès 5 000 €." }
    ],
    investment: { minTicket: 5000, roiTarget: 8.4, payback: '4,8 ans', openOpps: 1, networkSize: 47, networkPerfLabel: '+8,4 % CA moyen vs budget 2025' },
    team: [
      { role: 'Co-fondateur',               person: { name: 'Sam Verheyden',   desc: 'Co-fondateur · stratégie & gouvernance',        contact: true } },
      { role: 'Co-fondateur',               person: { name: 'Loïc Verheyden',  desc: 'Co-fondateur · opérations & développement',    contact: true } },
      { role: 'Marketing Manager',          person: { name: 'Sam Verheyden',   desc: 'Communication, contenu et activation locale.', contact: false } },
      { role: 'Operational Manager',        person: { name: 'Claire Dubois',   desc: 'Production, qualité, achats et logistique.',   contact: false } },
      { role: 'Development & Marketing',    person: { name: 'Nora Vandenberg', desc: 'Développement territorial Belgique + France.',  contact: false } }
    ],
    documents: [
      { kind: 'Brand deck',             title: "L'Atelier By — Deck investisseur 2026", size: '4,2 MB' },
      { kind: 'Dossier franchise',      title: 'Dossier franchise complet',              size: '6,8 MB' },
      { kind: 'Dossier investissement', title: 'Memorandum investisseur 2026',           size: '2,4 MB' },
      { kind: 'Projections',            title: 'Modèle financier 5 ans',                 size: '1,1 MB' },
      { kind: 'Contrat type',           title: 'Convention de prêt — modèle',            size: '480 KB' },
      { kind: 'Légal',                  title: 'Statuts & gouvernance',                  size: '720 KB' }
    ],
    opportunitiesPitch: 'Le réseau le plus mature du portefeuille. Le projet Gand est en pré-closing — co-investissement disponible.'
  },
  couq: {
    hero: {
      baseline: 'La couque au beurre, vraie, fourrée, fournée chaque matin.',
      concept: 'Couq est une boulangerie-pâtisserie de quartier centrée sur la couque au beurre fourrée. Pâte feuilletée 3 jours, beurre AOP, fournée à 6h30.',
      message: "Pilote en pré-ouverture · TRI cible 8,2 % · ticket dès 7 500 €.",
      cta: 'Manifester un intérêt',
      secondaryCta: 'Télécharger le deck',
      media: 'img/couq-logo.jpg'
    },
    investment: { minTicket: 7500, roiTarget: 8.2, payback: '4,5 ans', openOpps: 1, networkSize: 1, networkPerfLabel: '+3,9 % CA moyen vs budget 2025 (pilote)' },
    team: [
      { role: 'Co-fondateur',             person: { name: 'Tom Verstraeten', desc: 'Co-fondateur · produit & opérations.',               contact: true } },
      { role: 'Brand strategy',           person: { name: 'Sam Verheyden',   desc: 'Identité visuelle, architecture de marque.',         contact: true } },
      { role: 'Assistance Manager',       person: { name: 'Loïc Verheyden',  desc: 'Accompagnement franchisés et coordination réseau.', contact: true } },
      { role: 'Marketing Manager',        person: { name: 'Nathan Charlot',  desc: 'Activation locale, contenu et partenariats.',       contact: true } },
      { role: 'Operational Manager',      person: { name: 'Mila De Vos',     desc: 'Production, formation équipes, qualité produit.',   contact: false } }
    ],
    documents: [
      { kind: 'Brand deck',             title: 'Couq — Deck investisseur 2026', size: '3,1 MB' },
      { kind: 'Dossier franchise',      title: 'Dossier franchise 2026',        size: '4,2 MB' },
      { kind: 'Dossier investissement', title: 'Memorandum investisseur',        size: '1,8 MB' },
      { kind: 'Projections',            title: 'Modèle financier 5 ans',         size: '920 KB' }
    ],
    opportunitiesPitch: 'Couq Saint-Géry en pré-ouverture — co-investissement avec 3 investisseurs fondateurs.'
  },
  cookies: {
    hero: {
      baseline: 'Cookies maison, lait frappé, après-midi sucrée.',
      concept: "Un dessert bar en format kiosque : cookies cuits à la minute, milkshakes onctueux, café spécialité. Premier pilote à Liège.",
      message: "Brand en lancement · ticket d'entrée accessible · TRI cible 7,5 %.",
      cta: 'Manifester un intérêt',
      secondaryCta: 'Télécharger le deck',
      media: null
    },
    investment: { minTicket: 2500, roiTarget: 7.5, payback: '5,1 ans', openOpps: 1, networkSize: 1, networkPerfLabel: '+3,2 % CA moyen vs budget 2025 (pilote)' },
    team: [
      { role: 'Co-fondatrice',       person: { name: 'Estelle Marchand', desc: 'Co-fondatrice · produit & franchisée pilote.', contact: true } },
      { role: 'Brand strategy',      person: { name: 'Sam Verheyden',    desc: 'Identité visuelle et architecture du concept.', contact: true } },
      { role: 'Assistance Manager',  person: { name: 'Loïc Verheyden',   desc: 'Référent franchisés, formation et lancement.', contact: true } },
      { role: 'Marketing Manager',   person: { name: 'Nathan Charlot',   desc: 'Communauté, contenus et partenariats locaux.', contact: true } }
    ],
    documents: [
      { kind: 'Brand deck',             title: "Cookie's & Milk — Deck investisseur", size: '2,8 MB' },
      { kind: 'Dossier investissement', title: 'Memorandum investisseur',              size: '1,4 MB' },
      { kind: 'Projections',            title: 'Modèle financier 4 ans',               size: '880 KB' }
    ],
    opportunitiesPitch: "Cookie's Bruxelles en pré-lancement (Galerie Toison d'Or). Ticket d'entrée le plus accessible du portefeuille."
  },
  mania: {
    hero: {
      baseline: 'Pizza romaine al taglio · à la part, au poids.',
      concept: 'Pizza romaine al taglio servie à la part, au poids. Pâte 72h, cuisson en plaque, débit élevé. Premier magasin à Mons.',
      message: 'Lancement en force · TRI cible 8,8 %.',
      cta: 'Manifester un intérêt',
      secondaryCta: 'Télécharger le deck',
      media: null
    },
    investment: { minTicket: 5000, roiTarget: 8.8, payback: '4,2 ans', openOpps: 1, networkSize: 1, networkPerfLabel: '+4,8 % CA moyen vs budget 2025 (pilote)' },
    team: [
      { role: 'Co-fondateur',          person: { name: 'Dario Sartori',  desc: 'Co-fondateur · produit, pâte & process (ex-Bonci).', contact: true } },
      { role: 'Brand strategy',        person: { name: 'Sam Verheyden',  desc: 'Identité, retail design, architecture de marque.',    contact: true } },
      { role: 'Assistance Manager',    person: { name: 'Loïc Verheyden', desc: 'Référent franchisés, lancement et réseau.',           contact: true } },
      { role: 'Marketing Manager',     person: { name: 'Nathan Charlot', desc: 'Activation locale, contenu et partenariats.',         contact: true } },
      { role: 'Operational Manager',   person: { name: 'Marco Bellucci', desc: 'Centrale de production pâte · logistique J.',         contact: false } },
      { role: 'Development',           person: { name: 'Sophie Renard',  desc: 'Développement territorial Wallonie + Nord France.',   contact: false } }
    ],
    documents: [
      { kind: 'Brand deck',             title: 'Mania Pizza — Deck investisseur', size: '3,6 MB' },
      { kind: 'Dossier franchise',      title: 'Dossier franchise 2026',          size: '4,8 MB' },
      { kind: 'Dossier investissement', title: 'Memorandum investisseur',          size: '2,1 MB' },
      { kind: 'Projections',            title: 'Modèle financier 5 ans',           size: '960 KB' }
    ],
    opportunitiesPitch: 'Mania Namur en closing — co-investissement ouvert. Pilote Mons en avance sur plan.'
  }
};

// ======================================================================
// SHOPS (flat list across all brands)
// ======================================================================
const SHOPS = [
  {
    id: 'atelier-chatelain',
    brand: 'atelier',
    name: "L'Atelier Châtelain",
    city: 'Bruxelles',
    region: 'bxl',
    kind: 'Boulangerie',
    opened: '2024-03-12',
    status: 'open',
    health: 'good',
    invested: 45000,
    repaid: 8200,
    roiTarget: 8.4,
    roiCurrent: 8.6,
    kpiSnapshot: { ca: 98000, profit: 17.8, cust: 280, basket: 7.2, vsBudget: 8.4 },
    franchisee: { name: 'Camille Leroy', tier: 'Or', overall: 4.7, since: '2024-02-01' },
    address: 'Place du Châtelain 12, 1050 Bruxelles'
  },
  {
    id: 'atelier-sablon',
    brand: 'atelier',
    name: "L'Atelier Sablon",
    city: 'Bruxelles',
    region: 'bxl',
    kind: 'Boulangerie',
    opened: '2024-09-04',
    status: 'open',
    health: 'good',
    invested: 40000,
    repaid: 4800,
    roiTarget: 8.4,
    roiCurrent: 8.1,
    kpiSnapshot: { ca: 87000, profit: 15.2, cust: 240, basket: 7.0, vsBudget: 5.1 },
    franchisee: { name: 'Thibaut Moreau', tier: 'Argent', overall: 4.4, since: '2024-08-01' },
    address: 'Rue de la Régence 14, 1000 Bruxelles'
  },
  {
    id: 'atelier-uccle',
    brand: 'atelier',
    name: "L'Atelier Uccle",
    city: 'Bruxelles',
    region: 'bxl',
    kind: 'Boulangerie',
    opened: '2025-01-19',
    status: 'open',
    health: 'good',
    invested: 38000,
    repaid: 2900,
    roiTarget: 8.4,
    roiCurrent: 7.8,
    kpiSnapshot: { ca: 72000, profit: 14.1, cust: 210, basket: 6.8, vsBudget: 2.3 },
    franchisee: { name: 'Sarah Dupont', tier: 'Bronze', overall: 4.2, since: '2024-12-01' },
    address: 'Avenue Brugmann 34, 1180 Uccle'
  },
  {
    id: 'atelier-antwerpen',
    brand: 'atelier',
    name: "L'Atelier Anvers",
    city: 'Antwerpen',
    region: 'fla',
    kind: 'Boulangerie',
    opened: '2023-06-08',
    status: 'open',
    health: 'good',
    invested: 42000,
    repaid: 9800,
    roiTarget: 8.4,
    roiCurrent: 9.1,
    kpiSnapshot: { ca: 112000, profit: 18.9, cust: 310, basket: 7.4, vsBudget: 10.2 },
    franchisee: { name: 'Pieter Van den Berg', tier: 'Or', overall: 4.8, since: '2023-05-01' },
    address: 'Meir 42, 2000 Antwerpen'
  },
  {
    id: 'atelier-liege',
    brand: 'atelier',
    name: "L'Atelier Liège",
    city: 'Liège',
    region: 'wal',
    kind: 'Boulangerie · Pop-up',
    opened: '2025-03-01',
    status: 'open',
    health: 'watch',
    invested: 15000,
    repaid: 800,
    roiTarget: 7.8,
    roiCurrent: 6.9,
    kpiSnapshot: { ca: 34000, profit: 9.2, cust: 115, basket: 6.1, vsBudget: -4.2 },
    franchisee: { name: 'Julie Lambert', tier: 'Bronze', overall: 3.8, since: '2025-02-01' },
    address: 'Place du Marché 8, 4000 Liège'
  },
  ...Object.values(BRAND_PORTFOLIOS).flatMap(p => p.shops)
];

// ======================================================================
// CONSULTANTS
// ======================================================================
const CONSULTANTS = [
  {
    id: 'cons-001',
    name: 'Sophie Renard',
    role: 'Consultante · Réseau Bruxelles / Cookies',
    email: 'sophie.renard@fg.be',
    phone: '+32 476 11 22 33',
    region: 'bxl',
    brands: ['cookies', 'atelier'],
    avatar: null,
    bio: 'Spécialiste réseau Bruxelles. 8 ans en développement franchise.',
    availability: 'Lundi–Vendredi 09:00–18:00',
    schedule: [
      { date: '2026-05-20', time: '10:00', type: 'Appel candidat', candidate: 'Marie Lemoine', status: 'confirmed' },
      { date: '2026-05-22', time: '14:00', type: 'Visite magasin', shop: "Cookie's Outremeuse", status: 'confirmed' },
      { date: '2026-05-24', time: '09:00', type: 'Comité validation', candidate: 'Sophie Vermeulen', status: 'confirmed' }
    ],
    leadsCount: 2,
    activeLeads: ['lead-001']
  },
  {
    id: 'cons-002',
    name: 'Karim Boulahia',
    role: 'Consultant · Réseau Wallonie / Mania',
    email: 'karim.boulahia@fg.be',
    phone: '+32 477 44 55 66',
    region: 'wal',
    brands: ['mania', 'atelier'],
    avatar: null,
    bio: 'Expert retail & food service. Spécialiste Wallonie.',
    availability: 'Lundi–Vendredi 08:30–17:30',
    schedule: [
      { date: '2026-05-19', time: '11:00', type: 'Appel candidat', candidate: 'Karim Bensaïd', status: 'pending' },
      { date: '2026-05-21', time: '14:30', type: 'Visite magasin', shop: 'Mania Mons', status: 'confirmed' }
    ],
    leadsCount: 1,
    activeLeads: ['lead-002']
  },
  {
    id: 'cons-003',
    name: 'Lara Wauters',
    role: 'Consultante · Couq / Flandre',
    email: 'lara.wauters@fg.be',
    phone: '+32 495 77 88 99',
    region: 'fla',
    brands: ['couq'],
    avatar: null,
    bio: 'Spécialiste développement Flandre. Ancienne directrice de réseau.',
    availability: 'Lundi–Vendredi 09:00–17:00',
    schedule: [
      { date: '2026-05-24', time: '09:00', type: 'Comité validation', candidate: 'Sophie Vermeulen', status: 'confirmed' }
    ],
    leadsCount: 1,
    activeLeads: ['lead-003']
  }
];

// ======================================================================
// DEVELOPERS (real estate)
// ======================================================================
const DEVELOPERS = [
  {
    id: 'dev-001',
    name: 'Immobilière Belge SA',
    contactName: 'Jean-Luc Fontaine',
    email: 'jl.fontaine@immobel.be',
    phone: '+32 2 345 67 89',
    type: 'Promoteur institutionnel',
    regions: ['bxl', 'wal'],
    submittedAt: '2026-04-10T00:00:00Z',
    status: 'active',
    locations: [
      {
        id: 'loc-001',
        address: 'Chaussée de Charleroi 200, 1060 Bruxelles',
        surface: '85 m²',
        type: 'Cellule commerciale rez',
        availability: '2026-09-01',
        rent: 2800,
        notes: 'Angle rue · forte visibilité piétonne',
        status: 'available'
      }
    ]
  },
  {
    id: 'dev-002',
    name: 'Retail Spaces BV',
    contactName: 'Dirk Van Meerbeek',
    email: 'd.vanmeerbeek@retailspaces.be',
    phone: '+32 3 456 78 90',
    type: 'Gestionnaire patrimonial',
    regions: ['fla'],
    submittedAt: '2026-03-22T00:00:00Z',
    status: 'active',
    locations: [
      {
        id: 'loc-002',
        address: 'Nationalestraat 88, 2000 Antwerpen',
        surface: '72 m²',
        type: 'Cellule en galerie',
        availability: '2026-07-01',
        rent: 3200,
        notes: 'Dans galerie piétonne · trafic 12k/jour',
        status: 'under-review'
      }
    ]
  }
];

// ======================================================================
// DOCUMENTS
// ======================================================================
const DOC_TYPES = [
  { id: 'investment', label: "Documents d'investissement" },
  { id: 'ownership',  label: 'Documents de propriété' },
  { id: 'kyc',        label: 'KYC' },
  { id: 'aml',        label: 'AML' },
  { id: 'banking',    label: 'Documents bancaires' },
  { id: 'tax',        label: 'Documents fiscaux' },
  { id: 'contract',   label: 'Contrats' },
  { id: 'schedule',   label: 'Échéanciers' },
  { id: 'statement',  label: 'Relevés' }
];

const FG_DOCS = [
  { id: 'd-kyc-id',     type: 'kyc',     brand: null,      project: null,              title: "Pièce d'identité — Carte d'identité belge",   sub: 'Recto + verso',                          date: '2023-06-15', expiry: '2033-06-15', status: 'validated', size: '2,4 MB',  url: '/uploads/d-kyc-id.pdf' },
  { id: 'd-kyc-addr',   type: 'kyc',     brand: null,      project: null,              title: 'Justificatif de domicile',                     sub: 'Composition de ménage · Commune Ixelles', date: '2023-06-15', expiry: '2026-06-15', status: 'expired',   size: '320 KB', url: '/uploads/d-kyc-addr.pdf' },
  { id: 'd-aml-decl',   type: 'aml',     brand: null,      project: null,              title: "Déclaration d'origine des fonds",              sub: 'Formulaire AML signé',                    date: '2023-06-20', expiry: null,         status: 'validated', size: '180 KB', url: '/uploads/d-aml-decl.pdf' },
  { id: 'd-aml-pep',    type: 'aml',     brand: null,      project: null,              title: 'Déclaration PEP / sanctions',                  sub: 'Annuel · 2026',                           date: '2026-01-15', expiry: '2027-01-15', status: 'validated', size: '120 KB', url: '/uploads/d-aml-pep.pdf' },
  { id: 'd-bank-iban',  type: 'banking', brand: null,      project: null,              title: 'Attestation bancaire IBAN',                    sub: 'BE68 53.. · BNP Paribas Fortis',          date: '2023-06-15', expiry: null,         status: 'validated', size: '95 KB',  url: '/uploads/d-bank-iban.pdf' },
  { id: 'd-bank-rib',   type: 'banking', brand: null,      project: null,              title: 'RIB — versements & remboursements',            sub: 'Mis à jour 02/2026',                      date: '2026-02-12', expiry: null,         status: 'validated', size: '180 KB', url: '/uploads/d-bank-rib.pdf' },
  { id: 'd-own-shares', type: 'ownership',brand: null,     project: null,              title: 'Récapitulatif de portefeuille',                sub: 'Édition trimestrielle · Q1 2026',         date: '2026-04-05', expiry: null,         status: 'validated', size: '1,1 MB', url: '/uploads/d-own-shares.pdf' },
  { id: 'd-own-cert',   type: 'ownership',brand: null,     project: null,              title: 'Attestation de participation',                 sub: 'Toutes marques · 2025',                   date: '2026-01-15', expiry: null,         status: 'validated', size: '420 KB', url: '/uploads/d-own-cert.pdf' },
  { id: 'd-tax-2025',   type: 'tax',     brand: null,      project: null,              title: 'Attestation fiscale 2025',                     sub: 'Tax shelter · exercice 2025',             date: '2026-02-15', expiry: null,         status: 'validated', size: '320 KB', url: '/uploads/d-tax-2025.pdf' },
  { id: 'd-tax-recap',  type: 'tax',     brand: null,      project: null,              title: 'Récapitulatif intérêts perçus 2025',           sub: 'Déclaration IPP · case 1156',             date: '2026-02-15', expiry: null,         status: 'validated', size: '210 KB', url: '/uploads/d-tax-recap.pdf' },
  { id: 'd-c-chat',     type: 'contract',brand: 'atelier', project: 'chatelain',       title: "Convention de prêt — L'Atelier Châtelain",    sub: 'Signé DocuSign le 12/03/2024',            date: '2024-03-12', expiry: '2029-03-12', status: 'signed',    size: '1,2 MB', url: '/uploads/d-c-chat.pdf' },
  { id: 'd-c-sab',      type: 'contract',brand: 'atelier', project: 'sablon',          title: "Convention de prêt — L'Atelier Sablon",       sub: 'Signé DocuSign le 04/09/2024',            date: '2024-09-04', expiry: '2029-09-04', status: 'signed',    size: '1,1 MB', url: '/uploads/d-c-sab.pdf' },
  { id: 'd-c-ucc',      type: 'contract',brand: 'atelier', project: 'uccle',           title: "Convention de prêt — L'Atelier Uccle",        sub: 'Signé DocuSign le 19/01/2025',            date: '2025-01-19', expiry: '2030-01-19', status: 'signed',    size: '1,2 MB', url: '/uploads/d-c-ucc.pdf' },
  { id: 'd-c-anv',      type: 'contract',brand: 'atelier', project: 'antwerpen',       title: "Convention de prêt — L'Atelier Anvers",       sub: 'Signé DocuSign le 08/06/2023',            date: '2023-06-08', expiry: '2028-06-08', status: 'signed',    size: '1,3 MB', url: '/uploads/d-c-anv.pdf' },
  { id: 'd-c-lie',      type: 'contract',brand: 'atelier', project: 'liege',           title: "Convention de prêt — L'Atelier Liège",        sub: 'Avenant n°1 à signer · prolongation Pop-Up', date: '2026-05-02', expiry: null,      status: 'pending',   size: '480 KB', url: '/uploads/d-c-lie.pdf' },
  { id: 'd-s-chat',     type: 'schedule',brand: 'atelier', project: 'chatelain',       title: "Échéancier de remboursement — Châtelain",     sub: "Tableau d'amortissement 60 mois",         date: '2024-03-12', expiry: null,         status: 'validated', size: '180 KB', url: '/uploads/d-s-chat.pdf' },
  { id: 'd-s-anv',      type: 'schedule',brand: 'atelier', project: 'antwerpen',       title: "Échéancier de remboursement — Anvers",        sub: "Tableau d'amortissement 60 mois",         date: '2023-06-08', expiry: null,         status: 'validated', size: '180 KB', url: '/uploads/d-s-anv.pdf' },
  { id: 'd-rep-apr',    type: 'statement',brand: 'atelier',project: 'all',             title: 'Relevé mensuel — Avril 2026',                  sub: 'Versements & intérêts cumulés',           date: '2026-05-02', expiry: null,         status: 'validated', size: '240 KB', url: '/uploads/d-rep-apr.pdf' },
  { id: 'd-rep-mar',    type: 'statement',brand: 'atelier',project: 'all',             title: 'Relevé mensuel — Mars 2026',                   sub: 'Versements & intérêts cumulés',           date: '2026-04-02', expiry: null,         status: 'validated', size: '240 KB', url: '/uploads/d-rep-mar.pdf' },
  { id: 'd-c-couqchat', type: 'contract',brand: 'couq',   project: 'couq-chatelain',  title: 'Convention de prêt — Couq Châtelain',         sub: 'Signé DocuSign le 04/06/2024',            date: '2024-06-04', expiry: '2029-06-04', status: 'signed',    size: '980 KB', url: '/uploads/d-c-couqchat.pdf' },
  { id: 'd-c-couqsg',   type: 'contract',brand: 'couq',   project: 'couq-saintgery',  title: 'Convention de prêt — Couq Saint-Géry',        sub: 'Signé DocuSign le 18/12/2024',            date: '2024-12-18', expiry: '2029-12-18', status: 'signed',    size: '1,0 MB', url: '/uploads/d-c-couqsg.pdf' },
  { id: 'd-s-couqchat', type: 'schedule',brand: 'couq',   project: 'couq-chatelain',  title: 'Échéancier — Couq Châtelain',                  sub: "Tableau d'amortissement 60 mois",         date: '2024-06-04', expiry: null,         status: 'validated', size: '160 KB', url: '/uploads/d-s-couqchat.pdf' },
  { id: 'd-c-coook',    type: 'contract',brand: 'cookies',project: 'cookies-outremeuse',title: "Convention de prêt — Cookie's Outremeuse",  sub: 'Signé DocuSign le 02/09/2025',            date: '2025-09-02', expiry: '2030-09-02', status: 'signed',    size: '920 KB', url: '/uploads/d-c-coook.pdf' },
  { id: 'd-c-mania',    type: 'contract',brand: 'mania',  project: 'mania-mons',      title: 'Convention de prêt — Mania Pizza Mons',        sub: 'Signé DocuSign le 03/10/2025',            date: '2025-10-03', expiry: '2030-10-03', status: 'signed',    size: '1,1 MB', url: '/uploads/d-c-mania.pdf' },
  { id: 'd-s-mania',    type: 'schedule',brand: 'mania',  project: 'mania-mons',      title: 'Échéancier — Mania Pizza Mons',                sub: "Tableau d'amortissement 60 mois",         date: '2025-10-03', expiry: null,         status: 'validated', size: '170 KB', url: '/uploads/d-s-mania.pdf' },
  { id: 'd-i-gent',     type: 'investment',brand: 'atelier',project: null,            title: "Memorandum d'investissement — L'Atelier Gand", sub: 'Q3 2026 · pré-engagement',               date: '2026-04-02', expiry: null,         status: 'validated', size: '2,4 MB', url: '/uploads/d-i-gent.pdf' },
  { id: 'd-i-namur',    type: 'investment',brand: 'mania', project: null,             title: "Memorandum d'investissement — Mania Pizza Namur", sub: 'Closing 12j',                         date: '2026-05-10', expiry: null,         status: 'validated', size: '2,1 MB', url: '/uploads/d-i-namur.pdf' },
  { id: 'd-m-resi',     type: 'kyc',     brand: null,      project: null,              title: 'Justificatif de domicile — renouvellement',    sub: 'Document expiré · à renouveler',          date: null,         expiry: null,         status: 'missing',   size: null,     url: null }
];

// ======================================================================
// NOTIFICATIONS
// ======================================================================
const NOTIFICATIONS = [
  { id: 'n1', kind: 'payment', brand: 'atelier', investorId: 'inv-001', title: "Versement reçu · L'Atelier Châtelain",  sub: '1 248 € versés (échéance Mai)',        createdAt: '2026-05-16T07:00:00Z', read: false },
  { id: 'n2', kind: 'opp',     brand: 'mania',   investorId: 'inv-001', title: 'Closing imminent · Mania Pizza Namur',  sub: '12 jours restants · 73 % levés',       createdAt: '2026-05-16T05:00:00Z', read: false },
  { id: 'n3', kind: 'report',  brand: 'couq',    investorId: 'inv-001', title: 'Rapport mensuel · Couq Flagey',         sub: '+6,8 % vs budget · Avril 2026',        createdAt: '2026-05-15T10:00:00Z', read: false },
  { id: 'n4', kind: 'doc',     brand: 'mania',   investorId: 'inv-001', title: 'Avenant à signer · Mania Pizza Mons',   sub: 'Extension horaires soir · DocuSign',   createdAt: '2026-05-14T09:00:00Z', read: false },
  { id: 'n5', kind: 'payment', brand: 'cookies', investorId: 'inv-001', title: "Versement reçu · Cookie's Outremeuse",  sub: '124 € versés (échéance Avril)',        createdAt: '2026-05-13T08:00:00Z', read: true  },
  { id: 'n6', kind: 'report',  brand: 'atelier', investorId: 'inv-001', title: "Rapport mensuel · L'Atelier Anvers",   sub: '+8,1 % vs budget · Avril 2026',        createdAt: '2026-05-12T10:00:00Z', read: true  },
  { id: 'n7', kind: 'opp',     brand: 'cookies', investorId: 'inv-001', title: "Nouvelle opportunité · Cookie's Bruxelles", sub: "Galerie Toison d'Or · TRI cible 7,8 %", createdAt: '2026-05-09T09:00:00Z', read: true }
];

// ======================================================================
// SUPPORT TICKETS
// ======================================================================
const SUPPORT_CATEGORIES = [
  { id: 'investment',  label: "Question d'investissement" },
  { id: 'repayment',   label: 'Question de remboursement' },
  { id: 'technical',   label: 'Problème technique' },
  { id: 'document',    label: 'Problème de document' },
  { id: 'legal',       label: 'Juridique / conformité' },
  { id: 'opportunity', label: 'Opportunité de financement' },
  { id: 'general',     label: 'Support général' }
];

const SUPPORT_PRIORITIES = [
  { id: 'low',    label: 'Faible' },
  { id: 'normal', label: 'Normale' },
  { id: 'high',   label: 'Élevée' },
  { id: 'urgent', label: 'Urgente' }
];

const SUPPORT_TICKETS = [
  {
    id: 't-001',
    investorId: 'inv-001',
    category: 'document',
    subject: 'Justificatif de domicile à renouveler',
    priority: 'high',
    status: 'awaiting-investor',
    brand: null,
    project: null,
    assignedTo: 'Émilie Devos · Conformité',
    origin: 'admin',
    createdAt: '2026-05-04T09:12:00Z',
    updatedAt: '2026-05-16T08:45:00Z',
    messages: [
      { id: 'm-001', author: 'admin',    name: 'Émilie Devos',      body: "Bonjour Claire, votre justificatif de domicile date de plus de 2 ans. Pourriez-vous nous transmettre une composition de ménage récente (moins de 3 mois) ? Vous pouvez la déposer directement depuis votre profil.", time: '2026-05-04T09:12:00Z', attachments: [], unread: false },
      { id: 'm-002', author: 'investor', name: 'Claire Vermeulen',  body: "Bonjour, c'est noté. Je récupère cela auprès de ma commune cette semaine.",                                                                                                                                           time: '2026-05-04T14:30:00Z', attachments: [], unread: false },
      { id: 'm-003', author: 'admin',    name: 'Émilie Devos',      body: "Parfait, merci. Je relance dans 10 jours si rien n'est déposé. Bonne journée.",                                                                                                                                         time: '2026-05-16T08:45:00Z', attachments: [], unread: true  }
    ]
  },
  {
    id: 't-002',
    investorId: 'inv-001',
    category: 'opportunity',
    subject: 'Pré-engagement · Mania Pizza Namur',
    priority: 'normal',
    status: 'open',
    brand: 'mania',
    project: 'mania-namur',
    assignedTo: 'Karim Boulahia · Investor Relations',
    origin: 'investor',
    createdAt: '2026-05-12T19:42:00Z',
    updatedAt: '2026-05-13T09:08:00Z',
    messages: [
      { id: 'm-101', author: 'investor', name: 'Claire Vermeulen', body: "Bonsoir, je suis intéressée par un pré-engagement sur le projet Mania Pizza Namur. Pourriez-vous m'envoyer le business plan détaillé ?", time: '2026-05-12T19:42:00Z', attachments: [] },
      { id: 'm-102', author: 'admin',    name: 'Karim Boulahia',  body: "Bonjour Claire, ravi de vous lire. Vous trouverez le BP et les projections financières en pièce jointe.", time: '2026-05-13T09:08:00Z', attachments: [{ name: 'Mania-Namur-BP-2026.pdf', size: '4,2 MB' }, { name: 'Mania-Namur-Projections.xlsx', size: '320 KB' }] }
    ]
  },
  {
    id: 't-003',
    investorId: 'inv-001',
    category: 'repayment',
    subject: "Calendrier de remboursement L'Atelier Liège",
    priority: 'normal',
    status: 'resolved',
    brand: 'atelier',
    project: 'liege',
    assignedTo: 'Sophie Renard · Investor Relations',
    origin: 'investor',
    createdAt: '2026-05-07T11:15:00Z',
    updatedAt: '2026-05-07T14:30:00Z',
    messages: [
      { id: 'm-201', author: 'investor', name: 'Claire Vermeulen', body: "Bonjour, le versement d'avril sur Liège est arrivé avec 5 jours de retard. Est-ce normal ?", time: '2026-05-07T11:15:00Z', attachments: [] },
      { id: 'm-202', author: 'admin',    name: 'Sophie Renard',    body: "Bonjour Claire, retard lié à une fermeture bancaire de Pâques. Tous les versements suivants seront le 15 comme prévu.", time: '2026-05-07T14:22:00Z', attachments: [] },
      { id: 'm-203', author: 'investor', name: 'Claire Vermeulen', body: 'Merci pour la clarification.', time: '2026-05-07T14:30:00Z', attachments: [] }
    ]
  },
  {
    id: 't-004',
    investorId: 'inv-001',
    category: 'general',
    subject: 'Rapport annuel réseau 2025 disponible',
    priority: 'low',
    status: 'open',
    brand: null,
    project: null,
    assignedTo: 'Franchise Generation',
    origin: 'admin',
    createdAt: '2026-04-28T10:00:00Z',
    updatedAt: '2026-04-28T10:00:00Z',
    messages: [
      { id: 'm-301', author: 'admin', name: 'Franchise Generation', body: "Bonjour, le rapport annuel consolidé du réseau Franchise Generation 2025 est disponible dans votre profil → Documents.", time: '2026-04-28T10:00:00Z', attachments: [{ name: 'FG-Rapport-Annuel-2025.pdf', size: '4,8 MB' }] }
    ]
  }
];

// ======================================================================
// LANDING PAGE
// ======================================================================
const LANDING = {
  hero: {
    eyebrow: 'Franchise Generation',
    title: 'The franchise ecosystem for ambitious brands, operators and investors.',
    sub: 'One structured platform that connects brands ready to scale, future franchisees ready to operate, and investors ready to back proven concepts.',
    primaryCta: { label: 'Investor login', action: 'login' },
    secondaryCta: { label: 'See how it works', action: 'about' }
  },
  pillars: [
    { id: 'brands',    label: 'Brands',        value: '4',     foot: 'Active ecosystems' },
    { id: 'shops',     label: 'Shops',         value: '12',    foot: 'Operated across the network' },
    { id: 'investors', label: 'Investors',     value: '180+',  foot: 'Backing the network' },
    { id: 'tri',       label: 'Avg target IRR', value: '8,4 %', foot: 'Across all brands' }
  ],
  whoAreYou: {
    title: 'Who are you?',
    sub: 'Five ways to enter the network — pick yours and we open the right door.',
    tiles: [
      { id: 'wru-candidate',   eyebrow: 'I am a Candidate',              title: 'Open an existing franchise',       body: 'Je souhaite ouvrir une franchise existante avec une marque éprouvée.',                                 ctaLabel: 'Discover opportunities',           action: 'scroll-opps',           tone: 'a', accent: '#0E5A5C' },
      { id: 'wru-brand',       eyebrow: 'I am a Brand',                  title: 'Develop my brand into a network',  body: 'Je possède déjà une marque et souhaite la déployer en franchise.',                                    ctaLabel: 'Develop my brand',                 action: 'brand-application',     tone: 'b', accent: '#1FB48C' },
      { id: 'wru-investor',    eyebrow: 'I want to invest',              title: 'Invest in a project or a brand',   body: 'Je souhaite investir dans un magasin, une franchise ou une marque en développement.',                  ctaLabel: 'Discover investment opportunities', action: 'investor-onboarding',   tone: 'e', accent: '#3a4030' },
      { id: 'wru-real-estate', eyebrow: 'I am a Real Estate Developer', title: 'Propose a location',               body: 'Je possède des cellules commerciales ou des projets immobiliers à proposer au réseau.',               ctaLabel: 'Propose a location',               action: 'real-estate',           tone: 'c', accent: '#8B5A3C' },
      { id: 'wru-creator',     eyebrow: 'I want to create my own brand', title: 'Build a new concept',              body: "Je souhaite créer un nouveau concept avec accompagnement complet.",                                    ctaLabel: 'Start my concept',                 action: 'new-brand-concept',     tone: 'd', accent: '#9c2a1f' }
    ]
  },
  portals: [
    { id: 'brand',     label: 'Brand',     tooltip: 'Manage your network',          href: 'login.html?portal=brand' },
    { id: 'candidate', label: 'Candidate', tooltip: 'Open your franchise',          href: 'login.html?portal=candidate' },
    { id: 'investor',  label: 'Investor',  tooltip: 'Track your investments',       href: 'login.html?portal=investor' },
    { id: 'developer', label: 'Developer', tooltip: 'Propose locations & projects', href: 'login.html?portal=developer' }
  ],
  currentOpportunities: {
    title: 'Current Opportunities',
    sub: 'Real openings, live financing rounds — apply in two clicks.',
    badges: {
      'op-gent':        { label: 'INVESTOR READY', tone: 'green' },
      'op-namur-pizza': { label: 'HOT',             tone: 'red' },
      'op-anvers-couq': { label: 'NEW',             tone: 'blue' },
      'op-bxl-cookies': { label: 'AVAILABLE',       tone: 'amber' }
    }
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
  },
  join: {
    title: 'Join Franchise Generation',
    sub: 'We connect ambitious brands, future franchisees and investors inside one structured franchise ecosystem.',
    programs: [
      { id: 'brand',     icon: 'brand', title: 'Are you a brand?',                  body: 'Join our ecosystem and structure your growth with franchise, investment, operations and development support.', ctaLabel: 'Join Us',           ctaAction: 'brand-application',     tone: 'primary'   },
      { id: 'candidate', icon: 'shop',  title: 'Do you want to open your own shop?', body: 'Apply as a future franchisee and start your onboarding journey with one of our partner brands.',             ctaLabel: 'Start Onboarding',  ctaAction: 'candidate-onboarding',  tone: 'secondary' },
      { id: 'creator',   icon: 'spark', title: 'Make Your Own Brand',                body: 'You have an idea — or just the ambition. We co-build the concept, the brand, the operations and the network around it.', ctaLabel: 'Build With Us', ctaAction: 'new-brand-concept', tone: 'accent' }
    ]
  },
  finalCta: {
    eyebrow: 'Already onboard?',
    title: 'Access your investor portal',
    sub: 'Track your investments, review reports, sign documents and discover new opportunities across every brand.',
    ctaLabel: 'Investor login',
    ctaAction: 'login'
  },
  investorOnboarding: {
    investmentTypes: [
      { id: 'shop',        label: 'Magasin existant' },
      { id: 'opening',     label: 'Nouvelle ouverture' },
      { id: 'brand',       label: 'Marque entière' },
      { id: 'real-estate', label: 'Immobilier commercial' }
    ],
    preferences: [
      { id: 'single', label: 'Magasin unique' },
      { id: 'multi',  label: 'Multi-sites' },
      { id: 'whole',  label: 'Marque entière' },
      { id: 're',     label: 'Immobilier commercial' }
    ],
    involvement: [
      { id: 'passive',  label: 'Passif',            sub: 'Investissement financier · reporting trimestriel.' },
      { id: 'active',   label: 'Actif',             sub: 'Visites trimestrielles · participation au comité.' },
      { id: 'operator', label: 'Associé opérateur', sub: 'Engagement opérationnel ou présence terrain.' }
    ],
    budgets: ['Sous 25 000 €', '25 000 – 75 000 €', '75 000 – 150 000 €', '150 000 – 500 000 €', '500 000 €+']
  }
};

// ======================================================================
// USERS (auth)
// ======================================================================
const USERS = [
  {
    id: 'user-001',
    email: 'claire.vermeulen@example.com',
    passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'investor',
    investorId: 'inv-001',
    name: 'Claire Vermeulen',
    active: true
  },
  {
    id: 'user-002',
    email: 'marc.dubois@example.com',
    passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'investor',
    investorId: 'inv-002',
    name: 'Marc Dubois',
    active: true
  },
  {
    id: 'user-003',
    email: 'admin@fg.be',
    passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    name: 'FG Admin',
    active: true
  },
  {
    id: 'user-004',
    email: 'sophie.renard@fg.be',
    passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'consultant',
    consultantId: 'cons-001',
    name: 'Sophie Renard',
    active: true
  },
  {
    id: 'user-005',
    email: 'karim.boulahia@fg.be',
    passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'consultant',
    consultantId: 'cons-002',
    name: 'Karim Boulahia',
    active: true
  }
];

// ======================================================================
// REPAYMENTS (mock schedule)
// ======================================================================
const REPAYMENTS = [
  { id: 'rep-001', investorId: 'inv-001', brand: 'atelier', shop: 'atelier-chatelain', amount: 1248, date: '2026-05-15', type: 'monthly', status: 'paid', description: "Versement mensuel · L'Atelier Châtelain" },
  { id: 'rep-002', investorId: 'inv-001', brand: 'atelier', shop: 'atelier-chatelain', amount: 1248, date: '2026-04-15', type: 'monthly', status: 'paid', description: "Versement mensuel · L'Atelier Châtelain" },
  { id: 'rep-003', investorId: 'inv-001', brand: 'cookies', shop: 'cookies-outremeuse', amount: 124,  date: '2026-04-15', type: 'monthly', status: 'paid', description: "Versement mensuel · Cookie's Outremeuse" },
  { id: 'rep-004', investorId: 'inv-001', brand: 'mania',   shop: 'mania-mons',         amount: 165,  date: '2026-04-15', type: 'monthly', status: 'paid', description: 'Versement mensuel · Mania Pizza Mons' },
  { id: 'rep-005', investorId: 'inv-001', brand: 'couq',    shop: 'couq-chatelain',     amount: 342,  date: '2026-05-15', type: 'monthly', status: 'paid', description: 'Versement mensuel · Couq Châtelain' },
  { id: 'rep-006', investorId: 'inv-001', brand: 'atelier', shop: 'atelier-chatelain', amount: 1248, date: '2026-06-15', type: 'monthly', status: 'scheduled', description: "Versement mensuel · L'Atelier Châtelain" }
];

// ======================================================================
// SHOP MONTHLY REPORTS
// ======================================================================
const SHOP_REPORTS = [
  { id: 'rpt-001', shopId: 'atelier-chatelain', brand: 'atelier', month: '2026-04', ca: 98000, budget: 92000, vsBudget: 6.5, profit: 17.8, cust: 280, basket: 7.2, highlights: 'Meilleur mois depuis ouverture. Viennoiseries +12 %.', status: 'published' },
  { id: 'rpt-002', shopId: 'atelier-chatelain', brand: 'atelier', month: '2026-03', ca: 91000, budget: 90000, vsBudget: 1.1, profit: 16.4, cust: 262, basket: 7.0, highlights: 'Semaine de Pâques très forte.', status: 'published' },
  { id: 'rpt-003', shopId: 'atelier-chatelain', brand: 'atelier', month: '2026-02', ca: 84000, budget: 88000, vsBudget: -4.5, profit: 14.9, cust: 248, basket: 6.8, highlights: 'Fermeture 3 jours · réparation four principal.', status: 'published' },
  { id: 'rpt-004', shopId: 'atelier-sablon',    brand: 'atelier', month: '2026-04', ca: 87000, budget: 84000, vsBudget: 3.6, profit: 15.2, cust: 240, basket: 7.0, highlights: 'Clientèle touristique en hausse.', status: 'published' },
  { id: 'rpt-005', shopId: 'couq-chatelain',    brand: 'couq',    month: '2026-04', ca: 64000, budget: 60000, vsBudget: 6.7, profit: 14.2, cust: 220, basket: 6.9, highlights: 'Couque signature 38 % du CA.', status: 'published' },
  { id: 'rpt-006', shopId: 'couq-chatelain',    brand: 'couq',    month: '2026-03', ca: 59000, budget: 58000, vsBudget: 1.7, profit: 13.1, cust: 208, basket: 6.7, highlights: 'Bon mois, légère baisse météo.', status: 'published' },
  { id: 'rpt-007', shopId: 'cookies-outremeuse', brand: 'cookies', month: '2026-04', ca: 26800, budget: 26000, vsBudget: 3.1, profit: 9.4, cust: 86, basket: 8.9, highlights: 'Pic goûter très marqué.', status: 'published' },
  { id: 'rpt-008', shopId: 'mania-mons',        brand: 'mania',   month: '2026-04', ca: 51200, budget: 49000, vsBudget: 4.5, profit: 13.6, cust: 240, basket: 7.4, highlights: 'Files vendredi soir, recrutement urgent.', status: 'published' }
];

// ======================================================================
// BENCHMARKS
// ======================================================================
const BENCHMARKS = [
  {
    id: 'bench-atelier',
    brand: 'atelier',
    period: '2026-Q1',
    metrics: {
      avgCaPerShop:     88000,
      avgProfitPct:     16.1,
      avgCustPerDay:    258,
      avgBasket:        7.0,
      avgVsBudget:      3.8,
      topShopCa:        112000,
      bottomShopCa:     34000,
      networkMedianCa:  91000
    },
    benchmark: {
      sectorAvgCa:        75000,
      sectorAvgProfitPct: 13.5,
      sectorAvgBasket:    6.2
    }
  },
  {
    id: 'bench-couq',
    brand: 'couq',
    period: '2026-Q1',
    metrics: {
      avgCaPerShop:     56000,
      avgProfitPct:     13.0,
      avgCustPerDay:    194,
      avgBasket:        6.8,
      avgVsBudget:      4.2,
      topShopCa:        64000,
      bottomShopCa:     48000,
      networkMedianCa:  56000
    },
    benchmark: {
      sectorAvgCa:        52000,
      sectorAvgProfitPct: 11.8,
      sectorAvgBasket:    6.0
    }
  },
  {
    id: 'bench-cookies',
    brand: 'cookies',
    period: '2026-Q1',
    metrics: {
      avgCaPerShop:     26800,
      avgProfitPct:     9.4,
      avgCustPerDay:    86,
      avgBasket:        8.9,
      avgVsBudget:      3.1,
      topShopCa:        26800,
      bottomShopCa:     26800,
      networkMedianCa:  26800
    },
    benchmark: {
      sectorAvgCa:        24000,
      sectorAvgProfitPct: 8.0,
      sectorAvgBasket:    7.8
    }
  },
  {
    id: 'bench-mania',
    brand: 'mania',
    period: '2026-Q1',
    metrics: {
      avgCaPerShop:     51200,
      avgProfitPct:     13.6,
      avgCustPerDay:    240,
      avgBasket:        7.4,
      avgVsBudget:      4.5,
      topShopCa:        51200,
      bottomShopCa:     51200,
      networkMedianCa:  51200
    },
    benchmark: {
      sectorAvgCa:        44000,
      sectorAvgProfitPct: 11.0,
      sectorAvgBasket:    6.8
    }
  }
];

// ======================================================================
// INVESTOR INTEREST EXPRESSIONS
// ======================================================================
const INVESTOR_INTERESTS = [];

// ======================================================================
// INVESTOR PREFERENCES
// ======================================================================
const INVESTOR_PREFERENCES = [
  {
    investorId: 'inv-001',
    notifications: { repayments: true, newOpportunities: true, monthlyReports: true, supportUpdates: false },
    preferredBrands: ['atelier', 'couq'],
    preferredRegions: ['bxl', 'fla'],
    riskProfile: 'moderate',
    currency: 'EUR',
    language: 'fr'
  },
  {
    investorId: 'inv-002',
    notifications: { repayments: true, newOpportunities: false, monthlyReports: true, supportUpdates: true },
    preferredBrands: [],
    preferredRegions: [],
    riskProfile: 'conservative',
    currency: 'EUR',
    language: 'fr'
  }
];

const ONBOARDING_RECORDS = [];
const CRM_TASKS = [];
const AUDIT_LOG = [];
// keyed by onboardingId — stores the full journey with per-item done/uploaded state
const ONBOARDING_JOURNEYS = {};

module.exports = {
  BRANDS,
  REGIONS,
  ONBOARDING_OPPORTUNITIES,
  FG_OPPORTUNITIES,
  LEAD_STEPS,
  CANDIDATE_LEADS,
  OPP_VALIDATION_STATUSES,
  CANDIDATES,
  CONCEPT_TYPES,
  NEW_BRAND_LEADS,
  INVESTORS,
  BRAND_PORTFOLIOS,
  BRAND_PRESENTATION,
  SHOPS,
  CONSULTANTS,
  DEVELOPERS,
  DOC_TYPES,
  FG_DOCS,
  NOTIFICATIONS,
  SUPPORT_CATEGORIES,
  SUPPORT_PRIORITIES,
  SUPPORT_TICKETS,
  LANDING,
  USERS,
  REPAYMENTS,
  INVESTOR_INTERESTS,
  INVESTOR_PREFERENCES,
  SHOP_REPORTS,
  BENCHMARKS,
  SHARE_CLASSES,
  BRANDS_FULL,
  ONBOARDING_RECORDS,
  CRM_TASKS,
  AUDIT_LOG,
  ONBOARDING_JOURNEYS,
};

// Script entry: print a summary when run directly
if (require.main === module) {
  console.log('Franchise Generation — Seed Data Summary');
  console.log('=========================================');
  console.log(`Brands:         ${BRANDS.length}`);
  console.log(`Regions:        ${REGIONS.length}`);
  console.log(`Opportunities:  ${ONBOARDING_OPPORTUNITIES.length} onboarding + ${FG_OPPORTUNITIES.length} financing`);
  console.log(`Candidates:     ${CANDIDATES.length}`);
  console.log(`Leads:          ${CANDIDATE_LEADS.length}`);
  console.log(`Investors:      ${INVESTORS.length}`);
  console.log(`Users:          ${USERS.length}`);
  console.log(`Consultants:    ${CONSULTANTS.length}`);
  console.log(`Developers:     ${DEVELOPERS.length}`);
  console.log(`Documents:      ${FG_DOCS.length}`);
  console.log(`Notifications:  ${NOTIFICATIONS.length}`);
  console.log(`Support tickets:${SUPPORT_TICKETS.length}`);
  console.log('=========================================');
  console.log('Seed OK — all data loaded.');
}

// ======================================================================
// SHARE CLASSES — specific rights per class
// ======================================================================
const SHARE_CLASSES = [
  {
    id: 'A',
    label: 'Class A — Founders',
    description: 'Voting shares held by founding partners. 10× voting multiplier.',
    votingMultiplier: 10,
    dividendPriority: 2,
    liquidationPriority: 2,
    transferRestrictions: 'Right of first refusal — other Class A holders',
    notes: 'Reserved for founders and core operators',
  },
  {
    id: 'B',
    label: 'Class B — Investors',
    description: 'Non-voting shares for financial investors. Priority dividend.',
    votingMultiplier: 0,
    dividendPriority: 1,
    liquidationPriority: 1,
    transferRestrictions: 'Board approval required',
    notes: 'Preferred return: 8% pa before Class A dividends',
  },
  {
    id: 'C',
    label: 'Class C — Ecosystem Partners',
    description: 'Shares issued to FG ecosystem entities (suppliers, RE partners).',
    votingMultiplier: 1,
    dividendPriority: 3,
    liquidationPriority: 3,
    transferRestrictions: 'FG approval required; non-transferable outside ecosystem',
    notes: 'Anti-dilution ratchet if revenue < target after 3 years',
  },
  {
    id: 'D',
    label: 'Class D — Employee / Advisory',
    description: 'Equity compensation for key staff and advisors. Vesting schedule.',
    votingMultiplier: 1,
    dividendPriority: 4,
    liquidationPriority: 4,
    transferRestrictions: '4-year vest, 1-year cliff. Lapse on departure.',
    notes: 'ESOP pool — board authorises individual grants',
  },
];

// ======================================================================
// BRANDS_FULL — extended brand records (all 8 sections)
// ======================================================================
const BRANDS_FULL = [
  {
    id: 'atelier',
    // ── 1. Identity ──────────────────────────────────────────────────
    name: "L'Atelier By",
    legalName: "L'Atelier By SRL",
    slug: 'latelier-by',
    status: 'active',
    yearFounded: 2022,
    countryOfOrigin: 'BE',
    tagline: { fr: "Boulangerie de quartier · Belgique", nl: "Buurtbakkerij · België", en: "Neighbourhood bakery · Belgium", pl: "Piekarnia sąsiedzka · Belgia" },
    story: {
      fr: "L'Atelier By est né d'une conviction simple : une boulangerie artisanale de qualité doit être accessible dans chaque quartier. Fondée à Bruxelles en 2022, la marque combine savoir-faire traditionnel et design contemporain.",
      nl: "L'Atelier By ontstond vanuit een eenvoudige overtuiging: een ambachtelijke kwaliteitsbakkerij moet in elke buurt bereikbaar zijn.",
      en: "L'Atelier By was born from a simple conviction: quality artisan bakeries should be accessible in every neighbourhood.",
      pl: "L'Atelier By powstało z prostego przekonania: rzemieślnicze piekarnie wysokiej jakości powinny być dostępne w każdej okolicy.",
    },

    // ── 2. Visual identity ───────────────────────────────────────────
    visual: {
      logos: { main: 'img/logo.png', monoBlack: null, monoWhite: null, icon: null },
      palette: {
        primary:   { hex: '#8D1D2C', name: 'Ruby Red' },
        secondary: { hex: '#F2C9A0', name: 'Warm Sand' },
        accent:    [{ hex: '#C9A96E', name: 'Honey Gold' }],
        neutrals:  [{ hex: '#EAE4DC', name: 'Linen' }, { hex: '#1C1A17', name: 'Espresso' }],
      },
      typography: {
        display: { name: 'DM Sans', weights: [400, 500, 700], source: 'google', url: 'https://fonts.google.com/specimen/DM+Sans' },
        body:    { name: 'DM Sans', weights: [400, 500], source: 'google', url: 'https://fonts.google.com/specimen/DM+Sans' },
      },
      photographyStyle: 'Warm, natural light. Textured surfaces (linen, wood, stone). Close-up textures of bread and pastries.',
      materialsTextures: [
        { name: 'Brushed oak', description: 'Counter and shelving material', referenceImage: null },
        { name: 'Ruby microcement', description: 'Feature walls and floor accents', referenceImage: null },
        { name: 'Raw linen', description: 'Packaging and staff uniforms', referenceImage: null },
      ],
      guidelinesPdf: null,
    },

    // ── 3. Positioning ───────────────────────────────────────────────
    positioning: {
      promise:          { fr: "Du pain vrai, chaque jour.", nl: "Echt brood, elke dag.", en: "Real bread, every day.", pl: "Prawdziwy chleb, każdego dnia." },
      valueProposition: { fr: "Une boulangerie artisanale premium, franchisée et réplicable à l'échelle d'un réseau.", nl: "Een premium ambachtelijke bakkerij, gefranchiseerd en schaalbaar.", en: "A premium artisan bakery, franchised and replicable at network scale.", pl: "Premium rzemieślnicza piekarnia, skalowalna w modelu franczyzowym." },
      personas: [
        { name: 'Le Voisin Fidèle', ageRange: '30–55', description: 'Habitant du quartier, vient chaque matin, attaché à la qualité et à l\'authenticité.' },
        { name: 'Le Professionnel Pressé', ageRange: '25–45', description: 'Cherche un déjeuner rapide et qualitatif. Sensible à l\'esthétique du lieu.' },
      ],
      marketSegment: 'bakery',
      differentiators: [
        'Pâtes à fermentation lente (24–48h)',
        'Design d\'intérieur signé par une agence bruxelloise',
        'Packaging éco-responsable et cohérent',
        'Réseau de producteurs locaux certifiés',
      ],
      competitors: [
        { name: 'Maison Dandoy', website: 'maisondandoy.com', notes: 'Heritage brand, tourist-facing, not franchised' },
        { name: 'Paul', website: 'paul.fr', notes: 'Large franchise, industrial quality, low premium perception' },
      ],
    },

    // ── 4. Operations ────────────────────────────────────────────────
    operations: {
      businessModel: 'franchise',
      storeFormat: 'boutique',
      productionModel: 'hybrid',
      centralProductionUnit: 'ProdAtelier-Bxl',
      storeSizeMin: 80, storeSizeMax: 200,
      staffMin: 4, staffMax: 12,
      requiredPositions: ['Boulanger-pâtissier', 'Manager de point de vente', 'Vendeur(se)'],
      operationsManual: null,
      keySupplierCategories: ['Farines bio', 'Beurre AOP', 'Fruits de saison', 'Emballages compostables'],
    },

    // ── 5. Financials ────────────────────────────────────────────────
    financials: {
      currency: 'EUR',
      avgTicket: 8.5,
      dailyRevenueTarget: 2500,
      monthlyRevenueTarget: 75000,
      grossMarginTarget: 65,
      ebitdaTarget: 18,
      royaltyRate: 6,
      marketingFund: 2,
      franchiseFee: 25000,
      investmentMin: 180000,
      investmentMax: 320000,
      workingCapital: 30000,
      breakEvenMonths: 18,
      roiTargetMonths: 48,
    },

    // ── 6. Legal ─────────────────────────────────────────────────────
    legal: {
      ownerEntity: 'Franchise Generation SRL',
      trademarkStatus: 'registered',
      trademarkTerritories: ['BE', 'FR', 'LU', 'NL'],
      trademarkNumbers: [
        { country: 'BE', number: 'BE-TM-2022-08341', date: '2022-09-01' },
        { country: 'EU', number: 'EUTM-2023-01872', date: '2023-03-15' },
      ],
      capTable: [
        { shareholder: 'Sam Verheyden', shareClass: 'A', percentage: 51, votingRights: true },
        { shareholder: 'FG Investor Pool', shareClass: 'B', percentage: 35, votingRights: false },
        { shareholder: 'ProdAtelier SRL', shareClass: 'C', percentage: 9, votingRights: true },
        { shareholder: 'Management ESOP', shareClass: 'D', percentage: 5, votingRights: true },
      ],
      masterFranchiseHolder: null,
      territoryRights: [
        { territory: 'Belgium', holder: 'Franchise Generation SRL', exclusivity: true },
        { territory: 'France', holder: null, exclusivity: false },
      ],
    },

    // ── 7. Network & growth ──────────────────────────────────────────
    network: {
      activeLocations: 5,
      locationsByCountry: { BE: 5 },
      target1Year: 8,
      target3Year: 20,
      target5Year: 50,
      pipelineOpportunityIds: ['opp-1', 'opp-3'],
    },

    // ── 8. Meta ──────────────────────────────────────────────────────
    meta: {
      createdBy: 'admin@fg.be',
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2026-05-01T14:00:00.000Z',
      brandManager: 'sophie.renard@fg.be',
      internalNotes: 'Flagship brand. All network decisions go through Sam.',
      draftSavedAt: null,
      publishedAt: '2024-02-01T09:00:00.000Z',
    },

    // ── Tokens (kept for UI compatibility) ───────────────────────────
    tokens: {
      primary: '#8D1D2C', secondary: '#F2C9A0',
      ink: '#1c1a17', bg: '#EAE4DC', surface: '#FFFFFF', accent: '#8D1D2C',
      fontDisplay: '"DM Sans", system-ui, sans-serif',
      fontUi:      '"DM Sans", system-ui, sans-serif',
      fontAccent:  '"DM Sans", system-ui, sans-serif',
    },
  },
];
