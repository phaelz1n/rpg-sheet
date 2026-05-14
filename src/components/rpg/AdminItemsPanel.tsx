import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, X, Sparkles, Search, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { RichDescription } from './RichDescription';
import { AutocompleteTextarea } from './AutocompleteTextarea';
import { ttrpgApi } from '../../lib/ttrpg-api';
import { seedDefaultItems } from '../../lib/seeding-service';
import { audioService } from '../../lib/audio-service';


interface AdminItemsPanelProps {
  onClose: () => void;
}

type ItemType = 'weapon' | 'armor' | 'potion' | 'material' | 'collectible';
type ItemRarity = 'common' | 'rare' | 'legendary';

interface GlobalItem {
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
}

const rarityColors = {
  common: 'border-gray-500',
  rare: 'border-blue-500',
  legendary: 'border-amber-500'
};

const rarityLabels = {
  common: 'Comum',
  rare: 'Raro',
  legendary: 'Lendário'
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
    effect: ''
  });

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
    const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
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
    setConfirmModal({
      isOpen: true,
      message: 'Tem certeza que deseja deletar este item?',
      onConfirm: async () => {
        try {
          const response = await ttrpgApi.deleteItem(id);
          if (response.error) {
            showToast(response.error, 'error');
            return;
          }

          await loadItems();
          showToast('Item deletado com sucesso!', 'success');
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
      effect: ''
    });
  };

  const openEditModal = (item: GlobalItem) => {
    setFormData(item);
    setEditingItem(item);
  };

  const renderFormFields = () => {
    const type = formData.type;

    return (
      <>
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
      </>
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
                  className={`bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border-2 ${
                    selectedIds.has(item.id) ? 'border-amber-500 bg-amber-900/10' : rarityColors[item.rarity]
                  } rounded-lg p-4 shadow-lg hover:shadow-xl transition-all relative group cursor-pointer`}
                >
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Package className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <h3 className="text-amber-300 font-bold text-sm truncate">{item.name}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => openEditModal(item)}
                            className="w-7 h-7 bg-blue-900/40 border border-blue-700/40 rounded flex items-center justify-center hover:bg-blue-800 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-blue-100" />
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
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3 text-[10px] uppercase tracking-tighter">
                      <span className={`px-2 py-0.5 rounded border ${
                        item.rarity === 'rare' ? 'bg-blue-950/40 border-blue-800/50 text-blue-300' :
                        item.rarity === 'legendary' ? 'bg-amber-950/40 border-amber-800/50 text-amber-300' :
                        'bg-zinc-800/40 border-zinc-700/50 text-zinc-400'
                      }`}>
                        {item.rarity === 'rare' ? 'Raro' : item.rarity === 'legendary' ? 'Lendário' : 'Comum'}
                      </span>
                      <span className="px-2 py-0.5 bg-zinc-800/60 border border-zinc-700 rounded text-zinc-400 flex items-center gap-1">
                        {typeLabels[item.type]}
                        {item.type === 'armor' && item.equipmentSlot && (
                          <span className="text-zinc-500 uppercase text-[8px] border-l border-zinc-700 pl-1 ml-1">{slotLabels[item.equipmentSlot]}</span>
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
                      <div>Dano: <span className="text-red-400">{item.damage}</span></div>
                      <div>Bônus: <span className="text-amber-400">+{item.bonus}</span></div>
                    </div>
                  )}

                  {item.type === 'armor' && (
                    <div className="text-xs text-zinc-500 space-y-1">
                      {(item.bonus ?? 0) > 0 && <div>Defesa: <span className="text-blue-400">+{item.bonus}</span></div>}
                      {(item.corruptionLimitBonus ?? 0) > 0 && (
                        <div>Corrupção Limite: <span className="text-purple-400">+{item.corruptionLimitBonus}</span></div>
                      )}
                      {(item.beltCapacity ?? 0) > 0 && (
                        <div>Slots Cinto: <span className="text-amber-400">{item.beltCapacity}</span></div>
                      )}
                      {item.statBonus && (
                        <div className="text-amber-400/80 italic text-[11px]">
                          <RichDescription text={item.statBonus} />
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
                      <div>Valor: <span className="text-green-400">{item.healingValue}</span></div>
                      {item.effect && <div className="text-purple-400 line-clamp-1">{item.effect}</div>}
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
            <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-900/60 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative">
              <button 
                onClick={() => setShowTips(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3">
                <Info className="w-7 h-7" />
                Dicas para o Mestre
              </h2>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar text-left">
                <section>
                  <h3 className="text-amber-500 font-bold mb-2 uppercase text-sm tracking-widest border-b border-amber-900/30 pb-1">Menu de Autocompletar</h3>
                  <p className="text-zinc-400 text-xs mb-3">Ao criar itens, digite <span className="font-mono text-amber-400">#</span> no campo de Descrição para abrir o menu de ícones visuais:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-amber-400 font-mono">#força</span> <RichDescription text="#força" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-amber-400 font-mono">#destreza</span> <RichDescription text="#destreza" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-amber-400 font-mono">#fé</span> <RichDescription text="#fé" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-red-400 font-mono">#marcado</span> <RichDescription text="#marcado" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-green-400 font-mono">#envenenado</span> <RichDescription text="#envenenado" />
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-zinc-300 flex items-center justify-between">
                      <span className="text-zinc-400 font-mono">#rd</span> <RichDescription text="#rd" />
                    </div>
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
