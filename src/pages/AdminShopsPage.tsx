import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, ArrowLeft, Plus, Trash2, Save, User, Package, Gem, Coins } from 'lucide-react';
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

  const loadData = async () => {
    setLoading(true);
    const [shopsRes, itemsRes] = await Promise.all([
      ttrpgApi.getShops(),
      ttrpgApi.getAllItems()
    ]);
    if (shopsRes.shops) setShops(shopsRes.shops);
    if (itemsRes.items) setAllItems(itemsRes.items);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateShop = async () => {
    const newShop: Shop = {
      id: Date.now().toString(),
      name: 'Nova Loja',
      npcName: 'Novo NPC',
      npcPortrait: '',
      welcomeMessage: 'Bem-vindo à minha loja!',
      inventory: []
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
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-amber-500" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-amber-400 uppercase tracking-tighter flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Gerenciamento de Lojas
              </h1>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Configure as lojas e NPCs do mundo</p>
            </div>
          </div>
          <button onClick={handleCreateShop} className="bg-amber-600 hover:bg-amber-500 text-black px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            NOVA LOJA
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shop List */}
          <div className="space-y-4">
            <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-4">Lojas Ativas</h2>
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
                    <div className="font-bold text-amber-100">{shop.name}</div>
                    <div className="text-[10px] text-zinc-500">{shop.npcName}</div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteShop(shop.id); }} className="p-2 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Edit Panel */}
          <div className="lg:col-span-2">
            {editingShop ? (
              <div className="bg-zinc-900/60 border-2 border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-amber-400 uppercase tracking-tighter">Editar: {editingShop.name}</h2>
                  <button onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-500 text-black px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95">
                    <Save className="w-4 h-4" />
                    SALVAR ALTERAÇÕES
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Nome da Loja</span>
                      <input type="text" value={editingShop.name} onChange={e => setEditingShop({...editingShop, name: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1" />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Nome do NPC</span>
                      <input type="text" value={editingShop.npcName} onChange={e => setEditingShop({...editingShop, npcName: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1" />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Foto do NPC (URL)</span>
                      <input type="text" value={editingShop.npcPortrait} onChange={e => setEditingShop({...editingShop, npcPortrait: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1" placeholder="https://..." />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Frase de Boas-vindas</span>
                      <textarea value={editingShop.welcomeMessage} onChange={e => setEditingShop({...editingShop, welcomeMessage: e.target.value})} className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-600 mt-1 h-full min-h-[145px] resize-none" />
                    </label>
                  </div>
                </div>

                <div className="pt-8 border-t border-zinc-800">
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Inventário da Loja
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-black/40 rounded-2xl border border-zinc-800 p-4">
                      <h4 className="text-[10px] text-zinc-500 uppercase font-bold mb-4">Adicionar Itens</h4>
                      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
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
                        <div className="text-center py-12 text-zinc-700 italic border-2 border-dashed border-zinc-800 rounded-2xl">A loja está vazia...</div>
                      )}
                      {editingShop.inventory.map(shopItem => {
                        const itemData = allItems.find(i => i.id === shopItem.itemId);
                        return (
                          <div key={shopItem.itemId} className="bg-black/60 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-600">
                              <Gem className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-zinc-200 text-sm">{itemData?.name || 'Item Desconhecido'}</div>
                              <div className="flex items-center gap-4 mt-2">
                                <label className="flex items-center gap-2">
                                  <Coins className="w-3 h-3 text-amber-500" />
                                  <input type="number" value={shopItem.priceBronze} onChange={e => updateShopItem(shopItem.itemId, 'priceBronze', Number(e.target.value))} className="w-16 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs" />
                                </label>
                                <label className="flex items-center gap-2">
                                  <Package className="w-3 h-3 text-zinc-500" />
                                  <input type="number" value={shopItem.stock} onChange={e => updateShopItem(shopItem.itemId, 'stock', Number(e.target.value))} className="w-16 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs" />
                                </label>
                              </div>
                            </div>
                            <button onClick={() => removeItemFromShop(shopItem.itemId)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-800 py-32">
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
