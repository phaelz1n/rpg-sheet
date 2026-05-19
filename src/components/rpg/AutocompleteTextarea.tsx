import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { 
  Skull, Flame, Eye, Hand, Heart, Brain, Sword, Target, 
  Droplet, Zap, Dumbbell, Beaker, Droplets, Activity, Shield,
  VolumeX, Moon, Sun, Sprout, Mountain, Volume2, Bomb, Crosshair, Sparkles
} from 'lucide-react';

interface AutocompleteTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value'> {
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TAG_SUGGESTIONS = [
  // --- Atributos ---
  { text: '#força', icon: Dumbbell, color: 'text-orange-500', label: 'Força' },
  { text: '#forca', icon: Dumbbell, color: 'text-orange-500', label: 'Força' },
  { text: '#destreza', icon: Zap, color: 'text-emerald-400', label: 'Destreza' },
  { text: '#vigor', icon: Heart, color: 'text-red-500', label: 'Vigor' },
  { text: '#vontade', icon: Brain, color: 'text-blue-500', label: 'Vontade' },
  { text: '#fé', icon: Flame, color: 'text-amber-500', label: 'Fé' },
  { text: '#fe', icon: Flame, color: 'text-amber-500', label: 'Fé' },
  { text: '#ocultismo', icon: Eye, color: 'text-purple-400', label: 'Ocultismo' },

  // --- Recursos ---
  { text: '#vida', icon: Heart, color: 'text-red-500', label: 'Vida' },
  { text: '#hp', icon: Heart, color: 'text-red-500', label: 'HP' },
  { text: '#mana', icon: Droplet, color: 'text-blue-400', label: 'Mana' },
  { text: '#stamina', icon: Zap, color: 'text-green-400', label: 'Stamina' },
  { text: '#fôlego', icon: Zap, color: 'text-green-400', label: 'Fôlego' },
  { text: '#folego', icon: Zap, color: 'text-green-400', label: 'Fôlego' },
  { text: '#sanidade', icon: Brain, color: 'text-teal-400', label: 'Sanidade' },
  { text: '#corrupção', icon: Skull, color: 'text-purple-500', label: 'Corrupção' },
  { text: '#corrupcao', icon: Skull, color: 'text-purple-500', label: 'Corrupção' },

  // --- Perícias ---
  { text: '#acrobacia', icon: Hand, color: 'text-emerald-500', label: 'Acrobacia' },
  { text: '#furtividade', icon: Hand, color: 'text-emerald-500', label: 'Furtividade' },
  { text: '#pontaria', icon: Hand, color: 'text-emerald-500', label: 'Pontaria' },
  { text: '#atletismo', icon: Sword, color: 'text-orange-500', label: 'Atletismo' },
  { text: '#intimidação', icon: Sword, color: 'text-orange-500', label: 'Intimidação' },
  { text: '#intimidacao', icon: Sword, color: 'text-orange-500', label: 'Intimidação' },
  { text: '#percepção', icon: Brain, color: 'text-blue-500', label: 'Percepção' },
  { text: '#percepcao', icon: Brain, color: 'text-blue-500', label: 'Percepção' },
  { text: '#sobrevivência', icon: Brain, color: 'text-blue-500', label: 'Sobrevivência' },
  { text: '#sobrevivencia', icon: Brain, color: 'text-blue-500', label: 'Sobrevivência' },
  { text: '#medicina', icon: Brain, color: 'text-blue-500', label: 'Medicina' },
  { text: '#presença', icon: Flame, color: 'text-amber-500', label: 'Presença' },
  { text: '#presenca', icon: Flame, color: 'text-amber-500', label: 'Presença' },

  // --- Efeitos / Condições (Badges) ---
  { text: '#sangramento', icon: Activity, color: 'text-red-600', label: 'Sangramento' },
  { text: '#sangrando', icon: Activity, color: 'text-red-600', label: 'Sangrando' },
  { text: '#congelado', icon: Droplets, color: 'text-cyan-400', label: 'Congelado' },
  { text: '#eletrocutado', icon: Zap, color: 'text-yellow-300', label: 'Eletrocutado' },
  { text: '#envenenado', icon: Beaker, color: 'text-green-500', label: 'Envenenado' },
  { text: '#exausto', icon: Heart, color: 'text-zinc-500', label: 'Exausto' },
  { text: '#queimando', icon: Flame, color: 'text-orange-500', label: 'Queimando' },
  { text: '#queimado', icon: Flame, color: 'text-orange-500', label: 'Queimado' },
  { text: '#louco', icon: Skull, color: 'text-pink-500', label: 'Louco' },
  { text: '#corte', icon: Sword, color: 'text-zinc-400', label: 'Corte' },
  { text: '#paralisado', icon: Zap, color: 'text-yellow-400', label: 'Paralisado' },
  { text: '#nojo', icon: Beaker, color: 'text-lime-500', label: 'Nojo' },
  { text: '#cego', icon: Eye, color: 'text-zinc-600', label: 'Cego' },
  { text: '#surdo', icon: VolumeX, color: 'text-zinc-400', label: 'Surdo' },
  { text: '#infecção', icon: Skull, color: 'text-emerald-600', label: 'Infecção' },
  { text: '#infeccao', icon: Skull, color: 'text-emerald-600', label: 'Infecção' },
  { text: '#amedrontado', icon: Brain, color: 'text-indigo-400', label: 'Amedrontado' },
  { text: '#corrosão', icon: Beaker, color: 'text-yellow-600', label: 'Corrosão' },
  { text: '#corrosao', icon: Beaker, color: 'text-yellow-600', label: 'Corrosão' },
  { text: '#amaldiçoado', icon: Skull, color: 'text-purple-700', label: 'Amaldiçoado' },
  { text: '#amaldicoado', icon: Skull, color: 'text-purple-700', label: 'Amaldiçoado' },
  { text: '#marcado', icon: Target, color: 'text-red-400', label: 'Marcado' },
  { text: '#vulnerável', icon: Target, color: 'text-purple-400', label: 'Vulnerável' },
  { text: '#vulneravel', icon: Target, color: 'text-purple-400', label: 'Vulnerável' },
  { text: '#rd', icon: Shield, color: 'text-zinc-300', label: 'RD' },

  // --- Tipos de Dano ---
  { text: '#fogo', icon: Flame, color: 'text-orange-500', label: 'Fogo' },
  { text: '#água', icon: Droplet, color: 'text-blue-400', label: 'Água' },
  { text: '#agua', icon: Droplet, color: 'text-blue-400', label: 'Água' },
  { text: '#trevas', icon: Moon, color: 'text-purple-900', label: 'Trevas' },
  { text: '#luz', icon: Sun, color: 'text-amber-300', label: 'Luz' },
  { text: '#planta', icon: Sprout, color: 'text-green-500', label: 'Planta' },
  { text: '#terra', icon: Mountain, color: 'text-yellow-700', label: 'Terra' },
  { text: '#perfurante', icon: Target, color: 'text-red-400', label: 'Perfurante' },
  { text: '#contusão', icon: Shield, color: 'text-zinc-300', label: 'Contusão' },
  { text: '#contusao', icon: Shield, color: 'text-zinc-300', label: 'Contusão' },
  { text: '#gelo', icon: Droplets, color: 'text-cyan-300', label: 'Gelo' },
  { text: '#raio', icon: Sparkles, color: 'text-yellow-300', label: 'Raio' },
  { text: '#ácido', icon: Beaker, color: 'text-lime-400', label: 'Ácido' },
  { text: '#acido', icon: Beaker, color: 'text-lime-400', label: 'Ácido' },
  { text: '#sonoro', icon: Volume2, color: 'text-cyan-500', label: 'Sonoro' },
  { text: '#mental', icon: Brain, color: 'text-pink-400', label: 'Mental' },
  { text: '#explosão', icon: Bomb, color: 'text-red-500', label: 'Explosão' },
  { text: '#explosao', icon: Bomb, color: 'text-red-500', label: 'Explosão' },
  { text: '#balístico', icon: Crosshair, color: 'text-zinc-500', label: 'Balístico' },
  { text: '#balistico', icon: Crosshair, color: 'text-zinc-500', label: 'Balístico' }
];

export function AutocompleteTextarea({ value = '', onChange, className = '', ...props }: AutocompleteTextareaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [matchStart, setMatchStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = TAG_SUGGESTIONS.filter(item => 
    item.text.toLowerCase().startsWith(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    adjustHeight();
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    
    // Check if the word before cursor starts with # or [
    const textBeforeCursor = text.substring(0, cursor);
    const match = textBeforeCursor.match(/(#[a-zçãõáéíóú]*|\[[a-zçãõáéíóú]*)$/i);
    
    if (match) {
      setQuery(match[0]);
      setMatchStart(match.index!);
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setIsOpen(false);
    }
  };

  const insertSuggestion = (suggestionText: string) => {
    if (!textareaRef.current) return;
    
    const cursor = textareaRef.current.selectionStart;
    const beforeMatch = value.substring(0, matchStart);
    const afterCursor = value.substring(cursor);
    
    // Fake an event to trigger parent onChange
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(textareaRef.current, beforeMatch + suggestionText + ' ' + afterCursor);
      const ev2 = new Event('input', { bubbles: true });
      textareaRef.current.dispatchEvent(ev2);
    }
    
    setIsOpen(false);
    
    // Focus and move cursor after the inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = matchStart + suggestionText.length + 1;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isOpen || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertSuggestion(filteredSuggestions[selectedIndex].text);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={`${className}`}
        {...props}
      />
      
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-64 max-h-60 overflow-y-auto bg-zinc-900 border border-amber-900/50 rounded-lg shadow-2xl mt-1 py-1 bottom-full mb-1 custom-scrollbar">
          {filteredSuggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            const isSelected = index === selectedIndex;
            return (
              <button
                key={suggestion.text}
                type="button"
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                  isSelected ? 'bg-amber-900/30 text-amber-100' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
                onClick={() => insertSuggestion(suggestion.text)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Icon className={`w-4 h-4 ${suggestion.color}`} />
                <span className="font-semibold">{suggestion.text}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
