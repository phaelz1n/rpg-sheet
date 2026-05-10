import { LucideIcon, ChevronDown } from 'lucide-react';
import { Zap, Eye } from 'lucide-react';
import { useState } from 'react';

interface AbilityCardProps {
  name: string;
  type: 'action' | 'passive';
  icon: LucideIcon;
  manaCost?: number;
  corruptionCost?: number;
  test?: string;
  damage?: string;
  effect: string;
  backlash?: string;
  onNameChange?: (value: string) => void;
  onTypeChange?: (value: 'action' | 'passive') => void;
  onManaCostChange?: (value: number) => void;
  onCorruptionCostChange?: (value: number) => void;
  onTestChange?: (value: string) => void;
  onDamageChange?: (value: string) => void;
  onEffectChange?: (value: string) => void;
  onBacklashChange?: (value: string) => void;
}

export function AbilityCard({
  name,
  type,
  icon: Icon,
  manaCost,
  corruptionCost,
  test,
  damage,
  effect,
  backlash,
  onNameChange,
  onTypeChange,
  onManaCostChange,
  onCorruptionCostChange,
  onTestChange,
  onDamageChange,
  onEffectChange,
  onBacklashChange
}: AbilityCardProps) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const isActive = type === 'action';

  return (
    <div className={`relative ${
      isActive
        ? 'bg-gradient-to-br from-red-950/30 to-zinc-900/80 border-2 border-red-900/50'
        : 'bg-gradient-to-br from-purple-950/30 to-zinc-900/80 border-2 border-purple-800/50'
    } rounded-lg p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all`}>

      {/* Type selector */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setShowTypeSelector(!showTypeSelector)}
          className={`flex items-center gap-1 px-2 py-0.5 ${
            isActive ? 'bg-red-900/50 border border-red-700/50' : 'bg-purple-900/50 border border-purple-700/50'
          } rounded text-xs ${isActive ? 'text-red-300' : 'text-purple-300'} hover:brightness-110 transition-all`}
        >
          {isActive ? <Zap className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          <span>{isActive ? 'AÇÃO' : 'PASSIVA'}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {showTypeSelector && (
          <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-amber-800/50 rounded-lg shadow-2xl overflow-hidden">
            <button
              onClick={() => {
                onTypeChange?.('action');
                setShowTypeSelector(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-900/20 transition-colors text-left text-sm text-zinc-300 whitespace-nowrap"
            >
              <Zap className="w-3 h-3 text-red-400" />
              Ação
            </button>
            <button
              onClick={() => {
                onTypeChange?.('passive');
                setShowTypeSelector(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-purple-900/20 transition-colors text-left text-sm text-zinc-300 whitespace-nowrap"
            >
              <Eye className="w-3 h-3 text-purple-400" />
              Passiva
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${
          isActive ? 'bg-red-950/50 border border-red-800/50' : 'bg-purple-950/50 border border-purple-800/50'
        } flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${isActive ? 'text-red-500' : 'text-purple-500'}`} />
        </div>
        <div className="flex-1 pt-1">
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange?.(e.target.value)}
            className="w-full bg-transparent text-amber-300 tracking-wide border-b border-transparent hover:border-amber-800/50 focus:border-amber-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Costs */}
      {(manaCost !== undefined || corruptionCost !== undefined) && (
        <div className="flex gap-2 mb-3">
          {manaCost !== undefined && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-950/50 border border-blue-800/40 rounded text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <input
                type="number"
                value={manaCost}
                onChange={(e) => onManaCostChange?.(Number(e.target.value))}
                className="w-8 bg-transparent text-blue-300 text-center focus:outline-none"
                min={0}
              />
              <span className="text-blue-300">Mana</span>
            </div>
          )}
          {corruptionCost !== undefined && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-950/50 border border-purple-800/40 rounded text-xs">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-purple-300">+</span>
              <input
                type="number"
                value={corruptionCost}
                onChange={(e) => onCorruptionCostChange?.(Number(e.target.value))}
                className="w-8 bg-transparent text-purple-300 text-center focus:outline-none"
                min={0}
              />
              <span className="text-purple-300">Corr</span>
            </div>
          )}
        </div>
      )}

      {/* Test and Damage */}
      {(test || damage) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {test && (
            <div className="bg-black/40 border border-amber-900/30 rounded p-2">
              <div className="text-xs text-zinc-500 uppercase mb-0.5">Teste</div>
              <input
                type="text"
                value={test}
                onChange={(e) => onTestChange?.(e.target.value)}
                className="w-full bg-transparent text-amber-400 text-sm focus:outline-none"
              />
            </div>
          )}
          {damage && (
            <div className="bg-black/40 border border-red-900/40 rounded p-2">
              <div className="text-xs text-zinc-500 uppercase mb-0.5">Dano</div>
              <input
                type="text"
                value={damage}
                onChange={(e) => onDamageChange?.(e.target.value)}
                className="w-full bg-transparent text-red-400 text-sm focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* Effect */}
      <div className="bg-black/30 border border-amber-900/20 rounded p-3 mb-2">
        <textarea
          value={effect}
          onChange={(e) => onEffectChange?.(e.target.value)}
          className="w-full bg-transparent text-zinc-300 text-sm leading-relaxed focus:outline-none resize-none min-h-[60px]"
          placeholder="Descrição da habilidade..."
        />
      </div>

      {/* Backlash */}
      {backlash !== undefined && (
        <div className="bg-red-950/30 border border-red-900/40 rounded p-2">
          <div className="text-xs text-red-400 uppercase mb-1">Contragolpe em Falha</div>
          <textarea
            value={backlash}
            onChange={(e) => onBacklashChange?.(e.target.value)}
            className="w-full bg-transparent text-red-300 text-xs leading-relaxed focus:outline-none resize-none min-h-[40px]"
            placeholder="Efeito de falha..."
          />
        </div>
      )}
    </div>
  );
}
