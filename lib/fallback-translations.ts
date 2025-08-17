// Fallback translations for common attendance terms
// Used when external translation APIs are unavailable

interface FallbackTranslations {
  [key: string]: {
    [language: string]: string
  }
}

const fallbackTranslations: FallbackTranslations = {
  'absent': {
    'bn': 'অনুপস্থিত',
    'hi': 'अनुपस्थित',
    'ar': 'غائب'
  },
  'present': {
    'bn': 'উপস্থিত',
    'hi': 'उपस्थित',
    'ar': 'حاضر'
  },
  'late': {
    'bn': 'বিলম্ব',
    'hi': 'देर',
    'ar': 'متأخر'
  },
  'early': {
    'bn': 'শীঘ্র',
    'hi': 'जल्दी',
    'ar': 'مبكر'
  },
  'sunday': {
    'bn': 'রবিবার',
    'hi': 'रविवार',
    'ar': 'الأحد'
  },
  'monday': {
    'bn': 'সোমবার',
    'hi': 'सोमवार',
    'ar': 'الاثنين'
  },
  'tuesday': {
    'bn': 'মঙ্গলবার',
    'hi': 'मंगलवार',
    'ar': 'الثلاثاء'
  },
  'wednesday': {
    'bn': 'বুধবার',
    'hi': 'बुधवार',
    'ar': 'الأربعاء'
  },
  'thursday': {
    'bn': 'বৃহস্পতিবার',
    'hi': 'गुरुवार',
    'ar': 'الخميس'
  },
  'friday': {
    'bn': 'শুক্রবার',
    'hi': 'शुक्रवार',
    'ar': 'الجمعة'
  },
  'saturday': {
    'bn': 'শনিবার',
    'hi': 'शनिवार',
    'ar': 'السبت'
  },
  'warning': {
    'bn': 'সতর্কতা',
    'hi': 'चेतावनी',
    'ar': 'تحذير'
  },
  'sick': {
    'bn': 'অসুস্থ',
    'hi': 'बीमार',
    'ar': 'مريض'
  },
  'leave': {
    'bn': 'ছুটি',
    'hi': 'छुट्टी',
    'ar': 'إجازة'
  },
  'holiday': {
    'bn': 'ছুটির দিন',
    'hi': 'छुट्टी का दिन',
    'ar': 'يوم عطلة'
  },
  'overtime': {
    'bn': 'অতিরিক্ত সময়',
    'hi': 'ओवरटाइम',
    'ar': 'وقت إضافي'
  },
  'break': {
    'bn': 'বিরতি',
    'hi': 'ब्रेक',
    'ar': 'استراحة'
  },
  'duty': {
    'bn': 'কর্তব্য',
    'hi': 'ड्यूटी',
    'ar': 'واجب'
  },
  'work': {
    'bn': 'কাজ',
    'hi': 'काम',
    'ar': 'عمل'
  },
  'location': {
    'bn': 'অবস্থান',
    'hi': 'स्थान',
    'ar': 'موقع'
  },
  'time': {
    'bn': 'সময়',
    'hi': 'समय',
    'ar': 'وقت'
  },
  'hour': {
    'bn': 'ঘন্টা',
    'hi': 'घंटा',
    'ar': 'ساعة'
  },
  'minute': {
    'bn': 'মিনিট',
    'hi': 'मिनट',
    'ar': 'دقيقة'
  }
}

export function getFallbackTranslation(text: string, targetLanguage: string): string | null {
  if (targetLanguage === 'en') {
    return null // No translation needed for English
  }

  // Convert text to lowercase for matching
  const lowerText = text.toLowerCase().trim()
  
  // Check for exact matches first
  if (fallbackTranslations[lowerText] && fallbackTranslations[lowerText][targetLanguage]) {
    return fallbackTranslations[lowerText][targetLanguage]
  }

  // Check for partial matches (words within the text)
  for (const [key, translations] of Object.entries(fallbackTranslations)) {
    if (lowerText.includes(key) && translations[targetLanguage]) {
      // Replace the English word with translated word
      const regex = new RegExp(key, 'gi')
      return text.replace(regex, translations[targetLanguage])
    }
  }

  return null
}

export function hasFallbackTranslation(text: string, targetLanguage: string): boolean {
  return getFallbackTranslation(text, targetLanguage) !== null
}

