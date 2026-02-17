import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sheet = searchParams.get("sheet") || "Actual Production"

    const APPS_SCRIPT_URL =
      process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ||
      "https://script.google.com/macros/s/AKfycbzquSfYbb-liFy7HkklL3t_xrSfZJxOTs_9iLglo4S2RJBXPSoMtkM3yJtA3hBfA9SH5w/exec"

    if (!APPS_SCRIPT_URL) {
      return NextResponse.json({ success: false, error: "Apps Script URL not configured" }, { status: 400 })
    }

    const response = await fetch(`${APPS_SCRIPT_URL}?action=getData&sheet=${encodeURIComponent(sheet)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching from Apps Script:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 })
  }
}
