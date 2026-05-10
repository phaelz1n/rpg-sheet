import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ttrpgApi } from '../api/ttrpg-api';
import { CharacterPortrait } from '../components/ttrpg/CharacterPortrait';
import { StatusGauge } from '../components/ttrpg/StatusGauge';
import { CorruptionGauge } from '../components/ttrpg/CorruptionGauge';
import { HexAttributeCard } from '../components/ttrpg/HexAttributeCard';
import { SkillCard } from '../components/ttrpg/SkillCard';
import { AbilityCard } from '../components/ttrpg/AbilityCard';
import { WeaponCard } from '../components/ttrpg/WeaponCard';
import { DamageReductionBadge } from '../components/ttrpg/DamageReductionBadge';
import { EquipmentSlot } from '../components/ttrpg/EquipmentSlot';
import { BeltSlot } from '../components/ttrpg/BeltSlot';
import { InventorySlot } from '../components/ttrpg/InventorySlot';
import { EncumbranceBar } from '../components/ttrpg/EncumbranceBar';
import { ItemSelectionModal } from '../components/ttrpg/ItemSelectionModal';
import {
  Eye, Hand, Heart, Brain, Sword, Flame,
  Sparkles, Zap, Skull, Droplet, Target, Moon,
  Crown, Circle, ShirtIcon, GripHorizontal, CircleDot,
  Footprints, Pickaxe, Gem, Fish, Coins, Swords,
  LogOut, Save, User, Shield, Activity, EyeOff, Crosshair,
  Dumbbell, AlertTriangle, Search, Compass, Stethoscope,
  Book, Radio
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  icon: any;
  description: string;
}

interface Ability {
  id: string;
  name: string;
  type: 'action' | 'passive';
  icon: any;
  manaCost?: number;
  corruptionCost?: number;
  staminaCost?: number;
  test?: string;
  damage?: string;
  effect: string;
  backlash?: string;
}

interface RPGItem {
  id: string;
  name: string;
  attributeType: 'occultism' | 'dexterity' | 'vigor' | 'willpower' | 'strength' | 'faith';
  attributeIcon: any;
  bonus: number;
  damage: string;
  category: 'weapon' | 'armor' | 'consumable' | 'material';
  corruptionLimitBonus?: number;
  statBonus?: string;
  beltCapacity?: number;
  rarity?: string;
}

export function CharacterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, isAdmin, logout } = useAuth();

  // Check if admin is viewing another user's character
  const adminViewUsername = searchParams.get('admin-view');
  const activeUsername = (isAdmin && adminViewUsername) ? adminViewUsername : currentUser;

  // Modal state
  const [itemSelectionModal, setItemSelectionModal] = useState<{
    isOpen: boolean;
    type: 'weapon' | 'armor' | 'consumable' | null;
    slot?: string;
  }>({ isOpen: false, type: null });

  // Character info states
  const [characterName, setCharacterName] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [characterFaction, setCharacterFaction] = useState('');
  const [characterCodename, setCharacterCodename] = useState('');
  const [characterPortrait, setCharacterPortrait] = useState('');

  // Status states
  const [health, setHealth] = useState(0);
  const [maxHealth, setMaxHealth] = useState(10);
  const [sanity, setSanity] = useState(0);
  const [maxSanity, setMaxSanity] = useState(10);
  const [mana, setMana] = useState(0);
  const [maxMana, setMaxMana] = useState(10);
  const [stamina, setStamina] = useState(0);
  const [maxStamina, setMaxStamina] = useState(6);
  const [corruption, setCorruption] = useState(0);
  const [corruptionBaseMax, setCorruptionBaseMax] = useState(10);
  const [damageReduction, setDamageReduction] = useState(0);
  const [inspiration, setInspiration] = useState(0);

  // Attribute states
  const [occultism, setOccultism] = useState(0);
  const [dexterity, setDexterity] = useState(0);
  const [vigor, setVigor] = useState(0);
  const [willpower, setWillpower] = useState(0);
  const [strength, setStrength] = useState(0);
  const [faith, setFaith] = useState(0);

  // Skills states (Perícias)
  const [skills, setSkills] = useState({
    acrobacia: 0,
    furtividade: 0,
    pontaria: 0,
    atletismo: 0,
    intimidacao: 0,
    percepcao: 0,
    sobrevivencia: 0,
    medicina: 0,
    corrupcao: 0,
    presenca: 0
  });

  const updateSkill = (skill: string, value: number) => {
    setSkills(prev => ({ ...prev, [skill]: value }));
  };

  // Abilities state
  const [abilities, setAbilities] = useState<Ability[]>([]);

  // Equipment states
  const [equipmentHead, setEquipmentHead] = useState('');
  const [equipmentNeck, setEquipmentNeck] = useState('');
  const [equipmentChest, setEquipmentChest] = useState('');
  const [equipmentGloves, setEquipmentGloves] = useState('');
  const [equipmentBelt, setEquipmentBelt] = useState('');
  const [equipmentPants, setEquipmentPants] = useState('');
  const [equipmentBoots, setEquipmentBoots] = useState('');

  // Belt slots state (up to 8 to support large belt capacity items)
  const [beltSlot1, setBeltSlot1] = useState('');
  const [beltSlot2, setBeltSlot2] = useState('');
  const [beltSlot3, setBeltSlot3] = useState('');
  const [beltSlot4, setBeltSlot4] = useState('');
  const [beltSlot5, setBeltSlot5] = useState('');
  const [beltSlot6, setBeltSlot6] = useState('');
  const [beltSlot7, setBeltSlot7] = useState('');
  const [beltSlot8, setBeltSlot8] = useState('');

  // Curses/Marks states
  const [curses, setCurses] = useState<{id: string, title: string, content: string}[]>([]);

  // Weapon states
  const [mainWeapon, setMainWeapon] = useState({
    name: '',
    damage: '',
    bonus: ''
  });
  const [offWeapon, setOffWeapon] = useState({
    name: '',
    damage: '',
    bonus: ''
  });

  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const updateItemQuantity = (id: string, newQuantity: number) => {
    setInventory(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
    ));
  };

  const deleteItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const updateAbility = (id: string, field: string, value: any) => {
    setAbilities(prev => prev.map(ability =>
      ability.id === id ? { ...ability, [field]: value } : ability
    ));
  };

  // Global Attributes for items
  const [globalAttributes, setGlobalAttributes] = useState({
    occultism: 0,
    dexterity: 0,
    vigor: 0,
    willpower: 0,
    strength: 0,
    faith: 0
  });

  const updateGlobalAttribute = (attribute: string, value: number) => {
    setGlobalAttributes(prev => ({ ...prev, [attribute]: value }));
  };

  // RPG Items state (loaded from global items)
  const [rpgItems, setRpgItems] = useState<RPGItem[]>([]);

  // Load global items from database
  const loadGlobalItems = async () => {
    try {
      const response = await ttrpgApi.getAllItems();
      if (response.items) {
        const iconMap: Record<string, any> = {
          occultism: Eye,
          dexterity: Hand,
          vigor: Heart,
          willpower: Brain,
          strength: Sword,
          faith: Flame
        };

        const convertedItems = response.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          attributeType: item.attributeType || 'dexterity',
          attributeIcon: iconMap[item.attributeType] || Hand,
          bonus: item.bonus || 0,
          damage: item.damage || '',
          category: item.type === 'weapon' ? 'weapon' : 
                    item.type === 'armor' ? 'armor' : 
                    item.type === 'material' ? 'material' : 'consumable',
          corruptionLimitBonus: item.corruptionLimitBonus || 0,
          statBonus: item.statBonus || '',
          beltCapacity: item.beltCapacity || 0,
          rarity: item.rarity || 'common'
        }));

        setRpgItems(convertedItems);
      }
    } catch (error) {
      console.error('Error loading global items:', error);
    }
  };

  useEffect(() => {
    loadGlobalItems();
  }, []);

  const equipItemAsWeapon = (item: RPGItem, slot: 'main' | 'off') => {
    const weaponData = {
      name: item.name,
      damage: item.damage,
      bonus: `+${item.bonus}`
    };

    if (slot === 'main') {
      setMainWeapon(weaponData);
    } else {
      setOffWeapon(weaponData);
    }
  };

  const equipItemAsArmor = (item: RPGItem, slot: string) => {
    if (slot === 'head') setEquipmentHead(item.name);
    else if (slot === 'neck') setEquipmentNeck(item.name);
    else if (slot === 'chest') setEquipmentChest(item.name);
    else if (slot === 'gloves') setEquipmentGloves(item.name);
    else if (slot === 'belt') setEquipmentBelt(item.name);
    else if (slot === 'pants') setEquipmentPants(item.name);
    else if (slot === 'boots') setEquipmentBoots(item.name);
  };

  const addItemToInventory = (item: RPGItem) => {
    const iconMap: Record<string, any> = {
      occultism: Eye,
      dexterity: Hand,
      vigor: Heart,
      willpower: Brain,
      strength: Sword,
      faith: Flame
    };

    const newInventoryItem: InventoryItem = {
      id: Date.now().toString(),
      name: item.name,
      quantity: 1,
      icon: iconMap[item.attributeType],
      description: `Bônus: +${item.bonus}, Dano: ${item.damage}`
    };
    setInventory(prev => [...prev, newInventoryItem]);
  };

  const saveCharacterData = async () => {
    if (!activeUsername) {
      console.error('Nenhum usuário ativo para salvar');
      return;
    }

    try {
      const abilitiesForSave = abilities.map(({ icon, ...rest }) => rest);
      const rpgItemsForSave = rpgItems.map(({ attributeIcon, ...rest }) => rest);
      const inventoryForSave = inventory.map(({ icon, ...rest }) => rest);

      const characterData = {
        characterName,
        characterClass,
        characterFaction,
        characterCodename,
        characterPortrait,
        health,
        maxHealth,
        sanity,
        maxSanity,
        mana,
        maxMana,
        stamina,
        maxStamina,
        corruption,
        corruptionBaseMax,
        damageReduction,
        inspiration,
        curses,
        occultism,
        dexterity,
        vigor,
        willpower,
        strength,
        faith,
        skills,
        abilities: abilitiesForSave,
        equipmentHead,
        equipmentNeck,
        equipmentChest,
        equipmentGloves,
        equipmentBelt,
        equipmentPants,
        equipmentBoots,
        beltSlot1,
        beltSlot2,
        beltSlot3,
        beltSlot4,
        beltSlot5,
        beltSlot6,
        beltSlot7,
        beltSlot8,
        mainWeapon,
        offWeapon,
        inventory: inventoryForSave,
        rpgItems: rpgItemsForSave,
        globalAttributes
      };

      await ttrpgApi.saveCharacter(activeUsername, characterData);
      console.log(`Dados salvos para o usuário: ${activeUsername}`);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!activeUsername) return;

    const timer = setTimeout(() => {
      saveCharacterData();
    }, 2000); // Salva após 2 segundos de inatividade

    return () => clearTimeout(timer);
  }, [
    characterName, characterClass, characterFaction, characterCodename, characterPortrait,
    health, maxHealth, sanity, maxSanity, mana, maxMana, stamina, maxStamina,
    corruption, corruptionBaseMax, damageReduction,
    occultism, dexterity, vigor, willpower, strength, faith,
    skills, abilities, equipmentHead, equipmentNeck, equipmentChest,
    equipmentGloves, equipmentBelt, equipmentPants, equipmentBoots,
    beltSlot1, beltSlot2, beltSlot3, beltSlot4, beltSlot5, beltSlot6, beltSlot7, beltSlot8,
    mainWeapon, offWeapon, inventory, globalAttributes, inspiration, curses
  ]);

  const loadCharacterData = async (username: string) => {
    console.log(`Carregando dados para o usuário: ${username}`);

    try {
      const response = await ttrpgApi.getCharacter(username);

      if (response.exists && response.data) {
        console.log('Dados encontrados, carregando...');
        const data = response.data;

        const attributeIconMap: Record<string, any> = {
          occultism: Eye,
          dexterity: Hand,
          vigor: Heart,
          willpower: Brain,
          strength: Sword,
          faith: Flame
        };

      setCharacterName(data.characterName || '');
      setCharacterClass(data.characterClass || '');
      setCharacterFaction(data.characterFaction || '');
      setCharacterCodename(data.characterCodename || '');
      setCharacterPortrait(data.characterPortrait || '');
      setHealth(data.health ?? 0);
      setMaxHealth(data.maxHealth ?? 10);
      setSanity(data.sanity ?? 0);
      setMaxSanity(data.maxSanity ?? 10);
      setMana(data.mana ?? 0);
      setMaxMana(data.maxMana ?? 10);
      setStamina(data.stamina ?? 0);
      setMaxStamina(data.maxStamina ?? 6);
      setCorruption(data.corruption ?? 0);
      setCorruptionBaseMax(data.corruptionBaseMax ?? 10);
      setDamageReduction(data.damageReduction ?? 0);
      setInspiration(data.inspiration ?? 0);
      setCurses(data.curses ?? []);
      setOccultism(data.occultism ?? 0);
      setDexterity(data.dexterity ?? 0);
      setVigor(data.vigor ?? 0);
      setWillpower(data.willpower ?? 0);
      setStrength(data.strength ?? 0);
      setFaith(data.faith ?? 0);
      setSkills(data.skills || {
        acrobacia: 0,
        furtividade: 0,
        pontaria: 0,
        atletismo: 0,
        intimidacao: 0,
        percepcao: 0,
        sobrevivencia: 0,
        medicina: 0,
        corrupcao: 0,
        presenca: 0
      });

      const loadedAbilities = data.abilities ? data.abilities.map((ability: any) => ({
        ...ability,
        icon: ability.type === 'action' ? Flame : Eye
      })) : [];
      setAbilities(loadedAbilities);

      setEquipmentHead(data.equipmentHead || '');
      setEquipmentNeck(data.equipmentNeck || '');
      setEquipmentChest(data.equipmentChest || '');
      setEquipmentGloves(data.equipmentGloves || '');
      setEquipmentBelt(data.equipmentBelt || '');
      setEquipmentPants(data.equipmentPants || '');
      setEquipmentBoots(data.equipmentBoots || '');

      setBeltSlot1(data.beltSlot1 || '');
      setBeltSlot2(data.beltSlot2 || '');
      setBeltSlot3(data.beltSlot3 || '');
      setBeltSlot4(data.beltSlot4 || '');
      setBeltSlot5(data.beltSlot5 || '');
      setBeltSlot6(data.beltSlot6 || '');
      setBeltSlot7(data.beltSlot7 || '');
      setBeltSlot8(data.beltSlot8 || '');

      setMainWeapon(data.mainWeapon || { name: '', damage: '', bonus: '' });
      setOffWeapon(data.offWeapon || { name: '', damage: '', bonus: '' });

      const loadedInventory = data.inventory ? data.inventory.map((item: any) => ({
        ...item,
        icon: Gem
      })) : [];
      setInventory(loadedInventory);

      if (data.globalAttributes) {
        setGlobalAttributes(data.globalAttributes);
      }

      console.log('Dados carregados com sucesso');
      } else {
        console.log('Nenhum dado salvo encontrado, ficha em branco.');
      }
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  useEffect(() => {
    if (activeUsername) {
      loadCharacterData(activeUsername);
    }
  }, [activeUsername]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const returnToAdminPanel = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-black p-4 md:p-6 overflow-x-hidden">
      {/* Top Bar */}
      <div className="max-w-[1600px] mx-auto mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-zinc-900/50 to-black/50 border border-amber-900/40 rounded-lg p-3">
        <div className="flex items-center gap-2 text-amber-400">
          <User className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm">
            {adminViewUsername ? (
              <>Admin visualizando: <span className="font-bold text-purple-400">{adminViewUsername}</span></>
            ) : (
              <>Logado: <span className="font-bold">{currentUser}</span></>
            )}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {isAdmin && (
            <button
              onClick={returnToAdminPanel}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-900/50 border border-purple-700/50 rounded-lg text-purple-300 hover:bg-purple-900/70 transition-colors text-xs sm:text-sm"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Painel Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-red-300 hover:bg-red-900/70 transition-colors text-xs sm:text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
            <span className="sm:hidden">Sair</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* CABEÇALHO */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-black/95 border-2 border-amber-900/60 rounded-xl p-4 md:p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">

            {/* Retrato e Info */}
            <div className="flex gap-4 min-w-0">
              <CharacterPortrait imageUrl={characterPortrait} onImageChange={setCharacterPortrait} />
              <div className="flex-1 space-y-2 min-w-0">
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
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
                      onChange={(e) => setCharacterClass(e.target.value)}
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
                      onChange={(e) => setCharacterFaction(e.target.value)}
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
                    onChange={(e) => setCharacterCodename(e.target.value)}
                    maxLength={30}
                    placeholder="Codinome"
                    className="text-purple-400 bg-transparent border-b border-transparent hover:border-purple-800/50 focus:border-purple-600 focus:outline-none w-full italic"
                  />
                </div>
              </div>
            </div>

            {/* Indicadores de Status */}
            <div className="flex-1 grid grid-cols-2 gap-3">
              <StatusGauge
                label="Vida"
                current={health}
                max={maxHealth}
                icon={Heart}
                color="red"
                onCurrentChange={setHealth}
                onMaxChange={setMaxHealth}
              />
              <StatusGauge
                label="Sanidade"
                current={sanity}
                max={maxSanity}
                icon={Brain}
                color="blue"
                onCurrentChange={setSanity}
                onMaxChange={setMaxSanity}
              />
              <StatusGauge
                label="Mana"
                current={mana}
                max={maxMana}
                icon={Sparkles}
                color="purple"
                onCurrentChange={setMana}
                onMaxChange={setMaxMana}
              />
              <StatusGauge
                label="Stamina"
                current={stamina}
                max={maxStamina}
                icon={Zap}
                color="green"
                onCurrentChange={setStamina}
                onMaxChange={setMaxStamina}
              />
            </div>

            {/* Corrupção */}
            <div className="w-full lg:w-64">
              {(() => {
                const corruptionBonus = rpgItems
                  .filter(item => item.category === 'armor' && (item.corruptionLimitBonus ?? 0) > 0 &&
                    [equipmentHead, equipmentNeck, equipmentChest, equipmentGloves, equipmentBelt, equipmentPants, equipmentBoots].includes(item.name))
                  .reduce((sum, item) => sum + (item.corruptionLimitBonus || 0), 0);
                
                return (
                  <CorruptionGauge
                    current={corruption}
                    max={corruptionBaseMax + corruptionBonus}
                    onCurrentChange={setCorruption}
                    onMaxChange={(val) => setCorruptionBaseMax(val - corruptionBonus)}
                  />
                );
              })()}
            </div>

            {/* Inspiração */}
            <div className="w-full lg:w-auto flex flex-col items-center justify-center bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 sm:px-6 min-w-[120px] shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 text-amber-500 mb-1 relative z-10">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Inspiração</span>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <button 
                  onClick={() => setInspiration(Math.max(0, inspiration - 1))}
                  className="text-amber-700 hover:text-amber-500 transition-colors text-xl font-bold"
                >
                  -
                </button>
                <span className="text-3xl font-black text-amber-400 drop-shadow-[0_0_8_rgba(251,191,36,0.5)]">
                  {inspiration}
                </span>
                <button 
                  onClick={() => setInspiration(inspiration + 1)}
                  className="text-amber-700 hover:text-amber-500 transition-colors text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* GRID DE CONTEÚDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLUNA ESQUERDA - Atributos & Combate */}
          <div className="lg:col-span-2 space-y-6">

            {/* ATRIBUTOS */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-amber-400 uppercase tracking-wider flex items-center gap-2 text-sm sm:text-base">
                  <Sword className="w-5 h-5" />
                  <span className="hidden sm:inline">Atributos (2d6+Bônus)</span>
                  <span className="sm:hidden">Atributos</span>
                </h2>
                <p className="text-xs text-zinc-500 italic hidden md:block">Evolução em +5 requer treinamento</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <HexAttributeCard name="Ocultismo" bonus={occultism} icon={Eye} onBonusChange={setOccultism} />
                <HexAttributeCard name="Destreza" bonus={dexterity} icon={Hand} onBonusChange={setDexterity} />
                <HexAttributeCard name="Vigor" bonus={vigor} icon={Heart} onBonusChange={setVigor} />
                <HexAttributeCard name="Vontade" bonus={willpower} icon={Brain} onBonusChange={setWillpower} />
                <HexAttributeCard name="Força" bonus={strength} icon={Sword} onBonusChange={setStrength} />
                <HexAttributeCard name="Fé" bonus={faith} icon={Flame} onBonusChange={setFaith} />
              </div>
            </section>

            {/* PERÍCIAS */}
            <section>
              <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Brain className="w-5 h-5" />
                Perícias
              </h2>
              <div className="space-y-3">
                {/* Destreza */}
                <div className="bg-gradient-to-br from-zinc-900/60 to-black/80 border border-emerald-900/40 rounded-lg p-3">
                  <h3 className="text-emerald-400 text-sm font-bold mb-2 flex items-center gap-2">
                    <Hand className="w-4 h-4" />
                    Destreza
                  </h3>
                  <div className="space-y-2">
                    <SkillCard
                      name="Acrobacia"
                      description="Realiza proezas acrobáticas, equilibrar-se"
                      bonus={skills.acrobacia}
                      icon={Activity}
                      color="emerald"
                      onBonusChange={(value) => updateSkill('acrobacia', value)}
                    />
                    <SkillCard
                      name="Furtividade"
                      description="Esconder-se e seguir alguém sem ser notado"
                      bonus={skills.furtividade}
                      icon={EyeOff}
                      color="emerald"
                      onBonusChange={(value) => updateSkill('furtividade', value)}
                    />
                    <SkillCard
                      name="Pontaria"
                      description="Fazer ataques à distância"
                      bonus={skills.pontaria}
                      icon={Crosshair}
                      color="emerald"
                      onBonusChange={(value) => updateSkill('pontaria', value)}
                    />
                  </div>
                </div>

                {/* Força */}
                <div className="bg-gradient-to-br from-zinc-900/60 to-black/80 border border-orange-900/40 rounded-lg p-3">
                  <h3 className="text-orange-400 text-sm font-bold mb-2 flex items-center gap-2">
                    <Sword className="w-4 h-4" />
                    Força
                  </h3>
                  <div className="space-y-2">
                    <SkillCard
                      name="Atletismo"
                      description="Correr, escalar e carregar peso"
                      bonus={skills.atletismo}
                      icon={Dumbbell}
                      color="orange"
                      onBonusChange={(value) => updateSkill('atletismo', value)}
                    />
                    <SkillCard
                      name="Intimidação"
                      description="Assustar ou coagir outros seres"
                      bonus={skills.intimidacao}
                      icon={AlertTriangle}
                      color="orange"
                      onBonusChange={(value) => updateSkill('intimidacao', value)}
                    />
                  </div>
                </div>

                {/* Vontade */}
                <div className="bg-gradient-to-br from-zinc-900/60 to-black/80 border border-blue-900/40 rounded-lg p-3">
                  <h3 className="text-blue-400 text-sm font-bold mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Vontade
                  </h3>
                  <div className="space-y-2">
                    <SkillCard
                      name="Percepção"
                      description="Notar coisas discretas, ouvir sussurros e ler lábios"
                      bonus={skills.percepcao}
                      icon={Search}
                      color="blue"
                      onBonusChange={(value) => updateSkill('percepcao', value)}
                    />
                    <SkillCard
                      name="Sobrevivência"
                      description="Navegar, acampar e rastrear"
                      bonus={skills.sobrevivencia}
                      icon={Compass}
                      color="blue"
                      onBonusChange={(value) => updateSkill('sobrevivencia', value)}
                    />
                    <SkillCard
                      name="Medicina"
                      description="Diagnosticar e tratar ferimentos e doenças"
                      bonus={skills.medicina}
                      icon={Stethoscope}
                      color="blue"
                      onBonusChange={(value) => updateSkill('medicina', value)}
                    />
                  </div>
                </div>

                {/* Ocultismo */}
                <div className="bg-gradient-to-br from-zinc-900/60 to-black/80 border border-purple-900/40 rounded-lg p-3">
                  <h3 className="text-purple-400 text-sm font-bold mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Ocultismo
                  </h3>
                  <div className="space-y-2">
                    <SkillCard
                      name="Corrupção"
                      description="Estudar o paranormal, identificar criaturas e rituais"
                      bonus={skills.corrupcao}
                      icon={Book}
                      color="purple"
                      onBonusChange={(value) => updateSkill('corrupcao', value)}
                    />
                  </div>
                </div>

                {/* Fé */}
                <div className="bg-gradient-to-br from-zinc-900/60 to-black/80 border border-amber-900/40 rounded-lg p-3">
                  <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    Fé
                  </h3>
                  <div className="space-y-2">
                    <SkillCard
                      name="Presença"
                      description="Detecta seres de rituais e malignos"
                      bonus={skills.presenca}
                      icon={Radio}
                      color="amber"
                      onBonusChange={(value) => updateSkill('presenca', value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* HABILIDADES DE COMBATE */}
            <section>
              <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Target className="w-5 h-5" />
                <span className="hidden sm:inline">Habilidades de Combate</span>
                <span className="sm:hidden">Habilidades</span>
              </h2>
              <div className="space-y-3">
                {abilities.map(ability => (
                  <AbilityCard
                    key={ability.id}
                    {...ability}
                    onNameChange={(value) => updateAbility(ability.id, 'name', value)}
                    onTypeChange={(value) => updateAbility(ability.id, 'type', value)}
                    onManaCostChange={(value) => updateAbility(ability.id, 'manaCost', value)}
                    onCorruptionCostChange={(value) => updateAbility(ability.id, 'corruptionCost', value)}
                    onStaminaCostChange={(value) => updateAbility(ability.id, 'staminaCost', value)}
                    onTestChange={(value) => updateAbility(ability.id, 'test', value)}
                    onDamageChange={(value) => updateAbility(ability.id, 'damage', value)}
                    onEffectChange={(value) => updateAbility(ability.id, 'effect', value)}
                    onBacklashChange={(value) => updateAbility(ability.id, 'backlash', value)}
                  />
                ))}
              </div>
            </section>

            {/* COMBATE EQUIPADO */}
            <section>
              <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Sword className="w-5 h-5" />
                Armas Equipadas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <WeaponCard
                  slot="main"
                  name={mainWeapon.name}
                  damage={mainWeapon.damage}
                  bonus={mainWeapon.bonus}
                  synergy="Ao usar habilidades de dano de Fogo, adiciona +1d4 de dano bônus"
                  special="+1 Corrupção para maximizar dano (define todos os dados no máximo: 12 base + 3 = 15 total)"
                  onNameChange={(value) => setMainWeapon(prev => ({ ...prev, name: value }))}
                  onDamageChange={(value) => setMainWeapon(prev => ({ ...prev, damage: value }))}
                  onBonusChange={(value) => setMainWeapon(prev => ({ ...prev, bonus: value }))}
                  onClear={() => setMainWeapon({ name: '', damage: '', bonus: '' })}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'weapon', slot: 'main' })}
                />
                <WeaponCard
                  slot="off"
                  name={offWeapon.name}
                  damage={offWeapon.damage}
                  bonus={offWeapon.bonus}
                  onNameChange={(value) => setOffWeapon(prev => ({ ...prev, name: value }))}
                  onDamageChange={(value) => setOffWeapon(prev => ({ ...prev, damage: value }))}
                  onBonusChange={(value) => setOffWeapon(prev => ({ ...prev, bonus: value }))}
                  onClear={() => setOffWeapon({ name: '', damage: '', bonus: '' })}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'weapon', slot: 'off' })}
                />
                <DamageReductionBadge value={damageReduction} onValueChange={setDamageReduction} />
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA - Equipamento & Inventário */}
          <div className="space-y-6">

            {/* EQUIPAMENTO DO CORPO */}
            <section className="bg-zinc-900/60 border-2 border-amber-900/50 rounded-xl p-5 shadow-xl">
              <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 text-sm sm:text-base">
                <ShirtIcon className="w-5 h-5" />
                Equipamento
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <EquipmentSlot
                  slotName="Cabeça"
                  itemName={equipmentHead}
                  icon={Crown}
                  onItemNameChange={setEquipmentHead}
                  onClear={() => setEquipmentHead('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'head' })}
                />
                <EquipmentSlot
                  slotName="Pescoço"
                  itemName={equipmentNeck}
                  icon={Circle}
                  onItemNameChange={setEquipmentNeck}
                  onClear={() => setEquipmentNeck('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'neck' })}
                />
                <EquipmentSlot
                  slotName="Peito"
                  itemName={equipmentChest}
                  icon={ShirtIcon}
                  onItemNameChange={setEquipmentChest}
                  onClear={() => setEquipmentChest('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'chest' })}
                />
                <EquipmentSlot
                  slotName="Luvas"
                  itemName={equipmentGloves}
                  icon={Hand}
                  onItemNameChange={setEquipmentGloves}
                  onClear={() => setEquipmentGloves('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'gloves' })}
                />
                <EquipmentSlot
                  slotName="Cinto"
                  itemName={equipmentBelt}
                  icon={GripHorizontal}
                  onItemNameChange={setEquipmentBelt}
                  onClear={() => setEquipmentBelt('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'belt' })}
                />
                <EquipmentSlot
                  slotName="Calças"
                  itemName={equipmentPants}
                  icon={CircleDot}
                  onItemNameChange={setEquipmentPants}
                  onClear={() => setEquipmentPants('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'pants' })}
                />
                <div className="col-span-2">
                  <EquipmentSlot
                    slotName="Botas"
                    itemName={equipmentBoots}
                    icon={Footprints}
                    onItemNameChange={setEquipmentBoots}
                    onClear={() => setEquipmentBoots('')}
                    onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'boots' })}
                  />
                </div>
              </div>
            </section>

            {/* CINTO & ACESSO RÁPIDO */}
            <section className="bg-zinc-900/60 border-2 border-amber-900/50 rounded-xl p-5 shadow-xl">
              <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 text-sm sm:text-base">
                <GripHorizontal className="w-5 h-5" />
                Cinto & Acesso Rápido
                {(() => {
                  const beltItem = rpgItems.find(i => i.name === equipmentBelt && i.beltCapacity && i.beltCapacity > 0);
                  return beltItem ? (
                    <span className="text-xs text-zinc-500 ml-1">({beltItem.beltCapacity} slots)</span>
                  ) : null;
                })()}
              </h2>
                {(() => {
                  const beltItem = rpgItems.find(i => i.name === equipmentBelt && i.beltCapacity && i.beltCapacity > 0);
                  const capacity = beltItem?.beltCapacity ?? 0;
                  
                  if (capacity === 0) {
                    return (
                      <div className="col-span-full py-8 text-center border-2 border-dashed border-zinc-800 rounded-lg">
                        <GripHorizontal className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        <p className="text-zinc-500 text-sm italic">Equipe um Cinto no slot de Equipamento para liberar slots de acesso rápido.</p>
                      </div>
                    );
                  }

                  const allSlots = [
                    { val: beltSlot1, set: setBeltSlot1, key: 'belt1' },
                    { val: beltSlot2, set: setBeltSlot2, key: 'belt2' },
                    { val: beltSlot3, set: setBeltSlot3, key: 'belt3' },
                    { val: beltSlot4, set: setBeltSlot4, key: 'belt4' },
                    { val: beltSlot5, set: setBeltSlot5, key: 'belt5' },
                    { val: beltSlot6, set: setBeltSlot6, key: 'belt6' },
                    { val: beltSlot7, set: setBeltSlot7, key: 'belt7' },
                    { val: beltSlot8, set: setBeltSlot8, key: 'belt8' },
                  ].slice(0, capacity);
                  
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {allSlots.map(slot => (
                        <BeltSlot
                          key={slot.key}
                          itemName={slot.val}
                          onItemNameChange={slot.set}
                          onClear={() => slot.set('')}
                          onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'weapon', slot: slot.key })}
                        />
                      ))}
                    </div>
                  );
                })()}
            </section>

            {/* EFEITOS & MARCAS */}
            <section className="bg-gradient-to-br from-zinc-900/80 to-black/90 border-2 border-red-900/40 rounded-xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h2 className="text-red-500 uppercase tracking-wider flex items-center gap-2 text-sm sm:text-base font-bold">
                  <Skull className="w-5 h-5" />
                  Efeitos & Marcas
                </h2>
                <button 
                  onClick={() => setCurses([...curses, { id: Date.now().toString(), title: 'Nova Marca', content: '' }])}
                  className="p-1 hover:bg-red-900/20 rounded text-red-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 relative z-10 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {curses.length === 0 && (
                  <p className="text-zinc-600 text-xs italic text-center py-4">Nenhuma maldição ativa...</p>
                )}
                {curses.map((curse, index) => (
                  <div key={curse.id} className="bg-black/40 border border-red-900/20 rounded-lg p-3 group relative">
                    <button 
                      onClick={() => setCurses(curses.filter(c => c.id !== curse.id))}
                      className="absolute top-2 right-2 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input 
                      type="text"
                      value={curse.title}
                      onChange={(e) => {
                        const newCurses = [...curses];
                        newCurses[index].title = e.target.value;
                        setCurses(newCurses);
                      }}
                      className="bg-transparent border-none text-red-400 font-bold text-sm w-full focus:outline-none mb-1 uppercase tracking-tight"
                      placeholder="Título da Marca"
                    />
                    <textarea 
                      value={curse.content}
                      onChange={(e) => {
                        const newCurses = [...curses];
                        newCurses[index].content = e.target.value;
                        setCurses(newCurses);
                      }}
                      className="bg-transparent border-none text-zinc-400 text-xs w-full focus:outline-none min-h-[60px] resize-none"
                      placeholder="Descreva os efeitos..."
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* MOCHILA */}
            <section className="bg-zinc-900/60 border-2 border-amber-900/50 rounded-xl p-5 shadow-xl">
              <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Sparkles className="w-5 h-5" />
                Mochila
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {inventory.map((item) => (
                  <InventorySlot
                    key={item.id}
                    itemName={item.name}
                    quantity={item.quantity}
                    icon={item.icon}
                    description={item.description}
                    onQuantityChange={(newQty) => updateItemQuantity(item.id, newQty)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
                {Array.from({ length: Math.max(0, 8 - inventory.length) }).map((_, i) => (
                  <InventorySlot
                    key={`empty-${i}`}
                    onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'consumable' })}
                  />
                ))}
              </div>
              <EncumbranceBar current={inventory.length} max={8} />
            </section>
          </div>
        </div>

        {/* Modal de Seleção de Itens */}
        <ItemSelectionModal
          isOpen={itemSelectionModal.isOpen}
          title={
            itemSelectionModal.type === 'weapon' ? 'Selecionar Arma' :
            itemSelectionModal.type === 'armor' ? 'Selecionar Armadura' :
            'Selecionar Item'
          }
          items={rpgItems.filter(item => 
            itemSelectionModal.type === 'consumable' 
              ? (item.category === 'consumable' || item.category === 'material')
              : item.category === itemSelectionModal.type
          )}
          onClose={() => setItemSelectionModal({ isOpen: false, type: null })}
          onSelect={(item) => {
            const rpgItem = item as RPGItem;
            if (itemSelectionModal.type === 'weapon' && itemSelectionModal.slot) {
              if (itemSelectionModal.slot === 'main' || itemSelectionModal.slot === 'off') {
                equipItemAsWeapon(rpgItem, itemSelectionModal.slot);
              } else if (itemSelectionModal.slot.startsWith('belt')) {
                const beltNum = itemSelectionModal.slot.replace('belt', '');
                const setters: Record<string, (v: string) => void> = {
                  '1': setBeltSlot1, '2': setBeltSlot2, '3': setBeltSlot3, '4': setBeltSlot4,
                  '5': setBeltSlot5, '6': setBeltSlot6, '7': setBeltSlot7, '8': setBeltSlot8
                };
                setters[beltNum]?.(rpgItem.name);
              }
            } else if (itemSelectionModal.type === 'armor' && itemSelectionModal.slot) {
              equipItemAsArmor(rpgItem, itemSelectionModal.slot);
            } else if (itemSelectionModal.type === 'consumable') {
              addItemToInventory(rpgItem);
            }
            setItemSelectionModal({ isOpen: false, type: null });
          }}
        />
      </div>
    </div>
  );
}
