# 🌾 KrishiMitra (कृषि मित्र)

A multilingual farming assistant for Indian farmers, built solo in 24 hours for a social-impact hackathon.

**Photo in, action out. No typing needed.**

## The problem

Crop diseases and pests cause large losses for Indian farmers every season. Many farmers can't easily search for symptoms in text, and expert help isn't always available. KrishiMitra turns a phone photo into a diagnosis and a treatment plan, and puts weather, soil and mandi price information in one place.

## Features

- **Disease Detection:** upload a photo of a crop and get the likely disease, severity, symptoms, causes, and a treatment plan (immediate, chemical, organic, preventive). Recommended pesticides are shown with product pictures so farmers can recognise them at an agri shop.
- **Smart Irrigation:** tells the farmer whether to water today. It combines crop water needs, current weather, past-24h rain, the 48h rain forecast, and the farmer's own irrigation log (stored in SQLite).
- **Region check:** warns when the selected crop doesn't suit the farmer's region (e.g. wheat in Mysuru).
- **Crop Advisor:** enter N, P, K values, soil type, water availability, season and state to get ranked crop recommendations.
- **Market Prices:** live mandi prices from the Agmarknet dataset on data.gov.in, with a state filter and a CSV fallback.
- **Languages:** English, Hindi and Kannada for the main UI (navigation, titles, form labels). Diagnosis and recommendation text is currently English only.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript, Chart.js |
| Backend | Node.js, Express (port 3000) |
| Database | SQLite (`better-sqlite3`) for the irrigation log |
| Disease detection | HuggingFace Inference API (plant disease image model) |
| Weather | OpenWeatherMap (current + 5-day forecast) |
| Prices | data.gov.in Agmarknet API, CSV fallback |

## Getting started

### Prerequisites
- Node.js 18 or newer
- API keys (all have free tiers): [OpenWeatherMap](https://openweathermap.org/api), [data.gov.in](https://data.gov.in), [HuggingFace](https://huggingface.co/settings/tokens)

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/krishimitra.git
cd krishimitra
npm install
```

Create a `.env` file in the project root (copy `.env.example`):

```
OPENWEATHER_API_KEY=your_key_here
DATAGOVIN_API_KEY=your_key_here
HF_API_KEY=your_key_here
```

Run it:

```bash
node index.js
```

Open http://localhost:3000.

## Running without API keys

The app is built to keep working when a key is missing or an API is down:

- No `OPENWEATHER_API_KEY`: irrigation uses demo weather data (a notice is shown in the UI).
- No `DATAGOVIN_API_KEY`: prices come from `data/prices.csv` (sample data, not live).
- No `HF_API_KEY` or the model is unavailable: disease detection returns a sample diagnosis from a built-in list. **These fallback results are not based on the uploaded image**, so don't treat them as real diagnoses.

## Project structure

```
krishimitra/
├── index.js              # entry point, loads .env
├── server.js             # Express app and route wiring
├── routes/
│   ├── disease.js        # image upload + disease detection
│   ├── irrigation.js     # weather + forecast + log-aware advice
│   ├── irrigationLog.js  # SQLite irrigation diary
│   ├── crops.js          # NPK / soil crop recommender
│   └── prices.js         # Agmarknet prices + CSV fallback
├── public/
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js         # UI logic
│   ├── js/lang.js        # EN / HI / KN translations
│   └── images/pesticides/
└── data/prices.csv
```

## Limitations

- Disease detection accuracy depends on a small pretrained model and is not a substitute for an agronomist.
- The crop recommender and irrigation scoring use hand-tuned rules, not a model trained on field data.
- The data.gov.in dataset returns one day of prices across markets, so the price chart compares markets, not a time series.
- Soil values (N, P, K) are entered manually.

## Roadmap

- WhatsApp bot so farmers need no app or browser
- Full-content translation (diagnosis and advice) in Hindi and Kannada
- Voice controls using the Web Speech API
- Train the crop recommender on a public crop dataset
- Offline mode for low-connectivity areas

## Acknowledgements

Price data: Agmarknet via [data.gov.in](https://data.gov.in). Weather: OpenWeatherMap. Disease model: HuggingFace community models trained on the PlantVillage dataset.

## License

MIT
