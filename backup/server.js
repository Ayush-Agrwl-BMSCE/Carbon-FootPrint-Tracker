const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());  // Allow frontend access (configure origins for security)
app.use(express.json());  // Parse JSON bodies
app.use(express.static('public'));  // Serve static files from public folder

// Debug: Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// DB Connection (test it)
db.getConnection((err, connection) => {
  if (err) {
    console.error('DB Connection Failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
  // Release connection after test
  if (connection) connection.release();
});

// Routes
app.use('/api/users', require('./src/config/controllers/models/routes/users'));
app.use('/api/tracker', require('./src/config/controllers/models/routes/tracker'));

// Global Error Handler (add custom logic here)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});