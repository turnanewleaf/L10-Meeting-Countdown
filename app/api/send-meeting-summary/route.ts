import { NextResponse } from "next/server"
import emailjs from "@emailjs/nodejs"

export const runtime = "nodejs" // ⚙️ force Node runtime so https.request works

/* POST /api/send-meeting-summary
   Body: { meetingTitle: string, meetingDate: string, meetingSummary: string }
*/
export async function POST(req: Request) {
  try {
    const { meetingTitle, meetingDate, meetingSummary } = await req.json()

    // REQUIRED env-vars (public key may be exposed, private must stay secret)
    const SERVICE_ID = process.env.EMAILJS_SERVICE_ID
    const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID
    const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY // “user_xxx”
    const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY // “XXXXXXXXXXXX”

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || !PRIVATE_KEY) {
      return NextResponse.json({ error: "Missing EmailJS environment variables" }, { status: 500 })
    }

    // Send via EmailJS server SDK  (no browser/origin checks)
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: "bbeckstead@turnanewleaf.org",
        meeting_title: meetingTitle,
        meeting_date: meetingDate,
        meeting_summary: meetingSummary,
      },
      {
        publicKey: PUBLIC_KEY, // required by SDK
        privateKey: PRIVATE_KEY, // proves server origin
      },
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("EmailJS send error:", err)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
