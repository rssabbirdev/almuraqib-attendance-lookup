// Translation utility using local Next.js API (avoids CORS issues)
import { getFallbackTranslation } from './fallback-translations'

export interface TranslationResult {
  translatedText: string
  detectedLanguage: string
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'auto'
): Promise<TranslationResult | null> {
  if (!text || text.trim() === '') {
    return null
  }

  // Skip translation if target language is English (source)
  if (targetLanguage === 'en') {
    return {
      translatedText: text,
      detectedLanguage: 'en'
    }
  }

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLanguage,
        sourceLanguage
      })
    })

    if (response.ok) {
      const data = await response.json()
      return {
        translatedText: data.translatedText || text,
        detectedLanguage: data.detectedLanguage || sourceLanguage
      }
    } else {
      console.warn('Translation API error:', response.status, response.statusText)
    }
  } catch (error) {
    console.warn('Translation request failed:', error)
  }

  // If translation fails, return original text
  return {
    translatedText: text,
    detectedLanguage: 'unknown'
  }
}

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>()

export async function getCachedTranslation(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'auto'
): Promise<string> {
  if (!text || text.trim() === '') {
    return text
  }

  // Create cache key
  const cacheKey = `${text}:${targetLanguage}:${sourceLanguage}`
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!
  }

  try {
    const result = await translateText(text, targetLanguage, sourceLanguage)
    
    if (result) {
      // Cache the result
      translationCache.set(cacheKey, result.translatedText)
      return result.translatedText
    }
  } catch (error) {
    console.error('Translation error:', error)
  }

  // Try fallback translation if API fails
  const fallbackResult = getFallbackTranslation(text, targetLanguage)
  if (fallbackResult) {
    // Cache the fallback result
    translationCache.set(cacheKey, fallbackResult)
    return fallbackResult
  }

  // Return original text if all translation methods fail
  return text
}

// Clear cache (useful for testing or memory management)
export function clearTranslationCache(): void {
  translationCache.clear()
}

// Get cache size (for debugging)
export function getTranslationCacheSize(): number {
  return translationCache.size
}
