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
            <div className="absolute inset-0 bg-orange-600/10 animate-pulse" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-500/40 blur-xl animate-bounce" />
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-orange-400 rounded-full animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '3s'
                }}
              />
            ))}
          </>
        );
      case 'frost':
        return (
          <>
            <div className="absolute inset-0 bg-blue-400/10 animate-pulse" />
            <div className="absolute inset-0 border border-blue-400/20 rounded-lg animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-blue-100 rotate-45 animate-spin"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: '5s'
                }}
              />
            ))}
          </>
        );
      case 'void':
        return (
          <div className="absolute inset-0 bg-purple-950/20 overflow-hidden rounded-lg">
            <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(168,85,247,0.4)] animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,0.8)_100%)]" />
          </div>
        );
      case 'gold_dust':
        return (
          <>
            <div className="absolute inset-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]" />
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-0.5 h-0.5 bg-amber-400 rounded-full animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </>
        );
      case 'sparks':
        return (
          <>
            <div className="absolute inset-0 bg-yellow-400/5" />
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-px h-2 bg-yellow-200 animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDelay: `${i * 0.3}s`
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
