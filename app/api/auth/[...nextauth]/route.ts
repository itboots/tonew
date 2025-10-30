import { NextRequest, NextResponse } from "next/server"

// Mock auth handler for demonstration
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Auth endpoint - mock for demo" })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Auth endpoint - mock for demo" })
}