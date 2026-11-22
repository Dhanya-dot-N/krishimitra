const express = require('express');
const router = express.Router();

const CROPS = [
  {
    name: 'Rice', kannada: 'ಭತ್ತ', hindi: 'धान',
    n: [80, 120], p: [40, 60], k: [40, 60],
    soil: ['Clay', 'Loamy'],
    water: ['Irrigated'],
    season: ['Kharif'],
    regions: ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Andhra Pradesh', 'West Bengal'],
    profit: 'Medium', duration: '120-150 days',
    tip: 'Best in flooded/waterlogged clay soils. Needs consistent irrigation.'
  },
  {
    name: 'Wheat', kannada: 'ಗೋಧಿ', hindi: 'गेहूं',
    n: [100, 150], p: [50, 80], k: [40, 60],
    soil: ['Loamy', 'Clay'],
    water: ['Irrigated', 'Limited'],
    season: ['Rabi'],
    regions: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh'],
    profit: 'Medium', duration: '100-120 days',
    tip: 'Requires cool weather. Sow October-December for best yield.'
  },
  {
    name: 'Cotton', kannada: 'ಹತ್ತಿ', hindi: 'कपास',
    n: [60, 100], p: [30, 60], k: [30, 60],
    soil: ['Black', 'Loamy'],
    water: ['Rainfed', 'Limited'],
    season: ['Kharif'],
    regions: ['Karnataka', 'Maharashtra', 'Gujarat', 'Telangana'],
    profit: 'High', duration: '150-180 days',
    tip: 'Black cotton soil gives best results. High value but needs pest management.'
  },
  {
    name: 'Maize', kannada: 'ಮೆಕ್ಕೆಜೋಳ', hindi: 'मक्का',
    n: [80, 120], p: [50, 70], k: [40, 60],
    soil: ['Loamy', 'Sandy', 'Red'],
    water: ['Rainfed', 'Irrigated'],
    season: ['Kharif', 'Rabi'],
    regions: ['Karnataka', 'Maharashtra', 'Andhra Pradesh', 'Rajasthan'],
    profit: 'Medium', duration: '80-100 days',
    tip: 'Versatile crop. Good for food, fodder, and poultry feed market.'
  },
  {
    name: 'Groundnut', kannada: 'ಶೇಂಗಾ', hindi: 'मूंगफली',
    n: [20, 40], p: [40, 60], k: [40, 80],
    soil: ['Sandy', 'Red', 'Loamy'],
    water: ['Rainfed', 'Limited'],
    season: ['Kharif', 'Zaid'],
    regions: ['Karnataka', 'Andhra Pradesh', 'Gujarat', 'Tamil Nadu'],
    profit: 'High', duration: '90-120 days',
    tip: 'Fixes nitrogen naturally. Great for sandy/red soils with good drainage.'
  },
  {
    name: 'Sugarcane', kannada: 'ಕಬ್ಬು', hindi: 'गन्ना',
    n: [150, 250], p: [60, 80], k: [100, 150],
    soil: ['Loamy', 'Clay'],
    water: ['Irrigated'],
    season: ['Kharif', 'Rabi'],
    regions: ['Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Tamil Nadu'],
    profit: 'High', duration: '300-360 days',
    tip: 'High water and fertiliser need. Guaranteed purchase by sugar mills.'
  },
  {
    name: 'Tomato', kannada: 'ಟೊಮೇಟೊ', hindi: 'टमाटर',
    n: [100, 150], p: [60, 80], k: [80, 120],
    soil: ['Loamy', 'Red'],
    water: ['Irrigated', 'Limited'],
    season: ['Rabi', 'Zaid'],
    regions: ['Karnataka', 'Andhra Pradesh', 'Maharashtra', 'Tamil Nadu'],
    profit: 'High', duration: '60-90 days',
    tip: 'High market demand but price volatile. Good for small irrigated plots.'
  },
  {
    name: 'Onion', kannada: 'ಈರುಳ್ಳಿ', hindi: 'प्याज',
    n: [80, 120], p: [40, 60], k: [60, 100],
    soil: ['Loamy', 'Sandy'],
    water: ['Irrigated', 'Limited'],
    season: ['Rabi', 'Kharif'],
    regions: ['Karnataka', 'Maharashtra', 'Madhya Pradesh', 'Rajasthan'],
    profit: 'High', duration: '90-120 days',
    tip: 'Well-drained loamy soil best. Store carefully to avoid post-harvest loss.'
  },
  {
    name: 'Soybean', kannada: 'ಸೋಯಾಬೀನ್', hindi: 'सोयाबीन',
    n: [20, 40], p: [60, 80], k: [40, 60],
    soil: ['Loamy', 'Black'],
    water: ['Rainfed'],
    season: ['Kharif'],
    regions: ['Maharashtra', 'Madhya Pradesh', 'Karnataka', 'Rajasthan'],
    profit: 'Medium', duration: '90-110 days',
    tip: 'Good nitrogen fixer. Ideal rotation crop after cotton or wheat.'
  },
  {
    name: 'Arecanut', kannada: 'ಅಡಿಕೆ', hindi: 'सुपारी',
    n: [60, 100], p: [40, 60], k: [100, 150],
    soil: ['Loamy', 'Red'],
    water: ['Irrigated'],
    season: ['Kharif'],
    regions: ['Karnataka', 'Kerala', 'Assam'],
    profit: 'Very High', duration: 'Perennial (7+ years)',
    tip: 'Long gestation but very high returns. Karnataka\'s top commercial crop.'
  },
  {
    name: 'Ragi (Finger Millet)', kannada: 'ರಾಗಿ', hindi: 'रागी',
    n: [40, 80], p: [20, 40], k: [20, 40],
    soil: ['Red', 'Sandy', 'Loamy'],
    water: ['Rainfed'],
    season: ['Kharif'],
    regions: ['Karnataka', 'Tamil Nadu', 'Andhra Pradesh'],
    profit: 'Low', duration: '90-120 days',
    tip: 'Drought tolerant, nutritious. Low input cost, stable local demand.'
  },
  {
    name: 'Jowar (Sorghum)', kannada: 'ಜೋಳ', hindi: 'ज्वार',
    n: [40, 80], p: [20, 40], k: [20, 40],
    soil: ['Black', 'Loamy', 'Red'],
    water: ['Rainfed'],
    season: ['Kharif', 'Rabi'],
    regions: ['Karnataka', 'Maharashtra', 'Telangana', 'Madhya Pradesh'],
    profit: 'Low', duration: '90-120 days',
    tip: 'Drought hardy. Good for dry regions with poor soil. Dual use: food + fodder.'
  },
  {
    name: 'Turmeric', kannada: 'ಅರಿಸಿನ', hindi: 'हल्दी',
    n: [60, 100], p: [40, 60], k: [80, 120],
    soil: ['Loamy', 'Red'],
    water: ['Irrigated', 'Limited'],
    season: ['Kharif'],
    regions: ['Karnataka', 'Andhra Pradesh', 'Tamil Nadu', 'Telangana'],
    profit: 'High', duration: '180-270 days',
    tip: 'High value spice crop. Well-drained loamy soils with good organic matter.'
  },
];

function scoreMatch(crop, input) {
  let score = 0;
  const { n, p, k, soil, water, season, region } = input;

  // NPK scoring
  if (n >= crop.n[0] && n <= crop.n[1]) score += 30;
  else if (n >= crop.n[0] * 0.7 && n <= crop.n[1] * 1.3) score += 15;

  if (p >= crop.p[0] && p <= crop.p[1]) score += 20;
  else if (p >= crop.p[0] * 0.7 && p <= crop.p[1] * 1.3) score += 10;

  if (k >= crop.k[0] && k <= crop.k[1]) score += 20;
  else if (k >= crop.k[0] * 0.7 && k <= crop.k[1] * 1.3) score += 10;

  // Soil
  if (crop.soil.includes(soil)) score += 15;

  // Water
  if (crop.water.includes(water)) score += 10;

  // Season
  if (crop.season.includes(season)) score += 10;

  // Region bonus
  if (crop.regions.some(r => r.toLowerCase().includes(region.toLowerCase()))) score += 5;

  return score;
}

router.post('/recommend', (req, res) => {
  const { n, p, k, soil, water, season, region } = req.body;

  if (!soil || !water || !season) {
    return res.status(400).json({ error: 'Please fill all fields' });
  }

  const input = {
    n: parseFloat(n) || 50,
    p: parseFloat(p) || 50,
    k: parseFloat(k) || 50,
    soil, water, season,
    region: region || ''
  };

  const scored = CROPS
    .map(crop => ({ ...crop, score: scoreMatch(crop, input) }))
    .filter(c => c.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (scored.length === 0) {
    return res.json({ success: true, recommendations: [], message: 'No strong match found. Try adjusting your inputs.' });
  }

  res.json({ success: true, recommendations: scored });
});

module.exports = router;
