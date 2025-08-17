export interface AttendanceData {
  workerId: string
  workerName: string
  summary: {
    totalHours: string
    totalOvertime: string
    absent: number
    sunday: number
    warning: number
  }
  rows: Array<Array<string | null>>
}

export interface SummaryItem {
  label: string
  value: string | number
  bgColor?: string
}

export type Language = 'en' | 'bn' | 'hi' | 'ar'

export interface Translations {
  [key: string]: {
    [key: string]: string
  }
}
