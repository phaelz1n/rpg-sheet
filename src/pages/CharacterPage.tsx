import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { ttrpgApi } from '../lib/ttrpg-api';
import { seedDefaultItems } from '../lib/seeding-service';

import { CharacterPortrait } from '../components/rpg/CharacterPortrait';
import { StatusGauge } from '../components/rpg/StatusGauge';
import { CorruptionGauge } from '../components/rpg/CorruptionGauge';
import { HexAttributeCard } from '../components/rpg/HexAttributeCard';
import { SkillCard } from '../components/rpg/SkillCard';
import { AbilityCard } from '../components/rpg/AbilityCard';
import { WeaponCard } from '../components/rpg/WeaponCard';
import { DamageReductionBadge } from '../components/rpg/DamageReductionBadge';
import { EquipmentSlot } from '../components/rpg/EquipmentSlot';
import { BeltSlot } from '../components/rpg/BeltSlot';
import { InventorySlot } from '../components/rpg/InventorySlot';
import { EncumbranceBar } from '../components/rpg/EncumbranceBar';
import { ItemSelectionModal } from '../components/rpg/ItemSelectionModal';
import {
  Eye, Hand, Heart, Brain, Sword, Flame,
  Sparkles, Zap, Skull, Droplet, Target, Moon,
  Crown, Circle, ShirtIcon, GripHorizontal, CircleDot,
  Footprints, Pickaxe, Gem, Fish, Coins, Swords,
  LogOut, Plus, Trash2, User, Shield, Activity, EyeOff, Crosshair,
  Dumbbell, AlertTriangle, Search, Compass, Stethoscope,
  Book, Radio, ChevronLeft, ChevronRight, Minus, Info, Database, X
} from 'lucide-react';

import { RichDescription } from '../components/rpg/RichDescription';

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
  category: 'weapon' | 'armor' | 'potion' | 'material' | 'collectible' | 'consumable';
  equipmentSlot?: string;
  corruptionLimitBonus?: number;
  statBonus?: string;
  beltCapacity?: number;
  rarity?: string;
  description?: string;
}

function CompactSkillRow({ name, bonus, onBonusChange, color }: { 
  name: string, bonus: number, onBonusChange: (v: number) => void, color: string 
}) {
  const iconColors = {
    emerald: 'text-emerald-500',
    orange: 'text-orange-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500'
  };

  return (
    <div className="flex items-center justify-between py-1 border-b border-zinc-800/50 last:border-0 group">
      <span className={`text-[11px] sm:text-xs uppercase tracking-wider font-medium ${iconColors[color as keyof typeof iconColors] || 'text-zinc-400'}`}>
        {name}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={bonus}
          onChange={(e) => onBonusChange(Number(e.target.value))}
          className="w-10 bg-transparent border-none text-right text-amber-400 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-amber-600/30 rounded"
        />
      </div>
    </div>
  );
}

export function CharacterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, isAdmin, logout } = useAuth();
  const { showToast, showConfirm } = useUI();

  // Check if admin is viewing another user's character
  const adminViewUsername = searchParams.get('admin-view');
  const activeUsername = (isAdmin && adminViewUsername) ? adminViewUsername : currentUser;

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

  const [loreQuote, setLoreQuote] = useState('');

  useEffect(() => {
    const randomQuote = LORE_QUOTES[Math.floor(Math.random() * LORE_QUOTES.length)];
    setLoreQuote(randomQuote);
  }, []);

  // Modal state
  const [itemSelectionModal, setItemSelectionModal] = useState<{
    isOpen: boolean;
    type: 'weapon' | 'armor' | 'consumable' | null;
    slot?: string;
  }>({ isOpen: false, type: null });

  const [showTips, setShowTips] = useState(false);

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
    bonus: '',
    synergy: '',
    special: ''
  });
  const [offWeapon, setOffWeapon] = useState({
    name: '',
    damage: '',
    bonus: '',
    synergy: '',
    special: ''
  });

  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryCapacity, setInventoryCapacity] = useState(8);
  const [inventoryPage, setInventoryPage] = useState(0);
  const ITEMS_PER_PAGE = 8;

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

  const addAbility = () => {
    if (abilities.length >= 4) return;
    const newAbility: Ability = {
      id: Date.now().toString(),
      name: 'Nova Habilidade',
      type: 'action',
      icon: Zap,
      effect: ''
    };
    setAbilities(prev => [...prev, newAbility]);
  };

  const removeAbility = (id: string) => {
    setAbilities(prev => prev.filter(a => a.id !== id));
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
          dexterity: Zap,
          vigor: Heart,
          willpower: Brain,
          strength: Dumbbell,
          faith: Droplet
        };

        const convertedItems = response.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          attributeType: item.attributeType || 'dexterity',
          attributeIcon: iconMap[item.attributeType] || Zap,
          bonus: item.bonus || 0,
          damage: item.damage || '',
          category: (item.type === 'weapon' ? 'weapon' : 
                    item.type === 'armor' ? 'armor' :
                    item.type === 'material' ? 'material' : 
                    item.type === 'potion' ? 'potion' : 'consumable') as RPGItem['category'],
          equipmentSlot: item.equipmentSlot || undefined,

          corruptionLimitBonus: item.corruptionLimitBonus || 0,
          statBonus: item.statBonus || '',
          beltCapacity: item.beltCapacity || 0,
          rarity: item.rarity || 'common',
          description: item.description || ''
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

  const getItemRarity = (itemName: string) => {
    return rpgItems.find(item => item.name === itemName)?.rarity;
  };

  const getItemDescription = (itemName: string) => {
    return rpgItems.find(item => item.name === itemName)?.description;
  };

  const equipItemAsWeapon = (item: RPGItem, slot: 'main' | 'off') => {
    const weaponData = {
      name: item.name,
      damage: item.damage,
      bonus: `+${item.bonus}`,
      synergy: '', // Podia vir do banco se tivéssemos campos específicos, por enquanto usamos a descrição se for longa?
      special: item.description || ''
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
      dexterity: Zap,
      vigor: Heart,
      willpower: Brain,
      strength: Dumbbell,
      faith: Droplet
    };

    const newInventoryItem: InventoryItem = {
      id: Date.now().toString(),
      name: item.name,
      quantity: 1,
      icon: iconMap[item.attributeType] || Sparkles,
      description: item.description || `Bônus: +${item.bonus}, Dano: ${item.damage}`
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
        inventoryCapacity,
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
    mainWeapon, offWeapon, inventory, inventoryCapacity, globalAttributes, inspiration, curses
  ]);

  // Synchronization effect: Ensure equipped items match latest global templates
  useEffect(() => {
    if (rpgItems.length === 0) return;

    // Helper to check if an item still exists globally
    const itemExists = (name: string) => rpgItems.some(i => i.name === name);

    // Refresh Weapons
    if (mainWeapon.name) {
      const global = rpgItems.find(i => i.name === mainWeapon.name);
      if (global) {
        const bonusStr = `+${global.bonus}`;
        if (mainWeapon.damage !== global.damage || mainWeapon.bonus !== bonusStr || mainWeapon.special !== global.description) {
          setMainWeapon(prev => ({
            ...prev,
            damage: global.damage,
            bonus: bonusStr,
            special: global.description || ''
          }));
        }
      } else {
        setMainWeapon({ name: '', damage: '', bonus: '', synergy: '', special: '' });
      }
    }
    
    if (offWeapon.name) {
      const global = rpgItems.find(i => i.name === offWeapon.name);
      if (global) {
        const bonusStr = `+${global.bonus}`;
        if (offWeapon.damage !== global.damage || offWeapon.bonus !== bonusStr || offWeapon.special !== global.description) {
          setOffWeapon(prev => ({
            ...prev,
            damage: global.damage,
            bonus: bonusStr,
            special: global.description || ''
          }));
        }
      } else {
        setOffWeapon({ name: '', damage: '', bonus: '', synergy: '', special: '' });
      }
    }

    // Check Armors
    if (equipmentHead && !itemExists(equipmentHead)) setEquipmentHead('');
    if (equipmentNeck && !itemExists(equipmentNeck)) setEquipmentNeck('');
    if (equipmentChest && !itemExists(equipmentChest)) setEquipmentChest('');
    if (equipmentGloves && !itemExists(equipmentGloves)) setEquipmentGloves('');
    if (equipmentBelt && !itemExists(equipmentBelt)) setEquipmentBelt('');
    if (equipmentPants && !itemExists(equipmentPants)) setEquipmentPants('');
    if (equipmentBoots && !itemExists(equipmentBoots)) setEquipmentBoots('');

    // Check Belt Slots
    if (beltSlot1 && !itemExists(beltSlot1)) setBeltSlot1('');
    if (beltSlot2 && !itemExists(beltSlot2)) setBeltSlot2('');
    if (beltSlot3 && !itemExists(beltSlot3)) setBeltSlot3('');
    if (beltSlot4 && !itemExists(beltSlot4)) setBeltSlot4('');
    if (beltSlot5 && !itemExists(beltSlot5)) setBeltSlot5('');
    if (beltSlot6 && !itemExists(beltSlot6)) setBeltSlot6('');
    if (beltSlot7 && !itemExists(beltSlot7)) setBeltSlot7('');
    if (beltSlot8 && !itemExists(beltSlot8)) setBeltSlot8('');

    // Check Inventory
    if (inventory.length > 0) {
      const validInventory = inventory.filter(invItem => itemExists(invItem.name));
      if (validInventory.length !== inventory.length) {
        setInventory(validInventory);
      }
    }
  }, [rpgItems]);

  const loadCharacterData = async (username: string) => {
    console.log(`Carregando dados para o usuário: ${username}`);

    try {
      const response = await ttrpgApi.getCharacter(username);

      if (response.exists && response.data) {
        console.log('Dados encontrados, carregando...');
        const data = response.data;

        const attributeIconMap: Record<string, any> = {
          occultism: Eye,
          dexterity: Zap,
          vigor: Heart,
          willpower: Brain,
          strength: Dumbbell,
          faith: Droplet
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
        icon: ability.type === 'action' ? Zap : Eye
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
      
      setInventoryCapacity(data.inventoryCapacity ?? 8);

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

  const handleSeed = async () => {
    showConfirm('Deseja carregar a lista de itens padrão (armas, armaduras e materiais)?', async () => {
      const createdCount = await seedDefaultItems();
      if (createdCount !== null) {
        showToast(`${createdCount} novos itens carregados com sucesso!`, 'success');
        await loadGlobalItems();
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-black p-4 md:p-6 overflow-x-hidden">
      {/* Top Bar */}
      <div className="max-w-[1600px] mx-auto mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-zinc-900/50 to-black/50 border border-amber-900/40 rounded-lg p-3">
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
            <button
              onClick={handleSeed}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm border border-zinc-700 shadow-lg group"
              title="Carregar Itens Iniciais do RPG"
            >
              <Database className="w-4 h-4 text-emerald-500" />
            </button>
          )}

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
            onClick={() => setShowTips(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 hover:bg-zinc-700/70 transition-colors text-xs sm:text-sm"
          >
            <Info className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Dicas</span>
            <span className="sm:hidden">Dicas</span>
          </button>

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
        {/* Lore Quote */}
        <div className="flex justify-center -mt-2">
          <div className="bg-black/40 border border-amber-900/20 rounded px-4 py-1.5 italic text-[10px] sm:text-xs text-zinc-500 tracking-wide text-center max-w-2xl">
            "{loreQuote}"
          </div>
        </div>

        {/* CABEÇALHO */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-black/95 border-2 border-amber-900/60 rounded-xl p-4 md:p-6 shadow-2xl">
          <div className="flex flex-col xl:flex-row gap-4 md:gap-6">


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
            <div className="w-full xl:w-64">
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
            <div className="w-full xl:w-auto flex flex-col items-center justify-center bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 sm:px-6 min-w-[120px] shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 text-amber-500 mb-1 relative z-10">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Inspiração</span>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <button 
                  onClick={() => setInspiration(Math.max(0, inspiration - 1))}
                  className="text-amber-700 hover:text-amber-500 transition-colors text-xl font-bold px-2"
                >
                  -
                </button>
                <span className="text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                  {inspiration}
                </span>
                <button 
                  onClick={() => setInspiration(inspiration + 1)}
                  className="text-amber-700 hover:text-amber-500 transition-colors text-xl font-bold px-2"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* GRID DE CONTEÚDO PRINCIPAL */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* COLUNA ESQUERDA - Atributos & Combate */}
          <div className="xl:col-span-2 space-y-6">

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
                <HexAttributeCard name="Destreza" bonus={dexterity} icon={Zap} onBonusChange={setDexterity} />
                <HexAttributeCard name="Vigor" bonus={vigor} icon={Heart} onBonusChange={setVigor} />
                <HexAttributeCard name="Vontade" bonus={willpower} icon={Brain} onBonusChange={setWillpower} />
                <HexAttributeCard name="Força" bonus={strength} icon={Dumbbell} onBonusChange={setStrength} />
                <HexAttributeCard name="Fé" bonus={faith} icon={Droplet} onBonusChange={setFaith} />
              </div>
            </section>

            {/* PERÍCIAS */}
            <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 sm:p-5">
              <h2 className="text-amber-400 uppercase tracking-wider mb-6 flex items-center gap-2 text-sm sm:text-base font-bold">
                <Shield className="w-5 h-5" />
                Perícias
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Destreza */}
                <div className="space-y-1">
                  <h3 className="text-[10px] text-emerald-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-emerald-900/30 pb-1 flex items-center gap-2">
                    <Hand className="w-3 h-3" /> Destreza
                  </h3>
                  <CompactSkillRow name="Acrobacia" bonus={skills.acrobacia} color="emerald" onBonusChange={(v) => updateSkill('acrobacia', v)} />
                  <CompactSkillRow name="Furtividade" bonus={skills.furtividade} color="emerald" onBonusChange={(v) => updateSkill('furtividade', v)} />
                  <CompactSkillRow name="Pontaria" bonus={skills.pontaria} color="emerald" onBonusChange={(v) => updateSkill('pontaria', v)} />
                </div>

                {/* Força / Corpo */}
                <div className="space-y-1">
                  <h3 className="text-[10px] text-orange-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-orange-900/30 pb-1 flex items-center gap-2">
                    <Sword className="w-3 h-3" /> Corpo
                  </h3>
                  <CompactSkillRow name="Atletismo" bonus={skills.atletismo} color="orange" onBonusChange={(v) => updateSkill('atletismo', v)} />
                  <CompactSkillRow name="Intimidação" bonus={skills.intimidacao} color="orange" onBonusChange={(v) => updateSkill('intimidacao', v)} />
                </div>

                {/* Vontade / Mente */}
                <div className="space-y-1">
                  <h3 className="text-[10px] text-blue-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-blue-900/30 pb-1 flex items-center gap-2">
                    <Brain className="w-3 h-3" /> Mente
                  </h3>
                  <CompactSkillRow name="Percepção" bonus={skills.percepcao} color="blue" onBonusChange={(v) => updateSkill('percepcao', v)} />
                  <CompactSkillRow name="Sobrevivência" bonus={skills.sobrevivencia} color="blue" onBonusChange={(v) => updateSkill('sobrevivencia', v)} />
                  <CompactSkillRow name="Medicina" bonus={skills.medicina} color="blue" onBonusChange={(v) => updateSkill('medicina', v)} />
                </div>

                {/* Ocultismo / Paranormal */}
                <div className="space-y-1">
                  <h3 className="text-[10px] text-purple-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-purple-900/30 pb-1 flex items-center gap-2">
                    <Eye className="w-3 h-3" /> Paranormal
                  </h3>
                  <CompactSkillRow name="Corrupção" bonus={skills.corrupcao} color="purple" onBonusChange={(v) => updateSkill('corrupcao', v)} />
                </div>

                {/* Fé / Espírito */}
                <div className="space-y-1">
                  <h3 className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-amber-900/30 pb-1 flex items-center gap-2">
                    <Flame className="w-3 h-3" /> Espírito
                  </h3>
                  <CompactSkillRow name="Presença" bonus={skills.presenca} color="amber" onBonusChange={(v) => updateSkill('presenca', v)} />
                </div>
              </div>
            </section>

            {/* HABILIDADES DE COMBATE */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-amber-400 uppercase tracking-wider flex items-center gap-2 text-sm sm:text-base font-bold">
                  <Target className="w-5 h-5" />
                  Habilidades de Combate
                </h2>
                {abilities.length < 4 && (
                  <button 
                    onClick={addAbility}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-900/20 border border-amber-800/40 rounded-lg text-amber-500 text-xs hover:bg-amber-900/40 transition-all font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {abilities.length === 0 && (
                  <div className="py-8 text-center border-2 border-dashed border-zinc-800 rounded-xl">
                    <Target className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm italic text-center px-4">
                      Você ainda não possui habilidades de combate. Clique em "Adicionar" para criar uma.
                    </p>
                  </div>
                )}
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
                    onDelete={() => removeAbility(ability.id)}
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
                  synergy={mainWeapon.synergy}
                  special={mainWeapon.special}
                  onNameChange={(value) => setMainWeapon(prev => ({ ...prev, name: value }))}
                  onDamageChange={(value) => setMainWeapon(prev => ({ ...prev, damage: value }))}
                  onBonusChange={(value) => setMainWeapon(prev => ({ ...prev, bonus: value }))}
                  onClear={() => setMainWeapon({ name: '', damage: '', bonus: '', synergy: '', special: '' })}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'weapon', slot: 'main' })}
                />
                <WeaponCard
                  slot="off"
                  name={offWeapon.name}
                  damage={offWeapon.damage}
                  bonus={offWeapon.bonus}
                  synergy={offWeapon.synergy}
                  special={offWeapon.special}
                  onNameChange={(value) => setOffWeapon(prev => ({ ...prev, name: value }))}
                  onDamageChange={(value) => setOffWeapon(prev => ({ ...prev, damage: value }))}
                  onBonusChange={(value) => setOffWeapon(prev => ({ ...prev, bonus: value }))}
                  onClear={() => setOffWeapon({ name: '', damage: '', bonus: '', synergy: '', special: '' })}
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
                  rarity={getItemRarity(equipmentHead)}
                  description={getItemDescription(equipmentHead)}
                  icon={Crown}
                  onItemNameChange={setEquipmentHead}
                  onClear={() => setEquipmentHead('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'head' })}
                />
                <EquipmentSlot
                  slotName="Pescoço"
                  itemName={equipmentNeck}
                  rarity={getItemRarity(equipmentNeck)}
                  description={getItemDescription(equipmentNeck)}
                  icon={Circle}
                  onItemNameChange={setEquipmentNeck}
                  onClear={() => setEquipmentNeck('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'neck' })}
                />
                <EquipmentSlot
                  slotName="Peito"
                  itemName={equipmentChest}
                  rarity={getItemRarity(equipmentChest)}
                  description={getItemDescription(equipmentChest)}
                  icon={ShirtIcon}
                  onItemNameChange={setEquipmentChest}
                  onClear={() => setEquipmentChest('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'chest' })}
                />
                <EquipmentSlot
                  slotName="Luvas"
                  itemName={equipmentGloves}
                  rarity={getItemRarity(equipmentGloves)}
                  description={getItemDescription(equipmentGloves)}
                  icon={Hand}
                  onItemNameChange={setEquipmentGloves}
                  onClear={() => setEquipmentGloves('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'gloves' })}
                />
                <EquipmentSlot
                  slotName="Cinto"
                  itemName={equipmentBelt}
                  rarity={getItemRarity(equipmentBelt)}
                  description={getItemDescription(equipmentBelt)}
                  icon={GripHorizontal}
                  onItemNameChange={setEquipmentBelt}
                  onClear={() => setEquipmentBelt('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'belt' })}
                />
                <EquipmentSlot
                  slotName="Calças"
                  itemName={equipmentPants}
                  rarity={getItemRarity(equipmentPants)}
                  description={getItemDescription(equipmentPants)}
                  icon={CircleDot}
                  onItemNameChange={setEquipmentPants}
                  onClear={() => setEquipmentPants('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'armor', slot: 'pants' })}
                />
                <div className="col-span-2">
                  <EquipmentSlot
                    slotName="Botas"
                    itemName={equipmentBoots}
                    rarity={getItemRarity(equipmentBoots)}
                    description={getItemDescription(equipmentBoots)}
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
                          rarity={getItemRarity(slot.val)}
                          onItemNameChange={slot.set}
                          onClear={() => slot.set('')}
                          onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'consumable', slot: slot.key })}
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
                    <div className="relative">
                      <textarea 
                        value={curse.content}
                        onChange={(e) => {
                          const newCurses = [...curses];
                          newCurses[index].content = e.target.value;
                          setCurses(newCurses);
                        }}
                        className="bg-transparent border-none text-zinc-400 text-xs w-full focus:outline-none min-h-[100px] resize-none opacity-0 focus:opacity-100 absolute inset-0 z-10"
                        placeholder="Descreva os efeitos..."
                      />
                      <div className="text-zinc-400 text-xs min-h-[100px] pointer-events-none pb-2">
                        <RichDescription text={curse.content || "Descreva os efeitos..."} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* MOCHILA */}
            <section className="bg-zinc-900/60 border-2 border-amber-900/50 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-amber-400 uppercase tracking-wider flex items-center gap-2 text-sm sm:text-base">
                  <Sparkles className="w-5 h-5" />
                  Mochila
                  <span className="text-xs text-zinc-500 font-normal">({inventory.length}/{inventoryCapacity})</span>
                </h2>
                
                <div className="flex items-center gap-3">
                  {/* Pagination Controls */}
                  {inventoryCapacity > ITEMS_PER_PAGE && (
                    <div className="flex items-center gap-2 bg-black/40 border border-amber-900/20 rounded px-2 py-1">
                      <button 
                        onClick={() => setInventoryPage(prev => Math.max(0, prev - 1))}
                        disabled={inventoryPage === 0}
                        className="text-amber-600 hover:text-amber-400 disabled:text-zinc-700 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-tighter">
                        Pág {inventoryPage + 1}
                      </span>
                      <button 
                        onClick={() => setInventoryPage(prev => Math.min(Math.ceil(inventoryCapacity / ITEMS_PER_PAGE) - 1, prev + 1))}
                        disabled={inventoryPage >= Math.ceil(inventoryCapacity / ITEMS_PER_PAGE) - 1}
                        className="text-amber-600 hover:text-amber-400 disabled:text-zinc-700 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center bg-amber-900/20 border border-amber-900/40 rounded overflow-hidden">
                    <button 
                      onClick={() => {
                        const newCap = Math.max(8, inventoryCapacity - 4);
                        setInventoryCapacity(newCap);
                        const maxPage = Math.ceil(newCap / ITEMS_PER_PAGE) - 1;
                        if (inventoryPage > maxPage) setInventoryPage(maxPage);
                      }}
                      className="px-2 py-1 text-amber-500 hover:bg-amber-900/40 transition-all border-r border-amber-900/40 disabled:text-zinc-700"
                      disabled={inventoryCapacity <= 8}
                      title="Diminuir espaço da mochila"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => setInventoryCapacity(prev => Math.min(40, prev + 4))}
                      className="flex items-center gap-1 px-3 py-1 text-[10px] text-amber-400 hover:bg-amber-900/40 transition-all uppercase font-bold"
                      title="Aumentar espaço da mochila"
                    >
                      <Plus className="w-3 h-3" />
                      Expandir
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 min-h-[180px]">
                {(() => {
                  const pageItems = inventory.slice(inventoryPage * ITEMS_PER_PAGE, (inventoryPage + 1) * ITEMS_PER_PAGE);
                  const emptySlotsCount = Math.max(0, ITEMS_PER_PAGE - pageItems.length);
                  // Only show empty slots if we haven't reached the total capacity on this page
                  const totalSlotsOnThisPage = Math.min(ITEMS_PER_PAGE, inventoryCapacity - (inventoryPage * ITEMS_PER_PAGE));
                  const effectiveEmptySlots = Math.max(0, totalSlotsOnThisPage - pageItems.length);

                  return (
                    <>
                      {pageItems.map((item) => (
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
                      {Array.from({ length: effectiveEmptySlots }).map((_, i) => (
                        <InventorySlot
                          key={`empty-${i}`}
                          onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'consumable' })}
                        />
                      ))}
                    </>
                  );
                })()}
              </div>
              <EncumbranceBar current={inventory.length} max={inventoryCapacity} />
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
          items={rpgItems.filter(item => {
            if (itemSelectionModal.type === 'weapon') {
              return item.category === 'weapon';
            }
            if (itemSelectionModal.type === 'armor') {
              return item.category === 'armor' && item.equipmentSlot === itemSelectionModal.slot;
            }
            if (itemSelectionModal.type === 'consumable') {
              // Na mochila agora pode tudo!
              return true;
            }
            return false;
          })}
          onClose={() => setItemSelectionModal({ isOpen: false, type: null })}
          onSelect={(item) => {
            const rpgItem = item as RPGItem;
            if (itemSelectionModal.slot?.startsWith('belt') && itemSelectionModal.slot !== 'belt') {
              const beltNum = itemSelectionModal.slot.replace('belt', '');
              const setters: Record<string, (v: string) => void> = {
                '1': setBeltSlot1, '2': setBeltSlot2, '3': setBeltSlot3, '4': setBeltSlot4,
                '5': setBeltSlot5, '6': setBeltSlot6, '7': setBeltSlot7, '8': setBeltSlot8
              };
              setters[beltNum]?.(rpgItem.name);
            } else if (itemSelectionModal.type === 'weapon' && itemSelectionModal.slot) {
              if (itemSelectionModal.slot === 'main' || itemSelectionModal.slot === 'off') {
                equipItemAsWeapon(rpgItem, itemSelectionModal.slot);
              }
            } else if (itemSelectionModal.type === 'armor' && itemSelectionModal.slot) {
              equipItemAsArmor(rpgItem, itemSelectionModal.slot);
            } else if (itemSelectionModal.type === 'consumable') {
              addItemToInventory(rpgItem);
            }
            setItemSelectionModal({ isOpen: false, type: null });
          }}
        />

        {/* Modal de Dicas */}
        {showTips && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm text-left">
            <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-900/60 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative">
              <button 
                onClick={() => setShowTips(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3">
                <Info className="w-7 h-7" />
                Guia de Formatação e Tags
              </h2>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                <section>
                  <h3 className="text-amber-500 font-bold mb-2 uppercase text-sm tracking-widest border-b border-amber-900/30 pb-1">Atributos (Ícones)</h3>
                  <p className="text-zinc-400 text-xs mb-3">Use hashtags para inserir ícones de atributos em qualquer descrição:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-amber-400 font-mono">#força</span> <RichDescription text="#força" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-amber-400 font-mono">#destreza</span> <RichDescription text="#destreza" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-amber-400 font-mono">#vigor</span> <RichDescription text="#vigor" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-amber-400 font-mono">#vontade</span> <RichDescription text="#vontade" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-amber-400 font-mono">#fé</span> <RichDescription text="#fé" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-amber-400 font-mono">#ocultismo</span> <RichDescription text="#ocultismo" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-amber-400 font-mono">#corrupção</span> <RichDescription text="#corrupção" />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-red-500 font-bold mb-2 uppercase text-sm tracking-widest border-b border-red-900/30 pb-1">Status e Condições</h3>
                  <p className="text-zinc-400 text-xs mb-3">Tags para condições e bônus especiais:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-red-400 font-mono">#marcado</span> <RichDescription text="#marcado" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-green-400 font-mono">#envenenado</span> <RichDescription text="#envenenado" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-orange-500 font-mono">#queimando</span> <RichDescription text="#queimando" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-cyan-400 font-mono">#congelado</span> <RichDescription text="#congelado" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-red-600 font-mono">#sangrando</span> <RichDescription text="#sangrando" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-zinc-400 font-mono">#rd</span> <RichDescription text="#rd" />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-zinc-400 font-bold mb-2 uppercase text-sm tracking-widest border-b border-zinc-800 pb-1">Dicas de Uso</h3>
                  <ul className="text-[11px] text-zinc-500 list-disc pl-4 space-y-1">
                    <li>Ao editar um campo, as tags aparecerão como texto puro. Elas viram ícones assim que você termina de editar (quando o campo perde o foco).</li>
                    <li>As descrições dos itens equipados e na mochila agora aparecem ao passar o mouse.</li>
                    <li>Pressione <b>Enter</b> na descrição para criar novas linhas; o sistema agora respeita quebras de linha!</li>
                  </ul>
                </section>
              </div>

              <button 
                onClick={() => setShowTips(false)}
                className="w-full mt-8 py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg transition-colors"
              >
                Entendido!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
