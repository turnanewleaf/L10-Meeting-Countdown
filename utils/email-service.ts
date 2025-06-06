"use client"

import emailjs from "@emailjs/browser"

// Initialize EmailJS with the public key
export const initEmailJS = async () => {
  try {
    emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "")
    return true
  } catch (error) {
    console.error("Error initializing EmailJS:", error)
    return false
  }
}

// Interface for email options
interface EmailOptions {
  to: string
  subject: string
  summaryText: string
  meetingTitle: string
  meetingDate: string
}

// Send email using EmailJS
export async function sendMeetingSummaryEmail({ to, subject, summaryText, meetingTitle, meetingDate }: EmailOptions) {
  try {
    const templateParams = {
      to_email: to,
      subject: subject,
      meeting_title: meetingTitle,
      meeting_date: meetingDate,
      summary_text: summaryText,
    }

    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
      templateParams,
    )

    console.log("Email sent successfully:", response.status, response.text)

    return {
      success: true,
      message: "Email sent successfully",
    }
  } catch (error: any) {
    console.error("Error sending email:", error)

    // Check for the specific Outlook invalid grant error
    if (error?.text?.includes("Invalid grant") || error?.text?.includes("reconnect your Outlook account")) {
      return {
        success: false,
        error:
          "The email service needs to be reconnected. Please contact the administrator to reconnect the Outlook account in EmailJS.",
        technicalDetails: error?.text || "Unknown error",
      }
    }

    return {
      success: false,
      error: error?.text || (error instanceof Error ? error.message : "Unknown error occurred"),
      technicalDetails: JSON.stringify(error),
    }
  }
}
