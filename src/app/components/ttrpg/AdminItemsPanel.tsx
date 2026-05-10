import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, X, Sparkles, Search } from 'lucide-react';
import { ttrpgApi } from '../../api/ttrpg-api';

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
  // Weapon fields
  damage?: string;
  attributeType?: string;
  bonus?: number;
  // Armor/Equipment fields
  corruptionLimitBonus?: number;
  statBonus?: string;
  beltCapacity?: number; // Quantidade de slots de acesso rápido que o cinto oferece
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

export function AdminItemsPanel({ onClose }: AdminItemsPanelProps) {
  const [items, setItems] = useState<GlobalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<GlobalItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState<Partial<GlobalItem>>({
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
    effectTarget: 'health',
    effect: ''
  });

  const seedDefaultItems = async () => {
    if (!confirm('Deseja carregar a lista de itens padrão (armas, armaduras e materiais)?')) return;
    
    const minerals = [
      // <--- MINÉRIOS COMUNS (15) --->
      { name: 'Ferro Velho', type: 'material', rarity: 'common', description: 'Minério comum usado para forjar e reparar armas básicas.' },
      { name: 'Pedra Cinzenta', type: 'material', rarity: 'common', description: 'Pedra básica usada em processos de alquimia simples.' },
      { name: 'Carvão Negro', type: 'material', rarity: 'common', description: 'Combustível comum para forjas e rituais de fogo.' },
      { name: 'Quartzo Opaco', type: 'material', rarity: 'common', description: 'Cristal fosco usado em misturas alquímicas.' },
      { name: 'Argilita Sombria', type: 'material', rarity: 'common', description: 'Argila escura imbuída de leves traços de energia espiritual.' },
      { name: 'Calcita Fria', type: 'material', rarity: 'common', description: 'Mineral que mantém uma temperatura baixa constante. Alquimia/Rituais.' },
      { name: 'Pedra de Lodo', type: 'material', rarity: 'common', description: 'Pedra viscosa usada para forjar armas de natureza flexível.' },
      { name: 'Sílex Rachado', type: 'material', rarity: 'common', description: 'Pedra afiada usada para criar faíscas e armas rudimentares.' },
      { name: 'Areia Ferrosa', type: 'material', rarity: 'common', description: 'Grãos de metal fino usados em processos alquímicos.' },
      { name: 'Rocha Bruta', type: 'material', rarity: 'common', description: 'Pedaço pesado e irregular usado em armas de impacto.' },
      { name: 'Estilhaço de Basalto', type: 'material', rarity: 'common', description: 'Pedaço de rocha vulcânica densa usado em armaduras.' },
      { name: 'Terra Endurecida', type: 'material', rarity: 'common', description: 'Solo compactado por pressões místicas. Alquimia/Rituais.' },
      { name: 'Fragmento Calcificado', type: 'material', rarity: 'common', description: 'Restos endurecidos usados em rituais de ossos.' },
      { name: 'Pedra Turva', type: 'material', rarity: 'common', description: 'Uma pedra que parece absorver a luz, usada em armas sombrias.' },
      { name: 'Minério Ferrugem', type: 'material', rarity: 'common', description: 'Metal oxidado usado para armas de desgaste.' },

      // <--- MINÉRIOS RAROS (10) --->
      { name: 'Sangrita', type: 'material', rarity: 'rare', description: 'Cristal avermelhado que pulsa como um coração. Rituais.' },
      { name: 'Umbraferro', type: 'material', rarity: 'rare', description: 'Metal forjado nas sombras para armas furtivas.' },
      { name: 'Virulita', type: 'material', rarity: 'rare', description: 'Mineral tóxico usado em armas e rituais de praga.' },
      { name: 'Cinzalma', type: 'material', rarity: 'rare', description: 'Resíduo de almas incineradas. Armas/Rituais/Alquimia.' },
      { name: 'Raiz-Ferro', type: 'material', rarity: 'rare', description: 'Madeira petrificada extremamente dura usada em armas.' },
      { name: 'Olho de Ébano', type: 'material', rarity: 'rare', description: 'Gema negra profunda usada em rituais de visão.' },
      { name: 'Lágrima do Véu', type: 'material', rarity: 'rare', description: 'Substância semi-líquida usada para encantar armas.' },
      { name: 'Brasa Profana', type: 'material', rarity: 'rare', description: 'Fragmento que queima eternamente. Rituais de fogo.' },
      { name: 'Necronita', type: 'material', rarity: 'rare', description: 'Metal que drena a vitalidade. Armas/Rituais.' },
      { name: 'Cristal de Ossário', type: 'material', rarity: 'rare', description: 'Cristal formado em locais de grande mortalidade.' },

      // <--- MINÉRIOS LENDÁRIOS (5) --->
      { name: 'Aurorita', type: 'material', rarity: 'legendary', description: 'Metal que brilha com a luz de um sol esquecido. Armas.' },
      { name: 'Fragmento do Véu', type: 'material', rarity: 'legendary', description: 'Um pedaço da própria realidade usado em alquimia avançada.' },
      { name: 'Coração Fóssil', type: 'material', rarity: 'legendary', description: 'O coração petrificado de uma entidade ancestral. Rituais.' },
      { name: 'Pedra do Luminar', type: 'material', rarity: 'legendary', description: 'Gema que contém a essência da luz pura. Armas/Rituais.' },
      { name: 'Núcleo Abissal', type: 'material', rarity: 'legendary', description: 'O centro concentrado de um vazio absoluto. Armas/Rituais.' },

      // <--- ITENS DE PERSONAGEM --->
      { name: 'Cestos (Manoplas)', type: 'weapon', rarity: 'common', damage: '1d6', description: 'Manoplas de combate usadas em ambas as mãos.' },
      { name: 'Roupa de Couro Leve', type: 'armor', rarity: 'common', description: 'Proteção básica e leve para o corpo.' },
      { name: 'Ataduras de Punho', type: 'armor', rarity: 'common', description: 'Envoltórios para as mãos.' },
      { name: 'Botas Rústicas', type: 'armor', rarity: 'common', description: 'Calçado resistente para longas jornadas.' },
      { name: 'Kimono de Pano', type: 'armor', rarity: 'common', description: 'Vestimenta leve e flexível.' },
      { name: 'Calça de Pano', type: 'armor', rarity: 'common', description: 'Vestimenta básica para as pernas.' },
      { name: 'Botas de Couro', type: 'armor', rarity: 'common', description: 'Calçado de couro curtido.' },
      { name: 'Bandana de Combate', type: 'armor', rarity: 'common', description: 'Acessório simples para a cabeça.' },
      { name: 'Faixas Vermelhas', type: 'armor', rarity: 'common', description: 'Envoltórios para os braços.' },
      { name: 'Gancho com Corrente', type: 'weapon', rarity: 'rare', damage: '1d4', attributeType: 'strength', description: 'Permite puxar inimigos (Teste FOR), escalar e interagir com o ambiente.' },
      { name: 'Injeção de Adrenalina', type: 'potion', rarity: 'rare', effectTarget: 'stamina', healingValue: '+2', description: 'Estimulante que recupera +2 de Fôlego instantaneamente.' },
      { name: 'Medalhão Sussurrante', type: 'armor', rarity: 'legendary', description: 'Relíquia misteriosa concedida por uma mãe.' },
      { name: 'Pele de Urso', type: 'armor', rarity: 'rare', description: 'Manto pesado que oferece 3 de Redução de Dano (RD).' },
      { name: 'Amuleto Tosco', type: 'armor', rarity: 'rare', bonus: 1, description: 'Concede +1 em testes de Intimidação.' },
      { name: 'Coroa de Ossos', type: 'armor', rarity: 'rare', corruptionLimitBonus: 1, description: 'Artefato macabro que expande o limite de corrupção em +1.' },
      { name: 'Colar: Foco de Fé', type: 'armor', rarity: 'rare', description: 'Canalizador espiritual para ritos sagrados.' },
      { name: 'Chama do Arrependimento', type: 'weapon', rarity: 'legendary', damage: '2d6', attributeType: 'dexterity', description: 'Espada herética. Sinergia: +1d10 Fogo se o alvo estiver [MARCADO]. Sacrifício: +1 Corr para dano máximo (12).' },
      { name: 'Adaga de Ferro Frio', type: 'weapon', rarity: 'rare', damage: '1d6+3', attributeType: 'dexterity', description: 'Lâmina herética. Aplica o status [MARCADO] ao atingir.' },
      { name: 'Picareta de Combate', type: 'weapon', rarity: 'common', damage: '1d6', description: 'Ferramenta adaptada para combate.' },
      { name: 'Cutello do Verdão', type: 'weapon', rarity: 'rare', damage: '1d8', description: 'Lâmina pesada e imponente.' },
      { name: 'Extração da "Chama" :: A.B.S', type: 'weapon', rarity: 'rare', damage: '1d4', description: 'Dispositivo alquímico. Inflige "Chama" no alvo (1) e em si mesmo (2).' },
      { name: 'Extração do Terno da "Chama" :: A.B.S', type: 'armor', rarity: 'rare', description: 'Armadura média imbuída de essência ígnea.' },
      { name: 'Coldre de Couro Simples', type: 'armor', rarity: 'common', description: 'Acesso rápido: 1 slot.', beltCapacity: 1 },
      { name: 'Cinto de Utilidade do Explorador', type: 'armor', rarity: 'rare', description: 'Acesso rápido: 2 slots.', beltCapacity: 2 },
      { name: 'Cinto de Arsenal Real', type: 'armor', rarity: 'legendary', description: 'Acesso rápido: 4 slots.', bonus: 1, beltCapacity: 4 }
    ];

    try {
      setLoading(true);
      let createdCount = 0;
      for (const item of minerals) {
        const res = await ttrpgApi.createItem(item);
        if (!res.error) createdCount++;
      }
      alert(`${createdCount} novos itens carregados com sucesso!`);
      loadItems();
    } catch (error) {
      console.error('Error seeding items:', error);
      alert('Erro ao carregar itens padrão');
    } finally {
      setLoading(false);
    }
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
      alert('Erro ao carregar itens');
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

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Tem certeza que deseja deletar os ${selectedIds.size} itens selecionados?`)) return;

    try {
      setLoading(true);
      for (const id of selectedIds) {
        await ttrpgApi.deleteItem(id);
      }
      setSelectedIds(new Set());
      await loadItems();
      alert('Itens deletados com sucesso!');
    } catch (error) {
      console.error('Error bulk deleting items:', error);
      alert('Erro ao deletar alguns itens');
    } finally {
      setLoading(false);
    }
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
          <div className="space-y-4">
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
                  <option value="stamina">Fôlego</option>
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
              <textarea
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
              onClick={seedDefaultItems}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm border border-zinc-700 shadow-lg group"
              title="Carregar Itens Iniciais do RPG"
            >
              <Sparkles className="w-4 h-4 text-amber-500 group-hover:animate-pulse" />
              Itens Padrão
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
                      <span className="px-2 py-0.5 bg-zinc-800/60 border border-zinc-700 rounded text-zinc-400">
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
                    <div className="text-xs text-zinc-500 space-y-1">
                      {(item.bonus ?? 0) > 0 && <div>Defesa: <span className="text-blue-400">+{item.bonus}</span></div>}
                      {(item.corruptionLimitBonus ?? 0) > 0 && (
                        <div>Corrupção Limite: <span className="text-purple-400">+{item.corruptionLimitBonus}</span></div>
                      )}
                      {(item.beltCapacity ?? 0) > 0 && (
                        <div>Slots Cinto: <span className="text-amber-400">{item.beltCapacity}</span></div>
                      )}
                      {item.statBonus && (
                        <div className="text-amber-400/80 italic">{item.statBonus}</div>
                      )}
                    </div>
                  )}

                  {item.type === 'potion' && (
                    <div className="text-xs text-zinc-500 space-y-1">
                      <div>Alvo: <span className="text-blue-400 uppercase">{
                        item.effectTarget === 'health' ? 'Vida' :
                        item.effectTarget === 'stamina' ? 'Fôlego' :
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
      </div>
    </div>
  );
}
