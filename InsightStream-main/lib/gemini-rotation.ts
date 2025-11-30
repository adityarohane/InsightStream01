// API Key Rotation for Gemini
// Add multiple keys to avoid quota limits

const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

export function getNextGeminiKey(): string {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured');
  }

  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  
  console.log(`Using Gemini key ${currentKeyIndex + 1}/${GEMINI_API_KEYS.length}`);
  
  return key;
}

export function getRandomGeminiKey(): string {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured');
  }

  const randomIndex = Math.floor(Math.random() * GEMINI_API_KEYS.length);
  console.log(`Using random Gemini key ${randomIndex + 1}/${GEMINI_API_KEYS.length}`);
  
  return GEMINI_API_KEYS[randomIndex];
}

export function getTotalKeys(): number {
  return GEMINI_API_KEYS.length;
}
