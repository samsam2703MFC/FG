// GET /api/brands  — returns all FG brands with design tokens
const BRANDS = [
  {
    id: 'latelier',
    name: "L'Atelier By",
    tagline: 'Boulangerie artisanale premium',
    tokens: {
      primary: '#8D1D2C', secondary: '#F5ECD7',
      ink: '#FFFFFF', bg: '#FDF8F2', surface: '#FAF3E8', accent: '#C9A96E',
    },
    logo: '/img/logo.png',
    kpiLabels: { revenue: 'CA', foodCost: 'Food Cost', labourCost: 'Labour Cost', profit: 'Profit net' },
  },
  {
    id: 'couq',
    name: 'Couq',
    tagline: 'Street food belge moderne',
    tokens: {
      primary: '#B8862E', secondary: '#FFF8EE',
      ink: '#FFFFFF', bg: '#FFFCF5', surface: '#FFF8EE', accent: '#8D5A1B',
    },
    logo: '/img/couq-logo.jpg',
    kpiLabels: { revenue: 'CA', foodCost: 'Food Cost', labourCost: 'Labour Cost', profit: 'Bénéfice net' },
  },
  {
    id: 'cookies',
    name: "Cookie's & Milk",
    tagline: 'Concept cookies & boissons',
    tokens: {
      primary: '#D98AA6', secondary: '#FFF0F5',
      ink: '#FFFFFF', bg: '#FFF8FB', surface: '#FFF0F5', accent: '#A85070',
    },
    logo: '/img/fg-logo.png',
    kpiLabels: { revenue: 'CA', foodCost: 'Food Cost', labourCost: 'Labour Cost', profit: 'Profit net' },
  },
  {
    id: 'maniapizza',
    name: 'Mania Pizza',
    tagline: 'Pizza napolitaine en franchise',
    tokens: {
      primary: '#C7212A', secondary: '#FFF0F0',
      ink: '#FFFFFF', bg: '#FFF8F8', surface: '#FFF0F0', accent: '#8B1218',
    },
    logo: '/img/fg-logo.png',
    kpiLabels: { revenue: 'CA', foodCost: 'Food Cost', labourCost: 'Labour Cost', profit: 'Profit net' },
  },
];

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { id } = req.query;
  if (id) {
    const brand = BRANDS.find(b => b.id === id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    return res.json({ data: brand });
  }
  res.json({ data: BRANDS });
}
