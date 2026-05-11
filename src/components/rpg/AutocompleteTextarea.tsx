import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Skull, Flame, Eye, Hand, Heart, Brain, Sword, Target, Droplet, Zap, Dumbbell, Beaker, Droplets, Activity } from 'lucide-react';

interface AutocompleteTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value'> {
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TAG_SUGGESTIONS = [
  // Hashtags
  { text: '#destreza', icon: Zap, color: 'text-emerald-400', label: 'Destreza' },
  { text: '#força', icon: Dumbbell, color: 'text-orange-500', label: 'Força' },
  { text: '#vigor', icon: Heart, color: 'text-red-500', label: 'Vigor' },
  { text: '#ocultismo', icon: Eye, color: 'text-purple-400', label: 'Ocultismo' },
  { text: '#fé', icon: Droplet, color: 'text-blue-400', label: 'Fé' },
  { text: '#vontade', icon: Brain, color: 'text-blue-500', label: 'Vontade' },
  { text: '#corrupção', icon: Skull, color: 'text-purple-500', label: 'Corrupção' },
  
  // Brackets (Status)
  { text: '[marcado]', icon: Target, color: 'text-red-400', label: 'Marcado' },
  { text: '[envenenado]', icon: Beaker, color: 'text-green-500', label: 'Envenenado' },
  { text: '[queimando]', icon: Flame, color: 'text-orange-500', label: 'Queimando' },
  { text: '[sangrando]', icon: Activity, color: 'text-red-600', label: 'Sangrando' },
  { text: '[congelado]', icon: Droplets, color: 'text-cyan-400', label: 'Congelado' },
  { text: '[paralisado]', icon: Zap, color: 'text-yellow-400', label: 'Paralisado' },
  { text: '[vulnerável]', icon: Target, color: 'text-purple-400', label: 'Vulnerável' },
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
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
        <div className="absolute z-50 w-64 max-h-60 overflow-y-auto bg-zinc-900 border border-amber-900/50 rounded-lg shadow-2xl mt-1 py-1 bottom-full mb-1">
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
