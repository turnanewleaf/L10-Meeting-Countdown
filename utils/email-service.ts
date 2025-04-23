"use client"

import { sendMeetingSummaryEmail as serverSendEmail } from "@/app/actions/email-actions"

// Interface for email options
interface EmailOptions {
  to: string
  subject: string
  summaryText: string
  meetingTitle: string
  meetingDate: string
}

// Client-side wrapper for the server action
export async function sendMeetingSummaryEmail(options: EmailOptions) {
  try {
    // Call the server action to send the email
    return await serverSendEmail(options)
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// No need for initialization since all email operations happen on the server
export const initEmailJS = async () => {
  // Return true to indicate that the email service is available
  // The actual email sending happens on the server
  return true
}
