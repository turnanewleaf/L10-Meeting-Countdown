import Link from "next/link"
import Image from "next/image"
import { Video } from "lucide-react"

export default function UserGuidePage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-10 flex justify-between items-center">
        <h1 className="text-4xl font-bold">Countdown Agenda Timer - User Guide</h1>
        <Link href="/" className="text-blue-600 hover:underline text-lg">
          Back to App
        </Link>
      </div>

      <div className="prose prose-lg max-w-none">
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Overview</h2>
          <p className="text-lg leading-relaxed mb-6">
            The Countdown Agenda Timer is a powerful tool designed to help you manage meeting time effectively. It
            allows you to create structured agendas with time allocations for each item, track elapsed and remaining
            time, and receive visual and audio cues as you progress through your meeting.
          </p>
          <div className="my-8 border rounded-lg overflow-hidden shadow-md">
            <Image
              src="/placeholder.svg?height=300&width=600&text=Main+Interface"
              alt="Countdown Agenda Timer Overview"
              width={600}
              height={300}
              className="w-full"
            />
            <div className="p-4 bg-gray-50 text-sm text-center">The main interface of the Countdown Agenda Timer</div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Main Interface</h2>

          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4">Header Section</h3>
            <div className="my-6 border rounded-lg overflow-hidden shadow-md">
              <Image
                src="/placeholder.svg?height=100&width=600&text=Header+Section"
                alt="Header Section"
                width={600}
                height={100}
                className="w-full"
              />
              <div className="p-4 bg-gray-50 text-sm text-center">
                The header section showing the logo, title, and total time
              </div>
            </div>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">
                <strong>Logo and Title</strong>: Displays the meeting title which can be customized in settings
              </li>
              <li className="text-lg">
                <strong>Total Time</strong>: Shows the total duration of all agenda items combined
              </li>
            </ul>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4">Current Item Display (When Running)</h3>
            <div className="my-6 border rounded-lg overflow-hidden shadow-md">
              <Image
                src="/placeholder.svg?height=150&width=600&text=Current+Item+Display"
                alt="Current Item Display"
                width={600}
                height={150}
                className="w-full"
              />
              <div className="p-4 bg-gray-50 text-sm text-center">
                The current item display showing active agenda item and progress
              </div>
            </div>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">
                <strong>Current Item Title</strong>: Shows the title of the active agenda item
              </li>
              <li className="text-lg">
                <strong>Time Remaining</strong>: Displays the time remaining for the current item
              </li>
              <li className="text-lg">
                <strong>Progress Bar</strong>: Visual indicator of time elapsed for the current item
              </li>
              <li className="text-lg">
                <strong>Next Item</strong>: Shows the next agenda item and its duration
              </li>
            </ul>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4">Agenda Items Table</h3>
            <div className="my-6 border rounded-lg overflow-hidden shadow-md">
              <Image
                src="/placeholder.svg?height=200&width=600&text=Agenda+Items+Table"
                alt="Agenda Items Table"
                width={600}
                height={200}
                className="w-full"
              />
              <div className="p-4 bg-gray-50 text-sm text-center">
                The agenda items table showing all items and their durations
              </div>
            </div>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">
                <strong>Agenda Items</strong>: Lists all items in your agenda with their titles
              </li>
              <li className="text-lg">
                <strong>Duration</strong>: Shows the allocated time for each item
              </li>
              <li className="text-lg">
                <strong>Active Item Indicator</strong>: The current active item is highlighted and shows a pulsing dot
              </li>
            </ul>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4">Time Tracking</h3>
            <div className="my-6 border rounded-lg overflow-hidden shadow-md">
              <Image
                src="/placeholder.svg?height=100&width=600&text=Time+Tracking"
                alt="Time Tracking"
                width={600}
                height={100}
                className="w-full"
              />
              <div className="p-4 bg-gray-50 text-sm text-center">The elapsed and remaining time displays</div>
            </div>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">
                <strong>Elapsed</strong>: Shows the total time elapsed since the meeting started
              </li>
              <li className="text-lg">
                <strong>Remaining</strong>: Shows the total time remaining for all agenda items
              </li>
            </ul>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4">Control Buttons</h3>
            <div className="my-6 border rounded-lg overflow-hidden shadow-md">
              <Image
                src="/placeholder.svg?height=100&width=600&text=Control+Buttons"
                alt="Control Buttons"
                width={600}
                height={100}
                className="w-full"
              />
              <div className="p-4 bg-gray-50 text-sm text-center">The main control buttons for managing the timer</div>
            </div>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">
                <strong>START</strong>: Begins the meeting timer with the first agenda item
              </li>
              <li className="text-lg">
                <strong>PAUSE/RESUME</strong>: Pauses or resumes the current timer
              </li>
              <li className="text-lg">
                <strong>Next Item</strong> (Skip forward icon): Advances to the next agenda item
              </li>
              <li className="text-lg">
                <strong>Reset</strong> (Refresh icon): Resets the entire agenda timer
              </li>
            </ul>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4">Utility Buttons</h3>
            <div className="my-6 border rounded-lg overflow-hidden shadow-md">
              <Image
                src="/placeholder.svg?height=100&width=600&text=Utility+Buttons"
                alt="Utility Buttons"
                width={600}
                height={100}
                className="w-full"
              />
              <div className="p-4 bg-gray-50 text-sm text-center">The utility buttons for additional features</div>
            </div>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">
                <strong>Pop Out</strong> (External link icon): Opens a separate window with the timer
              </li>
              <li className="text-lg">
                <strong>Settings</strong> (Gear icon): Opens the settings dialog
              </li>
              <li className="text-lg">
                <strong>Templates</strong> (Document icon): Opens the template manager
              </li>
              <li className="text-lg">
                <strong>Sound Toggle</strong> (Speaker icon): Enables or disables sound notifications
              </li>
              <li className="text-lg">
                <strong>Help</strong> (Question mark icon): Opens a menu with help options
                <ul className="list-disc pl-6 mt-2">
                  <li>
                    <strong>User Guide</strong>: Opens this comprehensive guide
                  </li>
                  <li>
                    <strong>Video Walkthrough</strong>: Opens a video tutorial
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Settings</h2>
          <p className="text-lg leading-relaxed mb-6">
            The settings dialog allows you to customize various aspects of the agenda timer:
          </p>
          <div className="my-6 border rounded-lg overflow-hidden shadow-md">
            <Image
              src="/placeholder.svg?height=400&width=600&text=Settings+Dialog"
              alt="Settings Dialog"
              width={600}
              height={400}
              className="w-full"
            />
            <div className="p-4 bg-gray-50 text-sm text-center">
              The settings dialog with multiple tabs for customization
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-4">General Tab</h3>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">
                <strong>Meeting Title</strong>: Set the title that appears in the header
              </li>
            </ul>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-4">Agenda Items Tab</h3>
            <div className="my-6 border rounded-lg overflow-hidden shadow-md">
              <Image
                src="/placeholder.svg?height=300&width=600&text=Agenda+Items+Settings"
                alt="Agenda Items Settings"
                width={600}
                height={300}
                className="w-full"
              />
              <div className="p-4 bg-gray-50 text-sm text-center">The agenda items tab for managing agenda items</div>
            </div>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">
                <strong>Item Management</strong>: Add, remove, or edit agenda items
              </li>
              <li className="text-lg">
                <strong>Time Allocation</strong>: Set the duration for each item in minutes
              </li>
              <li className="text-lg">
                <strong>Color Coding</strong>: Assign colors to specific agenda items for visual distinction
              </li>
            </ul>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-4">Sounds Tab</h3>
            <div className="my-6 border rounded-lg overflow-hidden shadow-md">
              <Image
                src="/placeholder.svg?height=250&width=600&text=Sound+Settings"
                alt="Sound Settings"
                width={600}
                height={250}
                className="w-full"
              />
              <div className="p-4 bg-gray-50 text-sm text-center">
                The sounds tab for customizing audio notifications
              </div>
            </div>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">
                <strong>Start Meeting Sound</strong>: Sound played when starting the meeting
              </li>
              <li className="text-lg">
                <strong>Transition Sound</strong>: Sound played when moving to the next agenda item
              </li>
              <li className="text-lg">
                <strong>End Meeting Sound</strong>: Sound played when the meeting ends
              </li>
              <li className="text-lg">
                <strong>Test Sound</strong>: Button to preview each sound
              </li>
            </ul>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-4">Fonts Tab</h3>
            <div className="my-6 border rounded-lg overflow-hidden shadow-md">
              <Image
                src="/placeholder.svg?height=300&width=600&text=Font+Settings"
                alt="Font Settings"
                width={600}
                height={300}
                className="w-full"
              />
              <div className="p-4 bg-gray-50 text-sm text-center">The fonts tab for customizing text appearance</div>
            </div>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">
                <strong>Font Family</strong>: Choose from various font options
              </li>
              <li className="text-lg">
                <strong>Title Size</strong>: Adjust the size of the meeting title
              </li>
              <li className="text-lg">
                <strong>Item Text Size</strong>: Adjust the size of agenda item text
              </li>
              <li className="text-lg">
                <strong>Time Display Size</strong>: Adjust the size of time displays
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Templates</h2>
          <p className="text-lg leading-relaxed mb-6">
            The template manager allows you to save and load agenda configurations:
          </p>
          <div className="my-6 border rounded-lg overflow-hidden shadow-md">
            <Image
              src="/placeholder.svg?height=350&width=600&text=Template+Manager"
              alt="Template Manager"
              width={600}
              height={350}
              className="w-full"
            />
            <div className="p-4 bg-gray-50 text-sm text-center">
              The template manager dialog for saving and loading templates
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-4">Saving Templates</h3>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">Enter a name for your template and click "Save Current"</li>
              <li className="text-lg">Templates save all agenda items, durations, colors, and sound settings</li>
            </ul>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-4">Loading Templates</h3>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">Select a template from the list and click "Load"</li>
              <li className="text-lg">Your current agenda will be replaced with the template</li>
            </ul>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-4">Template Management</h3>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">
                <strong>Rename</strong>: Change the name of an existing template
              </li>
              <li className="text-lg">
                <strong>Duplicate</strong>: Create a copy of a template
              </li>
              <li className="text-lg">
                <strong>Delete</strong>: Remove a template
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Pop-out Window</h2>
          <p className="text-lg leading-relaxed mb-6">
            The pop-out feature opens a separate window with the agenda timer:
          </p>
          <div className="my-6 border rounded-lg overflow-hidden shadow-md">
            <Image
              src="/placeholder.svg?height=400&width=600&text=Pop-out+Window"
              alt="Pop-out Window"
              width={600}
              height={400}
              className="w-full"
            />
            <div className="p-4 bg-gray-50 text-sm text-center">The pop-out window showing the agenda timer</div>
          </div>
          <ul className="list-disc pl-6 space-y-3">
            <li className="text-lg">Useful for displaying on a second monitor or projector</li>
            <li className="text-lg">Synchronizes with the main window</li>
            <li className="text-lg">Contains all the same controls and information</li>
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Sound Notifications</h2>
          <p className="text-lg leading-relaxed mb-6">The app provides audio cues at key moments:</p>
          <ul className="list-disc pl-6 space-y-3">
            <li className="text-lg">When starting the meeting</li>
            <li className="text-lg">When transitioning between agenda items</li>
            <li className="text-lg">When the meeting ends</li>
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Tips for Effective Use</h2>
          <div className="my-6 border rounded-lg overflow-hidden shadow-md">
            <Image
              src="/placeholder.svg?height=300&width=600&text=Effective+Use+Tips"
              alt="Effective Use Tips"
              width={600}
              height={300}
              className="w-full"
            />
            <div className="p-4 bg-gray-50 text-sm text-center">
              An example of an effectively managed meeting with the timer
            </div>
          </div>
          <ol className="list-decimal pl-6 space-y-4">
            <li className="text-lg">
              <strong>Prepare Your Agenda</strong>: Set up your agenda items and time allocations before the meeting
              starts
            </li>
            <li className="text-lg">
              <strong>Save Templates</strong>: Create templates for recurring meetings to save time
            </li>
            <li className="text-lg">
              <strong>Use Color Coding</strong>: Assign colors to categorize different types of agenda items
            </li>
            <li className="text-lg">
              <strong>Pop-out Display</strong>: Use the pop-out feature to display the timer on a shared screen
            </li>
            <li className="text-lg">
              <strong>Sound Alerts</strong>: Keep sound enabled to help everyone stay aware of time transitions
            </li>
          </ol>
        </section>

        <div className="mt-16 p-6 bg-gray-50 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
          <p className="text-lg mb-4">Check out our video walkthrough for a detailed demonstration of all features:</p>
          <a
            href="https://youtu.be/jPsuX67EP2k"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Video className="h-5 w-5 mr-2" />
            Watch Video Walkthrough
          </a>
        </div>
      </div>
    </div>
  )
}
