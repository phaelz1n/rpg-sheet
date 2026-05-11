import { Skull } from 'lucide-react';

interface CharacterHeaderProps {
  characterName: string;
  characterClass: string;
  faction: string;
  onCharacterNameChange?: (value: string) => void;
  onCharacterClassChange?: (value: string) => void;
  onFactionChange?: (value: string) => void;
}

export function CharacterHeader({
  characterName,
  characterClass,
  faction,
  onCharacterNameChange,
  onCharacterClassChange,
  onFactionChange,
}: CharacterHeaderProps) {
  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-800 border-2 border-amber-900/50 p-6 rounded-lg shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Skull className="w-8 h-8 text-amber-600" />
        <h1 className="text-amber-500 tracking-wider uppercase">The Dark Path</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-amber-400/80 text-sm uppercase tracking-wide">Character Name</label>
          <input
            type="text"
            value={characterName}
            onChange={(e) => onCharacterNameChange?.(e.target.value)}
            className="w-full bg-black/40 border border-amber-900/30 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600 transition-colors"
            placeholder="Enter name..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-amber-400/80 text-sm uppercase tracking-wide">Class</label>
          <input
            type="text"
            value={characterClass}
            onChange={(e) => onCharacterClassChange?.(e.target.value)}
            className="w-full bg-black/40 border border-amber-900/30 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600 transition-colors"
            placeholder="Enter class..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-amber-400/80 text-sm uppercase tracking-wide">Faith/Faction</label>
          <input
            type="text"
            value={faction}
            onChange={(e) => onFactionChange?.(e.target.value)}
            className="w-full bg-black/40 border border-amber-900/30 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600 transition-colors"
            placeholder="Enter faction..."
          />
        </div>
      </div>
    </div>
  );
}
