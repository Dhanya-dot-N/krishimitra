const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const CROP_WATER = {
  'Rice':      { need: 'Very High', threshold: 1, advice: 'Rice needs consistently wet soil. Irrigate daily in dry weather.' },
  'Wheat':     { need: 'Medium',    threshold: 3, advice: 'Wheat needs moderate water. Critical at tillering and grain fill stages.' },
  'Cotton':    { need: 'Medium',    threshold: 3, advice: 'Cotton is drought tolerant but needs water at flowering and boll formation.' },
  'Maize':     { need: 'Medium',    threshold: 3, advice: 'Maize is sensitive to drought at tasseling. Keep soil moist.' },
  'Groundnut': { need: 'Low',       threshold: 4, advice: 'Groundnut is drought tolerant. Avoid waterlogging — damages pods.' },
  'Sugarcane': { need: 'Very High', threshold: 1, advice: 'Sugarcane needs heavy irrigation. Water every 7-10 days minimum.' },
  'Tomato':    { need: 'High',      threshold: 2, advice: 'Tomato needs regular even moisture. Irregular watering causes blossom end rot.' },
  'Onion':     { need: 'Medium',    threshold: 3, advice: 'Onion needs moderate water. Stop irrigation 2 weeks before harvest.' },
  'Soybean':   { need: 'Low',       threshold: 4, advice: 'Soybean tolerates dry spells. Critical water need at pod filling stage.' },
  'Arecanut':  { need: 'High',      threshold: 2, advice: 'Arecanut needs regular irrigation, especially in dry season (Dec-May).' },
  'Ragi':      { need: 'Very Low',  threshold: 5, advice: 'Ragi is highly drought tolerant. Irrigate only in prolonged dry spells.' },
  'Jowar':     { need: 'Very Low',  threshold: 5, advice: 'Jowar is very drought hardy. Only irrigate at critical growth stages.' },
  'Turmeric':  { need: 'High',      threshold: 2, advice: 'Turmeric needs moist soil throughout. Mulch to retain moisture.' },
  'General':   { need: 'Medium',    threshold: 3, advice: 'Check soil moisture at 2 inch depth before irrigating.' },
};

const CROP_REGIONS = {
  'Rice':      ['West Bengal', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Odisha', 'Assam'],
  'Wheat':     ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Bihar'],
  'Cotton':    ['Gujarat', 'Maharashtra', 'Telangana', 'Karnataka', 'Andhra Pradesh', 'Punjab', 'Haryana'],
  'Maize':     ['Karnataka', 'Andhra Pradesh', 'Maharashtra', 'Rajasthan', 'Uttar Pradesh', 'Bihar'],
  'Groundnut': ['Gujarat', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Rajasthan', 'Maharashtra'],
  'Sugarcane': ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Bihar'],
  'Tomato':    ['Karnataka', 'Andhra Pradesh', 'Maharashtra', 'Tamil Nadu', 'Gujarat'],
  'Onion':     ['Maharashtra', 'Karnataka', 'Madhya Pradesh', 'Rajasthan', 'Gujarat'],
  'Soybean':   ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka'],
  'Arecanut':  ['Karnataka', 'Kerala', 'Assam', 'West Bengal'],
  'Ragi':      ['Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Maharashtra'],
  'Jowar':     ['Maharashtra', 'Karnataka', 'Telangana', 'Madhya Pradesh', 'Rajasthan'],
  'Turmeric':  ['Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Telangana', 'Odisha'],
  'Apple':     ['Himachal Pradesh', 'Jammu & Kashmir', 'Uttarakhand'],
  'Banana':    ['Tamil Nadu', 'Maharashtra', 'Karnataka', 'Gujarat', 'Andhra Pradesh'],
};

const CITY_STATE = {
  'mysuru': 'Karnataka', 'mysore': 'Karnataka',
  'bangalore': 'Karnataka', 'bengaluru': 'Karnataka',
  'hubli': 'Karnataka', 'dharwad': 'Karnataka',
  'mangalore': 'Karnataka', 'mangaluru': 'Karnataka',
  'shimla': 'Himachal Pradesh', 'manali': 'Himachal Pradesh',
  'srinagar': 'Jammu & Kashmir', 'jammu': 'Jammu & Kashmir',
  'pune': 'Maharashtra', 'nashik': 'Maharashtra', 'nagpur': 'Maharashtra', 'mumbai': 'Maharashtra',
  'ludhiana': 'Punjab', 'amritsar': 'Punjab', 'chandigarh': 'Punjab',
  'hyderabad': 'Telangana', 'warangal': 'Telangana',
  'delhi': 'Delhi', 'new delhi': 'Delhi',
  'jaipur': 'Rajasthan', 'jodhpur': 'Rajasthan',
  'lucknow': 'Uttar Pradesh', 'kanpur': 'Uttar Pradesh', 'varanasi': 'Uttar Pradesh',
  'ahmedabad': 'Gujarat', 'surat': 'Gujarat', 'vadodara': 'Gujarat',
  'chennai': 'Tamil Nadu', 'coimbatore': 'Tamil Nadu', 'madurai': 'Tamil Nadu',
  'kolkata': 'West Bengal', 'siliguri': 'West Bengal',
  'bhopal': 'Madhya Pradesh', 'indore': 'Madhya Pradesh',
  'patna': 'Bihar', 'gaya': 'Bihar',
};

const STATE_ALTERNATIVES = {
  'Karnataka': ['Ragi', 'Maize', 'Cotton', 'Arecanut', 'Tomato', 'Sugarcane'],
  'Maharashtra': ['Cotton', 'Soybean', 'Onion', 'Sugarcane', 'Jowar'],
  'Punjab': ['Wheat', 'Cotton', 'Rice', 'Maize'],
  'Uttar Pradesh': ['Wheat', 'Sugarcane', 'Rice', 'Maize'],
  'Gujarat': ['Cotton', 'Groundnut', 'Wheat', 'Onion'],
  'Tamil Nadu': ['Rice', 'Ragi', 'Banana', 'Turmeric', 'Groundnut'],
  'Andhra Pradesh': ['Rice', 'Cotton', 'Maize', 'Groundnut', 'Turmeric'],
  'Rajasthan': ['Jowar', 'Wheat', 'Groundnut', 'Maize'],
  'Madhya Pradesh': ['Soybean', 'Wheat', 'Jowar', 'Cotton'],
  'Telangana': ['Cotton', 'Jowar', 'Maize', 'Turmeric'],
};

function checkCropRegionMatch(crop, cityName) {
  if (!crop || crop === 'General' || !cityName) return null;
  const state = CITY_STATE[cityName.toLowerCase()];
  if (!state) return null;
  const validRegions = CROP_REGIONS[crop];
  if (!validRegions) return null;
  if (validRegions.includes(state)) return null;
  const alternatives = (STATE_ALTERNATIVES[state] || []).slice(0, 3);
  const roasts = {
    'Apple': `Bro, apples need cold Himalayan weather — not ${state}'s heat! 🍎❌`,
    'Wheat': `Wheat in ${state}? That's a Punjab crop! Save your seeds. 🌾❌`,
    'default': `${crop} really doesn't belong in ${state}. Your neighbours will laugh. 😅`
  };
  return {
    warning: true, state,
    message: `⚠️ ${crop} does not grow well in ${state}! You're wasting water and money.`,
    alternatives,
    roast: roasts[crop] || roasts['default']
  };
}

function calcIrrigationAdvice(weather, forecast, crop, recentLogs) {
  const cropData = CROP_WATER[crop] || CROP_WATER['General'];
  let score = 0;
  let reasons = [];

  // Crop water need baseline
  const needMap = { 'Very High': 3, 'High': 2, 'Medium': 0, 'Low': -1, 'Very Low': -2 };
  score += needMap[cropData.need] || 0;
  reasons.push(`${crop || 'This crop'} has ${cropData.need.toLowerCase()} water needs`);

  // Today's weather
  const { temp, humidity, rain, wind } = weather;
  if (temp > 35) { score += 3; reasons.push('High temperature (>35°C) increases evaporation'); }
  else if (temp > 28) { score += 1; reasons.push('Warm temperature increases water demand'); }
  if (humidity < 40) { score += 2; reasons.push('Low humidity causes faster soil drying'); }
  else if (humidity > 80) { score -= 1; reasons.push('High humidity reduces evaporation loss'); }
  if (rain > 10) { score -= 4; reasons.push(`Today's rainfall (${rain}mm) is significant`); }
  else if (rain > 3) { score -= 2; reasons.push(`Light rain today (${rain}mm)`); }
  if (wind > 20) { score += 1; reasons.push('Strong wind increases evaporation'); }

  // Forecast: next 48 hours rain
  const next48Rain = forecast.next48Rain || 0;
  const next48Max = forecast.next48Max || temp;
  if (next48Rain > 15) { score -= 4; reasons.push(`Heavy rain forecast in next 2 days (${next48Rain.toFixed(1)}mm) — skip irrigation`); }
  else if (next48Rain > 5) { score -= 2; reasons.push(`Rain expected in next 2 days (${next48Rain.toFixed(1)}mm)`); }
  else if (next48Rain === 0 && next48Max > 32) { score += 1; reasons.push('No rain forecast and hot days ahead'); }

  // Past 24h rain
  const past24Rain = forecast.past24Rain || 0;
  if (past24Rain > 10) { score -= 3; reasons.push(`Heavy rain yesterday (${past24Rain.toFixed(1)}mm) — soil still moist`); }
  else if (past24Rain > 3) { score -= 1; reasons.push(`Light rain yesterday (${past24Rain.toFixed(1)}mm)`); }

  // Farmer's own irrigation log
  if (recentLogs && recentLogs.length > 0) {
    const yesterday = recentLogs.find(l => {
      const d = new Date(l.date);
      const diff = (Date.now() - d.getTime()) / (1000 * 3600 * 24);
      return diff < 1.5 && l.irrigated;
    });
    const twoDaysAgo = recentLogs.find(l => {
      const d = new Date(l.date);
      const diff = (Date.now() - d.getTime()) / (1000 * 3600 * 24);
      return diff >= 1.5 && diff < 2.5 && l.irrigated;
    });

    if (yesterday) {
      score -= 3;
      reasons.push('You irrigated yesterday — soil should still have moisture');
    } else if (twoDaysAgo) {
      score -= 1;
      reasons.push('You irrigated 2 days ago — factored into recommendation');
    } else {
      const daysSinceIrrigation = recentLogs.filter(l => l.irrigated).length === 0 ? 3 : 0;
      if (daysSinceIrrigation >= 3) {
        score += 1;
        reasons.push('No irrigation logged in past 3 days');
      }
    }
  }

  let decision, advice, icon;
  if (score >= cropData.threshold) {
    decision = 'IRRIGATE TODAY';
    advice = cropData.advice;
    icon = '💧';
  } else if (score >= cropData.threshold - 1) {
    decision = 'OPTIONAL';
    advice = `Conditions are borderline. ${cropData.advice}`;
    icon = '🌤️';
  } else {
    decision = 'SKIP TODAY';
    advice = `Sufficient moisture. Save water today. ${cropData.advice}`;
    icon = '✅';
  }

  return {
    decision, advice, icon, score, reasons,
    cropWaterNeed: cropData.need,
    forecastSummary: {
      next48Rain: next48Rain.toFixed(1),
      past24Rain: past24Rain.toFixed(1),
      next48Max: next48Max.toFixed(1)
    }
  };
}

async function getWeatherAndForecast(apiKey, lat, lon, city) {
  let currentUrl, forecastUrl;

  if (lat && lon) {
    currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=24`;
  } else {
    currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&cnt=24`;
  }

  const [currentRes, forecastRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();

  if (!currentRes.ok) throw new Error(currentData.message || 'Weather API error');

  const weather = {
    temp: Math.round(currentData.main.temp),
    humidity: currentData.main.humidity,
    rain: currentData.rain ? (currentData.rain['1h'] || currentData.rain['3h'] || 0) : 0,
    wind: Math.round(currentData.wind.speed * 3.6),
    description: currentData.weather[0].description,
    city: currentData.name
  };

  // Process forecast — next 48h = 16 x 3hr slots
  const now = Date.now() / 1000;
  const next48 = (forecastData.list || []).filter(f => f.dt < now + 48 * 3600);
  const past24 = (forecastData.list || []).filter(f => f.dt < now && f.dt > now - 24 * 3600);

  const next48Rain = next48.reduce((sum, f) => sum + (f.rain?.['3h'] || 0), 0);
  const past24Rain = past24.reduce((sum, f) => sum + (f.rain?.['3h'] || 0), 0);
  const next48Max = next48.length ? Math.max(...next48.map(f => f.main.temp_max)) : weather.temp;

  // Build forecast days for display
  const forecastDays = [];
  const seen = new Set();
  for (const f of (forecastData.list || [])) {
    const date = new Date(f.dt * 1000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!seen.has(date) && forecastDays.length < 4) {
      seen.add(date);
      forecastDays.push({
        date,
        temp: Math.round(f.main.temp),
        rain: (f.rain?.['3h'] || 0).toFixed(1),
        desc: f.weather[0].main
      });
    }
  }

  return { weather, forecast: { next48Rain, past24Rain, next48Max, forecastDays } };
}

router.get('/check', async (req, res) => {
  const { lat, lon, city, crop } = req.query;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  // Try to get recent irrigation logs
  let recentLogs = [];
  try {
    const Database = require('better-sqlite3');
    const path = require('path');
    const db = new Database(path.join(__dirname, '../data/farm.db'));
    recentLogs = db.prepare(
      'SELECT * FROM irrigation_log WHERE crop = ? AND date >= date("now", "-3 days") ORDER BY date DESC'
    ).all(crop || 'General');
  } catch (e) { /* DB not available, skip */ }

  if (!apiKey) {
    const mockWeather = { temp: 32, humidity: 55, rain: 0, wind: 12, description: 'Partly cloudy', city: city || 'Your city' };
    const mockForecast = { next48Rain: 2, past24Rain: 0, next48Max: 34, forecastDays: [
      { date: 'Tomorrow', temp: 33, rain: '1.2', desc: 'Clouds' },
      { date: 'Day after', temp: 31, rain: '8.5', desc: 'Rain' },
    ]};
    const irrigation = calcIrrigationAdvice(mockWeather, mockForecast, crop || 'General', recentLogs);
    const regionWarning = checkCropRegionMatch(crop, city);
    return res.json({ success: true, weather: mockWeather, forecast: mockForecast, irrigation, regionWarning, mock: true });
  }

  try {
    const { weather, forecast } = await getWeatherAndForecast(apiKey, lat, lon, city);
    const irrigation = calcIrrigationAdvice(weather, forecast, crop || 'General', recentLogs);
    const regionWarning = checkCropRegionMatch(crop, weather.city || city);
    res.json({ success: true, weather, forecast, irrigation, regionWarning });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;