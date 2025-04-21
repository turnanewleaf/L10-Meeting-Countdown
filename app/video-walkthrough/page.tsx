export default function VideoWalkthroughPage() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <iframe
        src="https://www.youtube.com/embed/jPsuX67EP2k?autoplay=1"
        className="w-full h-full"
        title="L10 Meeting Agenda Timer Walkthrough"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}
