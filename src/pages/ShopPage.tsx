import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ShoppingBag, ArrowLeft, Coins, Gem, User, Package, 
  Sparkles, ScrollText, ShieldCheck, Flame, Sword, MapPin
} from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { useCharacterStore } from '../store/characterStore';
import { useGlobalStore } from '../store/globalStore';
import { RPGItem } from '../types/rpg';
import { RichDescription } from '../components/rpg/RichDescription';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { ttrpgApi } from '../lib/ttrpg-api';
import { ItemVFX } from '../components/rpg/ItemVFX';
import { audioService } from '../lib/audio-service';

export function ShopPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { shops, loadShops, subscribeToShops, buyItem, isLoading } = useShopStore();
  const { rpgItems, loadGlobalItems } = useGlobalStore();
  const { coinsBronze, loadCharacter } = useCharacterStore();
  const { showToast, showConfirm } = useUI();
  
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [buyingItemId, setBuyingItemId] = useState<string | null>(null);
  
  // Dynamic RP Configs
  const [marketTitle, setMarketTitle] = useState('Mercado de Valória');
  const [activeLocation, setActiveLocation] = useState('Geral');

  const loadRPConfig = async () => {
    const { data } = await ttrpgApi.getGlobalConfig('market_settings');
    if (data) {
      setMarketTitle(data.marketTitle || 'Mercado de Valória');
      setActiveLocation(data.activeLocation || 'Geral');
    }
  };

  useEffect(() => {
    loadShops();
    loadGlobalItems();
    loadRPConfig();
    if (currentUser) loadCharacter(currentUser);
    
    const unsubShops = subscribeToShops();
    const unsubConfig = ttrpgApi.subscribeToGlobalConfig('market_settings', () => {
      loadRPConfig();
      loadShops(); // Reload shops too just in case visibility changed
    });
    
    return () => {
      unsubShops();
      unsubConfig();
    };
  }, [currentUser]);

  // Filter shops by location and visibility
  const visibleShops = shops.filter(s => 
    s.is_visible !== false && 
    (s.location === activeLocation || !activeLocation || activeLocation === 'Geral')
  );

  useEffect(() => {
    if (visibleShops.length > 0 && !selectedShopId) {
      setSelectedShopId(visibleShops[0].id);
    } else if (visibleShops.length === 0) {
      setSelectedShopId(null);
    }
  }, [visibleShops]);

  const currentShop = visibleShops.find(s => s.id === selectedShopId) || (visibleShops.length > 0 ? visibleShops[0] : null);

  // Typewriter effect state
  const [displayedMessage, setDisplayedMessage] = useState('');
  
  useEffect(() => {
    if (!currentShop?.welcomeMessage) return;
    
    setDisplayedMessage('');
    let i = 0;
    const message = currentShop.welcomeMessage;
    const interval = setInterval(() => {
      setDisplayedMessage(prev => prev + message.charAt(i));
      i++;
      if (i >= message.length) clearInterval(interval);
    }, 30);
    
    return () => clearInterval(interval);
  }, [selectedShopId, currentShop?.welcomeMessage]);

  const formatPrice = (bronze: number) => {
    const g = Math.floor(bronze / 100);
    const s = Math.floor((bronze % 100) / 10);
    const b = bronze % 10;
    return (
      <div className="flex items-center gap-2">
        {g > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] animate-pulse" />
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
        audioService.playSound('BUY_ITEM');
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
      <header className="relative z-20 bg-zinc-950/80 border-b border-amber-900/30 backdrop-blur-md px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/character')}
            className="flex items-center gap-2 text-amber-600 hover:text-amber-400 transition-all group shrink-0"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold">Sair</span>
          </button>
          <div className="h-6 w-px bg-amber-900/30 hidden sm:block" />
          <div className="flex items-center gap-3 min-w-0">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
            <h1 className="text-base sm:text-xl font-black uppercase tracking-tighter text-amber-400 drop-shadow-md truncate">
              {marketTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto">
          <div className="flex items-center gap-3 bg-black/60 border border-amber-900/40 rounded-full px-4 sm:px-6 py-2 shadow-inner group">
            <span className="text-[8px] sm:text-[10px] text-amber-700 uppercase font-black tracking-widest whitespace-nowrap group-hover:text-amber-500 transition-colors">Bolsa:</span>
            {formatPrice(coinsBronze)}
          </div>
          <div className="flex items-center gap-2 text-[8px] sm:text-[10px] text-zinc-500 uppercase tracking-widest whitespace-nowrap">
            <MapPin className="w-3 h-3 text-emerald-500 animate-bounce" />
            {activeLocation}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side: NPC Selection & Portrait */}
        <aside className="w-full lg:w-[400px] xl:w-[450px] border-r border-amber-900/20 bg-black/40 flex flex-col shrink-0">
          
          {/* NPC Portrait Wrapper */}
          <div className="relative aspect-square lg:aspect-auto lg:flex-1 overflow-hidden group">
            {currentShop?.npcPortrait ? (
              <img 
                src={currentShop.npcPortrait} 
                alt={currentShop.npcName} 
                className="w-full h-full object-cover grayscale-[0.2] sepia-[0.2] brightness-75 group-hover:brightness-90 transition-all duration-[3000ms] scale-110 group-hover:scale-100 animate-pulse-slow"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-800">
                <User className="w-32 h-32 opacity-10 animate-pulse" />
              </div>
            )}
            
            {/* Vignette & Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-transparent opacity-95" />
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
            
            {/* NPC Name Plate */}
            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-700/50" />
                <Sparkles className="w-3 h-3 text-amber-600 animate-spin-slow" />
                <span className="text-[9px] sm:text-[10px] text-amber-600 uppercase font-black tracking-[0.3em] whitespace-nowrap">Mercador Local</span>
                <Sparkles className="w-3 h-3 text-amber-600 animate-spin-slow" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-700/50" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-center text-amber-200 uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {currentShop?.npcName || 'Desconhecido'}
              </h2>
              <div className="min-h-[4.5rem] flex items-center justify-center">
                <p className="text-amber-100/70 text-center italic text-sm sm:text-base px-4 leading-relaxed line-clamp-3 font-medium">
                  "{displayedMessage}<span className="inline-block w-1.5 h-4 bg-amber-500/50 ml-0.5 animate-pulse" />"
                </p>
              </div>
            </div>
          </div>

          {/* Merchant Selector (Mobile Scrollable) */}
          {visibleShops.length > 1 && (
            <div className="p-4 bg-zinc-950/50 border-t border-amber-900/20 max-h-48 overflow-y-auto custom-scrollbar">
              <h3 className="text-[9px] text-amber-900 uppercase font-black tracking-[0.2em] mb-3 text-center">Visitando outros mercadores</h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {visibleShops.map(shop => (
                  <button
                    key={shop.id}
                    onClick={() => setSelectedShopId(shop.id)}
                    className={`flex-shrink-0 lg:w-full text-left px-4 py-3 rounded-lg border transition-all duration-300 relative overflow-hidden group/btn ${
                      selectedShopId === shop.id 
                        ? 'bg-amber-900/20 border-amber-600 text-amber-200 shadow-lg' 
                        : 'bg-black/40 border-amber-900/10 text-amber-900 hover:border-amber-900/40 hover:text-amber-700'
                    }`}
                  >
                    <div className="text-xs font-bold uppercase tracking-tight relative z-10">{shop.name}</div>
                    {selectedShopId === shop.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-transparent animate-shimmer" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Side: Store Inventory */}
        <section className="flex-1 flex flex-col bg-[#0f0e0d] relative overflow-hidden">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-amber-900/10 rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-amber-900/10 rounded-bl-3xl pointer-events-none" />

          {currentShop ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 space-y-12 scroll-smooth custom-scrollbar">
              
              {/* Category: Armas & Equipamentos */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Sword className="w-5 h-5 text-amber-700 animate-pulse" />
                  <h3 className="text-xs sm:text-sm font-black text-amber-600 uppercase tracking-[0.4em]">Itens Disponíveis</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-900/30 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {currentShop.inventory.map(shopItem => {
                    const item = rpgItems.find(i => i.id === shopItem.itemId);
                    if (!item) return null;

                    return (
                      <div 
                        key={item.id} 
                        className={`group relative bg-zinc-900/30 border border-amber-900/20 rounded-2xl p-4 sm:p-5 flex flex-col transition-all duration-500 hover:bg-amber-950/10 hover:border-amber-600/40 shadow-xl hover:shadow-amber-900/20 ${
                          item.rarity === 'legendary' ? 'hover:shadow-[0_0_25px_rgba(251,191,36,0.1)] border-amber-500/50' : ''
                        }`}
                      >
                        <ItemVFX type={item.particles as any} rarity={item.rarity} name={item.name} />

                        {/* Background rarity glow */}
                        {item.rarity === 'legendary' && (
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 blur-[50px] group-hover:bg-amber-500/10 transition-all duration-1000" />
                        )}
                        {item.rarity === 'rare' && (
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/5 blur-[50px] group-hover:bg-purple-500/10 transition-all duration-1000" />
                        )}

                        {/* Particle Effect from Master Config */}
                        <ItemVFX type={item.particles as any} />

                        {/* Item Icon & Rarity Glow */}
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/60 border border-amber-900/40 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative ${
                            item.rarity === 'legendary' ? 'shadow-[0_0_15px_rgba(251,191,36,0.2)] border-amber-500' : 
                            item.rarity === 'rare' ? 'shadow-[0_0_15px_rgba(168,85,247,0.2)] border-purple-500' : ''
                          }`}>
                            <Gem className={`w-6 h-6 sm:w-7 sm:h-7 ${item.rarity === 'legendary' ? 'animate-pulse' : ''}`} />
                            {item.rarity === 'legendary' && (
                              <div className="absolute inset-0 rounded-xl bg-amber-500/20 animate-ping duration-[3000ms] pointer-events-none" />
                            )}
                          </div>
                          
                          <div className="text-right min-w-0">
                            <span className="text-[8px] text-amber-900 uppercase font-black tracking-widest block mb-1">Preço</span>
                            <div className="bg-black/40 px-2 sm:px-3 py-1 rounded-full border border-amber-900/20 shadow-inner">
                              {formatPrice(shopItem.priceBronze)}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2 relative z-10">
                          <h4 className="text-base sm:text-lg font-black text-amber-100 group-hover:text-amber-400 transition-colors uppercase tracking-tight truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] sm:text-[9px] px-2 py-0.5 rounded border uppercase font-bold tracking-tighter ${
                              item.rarity === 'legendary' ? 'bg-amber-950/40 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                              item.rarity === 'rare' ? 'bg-purple-950/40 border-purple-500 text-purple-400' :
                              'bg-zinc-900/40 border-zinc-700 text-zinc-500'
                            }`}>
                              {item.rarity || 'Comum'}
                            </span>
                            <span className="text-[8px] text-amber-800 uppercase font-black tracking-widest">{item.category}</span>
                          </div>
                          <div className="text-xs sm:text-sm text-amber-100/40 italic line-clamp-3 pt-2">
                            <RichDescription text={item.description || ''} />
                          </div>
                        </div>

                        {/* Buy Action */}
                        <div className="mt-6 sm:mt-8 flex items-center justify-between gap-4">
                          <div className="flex flex-col">
                            <span className={`text-[8px] uppercase font-black tracking-widest ${shopItem.stock <= 2 ? 'text-red-500 animate-pulse' : 'text-amber-900'}`}>
                              {shopItem.stock <= 2 ? 'Últimas!' : 'Estoque'}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              {Array.from({ length: Math.min(3, shopItem.stock) }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full transition-all duration-1000 ${
                                    shopItem.stock === 1 ? 'bg-red-500 shadow-[0_0_5px_#ef4444]' : 
                                    shopItem.stock <= 3 ? 'bg-orange-500' : 
                                    'bg-emerald-600'
                                  }`} 
                                />
                              ))}
                              <span className="text-[10px] text-zinc-500 font-bold ml-1">({shopItem.stock})</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleBuy(item, shopItem.priceBronze)}
                            disabled={buyingItemId === item.id}
                            className="relative flex-1 group/btn overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-900 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                            <div className="relative px-3 sm:px-6 py-2 bg-amber-900/40 border border-amber-700/50 rounded-xl text-amber-100 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group-hover/btn:text-black">
                              {buyingItemId === item.id ? (
                                <div className="w-3 h-3 border-2 border-amber-500 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Coins className="w-3 h-3 group-hover/btn:rotate-12 transition-transform" />
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
              <div className="py-8 sm:py-12 flex flex-col items-center justify-center gap-4 opacity-30">
                <div className="h-px w-32 sm:w-64 bg-gradient-to-r from-transparent via-amber-900 to-transparent" />
                <div className="flex items-center gap-6">
                  <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-amber-900 animate-pulse" />
                  <ScrollText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900" />
                  <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-amber-900 animate-pulse" />
                </div>
                <div className="h-px w-32 sm:w-64 bg-gradient-to-r from-transparent via-amber-900 to-transparent" />
                <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.5em] text-amber-900 text-center">Mercado Regional • Anno Domini 2026</span>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-20 p-8 text-center animate-pulse">
              <MapPin className="w-16 h-16 sm:w-24 sm:h-24 text-amber-900" />
              <p className="text-base sm:text-xl font-serif italic text-amber-900">Não há mercadores ativos nesta região...</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
