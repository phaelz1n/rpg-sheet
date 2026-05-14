import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { ItemVFX } from './ItemVFX';

interface DivineEquipEffectProps {
  name: string;
  icon: any;
  particles?: string;
  isVisible: boolean;
}

export function DivineEquipEffect({ name, icon: Icon, particles, isVisible }: DivineEquipEffectProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden"
        >
          {/* Background Rays */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: i * 45 }}
                animate={{ 
                  opacity: [0, 0.2, 0], 
                  scale: [1, 2.5],
                  rotate: [i * 45, i * 45 + 90] 
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: i * 0.1
                }}
                className="absolute w-[2px] h-[80vh] bg-gradient-to-t from-transparent via-red-500 to-transparent"
              />
            ))}
          </div>

          {/* Central Shockwave */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, border: '0px solid rgba(220, 38, 38, 0)' }}
            animate={{ 
              scale: [0.5, 4], 
              opacity: [0, 0.5, 0],
              borderWidth: ['20px', '2px'],
              borderColor: ['rgba(220, 38, 38, 0.8)', 'rgba(220, 38, 38, 0)']
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute rounded-full w-64 h-64 border-red-600 pointer-events-none"
          />

          {/* The Item Card */}
          <motion.div
            initial={{ scale: 0, rotateY: 180, y: 100, filter: 'brightness(5)' }}
            animate={{ 
              scale: [0, 1.3, 1],
              rotateY: [180, 0],
              y: [100, 0],
              filter: ['brightness(5)', 'brightness(1)']
            }}
            transition={{ 
              duration: 1.2, 
              times: [0, 0.6, 1],
              ease: "backOut" 
            }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Pulsing Aura */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-12 bg-red-600/20 blur-3xl rounded-full"
            />

            <div className="relative w-64 h-80 bg-gradient-to-br from-zinc-900 via-red-950 to-black border-2 border-red-500 rounded-2xl p-8 shadow-[0_0_100px_rgba(220,38,38,0.4)] flex flex-col items-center justify-center overflow-hidden">
              {/* Internal Particles */}
              <ItemVFX type={particles as any} rarity="divine" name={name} />
              
              {/* Glass Shine */}
              <motion.div
                animate={{ 
                  x: ['-200%', '200%'],
                  y: ['-200%', '200%']
                }}
                transition={{ 
                  delay: 0.8, 
                  duration: 1.5, 
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
              />

              {/* Icon & Title */}
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  filter: ['drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))', 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))', 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="flex flex-col items-center gap-6"
              >
                <div className="p-6 bg-red-950/40 rounded-full border border-red-500/30 shadow-inner">
                  <Icon className="w-20 h-20 text-red-500" />
                </div>
                
                <div className="text-center">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-black text-white uppercase tracking-tighter"
                  >
                    {name}
                  </motion.h2>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="mt-2 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-900/40"
                  >
                    <Sparkles className="w-3 h-3" />
                    Item Divino
                  </motion.div>
                </div>
              </motion.div>

              {/* Decorative Runes/Symbols (Mocked with small divs) */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    opacity: [0, 0.5, 0],
                    y: [0, -40]
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  className="absolute text-red-500/40 text-[10px] font-serif"
                  style={{ 
                    left: `${10 + Math.random() * 80}%`,
                    bottom: '10%'
                  }}
                >
                  {['†', '✧', '✡', '۞', '⌘'][i % 5]}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Flash Effect on Finish */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ delay: 1, duration: 0.4 }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
