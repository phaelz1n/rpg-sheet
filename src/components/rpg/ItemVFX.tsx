import React from 'react';

interface ItemVFXProps {
  type?: 'none' | 'embers' | 'sparks' | 'void' | 'frost' | 'gold_dust';
  className?: string;
}

export const ItemVFX: React.FC<ItemVFXProps> = ({ type, className = "" }) => {
  if (!type || type === 'none') return null;

  const renderParticles = () => {
    switch (type) {
      case 'embers':
        return (
          <>
            <div className="absolute inset-0 bg-orange-600/5 animate-pulse" />
            {/* Border Beam - Flame */}
            <div className="absolute inset-0 border-2 border-transparent rounded-lg overflow-hidden">
              <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,#f97316_360deg)] animate-[spin_3s_linear_infinite]" />
            </div>
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-orange-500 rounded-full blur-[1px] animate-bounce"
                style={{
                  bottom: '0',
                  left: `${10 + (i * 15)}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s',
                  opacity: 0.6
                }}
              />
            ))}
          </>
        );
      case 'frost':
        return (
          <>
            <div className="absolute inset-0 bg-blue-400/5 animate-pulse" />
            {/* Border Beam - Ice */}
            <div className="absolute inset-0 border-2 border-transparent rounded-lg overflow-hidden">
              <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,#60a5fa_360deg)] animate-[spin_4s_linear_infinite]" />
            </div>
            <div className="absolute inset-0 bg-blue-200/5 backdrop-blur-[1px]" />
          </>
        );
      case 'void':
        return (
          <>
            <div className="absolute inset-0 bg-purple-950/10" />
            {/* Border Beam - Void */}
            <div className="absolute inset-0 border-2 border-transparent rounded-lg overflow-hidden">
              <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,#a855f7_360deg)] animate-[spin_2s_linear_infinite]" />
            </div>
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
          </>
        );
      case 'gold_dust':
        return (
          <>
            {/* Border Beam - Gold */}
            <div className="absolute inset-0 border-2 border-transparent rounded-lg overflow-hidden">
              <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,#fbbf24_360deg)] animate-[spin_4s_linear_infinite]" />
            </div>
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-0.5 h-0.5 bg-amber-200 rounded-full animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  boxShadow: '0 0 5px #fbbf24'
                }}
              />
            ))}
          </>
        );
      case 'sparks':
        return (
          <>
            <div className="absolute inset-0 border-2 border-yellow-500/20 rounded-lg animate-pulse" />
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-px h-3 bg-yellow-200 animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDelay: `${i * 0.4}s`,
                  opacity: 0.4
                }}
              />
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none z-10 ${className}`}>
      {renderParticles()}
    </div>
  );
};
