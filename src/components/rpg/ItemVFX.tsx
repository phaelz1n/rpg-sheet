import React from 'react';

interface ItemVFXProps {
  type?: 'none' | 'embers' | 'sparks' | 'void' | 'frost' | 'gold_dust' | 'thunder';
  rarity?: string;
  name?: string;
  className?: string;
}

export function ItemVFX({ type, rarity, name, className = "" }: ItemVFXProps) {
  // Fallback inteligente baseado no nome se o tipo não for especificado
  let fallbackType: ItemVFXProps['type'] = 'none';
  if (rarity?.toLowerCase() === 'legendary') {
    const lowerName = name?.toLowerCase() || '';
    if (lowerName.includes('chama') || lowerName.includes('fogo') || lowerName.includes('brasa')) {
      fallbackType = 'embers';
    } else if (lowerName.includes('gelo') || lowerName.includes('frio') || lowerName.includes('véu')) {
      fallbackType = 'frost';
    } else {
      fallbackType = 'thunder';
    }
  }

  const finalType = type || fallbackType;
  
  if (finalType === 'none') return null;

  const renderParticles = () => {
    switch (finalType) {
      case 'thunder':
        return (
          <>
            {/* Electric Glow */}
            <div className="absolute -inset-2 bg-blue-500/20 blur-xl animate-pulse rounded-lg" />
            {/* Lightning Arcs */}
            <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute bg-blue-100/60 shadow-[0_0_10px_#60a5fa] animate-[pulse_0.1s_ease-in-out_infinite]"
                  style={{
                    width: '1px',
                    height: `${20 + Math.random() * 60}%`,
                    top: `${Math.random() * 80}%`,
                    left: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg) skew(${Math.random() * 20}deg)`,
                    opacity: 0.8,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
            {/* Border Flash */}
            <div className="absolute -inset-[2px] rounded-lg overflow-hidden pointer-events-none">
              <div 
                className="absolute inset-[-200%] opacity-90 mix-blend-screen animate-[spin_2s_linear_infinite]"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, transparent 25%, #60a5fa 50%, transparent 75%, transparent 100%)'
                }}
              />
            </div>
          </>
        );
      case 'embers':
        return (
          <>
            {/* Outer Glow */}
            <div className="absolute -inset-1.5 bg-orange-600/30 blur-md animate-pulse rounded-lg" />
            {/* Border Beam */}
            <div className="absolute -inset-[2px] rounded-lg overflow-hidden pointer-events-none">
              <div 
                className="absolute inset-[-200%] opacity-80 mix-blend-screen animate-[spin_4s_linear_infinite]"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, transparent 25%, #f97316 50%, #facc15 55%, transparent 60%, transparent 100%)'
                }}
              />
            </div>
            {/* Flame Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-200 rounded-full blur-[1px] animate-[rise_2s_ease-out_infinite]"
                  style={{
                    bottom: '-5px',
                    left: `${Math.random() * 90}%`,
                    width: `${4 + Math.random() * 8}px`,
                    height: `${4 + Math.random() * 8}px`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1.5 + Math.random()}s`,
                    opacity: 0.6
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-orange-950/20 to-transparent rounded-lg" />
          </>
        );
      case 'frost':
        return (
          <>
            <div className="absolute -inset-1.5 bg-blue-400/20 blur-md animate-pulse rounded-lg" />
            <div className="absolute -inset-[2px] rounded-lg overflow-hidden pointer-events-none">
              <div 
                className="absolute inset-[-200%] opacity-70 mix-blend-screen animate-[spin_6s_linear_infinite]"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, transparent 25%, #60a5fa 50%, transparent 75%, transparent 100%)'
                }}
              />
            </div>
          </>
        );
      case 'void':
        return (
          <>
            <div className="absolute -inset-3 bg-purple-900/30 blur-xl animate-pulse rounded-lg" />
            <div className="absolute -inset-[2px] rounded-lg overflow-hidden pointer-events-none">
              <div 
                className="absolute inset-[-200%] opacity-90 mix-blend-screen animate-[spin_3s_linear_infinite]"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, transparent 25%, #a855f7 50%, transparent 75%, transparent 100%)'
                }}
              />
            </div>
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] rounded-lg" />
          </>
        );
      case 'gold_dust':
        return (
          <>
            <div className="absolute -inset-1.5 bg-amber-500/20 blur-md animate-pulse rounded-lg" />
            <div className="absolute -inset-[2px] rounded-lg overflow-hidden pointer-events-none">
              <div 
                className="absolute inset-[-200%] opacity-80 mix-blend-screen animate-[spin_5s_linear_infinite]"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, transparent 25%, #fbbf24 50%, transparent 75%, transparent 100%)'
                }}
              />
            </div>
          </>
        );
      case 'sparks':
        return (
          <>
            <div className="absolute -inset-[1px] border border-yellow-500/30 rounded-lg animate-pulse" />
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-px h-3 bg-yellow-200 animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDelay: `${i * 0.4}s`,
                  opacity: 0.6
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
