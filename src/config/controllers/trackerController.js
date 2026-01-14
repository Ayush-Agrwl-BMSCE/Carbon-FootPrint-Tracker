const { logActivity, getUserStats } = require('./models/Tracker');
const { calculateCarbon } = require('./models/routes/services/carbonService');

const trackActivity = async (req, res) => {
  const { user_id, type, value, unit } = req.body;
  console.log('Tracking activity:', { user_id, type, value, unit });
  if (!user_id || !type || !value) return res.status(400).json({ error: 'Missing fields' });

  try {
    const carbonValue = await calculateCarbon({ type, value, unit });
    logActivity({ user_id, activity_type: type, carbon_value: carbonValue, value }, (err, result) => {
      console.log('Insert result:', err, result);
      if (err) return res.status(500).json({ error: 'Log failed' });
      res.status(201).json({ id: result.insertId, carbon_kg: carbonValue, message: 'Tracked' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStats = (req, res) => {
  const { user_id } = req.params;
  getUserStats(user_id, (err, stats) => {
    if (err) return res.status(500).json({ error: 'Stats failed' });
    res.json({ total_carbon_kg: stats.total_carbon, entries: stats.entries });
  });
};

module.exports = { trackActivity, getStats };