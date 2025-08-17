import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mobile = searchParams.get('mobile')
  const startISO = searchParams.get('startISO')
  const endISO = searchParams.get('endISO')
  const ipAddress = searchParams.get('ipAddress')
  const deviceDetails = searchParams.get('deviceDetails')

  if (!mobile || !startISO || !endISO) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  const scriptID = 'AKfycbx_XTWnCkdoay0HA_Kr7GTQGVInCLsRR467Z6kvz2R9pCYZyX5x1Z_JJl2tP323joCD'
  
  const url = `https://script.google.com/macros/s/${scriptID}/exec?action=getAttendanceDataByMobile&mobile=${mobile}&startISO=${startISO}&endISO=${endISO}&deviceDetails=${deviceDetails}&ipAddress=${ipAddress}`

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from external service' },
      { status: 500 }
    )
  }
}
