const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const API_KEY = process.env.DATAGOVIN_API_KEY;
const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(',');
    const obj = {};
    headers.forEach((h, i) => obj[h] = vals[i]?.trim());
    return obj;
  });
}

// GET /api/prices/crops — list available crops
router.get('/crops', async (req, res) => {
  if (!API_KEY) return res.json({ success: true, crops: getCSVCrops(), source: 'csv' });

  try {
    const url = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=1&fields=commodity`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API error');

    // Fetch all unique commodities
    const url2 = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=500&fields=commodity`;
    const r2 = await fetch(url2);
    const d2 = await r2.json();
    const crops = [...new Set(d2.records?.map(r => r.commodity))].filter(Boolean).sort();
    res.json({ success: true, crops, source: 'live' });
  } catch (err) {
    console.error('Crops fetch error:', err.message);
    res.json({ success: true, crops: getCSVCrops(), source: 'csv' });
  }
});

// GET /api/prices/data?crop=Tomato&state=Karnataka
router.get('/data', async (req, res) => {
  const { crop, state } = req.query;

  if (!API_KEY) return res.json(getCSVData(crop));

  try {
    let url = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=100&fields=commodity,arrival_date,modal_price,market,state,district`;
    if (crop) url += `&filters[commodity]=${encodeURIComponent(crop)}`;
    if (state) url += `&filters[state]=${encodeURIComponent(state)}`;

    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API error');

    const records = (data.records || []).map(r => ({
      crop: r.commodity,
      date: r.arrival_date,
      price_per_quintal: r.modal_price,
      market: r.market,
      state: r.state,
      district: r.district
    }));
    
    // Get unique crops for dropdown
    const crops = [...new Set(records.map(r => r.crop))].filter(Boolean);

    res.json({ success: true, crops, records, source: 'live' });
  } catch (err) {
    console.error('Price fetch error:', err.message);
    // Fallback to CSV
    res.json(getCSVData(crop));
  }
});

function getCSVCrops() {
  const csvPath = path.join(__dirname, '../data/prices.csv');
  if (!fs.existsSync(csvPath)) return [];
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const records = parseCSV(raw);
  return [...new Set(records.map(r => r.crop))].filter(Boolean);
}

function getCSVData(crop) {
  const csvPath = path.join(__dirname, '../data/prices.csv');
  if (!fs.existsSync(csvPath)) return { success: false, error: 'No data available' };
  const raw = fs.readFileSync(csvPath, 'utf-8');
  let records = parseCSV(raw);
  if (crop) records = records.filter(r => r.crop?.toLowerCase() === crop.toLowerCase());
  const crops = [...new Set(parseCSV(raw).map(r => r.crop))].filter(Boolean);
  return { success: true, crops, records, source: 'csv' };
}

module.exports = router;