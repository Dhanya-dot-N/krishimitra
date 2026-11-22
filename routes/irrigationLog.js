const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/farm.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS irrigation_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    crop TEXT,
    irrigated INTEGER DEFAULT 0,
    water_amount REAL,
    notes TEXT,
    weather_temp REAL,
    weather_rain REAL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

router.post('/irrigation', (req, res) => {
  const { date, crop, irrigated, water_amount, notes, weather_temp, weather_rain } = req.body;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  const existing = db.prepare('SELECT id FROM irrigation_log WHERE date = ? AND crop = ?').get(date, crop || 'General');

  if (existing) {
    db.prepare('UPDATE irrigation_log SET irrigated=?, water_amount=?, notes=?, weather_temp=?, weather_rain=? WHERE id=?')
      .run(irrigated ? 1 : 0, water_amount || null, notes || null, weather_temp || null, weather_rain || null, existing.id);
  } else {
    db.prepare('INSERT INTO irrigation_log (date, crop, irrigated, water_amount, notes, weather_temp, weather_rain) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(date, crop || 'General', irrigated ? 1 : 0, water_amount || null, notes || null, weather_temp || null, weather_rain || null);
  }

  res.json({ success: true, message: 'Log saved' });
});

router.get('/irrigation', (req, res) => {
  const crop = req.query.crop;
  const days = req.query.days || 30;

  let logs;
  if (crop && crop !== 'all') {
    logs = db.prepare("SELECT * FROM irrigation_log WHERE crop = ? AND date >= date('now', ?) ORDER BY date DESC")
      .all(crop, '-' + days + ' days');
  } else {
    logs = db.prepare("SELECT * FROM irrigation_log WHERE date >= date('now', ?) ORDER BY date DESC")
      .all('-' + days + ' days');
  }

  const irrigatedDays = logs.filter(function(l) { return l.irrigated; }).length;
  const totalWater = logs.reduce(function(sum, l) { return sum + (l.water_amount || 0); }, 0);

  res.json({ success: true, logs: logs, stats: { total: logs.length, irrigatedDays: irrigatedDays, skippedDays: logs.length - irrigatedDays, totalWater: totalWater.toFixed(1) } });
});

router.delete('/irrigation/:id', (req, res) => {
  db.prepare('DELETE FROM irrigation_log WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;