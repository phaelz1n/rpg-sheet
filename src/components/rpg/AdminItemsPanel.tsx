import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, X, Sparkles, Search, Info, CheckCircle2, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { RichDescription } from './RichDescription';
import { AutocompleteTextarea } from './AutocompleteTextarea';
import { ttrpgApi } from '../../lib/ttrpg-api';
import { seedDefaultItems } from '../../lib/seeding-service';
import { audioService } from '../../lib/audio-service';
import { ItemVFX } from './ItemVFX';


interface AdminItemsPanelProps {
  onClose: () => void;
}

type ItemType = 'weapon' | 'armor' | 'potion' | 'material' | 'collectible';
type ItemRarity = 'common' | 'rare' | 'legendary' | 'divine';

export interface GlobalItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  particles?: 'none' | 'embers' | 'sparks' | 'void' | 'frost' | 'gold_dust' | 'thunder';
  // Weapon fields
  damage?: string;
  attributeType?: string;
  bonus?: number;
  // Armor/Equipment fields
  equipmentSlot?: 'head' | 'neck' | 'chest' | 'gloves' | 'belt' | 'pants' | 'boots';
  corruptionLimitBonus?: number;
  statBonus?: string;
  beltCapacity?: number; 
  // Potion/Consumable fields
  healingValue?: string;
  effectTarget?: 'health' | 'stamina' | 'sanity' | 'corruption' | 'none';
  effect?: string;
  imageUrl?: string;
}

const rarityColors = {
  common: 'border-gray-500',
  rare: 'border-blue-500',
  legendary: 'border-amber-500',
  divine: 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
};

const rarityLabels = {
  common: 'Comum',
  rare: 'Raro',
  legendary: 'Lendário',
  divine: 'Divino'
};

const typeLabels = {
  weapon: 'Arma',
  armor: 'Armadura',
  potion: 'Poção',
  material: 'Material',
  collectible: 'Colecionável'
};

const slotLabels = {
  head: 'Cabeça',
  neck: 'Pescoço',
  chest: 'Peito',
  gloves: 'Luvas',
  belt: 'Cinto',
  pants: 'Calças',
  boots: 'Botas'
};

const armorTypes = ['head', 'neck', 'chest', 'gloves', 'belt', 'pants', 'boots'];

export function AdminItemsPanel({ onClose }: AdminItemsPanelProps) {
  const [items, setItems] = useState<GlobalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<GlobalItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Toast & Confirm state
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error', visible: boolean}>({ message: '', type: 'success', visible: false });
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({ isOpen: false, message: '', onConfirm: () => {} });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    if (type === 'success') audioService.playSound('SUCCESS');
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState<Partial<GlobalItem>>({
    name: '',
    type: 'weapon',
    equipmentSlot: 'chest',
    rarity: 'common',
    description: '',
    damage: '',
    attributeType: 'dexterity',
    bonus: 0,
    corruptionLimitBonus: 0,
    statBonus: '',
    beltCapacity: 0,
    healingValue: '',
    effectTarget: 'health',
    effect: '',
    imageUrl: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create folder path based on category and slot
      let folder: string = formData.type || 'other';
      if (formData.type === 'armor' && formData.equipmentSlot) {
        folder = `armor/${formData.equipmentSlot}`;
      } else if (formData.type === 'weapon') {
        folder = 'weapons';
      }

      const result = await ttrpgApi.uploadItemImage(folder, file);
      if (result.success && result.url) {
        setFormData({ ...formData, imageUrl: result.url });
        audioService.playSound('EQUIP_NORMAL');
      } else {
        alert('Erro no upload: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Erro inesperado no upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSeed = async () => {
    setConfirmModal({
      isOpen: true,
      message: 'Deseja carregar a lista de itens padrão (armas, armaduras e materiais)?',
      onConfirm: async () => {
        try {
          setLoading(true);
          const createdCount = await seedDefaultItems();
          
          if (createdCount !== null) {
            showToast(`${createdCount} novos itens carregados!`, 'success');
            await loadItems();
          }
        } catch (error) {
          console.error('Error seeding items:', error);
          showToast('Erro ao carregar itens padrão', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };


  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await ttrpgApi.getAllItems();
      if (response.items) {
        setItems(response.items);
      }
    } catch (error) {
      console.error('Error loading items:', error);
      showToast('Erro ao carregar itens', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesRarity = filterRarity === 'all' || item.rarity?.toLowerCase() === filterRarity.toLowerCase();
    return matchesSearch && matchesType && matchesRarity;
  });

  useEffect(() => {
    loadItems();
  }, []);

  const handleCreate = async () => {
    try {
      const response = await ttrpgApi.createItem(formData);
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }

      await loadItems();
      setShowCreateModal(false);
      resetForm();
      showToast('Item criado com sucesso!', 'success');
    } catch (error) {
      console.error('Error creating item:', error);
      showToast('Erro ao criar item', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      const response = await ttrpgApi.updateItem(editingItem.id, formData);
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }

      await loadItems();
      setEditingItem(null);
      resetForm();
      showToast('Item atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Error updating item:', error);
      showToast('Erro ao atualizar item', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const itemToDelete = items.find(i => i.id === id);
    setConfirmModal({
      isOpen: true,
      message: 'Tem certeza que deseja deletar este item?',
      onConfirm: async () => {
        try {
          // 1. Delete the image from storage if it exists
          if (itemToDelete?.imageUrl) {
            await ttrpgApi.deleteFile(itemToDelete.imageUrl);
          }

          // 2. Delete the item from database
          const response = await ttrpgApi.deleteItem(id);
          if (response.error) {
            showToast(response.error, 'error');
            return;
          }

          await loadItems();
          showToast('Item e imagem deletados com sucesso!', 'success');
        } catch (error) {
          console.error('Error deleting item:', error);
          showToast('Erro ao deletar item', 'error');
        }
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    setConfirmModal({
      isOpen: true,
      message: `Tem certeza que deseja deletar os ${selectedIds.size} itens selecionados?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          for (const id of selectedIds) {
            await ttrpgApi.deleteItem(id);
          }
          setSelectedIds(new Set());
          await loadItems();
          showToast('Itens deletados com sucesso!', 'success');
        } catch (error) {
          console.error('Error bulk deleting items:', error);
          showToast('Erro ao deletar alguns itens', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(item => item.id)));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'weapon',
      rarity: 'common',
      description: '',
      damage: '',
      attributeType: 'dexterity',
      bonus: 0,
      corruptionLimitBonus: 0,
      statBonus: '',
      beltCapacity: 0,
      healingValue: '',
      effect: '',
      imageUrl: ''
    });
  };

  const openEditModal = (item: GlobalItem) => {
    setFormData(item);
    setEditingItem(item);
  };

  const renderFormFields = () => {
    const type = formData.type;

    return (
      <div className="space-y-4">
        {/* Item Preview */}
        <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-amber-900/20 rounded-xl mb-4 relative overflow-hidden shadow-inner">
          <div className="text-[10px] text-amber-900 uppercase font-black tracking-widest mb-4">Prévia do Jogador</div>
          <div className="w-24 h-24 relative bg-gradient-to-br from-zinc-900 to-black border border-amber-900/40 rounded-xl flex flex-col items-center justify-center shadow-2xl overflow-hidden group">
            <ItemVFX type={formData.particles} rarity={formData.rarity} name={String(formData.name || '')} />
            {formData.imageUrl ? (
              <img src={formData.imageUrl} alt={String(formData.name || '')} className="absolute inset-0 w-full h-full object-contain z-10 transition-opacity" />
            ) : (
              <Package className={`w-8 h-8 mb-1 relative z-10 ${
                formData.rarity === 'divine' ? 'text-red-500' :
                formData.rarity === 'legendary' ? 'text-amber-400' : 
                formData.rarity === 'rare' ? 'text-blue-400' : 
                'text-zinc-500'
              }`} />
            )}
            <div className={`text-[8px] font-black uppercase text-center leading-tight tracking-tighter px-1 relative z-20 bg-black/60 w-full py-1 ${
              formData.rarity === 'divine' ? 'text-red-400' :
              formData.rarity === 'legendary' ? 'text-amber-300' : 
              formData.rarity === 'rare' ? 'text-blue-300' : 
              'text-zinc-300'
            }`}>
              {String(formData.name || 'Nome do Item')}
            </div>
          </div>
        </div>

        <div>
          <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Ilustração do Item</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="flex-1 bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
              placeholder="Caminho local ou URL externa"
            />
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                disabled={isUploading}
              />
              <button
                type="button"
                className={`h-full px-4 rounded border flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all ${
                  isUploading 
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-500' 
                    : 'bg-amber-900/20 border-amber-900/40 text-amber-400 hover:bg-amber-900/40'
                }`}
              >
                {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                {isUploading ? 'Enviando...' : 'Upload'}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 italic">Dica: Selecione a categoria antes do upload para organizar as pastas no banco.</p>
        </div>

        {/* Common fields */}
        <div>
          <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Nome</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
            placeholder="Nome do item"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ItemType })}
              className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
            >
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Raridade</label>
            <select
              value={formData.rarity}
              onChange={(e) => setFormData({ ...formData, rarity: e.target.value as ItemRarity })}
              className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
            >
              {Object.entries(rarityLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Partículas & Som</label>
            <select
              value={formData.particles || 'none'}
              onChange={(e) => setFormData({ ...formData, particles: e.target.value as any })}
              className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
            >
              <option value="none">Padrão (Sem Aura)</option>
              <option value="embers">Chamas (Fogo + Crepitar)</option>
              <option value="thunder">Trovão (Raios + Impacto)</option>
              <option value="frost">Gelo (Aura Fria)</option>
              <option value="void">Vazio (Corrupção)</option>
              <option value="gold_dust">Poeira de Ouro (Místico)</option>
              <option value="sparks">Faíscas (Metal)</option>
              <option value="poison">Veneno</option>
              <option value="smoke">Fumaça</option>
              <option value="explosion">Explosão</option>
              <option value="sandstorm">Tempestade de Areia</option>
              <option value="water">Água</option>
              <option value="hologram">Holográfico</option>
              <option value="earth">Terra</option>
              <option value="nature">Grama/Mato</option>
              <option value="spark_discharge">Faísca Elétrica</option>
              <option value="feathers">Penas Caindo</option>
              <option value="demonic">Demoníaco</option>
              <option value="bleed">Sangramento</option>
              <option value="splash">Splash</option>
              <option value="gem_reflex">Reflexo de Joia</option>
              <option value="living_paint">Tinta Viva</option>
              <option value="divine">Divino</option>
              <option value="cursed">Amaldiçoado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Descrição</label>
          <AutocompleteTextarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600 min-h-[80px]"
            placeholder="Descrição do item"
          />
        </div>


        {/* Weapon-specific fields */}
        {type === 'weapon' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Dano</label>
                <input
                  type="text"
                  value={formData.damage}
                  onChange={(e) => setFormData({ ...formData, damage: e.target.value })}
                  className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
                  placeholder="Ex: 1d6"
                />
              </div>

              <div>
                <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Atributo</label>
                <select
                  value={formData.attributeType}
                  onChange={(e) => setFormData({ ...formData, attributeType: e.target.value })}
                  className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
                >
                  <option value="dexterity">Destreza</option>
                  <option value="strength">Força</option>
                  <option value="occultism">Ocultismo</option>
                  <option value="faith">Fé</option>
                </select>
              </div>

              <div>
                <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Bônus</label>
                <input
                  type="number"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                  className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </>
        )}

        {/* Armor-specific fields */}
        {type === 'armor' && (
          <div className="space-y-4">
            <div>
              <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Parte do Corpo (Slot)</label>
              <select
                value={formData.equipmentSlot || 'chest'}
                onChange={(e) => setFormData({ ...formData, equipmentSlot: e.target.value as any })}
                className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
              >
                <option value="head">Cabeça</option>
                <option value="neck">Pescoço</option>
                <option value="chest">Peito</option>
                <option value="gloves">Luvas</option>
                <option value="belt">Cinto</option>
                <option value="pants">Calças</option>
                <option value="boots">Botas</option>
              </select>
            </div>
            <div>
              <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Bônus de Defesa</label>
              <input
                type="number"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="text-purple-400 text-sm uppercase tracking-wide mb-1 block">
                +Limite de Corrupção
              </label>
              <p className="text-zinc-500 text-xs mb-2">Quando equipado, aumenta o limite máximo de corrupção do personagem. Ex: Coroa de Ossos = 1</p>
              <input
                type="number"
                value={formData.corruptionLimitBonus ?? 0}
                onChange={(e) => setFormData({ ...formData, corruptionLimitBonus: Number(e.target.value) })}
                className="w-full bg-black/40 border border-purple-900/40 rounded px-4 py-2 text-purple-200 focus:outline-none focus:border-purple-600"
                min={0}
              />
            </div>

            <div>
              <label className="text-amber-400 text-sm uppercase tracking-wide mb-1 block">Bônus em Testes</label>
              <p className="text-zinc-500 text-xs mb-2">Descreva bônus especiais em testes. Ex: "+1 nos testes de Corrupção e Fé"</p>
              <input
                type="text"
                value={formData.statBonus ?? ''}
                onChange={(e) => setFormData({ ...formData, statBonus: e.target.value })}
                className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
                placeholder="Ex: +1 nos testes de Corrupção e Fé"
              />
            </div>

            <div>
              <label className="text-amber-400 text-sm uppercase tracking-wide mb-1 block">Slots de Acesso Rápido (Cinto)</label>
              <p className="text-zinc-500 text-xs mb-2">Se for um cinto, quantos slots de acesso rápido ele oferece. Deixe 0 se não for um cinto.</p>
              <input
                type="number"
                value={formData.beltCapacity ?? 0}
                onChange={(e) => setFormData({ ...formData, beltCapacity: Number(e.target.value) })}
                className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
                min={0}
                max={8}
              />
            </div>
          </div>
        )}

        {/* Potion-specific fields */}
        {type === 'potion' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Alvo do Efeito</label>
                <select
                  value={formData.effectTarget ?? 'health'}
                  onChange={(e) => setFormData({ ...formData, effectTarget: e.target.value as any })}
                  className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
                >
                  <option value="health">Vida</option>
                  <option value="stamina">Stamina</option>
                  <option value="sanity">Sanidade</option>
                  <option value="corruption">Corrupção</option>
                  <option value="none">Outro / Especial</option>
                </select>
              </div>

              <div>
                <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Valor do Bônus/Cura</label>
                <input
                  type="text"
                  value={formData.healingValue}
                  onChange={(e) => setFormData({ ...formData, healingValue: e.target.value })}
                  className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
                  placeholder="Ex: 2d4+2 ou +2"
                />
              </div>
            </div>

            <div>
              <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Descrição do Efeito</label>
              <AutocompleteTextarea
                value={formData.effect}
                onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
                className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600 min-h-[60px]"
                placeholder="Efeitos adicionais da poção"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-black p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-zinc-900/60 p-4 rounded-xl border border-amber-900/40">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-amber-500" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-amber-100 uppercase tracking-tight">Gerenciamento de Itens</h1>
              <p className="text-zinc-500 text-sm">Itens disponíveis para todos os jogadores</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSeed}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm border border-zinc-700 shadow-lg group"
              title="Carregar Itens Iniciais do RPG"
            >
              <Sparkles className="w-4 h-4 text-amber-500 group-hover:animate-pulse" />
              Itens Padrão
            </button>

            <button
              onClick={() => setShowTips(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm border border-zinc-700 shadow-lg"
            >
              <Info className="w-4 h-4 text-amber-500" />
              Dicas
            </button>
            <button
              onClick={() => {
                resetForm();
                setEditingItem(null);
                setShowCreateModal(true);
              }}
              className="bg-green-900/80 hover:bg-green-800 text-green-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm border border-green-700"
            >
              <Plus className="w-4 h-4" />
              Novo Item
            </button>
            <button
              onClick={onClose}
              className="bg-red-900/80 hover:bg-red-800 text-red-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm border border-red-700"
            >
              <X className="w-4 h-4" />
              Fechar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-zinc-900/60 p-4 rounded-xl border border-amber-900/40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full bg-black/40 border border-amber-900/40 rounded-lg pl-10 pr-4 py-2 text-zinc-300 focus:outline-none focus:border-amber-600 text-sm"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black/40 border border-amber-900/40 rounded-lg px-4 py-2 text-zinc-300 focus:outline-none focus:border-amber-600 text-sm"
          >
            <option value="all">Todos os Tipos</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="bg-black/40 border border-amber-900/40 rounded-lg px-4 py-2 text-zinc-300 focus:outline-none focus:border-amber-600 text-sm"
          >
            <option value="all">Todas as Raridades</option>
            {Object.entries(rarityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Bulk Actions Bar */}
        {items.length > 0 && (
          <div className="flex items-center justify-between mb-4 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="text-xs text-amber-400/80 hover:text-amber-400 transition-colors flex items-center gap-1.5"
              >
                {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
              {selectedIds.size > 0 && (
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  {selectedIds.size} selecionado(s)
                </span>
              )}
            </div>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-900/60 hover:bg-red-900 border border-red-700 rounded px-3 py-1.5 text-xs text-red-200 flex items-center gap-2 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir Selecionados
              </button>
            )}
          </div>
        )}

        {/* Items Grid */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-black/90 border-2 border-amber-900/60 rounded-xl p-6 shadow-xl">
          <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Itens Criados ({filteredItems.length})
            </div>
            {filteredItems.length < items.length && (
              <span className="text-zinc-500 text-[10px] normal-case">
                Filtrado de {items.length} itens total
              </span>
            )}
          </h2>

          {loading ? (
            <div className="text-center py-12 text-zinc-500">
              Carregando itens...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              Nenhum item corresponde aos filtros
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`bg-gradient-to-br from-zinc-800/80 to-black/90 border-2 ${
                    selectedIds.has(item.id) ? 'border-amber-500 bg-amber-900/10' : rarityColors[item.rarity]
                  } rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all relative group cursor-pointer overflow-hidden`}
                >
                  <ItemVFX type={item.particles} rarity={item.rarity} name={item.name} />
                  
                  <div className="mb-3 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded bg-black/40 border border-amber-900/20 flex items-center justify-center overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <Package className="w-4 h-4 text-amber-700/50" />
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors truncate max-w-[140px]">
                          {String(item.name || '')}
                        </h3>
                      </div>
                      
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => openEditModal(item)}
                          className="w-7 h-7 bg-amber-900/40 border border-amber-700/40 rounded flex items-center justify-center hover:bg-amber-800 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-amber-100" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-7 h-7 bg-red-900/40 border border-red-700/40 rounded flex items-center justify-center hover:bg-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-100" />
                        </button>
                      </div>

                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.id);
                        }}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-inner cursor-pointer ${
                          selectedIds.has(item.id) 
                            ? 'bg-amber-500 border-amber-300 scale-110 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                            : 'bg-black/40 border-zinc-700 hover:border-amber-900'
                        }`}
                      >
                        {selectedIds.has(item.id) && <div className="w-2 h-2 bg-black rounded-full" />}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3 text-[10px] uppercase tracking-tighter">
                      <span className={`px-2 py-0.5 rounded border ${
                        item.rarity === 'divine' ? 'bg-red-950/40 border-red-800/50 text-red-400' :
                        item.rarity === 'rare' ? 'bg-blue-950/40 border-blue-800/50 text-blue-300' :
                        item.rarity === 'legendary' ? 'bg-amber-950/40 border-amber-800/50 text-amber-300' :
                        'bg-zinc-800/40 border-zinc-700/50 text-zinc-400'
                      }`}>
                        {item.rarity === 'divine' ? 'Divino' : 
                         item.rarity === 'rare' ? 'Raro' : 
                         item.rarity === 'legendary' ? 'Lendário' : 'Comum'}
                      </span>
                      <span className="px-2 py-0.5 bg-zinc-800/60 border border-zinc-700 rounded text-zinc-400 flex items-center gap-1">
                        {String(typeLabels[item.type] || item.type)}
                        {item.type === 'armor' && item.equipmentSlot && (
                          <span className="text-zinc-500 uppercase text-[8px] border-l border-zinc-700 pl-1 ml-1">{String(slotLabels[item.equipmentSlot] || item.equipmentSlot)}</span>
                        )}
                      </span>
                      {item.particles && item.particles !== 'none' && (
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500/80 flex items-center gap-1 lowercase">
                          <Sparkles className="w-2.5 h-2.5" />
                          {item.particles}
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-400 text-xs line-clamp-3 min-h-[40px]">
                      <RichDescription text={item.description} />
                    </div>
                  </div>

                  {item.type === 'weapon' && (
                    <div className="text-xs text-zinc-500 space-y-1">
                      <div>Dano: <span className="text-red-400">{String(item.damage || '0')}</span></div>
                      <div>Bônus: <span className="text-amber-400">+{String(item.bonus || '0')}</span></div>
                    </div>
                  )}

                  {item.type === 'armor' && (
                    <div className="text-xs text-zinc-500 space-y-1">
                      {(item.bonus ?? 0) > 0 && <div>Defesa: <span className="text-blue-400">+{String(item.bonus)}</span></div>}
                      {(item.corruptionLimitBonus ?? 0) > 0 && (
                        <div>Corrupção Limite: <span className="text-purple-400">+{String(item.corruptionLimitBonus)}</span></div>
                      )}
                      {(item.beltCapacity ?? 0) > 0 && (
                        <div>Slots Cinto: <span className="text-amber-400">{String(item.beltCapacity)}</span></div>
                      )}
                      {item.statBonus && (
                        <div className="text-amber-400/80 italic text-[11px]">
                          <RichDescription text={typeof item.statBonus === 'string' ? item.statBonus : ''} />
                        </div>
                      )}
                    </div>
                  )}

                  {item.type === 'potion' && (
                    <div className="text-xs text-zinc-500 space-y-1">
                      <div>Alvo: <span className="text-blue-400 uppercase">{
                        item.effectTarget === 'health' ? 'Vida' :
                        item.effectTarget === 'stamina' ? 'Stamina' :
                        item.effectTarget === 'sanity' ? 'Sanidade' :
                        item.effectTarget === 'corruption' ? 'Corrupção' : 'Especial'
                      }</span></div>
                      <div>Valor: <span className="text-green-400">{String(item.healingValue || '0')}</span></div>
                      {item.effect && (
                        <div className="text-purple-400 line-clamp-1">
                          <RichDescription text={typeof item.effect === 'string' ? item.effect : ''} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingItem) && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-900/60 rounded-xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl text-amber-400">
                  {editingItem ? 'Editar Item' : 'Criar Item'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {renderFormFields()}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingItem ? handleUpdate : handleCreate}
                    className="flex-1 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700/50 rounded-lg px-4 py-3 text-green-300 hover:from-green-900/70 hover:to-emerald-900/70 transition-colors"
                  >
                    {editingItem ? 'Atualizar' : 'Criar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Modal de Dicas */}
        {showTips && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-900/60 rounded-xl p-6 max-w-3xl w-full shadow-2xl relative text-left">
              <button 
                onClick={() => setShowTips(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3">
                <Info className="w-7 h-7" />
                Dicas para o Mestre e Tags
              </h2>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar text-left">
                <section>
                  <h3 className="text-amber-500 font-bold mb-2 uppercase text-sm tracking-widest border-b border-amber-900/30 pb-1">Atributos e Recursos</h3>
                  <p className="text-zinc-400 text-xs mb-3">Ao criar itens, digite <span className="font-mono text-amber-400">#</span> no campo de Descrição para abrir o menu de autocompletar:</p>
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
                    ⚡ Tabela de Afinidade Elemental
                  </h3>
                  <p className="text-[11px] text-zinc-400 mb-4">
                    Os tipos de dano elemental causam **Dano Dobrado (2x)** ou **Metade do Dano (0.5x)** contra inimigos afinados a certos elementos:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                      { name: 'Fogo', icon: '🔥', color: 'text-orange-400', strong: ['#gelo', '#planta'], weak: ['#água', '#terra'] },
                      { name: 'Água', icon: '💧', color: 'text-blue-400', strong: ['#fogo', '#terra', '#ácido'], weak: ['#planta', '#raio'] },
                      { name: 'Gelo', icon: '❄️', color: 'text-cyan-300', strong: ['#planta', '#terra'], weak: ['#fogo', '#raio'] },
                      { name: 'Raio', icon: '⚡', color: 'text-yellow-300', strong: ['#água', '#gelo', '#balístico'], weak: ['#terra', '#planta'] },
                      { name: 'Terra', icon: '⛰️', color: 'text-yellow-700', strong: ['#raio', '#ácido', '#fogo'], weak: ['#água', '#gelo', '#planta'] },
                      { name: 'Planta', icon: '🌿', color: 'text-green-500', strong: ['#água', '#terra'], weak: ['#fogo', '#gelo', '#ácido'] },
                      { name: 'Ácido', icon: '🧪', color: 'text-lime-400', strong: ['#planta', '#balístico', '#contusão'], weak: ['#água', '#terra'] },
                      { name: 'Luz', icon: '☀️', color: 'text-amber-300', strong: ['#trevas'], weak: [] },
                      { name: 'Trevas', icon: '🌙', color: 'text-purple-900', strong: ['#luz'], weak: [] },
                      { name: 'Mental', icon: '🧠', color: 'text-pink-400', strong: ['#balístico', '#corte', '#perfurante', '#contusão'], weak: ['#trevas', '#luz'] },
                      { name: 'Sonoro', icon: '🔊', color: 'text-cyan-500', strong: ['#mental', '#gelo'], weak: ['#terra'] },
                      { name: 'Explosão', icon: '💥', color: 'text-red-500', strong: ['#terra', '#contusão'], weak: ['#gelo', '#água'] }
                    ].map(elem => (
                      <div key={elem.name} className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/80 flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-bold text-zinc-200 border-b border-zinc-800 pb-1.5">
                          <span>{elem.icon}</span>
                          <span className={elem.color}>{elem.name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="text-emerald-500 font-bold shrink-0">Forte (2x):</span>
                          {elem.strong.map(tag => (
                            <RichDescription key={tag} text={tag} />
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="text-rose-500 font-bold shrink-0">Fraco (0.5x):</span>
                          {elem.weak.map(tag => (
                            <RichDescription key={tag} text={tag} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-zinc-800/60 pt-3 text-[10px] text-zinc-500 text-center">
                    * Danos físicos convencionais (<RichDescription text="#corte" />, <RichDescription text="#perfurante" />, <RichDescription text="#contusão" /> e <RichDescription text="#balístico" />) interagem conforme o equipamento defensivo e armaduras do alvo.
                  </div>
                </section>

                <section>
                  <h3 className="text-zinc-400 font-bold mb-2 uppercase text-sm tracking-widest border-b border-zinc-800 pb-1">Dicas de Organização</h3>
                  <ul className="text-[11px] text-zinc-500 list-disc pl-4 space-y-1">
                    <li>A ficha dos jogadores sincroniza com o banco de dados. Mudanças aqui afetam todos os jogadores que possuem o item.</li>
                    <li>Todas as perícias da ficha viraram tags! Ex: <span className="text-amber-400 font-mono">#acrobacia</span>, <span className="text-amber-400 font-mono">#medicina</span>.</li>
                    <li>O campo "Bônus em Testes" também suporta hashtags! Ex: "+1 em testes de #intimidação".</li>
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
        
        {/* Custom Confirm Modal */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
            <div className="bg-zinc-950 border border-amber-900/40 rounded-xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-amber-400 mb-2">Confirmação</h3>
              <p className="text-zinc-300 text-sm mb-6">{confirmModal.message}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium rounded-lg transition-colors text-sm border border-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                  }}
                  className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-400 font-medium rounded-lg transition-colors text-sm border border-red-900/50"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Toast */}
        <div 
          className={`fixed bottom-4 right-4 z-[300] transition-all duration-300 transform ${
            toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
          }`}
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-green-950/90 border-green-900/50 text-green-400' 
              : 'bg-red-950/90 border-red-900/50 text-red-400'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
