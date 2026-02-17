import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const APPS_SCRIPT_URL =
      process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ||
      "https://script.google.com/macros/s/AKfycbzquSfYbb-liFy7HkklL3t_xrSfZJxOTs_9iLglo4S2RJBXPSoMtkM3yJtA3hBfA9SH5w/exec"

    if (!APPS_SCRIPT_URL) {
      return NextResponse.json({ success: false, error: "Apps Script URL not configured" }, { status: 400 })
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "saveRecord",
        sheetName: body.sheetName || "Actual Production",
        rowIndex: body.rowIndex,
        timestamp: body.timestamp,
        // Don't send full data - only timestamp will be saved to Actual1 column
      }),
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error saving record:", error)
    return NextResponse.json({ success: false, error: "Failed to save record" }, { status: 500 })
  }
}
