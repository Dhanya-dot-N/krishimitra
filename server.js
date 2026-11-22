const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/disease', require('./routes/disease'));
app.use('/api/irrigation', require('./routes/irrigation'));
app.use('/api/prices', require('./routes/prices'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/log', require('./routes/irrigationLog'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌱 KrishiMitra running at http://localhost:${PORT}`);
});
