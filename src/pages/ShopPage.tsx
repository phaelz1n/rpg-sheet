import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ShoppingBag, ArrowLeft, Coins, Gem, User, Package, 
  Sparkles, ScrollText, ShieldCheck, Flame, Sword
} from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { useCharacterStore } from '../store/characterStore';
import { useGlobalStore } from '../store/globalStore';
import { RPGItem } from '../types/rpg';
import { RichDescription } from '../components/rpg/RichDescription';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

export function ShopPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { shops, loadShops, subscribeToShops, buyItem, isLoading } = useShopStore();
  const { rpgItems, loadGlobalItems } = useGlobalStore();
  const { coinsBronze, loadCharacter } = useCharacterStore();
  const { showToast, showConfirm } = useUI();
  
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [buyingItemId, setBuyingItemId] = useState<string | null>(null);

  useEffect(() => {
    loadShops();
    loadGlobalItems();
    if (currentUser) loadCharacter(currentUser);
    
    const unsub = subscribeToShops();
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (shops.length > 0 && !selectedShopId) {
      setSelectedShopId(shops[0].id);
    }
  }, [shops]);

  const currentShop = shops.find(s => s.id === selectedShopId);

  const formatPrice = (bronze: number) => {
    const g = Math.floor(bronze / 100);
    const s = Math.floor((bronze % 100) / 10);
    const b = bronze % 10;
    return (
      <div className="flex items-center gap-2">
        {g > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
            <span className="text-yellow-400 font-bold">{g}</span>
          </div>
        )}
        {s > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-zinc-300 shadow-[0_0_8px_#d4d4d8]" />
            <span className="text-zinc-300 font-bold">{s}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-600 shadow-[0_0_8px_#ea580c]" />
          <span className="text-orange-500 font-bold">{b}</span>
        </div>
      </div>
    );
  };

  const handleBuy = async (item: RPGItem, price: number) => {
    if (!currentShop || !currentUser) return;
    if (coinsBronze < price) {
      showToast('Moedas insuficientes!', 'error');
      return;
    }

    showConfirm(`Deseja comprar ${item.name} por ${price} bronzes?`, async () => {
      setBuyingItemId(item.id);
      const result = await buyItem(currentShop.id, item.id, currentUser);
      setBuyingItemId(null);
      
      if (result.success) {
        showToast(`${item.name} comprado com sucesso!`, 'success');
      } else {
        showToast(result.error || 'Erro na compra', 'error');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0908] text-amber-100/90 font-serif selection:bg-amber-900/40 overflow-hidden flex flex-col">
      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-50" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 bg-zinc-950/80 border-b border-amber-900/30 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/character')}
            className="flex items-center gap-2 text-amber-600 hover:text-amber-400 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold">Voltar à Ficha</span>
          </button>
          <div className="h-6 w-px bg-amber-900/30" />
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-black uppercase tracking-tighter text-amber-400 drop-shadow-md">Mercado de Valória</h1>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 bg-black/60 border border-amber-900/40 rounded-full px-6 py-2 shadow-inner">
            <span className="text-[10px] text-amber-700 uppercase font-black tracking-widest">Sua Bolsa:</span>
            {formatPrice(coinsBronze)}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest animate-pulse">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
            Mercado Ativo
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side: NPC Selection & Portrait */}
        <aside className="w-full lg:w-[450px] border-r border-amber-900/20 bg-black/40 flex flex-col shrink-0">
          
          {/* NPC Portrait Wrapper */}
          <div className="relative aspect-[4/5] lg:aspect-auto lg:flex-1 overflow-hidden group">
            {currentShop?.npcPortrait ? (
              <img 
                src={currentShop.npcPortrait} 
                alt={currentShop.npcName} 
                className="w-full h-full object-cover grayscale-[0.2] sepia-[0.2] brightness-75 group-hover:brightness-90 transition-all duration-700 scale-105 group-hover:scale-100"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-800">
                <User className="w-32 h-32 opacity-10" />
              </div>
            )}
            
            {/* Vignette & Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-transparent opacity-90" />
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
            
            {/* NPC Name Plate */}
            <div className="absolute bottom-0 left-0 w-full p-8 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-700/50" />
                <span className="text-[10px] text-amber-600 uppercase font-black tracking-[0.3em] whitespace-nowrap">Mercador Local</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-700/50" />
              </div>
              <h2 className="text-4xl font-black text-center text-amber-200 uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {currentShop?.npcName || 'Desconhecido'}
              </h2>
              <p className="text-amber-100/60 text-center italic text-lg px-4 leading-relaxed">
                "{currentShop?.welcomeMessage}"
              </p>
            </div>
          </div>

          {/* Merchant Selector (Mobile Scrollable) */}
          <div className="p-4 bg-zinc-950/50 border-t border-amber-900/20 max-h-48 overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] text-amber-900 uppercase font-black tracking-[0.2em] mb-3 text-center">Visitando outros mercadores</h3>
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {shops.map(shop => (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShopId(shop.id)}
                  className={`flex-shrink-0 lg:w-full text-left px-4 py-3 rounded-lg border transition-all duration-300 ${
                    selectedShopId === shop.id 
                      ? 'bg-amber-900/20 border-amber-600 text-amber-200 shadow-lg' 
                      : 'bg-black/40 border-amber-900/10 text-amber-900 hover:border-amber-900/40 hover:text-amber-700'
                  }`}
                >
                  <div className="text-sm font-bold uppercase tracking-tight">{shop.name}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Side: Store Inventory */}
        <section className="flex-1 flex flex-col bg-[#0f0e0d] relative overflow-hidden">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-amber-900/10 rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-amber-900/10 rounded-bl-3xl pointer-events-none" />

          {currentShop ? (
            <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-12 scroll-smooth custom-scrollbar">
              
              {/* Category: Armas & Equipamentos */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Sword className="w-5 h-5 text-amber-700" />
                  <h3 className="text-sm font-black text-amber-600 uppercase tracking-[0.4em]">Itens Disponíveis</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-900/30 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentShop.inventory.map(shopItem => {
                    const item = rpgItems.find(i => i.id === shopItem.itemId);
                    if (!item) return null;

                    return (
                      <div 
                        key={item.id} 
                        className="group relative bg-zinc-900/30 border border-amber-900/20 rounded-2xl p-5 flex flex-col transition-all duration-500 hover:bg-amber-950/10 hover:border-amber-600/40 shadow-xl hover:shadow-amber-900/20"
                      >
                        {/* Item Icon & Rarity Glow */}
                        <div className="flex items-start justify-between mb-6">
                          <div className={`w-12 h-12 rounded-xl bg-black/60 border border-amber-900/40 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${
                            item.rarity === 'legendary' ? 'shadow-[0_0_15px_rgba(251,191,36,0.2)] border-amber-500' : 
                            item.rarity === 'rare' ? 'shadow-[0_0_15px_rgba(168,85,247,0.2)] border-purple-500' : ''
                          }`}>
                            <Gem className="w-7 h-7" />
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[9px] text-amber-900 uppercase font-black tracking-widest block mb-1">Preço de Venda</span>
                            <div className="bg-black/40 px-3 py-1 rounded-full border border-amber-900/20 shadow-inner">
                              {formatPrice(shopItem.priceBronze)}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                          <h4 className="text-lg font-black text-amber-100 group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold tracking-tighter ${
                              item.rarity === 'legendary' ? 'bg-amber-900/40 border-amber-500 text-amber-400' :
                              item.rarity === 'rare' ? 'bg-purple-900/40 border-purple-500 text-purple-400' :
                              'bg-zinc-900/40 border-zinc-700 text-zinc-500'
                            }`}>
                              {item.rarity || 'Comum'}
                            </span>
                            <span className="text-[9px] text-amber-800 uppercase font-black tracking-widest">{item.category}</span>
                          </div>
                          <div className="text-sm text-amber-100/40 italic line-clamp-3 pt-2">
                            <RichDescription text={item.description || ''} />
                          </div>
                        </div>

                        {/* Buy Action */}
                        <div className="mt-8 flex items-center justify-between gap-4">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-amber-900 uppercase font-black tracking-widest">Estoque</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {Array.from({ length: Math.min(5, shopItem.stock) }).map((_, i) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-600/50 shadow-[0_0_4px_rgba(217,119,6,0.3)]" />
                              ))}
                              {shopItem.stock > 5 && <span className="text-[10px] text-amber-600/60 font-bold">+{shopItem.stock - 5}</span>}
                            </div>
                          </div>

                          <button
                            onClick={() => handleBuy(item, shopItem.priceBronze)}
                            disabled={buyingItemId === item.id}
                            className="relative flex-1 group/btn overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-900 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                            <div className="relative px-6 py-2.5 bg-amber-900/40 border border-amber-700/50 rounded-xl text-amber-100 font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group-hover/btn:text-black">
                              {buyingItemId === item.id ? (
                                <div className="w-3 h-3 border-2 border-amber-500 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Coins className="w-3 h-3" />
                                  Comprar
                                </>
                              )}
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Decorative Banner */}
              <div className="py-12 flex flex-col items-center justify-center gap-4 opacity-30">
                <div className="h-px w-64 bg-gradient-to-r from-transparent via-amber-900 to-transparent" />
                <div className="flex items-center gap-6">
                  <Flame className="w-4 h-4 text-amber-900" />
                  <ScrollText className="w-6 h-6 text-amber-900" />
                  <Flame className="w-4 h-4 text-amber-900" />
                </div>
                <div className="h-px w-64 bg-gradient-to-r from-transparent via-amber-900 to-transparent" />
                <span className="text-[10px] uppercase tracking-[0.5em] text-amber-900">Mercado de Valória • Anno Domini 2026</span>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-20">
              <ScrollText className="w-24 h-24 text-amber-900" />
              <p className="text-xl font-serif italic text-amber-900">As caravanas ainda não chegaram...</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
