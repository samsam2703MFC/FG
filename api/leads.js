// POST /api/leads  — create a new lead (candidate, investor, real-estate, brand-concept)
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, ...payload } = req.body || {};
  const ALLOWED_TYPES = ['candidate', 'investor', 'real_estate', 'brand_concept', 'opportunity'];
  if (!type || !ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${ALLOWED_TYPES.join(', ')}` });
  }

  // In production this would write to DB and trigger CRM workflows
  const lead = {
    id: `lead-${Date.now()}`,
    type,
    ...payload,
    createdAt: new Date().toISOString(),
    status: 'received',
  };

  console.log('[lead]', lead);
  res.status(201).json({ data: lead, message: 'Lead received — our team will be in touch shortly.' });
}
