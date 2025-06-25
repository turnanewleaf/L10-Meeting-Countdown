import { NextResponse } from "next/server"

export async function GET() {
  // Debug: Log all environment variables that start with EMAILJS or NEXT_PUBLIC_EMAILJS
  console.log("=== EmailJS Environment Variables Debug ===")
  console.log("EMAILJS_SERVICE_ID:", process.env.EMAILJS_SERVICE_ID)
  console.log("EMAILJS_TEMPLATE_ID:", process.env.EMAILJS_TEMPLATE_ID)
  console.log("EMAILJS_PUBLIC_KEY:", process.env.EMAILJS_PUBLIC_KEY)
  console.log("NEXT_PUBLIC_EMAILJS_SERVICE_ID:", process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID)
  console.log("NEXT_PUBLIC_EMAILJS_TEMPLATE_ID:", process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID)
  console.log("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY:", process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)
  console.log("=== End Debug ===")

  // 1 — read env vars (secure first, then NEXT_PUBLIC_* for dev/preview).
  const service_id = process.env.EMAILJS_SERVICE_ID?.trim()
  const template_id = process.env.EMAILJS_TEMPLATE_ID?.trim()
  const user_id = process.env.EMAILJS_PUBLIC_KEY?.trim()

  console.log("Final values after processing:")
  console.log("service_id:", service_id)
  console.log("template_id:", template_id)
  console.log("user_id:", user_id)

  // 2 — reject if they're still the default placeholders or missing
  const placeholders = new Set(["YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", "YOUR_PUBLIC_KEY"])
  if (
    !service_id ||
    !template_id ||
    !user_id ||
    placeholders.has(service_id) ||
    placeholders.has(template_id) ||
    placeholders.has(user_id)
  ) {
    return NextResponse.json(
      {
        error:
          "EmailJS is not configured. " +
          "Set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID and EMAILJS_PUBLIC_KEY " +
          "in your Vercel project settings (or in .env.local while testing).",
        debug: {
          service_id: service_id || "MISSING",
          template_id: template_id || "MISSING",
          user_id: user_id || "MISSING",
        },
      },
      { status: 400 },
    )
  }

  // 3 — success: return only the **public** keys
  return NextResponse.json({ service_id, template_id, user_id })
}
