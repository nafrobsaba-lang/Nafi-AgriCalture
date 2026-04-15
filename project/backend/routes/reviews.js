const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/user/:userId', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase
    .from('reviews')
    .select('*, profiles!reviewer_id(full_name, avatar_url)')
    .eq('reviewee_id', req.params.userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', requireAuth, async (req, res) => {
  const { reviewee_id, order_id, rating, comment } = req.body;

  if (!reviewee_id || !rating) {
    return res.status(400).json({ error: 'reviewee_id and rating are required' });
  }

  const { data, error } = await req.supabase.from('reviews').insert({
    reviewer_id: req.user.id,
    reviewee_id,
    order_id,
    rating,
    comment: comment || '',
    reviewer_role: req.profile?.role,
  }).select().maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

module.exports = router;
