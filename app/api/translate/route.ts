import { NextRequest, NextResponse } from 'next/server'

// Multiple free translation API endpoints for fallback
const TRANSLATION_ENDPOINTS = [
  {
    name: 'LibreTranslate DE',
    url: 'https://libretranslate.de/translate',
    method: 'POST',
    body: (text: string, target: string, source: string) => ({
      q: text,
      source,
      target,
      format: 'text'
    })
  },
  {
    name: 'LibreTranslate Argos',
    url: 'https://translate.argosopentech.com/translate',
    method: 'POST',
    body: (text: string, target: string, source: string) => ({
      q: text,
      source,
      target,
      format: 'text'
    })
  },
  {
    name: 'LibreTranslate FortyTwo',
    url: 'https://translate.fortytwo-it.com/translate',
    method: 'POST',
    body: (text: string, target: string, source: string) => ({
      q: text,
      source,
      target,
      format: 'text'
    })
  }
]

let currentEndpointIndex = 0

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required parameters: text and targetLanguage' },
        { status: 400 }
      )
    }

    // Skip translation if target language is English (source)
    if (targetLanguage === 'en') {
      return NextResponse.json({
        translatedText: text,
        detectedLanguage: 'en'
      })
    }

    // Try each endpoint until one works
    for (let attempt = 0; attempt < TRANSLATION_ENDPOINTS.length; attempt++) {
      try {
        const endpoint = TRANSLATION_ENDPOINTS[currentEndpointIndex]
        
        const response = await fetch(endpoint.url, {
          method: endpoint.method as 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(endpoint.body(text, targetLanguage, sourceLanguage))
        })

        if (response.ok) {
          const data = await response.json()
          
          // Move to next endpoint for next request
          currentEndpointIndex = (currentEndpointIndex + 1) % TRANSLATION_ENDPOINTS.length
          
          return NextResponse.json({
            translatedText: data.translatedText || text,
            detectedLanguage: data.detectedLanguage?.confidence ? data.detectedLanguage.language : sourceLanguage
          })
        }
      } catch (error) {
        console.warn(`Translation attempt ${attempt + 1} (${TRANSLATION_ENDPOINTS[currentEndpointIndex].name}) failed:`, error)
      }

      // Move to next endpoint
      currentEndpointIndex = (currentEndpointIndex + 1) % TRANSLATION_ENDPOINTS.length
    }

    // If all endpoints fail, return original text
    console.warn('All translation endpoints failed, returning original text')
    return NextResponse.json({
      translatedText: text,
      detectedLanguage: 'unknown'
    })

  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
