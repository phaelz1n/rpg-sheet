import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { ttrpgApi } from '../lib/ttrpg-api';
import { seedDefaultItems } from '../lib/seeding-service';

import { useCharacterStore } from '../store/characterStore';
import { useGlobalStore } from '../store/globalStore';

// Modular Components
import { CharacterHeader } from '../components/character/CharacterHeader';
import { StatusSection } from '../components/character/StatusSection';
import { AttributesSection } from '../components/character/AttributesSection';
import { SkillsSection } from '../components/character/SkillsSection';
import { CombatAbilitiesSection } from '../components/character/CombatAbilitiesSection';
import { BodyEquipmentSection } from '../components/character/BodyEquipmentSection';
import { BeltSection } from '../components/character/BeltSection';
import { CursesSection } from '../components/character/CursesSection';
import { InventorySection } from '../components/character/InventorySection';
import { CoinPouch } from '../components/character/CoinPouch';

// Shared RPG Components
import { CorruptionGauge } from '../components/rpg/CorruptionGauge';
import { WeaponCard } from '../components/rpg/WeaponCard';
import { DamageReductionBadge } from '../components/rpg/DamageReductionBadge';
import { ItemSelectionModal } from '../components/rpg/ItemSelectionModal';
import { RichDescription } from '../components/rpg/RichDescription';

import {
  Sparkles, Skull, Sword, Shield, LogOut, Info, Database, X, Gem
} from 'lucide-react';

import { RPGItem } from '../types/rpg';

const LORE_QUOTES = [
  "Milagres ainda existem… mas têm preço.",
  "A fé deixou de unir — agora divide, corrompe e enlouquece.",
  "O céu se partiu, a luz desapareceu… e o divino sangrou.",
  "Criaturas nascem da distorção espiritual, alimentadas por medo, culpa e pecado.",
  "A linha entre bênção e maldição já não existe.",
  "Fé ou loucura… ambas matam.",
  "Fragmentos do corpo divino ainda caem do céu… e onde eles tocam, a realidade se quebra.",
  "O mundo mergulhou em trevas constantes após a Noite da Ruína.",
  "Servir, resistir ou sobreviver.",
  "A Igreja prega ordem… mas muitos sussurram que sua 'luz' já não é pura.",
  "O Culto não teme a escuridão… eles a abraçam."
];

export function CharacterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, isAdmin, logout } = useAuth();
  const { showToast, showConfirm } = useUI();

  const store = useCharacterStore();
  const globalStore = useGlobalStore();
  const { rpgItems } = globalStore;

  // UI States (Local to CharacterPage for managing modals and pagination)
  const [loreQuote, setLoreQuote] = useState('');
  const [inventoryPage, setInventoryPage] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [itemSelectionModal, setItemSelectionModal] = useState<{
    isOpen: boolean;
    type: 'weapon' | 'armor' | 'consumable' | null;
    slot?: string;
  }>({ isOpen: false, type: null });

  // Check if admin is viewing another user's character
  const adminViewUsername = searchParams.get('admin-view');
  const activeUsername = (isAdmin && adminViewUsername) ? adminViewUsername : currentUser;

  useEffect(() => {
    const randomQuote = LORE_QUOTES[Math.floor(Math.random() * LORE_QUOTES.length)];
    setLoreQuote(randomQuote);
  }, []);

  // Real-time synchronization
  useEffect(() => {
    if (activeUsername) {
      store.loadCharacter(activeUsername);
      globalStore.loadGlobalItems();
      
      const unsubGlobal = globalStore.setupRealtimeSubscription();
      const unsubChar = ttrpgApi.subscribeToCharacter(activeUsername, (payload) => {
        if (payload.new && payload.new.character_data) {
          store.loadCharacter(activeUsername);
        }
      });
      
      return () => {
        unsubGlobal();
        unsubChar();
      };
    }
  }, [activeUsername]);

  // Debounced auto-save
  useEffect(() => {
    if (!activeUsername) return;
    const timer = setTimeout(() => {
      store.saveCharacter();
    }, 2000);
    return () => clearTimeout(timer);
  }, [store]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const returnToAdminPanel = () => {
    navigate('/admin');
  };

  const handleSeed = async () => {
    showConfirm('Deseja carregar a lista de itens padrão?', async () => {
      const createdCount = await seedDefaultItems();
      if (createdCount !== null) {
        showToast(`${createdCount} novos itens carregados com sucesso!`, 'success');
        await globalStore.loadGlobalItems();
      }
    });
  };

  // Selection Modal Actions
  const handleOpenSelectionModal = (type: 'weapon' | 'armor' | 'consumable', slot?: string) => {
    setItemSelectionModal({ isOpen: true, type, slot });
  };

  const handleItemSelect = (item: any) => {
    const rpgItem = item as RPGItem;
    const { type, slot } = itemSelectionModal;

    if (slot?.startsWith('belt') && slot !== 'belt') {
      const beltNum = slot.replace('belt', '');
      store.updateBeltSlot(beltNum, rpgItem.name);
    } else if (type === 'weapon' && slot) {
      const weaponData = {
        name: rpgItem.name,
        damage: rpgItem.damage,
        bonus: `+${rpgItem.bonus}`,
        synergy: '',
        special: rpgItem.description || ''
      };
      store.equipWeapon(slot as 'main' | 'off', weaponData);
    } else if (type === 'armor' && slot) {
      store.equipArmor(slot, rpgItem.name);
    } else if (type === 'consumable') {
      const { inventory, inventoryCapacity } = store;
      const existing = inventory.find(i => i.name === rpgItem.name);
      if (existing) {
        store.updateInventoryQuantity(existing.id, existing.quantity + 1);
      } else {
        if (inventory.length >= inventoryCapacity) {
          showToast('Mochila cheia!', 'error');
          return;
        }
        store.setInventory([...inventory, {
          id: Date.now().toString(),
          name: rpgItem.name,
          quantity: 1,
          icon: Gem,
          description: rpgItem.description || '',
          attributeType: rpgItem.attributeType,
          bonus: rpgItem.bonus,
          damage: rpgItem.damage,
          category: rpgItem.category,
          rarity: rpgItem.rarity
        } as any]);
      }
    }
    setItemSelectionModal({ isOpen: false, type: null });
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 p-4 md:p-6 overflow-x-hidden relative ${
      store.corruption > 80 ? 'bg-zinc-950 grayscale-[0.4] brightness-[0.6]' : 
      store.corruption > 50 ? 'bg-black grayscale-[0.1] brightness-[0.9]' : 
      'bg-gradient-to-br from-zinc-950 via-stone-950 to-black'
    }`}>
      {/* Corruption Overlays */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <div className={`absolute inset-0 transition-opacity duration-1000 bg-[radial-gradient(circle,transparent_40%,rgba(48,0,48,0.4)_100%)] ${
          store.corruption > 30 ? 'opacity-100' : 'opacity-0'
        }`} />
        <div className={`absolute inset-0 transition-opacity duration-1000 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] mix-blend-overlay ${
          store.corruption > 60 ? 'opacity-50' : 'opacity-0'
        }`} />
        <div className={`absolute inset-0 transition-opacity duration-1000 shadow-[inset_0_0_150px_rgba(147,51,234,0.15)] ${
          store.corruption > 80 ? 'opacity-100 animate-pulse' : 'opacity-0'
        }`} />
      </div>

      {/* Top Bar */}
      <div className="max-w-[1600px] mx-auto mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-zinc-900/50 to-black/50 border border-amber-900/40 rounded-lg p-3 relative z-10">
        <div className="flex items-center gap-2 text-amber-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)] mr-1" />
          <span className="text-xs sm:text-sm font-medium">
            {adminViewUsername ? (
              <>Admin visualizando: <span className="font-bold text-purple-400 uppercase tracking-tight">{adminViewUsername}</span></>
            ) : (
              <>Bem-vindo, <span className="font-bold uppercase tracking-tight text-amber-300">{currentUser}</span>!</>
            )}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {isAdmin && (
            <button onClick={handleSeed} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg flex items-center gap-2 border border-zinc-700 shadow-lg">
              <Database className="w-4 h-4 text-emerald-500" />
            </button>
          )}
          {isAdmin && (
            <button
              onClick={returnToAdminPanel}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-900/50 border border-purple-700/50 rounded-lg text-purple-300 hover:bg-purple-900/70 transition-colors text-xs sm:text-sm font-bold"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Painel Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}

          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-900/50 border border-emerald-700/50 rounded-lg text-emerald-300 hover:bg-emerald-900/70 transition-colors text-xs sm:text-sm font-bold"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Lojas NPC</span>
            <span className="sm:hidden">Loja</span>
          </button>
          <button onClick={() => setShowTips(true)} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 hover:bg-zinc-700/70 transition-colors text-xs sm:text-sm">
            <Info className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Dicas</span>
            <span className="sm:hidden">Dicas</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-red-300 hover:bg-red-900/70 transition-colors text-xs sm:text-sm">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
            <span className="sm:hidden">Sair</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-center -mt-2">
          <div className="bg-black/40 border border-amber-900/20 rounded px-4 py-1.5 italic text-[10px] sm:text-xs text-zinc-500 tracking-wide text-center max-w-2xl">
            "{loreQuote}"
          </div>
        </div>

        {/* HEADER SECTION (Portrait, Status, Corruption, Inspiration) */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-black/95 border-2 border-amber-900/60 rounded-xl p-4 md:p-6 shadow-2xl">
          <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
            <CharacterHeader />
            <StatusSection />

            {/* Corruption Gauge */}
            <div className="w-full xl:w-64">
              {(() => {
                const corruptionBonus = rpgItems
                  .filter(item => item.category === 'armor' && (item.corruptionLimitBonus ?? 0) > 0 &&
                    [store.equipmentHead, store.equipmentNeck, store.equipmentChest, store.equipmentGloves, store.equipmentBelt, store.equipmentPants, store.equipmentBoots].includes(item.name))
                  .reduce((sum, item) => sum + (item.corruptionLimitBonus || 0), 0);
                
                return (
                  <CorruptionGauge
                    current={store.corruption}
                    max={store.corruptionBaseMax + corruptionBonus}
                    onCurrentChange={(val) => store.updateField('corruption', val)}
                    onMaxChange={(val) => store.updateField('corruptionBaseMax', val - corruptionBonus)}
                  />
                );
              })()}
            </div>

            {/* Inspiration */}
            <div className="w-full xl:w-auto flex flex-col items-center justify-center bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 sm:px-6 min-w-[120px] shadow-inner relative overflow-hidden group">
              <div className="flex items-center gap-2 text-amber-500 mb-1 relative z-10 font-bold">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em]">Inspiração</span>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <button onClick={() => store.updateField('inspiration', Math.max(0, store.inspiration - 1))} className="text-amber-700 hover:text-amber-500 transition-colors text-xl font-bold px-2">-</button>
                <span className="text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">{store.inspiration}</span>
                <button onClick={() => store.updateField('inspiration', store.inspiration + 1)} className="text-amber-700 hover:text-amber-500 transition-colors text-xl font-bold px-2">+</button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Attributes, Skills, Combat */}
          <div className="xl:col-span-2 space-y-6">
            <AttributesSection />
            <SkillsSection />
            <CombatAbilitiesSection />

            {/* EQUIPPED WEAPONS */}
            <section>
              <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 text-sm sm:text-base font-bold">
                <Sword className="w-5 h-5" />
                Armas Equipadas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <WeaponCard
                  slot="main"
                  name={store.mainWeapon.name}
                  damage={store.mainWeapon.damage}
                  bonus={store.mainWeapon.bonus}
                  synergy={store.mainWeapon.synergy}
                  special={store.mainWeapon.special}
                  onNameChange={(value) => store.equipWeapon('main', { ...store.mainWeapon, name: value })}
                  onDamageChange={(value) => store.equipWeapon('main', { ...store.mainWeapon, damage: value })}
                  onBonusChange={(value) => store.equipWeapon('main', { ...store.mainWeapon, bonus: value })}
                  onClear={() => store.equipWeapon('main', { name: '', damage: '', bonus: '', synergy: '', special: '' })}
                  onAddClick={() => handleOpenSelectionModal('weapon', 'main')}
                />
                <WeaponCard
                  slot="off"
                  name={store.offWeapon.name}
                  damage={store.offWeapon.damage}
                  bonus={store.offWeapon.bonus}
                  synergy={store.offWeapon.synergy}
                  special={store.offWeapon.special}
                  onNameChange={(value) => store.equipWeapon('off', { ...store.offWeapon, name: value })}
                  onDamageChange={(value) => store.equipWeapon('off', { ...store.offWeapon, damage: value })}
                  onBonusChange={(value) => store.equipWeapon('off', { ...store.offWeapon, bonus: value })}
                  onClear={() => store.equipWeapon('off', { name: '', damage: '', bonus: '', synergy: '', special: '' })}
                  onAddClick={() => handleOpenSelectionModal('weapon', 'off')}
                />
                <DamageReductionBadge value={store.damageReduction} onValueChange={(val) => store.updateField('damageReduction', val)} />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Equipment, Belt, Curses, Inventory */}
          <div className="space-y-6">
            <CoinPouch />
            <BodyEquipmentSection onOpenModal={handleOpenSelectionModal} />
            <BeltSection onOpenModal={handleOpenSelectionModal} />
            <CursesSection />
            <InventorySection 
              inventoryPage={inventoryPage} 
              onPageChange={setInventoryPage} 
              onOpenModal={handleOpenSelectionModal} 
            />
          </div>
        </div>

        {/* MODALS */}
        <ItemSelectionModal
          isOpen={itemSelectionModal.isOpen}
          title={
            itemSelectionModal.type === 'weapon' ? 'Selecionar Arma' :
            itemSelectionModal.type === 'armor' ? 'Selecionar Armadura' :
            'Selecionar Item'
          }
          items={rpgItems.filter(item => {
            if (itemSelectionModal.type === 'weapon') return item.category === 'weapon';
            if (itemSelectionModal.type === 'armor') return item.category === 'armor' && item.equipmentSlot === itemSelectionModal.slot;
            return true; // consumable
          })}
          onClose={() => setItemSelectionModal({ isOpen: false, type: null })}
          onSelect={handleItemSelect}
        />

        {showTips && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-900/60 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative">
              <button onClick={() => setShowTips(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3"><Info className="w-7 h-7" />Guia de Formatação e Tags</h2>
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                <section>
                  <h3 className="text-amber-500 font-bold mb-2 uppercase text-sm tracking-widest border-b border-amber-900/30 pb-1">Atributos (Ícones)</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['#força', '#destreza', '#vigor', '#vontade', '#fé', '#ocultismo', '#corrupção'].map(tag => (
                      <div key={tag} className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                        <span className="text-amber-400 font-mono">{tag}</span> <RichDescription text={tag} />
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="text-red-500 font-bold mb-2 uppercase text-sm tracking-widest border-b border-red-900/30 pb-1">Status e Condições</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { t: '#marcado', c: 'text-red-400' }, { t: '#envenenado', c: 'text-green-400' },
                      { t: '#queimando', c: 'text-orange-500' }, { t: '#congelado', c: 'text-cyan-400' },
                      { t: '#sangrando', c: 'text-red-600' }, { t: '#rd', c: 'text-zinc-400' }
                    ].map(tag => (
                      <div key={tag.t} className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                        <span className={`${tag.c} font-mono`}>{tag.t}</span> <RichDescription text={tag.t} />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <button onClick={() => setShowTips(false)} className="w-full mt-8 py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg transition-colors">Entendido!</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
