import { Skull } from 'lucide-react';
import { CharacterPortrait } from '../rpg/CharacterPortrait';
import { useCharacterStore } from '../../store/characterStore';

export function CharacterHeader() {
  const {
    characterName, characterClass, characterFaction, characterCodename, characterPortrait,
    updateField
  } = useCharacterStore();

  return (
    <div className="flex gap-4 min-w-0">
      <CharacterPortrait 
        imageUrl={characterPortrait} 
        onImageChange={(val) => updateField('characterPortrait', val)} 
      />
      <div className="flex-1 space-y-2 min-w-0">
        <input
          type="text"
          value={characterName}
          onChange={(e) => updateField('characterName', e.target.value)}
          maxLength={40}
          placeholder="Nome do personagem"
          className="text-base sm:text-xl md:text-2xl text-amber-400 tracking-wide bg-transparent border-b border-transparent hover:border-amber-800/50 focus:border-amber-600 focus:outline-none w-full"
        />
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Classe:</span>
            <input
              type="text"
              value={characterClass}
              onChange={(e) => updateField('characterClass', e.target.value)}
              maxLength={25}
              placeholder="Classe"
              className="text-amber-300 bg-transparent border-b border-transparent hover:border-amber-800/50 focus:border-amber-600 focus:outline-none w-auto min-w-[80px]"
            />
          </div>
          <div className="w-px h-4 bg-zinc-700 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Facção:</span>
            <input
              type="text"
              value={characterFaction}
              onChange={(e) => updateField('characterFaction', e.target.value)}
              maxLength={25}
              placeholder="Facção"
              className="text-amber-300 bg-transparent border-b border-transparent hover:border-amber-800/50 focus:border-amber-600 focus:outline-none w-auto min-w-[80px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <Skull className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
          <input
            type="text"
            value={characterCodename}
            onChange={(e) => updateField('characterCodename', e.target.value)}
            maxLength={30}
            placeholder="Codinome"
            className="text-purple-400 bg-transparent border-b border-transparent hover:border-purple-800/50 focus:border-purple-600 focus:outline-none w-full italic"
          />
        </div>
      </div>
    </div>
  );
}
