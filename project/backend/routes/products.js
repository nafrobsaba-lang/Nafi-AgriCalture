const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { category, region, min_price, max_price, urgent, search } = req.query;

  let query = req.supabase
    .from('products')
    .select('*, profiles!farmer_id(full_name, phone, region, avatar_url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (region) query = query.ilike('region', `%${region}%`);
  if (min_price) query = query.gte('price', min_price);
  if (max_price) query = query.lte('price', max_price);
  if (urgent === 'true') query = query.eq('urgent_sale', true);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/my', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase
    .from('products')
    .select('*')
    .eq('farmer_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/:id', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase
    .from('products')
    .select('*, profiles!farmer_id(full_name, phone, region, avatar_url)')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Product not found' });
  res.json(data);
});

router.post('/', requireAuth, async (req, res) => {
  if (req.profile?.role !== 'farmer') {
    return res.status(403).json({ error: 'Only farmers can add products' });
  }

  const { name, category, price, quantity, unit, description, harvest_date, urgent_sale, images } = req.body;

  const { data, error } = await req.supabase.from('products').insert({
    farmer_id: req.user.id,
    name, category, price, quantity, unit,
    description, harvest_date, urgent_sale,
    images: images || [],
    region: req.profile.region,
  }).select().maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { name, category, price, quantity, unit, description, harvest_date, urgent_sale, images, status } = req.body;

  const { data, error } = await req.supabase
    .from('products')
    .update({ name, category, price, quantity, unit, description, harvest_date, urgent_sale, images, status, updated_at: new Date() })
    .eq('id', req.params.id)
    .eq('farmer_id', req.user.id)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Product not found or unauthorized' });
  res.json(data);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await req.supabase
    .from('products')
    .delete()
    .eq('id', req.params.id)
    .eq('farmer_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Product deleted successfully' });
});

module.exports = router;
