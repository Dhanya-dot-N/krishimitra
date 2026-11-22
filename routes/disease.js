const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const fetch = require('node-fetch');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, `crop_${Date.now()}.jpg`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

const HF_TOKEN = process.env.HF_API_KEY;
const HF_MODEL = 'ozair23/mobilenet_v2-1.0-finetuned-plantdisease';

// Map model labels to full diagnosis
const DISEASE_MAP = {
  'Apple___Apple_scab': {
    disease: 'Apple Scab', severity: 'Moderate', urgency: 'Act Soon',
    symptoms: ['Olive-green spots on leaves', 'Dark scabby lesions on fruit'],
    causes: ['Fungal infection (Venturia inaequalis)', 'Wet spring weather'],
    treatment: {
      immediate: ['Remove infected leaves', 'Avoid wetting foliage'],
      chemical: ['Captan 50% WP @ 2g/L', 'Mancozeb spray'],
      organic: ['Neem oil spray', 'Sulfur dust'],
      preventive: ['Plant resistant varieties', 'Prune for air circulation']
    },
    farmer_tip: 'Apply fungicide before rain events to prevent spread.'
  },
  'Tomato___Early_blight': {
    disease: 'Early Blight', severity: 'Moderate', urgency: 'Act Soon',
    symptoms: ['Brown circular spots with yellow halo', 'Concentric ring lesions'],
    causes: ['Fungal infection (Alternaria solani)', 'High humidity'],
    treatment: {
      immediate: ['Remove infected leaves', 'Avoid overhead watering'],
      chemical: ['Mancozeb 75% WP @ 2g/L', 'Chlorothalonil spray'],
      organic: ['Neem oil @ 5ml/L', 'Copper sulphate'],
      preventive: ['Crop rotation', 'Maintain plant spacing']
    },
    farmer_tip: 'Spray Mancozeb this evening and remove all spotted leaves.'
  },
  'Potato___Late_blight': {
    disease: 'Late Blight', severity: 'Severe', urgency: 'Urgent',
    symptoms: ['Water-soaked dark lesions', 'White mold on leaf underside'],
    causes: ['Phytophthora infestans', 'Cool wet conditions'],
    treatment: {
      immediate: ['Apply fungicide immediately', 'Remove badly infected plants'],
      chemical: ['Metalaxyl + Mancozeb', 'Cymoxanil spray'],
      organic: ['Copper hydroxide', 'Increase potassium'],
      preventive: ['Use certified disease-free seed', 'Avoid overhead irrigation']
    },
    farmer_tip: 'This spreads fast — treat within 24 hours or risk total crop loss.'
  }
};

const MOCK_DIAGNOSES = [
  { label: 'Tomato___Early_blight', score: 0.91, crop_type: 'Tomato' },
  { label: 'Tomato___healthy', score: 0.95, crop_type: 'Tomato' },
  { label: 'Potato___Late_blight', score: 0.87, crop_type: 'Potato' },
  { label: 'Apple___Apple_scab', score: 0.82, crop_type: 'Apple' },
];

function buildDiagnosis(label, score, crop_type) {
  const base = DISEASE_MAP[label] || DISEASE_MAP['Tomato___Early_blight'];
  const confidence = score > 0.85 ? 'High' : score > 0.65 ? 'Medium' : 'Low';
  return {
    disease: base.disease,
    confidence,
    severity: base.severity,
    affected_parts: ['leaves', 'stem'],
    symptoms: base.symptoms,
    causes: base.causes,
    treatment: base.treatment,
    crop_type: crop_type || label.split('___')[0],
    urgency: base.urgency,
    farmer_tip: base.farmer_tip
  };
}

router.post('/detect', upload.single('cropImage'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  // Try HuggingFace first
  if (HF_TOKEN) {
    try {
      const imageData = fs.readFileSync(req.file.path);
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${HF_MODEL}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/octet-stream' },
          body: imageData
        }
      );

      if (response.ok) {
        const results = await response.json();
        if (Array.isArray(results) && results.length > 0) {
          const top = results[0];
          const diagnosis = buildDiagnosis(top.label, top.score);
          return res.json({ success: true, imagePath: `/uploads/${req.file.filename}`, diagnosis, source: 'ai' });
        }
      }
    } catch (err) {
      console.error('HuggingFace error:', err.message, '— falling back to mock');
    }
  }

  // Fallback: mock
  await new Promise(resolve => setTimeout(resolve, 2000));
  const hash = req.file.filename.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const mock = MOCK_DIAGNOSES[hash % MOCK_DIAGNOSES.length];
  const diagnosis = buildDiagnosis(mock.label, mock.score, mock.crop_type);

  res.json({ success: true, imagePath: `/uploads/${req.file.filename}`, diagnosis, source: 'mock' });
});

module.exports = router;