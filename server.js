const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'https://engine.astrosellers.com',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Astrosellers API', version: '1.0.0' });
});

app.use('/claude', require('./routes/claude'));
app.use('/freepik', require('./routes/freepik'));

app.listen(PORT, () => {
  console.log('Astrosellers API corriendo en puerto ' + PORT);
});
