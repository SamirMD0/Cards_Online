// Home.tsx - Modernized
import Navigation from '../components/common/Navigation';
import PlayButton from '../components/common/PlayButton';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Modern Background */}
      <div className="fixed inset-0 z-0">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-animated-gradient" />
        
        {/* Modern Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        
        {/* Center Focus Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-96 bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-3xl"></div>
      </div>

      <Navigation />

      {/* Modern Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-12">
        {/* Modern Title */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-6 tracking-tight">
            <span className="text-gradient bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient-shift">
              CARDS
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto">
            The ultimate card gaming experience - fast, fun, and free
          </p>
        </div>
        
        {/* Play Button */}
        <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <PlayButton />
        </div>

        {/* Modern Features Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="glass-panel-dark rounded-2xl p-6 group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🎮</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Real-time Multiplayer
            </h3>
            <p className="text-gray-400">
              Play with friends or strangers in real-time with smooth, responsive gameplay
            </p>
          </div>

          <div className="glass-panel-dark rounded-2xl p-6 group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Smart AI Opponents
            </h3>
            <p className="text-gray-400">
              Challenge intelligent AI bots that adapt to your playing style
            </p>
          </div>

          <div className="glass-panel-dark rounded-2xl p-6 group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-400">
              Ultra-responsive gameplay with no delays or lag
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">10K+</div>
            <div className="text-sm text-gray-400">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">24/7</div>
            <div className="text-sm text-gray-400">Online Games</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">99%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
}