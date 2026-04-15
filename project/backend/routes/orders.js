const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { role } = req.profile || {};
  let query = req.supabase
    .from('orders')
    .select('*, products(name, unit, images), profiles!merchant_id(full_name, phone), profiles!farmer_id(full_name, phone)')
    .order('created_at', { ascending: false });

  if (role === 'farmer') {
    query = query.eq('farmer_id', req.user.id);
  } else if (role === 'merchant') {
    query = query.eq('merchant_id', req.user.id);
  }

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', requireAuth, async (req, res) => {
  if (req.profile?.role !== 'merchant') {
    return res.status(403).json({ error: 'Only merchants can place orders' });
  }

  const { product_id, quantity, payment_method, notes } = req.body;

  const { data: product } = await req.supabase
    .from('products')
    .select('*, profiles!farmer_id(id)')
    .eq('id', product_id)
    .maybeSingle();

  if (!product) return res.status(404).json({ error: 'Product not found' });

  const total_price = product.price * quantity;

  const { data, error } = await req.supabase.from('orders').insert({
    product_id,
    farmer_id: product.farmer_id,
    merchant_id: req.user.id,
    quantity,
    total_price,
    payment_method: payment_method || 'cash',
    notes: notes || '',
    status: 'pending',
  }).select().maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['accepted', 'rejected', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { data, error } = await req.supabase
    .from('orders')
    .update({ status, updated_at: new Date() })
    .eq('id', req.params.id)
    .or(`farmer_id.eq.${req.user.id},merchant_id.eq.${req.user.id}`)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Order not found or unauthorized' });
  res.json(data);
});

module.exports = router;
