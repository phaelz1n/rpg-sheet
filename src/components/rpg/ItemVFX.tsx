import React from 'react';
import { useSelectedItem } from '../../context/SelectedItemContext';

interface ItemVFXProps {
  type?: 'none' | 'embers' | 'sparks' | 'void' | 'frost' | 'gold_dust' | 'thunder' | 'poison' | 'smoke' | 'explosion' | 'sandstorm' | 'water' | 'hologram' | 'earth' | 'nature' | 'spark_discharge' | 'feathers' | 'demonic' | 'bleed' | 'splash' | 'gem_reflex' | 'living_paint' | 'divine' | 'cursed';
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
          </>
        );
      case 'embers':
        return (
          <>
            {/* Outer Glow */}
            <div className="absolute -inset-2 bg-orange-600/30 blur-xl animate-pulse rounded-lg" />
            
            {/* Flame Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-200 rounded-full blur-[1.5px] animate-[rise_2s_ease-out_infinite]"
                  style={{
                    bottom: '-10px',
                    left: `${Math.random() * 100}%`,
                    width: `${3 + Math.random() * 10}px`,
                    height: `${3 + Math.random() * 10}px`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                    opacity: 0.4 + Math.random() * 0.4
                  }}
                />
              ))}
            </div>
            
            {/* Bottom Fire Base Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-orange-600/40 to-transparent rounded-b-lg blur-sm" />
          </>
        );
      case 'frost':
        return (
          <>
            <div className="absolute -inset-1.5 bg-blue-400/20 blur-md animate-pulse rounded-lg" />
          </>
        );
      case 'void':
        return (
          <>
            <div className="absolute -inset-3 bg-purple-900/30 blur-xl animate-pulse rounded-lg" />
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] rounded-lg" />
          </>
        );
      case 'gold_dust':
        return (
          <>
            <div className="absolute -inset-1.5 bg-amber-500/20 blur-md animate-pulse rounded-lg" />
          </>
        );
      case 'sparks':
        return (
          <>
            <div className="absolute -inset-[1px] border border-yellow-500/30 rounded-lg animate-pulse" />
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-px h-3 bg-yellow-200 animate-pulse"
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
      case 'poison':
        return (
          <>
            <div className="absolute -inset-2 bg-green-500/30 blur-xl animate-pulse rounded-lg" />
          </>
        );
      case 'smoke':
        return (
          <>
            <div className="absolute -inset-2 bg-gray-700/40 blur-xl animate-pulse rounded-lg" />
          </>
        );
      case 'explosion':
        return (
          <>
            <div className="absolute inset-0 bg-yellow-300/30 blur-xl animate-pulse rounded-full" />
            <div className="absolute inset-0 border border-yellow-400/50 rounded-full animate-[scale_0.5s_ease-out_infinite]" />
          </>
        );
      case 'sandstorm':
        return (
          <>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-yellow-600/40 rounded-full animate-[rise_2s_ease-out_infinite]"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 6}px`,
                  height: `${2 + Math.random() * 6}px`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: 0.5 + Math.random() * 0.4
                }}
              />
            ))}
          </>
        );
      case 'water':
        return (
          <>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-blue-400/30 rounded-full animate-[rise_2s_ease-out_infinite]"
                style={{
                  bottom: '-5px',
                  left: `${Math.random() * 100}%`,
                  width: `${4 + Math.random() * 8}px`,
                  height: `${4 + Math.random() * 8}px`,
                  animationDelay: `${Math.random() * 1.5}s`,
                  opacity: 0.6 + Math.random() * 0.3
                }}
              />
            ))}
          </>
        );
      case 'hologram':
        return (
          <>
            <div className="absolute inset-0 bg-cyan-200/10" />
            <div className="absolute inset-0 bg-cyan-300/20 mix-blend-screen" style={{ backgroundImage: 'linear-gradient(45deg, transparent 45%, #00ffff 45%, #00ffff 55%, transparent 55%)', backgroundSize: '4px 4px' }} />
          </>
        );
      case 'earth':
        return (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-brown-800/40 rounded-full animate-[rise_2s_ease-out_infinite]"
                style={{
                  bottom: '-5px',
                  left: `${Math.random() * 100}%`,
                  width: `${5 + Math.random() * 10}px`,
                  height: `${5 + Math.random() * 10}px`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: 0.5 + Math.random() * 0.4
                }}
              />
            ))}
          </>
        );
      case 'nature':
        return (
          <>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-green-600/30 rounded-full animate-[rise_2s_ease-out_infinite]"
                style={{
                  bottom: '-5px',
                  left: `${Math.random() * 100}%`,
                  width: `${3 + Math.random() * 8}px`,
                  height: `${3 + Math.random() * 8}px`,
                  animationDelay: `${Math.random() * 1.5}s`,
                  opacity: 0.5 + Math.random() * 0.4
                }}
              />
            ))}
          </>
        );
      case 'spark_discharge':
        return (
          <>
            <div className="absolute -inset-2 bg-white/30 blur-xl animate-pulse rounded-lg" />
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white/60 shadow-[0_0_10px_#ffffff] animate-[pulse_0.1s_ease-in-out_infinite]"
                  style={{
                    width: '2px',
                    height: `${20 + Math.random() * 60}%`,
                    top: `${Math.random() * 80}%`,
                    left: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    opacity: 0.8,
                    animationDelay: `${i * 0.15}s`
                  }}
                />
              ))}
            </div>
          </>
        );
      case 'feathers':
        return (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white/70 rounded" 
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 4}px`,
                  height: `${8 + Math.random() * 12}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  opacity: 0.6 + Math.random() * 0.3,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </>
        );
      case 'demonic':
        return (
          <>
            <div className="absolute -inset-2 bg-red-900/40 blur-xl animate-pulse rounded-lg" />
            <div className="absolute inset-0 border border-red-700/30 rounded-lg" />
          </>
        );
      case 'bleed':
        return (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-red-600/70 rounded-full animate-[rise_1.5s_ease-out_infinite]"
                style={{
                  top: `${Math.random() * 30}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 4}px`,
                  height: `${6 + Math.random() * 8}px`,
                  opacity: 0.6 + Math.random() * 0.3,
                  animationDelay: `${Math.random() * 1}s`
                }}
              />
            ))}
          </>
        );
      case 'splash':
        return (
          <>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-blue-300/30 rounded-full animate-[rise_1.8s_ease-out_infinite]"
                style={{
                  bottom: '-5px',
                  left: `${Math.random() * 100}%`,
                  width: `${3 + Math.random() * 6}px`,
                  height: `${3 + Math.random() * 6}px`,
                  opacity: 0.5 + Math.random() * 0.4,
                  animationDelay: `${Math.random() * 1.5}s`
                }}
              />
            ))}
          </>
        );
      case 'gem_reflex':
        return (
          <>
            <div className="absolute inset-0 bg-purple-200/10" />
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-purple-400/30 rounded-full animate-[scale_1s_ease-out_infinite]"
                style={{
                  top: `${Math.random() * 80}%`,
                  left: `${Math.random() * 80}%`,
                  width: `${4 + Math.random() * 8}px`,
                  height: `${4 + Math.random() * 8}px`,
                  opacity: 0.6 + Math.random() * 0.3,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </>
        );
      case 'living_paint':
        return (
          <>
            <div className="absolute inset-0 bg-black/70" />
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-black/90 rounded-full animate-[rise_2s_ease-out_infinite]"
                style={{
                  bottom: '-5px',
                  left: `${Math.random() * 100}%`,
                  width: `${6 + Math.random() * 12}px`,
                  height: `${6 + Math.random() * 12}px`,
                  opacity: 0.5 + Math.random() * 0.3,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </>
        );
      case 'divine':
        return (
          <>
            <div className="absolute -inset-2 bg-yellow-300/30 blur-xl animate-pulse rounded-lg" />
            <div className="absolute inset-0 border border-yellow-400/50 rounded-lg" />
          </>
        );
      case 'cursed':
        return (
          <>
            <div className="absolute -inset-2 bg-purple-800/40 blur-xl animate-pulse rounded-lg" />
            <div className="absolute inset-0 border border-purple-600/50 rounded-lg" />
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
