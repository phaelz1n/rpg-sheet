import { LucideIcon, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Zap, Eye, Droplet, Flame } from 'lucide-react';
import { useState } from 'react';
import { RichDescription } from './RichDescription';
import { AutocompleteTextarea } from './AutocompleteTextarea';

interface AbilityCardProps {
  name: string;
  type: 'action' | 'passive';
  icon: LucideIcon;
  manaCost?: number;
  corruptionCost?: number;
  staminaCost?: number;
  test?: string;
  damage?: string;
  effect: string;
  backlash?: string;
  onNameChange?: (value: string) => void;
  onTypeChange?: (value: 'action' | 'passive') => void;
  onManaCostChange?: (value: number | undefined) => void;
  onCorruptionCostChange?: (value: number | undefined) => void;
  onStaminaCostChange?: (value: number | undefined) => void;
  onTestChange?: (value: string) => void;
  onDamageChange?: (value: string) => void;
  onEffectChange?: (value: string) => void;
  onBacklashChange?: (value: string) => void;
  onDelete?: () => void;
}

export function AbilityCard({
  name,
  type,
  icon: IconProp,
  manaCost,
  corruptionCost,
  staminaCost,
  test,
  damage,
  effect,
  backlash,
  onNameChange,
  onTypeChange,
  onManaCostChange,
  onCorruptionCostChange,
  onStaminaCostChange,
  onTestChange,
  onDamageChange,
  onEffectChange,
  onBacklashChange,
  onDelete
}: AbilityCardProps) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const isActive = type === 'action';
  
  // Fallback for serialized icons from database
  const Icon = typeof IconProp === 'function' ? IconProp : Zap;

  const hasMana = manaCost !== undefined;
  const hasCorruption = corruptionCost !== undefined;
  const hasStamina = staminaCost !== undefined;

  const toggleMana = () => {
    if (hasMana) onManaCostChange?.(undefined);
    else onManaCostChange?.(1);
  };

  const toggleCorruption = () => {
    if (hasCorruption) onCorruptionCostChange?.(undefined);
    else onCorruptionCostChange?.(1);
  };

  const toggleStamina = () => {
    if (hasStamina) onStaminaCostChange?.(undefined);
    else onStaminaCostChange?.(1);
  };

  return (
    <div className={`relative ${
      isActive
        ? 'bg-gradient-to-br from-red-950/30 to-zinc-900/80 border-2 border-red-900/50'
        : 'bg-gradient-to-br from-purple-950/30 to-zinc-900/80 border-2 border-purple-800/50'
    } rounded-lg p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all`}>

      {/* Type selector & Delete */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
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

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-6 h-6 bg-red-900/40 border border-red-700/40 rounded flex items-center justify-center text-red-400 hover:bg-red-900/60 transition-all"
            title="Remover Habilidade"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

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

      {/* Resource cost toggles */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Mana toggle + input */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMana}
            title={hasMana ? 'Remover custo de Mana' : 'Adicionar custo de Mana'}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs border transition-all ${
              hasMana
                ? 'bg-blue-950/60 border-blue-700/60 text-blue-300'
                : 'bg-zinc-900/40 border-zinc-700/40 text-zinc-500 hover:border-blue-700/50 hover:text-blue-400'
            }`}
          >
            <Droplet className="w-3 h-3" />
            <span>Mana</span>
            {!hasMana && <Plus className="w-2.5 h-2.5" />}
          </button>
          {hasMana && (
            <input
              type="number"
              value={manaCost}
              onChange={(e) => onManaCostChange?.(Number(e.target.value))}
              className="w-8 bg-blue-950/40 border border-blue-800/40 rounded text-blue-300 text-center text-xs focus:outline-none focus:border-blue-500"
              min={0}
            />
          )}
        </div>

        {/* Corruption toggle + input */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleCorruption}
            title={hasCorruption ? 'Remover custo de Corrupção' : 'Adicionar custo de Corrupção'}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs border transition-all ${
              hasCorruption
                ? 'bg-purple-950/60 border-purple-700/60 text-purple-300'
                : 'bg-zinc-900/40 border-zinc-700/40 text-zinc-500 hover:border-purple-700/50 hover:text-purple-400'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Corr.</span>
            {!hasCorruption && <Plus className="w-2.5 h-2.5" />}
          </button>
          {hasCorruption && (
            <input
              type="number"
              value={corruptionCost}
              onChange={(e) => onCorruptionCostChange?.(Number(e.target.value))}
              className="w-8 bg-purple-950/40 border border-purple-800/40 rounded text-purple-300 text-center text-xs focus:outline-none focus:border-purple-500"
              min={0}
            />
          )}
        </div>

        {/* Stamina toggle + input */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleStamina}
            title={hasStamina ? 'Remover custo de Stamina' : 'Adicionar custo de Stamina'}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs border transition-all ${
              hasStamina
                ? 'bg-green-950/60 border-green-700/60 text-green-300'
                : 'bg-zinc-900/40 border-zinc-700/40 text-zinc-500 hover:border-green-700/50 hover:text-green-400'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Stamina</span>
            {!hasStamina && <Plus className="w-2.5 h-2.5" />}
          </button>
          {hasStamina && (
            <input
              type="number"
              value={staminaCost}
              onChange={(e) => onStaminaCostChange?.(Number(e.target.value))}
              className="w-8 bg-green-950/40 border border-green-800/40 rounded text-green-300 text-center text-xs focus:outline-none focus:border-green-500"
              min={0}
            />
          )}
        </div>
      </div>

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
      <div className="bg-black/30 border border-amber-900/20 rounded p-3 mb-2 relative group/effect">
        <AutocompleteTextarea
          value={effect}
          onChange={(e) => onEffectChange?.(e.target.value)}
          className="w-full bg-transparent text-zinc-300 text-sm leading-relaxed focus:outline-none resize-none min-h-[60px] absolute inset-0 p-3 z-10 opacity-0 focus:opacity-100"
          placeholder="Descrição da habilidade..."
        />
        <div className="text-zinc-300 text-sm leading-relaxed min-h-[60px] pointer-events-none group-focus-within/effect:opacity-0 transition-opacity">
          <RichDescription text={effect || "Descrição da habilidade..."} />
        </div>
      </div>

      {/* Backlash */}
      {backlash !== undefined && (
        <div className="bg-red-950/30 border border-red-900/40 rounded p-2 relative group/backlash">
          <div className="text-xs text-red-400 uppercase mb-1">Contragolpe em Falha</div>
          <AutocompleteTextarea
            value={backlash}
            onChange={(e) => onBacklashChange?.(e.target.value)}
            className="w-full bg-transparent text-red-300 text-xs leading-relaxed focus:outline-none resize-none min-h-[40px] absolute inset-x-0 bottom-0 p-2 pt-6 z-10 opacity-0 focus:opacity-100"
            placeholder="Efeito de falha..."
          />
          <div className="text-red-300 text-xs leading-relaxed min-h-[40px] pointer-events-none group-focus-within/backlash:opacity-0 transition-opacity">
            <RichDescription text={backlash || "Efeito de falha..."} />
          </div>
        </div>
      )}
    </div>
  );
}
