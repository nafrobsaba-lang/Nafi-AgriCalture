const express = require('express');
const { supabase } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, full_name, phone, role, region } = req.body;

  if (!email || !password || !full_name || !phone || !role || !region) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!['farmer', 'merchant'].includes(role)) {
    return res.status(400).json({ error: 'Role must be farmer or merchant' });
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, role } }
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name,
      phone,
      role,
      region,
    });

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }
  }

  res.status(201).json({ message: 'Registration successful', user: authData.user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  res.json({
    session: data.session,
    user: data.user,
    profile,
  });
});

router.post('/logout', async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
