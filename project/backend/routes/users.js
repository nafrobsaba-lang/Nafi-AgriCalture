const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user, profile: req.profile });
});

router.put('/me', requireAuth, async (req, res) => {
  const { full_name, phone, region, avatar_url } = req.body;

  const { data, error } = await req.supabase
    .from('profiles')
    .update({ full_name, phone, region, avatar_url, updated_at: new Date() })
    .eq('id', req.user.id)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/farmers', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase
    .from('profiles')
    .select('id, full_name, phone, region, avatar_url, created_at')
    .eq('role', 'farmer');

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/stats', requireAuth, async (req, res) => {
  if (req.profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }

  const [{ count: totalUsers }, { count: totalProducts }, { count: totalOrders }] = await Promise.all([
    req.supabase.from('profiles').select('*', { count: 'exact', head: true }),
    req.supabase.from('products').select('*', { count: 'exact', head: true }),
    req.supabase.from('orders').select('*', { count: 'exact', head: true }),
  ]);

  res.json({ totalUsers, totalProducts, totalOrders });
});

module.exports = router;
