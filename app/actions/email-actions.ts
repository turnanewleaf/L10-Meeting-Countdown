"use server"

// This file is no longer needed as we're using EmailJS directly from the client
// We'll keep it empty to avoid breaking imports

export async function sendMeetingSummaryEmail() {
  // This function is no longer used
  return {
    success: false,
    error: "This server action is deprecated. Using EmailJS directly from client.",
  }
}
