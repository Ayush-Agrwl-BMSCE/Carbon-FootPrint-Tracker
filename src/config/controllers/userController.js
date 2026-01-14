const { createUser, findUserByEmail, loginUser } = require('./models/User');

const registerUser = (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) return res.status(400).json({ error: 'All fields required' });

  findUserByEmail(email, (err, user) => {
    if (err) return res.status(500).json({ error: 'DB Error' });
    if (user) return res.status(409).json({ error: 'User exists' });

    createUser({ email, name, password }, (err, result) => {
      if (err) return res.status(500).json({ error: 'Registration failed' });
      res.status(201).json({ id: result.insertId, message: 'User created' });
    });
  });
};

const loginUserHandler = (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password }); // Debug
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  loginUser(email, password, (err, user) => {
    console.log('Login result:', { err, user }); // Debug
    if (err) return res.status(500).json({ error: 'Login failed' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ id: user.id, name: user.name, message: 'Logged in' });
  });
};

module.exports = { registerUser, loginUser: loginUserHandler };