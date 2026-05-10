import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, X, Sparkles } from 'lucide-react';
import { ttrpgApi } from '../../api/ttrpg-api';

interface AdminItemsPanelProps {
  onClose: () => void;
}

type ItemType = 'weapon' | 'armor' | 'potion' | 'material' | 'collectible';
type ItemRarity = 'common' | 'uncommon' | 'epic' | 'legendary';

interface GlobalItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  // Weapon fields
  damage?: string;
  attributeType?: string;
  bonus?: number;
  // Potion fields
  healingValue?: string;
  effect?: string;
}

const rarityColors = {
  common: 'border-gray-500',
  uncommon: 'border-green-500',
  epic: 'border-purple-500',
  legendary: 'border-orange-500'
};

const rarityLabels = {
  common: 'Comum',
  uncommon: 'Incomum',
  epic: 'Épico',
  legendary: 'Lendário'
};

const typeLabels = {
  weapon: 'Arma',
  armor: 'Armadura',
  potion: 'Poção',
  material: 'Material',
  collectible: 'Colecionável'
};

export function AdminItemsPanel({ onClose }: AdminItemsPanelProps) {
  const [items, setItems] = useState<GlobalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<GlobalItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<GlobalItem>>({
    name: '',
    type: 'weapon',
    rarity: 'common',
    description: '',
    damage: '',
    attributeType: 'dexterity',
    bonus: 0,
    healingValue: '',
    effect: ''
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await ttrpgApi.getAllItems();
      if (response.items) {
        setItems(response.items);
      }
    } catch (error) {
      console.error('Error loading items:', error);
      alert('Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleCreate = async () => {
    try {
      const response = await ttrpgApi.createItem(formData);
      if (response.error) {
        alert(response.error);
        return;
      }

      await loadItems();
      setShowCreateModal(false);
      resetForm();
      alert('Item criado com sucesso!');
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Erro ao criar item');
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      const response = await ttrpgApi.updateItem(editingItem.id, formData);
      if (response.error) {
        alert(response.error);
        return;
      }

      await loadItems();
      setEditingItem(null);
      resetForm();
      alert('Item atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Erro ao atualizar item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return;

    try {
      const response = await ttrpgApi.deleteItem(id);
      if (response.error) {
        alert(response.error);
        return;
      }

      await loadItems();
      alert('Item deletado com sucesso!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Erro ao deletar item');
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div>
          <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Descrição</label>
          <textarea
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
          <div>
            <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Bônus de Defesa</label>
            <input
              type="number"
              value={formData.bonus}
              onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
              className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
            />
          </div>
        )}

        {/* Potion-specific fields */}
        {type === 'potion' && (
          <>
            <div>
              <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Valor de Cura</label>
              <input
                type="text"
                value={formData.healingValue}
                onChange={(e) => setFormData({ ...formData, healingValue: e.target.value })}
                className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
                placeholder="Ex: 2d4+2"
              />
            </div>

            <div>
              <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 block">Efeito Adicional</label>
              <textarea
                value={formData.effect}
                onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
                className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600 min-h-[60px]"
                placeholder="Efeitos adicionais da poção"
              />
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-black p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-2 border-amber-700/60 rounded-xl p-4 sm:p-6 mb-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
              <div>
                <h1 className="text-lg sm:text-2xl text-amber-300">Gerenciamento de Itens</h1>
                <p className="text-amber-400/70 text-xs sm:text-sm">Itens disponíveis para todos os jogadores</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-900/50 border border-green-700/50 rounded-lg text-green-300 hover:bg-green-900/70 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo Item
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-red-300 hover:bg-red-900/70 transition-colors"
              >
                <X className="w-4 h-4" />
                Fechar
              </button>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-black/90 border-2 border-amber-900/60 rounded-xl p-6 shadow-xl">
          <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Itens Criados ({items.length})
          </h2>

          {loading ? (
            <div className="text-center py-12 text-zinc-500">
              Carregando itens...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              Nenhum item criado ainda
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border-2 ${rarityColors[item.rarity]} rounded-lg p-4 shadow-lg hover:shadow-xl transition-all relative group`}
                >
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="w-7 h-7 bg-blue-900/80 border border-blue-700 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-800"
                    >
                      <Edit className="w-4 h-4 text-blue-100" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-7 h-7 bg-red-900/80 border border-red-700 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800"
                    >
                      <Trash2 className="w-4 h-4 text-red-100" />
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-amber-500" />
                      <h3 className="text-amber-300 font-bold text-sm">{item.name}</h3>
                    </div>
                    <div className="flex gap-2 text-xs mb-2">
                      <span className={`px-2 py-0.5 rounded ${rarityColors[item.rarity]} bg-black/40`}>
                        {rarityLabels[item.rarity]}
                      </span>
                      <span className="px-2 py-0.5 rounded border border-zinc-600 bg-black/40 text-zinc-400">
                        {typeLabels[item.type]}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs line-clamp-2">{item.description}</p>
                  </div>

                  {item.type === 'weapon' && (
                    <div className="text-xs text-zinc-500 space-y-1">
                      <div>Dano: <span className="text-red-400">{item.damage}</span></div>
                      <div>Bônus: <span className="text-amber-400">+{item.bonus}</span></div>
                    </div>
                  )}

                  {item.type === 'armor' && (
                    <div className="text-xs text-zinc-500">
                      Defesa: <span className="text-blue-400">+{item.bonus}</span>
                    </div>
                  )}

                  {item.type === 'potion' && (
                    <div className="text-xs text-zinc-500 space-y-1">
                      <div>Cura: <span className="text-green-400">{item.healingValue}</span></div>
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
      </div>
    </div>
  );
}
