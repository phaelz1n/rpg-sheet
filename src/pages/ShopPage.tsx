import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ShoppingBag, ArrowLeft, Coins, Gem, User, Package, 
  Sparkles, ScrollText, ShieldCheck, Flame, Sword, MapPin,
  X, Plus, Minus, ChevronLeft, ChevronRight
} from 'lucide-react';
import goldImg from '../assets/gold.png';
import silverImg from '../assets/silver.png';
import bronzeImg from '../assets/bronze.png';
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
  const { coinsBronze, loadCharacter, inventory, inventoryCapacity } = useCharacterStore();
  const { showToast, showConfirm } = useUI();
  
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [buyingItemId, setBuyingItemId] = useState<string | null>(null);
  
  const translateRarity = (r?: string) => {
    if (!r) return 'Comum';
    const lower = r.toLowerCase();
    if (lower === 'divine') return 'Divino';
    if (lower === 'legendary') return 'Lendário';
    if (lower === 'rare') return 'Raro';
    return 'Comum';
  };

  const [purchaseModal, setPurchaseModal] = useState<{
    isOpen: boolean;
    item: RPGItem | null;
    shopItem: any | null;
    quantity: number;
    maxQuantity: number;
  }>({ isOpen: false, item: null, shopItem: null, quantity: 1, maxQuantity: 1 });
  
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

  // Filter shops by location
  const visibleShops = shops.filter(s => 
    (s.location === activeLocation || !activeLocation || activeLocation === 'Geral')
  );

  useEffect(() => {
    if (visibleShops.length > 0 && !selectedShopId) {
      setSelectedShopId(visibleShops[0].id);
    } else if (visibleShops.length === 0) {
      setSelectedShopId(null);
    }
  }, [visibleShops]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedShopId]);

  const currentShopRaw = visibleShops.find(s => s.id === selectedShopId) || (visibleShops.length > 0 ? visibleShops[0] : null);

  const currentShop = currentShopRaw ? {
    ...currentShopRaw,
    npcName: currentShopRaw.is_visible ? currentShopRaw.npcName : 'Mercador Ausente',
    npcPortrait: currentShopRaw.is_visible ? currentShopRaw.npcPortrait : '',
    welcomeMessage: currentShopRaw.is_visible ? currentShopRaw.welcomeMessage : 'A barraca está vazia. O mercador não se encontra no momento.',
    inventory: currentShopRaw.is_visible ? currentShopRaw.inventory : []
  } : null;

  // Typewriter effect state
  const [displayedMessage, setDisplayedMessage] = useState('');
  
  useEffect(() => {
    if (!currentShop?.welcomeMessage) return;
    
    setDisplayedMessage('');
    let i = 0;
    const message = currentShop.welcomeMessage;
    const interval = setInterval(() => {
      i++;
      setDisplayedMessage(message.substring(0, i));
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
        <div className="flex items-center gap-1">
          <img src={goldImg} alt="G" className="w-4 h-4 object-contain drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
          <span className="text-yellow-400 font-bold">{g}</span>
        </div>
        <div className="flex items-center gap-1">
          <img src={silverImg} alt="S" className="w-4 h-4 object-contain drop-shadow-[0_0_4px_rgba(212,212,216,0.4)]" />
          <span className="text-zinc-300 font-bold">{s}</span>
        </div>
        <div className="flex items-center gap-1">
          <img src={bronzeImg} alt="B" className="w-4 h-4 object-contain drop-shadow-[0_0_4px_rgba(234,88,12,0.4)]" />
          <span className="text-orange-500 font-bold">{b}</span>
        </div>
      </div>
    );
  };

  const openPurchaseModal = (item: RPGItem, shopItem: any) => {
    const maxStack = 5;
    const existingItems = inventory.filter(i => i.globalItemId === item.id || i.name === item.name);
    const emptySpaceInStacks = existingItems.reduce((acc, i) => acc + Math.max(0, maxStack - i.quantity), 0);
    const usedSlots = inventory.length;
    const availableSlots = Math.max(0, inventoryCapacity - usedSlots);
    const backpackMax = emptySpaceInStacks + (availableSlots * maxStack);

    const affordMax = Math.floor(coinsBronze / shopItem.priceBronze);
    const absoluteMax = Math.max(0, Math.min(shopItem.stock, affordMax, backpackMax));

    if (absoluteMax === 0) {
      if (shopItem.stock <= 0) showToast('Item esgotado!', 'error');
      else if (affordMax <= 0) showToast('Moedas insuficientes!', 'error');
      else if (backpackMax <= 0) showToast('Espaço insuficiente na mochila!', 'error');
      return;
    }

    setPurchaseModal({
      isOpen: true,
      item,
      shopItem,
      quantity: 1,
      maxQuantity: absoluteMax
    });
  };

  const handleConfirmBuy = async (item: RPGItem, shopItem: any, quantity: number) => {
    if (!currentShop || !currentUser) return;

    setBuyingItemId(item.id);
    const result = await buyItem(currentShop.id, item.id, currentUser, quantity);
    setBuyingItemId(null);
    
    if (result.success) {
      audioService.playSound('BUY_ITEM');
      showToast(`${quantity}x ${item.name} comprado com sucesso!`, 'success');
      setPurchaseModal(prev => ({ ...prev, isOpen: false }));
    } else {
      showToast(result.error || 'Erro na compra', 'error');
    }
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
          <div className="relative aspect-square lg:aspect-[3/4] overflow-hidden group">
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
                    <div className="text-xs font-bold uppercase tracking-tight relative z-10">
                      {!shop.is_visible ? 'Mercador Ausente' : shop.name}
                    </div>
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

                  {(() => {
                    const ITEMS_PER_PAGE = 6;
                    const totalItems = currentShop.inventory.length;
                    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
                    const paginatedInventory = currentShop.inventory.slice(
                      currentPage * ITEMS_PER_PAGE,
                      (currentPage + 1) * ITEMS_PER_PAGE
                    );

                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                          {paginatedInventory.map(shopItem => {
                            const item = rpgItems.find(i => i.id === shopItem.itemId);
                            if (!item) return null;

                            return (
                              <div 
                                key={item.id} 
                                className={`group relative bg-zinc-900/30 border border-amber-900/20 rounded-2xl p-4 sm:p-5 flex flex-col transition-all duration-500 shadow-xl ${
                                  shopItem.stock <= 0 
                                    ? 'grayscale opacity-60 pointer-events-none' 
                                    : 'hover:bg-amber-950/10 hover:border-amber-600/40 hover:shadow-amber-900/20'
                                } ${
                                  item.rarity === 'legendary' && shopItem.stock > 0 ? 'hover:shadow-[0_0_25px_rgba(251,191,36,0.1)] border-amber-500/50' : ''
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

                                {/* Item Illustration & Price Wrapper */}
                                <div className="flex gap-4 mb-4 items-stretch h-32">
                                  {/* Left: Prominent Illustration */}
                                  <div className={`relative w-24 sm:w-28 flex items-center justify-center rounded-xl bg-black/40 border border-amber-900/30 overflow-hidden group/img ${
                                    item.rarity === 'divine' ? 'shadow-[0_0_15px_rgba(220,38,38,0.2)] border-red-500/50' :
                                    item.rarity === 'legendary' ? 'shadow-[0_0_15px_rgba(251,191,36,0.2)] border-amber-500/50' : 
                                    item.rarity === 'rare' ? 'shadow-[0_0_15px_rgba(168,85,247,0.2)] border-purple-500/50' : ''
                                  }`}>
                                    {item.imageUrl ? (
                                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-700 scale-95 group-hover/img:scale-110" />
                                    ) : (
                                      <Gem className={`w-8 h-8 sm:w-10 sm:h-10 text-amber-900/40 ${item.rarity === 'legendary' ? 'animate-pulse' : ''}`} />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                                  </div>
                                  
                                  {/* Right: Price & Quick Info */}
                                  <div className="flex-1 flex flex-col justify-center gap-3">
                                    <div className="text-left">
                                      <span className="text-[8px] text-amber-900 uppercase font-black tracking-widest block mb-1">Preço Sugerido</span>
                                      <div className="bg-black/60 px-3 py-2 rounded-xl border border-amber-900/40 shadow-inner inline-block">
                                        {formatPrice(shopItem.priceBronze)}
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[8px] text-amber-900 uppercase font-black tracking-widest block">Categoria</span>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[8px] sm:text-[9px] px-2 py-0.5 rounded border uppercase font-bold tracking-tighter ${
                                          item.rarity === 'divine' ? 'bg-red-950/40 border-red-500 text-red-400' :
                                          item.rarity === 'legendary' ? 'bg-amber-950/40 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                                          item.rarity === 'rare' ? 'bg-purple-950/40 border-purple-500 text-purple-400' :
                                          'bg-zinc-900/40 border-zinc-700 text-zinc-500'
                                        }`}>
                                          {translateRarity(item.rarity)}
                                        </span>
                                      </div>
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
                                      {translateRarity(item.rarity)}
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
                                    <span className={`text-[8px] uppercase font-black tracking-widest ${shopItem.stock <= 0 ? 'text-zinc-600' : shopItem.stock <= 2 ? 'text-red-500 animate-pulse' : 'text-amber-900'}`}>
                                      {shopItem.stock <= 0 ? 'Esgotado' : shopItem.stock <= 2 ? 'Últimas!' : 'Estoque'}
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
                                    onClick={() => openPurchaseModal(item, shopItem)}
                                    disabled={buyingItemId === item.id || shopItem.stock <= 0}
                                    className={`relative flex-1 group/btn overflow-hidden ${shopItem.stock <= 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                                  >
                                    <div className={`absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-900 opacity-0 ${shopItem.stock > 0 ? 'group-hover/btn:opacity-100' : ''} transition-opacity duration-500`} />
                                    <div className={`relative px-3 sm:px-6 py-2 bg-amber-900/40 border border-amber-700/50 rounded-xl text-amber-100 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${shopItem.stock > 0 ? 'group-hover/btn:text-black' : ''}`}>
                                      {buyingItemId === item.id ? (
                                        <div className="w-3 h-3 border-2 border-amber-500 border-t-white rounded-full animate-spin" />
                                      ) : shopItem.stock <= 0 ? (
                                        <>Sem Estoque</>
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

                        {/* Store Inventory Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-4 mt-8 bg-zinc-950/40 border border-amber-900/20 rounded-2xl p-4 max-w-sm mx-auto shadow-inner">
                            <button 
                              onClick={() => {
                                audioService.playSound('BACKPACK_MOVE');
                                setCurrentPage(prev => Math.max(0, prev - 1));
                              }}
                              disabled={currentPage === 0}
                              className="flex items-center gap-1 px-3 py-1.5 bg-black/40 border border-amber-900/30 rounded-lg text-amber-500 hover:text-amber-400 disabled:text-zinc-700 disabled:border-zinc-800/40 disabled:bg-transparent transition-all text-xs uppercase font-bold tracking-wider"
                            >
                              <ChevronLeft className="w-4 h-4" /> Anterior
                            </button>
                            <span className="text-[10px] sm:text-xs text-amber-500/80 font-bold uppercase tracking-widest bg-black/40 border border-amber-900/20 rounded px-3 py-1.5">
                              Pág {currentPage + 1} de {totalPages}
                            </span>
                            <button 
                              onClick={() => {
                                audioService.playSound('BACKPACK_MOVE');
                                setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
                              }}
                              disabled={currentPage >= totalPages - 1}
                              className="flex items-center gap-1 px-3 py-1.5 bg-black/40 border border-amber-900/30 rounded-lg text-amber-500 hover:text-amber-400 disabled:text-zinc-700 disabled:border-zinc-800/40 disabled:bg-transparent transition-all text-xs uppercase font-bold tracking-wider"
                            >
                              Próximo <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
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

      {/* Purchase Modal */}
      {purchaseModal.isOpen && purchaseModal.item && purchaseModal.shopItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-amber-900/50 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700 to-amber-500" />
            
            <button 
              onClick={() => setPurchaseModal({ ...purchaseModal, isOpen: false })}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <h3 className="text-xl font-black text-amber-500 uppercase tracking-tight mb-1 pr-6 leading-tight">
                Comprar Item
              </h3>
              <p className="text-sm text-amber-100/70 mb-6 font-bold truncate">
                {purchaseModal.item.name}
              </p>

              <div className="flex flex-col items-center gap-6">
                {/* Quantity Controls */}
                <div className="flex items-center gap-4 bg-black/40 p-2 rounded-xl border border-amber-900/30 w-full justify-center">
                  <button
                    onClick={() => setPurchaseModal(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                    disabled={purchaseModal.quantity <= 1}
                    className="w-12 h-12 rounded-lg bg-amber-900/20 text-amber-500 flex items-center justify-center hover:bg-amber-900/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Minus className="w-6 h-6" />
                  </button>
                  
                  <div className="w-20 text-center flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white leading-none">{purchaseModal.quantity}</span>
                    <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold mt-1">
                      Max: {purchaseModal.maxQuantity}
                    </span>
                  </div>

                  <button
                    onClick={() => setPurchaseModal(prev => ({ ...prev, quantity: Math.min(prev.maxQuantity, prev.quantity + 1) }))}
                    disabled={purchaseModal.quantity >= purchaseModal.maxQuantity}
                    className="w-12 h-12 rounded-lg bg-amber-900/20 text-amber-500 flex items-center justify-center hover:bg-amber-900/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                {/* Total Price */}
                <div className="w-full bg-black/60 rounded-xl p-4 border border-amber-900/20 flex items-center justify-between">
                  <span className="text-xs text-amber-900 font-black uppercase tracking-widest">Total:</span>
                  <div className="scale-110 origin-right">
                    {formatPrice(purchaseModal.shopItem.priceBronze * purchaseModal.quantity)}
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={() => {
                    handleConfirmBuy(purchaseModal.item!, purchaseModal.shopItem, purchaseModal.quantity);
                  }}
                  disabled={buyingItemId === purchaseModal.item?.id}
                  className="w-full py-4 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 rounded-xl text-black font-black uppercase tracking-[0.2em] text-sm transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {buyingItemId === purchaseModal.item?.id ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Confirmar Compra
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
