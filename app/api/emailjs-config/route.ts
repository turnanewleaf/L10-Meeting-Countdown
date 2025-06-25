/*  GET /api/emailjs-config
    Returns public, non-secret EmailJS information so the browser can call
    EmailJS directly. If any variable is missing or left as the default
    placeholder supplied by EmailJS, we respond with HTTP 400 and a JSON
    payload that explains what’s wrong. */

import { NextResponse } from "next/server"

export async function GET() {
  // 1 — read env vars (secure first, then NEXT_PUBLIC_* for dev/preview).
  let service_id = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  let template_id = process.env.EMAILJS_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  let user_id = process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  // trim any accidental spaces
  service_id = service_id?.trim()
  template_id = template_id?.trim()
  user_id = user_id?.trim()

  // 2 — reject if they’re still the default placeholders
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
          "in your Vercel project settings (or NEXT_PUBLIC_* while testing).",
      },
      { status: 400 },
    )
  }

  // 3 — success: return only the **public** keys
  return NextResponse.json({ service_id, template_id, user_id })
}
