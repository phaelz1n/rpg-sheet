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
  category: 'weapon' | 'armor' | 'consumable';
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
  const [characterName, setCharacterName] = useState('Vespera, o Estigma do Arrependimento');
  const [characterClass, setCharacterClass] = useState('Herege (Ocultista)');
  const [characterFaction, setCharacterFaction] = useState('Os Descrentes');
  const [characterCodename, setCharacterCodename] = useState('Estigma do Arrependimento');
  const [characterPortrait, setCharacterPortrait] = useState('');

  // Status states
  const [health, setHealth] = useState(12);
  const [maxHealth, setMaxHealth] = useState(12);
  const [sanity, setSanity] = useState(10);
  const [maxSanity, setMaxSanity] = useState(10);
  const [mana, setMana] = useState(8);
  const [maxMana, setMaxMana] = useState(8);
  const [stamina, setStamina] = useState(6);
  const [maxStamina, setMaxStamina] = useState(6);
  const [corruption, setCorruption] = useState(0);

  // Attribute states
  const [occultism, setOccultism] = useState(3);
  const [dexterity, setDexterity] = useState(3);
  const [vigor, setVigor] = useState(2);
  const [willpower, setWillpower] = useState(0);
  const [strength, setStrength] = useState(-1);
  const [faith, setFaith] = useState(-1);

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
  const [abilities, setAbilities] = useState<Ability[]>([
    {
      id: '1',
      name: 'Cinzas do Purgatório',
      type: 'action',
      icon: Flame,
      manaCost: 3,
      test: '2d6+3',
      damage: '2d8 Sombrio',
      effect: 'Conjura um vórtice giratório de cinzas escuras que queima inimigos por dentro. O alvo deve ter sucesso em um teste de Vontade ou sofrer dano total e ficar marcado por 1 turno.'
    },
    {
      id: '2',
      name: 'Fervor dos Condenados',
      type: 'action',
      icon: Droplet,
      manaCost: 2,
      corruptionCost: 1,
      test: '2d6+3',
      damage: '1d10 Fogo',
      effect: 'Canaliza fervor profano em um golpe devastador. Causa dano de fogo e ganha pontos de vida temporários iguais à metade do dano causado.'
    },
    {
      id: '3',
      name: 'Maldição Imperius',
      type: 'action',
      icon: Skull,
      manaCost: 4,
      corruptionCost: 2,
      test: '2d6+3',
      damage: 'Especial',
      effect: 'Tenta dominar a vontade de um alvo. Em caso de sucesso, controla o alvo por 1d4 rodadas. O alvo age na sua iniciativa.',
      backlash: 'Em caso de falha, sofre 1d6 de dano psíquico e perde 1 de Sanidade.'
    },
    {
      id: '4',
      name: 'Colheita das Sombras',
      type: 'passive',
      icon: Moon,
      effect: 'Sempre que um inimigo morre a até 9 metros de você, colhe sua essência dissipante. Restaura 2 de Mana imediatamente. Este efeito é ativado uma vez por inimigo e não pode exceder sua Mana máxima.'
    }
  ]);

  // Equipment states
  const [equipmentHead, setEquipmentHead] = useState('Coroa de Ossos');
  const [equipmentNeck, setEquipmentNeck] = useState('Foco de Fé');
  const [equipmentChest, setEquipmentChest] = useState('');
  const [equipmentGloves, setEquipmentGloves] = useState('');
  const [equipmentBelt, setEquipmentBelt] = useState('Bainha de Acesso Rápido');
  const [equipmentPants, setEquipmentPants] = useState('');
  const [equipmentBoots, setEquipmentBoots] = useState('');

  // Belt slots state
  const [beltSlot1, setBeltSlot1] = useState('Adaga de Ferro Frio');
  const [beltSlot2, setBeltSlot2] = useState('Picareta');
  const [beltSlot3, setBeltSlot3] = useState('');
  const [beltSlot4, setBeltSlot4] = useState('');

  // Weapon states
  const [mainWeapon, setMainWeapon] = useState({
    name: 'Chama do Arrependimento',
    damage: '2d6+DES',
    bonus: '+3'
  });
  const [offWeapon, setOffWeapon] = useState({
    name: '',
    damage: '',
    bonus: ''
  });

  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Pedras de Lodo', quantity: 5, icon: Gem, description: 'Essência cristalizada escura. Usada em rituais ocultos.' },
    { id: '2', name: 'Pedras de Lodo', quantity: 2, icon: Gem, description: 'Essência cristalizada escura. Usada em rituais ocultos.' },
    { id: '3', name: 'Pedra Cinza', quantity: 1, icon: Gem, description: 'Uma pedra cinza misteriosa com runas fracas.' },
    { id: '4', name: 'Filés de Peixe', quantity: 5, icon: Fish, description: 'Peixe preservado. Restaura 1d4 de Vida quando consumido.' },
    { id: '5', name: 'Filés de Peixe', quantity: 4, icon: Fish, description: 'Peixe preservado. Restaura 1d4 de Vida quando consumido.' },
    { id: '6', name: 'Bolsa de Moedas', quantity: 1, icon: Coins, description: 'Contém 6 moedas de ouro.' },
  ]);

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
    occultism: 3,
    dexterity: 3,
    vigor: 2,
    willpower: 0,
    strength: -1,
    faith: -1
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
          damage: item.damage || '1d6',
          category: item.type === 'weapon' ? 'weapon' : item.type === 'armor' ? 'armor' : 'consumable'
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

  const saveCharacterDataManual = () => {
    saveCharacterData();
    alert('Ficha salva com sucesso!');
  };

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

      setCharacterName(data.characterName || 'Vespera, o Estigma do Arrependimento');
      setCharacterClass(data.characterClass || 'Herege (Ocultista)');
      setCharacterFaction(data.characterFaction || 'Os Descrentes');
      setCharacterCodename(data.characterCodename || 'Estigma do Arrependimento');
      setCharacterPortrait(data.characterPortrait || '');
      setHealth(data.health || 12);
      setMaxHealth(data.maxHealth || 12);
      setSanity(data.sanity || 10);
      setMaxSanity(data.maxSanity || 10);
      setMana(data.mana || 8);
      setMaxMana(data.maxMana || 8);
      setStamina(data.stamina || 6);
      setMaxStamina(data.maxStamina || 6);
      setCorruption(data.corruption || 0);
      setOccultism(data.occultism || 3);
      setDexterity(data.dexterity || 3);
      setVigor(data.vigor || 2);
      setWillpower(data.willpower || 0);
      setStrength(data.strength || -1);
      setFaith(data.faith || -1);
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
      })) : abilities;
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
        console.log('Nenhum dado salvo encontrado, usando valores padrão');
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
            onClick={saveCharacterDataManual}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-900/50 border border-green-700/50 rounded-lg text-green-300 hover:bg-green-900/70 transition-colors text-xs sm:text-sm"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Salvar</span>
            <span className="sm:hidden">Salvar</span>
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
                  className="text-base sm:text-xl md:text-2xl text-amber-400 tracking-wide bg-transparent border-b border-transparent hover:border-amber-800/50 focus:border-amber-600 focus:outline-none w-full"
                />
                <div className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">Classe:</span>
                    <input
                      type="text"
                      value={characterClass}
                      onChange={(e) => setCharacterClass(e.target.value)}
                      className="text-amber-300 bg-transparent border-b border-transparent hover:border-amber-800/50 focus:border-amber-600 focus:outline-none max-w-[120px] sm:max-w-none"
                    />
                  </div>
                  <div className="w-px h-4 bg-zinc-700 hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">Facção:</span>
                    <input
                      type="text"
                      value={characterFaction}
                      onChange={(e) => setCharacterFaction(e.target.value)}
                      className="text-amber-300 bg-transparent border-b border-transparent hover:border-amber-800/50 focus:border-amber-600 focus:outline-none max-w-[120px] sm:max-w-none"
                    />
                  </div>
                  <div className="w-px h-4 bg-zinc-700 hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <Skull className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                    <input
                      type="text"
                      value={characterCodename}
                      onChange={(e) => setCharacterCodename(e.target.value)}
                      className="text-purple-400 bg-transparent border-b border-transparent hover:border-purple-800/50 focus:border-purple-600 focus:outline-none max-w-[150px] sm:max-w-none"
                    />
                  </div>
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
              <CorruptionGauge
                current={corruption}
                max={10}
                limit="Limite da Coroa de Ossos"
                onCurrentChange={setCorruption}
              />
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
                <HexAttributeCard name="Ocultismo" bonus={occultism} level="Especialista" icon={Eye} onBonusChange={setOccultism} />
                <HexAttributeCard name="Destreza" bonus={dexterity} level="Especialista" icon={Hand} onBonusChange={setDexterity} />
                <HexAttributeCard name="Vigor" bonus={vigor} level="Competente" icon={Heart} onBonusChange={setVigor} />
                <HexAttributeCard name="Vontade" bonus={willpower} level="Humano" icon={Brain} onBonusChange={setWillpower} />
                <HexAttributeCard name="Força" bonus={strength} level="Fraco" icon={Sword} onBonusChange={setStrength} />
                <HexAttributeCard name="Fé" bonus={faith} level="Fraco" icon={Flame} onBonusChange={setFaith} />
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
                <DamageReductionBadge value={1} />
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
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <BeltSlot
                  itemName={beltSlot1}
                  icon={beltSlot1 ? Swords : undefined}
                  description="1d4 de dano perfurante. Eficaz contra criaturas mágicas."
                  onItemNameChange={setBeltSlot1}
                  onClear={() => setBeltSlot1('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'weapon', slot: 'belt1' })}
                />
                <BeltSlot
                  itemName={beltSlot2}
                  icon={beltSlot2 ? Pickaxe : undefined}
                  description="1d6+FOR, 2 mãos. Ferramenta de mineiro."
                  onItemNameChange={setBeltSlot2}
                  onClear={() => setBeltSlot2('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'weapon', slot: 'belt2' })}
                />
                <BeltSlot
                  itemName={beltSlot3}
                  onItemNameChange={setBeltSlot3}
                  onClear={() => setBeltSlot3('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'weapon', slot: 'belt3' })}
                />
                <BeltSlot
                  itemName={beltSlot4}
                  onItemNameChange={setBeltSlot4}
                  onClear={() => setBeltSlot4('')}
                  onAddClick={() => setItemSelectionModal({ isOpen: true, type: 'weapon', slot: 'belt4' })}
                />
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
          items={rpgItems.filter(item => item.category === itemSelectionModal.type)}
          onClose={() => setItemSelectionModal({ isOpen: false, type: null })}
          onSelect={(item) => {
            const rpgItem = item as RPGItem;
            if (itemSelectionModal.type === 'weapon' && itemSelectionModal.slot) {
              if (itemSelectionModal.slot === 'main' || itemSelectionModal.slot === 'off') {
                equipItemAsWeapon(rpgItem, itemSelectionModal.slot);
              } else if (itemSelectionModal.slot.startsWith('belt')) {
                const beltNum = itemSelectionModal.slot.replace('belt', '');
                if (beltNum === '1') setBeltSlot1(rpgItem.name);
                else if (beltNum === '2') setBeltSlot2(rpgItem.name);
                else if (beltNum === '3') setBeltSlot3(rpgItem.name);
                else if (beltNum === '4') setBeltSlot4(rpgItem.name);
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
