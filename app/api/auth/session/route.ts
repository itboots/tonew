import { NextRequest, NextResponse } from "next/server"

// 简化的session API
export async function GET() {
  return NextResponse.json({
    user: {
      id: "demo-user",
      email: "demo@cyberpunk.com",
      name: "Cyberpunk User",
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  })
}

export async function POST() {
  return NextResponse.json({
    user: {
      id: "demo-user",
      email: "demo@cyberpunk.com",
      name: "Cyberpunk User",
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  })
}