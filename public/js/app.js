/* ========================
   KrishiMitra Frontend Logic
======================== */

let priceChartInstance = null;

// ── Tab Navigation ──────────────────────────────
function showTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  const btns = document.querySelectorAll('.nav-btn');
  const map = { disease: 0, irrigation: 1, prices: 2 };
  btns[map[name]]?.classList.add('active');

  if (name === 'prices') initPrices();
}

// ── Helpers ─────────────────────────────────────
function show(id)   { document.getElementById(id)?.classList.remove('hidden'); }
function hide(id)   { document.getElementById(id)?.classList.add('hidden'); }

function urgencyTag(u) {
  if (!u) return '';
  const map = { 'Monitor': 'tag-green', 'Act Soon': 'tag-yellow', 'Urgent': 'tag-red' };
  return `<span class="tag ${map[u] || 'tag-gray'}">${u}</span>`;
}
function confTag(c) {
  const map = { 'High': 'tag-green', 'Medium': 'tag-yellow', 'Low': 'tag-red' };
  return `<span class="tag ${map[c] || 'tag-gray'}">Confidence: ${c}</span>`;
}
function sevTag(s) {
  const map = { 'None': 'tag-green', 'Mild': 'tag-yellow', 'Moderate': 'tag-yellow', 'Severe': 'tag-red' };
  return `<span class="tag ${map[s] || 'tag-gray'}">Severity: ${s}</span>`;
}

// ── FEATURE 1: Disease Detection ─────────────────

const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const PESTICIDE_IMAGES = {
  'mancozeb': '/images/pesticides/mancozeb.jpg',
  'neem': '/images/pesticides/neem-oil.jpg',
  'propiconazole': '/images/pesticides/propiconazole.jpg',
  'chlorothalonil': '/images/pesticides/chlorothalonil.jpg',
  'sulphur': '/images/pesticides/sulphur-wp.jpg',
  'copper': '/images/pesticides/copper-sulphate.jpg',
  'hexaconazole': '/images/pesticides/hexaconazole.jpg',
  'metalaxyl': '/images/pesticides/metalaxyl.jpg',
};

function getPesticideImage(text) {
  const lower = text.toLowerCase();
  for (const [key, path] of Object.entries(PESTICIDE_IMAGES)) {
    if (lower.includes(key)) return path;
  }
  return null;
}
// Drag & Drop
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) showPreview(file);
});

function handleImageSelect(e) {
  const file = e.target.files[0];
  if (file) showPreview(file);
}

function showPreview(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('imagePreview').src = ev.target.result;
    hide('uploadArea');
    hide('diseaseResult');
    hide('diseaseLoading');
    show('imagePreviewBox');
  };
  reader.readAsDataURL(file);
  // Store file for upload
  uploadArea._selectedFile = file;
}

function resetUpload() {
  hide('imagePreviewBox');
  hide('diseaseResult');
  show('uploadArea');
  imageInput.value = '';
  uploadArea._selectedFile = null;
}

async function detectDisease() {
  const file = uploadArea._selectedFile || imageInput.files[0];
  if (!file) return alert('Please select an image first.');

  hide('imagePreviewBox');
  show('diseaseLoading');
  hide('diseaseResult');

  const formData = new FormData();
  formData.append('cropImage', file);

  try {
    const res = await fetch('/api/disease/detect', { method: 'POST', body: formData });
    const data = await res.json();

    hide('diseaseLoading');

    if (!data.success) throw new Error(data.error || 'Detection failed');
    renderDiseaseResult(data.diagnosis, data.imagePath);
  } catch (err) {
    hide('diseaseLoading');
    show('imagePreviewBox');
    alert('Error: ' + err.message);
  }
}

function renderDiseaseResult(d, imgPath) {
  const isHealthy = d.disease?.toLowerCase().includes('healthy');
  const icon = isHealthy ? '✅' : (d.severity === 'Severe' ? '🚨' : '⚠️');

  const treatmentHtml = d.treatment ? `
    <div class="detail-section">
      <h4>Treatment Plan</h4>
      <div class="treatment-grid">
        ${d.treatment.immediate?.length ? `
          <div class="treatment-box">
            <h5>⚡ Immediate</h5>
            <p>${d.treatment.immediate.join('. ')}</p>
          </div>` : ''}
        ${d.treatment.chemical?.length ? `
      <div class="treatment-box">
           <h5>🧪 Chemical</h5>
        ${d.treatment.chemical.map(c => {
         const img = getPesticideImage(c);
         return '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">' +
        (img ? '<img src="' + img + '" style="width:48px;height:48px;object-fit:contain;border-radius:6px;border:1px solid #e8d9c4;">' : '') +
        '<span style="font-size:0.88rem;">' + c + '</span></div>';
    }).join('')}
  </div>` : ''}
        ${d.treatment.organic?.length ? `
          <div class="treatment-box">
            <h5>🌿 Organic</h5>
            <p>${d.treatment.organic.join('. ')}</p>
          </div>` : ''}
        ${d.treatment.preventive?.length ? `
          <div class="treatment-box">
            <h5>🛡️ Preventive</h5>
            <p>${d.treatment.preventive.join('. ')}</p>
          </div>` : ''}
      </div>
    </div>` : '';

  const resultEl = document.getElementById('diseaseResult');
  resultEl.innerHTML = `
    <div class="disease-header">
      <div class="disease-badge">${icon}</div>
      <div>
        <div class="disease-name">${d.disease || 'Unknown'}</div>
        <div class="disease-crop">Crop: ${d.crop_type || 'Unknown'}</div>
        <div class="tag-row">
          ${confTag(d.confidence)}
          ${sevTag(d.severity)}
          ${urgencyTag(d.urgency)}
        </div>
      </div>
    </div>

    ${d.symptoms?.length ? `
      <div class="detail-section">
        <h4>Symptoms Observed</h4>
        <ul class="detail-list">${d.symptoms.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>` : ''}

    ${d.causes?.length ? `
      <div class="detail-section">
        <h4>Likely Causes</h4>
        <ul class="detail-list">${d.causes.map(c => `<li>${c}</li>`).join('')}</ul>
      </div>` : ''}

    ${treatmentHtml}

    ${d.farmer_tip ? `<div class="farmer-tip">${d.farmer_tip}</div>` : ''}

    <div style="margin-top:1.2rem; text-align:center;">
      <button class="btn-secondary" onclick="resetUpload()">↩ Analyze Another Crop</button>
    </div>
  `;

  show('diseaseResult');
}

// ── FEATURE 2: Irrigation ─────────────────────────

async function checkIrrigation(lat, lon) {
  show('irrigationLoading');
  hide('irrigationResult');
  const crop = document.getElementById('irrigationCrop')?.value || 'General';
// add &crop=${encodeURIComponent(crop)} to the URL
  const city = document.getElementById('cityInput').value.trim();
  let url = '/api/irrigation/check?';
 if (lat && lon) url += `lat=${lat}&lon=${lon}`;
else if (city) url += `city=${encodeURIComponent(city)}`;
else {
  hide('irrigationLoading');
  return alert('Enter a city name or use location button.');
}
url += `&crop=${encodeURIComponent(crop)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    hide('irrigationLoading');
    if (!data.success) throw new Error(data.error);
    renderIrrigationResult(data);
  } catch (err) {
    hide('irrigationLoading');
    alert('Error: ' + err.message);
  }
}

function useMyLocation() {
  if (!navigator.geolocation) return alert('Geolocation not supported.');
  navigator.geolocation.getCurrentPosition(
    pos => checkIrrigation(pos.coords.latitude, pos.coords.longitude),
    () => alert('Could not get location. Please enter city manually.')
  );
}

function renderIrrigationResult(data) {
  const { weather, irrigation, regionWarning } = data;
   const warningHtml = regionWarning ? `
    <div style="background:#fee2e2;border:1.5px solid #fca5a5;border-radius:10px;padding:1rem;margin-bottom:1rem;">
      <div style="font-weight:700;color:#991b1b;font-size:1rem;">${regionWarning.message}</div>
      <div style="color:#7f1d1d;font-size:0.88rem;margin-top:0.3rem;">${regionWarning.roast}</div>
      ${regionWarning.alternatives.length ? `
        <div style="margin-top:0.6rem;font-size:0.85rem;color:#7f1d1d;">
          Better crops for ${regionWarning.state}: 
          <strong>${regionWarning.alternatives.join(', ')}</strong>
        </div>` : ''}
    </div>` : '';
  const decClass = { 'IRRIGATE TODAY': 'irrigate', 'SKIP TODAY': 'skip', 'OPTIONAL': 'optional' };

  document.getElementById('irrigationResult').innerHTML = `${warningHtml}
    <div style="margin-bottom:1rem;">
      <div class="irr-decision ${decClass[irrigation.decision] || ''}">${irrigation.icon} ${irrigation.decision}</div>
      <p style="color:var(--text-muted); font-size:0.92rem;">${irrigation.advice}</p>
      ${data.mock ? '<p style="font-size:0.78rem;color:var(--clay);margin-top:0.5rem;">⚠️ Demo data (set OPENWEATHER_API_KEY for live weather)</p>' : ''}
    </div>

    <div class="weather-grid">
      <div class="weather-cell">
        <div class="wval">${weather.temp}°C</div>
        <div class="wlbl">Temperature</div>
      </div>
      <div class="weather-cell">
        <div class="wval">${weather.humidity}%</div>
        <div class="wlbl">Humidity</div>
      </div>
      <div class="weather-cell">
        <div class="wval">${weather.rain}mm</div>
        <div class="wlbl">Recent Rain</div>
      </div>
      <div class="weather-cell">
        <div class="wval">${weather.wind}km/h</div>
        <div class="wlbl">Wind Speed</div>
      </div>
    </div>

    ${irrigation.reasons?.length ? `
      <div class="detail-section">
        <h4>Why this recommendation?</h4>
        <ul class="detail-list">${irrigation.reasons.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>` : ''}
  `;
  // Add log button after result
document.getElementById('irrigationResult').innerHTML += `
  <div style="margin-top:1.2rem;border-top:1.5px solid var(--border);padding-top:1rem;">
    <h4 style="font-size:0.82rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:0.8rem;">📓 Log Today's Irrigation</h4>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
      <button class="btn-primary" onclick="logIrrigation(true)">💧 Yes, I Irrigated</button>
      <button class="btn-secondary" onclick="logIrrigation(false)">⏭️ Skipped Today</button>
      <input type="number" id="waterAmount" placeholder="Litres used (optional)" class="text-input" style="width:200px;border-radius:50px;">
    </div>
    <div id="logConfirm" style="margin-top:0.6rem;font-size:0.88rem;color:var(--leaf);display:none;">✅ Logged successfully!</div>
  </div>
`;
  show('irrigationResult');
}
async function logIrrigation(irrigated) {
  const crop = document.getElementById('irrigationCrop')?.value || 'General';
  const water = document.getElementById('waterAmount')?.value || null;
  const today = new Date().toISOString().split('T')[0];

  await fetch('/api/log/irrigation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: today, crop, irrigated, water_amount: water })
  });

  document.getElementById('logConfirm').style.display = 'block';
}
// ── FEATURE 3: Market Prices ──────────────────────

async function initPrices() {
  try {
    const res = await fetch('/api/prices/crops');
    const data = await res.json();
    if (!data.success) return;

    const sel = document.getElementById('cropSelect');
    sel.innerHTML = '<option value="">-- Select a Crop --</option>';
    data.crops.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadPrices() {
   const crop = document.getElementById('cropSelect').value;
  const state = document.getElementById('stateSelect').value;
  if (!crop) return;
  // change fetch URL to:
  const res = await fetch(`/api/prices/data?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}`);

  show('pricesLoading');
  hide('pricesResult');

  try {
    const res = await fetch(`/api/prices/data?crop=${encodeURIComponent(crop)}`);
    const data = await res.json();
    hide('pricesLoading');
    if (!data.success || !data.records.length) throw new Error('No data found');
    renderPriceChart(crop, data.records);
  } catch (e) {
    hide('pricesLoading');
    alert('Error: ' + e.message);
  }
}

function renderPriceChart(crop, records) {
  const labels = records.map(r => r.date);
  const prices = records.map(r => parseFloat(r.price_per_quintal));

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const latest = prices[prices.length - 1];
  const trend = prices[prices.length - 1] > prices[0] ? '📈' : '📉';

  // Destroy previous chart
  if (priceChartInstance) priceChartInstance.destroy();

  const ctx = document.getElementById('priceChart').getContext('2d');
  priceChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${crop} Price (₹/quintal)`,
        data: prices,
        borderColor: '#2d6a4f',
        backgroundColor: 'rgba(45, 106, 79, 0.08)',
        pointBackgroundColor: '#d4a84b',
        pointBorderColor: '#2d6a4f',
        pointRadius: 5,
        borderWidth: 2.5,
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { font: { family: 'DM Sans', size: 13 }, color: '#3d2b1f' } },
        tooltip: {
          callbacks: {
            label: ctx => `₹${ctx.parsed.y.toLocaleString('en-IN')}/quintal`
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: v => '₹' + v.toLocaleString('en-IN'),
            color: '#7a6652'
          },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: { ticks: { color: '#7a6652' }, grid: { display: false } }
      }
    }
  });

  document.getElementById('priceStats').innerHTML = `
    <div class="stat-box">
      <div class="stat-val">₹${latest.toLocaleString('en-IN')}</div>
      <div class="stat-lbl">Latest Price ${trend}</div>
    </div>
    <div class="stat-box">
      <div class="stat-val">₹${avg.toLocaleString('en-IN')}</div>
      <div class="stat-lbl">6-Month Avg</div>
    </div>
    <div class="stat-box">
      <div class="stat-val">₹${min.toLocaleString('en-IN')}–${max.toLocaleString('en-IN')}</div>
      <div class="stat-lbl">Price Range</div>
    </div>
  `;

  show('pricesResult');
}
// ── FEATURE 4: Crop Recommender ──────────────────

async function getCropRecommendation() {
  const n = document.getElementById('npk-n').value;
  const p = document.getElementById('npk-p').value;
  const k = document.getElementById('npk-k').value;
  const soil = document.getElementById('soil-type').value;
  const water = document.getElementById('water-avail').value;
  const season = document.getElementById('season').value;
  const region = document.getElementById('region').value;

  if (!soil || !water || !season) return alert('Please fill Soil Type, Water, and Season at minimum.');

  show('cropsLoading');
  hide('cropsResult');

  try {
    const res = await fetch('/api/crops/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n, p, k, soil, water, season, region })
    });
    const data = await res.json();
    hide('cropsLoading');
    if (!data.success) throw new Error(data.error);
    renderCropResult(data.recommendations);
  } catch (err) {
    hide('cropsLoading');
    alert('Error: ' + err.message);
  }
}

function renderCropResult(recs) {
  const el = document.getElementById('cropsResult');

  if (!recs.length) {
    el.innerHTML = `<div class="result-card"><p style="color:var(--text-muted)">No strong match found. Try adjusting your inputs.</p></div>`;
    show('cropsResult');
    return;
  }

  const profitColor = { 'Low': 'tag-gray', 'Medium': 'tag-blue', 'High': 'tag-green', 'Very High': 'tag-yellow' };

  el.innerHTML = `
    <h3 style="font-family:'Space Mono',monospace;color:var(--leaf);margin-bottom:1rem;font-size:1rem;">
      Top ${recs.length} Recommended Crops
    </h3>
    ${recs.map((c, i) => `
      <div class="result-card" style="margin-bottom:1rem;">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.8rem;">
          <div style="background:var(--leaf);color:white;width:2rem;height:2rem;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">${i + 1}</div>
          <div>
            <div style="font-family:'Space Mono',monospace;font-size:1.1rem;font-weight:700;color:var(--soil);">
              ${c.name} <span style="font-size:0.85rem;color:var(--text-muted)">· ${c.kannada} · ${c.hindi}</span>
            </div>
            <div class="tag-row" style="margin-top:0.3rem;">
              <span class="tag ${profitColor[c.profit] || 'tag-gray'}">Profit: ${c.profit}</span>
              <span class="tag tag-gray">${c.duration}</span>
              <span class="tag tag-green">Match: ${c.score}%</span>
            </div>
          </div>
        </div>
        <div class="farmer-tip">${c.tip}</div>
      </div>
    `).join('')}
  `;
  show('cropsResult');
}