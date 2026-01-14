const { pool } = require('../../../config/database');

const createUser = (userData, callback) => {
  const query = 'INSERT INTO users (email, name, password) VALUES (?, ?, ?)';
  pool.query(query, [userData.email, userData.name, userData.password], callback);
};

const findUserByEmail = (email, callback) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  pool.query(query, [email], (err, results) => {
    callback(err, results[0]);
  });
};

const loginUser = (email, password, callback) => {
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  console.log('Query:', query, [email, password]); // Debug
  pool.query(query, [email, password], (err, results) => {
    console.log('Query result:', err, results); // Debug
    callback(err, results[0]);
  });
};

module.exports = { createUser, findUserByEmail, loginUser };