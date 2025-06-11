export default function OfflinePage() {
  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            AdultReels
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto rounded-full" />
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">You&apos;re Offline</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            It looks like you&apos;ve lost your internet connection. Please check your network and try again.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-pink-500/25"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}