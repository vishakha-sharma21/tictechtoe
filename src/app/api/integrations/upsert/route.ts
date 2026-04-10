import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch('http://127.0.0.1:8001/integrations/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error upserting integration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
