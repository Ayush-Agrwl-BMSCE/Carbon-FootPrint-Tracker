const { pool } = require('../../../config/database');

const logActivity = (activityData, callback) => {
  const query = 'INSERT INTO tracker (user_id, activity_type, carbon_value, value) VALUES (?, ?, ?, ?)';
  pool.query(query, [activityData.user_id, activityData.activity_type, activityData.carbon_value, activityData.value], callback);
};

const getUserStats = (userId, callback) => {
  const query = 'SELECT SUM(carbon_value) as total_carbon FROM tracker WHERE user_id = ?';
  const entriesQuery = 'SELECT id, user_id, activity_type, carbon_value, value, logged_at FROM tracker WHERE user_id = ? ORDER BY logged_at DESC';
  pool.query(query, [userId], (err, sumResult) => {
    if (err) return callback(err);
    pool.query(entriesQuery, [userId], (err2, entries) => {
      console.log('Stats result:', { total: sumResult[0], entries });
      callback(err2, { total_carbon: sumResult[0].total_carbon || 0, entries });
    });
  });
};

module.exports = { logActivity, getUserStats };