const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./jobs/cron'); // Start background jobs

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/manifestos', require('./routes/manifestos'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/top', require('./routes/top'));
app.use('/api/users', require('./routes/users'));

// Basic Route
app.get('/', (req, res) => {
  res.send('JanAawaz Backend API is running...');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BALEN-V2.1] Server is running on port ${PORT} at ${new Date().toISOString()}`);
  console.log('Ensure you have stopped ALL OTHER backend processes to avoid old code running.');
});
