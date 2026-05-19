import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { 
  ShoppingBag, ArrowLeft, Plus, Trash2, Save, User, Package, Gem, 
  Coins, Eye, EyeOff, MapPin, Globe, Search, Filter, ChevronRight
} from 'lucide-react';
import goldImg from '../assets/gold.png';
import silverImg from '../assets/silver.png';
import bronzeImg from '../assets/bronze.png';
import { ttrpgApi } from '../lib/ttrpg-api';
import { useUI } from '../context/UIContext';
import { Shop, ShopItem, RPGItem } from '../types/rpg';

export function AdminShopsPage() {
  const navigate = useNavigate();
  const { showToast, showConfirm } = useUI();
  const [shops, setShops] = useState<Shop[]>([]);
  const [allItems, setAllItems] = useState<RPGItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  
  // Global Market Settings
  const [marketTitle, setMarketTitle] = useState('Mercado de Valória');
  const [activeLocation, setActiveLocation] = useState('Geral');
  const [listFilterLocation, setListFilterLocation] = useState('all');

  // Item Filters
  const [itemSearch, setItemSearch] = useState('');
  const [itemRarityFilter, setItemRarityFilter] = useState('all');
  const [itemCategoryFilter, setItemCategoryFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    const [shopsRes, itemsRes, configRes] = await Promise.all([
      ttrpgApi.getShops(),
      ttrpgApi.getAllItems(),
      ttrpgApi.getGlobalConfig('market_settings')
    ]);
    
    if (shopsRes.shops) setShops(shopsRes.shops);
    if (itemsRes.items) {
      const converted = itemsRes.items.map((item: any) => ({
        id: String(item.id || ''),
        name: String(item.name || ''),
        attributeType: String(item.attributeType || 'dexterity') as RPGItem['attributeType'],
        bonus: Number(item.bonus || 0),
        damage: String(item.damage || ''),
        category: (item.type === 'weapon' ? 'weapon' : 
                  item.type === 'armor' ? 'armor' :
                  item.type === 'material' ? 'material' : 
                  item.type === 'potion' ? 'potion' : 'consumable') as RPGItem['category'],
        equipmentSlot: item.equipmentSlot ? String(item.equipmentSlot) as RPGItem['equipmentSlot'] : undefined,
        corruptionLimitBonus: Number(item.corruptionLimitBonus || 0),
        statBonus: String(item.statBonus || ''),
        beltCapacity: Number(item.beltCapacity || 0),
        rarity: String(item.rarity || 'common').toLowerCase(),
        description: String(item.description || ''),
        imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
        particles: item.particles ? String(item.particles) as RPGItem['particles'] : undefined
      }));
      setAllItems(converted);
    }
    
    if (configRes.data) {
      setMarketTitle(configRes.data.marketTitle || 'Mercado de Valória');
      setActiveLocation(configRes.data.activeLocation || 'Geral');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Derived data
  const uniqueLocations = useMemo(() => {
    const locs = new Set(shops.map(s => s.location).filter(Boolean));
    if (activeLocation && activeLocation !== 'Geral') locs.add(activeLocation);
    return Array.from(locs).sort() as string[];
  }, [shops, activeLocation]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase());
      const matchesRarity = itemRarityFilter === 'all' || item.rarity === itemRarityFilter;
      const matchesCategory = itemCategoryFilter === 'all' || item.category === itemCategoryFilter;
      const alreadyInShop = editingShop?.inventory.some(si => si.itemId === item.id);
      return matchesSearch && matchesRarity && matchesCategory && !alreadyInShop;
    });
  }, [allItems, itemSearch, itemRarityFilter, itemCategoryFilter, editingShop]);

  const handleSaveGlobalConfig = async () => {
    const res = await ttrpgApi.saveGlobalConfig('market_settings', {
      marketTitle,
      activeLocation
    });
    if (res.success) {
      showToast('Configurações globais salvas!', 'success');
    }
  };

  // Auto-update title when location changes if desired
  const handleLocationChange = (newLoc: string) => {
    setActiveLocation(newLoc);
    if (newLoc !== 'Geral') {
      setMarketTitle(newLoc);
    } else {
      setMarketTitle('Mercado Global');
    }
  };

  const handleCreateShop = async () => {
    const newShop: Shop = {
      id: Date.now().toString(),
      name: 'Nova Loja',
      npcName: 'Novo NPC',
      npcPortrait: '',
      welcomeMessage: 'Bem-vindo!',
      inventory: [],
      location: activeLocation,
      is_visible: true
    };
    const res = await ttrpgApi.saveShop(newShop);
    if (res.success) {
      setShops([...shops, newShop]);
      setEditingShop(newShop);
      showToast('Loja criada!', 'success');
    }
  };

  const handleDeleteShop = async (id: string) => {
    showConfirm('Deletar esta loja?', async () => {
      const res = await ttrpgApi.deleteShop(id);
      if (res.success) {
        setShops(shops.filter(s => s.id !== id));
        if (editingShop?.id === id) setEditingShop(null);
        showToast('Loja removida', 'success');
      }
    });
  };

  const handleSaveEdit = async () => {
    if (!editingShop) return;
    const res = await ttrpgApi.saveShop(editingShop);
    if (res.success) {
      setShops(shops.map(s => s.id === editingShop.id ? editingShop : s));
      showToast('Loja salva!', 'success');
    }
  };

  const addItemToShop = (itemId: string) => {
    if (!editingShop) return;
    const newItem: ShopItem = { itemId, priceBronze: 10, stock: 1 };
    setEditingShop({
      ...editingShop,
      inventory: [...editingShop.inventory, newItem]
    });
  };

  const removeItemFromShop = (itemId: string) => {
    if (!editingShop) return;
    setEditingShop({
      ...editingShop,
      inventory: editingShop.inventory.filter(i => i.itemId !== itemId)
    });
  };

  const updateShopItem = (itemId: string, field: keyof ShopItem, value: number) => {
    if (!editingShop) return;
    setEditingShop({
      ...editingShop,
      inventory: editingShop.inventory.map(i => 
        i.itemId === itemId ? { ...i, [field]: value } : i
      )
    });
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-amber-500" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-amber-400 uppercase tracking-tighter flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Gerenciamento de Lojas
              </h1>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Controle regional de mercadores e estoque</p>
            </div>
          </div>
          <button onClick={handleCreateShop} className="bg-amber-600 hover:bg-amber-500 text-black px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            NOVA LOJA
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Global Configs & Shop List */}
          <div className="space-y-8">
            <div className="bg-zinc-900/60 border-2 border-amber-900/20 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-4 h-4" /> Controle de Sessão (RP)
              </h3>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Região/Cidade do RP</span>
                    <div className="flex gap-2 mt-1">
                      <select 
                        value={activeLocation} 
                        onChange={e => handleLocationChange(e.target.value)}
                        className="flex-1 bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-amber-100 focus:border-amber-600 outline-none appearance-none"
                      >
                        <option value="Geral">Geral / Global</option>
                        {uniqueLocations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                        <option value="NEW">+ Adicionar Nova...</option>
                      </select>
                    </div>
                  </label>

                  {/* Add New Region Input (Show only if needed) */}
                  {activeLocation === 'NEW' && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                      <span className="text-[9px] text-amber-600 uppercase font-black ml-1">Nome da Nova Região</span>
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="Ex: Valória, Porto Real..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleLocationChange((e.target as HTMLInputElement).value);
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value) handleLocationChange(e.target.value);
                          else setActiveLocation('Geral');
                        }}
                        className="w-full bg-amber-500/5 border border-amber-600/40 rounded-lg px-3 py-2 text-sm text-amber-100 focus:border-amber-500 outline-none mt-1" 
                      />
                    </div>
                  )}

                  <label className="block">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Título do Mercado (Custom)</span>
                    <input type="text" value={marketTitle} onChange={e => setMarketTitle(e.target.value)} className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-amber-100 focus:border-amber-600 outline-none mt-1" />
                  </label>
                  <button onClick={handleSaveGlobalConfig} className="w-full bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 border border-amber-900/40 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                    <Save className="w-3 h-3" /> ATUALIZAR MUNDO
                  </button>
                </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Lojas Cadastradas</h2>
                <select 
                  value={listFilterLocation}
                  onChange={e => setListFilterLocation(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[9px] uppercase font-bold text-zinc-400 outline-none"
                >
                  <option value="all">Todas Regiões</option>
                  <option value="Geral">Geral</option>
                  {uniqueLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              
              {loading ? (
                <div className="text-center py-12 italic text-zinc-700">Carregando lojas...</div>
              ) : shops
                  .filter(s => listFilterLocation === 'all' || s.location === listFilterLocation)
                  .map(shop => (
                <div key={shop.id} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                  editingShop?.id === shop.id ? 'bg-amber-900/20 border-amber-500/50 shadow-xl' : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                }`} onClick={() => setEditingShop(shop)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-500">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-100 text-sm flex items-center gap-2">
                        {shop.name}
                        {!shop.is_visible && <EyeOff className="w-3 h-3 text-red-500" />}
                      </div>
                      <div className="text-[9px] text-zinc-500 flex items-center gap-2 italic">
                        <MapPin className="w-2 h-2" /> {shop.location || 'Sem local'}
                      </div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteShop(shop.id); }} className="p-2 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Panel */}
          <div className="lg:col-span-2">
            {editingShop ? (
              <div className="bg-zinc-900/60 border-2 border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-black text-amber-400 uppercase tracking-tighter">Configurar: {editingShop.name}</h2>
                    <button 
                      onClick={() => setEditingShop({...editingShop, is_visible: !editingShop.is_visible})}
                      className={`mt-2 flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${
                        editingShop.is_visible ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400' : 'bg-red-950/30 border-red-500 text-red-400'
                      }`}
                    >
                      {editingShop.is_visible ? 'Visível aos Jogadores' : 'Oculta'}
                    </button>
                  </div>
                  <button onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-500 text-black px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95">
                    <Save className="w-4 h-4" /> SALVAR LOJA
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Nome da Loja</span>
                      <input type="text" value={editingShop.name} onChange={e => setEditingShop({...editingShop, name: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1 text-sm" />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Cidade / Região</span>
                      <input type="text" list="locations-list" value={editingShop.location || ''} onChange={e => setEditingShop({...editingShop, location: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1 text-sm" placeholder="Valória, Porto Real..." />
                      <datalist id="locations-list">
                        {uniqueLocations.map(loc => <option key={loc} value={loc} />)}
                      </datalist>
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Nome do NPC</span>
                      <input type="text" value={editingShop.npcName} onChange={e => setEditingShop({...editingShop, npcName: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1 text-sm" />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">NPC Portrait (URL)</span>
                      <input type="text" value={editingShop.npcPortrait} onChange={e => setEditingShop({...editingShop, npcPortrait: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1 text-sm" placeholder="https://..." />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Mensagem de Boas-vindas</span>
                      <textarea value={editingShop.welcomeMessage} onChange={e => setEditingShop({...editingShop, welcomeMessage: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1 h-32 resize-none text-sm" />
                    </label>
                  </div>
                </div>

                <div className="pt-8 border-t border-zinc-800">
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5" /> ABASTECER ESTOQUE
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Item Selector with Filters */}
                    <div className="bg-black/40 rounded-2xl border border-zinc-800 p-4 flex flex-col h-[500px]">
                      <div className="mb-4 space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                          <input 
                            type="text" 
                            placeholder="Buscar itens..." 
                            value={itemSearch}
                            onChange={e => setItemSearch(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-xs focus:border-amber-600 outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <select 
                            value={itemRarityFilter}
                            onChange={e => setItemRarityFilter(e.target.value)}
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-[10px] uppercase font-bold outline-none"
                          >
                            <option value="all">Todas Raridades</option>
                            <option value="common">Comum</option>
                            <option value="rare">Raro</option>
                            <option value="legendary">Lendário</option>
                            <option value="divine">Divino</option>
                          </select>
                          <select 
                            value={itemCategoryFilter}
                            onChange={e => setItemCategoryFilter(e.target.value)}
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-[10px] uppercase font-bold outline-none"
                          >
                            <option value="all">Categorias</option>
                            <option value="weapon">Arma</option>
                            <option value="armor">Armadura</option>
                            <option value="potion">Poção</option>
                            <option value="consumable">Consumível</option>
                            <option value="material">Material / Outro</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {filteredItems.map(item => (
                          <button 
                            key={item.id} 
                            onClick={() => addItemToShop(item.id)} 
                            className={`w-full text-left p-3 rounded-xl border border-zinc-800 hover:border-amber-600/40 bg-zinc-900/40 transition-all flex items-center justify-between group ${
                              item.rarity === 'legendary' ? 'hover:bg-amber-900/10' : 
                              item.rarity === 'rare' ? 'hover:bg-purple-900/10' : 'hover:bg-zinc-800/40'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-zinc-100 truncate">{item.name}</div>
                              <div className={`text-[8px] font-black uppercase tracking-widest mt-1 ${
                                item.rarity === 'legendary' ? 'text-amber-500' : 
                                item.rarity === 'rare' ? 'text-purple-400' : 'text-zinc-600'
                              }`}>
                                {item.rarity || 'Comum'} • {item.category}
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-zinc-700 group-hover:text-amber-500" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shop Inventory Management */}
                    <div className="flex flex-col h-[500px]">
                      <h4 className="text-[10px] text-zinc-500 uppercase font-bold px-2 mb-4">Itens à Venda na Loja</h4>
                      {editingShop.inventory.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-800 border-2 border-dashed border-zinc-900 rounded-2xl">
                          <Package className="w-12 h-12 mb-2 opacity-10" />
                          <p className="italic text-xs">Vazio...</p>
                        </div>
                      )}
                      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {editingShop.inventory.map(shopItem => {
                          const itemData = allItems.find(i => i.id === shopItem.itemId);
                          return (
                            <div key={shopItem.itemId} className={`bg-black/60 border rounded-2xl p-3 flex items-center gap-3 transition-colors ${
                              itemData?.rarity === 'legendary' ? 'border-amber-900/30' : 
                              itemData?.rarity === 'rare' ? 'border-purple-900/30' : 'border-zinc-800'
                            }`}>
                              <div className={`w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 ${
                                itemData?.rarity === 'legendary' ? 'text-amber-500 shadow-[0_0_10px_#f59e0b22]' : 
                                itemData?.rarity === 'rare' ? 'text-purple-500 shadow-[0_0_10px_#a855f722]' : 'text-zinc-600'
                              }`}>
                                <Gem className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-zinc-200 text-xs truncate">{itemData?.name || 'Item Desconhecido'}</div>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-center">
                                      <img src={goldImg} alt="O" className="w-3 h-3 object-contain mb-0.5" />
                                      <input 
                                        type="number" 
                                        value={Math.floor(shopItem.priceBronze / 100)} 
                                        onChange={e => {
                                          const g = Number(e.target.value);
                                          const s = Math.floor((shopItem.priceBronze % 100) / 10);
                                          const b = shopItem.priceBronze % 10;
                                          updateShopItem(shopItem.itemId, 'priceBronze', (g * 100) + (s * 10) + b);
                                        }} 
                                        className="w-10 bg-zinc-900 border border-yellow-900/40 rounded px-1 py-1 text-[10px] text-center text-yellow-400 focus:border-yellow-600 outline-none" 
                                      />
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <img src={silverImg} alt="S" className="w-3 h-3 object-contain mb-0.5" />
                                      <input 
                                        type="number" 
                                        value={Math.floor((shopItem.priceBronze % 100) / 10)} 
                                        onChange={e => {
                                          const g = Math.floor(shopItem.priceBronze / 100);
                                          const s = Number(e.target.value);
                                          const b = shopItem.priceBronze % 10;
                                          updateShopItem(shopItem.itemId, 'priceBronze', (g * 100) + (s * 10) + b);
                                        }} 
                                        className="w-10 bg-zinc-900 border border-zinc-700/40 rounded px-1 py-1 text-[10px] text-center text-zinc-300 focus:border-zinc-500 outline-none" 
                                      />
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <img src={bronzeImg} alt="B" className="w-3 h-3 object-contain mb-0.5" />
                                      <input 
                                        type="number" 
                                        value={shopItem.priceBronze % 10} 
                                        onChange={e => {
                                          const g = Math.floor(shopItem.priceBronze / 100);
                                          const s = Math.floor((shopItem.priceBronze % 100) / 10);
                                          const b = Number(e.target.value);
                                          updateShopItem(shopItem.itemId, 'priceBronze', (g * 100) + (s * 10) + b);
                                        }} 
                                        className="w-10 bg-zinc-900 border border-orange-900/40 rounded px-1 py-1 text-[10px] text-center text-orange-500 focus:border-orange-700 outline-none" 
                                      />
                                    </div>
                                  </div>
                                  <label className="flex items-center gap-1.5">
                                    <Package className="w-3 h-3 text-zinc-600" />
                                    <input type="number" value={shopItem.stock} onChange={e => updateShopItem(shopItem.itemId, 'stock', Number(e.target.value))} className="w-14 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-center focus:border-amber-600 outline-none" />
                                  </label>
                                </div>
                              </div>
                              <button onClick={() => removeItemFromShop(shopItem.itemId)} className="p-2 text-zinc-800 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-800 py-32 border-2 border-dashed border-zinc-900 rounded-3xl">
                <ShoppingBag className="w-24 h-24 mb-6 opacity-20" />
                <p className="italic text-lg">Selecione uma loja para configurar...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
