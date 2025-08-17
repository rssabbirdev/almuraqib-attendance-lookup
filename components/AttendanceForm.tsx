'use client'

import { useState, useEffect } from 'react'
import { translations } from '@/lib/translations'
import { Language } from '@/types/attendance'

interface AttendanceFormProps {
  onFetchAttendance: (mobile: string, monthValue: string) => void
  loading: boolean
  error: string | null
  language: 'en' | 'bn' | 'hi' | 'ar'
  onLanguageChange: (language: 'en' | 'bn' | 'hi' | 'ar') => void
}

export default function AttendanceForm({ onFetchAttendance, loading, error, language, onLanguageChange }: AttendanceFormProps) {
  const [mobile, setMobile] = useState('')
  const [monthValue, setMonthValue] = useState('')

  useEffect(() => {
    populateMonthDropdown()
  }, [language])

  const populateMonthDropdown = () => {
    const now = new Date()
    const monthNames = {
      en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      bn: ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"],
      hi: ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
      ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    }

    const options = []
    for (let i = 0; i < 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const formattedMonth = month < 10 ? `0${month}` : month
      const value = `${year}-${formattedMonth}`
      const text = `${monthNames[language][date.getMonth()]} ${year}`
      
      options.push({ value, text, selected: i === 0 })
    }

    // Set the first month as default if no month is selected
    if (!monthValue && options.length > 0) {
      setMonthValue(options[0].value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!mobile || mobile.length !== 10 || !mobile.startsWith('0')) {
      return
    }
    
    onFetchAttendance(mobile, monthValue)
  }

  const translatePage = (lang: Language) => {
    onLanguageChange(lang)
  }

  const t = (key: string) => translations[language][key] || key

  return (
    <>
      <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
        {t('app-title')}
      </h2>

      {/* Language Dropdown */}
      <div className="flex justify-end mb-4">
        <select 
          value={language}
          onChange={(e) => translatePage(e.target.value as Language)}
          className="w-auto px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="en">English</option>
          <option value="bn">বাংলা (Bangla)</option>
          <option value="hi">हिंदी (Hindi)</option>
          <option value="ar">العربية (Arabic)</option>
        </select>
      </div>

      {/* Collapsible Instructions Section */}
      <details className="mb-6 bg-gray-50 rounded-lg p-4 cursor-pointer shadow-sm" open>
        <summary className="text-lg font-bold text-gray-700 flex justify-between items-center">
          <span>{t('instructions')}</span>
          <i className="fa-solid fa-chevron-down text-gray-500 text-sm transform transition-transform duration-200"></i>
        </summary>
        <div className="mt-4 text-gray-600 space-y-2 text-sm">
          <p>{t('instruction-1')}</p>
          <p>{t('instruction-2')}</p>
          <p>{t('instruction-3')}</p>
          <p>{t('instruction-4')}</p>
        </div>
      </details>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="col-span-full md:col-span-2">
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
            {t('mobile-label')}
          </label>
          <input 
            id="mobile" 
            type="tel" 
            inputMode="numeric"
            placeholder={t('mobile-placeholder')}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="col-span-full md:col-span-2">
          <label htmlFor="monthSelect" className="block text-sm font-medium text-gray-700 mb-1">
            {t('month-label')}
          </label>
          <select 
            id="monthSelect"
            value={monthValue}
            onChange={(e) => setMonthValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {(() => {
              const now = new Date()
              const monthNames = {
                en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                bn: ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"],
                hi: ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
                ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
              }

              const options = []
              for (let i = 0; i < 3; i++) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const year = date.getFullYear()
                const month = date.getMonth() + 1
                const formattedMonth = month < 10 ? `0${month}` : month
                const value = `${year}-${formattedMonth}`
                const text = `${monthNames[language][date.getMonth()]} ${year}`
                
                options.push({ value, text })
              }
              
              return options.map((option, index) => (
                <option key={option.value} value={option.value}>
                  {option.text}
                </option>
              ))
            })()}
          </select>
        </div>
        
        <div className="col-span-full flex items-end">
          <button 
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('loading')}
              </span>
            ) : (
              t('get-data')
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="text-center text-red-600 font-medium my-4">
          {error}
        </div>
      )}
    </>
  )
}
