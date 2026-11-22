/* ========================
   KrishiMitra Language Toggle
   English / Hindi / Kannada
======================== */

const LANGS = {
  en: {
    // Nav
    nav_disease: '🔬 Disease Detection',
    nav_irrigation: '💧 Irrigation',
    nav_prices: '📈 Market Prices',
    nav_crops: '🌱 Crop Advisor',
    logo_sub: 'कृषि मित्र — Your Farming Companion',

    // Disease tab
    disease_title: 'Crop Disease Detection',
    disease_desc: 'Upload a photo of your crop — our AI will diagnose and prescribe treatment instantly.',
    upload_text: 'Click or drag a crop photo here',
    upload_sub: 'JPG, PNG up to 10MB',
    btn_change: '↩ Change Photo',
    btn_analyze: '🔬 Analyze Crop',
    analyzing: 'Analyzing your crop with AI vision...',

    // Irrigation tab
    irr_title: 'Smart Irrigation Advisor',
    irr_desc: "Enter your location to get today's irrigation recommendation based on live weather.",
    irr_placeholder: 'Enter city (e.g. Pune, Nagpur, Ludhiana)',
    irr_btn: 'Check Weather →',
    irr_location: '📍 Use My Location',
    irr_or: '— or use your location —',
    irr_loading: 'Fetching weather data...',

    // Prices tab
    prices_title: 'Market Price Trends',
    prices_desc: 'View mandi price trends for major crops to plan your selling strategy.',
    prices_select: '-- Select a Crop --',

    // Footer
    footer: 'KrishiMitra © 2024 | Powered by AI | Built for Indian Farmers 🇮🇳',
    crops_title: '🌱 Crop Recommender',
crops_desc: 'Enter your soil and field details — we\'ll recommend the best crops to grow.',
  },

  hi: {
    nav_disease: '🔬 रोग पहचान',
    nav_irrigation: '💧 सिंचाई',
    nav_prices: '📈 बाज़ार भाव',
    logo_sub: 'कृषि मित्र — आपका खेती सहायक',
    nav_crops: '🌱 फसल सलाहकार',

    disease_title: 'फसल रोग पहचान',
    disease_desc: 'अपनी फसल की फोटो अपलोड करें — हमारा AI तुरंत रोग पहचानकर उपचार बताएगा।',
    upload_text: 'यहाँ फसल की फोटो क्लिक करें या खींचें',
    upload_sub: 'JPG, PNG, अधिकतम 10MB',
    btn_change: '↩ फोटो बदलें',
    btn_analyze: '🔬 फसल जाँचें',
    analyzing: 'AI से फसल की जाँच हो रही है...',

    irr_title: 'स्मार्ट सिंचाई सलाहकार',
    irr_desc: 'आज की सिंचाई सलाह के लिए अपना शहर दर्ज करें।',
    irr_placeholder: 'शहर का नाम डालें (जैसे पुणे, लखनऊ)',
    irr_btn: 'मौसम देखें →',
    irr_location: '📍 मेरी लोकेशन उपयोग करें',
    irr_or: '— या अपनी लोकेशन उपयोग करें —',
    irr_loading: 'मौसम डेटा लोड हो रहा है...',

    prices_title: 'मंडी भाव',
    prices_desc: 'प्रमुख फसलों के मंडी भाव देखें और बेचने की योजना बनाएं।',
    prices_select: '-- फसल चुनें --',

    footer: 'KrishiMitra © 2024 | AI द्वारा संचालित | भारतीय किसानों के लिए 🇮🇳',
    crops_title: '🌱 फसल सलाहकार',
crops_desc: 'अपनी मिट्टी और खेत की जानकारी दें — हम सबसे अच्छी फसल सुझाएंगे।',
  },

  kn: {
    nav_disease: '🔬 ರೋಗ ಪತ್ತೆ',
    nav_irrigation: '💧 ನೀರಾವರಿ',
    nav_prices: '📈 ಮಾರುಕಟ್ಟೆ ಬೆಲೆ',
    nav_crops: '🌱 ಬೆಳೆ ಸಲಹೆಗಾರ',
    logo_sub: 'ಕೃಷಿ ಮಿತ್ರ — ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ',

    disease_title: 'ಬೆಳೆ ರೋಗ ಪತ್ತೆ',
    disease_desc: 'ನಿಮ್ಮ ಬೆಳೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — ನಮ್ಮ AI ತಕ್ಷಣ ರೋಗ ಗುರುತಿಸಿ ಚಿಕಿತ್ಸೆ ತಿಳಿಸುತ್ತದೆ.',
    upload_text: 'ಇಲ್ಲಿ ಬೆಳೆ ಫೋಟೋ ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಎಳೆಯಿರಿ',
    upload_sub: 'JPG, PNG ಗರಿಷ್ಠ 10MB',
    btn_change: '↩ ಫೋಟೋ ಬದಲಿಸಿ',
    btn_analyze: '🔬 ಬೆಳೆ ಪರೀಕ್ಷಿಸಿ',
    analyzing: 'AI ಮೂಲಕ ಬೆಳೆ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',

    irr_title: 'ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ ಸಲಹೆಗಾರ',
    irr_desc: 'ಇಂದಿನ ನೀರಾವರಿ ಸಲಹೆಗಾಗಿ ನಿಮ್ಮ ನಗರ ನಮೂದಿಸಿ.',
    irr_placeholder: 'ನಗರ ಹೆಸರು ನಮೂದಿಸಿ (ಉದಾ: ಬೆಂಗಳೂರು, ಹುಬ್ಬಳ್ಳಿ)',
    irr_btn: 'ಹವಾಮಾನ ನೋಡಿ →',
    irr_location: '📍 ನನ್ನ ಸ್ಥಳ ಬಳಸಿ',
    irr_or: '— ಅಥವಾ ನಿಮ್ಮ ಸ್ಥಳ ಬಳಸಿ —',
    irr_loading: 'ಹವಾಮಾನ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',

    prices_title: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಪ್ರವೃತ್ತಿ',
    prices_desc: 'ಪ್ರಮುಖ ಬೆಳೆಗಳ ಮಂಡಿ ಬೆಲೆ ನೋಡಿ ಮಾರಾಟ ಯೋಜಿಸಿ.',
    prices_select: '-- ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ --',

    footer: 'KrishiMitra © 2024 | AI ಚಾಲಿತ | ಭಾರತೀಯ ರೈತರಿಗಾಗಿ 🇮🇳',
    crops_title: '🌱 ಬೆಳೆ ಸಲಹೆಗಾರ',
crops_desc: 'ನಿಮ್ಮ ಮಣ್ಣು ಮತ್ತು ಜಮೀನಿನ ವಿವರ ನಮೂದಿಸಿ — ನಾವು ಉತ್ತಮ ಬೆಳೆ ಸೂಚಿಸುತ್ತೇವೆ।',
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  currentLang = lang;
  const t = LANGS[lang];

  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`lang-${lang}`)?.classList.add('active');

  // Nav
  const navBtns = document.querySelectorAll('.nav-btn');
  if (navBtns[0]) navBtns[0].textContent = t.nav_disease;
  if (navBtns[1]) navBtns[1].textContent = t.nav_irrigation;
  if (navBtns[2]) navBtns[2].textContent = t.nav_prices;
  if (navBtns[3]) navBtns[3].textContent = t.nav_crops;

  // Logo
  const logoSub = document.querySelector('.logo-sub');
  if (logoSub) logoSub.textContent = t.logo_sub;

  // Disease tab
  setText('disease-title', t.disease_title);
  setText('disease-desc', t.disease_desc);
  setText('upload-text', t.upload_text);
  setText('upload-sub', t.upload_sub);
  setText('btn-change', t.btn_change);
  setText('btn-analyze', t.btn_analyze);
  setText('analyzing-text', t.analyzing);

  // Irrigation tab
  setText('irr-title', t.irr_title);
  setText('irr-desc', t.irr_desc);
  setAttr('cityInput', 'placeholder', t.irr_placeholder);
  setText('irr-btn', t.irr_btn);
  setText('irr-location', t.irr_location);
  setText('irr-or', t.irr_or);
  setText('irr-loading-text', t.irr_loading);

  // Prices tab
  setText('prices-title', t.prices_title);
  setText('prices-desc', t.prices_desc);
  const firstOpt = document.querySelector('#cropSelect option:first-child');
  if (firstOpt) firstOpt.textContent = t.prices_select;

  // Footer
  setText('footer-text', t.footer);

  setText('crops-title', t.crops_title);
  setText('crops-desc', t.crops_desc);
  

  // Font for Devanagari
  document.body.style.fontFamily = lang === 'en'
    ? "'DM Sans', sans-serif"
    : "'Tiro Devanagari Hindi', 'DM Sans', sans-serif";
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function setAttr(id, attr, val) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, val);
}
