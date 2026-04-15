const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  req.user = user;
  req.profile = profile;
  req.supabase = supabase;
  next();
}

async function requireRole(...roles) {
  return async (req, res, next) => {
    await requireAuth(req, res, async () => {
      if (!req.profile || !roles.includes(req.profile.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    });
  };
}

module.exports = { requireAuth, requireRole, supabase };
