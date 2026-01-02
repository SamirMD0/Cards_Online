import Navigation from '../components/common/Navigation';
import PlayButton from '../components/common/PlayButton';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {/* Dark background */}
        <div className="absolute inset-0 bg-gradient-radial from-dark-800 via-dark-900 to-black" />
        
        {/* Vignette Effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%)',
          }}
        />

        {/* Overhead Lamp Effect */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255, 220, 100, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Lamp Glow on Table Area */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] shadow-lamp opacity-50" />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        {/* Title */}
        <div className="text-center mb-12 animate-float">
          <h1 className="text-7xl md:text-8xl font-poppins font-extrabold text-white mb-4">
            <span className="bg-gradient-to-r from-uno-red via-uno-yellow to-uno-green bg-clip-text text-transparent">
              CARDS
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-inter">
            The Classic Card Game, Reimagined
          </p>
        </div>
   
        
        {/* Play Button */}
        <PlayButton />

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          <div className="text-center p-6 bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-xl font-poppins font-bold text-white mb-2">
              Real-time Multiplayer
            </h3>
            <p className="text-gray-400">
              Play with friends in real-time with smooth gameplay
            </p>
          </div>

          <div className="text-center p-6 bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-xl font-poppins font-bold text-white mb-2">
              AI Opponents
            </h3>
            <p className="text-gray-400">
              Practice against smart bots or fill empty slots
            </p>
          </div>

          <div className="text-center p-6 bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-poppins font-bold text-white mb-2">
              Classic Rules
            </h3>
            <p className="text-gray-400">
              All the cards and rules you know and love
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
