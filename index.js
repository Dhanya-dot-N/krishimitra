require('dotenv').config();

// Validate required env vars
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️  ANTHROPIC_API_KEY not set — disease detection will fail');
}
if (!process.env.OPENWEATHER_API_KEY) {
  console.warn('⚠️  OPENWEATHER_API_KEY not set — irrigation will use mock data');
}

require('./server');
