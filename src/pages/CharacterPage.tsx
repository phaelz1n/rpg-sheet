import { useState, useEffect, useMemo, useCallback } from 'react';
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
    if (activeUsername && activeUsername !== 'admin') {
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
    if (!activeUsername || activeUsername === 'admin') return;
    if (store.isLoading || store.lastActionSource !== 'local') return;

    const timer = setTimeout(() => {
      store.saveCharacter();
    }, 2000);
    return () => clearTimeout(timer);
  }, [store, activeUsername]);

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

    if (type === 'weapon' && slot) {
      store.equipWeapon(slot as 'main' | 'off', {
        id: item.id,
        name: item.name,
        damage: item.damage,
        bonus: item.bonus.toString(),
        synergy: '',
        special: item.description || '',
        imageUrl: item.imageUrl
      });
    } else if (type === 'armor' && slot) {
      store.equipArmor(slot, item.id);
    } else if (slot?.startsWith('belt')) {
      const beltNum = slot.replace('belt', '');
      store.updateBeltSlot(beltNum, item.id);
    } else if (type === 'consumable') {
      const { inventory, inventoryCapacity } = store;
      const existing = inventory.find(i => i.globalItemId === item.id || i.name.toLowerCase() === item.name.toLowerCase());
      if (existing) {
        store.updateInventoryQuantity(existing.id, existing.quantity + 1);
      } else {
        if (inventory.length >= inventoryCapacity) {
          showToast('Mochila cheia!', 'error');
          return;
        }
        store.setInventory([...inventory, {
          id: Date.now().toString(),
          name: item.name,
          quantity: 1,
          icon: Gem,
          description: item.description || '',
          attributeType: item.attributeType,
          bonus: item.bonus,
          damage: item.damage,
          category: item.category,
          rarity: item.rarity,
          imageUrl: item.imageUrl,
          globalItemId: item.id
        } as any]);
      }
    }
    setItemSelectionModal({ isOpen: false, type: null });
  };

  const equippedArmor = [store.equipmentHead, store.equipmentNeck, store.equipmentChest, store.equipmentGloves, store.equipmentBelt, store.equipmentPants, store.equipmentBoots];
  const corruptionBonus = rpgItems
    .filter(item => item.category === 'armor' && (item.corruptionLimitBonus ?? 0) > 0 &&
      (equippedArmor.includes(item.id) || equippedArmor.includes(item.name)))
    .reduce((sum, item) => sum + (item.corruptionLimitBonus || 0), 0);
  
  const corruptionMax = store.corruptionBaseMax + corruptionBonus;
  const corruptionPercent = (store.corruption / corruptionMax) * 100;

  // Screen Shake System
  const [isShaking, setIsShaking] = useState(false);
  const triggerScreenShake = useCallback(() => {
    if (isShaking) return;
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  }, [isShaking]);

  const corruptionFilter = corruptionPercent > 80 ? 'grayscale-[0.6] sepia-[0.3] brightness-[0.7] contrast-[1.1] hue-rotate-[290deg]' :
                          corruptionPercent > 50 ? 'grayscale-[0.3] sepia-[0.1] brightness-[0.9]' :
                          '';

  return (
    <div className={`min-h-screen transition-all duration-1000 p-4 md:p-6 overflow-x-hidden relative ${
      isShaking ? 'animate-[shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both]' : ''
    } ${
      corruptionPercent > 80 ? 'bg-zinc-950' : 
      corruptionPercent > 50 ? 'bg-black' : 
      'bg-gradient-to-br from-zinc-950 via-stone-950 to-black'
    }`}>
      {/* Corruption Overlays */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <div className={`absolute inset-0 transition-opacity duration-1000 bg-[radial-gradient(circle,transparent_40%,rgba(48,0,48,0.4)_100%)] ${
          corruptionPercent > 30 ? 'opacity-100' : 'opacity-0'
        }`} />
        <div className={`absolute inset-0 transition-opacity duration-1000 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] mix-blend-overlay ${
          corruptionPercent > 60 ? 'opacity-50' : 'opacity-0'
        }`} />
        <div className={`absolute inset-0 transition-opacity duration-1000 shadow-[inset_0_0_150px_rgba(147,51,234,0.15)] ${
          corruptionPercent > 80 ? 'opacity-100 animate-pulse' : 'opacity-0'
        }`} />
      </div>

      <div className={`transition-all duration-1000 ${corruptionFilter}`}>

      {/* Top Bar */}
      <div className="max-w-[1600px] mx-auto mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-zinc-900/50 to-black/50 border border-amber-900/40 rounded-lg p-3 relative z-10">
        <div className="flex items-center gap-2 text-amber-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)] mr-1" />
          <span className="text-xs sm:text-sm font-medium">
            {adminViewUsername ? (
              <>Admin visualizando: <span className="font-bold text-purple-400 uppercase tracking-tight">{String(adminViewUsername)}</span></>
            ) : (
              <>Bem-vindo, <span className="font-bold uppercase tracking-tight text-amber-300">{String(currentUser || '')}</span>!</>
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
            "{typeof loreQuote === 'string' ? loreQuote : ''}"
          </div>
        </div>

        {/* HEADER SECTION (Portrait, Status, Corruption, Inspiration) */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-black/95 border-2 border-amber-900/60 rounded-xl p-4 md:p-6 shadow-2xl">
          <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
            <CharacterHeader />
            <StatusSection />

            {/* Corruption Gauge */}
            <div className="w-full xl:w-64">
              <CorruptionGauge
                current={Number(store.corruption || 0)}
                max={Number((store.corruptionBaseMax || 0) + corruptionBonus)}
                onCurrentChange={(val) => store.updateField('corruption', val)}
                onMaxChange={(val) => store.updateField('corruptionBaseMax', val - corruptionBonus)}
              />
            </div>

            {/* Inspiration */}
            <div className="w-full xl:w-auto flex flex-col items-center justify-center bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 sm:px-6 min-w-[120px] shadow-inner relative overflow-hidden group">
              <div className="flex items-center gap-2 text-amber-500 mb-1 relative z-10 font-bold">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em]">Inspiração</span>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <button onClick={() => store.updateField('inspiration', Math.max(0, (Number(store.inspiration) || 0) - 1))} className="text-amber-700 hover:text-amber-500 transition-colors text-xl font-bold px-2">-</button>
                <span className="text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">{String(store.inspiration || 0)}</span>
                <button onClick={() => store.updateField('inspiration', (Number(store.inspiration) || 0) + 1)} className="text-amber-700 hover:text-amber-500 transition-colors text-xl font-bold px-2">+</button>
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
                  name={String(store.mainWeapon.name || '')}
                  damage={store.mainWeapon.damage}
                  bonus={store.mainWeapon.bonus}
                  synergy={store.mainWeapon.synergy}
                  special={store.mainWeapon.special}
                  particles={rpgItems.find(i => i.id === store.mainWeapon.id || i.name.toLowerCase() === store.mainWeapon.name?.toLowerCase())?.particles}
                  rarity={rpgItems.find(i => i.id === store.mainWeapon.id || i.name.toLowerCase() === store.mainWeapon.name?.toLowerCase())?.rarity}
                  imageUrl={store.mainWeapon.imageUrl || rpgItems.find(i => i.id === store.mainWeapon.id || i.name.toLowerCase() === store.mainWeapon.name?.toLowerCase())?.imageUrl}
                  onClear={() => store.equipWeapon('main', { id: '', name: '', damage: '', bonus: '', synergy: '', special: '', imageUrl: '' })}
                  onAddClick={() => handleOpenSelectionModal('weapon', 'main')}
                  onImpact={triggerScreenShake}
                />
                <WeaponCard
                  slot="off"
                  name={String(store.offWeapon.name || '')}
                  damage={store.offWeapon.damage}
                  bonus={store.offWeapon.bonus}
                  synergy={store.offWeapon.synergy}
                  special={store.offWeapon.special}
                  particles={rpgItems.find(i => i.id === store.offWeapon.id || i.name.toLowerCase() === store.offWeapon.name?.toLowerCase())?.particles}
                  rarity={rpgItems.find(i => i.id === store.offWeapon.id || i.name.toLowerCase() === store.offWeapon.name?.toLowerCase())?.rarity}
                  imageUrl={store.offWeapon.imageUrl || rpgItems.find(i => i.id === store.offWeapon.id || i.name.toLowerCase() === store.offWeapon.name?.toLowerCase())?.imageUrl}
                  onClear={() => store.equipWeapon('off', { id: '', name: '', damage: '', bonus: '', synergy: '', special: '', imageUrl: '' })}
                  onAddClick={() => handleOpenSelectionModal('weapon', 'off')}
                  onImpact={triggerScreenShake}
                />
                <DamageReductionBadge value={store.damageReduction} onValueChange={(val) => store.updateField('damageReduction', val)} />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Equipment, Belt, Curses, Inventory */}
          <div className="space-y-6">
            <CoinPouch />
            <BodyEquipmentSection onOpenModal={handleOpenSelectionModal} onImpact={triggerScreenShake} />
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
            <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-900/60 rounded-xl p-6 max-w-3xl w-full shadow-2xl relative">
              <button onClick={() => setShowTips(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3"><Info className="w-7 h-7" />Guia de Formatação e Tags</h2>
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar text-left">
                
                <section>
                  <h3 className="text-amber-500 font-bold mb-2 uppercase text-sm tracking-widest border-b border-amber-900/30 pb-1">Atributos e Recursos</h3>
                  <p className="text-zinc-400 text-[11px] mb-2">Digite estas hashtags no editor para exibir ícones inline:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      '#força', '#destreza', '#vigor', '#vontade', '#fé', '#ocultismo',
                      '#vida', '#mana', '#stamina', '#fôlego', '#sanidade', '#corrupção'
                    ].map(tag => (
                      <div key={tag} className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between gap-1">
                        <span className="text-zinc-500 font-mono text-[10px]">{tag}</span> <RichDescription text={tag} />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-emerald-500 font-bold mb-2 uppercase text-sm tracking-widest border-b border-emerald-900/30 pb-1">Perícias</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      '#acrobacia', '#furtividade', '#pontaria', '#atletismo', '#intimidação',
                      '#percepção', '#sobrevivência', '#medicina', '#presença'
                    ].map(tag => (
                      <div key={tag} className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between gap-1">
                        <span className="text-zinc-500 font-mono text-[10px]">{tag}</span> <RichDescription text={tag} />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-red-500 font-bold mb-2 uppercase text-sm tracking-widest border-b border-red-900/30 pb-1">Efeitos e Condições</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      '#sangramento', '#congelado', '#eletrocutado', '#envenenado', '#exausto',
                      '#queimado', '#louco', '#paralisado', '#nojo', '#cego',
                      '#surdo', '#infecção', '#amedrontado', '#corrosão', '#amaldiçoado',
                      '#marcado', '#vulnerável', '#rd'
                    ].map(tag => (
                      <div key={tag} className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between gap-1">
                        <span className="text-zinc-500 font-mono text-[10px]">{tag}</span> <RichDescription text={tag} />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-cyan-400 font-bold mb-2 uppercase text-sm tracking-widest border-b border-cyan-900/30 pb-1">Tipos de Dano</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      '#fogo', '#água', '#trevas', '#luz', '#planta', '#terra', '#corte',
                      '#perfurante', '#contusão', '#gelo', '#raio', '#ácido', '#sonoro',
                      '#mental', '#explosão', '#balístico'
                    ].map(tag => (
                      <div key={tag} className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between gap-1">
                        <span className="text-zinc-500 font-mono text-[10px]">{tag}</span> <RichDescription text={tag} />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-zinc-950/80 p-4 border border-amber-900/40 rounded-lg">
                  <h3 className="text-amber-400 font-bold mb-3 uppercase text-xs tracking-wider flex items-center gap-2">
                    ⚡ Tabela de Afinidade Elemental (Estilo Pokémon)
                  </h3>
                  <p className="text-[11px] text-zinc-400 mb-3">
                    Os tipos de dano elemental causam **Dano Dobrado (2x)** ou **Metade do Dano (0.5x)** contra inimigos afinados a certos elementos:
                  </p>
                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <div>🔥 <span className="text-orange-400 font-bold">Fogo:</span> Forte contra <span className="text-cyan-300">#gelo</span> e <span className="text-green-500">#planta</span>. Fraco contra <span className="text-blue-400">#água</span> e <span className="text-yellow-700">#terra</span>.</div>
                    <div>💧 <span className="text-blue-400 font-bold">Água:</span> Forte contra <span className="text-orange-500">#fogo</span>, <span className="text-yellow-700">#terra</span> e <span className="text-lime-400">#ácido</span>. Fraco contra <span className="text-green-500">#planta</span> e <span className="text-yellow-300">#raio</span>.</div>
                    <div>❄️ <span className="text-cyan-300 font-bold">Gelo:</span> Forte contra <span className="text-green-500">#planta</span> e <span className="text-yellow-700">#terra</span>. Fraco contra <span className="text-orange-500">#fogo</span> e <span className="text-yellow-300">#raio</span>.</div>
                    <div>⚡ <span className="text-yellow-300 font-bold">Raio:</span> Forte contra <span className="text-blue-400">#água</span>, <span className="text-cyan-300">#gelo</span> e <span className="text-zinc-500">#balístico</span>. Fraco contra <span className="text-yellow-700">#terra</span> e <span className="text-green-500">#planta</span>.</div>
                    <div>⛰️ <span className="text-yellow-700 font-bold">Terra:</span> Forte contra <span className="text-yellow-300">#raio</span>, <span className="text-lime-400">#ácido</span> e <span className="text-orange-500">#fogo</span>. Fraco contra <span className="text-blue-400">#água</span>, <span className="text-cyan-300">#gelo</span> e <span className="text-green-500">#planta</span>.</div>
                    <div>🌿 <span className="text-green-500 font-bold">Planta:</span> Forte contra <span className="text-blue-400">#água</span> e <span className="text-yellow-700">#terra</span>. Fraco contra <span className="text-orange-500">#fogo</span>, <span className="text-cyan-300">#gelo</span> e <span className="text-lime-400">#ácido</span>.</div>
                    <div>🧪 <span className="text-lime-400 font-bold">Ácido:</span> Forte contra <span className="text-green-500">#planta</span>, <span className="text-zinc-500">#balístico</span> e <span className="text-zinc-300">#contusão</span>. Fraco contra <span className="text-blue-400">#água</span> e <span className="text-yellow-700">#terra</span>.</div>
                    <div>☀️ <span className="text-amber-300 font-bold">Luz:</span> Forte contra <span className="text-purple-900">#trevas</span> e <span className="text-pink-400">#mental</span>. Fraco contra <span className="text-purple-900">#trevas</span>.</div>
                    <div>🌙 <span className="text-purple-900 font-bold">Trevas:</span> Forte contra <span className="text-amber-300">#luz</span> e <span className="text-pink-400">#mental</span>. Fraco contra <span className="text-amber-300">#luz</span>.</div>
                    <div>🧠 <span className="text-pink-400 font-bold">Mental:</span> Forte contra <span className="text-zinc-500">#balístico</span>, <span className="text-zinc-400">#corte</span>, <span className="text-red-400">#perfurante</span> e <span className="text-zinc-300">#contusão</span>. Fraco contra <span className="text-purple-900">#trevas</span> e <span className="text-amber-300">#luz</span>.</div>
                    <div>🔊 <span className="text-cyan-500 font-bold">Sonoro:</span> Forte contra <span className="text-pink-400">#mental</span> e <span className="text-cyan-300">#gelo</span>. Fraco contra <span className="text-yellow-700">#terra</span>.</div>
                    <div>💥 <span className="text-red-500 font-bold">Explosão:</span> Forte contra <span className="text-yellow-700">#terra</span> e <span className="text-zinc-300">#contusão</span>. Fraco contra <span className="text-cyan-300">#gelo</span> and <span className="text-blue-400">#água</span>.</div>
                    <div className="mt-2 border-t border-zinc-800 pt-2 text-[10px] text-zinc-500">
                      * Danos físicos convencionais (<span className="text-zinc-400">#corte</span>, <span className="text-zinc-400">#perfurante</span>, <span className="text-zinc-400">#contusão</span> e <span className="text-zinc-400">#balístico</span>) interagem conforme o equipamento defensivo e armaduras do alvo.
                    </div>
                  </div>
                </section>

              </div>
              <button onClick={() => setShowTips(false)} className="w-full mt-8 py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg transition-colors">Entendido!</button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
