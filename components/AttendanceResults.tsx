'use client'

import { useState, useEffect } from 'react'
import { AttendanceData, SummaryItem } from '@/types/attendance'
import { translations } from '@/lib/translations'
import { getCachedTranslation } from '@/lib/translate'

interface AttendanceResultsProps {
  data: AttendanceData
  language: 'en' | 'bn' | 'hi' | 'ar'
}

export default function AttendanceResults({ data, language }: AttendanceResultsProps) {
  const [currentView, setCurrentView] = useState<'grid' | 'table'>('grid')
  const [translatedRemarks, setTranslatedRemarks] = useState<Map<string, string>>(new Map())
  const [isTranslating, setIsTranslating] = useState(false)

  const t = (key: string) => translations[language][key] || key

  const toggleView = () => {
    setCurrentView(currentView === 'table' ? 'grid' : 'table')
  }

  const updateViewDisplay = () => {
    // This function is handled by the state change above
  }

  // Function to translate remarks
  const translateRemarks = async (remarks: string | null): Promise<string> => {
    if (!remarks || language === 'en') {
      return remarks || '—'
    }

    // Check if we already have a translation
    const cacheKey = `${remarks}:${language}`
    if (translatedRemarks.has(cacheKey)) {
      return translatedRemarks.get(cacheKey)!
    }

    try {
      const translatedText = await getCachedTranslation(remarks, language)
      
      // Cache the translation
      setTranslatedRemarks(prev => new Map(prev.set(cacheKey, translatedText)))
      
      return translatedText
    } catch (error) {
      console.error('Translation error:', error)
      return remarks
    }
  }

  // Effect to translate remarks when language changes
  useEffect(() => {
    if (data.rows && data.rows.length > 0 && language !== 'en') {
      setIsTranslating(true)
      
      const translateAllRemarks = async () => {
        const newTranslations = new Map<string, string>()
        
        for (const row of data.rows) {
          const remarks = row[10]
          if (remarks && typeof remarks === 'string') {
            const translated = await translateRemarks(remarks)
            const cacheKey = `${remarks}:${language}`
            newTranslations.set(cacheKey, translated)
          }
        }
        
        setTranslatedRemarks(newTranslations)
        setIsTranslating(false)
      }
      
      translateAllRemarks()
    } else {
      setTranslatedRemarks(new Map())
      setIsTranslating(false)
    }
  }, [data.rows, language])

  // Calculate working days (days with both duty in and duty out)
  const calculateWorkingDays = () => {
    if (!data.rows || data.rows.length === 0) return 0
    
    let workingDays = 0
    for (const row of data.rows) {
      // Check if both duty in (index 2) and duty out (index 5) have values
      const dutyIn = row[2]
      const dutyOut = row[5]
      
      if (dutyIn && dutyOut && dutyIn !== '' && dutyOut !== '') {
        workingDays++
      }
    }
    return workingDays
  }

  // Calculate total days in the month
  const calculateTotalDays = () => {
    if (!data.rows || data.rows.length === 0) return 0
    return data.rows.length
  }

  // Calculate final hours after warning deductions
  const calculateFinalHours = () => {
    const totalHours = parseFloat(data.summary.totalHours) || 0
    const warningDeduction = data.summary.warning || 0
    return Math.max(0, totalHours - warningDeduction).toFixed(2)
  }

  const workingDays = calculateWorkingDays()
  const totalDays = calculateTotalDays()
  const workingDaysPercentage = totalDays > 0 ? Math.round((workingDays / totalDays) * 100) : 0
  const finalHours = calculateFinalHours()

  // Helper function to replace placeholders in translation strings
  const formatSummaryText = (key: string, replacements: Record<string, string | number>) => {
    let text = t(key)
    Object.entries(replacements).forEach(([placeholder, value]) => {
      text = text.replace(`{${placeholder}}`, String(value))
    })
    return text
  }

  const summaryItems: SummaryItem[] = [
    { label: t('summary-total-hours'), value: data.summary.totalHours },
    { label: t('summary-total-overtime'), value: data.summary.totalOvertime },
    { label: t('summary-working-days'), value: `${workingDays}/${totalDays} (${workingDaysPercentage}%)`, bgColor: 'bg-green-100' },
    { label: t('summary-absent'), value: data.summary.absent, bgColor: 'bg-red-100' },
    { label: t('summary-sunday'), value: data.summary.sunday, bgColor: 'bg-blue-100' },
    { label: t('summary-warning'), value: data.summary.warning, bgColor: 'bg-yellow-100' }
  ]

  const getRowClass = (remarks: string | null) => {
    const remarksLower = String(remarks || '').toLowerCase()
    if (remarksLower.includes('absent')) {
      return 'bg-red-100 hover:bg-red-200'
    } else if (remarksLower.includes('warning')) {
      return 'bg-yellow-100 hover:bg-yellow-200'
    } else if (remarksLower.includes('sunday')) {
      return 'bg-blue-100 hover:bg-blue-200'
    }
    return 'hover:bg-gray-100'
  }

  const getCardClass = (remarks: string | null) => {
    const remarksLower = String(remarks || '').toLowerCase()
    if (remarksLower.includes('absent')) {
      return 'bg-red-100'
    } else if (remarksLower.includes('warning')) {
      return 'bg-yellow-100'
    } else if (remarksLower.includes('sunday')) {
      return 'bg-blue-100'
    }
    return 'bg-white'
  }

  // Function to format time duration consistently
  const formatTimeDuration = (timeStr: string | null): string => {
    if (!timeStr) return '—'
    
    try {
      // Handle different time formats
      if (typeof timeStr === 'string') {
        // Check if it's already in "Xh Ym" format
        if (timeStr.includes('hr') || timeStr.includes('min')) {
          return timeStr
        }
        
        // Check if it's in decimal format (e.g., "8.5" hours)
        const decimalHours = parseFloat(timeStr)
        if (!isNaN(decimalHours)) {
          const hours = Math.floor(decimalHours)
          const minutes = Math.round((decimalHours - hours) * 60)
          
          if (hours === 0) {
            return `${minutes} min`
          } else if (minutes === 0) {
            return `${hours} hr`
          } else {
            return `${hours} hr ${minutes} min`
          }
        }
        
        // Check if it's in "HH:MM" format
        if (timeStr.includes(':')) {
          const parts = timeStr.split(':')
          if (parts.length >= 2) {
            const hours = parseInt(parts[0], 10)
            const minutes = parseInt(parts[1], 10)
            
            if (!isNaN(hours) && !isNaN(minutes)) {
              if (hours === 0) {
                return `${minutes} min`
              } else if (minutes === 0) {
                return `${hours} hr`
              } else {
                return `${hours} hr ${minutes}min`
              }
            }
          }
        }
      }
      
      // If none of the above formats work, return as is
      return timeStr
    } catch (error) {
      return timeStr || '—'
    }
  }

  // Function to calculate break duration
  const calculateBreakDuration = (breakOut: string | null, breakIn: string | null): string => {
    if (!breakOut || !breakIn) {
      return '—'
    }
    
    // Check if values are actually time-like strings
    if (typeof breakOut !== 'string' || typeof breakIn !== 'string') {
      return '—'
    }
    
    try {
      // Parse 12-hour time format like "11:00 AM" or "4:00 PM"
      const parseTime = (timeStr: string) => {
        if (!timeStr || typeof timeStr !== 'string') return 0
        
        // Remove any extra spaces and convert to uppercase
        const cleanTime = timeStr.trim().toUpperCase()
        
        // Split by space to separate time and AM/PM
        const parts = cleanTime.split(' ')
        if (parts.length !== 2) return 0
        
        const timePart = parts[0]
        const period = parts[1]
        
        // Split time by colon
        const timeComponents = timePart.split(':')
        if (timeComponents.length < 2) return 0
        
        let hours = parseInt(timeComponents[0], 10)
        const minutes = parseInt(timeComponents[1], 10)
        
        if (isNaN(hours) || isNaN(minutes)) return 0
        
        // Convert 12-hour to 24-hour format
        if (period === 'PM' && hours !== 12) {
          hours += 12
        } else if (period === 'AM' && hours === 12) {
          hours = 0
        }
        
        return hours * 60 + minutes
      }
      
      const breakOutMinutes = parseTime(breakOut)
      const breakInMinutes = parseTime(breakIn)
      
      // Check if parsing was successful
      if (breakOutMinutes === 0 || breakInMinutes === 0) {
        return '—'
      }
      
      if (breakOutMinutes >= breakInMinutes) {
        // Break spans midnight or invalid data
        return '—'
      }
      
      const durationMinutes = breakInMinutes - breakOutMinutes
      
      // Ensure we have valid numbers
      if (isNaN(durationMinutes) || durationMinutes < 0) {
        return '—'
      }
      
      const hours = Math.floor(durationMinutes / 60)
      const minutes = Math.round(durationMinutes % 60)
      
      if (hours === 0) {
        return `${minutes} min`
      } else if (minutes === 0) {
        return `${hours} hr`
      } else {
        return `${hours} hr ${minutes} min`
      }
      
    } catch (error) {
      return '—'
    }
  }

  return (
		<div className='mt-8 fade-in'>
			{/* Summary Cards */}
			<div className='summary flex flex-wrap gap-4 mb-6'>
				{summaryItems.map((item, index) => (
					<div
						key={index}
						className={`flex-1 min-w-[120px] p-4 rounded-lg border border-gray-200 ${
							item.bgColor || ''
						} text-center shadow-sm`}
					>
						<div className='text-sm text-gray-500'>
							{item.label}
						</div>
						<div className='font-bold text-lg text-gray-800 mt-2'>
							{item.value}
						</div>
					</div>
				))}
			</div>

			{/* Detailed Summary */}
			<div className='bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6'>
				<div className='space-y-3 text-gray-700'>
					<div className='text-lg font-semibold text-gray-800'>
						{formatSummaryText('summary-overview', { name: data.workerName || 'Employee' })}
					</div>
					<div>
						{formatSummaryText('summary-total-worked', { 
							hours: data.summary.totalHours, 
							overtime: data.summary.totalOvertime 
						})}
					</div>
					<div>
						{formatSummaryText('summary-attendance-rate', { 
							working: workingDays, 
							total: totalDays, 
							percentage: workingDaysPercentage,
							absent: data.summary.absent
						})}
					</div>
					<div>
						{formatSummaryText('summary-warnings', { 
							warnings: data.summary.warning,
							plural: data.summary.warning === 1 ? '' : 's'
						})}
					</div>
					<div>
						{formatSummaryText('summary-deduction', { 
							final: finalHours 
						})}
					</div>
				</div>
			</div>

			{/* Employee Info and View Toggle */}
			<div className='flex justify-between items-center mb-4'>
				<div className='text-sm text-gray-500'>
					<span>{t('employee-id-prefix')}</span>{' '}
					<span className='font-semibold text-gray-700'>
						{data.workerId || '—'}
					</span>
					<br />
					<span>{t('employee-name-prefix')}</span>{' '}
					<span className='font-semibold text-gray-700'>
						{data.workerName || '—'}
					</span>
				</div>

				{/* View toggle button */}
				<button
					onClick={toggleView}
					className='p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors'
				>
					{currentView === 'table' ? (
						<i className='fa-solid fa-grip fa-lg'></i>
					) : (
						<i className='fa-solid fa-table fa-lg'></i>
					)}
				</button>
			</div>

			{/* Results Display */}
			{data.rows && data.rows.length > 0 ? (
				<>
					{/* Table View */}
					<div
						className={`overflow-x-auto ${
							currentView === 'table' ? '' : 'hidden'
						}`}
					>
						<table className='min-w-full divide-y divide-gray-200 shadow-sm rounded-lg'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										{t('col-date')}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										{t('col-work-location')}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										{t('col-duty-in')}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										{t('col-break-out')}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										{t('col-break-in')}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										{t('col-duty-out')}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										{t('col-total-hour')}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										{t('col-total-break')}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										{t('col-basic-hour')}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										{t('col-overtime')}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										{t('col-less-basic')}
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										{t('col-remarks')}
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{data.rows.map((row, rowIndex) => (
									<tr
										key={rowIndex}
										className={`${getRowClass(
											row[10]
										)} transition-colors`}
									>
										{/* Date */}
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{row[0] || '—'}
										</td>
										{/* Work Location */}
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{row[1] || '—'}
										</td>
										{/* Duty In */}
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{row[2] || '—'}
										</td>
										{/* Break Out */}
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{row[3] || '—'}
										</td>
										{/* Break In */}
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{row[4] || '—'}
										</td>
										{/* Duty Out */}
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{row[5] || '—'}
										</td>
										{/* Total Hour */}
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{formatTimeDuration(row[6])}
										</td>
										{/* Total Break - Calculated */}
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{calculateBreakDuration(
												row[3],
												row[4]
											)}
										</td>
										{/* Basic Hour */}
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{formatTimeDuration(row[7])}
										</td>
										{/* Overtime */}
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{formatTimeDuration(row[8])}
										</td>
										{/* Less Basic */}
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{formatTimeDuration(row[9])}
										</td>
										{/* Remarks */}
										{/* <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{isTranslating ? (
												<span className='text-gray-400 italic'>
													Translating...
												</span>
											) : (
												translatedRemarks.get(
													`${row[10]}:${language}`
												) ||
												row[10] ||
												'—'
											)}
										</td> */}
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{row[10] || '—'}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Card View */}
					<div
						className={`grid grid-cols-1 gap-4 ${
							currentView === 'grid' ? '' : 'hidden'
						}`}
					>
						{data.rows.map((row, rowIndex) => (
							<div
								key={rowIndex}
								className={`p-4 rounded-lg border border-gray-200 shadow-sm ${getCardClass(
									row[10]
								)}`}
							>
								<div className='flex justify-between items-center mb-2'>
									<span className='text-lg font-bold text-gray-800'>
										{row[0] || '—'}
									</span>
									<span className='text-sm text-gray-600'>
										{row[1]
											? row[1].length > 15
												? row[1].slice(0, 15) + '…'
												: row[1]
											: '—'}
									</span>
								</div>
								<div className='grid grid-cols-2 gap-2 text-sm text-gray-700'>
									<div>
										<span className='font-semibold'>
											{t('card-duty-in')}
										</span>{' '}
										{row[2] || '—'}
									</div>
									<div>
										<span className='font-semibold'>
											{t('card-duty-out')}
										</span>{' '}
										{row[5] || '—'}
									</div>
									<div>
										<span className='font-semibold'>
											{t('card-break-out')}
										</span>{' '}
										{row[3] || '—'}
									</div>
									<div>
										<span className='font-semibold'>
											{t('card-break-in')}
										</span>{' '}
										{row[4] || '—'}
									</div>
									<div>
										<span className='font-semibold'>
											{t('card-total-hour')}
										</span>{' '}
										{formatTimeDuration(row[6])}
									</div>
									<div>
										<span className='font-semibold'>
											{t('card-total-break')}
										</span>{' '}
										{calculateBreakDuration(row[3], row[4])}
									</div>
									<div>
										<span className='font-semibold'>
											{t('card-overtime')}
										</span>{' '}
										{formatTimeDuration(row[8])}
									</div>
									<div>
										<span className='font-semibold'>
											{t('card-less-basic')}
										</span>{' '}
										{formatTimeDuration(row[9])}
									</div>
									{/* <div className='col-span-2 text-gray-500 italic'>
										{isTranslating ? (
											<span className='text-gray-400 italic'>
												Translating...
											</span>
										) : (
											translatedRemarks.get(
												`${row[10]}:${language}`
											) ||
											row[10] ||
											'—'
										)}
									</div> */}
									<div className='col-span-2 text-gray-500 italic'>
											{row[10] || '—'}
									</div>
								</div>
							</div>
						))}
					</div>
				</>
			) : (
				<div className='mt-4 text-center text-gray-500'>
					{t('no-data-found')}
				</div>
			)}
		</div>
  );
}
