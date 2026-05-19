import React from 'react';
import { useSelectedItem } from '../../context/SelectedItemContext';

interface ItemVFXProps {
  type?: 'none' | 'embers' | 'sparks' | 'void' | 'frost' | 'gold_dust' | 'thunder' | 'poison' | 'smoke' | 'explosion' | 'sandstorm' | 'water' | 'hologram' | 'earth' | 'nature' | 'spark_discharge' | 'feathers' | 'demonic' | 'bleed' | 'splash' | 'gem_reflex' | 'living_paint' | 'divine' | 'cursed';
  rarity?: string;
  name?: string;
  className?: string;
}

export function ItemVFX({ type, rarity, name, className = "" }: ItemVFXProps) {
  // Hard safety check against objects as children/props
  const safeName = typeof name === 'string' ? name : '';
  
  // Hash function for deterministic randomness
  const getSeed = (str: string) => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const seed = getSeed(safeName || 'default');
  const seededRandom = (i: number) => {
    const x = Math.sin(seed + i) * 10000;
    return x - Math.floor(x);
  };

  const isHighRarity = rarity?.toLowerCase() === 'legendary' || rarity?.toLowerCase() === 'divine';

  // Fallback inteligente baseado no nome se o tipo não for especificado (undefined, null ou vazio)
  let fallbackType: ItemVFXProps['type'] = 'none';
  if (isHighRarity && (!type || (type as string) === '')) {
    const lowerName = name?.toLowerCase() || '';
    if (lowerName.includes('chama') || lowerName.includes('fogo') || lowerName.includes('brasa')) {
      fallbackType = 'embers';
    } else if (lowerName.includes('gelo') || lowerName.includes('frio') || lowerName.includes('véu')) {
      fallbackType = 'frost';
    } else {
      fallbackType = rarity?.toLowerCase() === 'divine' ? 'divine' : 'thunder';
    }
  }

  const finalType = (type && (type as string) !== '') ? type : fallbackType;
  
  if (finalType === 'none') return null;

  const renderParticles = () => {
    switch (finalType) {
      case 'thunder':
        return (
          <>
            <div className="absolute -inset-2 bg-blue-500/20 blur-xl animate-pulse rounded-lg" />
            <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
              {[...Array(4)].map((_, i) => {
                const r1 = seededRandom(i * 10);
                const r2 = seededRandom(i * 20);
                const r3 = seededRandom(i * 30);
                const r4 = seededRandom(i * 40);
                return (
                  <div 
                    key={i}
                    className="absolute bg-blue-100/60 shadow-[0_0_10px_#60a5fa] animate-[pulse_0.1s_ease-in-out_infinite]"
                    style={{
                      width: '1px',
                      height: `${20 + r1 * 60}%`,
                      top: `${r2 * 80}%`,
                      left: `${r3 * 100}%`,
                      transform: `rotate(${r4 * 360}deg) skew(${r1 * 20}deg)`,
                      opacity: 0.8,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                );
              })}
            </div>
          </>
        );
      case 'embers':
        return (
          <>
            <div className="absolute -inset-2 bg-orange-600/30 blur-xl animate-pulse rounded-lg" />
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
              {[...Array(15)].map((_, i) => {
                const r1 = seededRandom(i * 11);
                const r2 = seededRandom(i * 22);
                const r3 = seededRandom(i * 33);
                return (
                  <div 
                    key={i}
                    className="absolute bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-200 rounded-full blur-[1.5px] animate-[rise_2s_ease-out_infinite]"
                    style={{
                      bottom: '-10px',
                      left: `${r1 * 100}%`,
                      width: `${3 + r2 * 6}px`,
                      height: `${3 + r2 * 6}px`,
                      animationDelay: `${r3 * 2}s`,
                      animationDuration: `${1.5 + r1}s`,
                      opacity: 0.4 + r2 * 0.4
                    }}
                  />
                );
              })}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-orange-600/40 to-transparent rounded-b-lg blur-sm" />
          </>
        );
      case 'frost':
        return (
          <>
            <div className="absolute -inset-1.5 bg-blue-400/20 blur-md animate-pulse rounded-lg" />
            <div className="absolute inset-0 overflow-hidden">
               {[...Array(6)].map((_, i) => {
                 const r1 = seededRandom(i * 7);
                 return (
                   <div key={i} className="absolute w-1 h-1 bg-white rounded-full blur-[1px] animate-pulse"
                     style={{ top: `${r1 * 100}%`, left: `${seededRandom(i * 9) * 100}%`, animationDelay: `${r1 * 2}s` }} />
                 );
               })}
            </div>
          </>
        );
      case 'void':
        return (
          <>
            <div className="absolute -inset-3 bg-purple-900/30 blur-xl animate-pulse rounded-lg" />
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] rounded-lg animate-pulse" />
          </>
        );
      case 'gold_dust':
        return (
          <>
            <div className="absolute -inset-1.5 bg-amber-500/20 blur-md animate-pulse rounded-lg" />
            {[...Array(10)].map((_, i) => (
              <div key={i} className="absolute w-0.5 h-0.5 bg-amber-200 rounded-full animate-ping"
                style={{ top: `${seededRandom(i * 5) * 100}%`, left: `${seededRandom(i * 3) * 100}%`, animationDelay: `${seededRandom(i * 2) * 3}s` }} />
            ))}
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
                  top: `${seededRandom(i * 12) * 100}%`,
                  left: `${seededRandom(i * 14) * 100}%`,
                  transform: `rotate(${seededRandom(i * 16) * 360}deg)`,
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
            {/* Puddle */}
            <div className="absolute bottom-0 inset-x-1 h-1/4 bg-green-900/60 blur-md rounded-b-lg" />
            <div className="absolute -inset-2 bg-green-500/10 blur-xl animate-pulse rounded-lg" />
            {/* Bubbles */}
            <div className="absolute inset-0 pointer-events-none">
               {[...Array(6)].map((_, i) => {
                 const r1 = seededRandom(i * 5);
                 const r2 = seededRandom(i * 7);
                 return (
                   <div key={i} className="absolute border border-green-400/40 bg-green-500/20 rounded-full animate-[rise_3s_ease-in-infinite]"
                     style={{
                       bottom: '-5px',
                       left: `${r1 * 80 + 10}%`,
                       width: `${4 + r2 * 8}px`,
                       height: `${4 + r2 * 8}px`,
                       animationDelay: `${r1 * 3}s`,
                       animationDuration: `${2 + r2 * 2}s`
                     }}
                   >
                     <div className="absolute top-1 left-1 w-1 h-1 bg-white/40 rounded-full" />
                   </div>
                 );
               })}
            </div>
          </>
        );
      case 'smoke':
        return (
          <>
            <div className="absolute -inset-3 bg-zinc-700/20 blur-2xl animate-pulse rounded-lg" />
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute bg-zinc-500/20 blur-xl rounded-full animate-[rise_4s_ease-out_infinite]"
                  style={{
                    bottom: '-20px',
                    left: `${seededRandom(i * 4) * 80}%`,
                    width: '40px',
                    height: '40px',
                    animationDelay: `${i * 0.8}s`
                  }} />
              ))}
            </div>
          </>
        );
      case 'hologram':
        return (
          <>
            <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              {/* Scanlines */}
              <div className="absolute inset-0 opacity-30" style={{ 
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 255, 0.1) 1px, rgba(0, 255, 255, 0.1) 2px)',
                backgroundSize: '100% 2px'
              }} />
              {/* Glitch lines */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="absolute w-full h-px bg-cyan-400/40 animate-[shimmer_2s_infinite]"
                  style={{ top: `${seededRandom(i * 8) * 100}%`, animationDelay: `${i * 0.7}s` }} />
              ))}
              <div className="absolute inset-0 bg-cyan-300/10 mix-blend-screen animate-pulse" />
            </div>
          </>
        );
      case 'earth':
        return (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-amber-900/30 rounded-sm animate-[rise_2.5s_ease-out_infinite]"
                style={{
                  bottom: '-5px',
                  left: `${seededRandom(i * 5) * 100}%`,
                  width: `${3 + seededRandom(i * 2) * 7}px`,
                  height: `${3 + seededRandom(i * 2) * 7}px`,
                  transform: `rotate(${seededRandom(i * 9) * 360}deg)`,
                  animationDelay: `${seededRandom(i * 4) * 2}s`,
                  opacity: 0.5
                }}
              />
            ))}
          </>
        );
      case 'nature':
        return (
          <>
            <div className="absolute bottom-0 inset-x-0 h-1/4 bg-green-900/20 blur-sm rounded-b-lg" />
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-green-500/40 rounded-full animate-[rise_2s_ease-out_infinite]"
                style={{
                  bottom: '-5px',
                  left: `${seededRandom(i * 3) * 100}%`,
                  width: `${2 + seededRandom(i * 6) * 5}px`,
                  height: `${2 + seededRandom(i * 6) * 5}px`,
                  animationDelay: `${seededRandom(i * 7) * 2}s`,
                  opacity: 0.6
                }}
              />
            ))}
          </>
        );
      case 'spark_discharge':
        return (
          <>
            <div className="absolute -inset-2 bg-cyan-400/10 blur-xl animate-pulse rounded-lg" />
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white shadow-[0_0_8px_#ffffff] animate-pulse"
                  style={{
                    width: '1.5px',
                    height: `${15 + seededRandom(i * 5) * 40}%`,
                    top: `${seededRandom(i * 7) * 80}%`,
                    left: `${seededRandom(i * 9) * 100}%`,
                    transform: `rotate(${seededRandom(i * 11) * 360}deg)`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </>
        );
      case 'feathers':
        return (
          <>
            {[...Array(6)].map((_, i) => {
              const r1 = seededRandom(i * 3);
              const r2 = seededRandom(i * 5);
              return (
                <div
                  key={i}
                  className="absolute bg-white/40 rounded-full blur-[0.5px] animate-[rise_3s_linear_infinite]" 
                  style={{
                    top: '-10px',
                    left: `${r1 * 100}%`,
                    width: '4px',
                    height: '12px',
                    transform: `rotate(${r2 * 360}deg)`,
                    animationDelay: `${r1 * 3}s`,
                    animationDuration: `${3 + r2 * 2}s`
                  }}
                />
              );
            })}
          </>
        );
      case 'demonic':
        return (
          <>
            <div className="absolute -inset-2 bg-red-950/60 blur-xl animate-pulse rounded-lg shadow-[0_0_20px_rgba(153,27,27,0.4)]" />
            <div className="absolute inset-0 border border-red-900/50 rounded-lg animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent" />
          </>
        );
      case 'bleed':
        return (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-red-600 rounded-full animate-[rise_1.5s_ease-in_infinite]"
                style={{
                  top: `${seededRandom(i * 4) * 40}%`,
                  left: `${seededRandom(i * 2) * 100}%`,
                  width: '2px',
                  height: '8px',
                  animationDelay: `${seededRandom(i * 6) * 1.5}s`,
                  opacity: 0.8
                }}
              />
            ))}
          </>
        );
      case 'splash':
        return (
          <>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-blue-400/40 rounded-full animate-pulse"
                style={{
                  bottom: `${seededRandom(i * 5) * 20}%`,
                  left: `${seededRandom(i * 3) * 100}%`,
                  width: `${2 + seededRandom(i * 7) * 4}px`,
                  height: `${2 + seededRandom(i * 7) * 4}px`,
                  animationDelay: `${seededRandom(i * 9) * 1}s`
                }}
              />
            ))}
          </>
        );
      case 'gem_reflex':
        return (
          <>
            <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          </>
        );
      case 'living_paint':
        return (
          <>
            <div className="absolute inset-0 bg-black/40 blur-sm" />
            <div className="absolute inset-0 overflow-hidden">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="absolute bg-black rounded-full blur-md animate-pulse"
                   style={{
                     width: '40px',
                     height: '40px',
                     top: `${seededRandom(i * 5) * 80}%`,
                     left: `${seededRandom(i * 7) * 80}%`,
                     opacity: 0.6
                   }} />
               ))}
            </div>
          </>
        );
      case 'divine':
        return (
          <>
            <div className="absolute -inset-4 bg-red-600/20 blur-2xl animate-pulse rounded-lg" />
            <div className="absolute inset-0 border-2 border-red-500/30 rounded-lg shadow-[inset_0_0_15px_rgba(220,38,38,0.3)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-white/10" />
            {[...Array(5)].map((_, i) => (
               <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                 style={{ top: `${seededRandom(i * 4) * 100}%`, left: `${seededRandom(i * 6) * 100}%`, animationDelay: `${i * 0.5}s` }} />
            ))}
          </>
        );
      case 'cursed':
        return (
          <>
            <div className="absolute -inset-3 bg-purple-900/40 blur-xl animate-pulse rounded-lg" />
            <div className="absolute inset-0 border border-purple-500/20 rounded-lg" />
            <div className="absolute inset-0 bg-black/20" />
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
}
