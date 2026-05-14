import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, ArrowLeft, Plus, Trash2, Save, User, Package, Gem, Coins, Eye, EyeOff, MapPin, Globe } from 'lucide-react';
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

  const loadData = async () => {
    setLoading(true);
    const [shopsRes, itemsRes, configRes] = await Promise.all([
      ttrpgApi.getShops(),
      ttrpgApi.getAllItems(),
      ttrpgApi.getGlobalConfig('market_settings')
    ]);
    
    if (shopsRes.shops) setShops(shopsRes.shops);
    if (itemsRes.items) setAllItems(itemsRes.items);
    
    if (configRes.data) {
      setMarketTitle(configRes.data.marketTitle || 'Mercado de Valória');
      setActiveLocation(configRes.data.activeLocation || 'Geral');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveGlobalConfig = async () => {
    const res = await ttrpgApi.saveGlobalConfig('market_settings', {
      marketTitle,
      activeLocation
    });
    if (res.success) {
      showToast('Configurações globais salvas!', 'success');
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
    if (editingShop.inventory.some(i => i.itemId === itemId)) {
      showToast('Item já está na loja', 'error');
      return;
    }
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
              <p className="text-zinc-500 text-xs uppercase tracking-widest text-[10px]">Configure mercadores, regiões e visibilidade</p>
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
            {/* Global Config Card */}
            <div className="bg-zinc-900/60 border-2 border-amber-900/20 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-4 h-4" /> Configurações do RP
              </h3>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Título do Mercado (Header)</span>
                  <input type="text" value={marketTitle} onChange={e => setMarketTitle(e.target.value)} className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-amber-100 focus:border-amber-600 outline-none mt-1" />
                </label>
                <label className="block">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Região/Cidade Ativa</span>
                  <input type="text" value={activeLocation} onChange={e => setActiveLocation(e.target.value)} className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-amber-100 focus:border-amber-600 outline-none mt-1" />
                </label>
                <button onClick={handleSaveGlobalConfig} className="w-full bg-zinc-800 hover:bg-zinc-700 text-amber-400 py-2 rounded-lg text-xs font-bold transition-colors">
                  ATUALIZAR RP
                </button>
                <p className="text-[9px] text-zinc-600 italic">Isso altera o que os jogadores veem na página da loja instantaneamente.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-4">Todas as Lojas</h2>
              {loading ? (
                <div className="text-center py-12 italic text-zinc-700">Carregando lojas...</div>
              ) : shops.map(shop => (
                <div key={shop.id} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                  editingShop?.id === shop.id ? 'bg-amber-900/20 border-amber-500/50 shadow-xl' : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                }`} onClick={() => setEditingShop(shop)}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-500">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-100 text-sm flex items-center gap-2">
                        {shop.name}
                        {!shop.is_visible && <EyeOff className="w-3 h-3 text-red-500" />}
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-2 italic">
                        <MapPin className="w-2 h-2" /> {shop.location || 'Sem local'} • {shop.npcName}
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
              <div className="bg-zinc-900/60 border-2 border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-black text-amber-400 uppercase tracking-tighter">Editar: {editingShop.name}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <button 
                        onClick={() => setEditingShop({...editingShop, is_visible: !editingShop.is_visible})}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          editingShop.is_visible ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400' : 'bg-red-950/30 border-red-500 text-red-400'
                        }`}
                      >
                        {editingShop.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {editingShop.is_visible ? 'Visível para Jogadores' : 'Oculta para Jogadores'}
                      </button>
                    </div>
                  </div>
                  <button onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-500 text-black px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95">
                    <Save className="w-4 h-4" />
                    SALVAR LOJA
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Nome da Loja</span>
                      <input type="text" value={editingShop.name} onChange={e => setEditingShop({...editingShop, name: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1" />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Região / Cidade</span>
                      <input type="text" value={editingShop.location || ''} onChange={e => setEditingShop({...editingShop, location: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1" placeholder="Ex: Valória, Porto Real..." />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Nome do NPC</span>
                      <input type="text" value={editingShop.npcName} onChange={e => setEditingShop({...editingShop, npcName: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1" />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Foto do NPC (URL)</span>
                      <input type="text" value={editingShop.npcPortrait} onChange={e => setEditingShop({...editingShop, npcPortrait: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1" placeholder="https://..." />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Frase de Boas-vindas</span>
                      <textarea value={editingShop.welcomeMessage} onChange={e => setEditingShop({...editingShop, welcomeMessage: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1 h-32 resize-none" />
                    </label>
                  </div>
                </div>

                <div className="pt-8 border-t border-zinc-800">
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Estoque da Loja
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-black/40 rounded-2xl border border-zinc-800 p-4">
                      <h4 className="text-[10px] text-zinc-500 uppercase font-bold mb-4">Adicionar Itens</h4>
                      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                        {allItems.filter(i => !editingShop.inventory.some(si => si.itemId === i.id)).map(item => (
                          <button key={item.id} onClick={() => addItemToShop(item.id)} className="w-full text-left p-2 rounded-lg hover:bg-amber-900/10 border border-transparent hover:border-amber-900/30 flex items-center justify-between text-xs transition-all">
                            <span>{item.name}</span>
                            <Plus className="w-3 h-3 text-amber-500" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] text-zinc-500 uppercase font-bold px-2">Itens à Venda</h4>
                      {editingShop.inventory.length === 0 && (
                        <div className="text-center py-12 text-zinc-700 italic border-2 border-dashed border-zinc-800 rounded-2xl text-xs">A loja está vazia...</div>
                      )}
                      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {editingShop.inventory.map(shopItem => {
                          const itemData = allItems.find(i => i.id === shopItem.itemId);
                          return (
                            <div key={shopItem.itemId} className="bg-black/60 border border-zinc-800 rounded-2xl p-3 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-600 shrink-0">
                                <Gem className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-zinc-200 text-xs truncate">{itemData?.name || 'Item Desconhecido'}</div>
                                <div className="flex items-center gap-4 mt-2">
                                  <label className="flex items-center gap-1">
                                    <Coins className="w-3 h-3 text-amber-500" />
                                    <input type="number" value={shopItem.priceBronze} onChange={e => updateShopItem(shopItem.itemId, 'priceBronze', Number(e.target.value))} className="w-14 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-center" />
                                  </label>
                                  <label className="flex items-center gap-1">
                                    <Package className="w-3 h-3 text-zinc-500" />
                                    <input type="number" value={shopItem.stock} onChange={e => updateShopItem(shopItem.itemId, 'stock', Number(e.target.value))} className="w-14 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-center" />
                                  </label>
                                </div>
                              </div>
                              <button onClick={() => removeItemFromShop(shopItem.itemId)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
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
