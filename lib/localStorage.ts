// Utility functions for localStorage operations with fallbacks

const STORAGE_KEYS = {
  LANGUAGE: 'almuraqib-language',
  MOBILE: 'almuraqib-mobile'
} as const

// Check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Safe localStorage getter
export const getFromStorage = (key: string): string | null => {
  if (!isLocalStorageAvailable()) {
    return null
  }
  
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.warn(`Failed to get ${key} from localStorage:`, error)
    return null
  }
}

// Safe localStorage setter
export const setToStorage = (key: string, value: string): boolean => {
  if (!isLocalStorageAvailable()) {
    return false
  }
  
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.warn(`Failed to set ${key} to localStorage:`, error)
    return false
  }
}

// Safe localStorage remover
export const removeFromStorage = (key: string): boolean => {
  if (!isLocalStorageAvailable()) {
    return false
  }
  
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage:`, error)
    return false
  }
}

// Get saved language preference
export const getSavedLanguage = (): string | null => {
  return getFromStorage(STORAGE_KEYS.LANGUAGE)
}

// Save language preference
export const saveLanguage = (language: string): boolean => {
  return setToStorage(STORAGE_KEYS.LANGUAGE, language)
}

// Get saved mobile number
export const getSavedMobile = (): string | null => {
  return getFromStorage(STORAGE_KEYS.MOBILE)
}

// Save mobile number
export const saveMobile = (mobile: string): boolean => {
  return setToStorage(STORAGE_KEYS.MOBILE, mobile)
}

// Clear all saved data
export const clearAllSavedData = (): void => {
  removeFromStorage(STORAGE_KEYS.LANGUAGE)
  removeFromStorage(STORAGE_KEYS.MOBILE)
} 
