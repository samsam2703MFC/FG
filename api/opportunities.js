// GET /api/opportunities  — franchise openings available
const OPPORTUNITIES = [
  {
    id: 'opp-1', brandId: 'latelier', city: 'Gand', region: 'fla',
    surface: 180, budget: 320000, status: 'open',
    closingInDays: 18, returnRate: 8.4,
    description: 'Emplacement premium en centre-ville de Gand, fort trafic piéton.',
    images: ['/img/shop-1.png'],
  },
  {
    id: 'opp-2', brandId: 'couq', city: 'Liège', region: 'wal',
    surface: 120, budget: 210000, status: 'open',
    closingInDays: 31, returnRate: 7.9,
    description: 'Food court moderne, Liège City Center.',
    images: ['/img/shop-2.png'],
  },
  {
    id: 'opp-3', brandId: 'maniapizza', city: 'Bruxelles', region: 'bxl',
    surface: 200, budget: 380000, status: 'open',
    closingInDays: 45, returnRate: 9.1,
    description: 'Flagship Bruxelles Châtelain — forte visibilité quartier.',
    images: ['/img/shop-3.png'],
  },
  {
    id: 'opp-4', brandId: 'latelier', city: 'Bruges', region: 'fla',
    surface: 160, budget: 295000, status: 'open',
    closingInDays: 60, returnRate: 8.0,
    description: 'Secteur touristique haute fréquentation.',
    images: ['/img/shop-1.png'],
  },
  {
    id: 'opp-5', brandId: 'cookies', city: 'Anvers', region: 'fla',
    surface: 90, budget: 175000, status: 'open',
    closingInDays: 22, returnRate: 8.7,
    description: 'Concept pop-up évolutif, Meir shopping street.',
    images: ['/img/shop-2.png'],
  },
  {
    id: 'opp-6', brandId: 'couq', city: 'Namur', region: 'wal',
    surface: 110, budget: 190000, status: 'open',
    closingInDays: 38, returnRate: 7.6,
    description: 'Nouvelle zone commerciale, fort potentiel de croissance.',
    images: ['/img/shop-3.png'],
  },
];

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { brandId, region, status } = req.query;
  let results = [...OPPORTUNITIES];
  if (brandId) results = results.filter(o => o.brandId === brandId);
  if (region)  results = results.filter(o => o.region  === region);
  if (status)  results = results.filter(o => o.status  === status);
  res.json({ data: results, total: results.length });
}
