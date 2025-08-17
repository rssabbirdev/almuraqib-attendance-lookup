'use client'

import { useState, useEffect } from 'react'
import AttendanceForm from '@/components/AttendanceForm'
import AttendanceResults from '@/components/AttendanceResults'
import { AttendanceData } from '@/types/attendance'
import { getSavedLanguage, saveLanguage, saveMobile } from '@/lib/localStorage'

export default function Home() {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<'en' | 'bn' | 'hi' | 'ar'>('en')
  const [isInitialized, setIsInitialized] = useState(false)

  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    // Load saved language preference
    const savedLanguage = getSavedLanguage()
    if (savedLanguage && ['en', 'bn', 'hi', 'ar'].includes(savedLanguage)) {
      setLanguage(savedLanguage as 'en' | 'bn' | 'hi' | 'ar')
    }
    setIsInitialized(true)
  }, [])

  // Handle RTL for Arabic language
  useEffect(() => {
    if (language === 'ar') {
      document.body.style.direction = 'rtl'
      document.body.style.textAlign = 'right'
    } else {
      document.body.style.direction = 'ltr'
      document.body.style.textAlign = 'left'
    }
  }, [language])

  // Save language preference to localStorage whenever it changes (but not during initial load)
  useEffect(() => {
    if (isInitialized) {
      saveLanguage(language)
    }
  }, [language, isInitialized])

  const handleFetchAttendance = async (mobile: string, monthValue: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const [year, month] = monthValue.split('-')
      const startDate = `${year}-${month}-01`
      const endDate = new Date(parseInt(year), parseInt(month), 0)
        .toISOString()
        .split('T')[0]

      const ipAddress = await getIPAddress()
      const deviceDetails = getDeviceDetails()
      
      const url = `/api/proxy?mobile=${mobile}&startISO=${startDate}&endISO=${endDate}&deviceDetails=${deviceDetails}&ipAddress=${ipAddress}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      
      // Save mobile number to localStorage on successful data fetch
      saveMobile(mobile)
      
      setAttendanceData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 flex items-center justify-center min-h-screen">
      <div className="bg-white p-6 md:p-10 rounded-xl shadow-xl w-full max-w-4xl">
        <img 
          src="https://almuraqib.ae/wp-content/uploads/2022/05/al-muraqib-simple-text-based-logo-retina-1.png" 
          height="150" 
          width="150" 
          className="mb-5" 
          alt="Al Muraqib Logo"
        />
        
        <AttendanceForm 
          onFetchAttendance={handleFetchAttendance}
          loading={loading}
          error={error}
          language={language}
          onLanguageChange={setLanguage}
        />
        
        {attendanceData && (
          <AttendanceResults data={attendanceData} language={language} />
        )}
      </div>
    </div>
  )
}

// Utility functions
async function getIPAddress(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    if (!response.ok) {
      throw new Error('Failed to fetch IP address.')
    }
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('Error fetching IP address:', error)
    return null
  }
}

function getDeviceDetails(): string {
  const userAgent = navigator.userAgent

  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return 'Apple iPhone/iPad'
  }
  if (/Android/.test(userAgent)) {
    if (/Samsung/.test(userAgent)) {
      return 'Samsung Android'
    }
    if (/Google/.test(userAgent)) {
      return 'Google Android'
    }
    return 'Generic Android Mobile'
  }
  
  if (/Windows NT/.test(userAgent)) {
    return 'Windows Desktop'
  }
  if (/Macintosh|Mac OS X/.test(userAgent)) {
    return 'Apple Mac/Desktop'
  }
  if (/CrOS/.test(userAgent)) {
    return 'Chromebook'
  }

  return 'Unknown Device'
}
