"use client"

import { Video } from "lucide-react"

export default function UserGuidePopupPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Countdown Agenda Timer - User Guide</h1>
      </div>

      <div className="prose prose-lg max-w-none">
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-base leading-relaxed mb-4">
            The Countdown Agenda Timer is a powerful tool designed to help you manage meeting time effectively. It
            allows you to create structured agendas with time allocations for each item, track elapsed and remaining
            time, and receive visual and audio cues as you progress through your meeting.
          </p>
          <p className="text-base leading-relaxed mb-4">
            The timer includes an intelligent end meeting workflow that prompts users when the agenda is complete, with
            options to end immediately or continue with manual control.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Main Interface</h2>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Header Section</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-base">
                <strong>Logo and Title</strong>: Displays the meeting title which can be customized in settings
              </li>
              <li className="text-base">
                <strong>Total Time</strong>: Shows the total duration of all agenda items combined
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Current Item Display (When Running)</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-base">
                <strong>Current Item Title</strong>: Shows the title of the active agenda item
              </li>
              <li className="text-base">
                <strong>Time Remaining</strong>: Displays the time remaining for the current item
              </li>
              <li className="text-base">
                <strong>Progress Bar</strong>: Visual indicator of time elapsed for the current item
              </li>
              <li className="text-base">
                <strong>Next Item</strong>: Shows the next agenda item and its duration
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Agenda Items Table</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-base">
                <strong>Agenda Items</strong>: Lists all items in your agenda with their titles
              </li>
              <li className="text-base">
                <strong>Duration</strong>: Shows the allocated time for each item
              </li>
              <li className="text-base">
                <strong>Active Item Indicator</strong>: The current active item is highlighted and shows a pulsing dot
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Time Tracking</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-base">
                <strong>Elapsed</strong>: Shows the total time elapsed since the meeting started
              </li>
              <li className="text-base">
                <strong>Remaining</strong>: Shows the total time remaining for all agenda items
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Control Buttons</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-base">
                <strong>START</strong>: Begins the meeting timer with the first agenda item
              </li>
              <li className="text-base">
                <strong>PAUSE/RESUME</strong>: Pauses or resumes the current timer
              </li>
              <li className="text-base">
                <strong>Next Item</strong> (Skip forward icon): Advances to the next agenda item
              </li>
              <li className="text-base">
                <strong>Reset</strong> (Refresh icon): Resets the entire agenda timer
              </li>
            </ul>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-base">
                <strong>End Meeting</strong> (Red square icon): Appears after declining the automatic end meeting
                prompt. Manually triggers the meeting summary when clicked.
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Utility Buttons</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-base">
                <strong>Pop Out</strong> (External link icon): Opens a separate window with the timer
              </li>
              <li className="text-base">
                <strong>Settings</strong> (Gear icon): Opens the settings dialog
              </li>
              <li className="text-base">
                <strong>Templates</strong> (Document icon): Opens the template manager
              </li>
              <li className="text-base">
                <strong>Sound Toggle</strong> (Speaker icon): Enables or disables sound notifications
              </li>
              <li className="text-base">
                <strong>Help</strong> (Question mark icon): Opens a menu with help options
                <ul className="list-disc pl-6 mt-2">
                  <li>
                    <strong>User Guide</strong>: Opens this comprehensive guide
                  </li>
                  <li>
                    <strong>Video Walkthrough</strong>: Opens a video tutorial
                  </li>
                  <li>
                    <strong>End Meeting Control</strong>: Use the "No" option in the end meeting dialog if you need to
                    continue discussions beyond the planned agenda, then manually end when ready.
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">End Meeting Workflow</h2>
          <p className="text-base leading-relaxed mb-4">
            When the final agenda item (Conclude) is completed, the timer automatically presents an "End Meeting"
            confirmation dialog with the following options:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li className="text-base">
              <strong>Yes</strong>: Immediately ends the meeting and displays the meeting summary with time tracking
              data, email options, and export capabilities
            </li>
            <li className="text-base">
              <strong>No</strong>: Returns to the timer interface and displays a red "End Meeting" button for manual
              control
            </li>
          </ul>
          <p className="text-base leading-relaxed mb-4">
            If you select "No", you can continue using the timer and manually end the meeting at any time by clicking
            the red square "End Meeting" button that appears in the utility buttons area.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <p className="text-base leading-relaxed mb-4">
            The settings dialog allows you to customize various aspects of the agenda timer:
          </p>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3">General Tab</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-base">
                <strong>Meeting Title</strong>: Set the title that appears in the header
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3">Agenda Items Tab</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-base">
                <strong>Item Management</strong>: Add, remove, or edit agenda items
              </li>
              <li className="text-base">
                <strong>Time Allocation</strong>: Set the duration for each item in minutes
              </li>
              <li className="text-base">
                <strong>Color Coding</strong>: Assign colors to specific agenda items for visual distinction
              </li>
            </ul>
          </div>
        </section>

        <div className="mt-10 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-xl font-bold mb-3">Need More Help?</h2>
          <p className="text-base mb-3">
            Check out our video walkthrough for a detailed demonstration of all features:
          </p>
          <button
            onClick={() => {
              window.opener.open(
                "/video-walkthrough",
                "VideoWalkthrough",
                "width=640,height=360,resizable=yes,scrollbars=no,status=no,location=no",
              )
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Video className="h-4 w-4 mr-2" />
            Watch Video Walkthrough
          </button>
        </div>
      </div>
    </div>
  )
}
