import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Tag, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  User as UserIcon, 
  MapPin, 
  Phone, 
  Save, 
  Truck, 
  Clock, 
  Gift, 
  Check, 
  ScanLine 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, Pedido, DetallePedido, User } from '../types';

interface ClientDashboardProps {
  products: Product[];
  categories: Category[];
  pedidos: Pedido[];
  detallePedidos: DetallePedido[];
  currentUser: User;
  onUpdateProfile: (updatedData: Partial<User>) => void;
  onPlaceOrder: (items: { product: Product; quantity: number }[], paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia', couponCode?: string) => void;
}

export const ClientDashboard = ({ 
  products, 
  categories, 
  pedidos, 
  detallePedidos, 
  currentUser, 
  onUpdateProfile, 
  onPlaceOrder 
}: ClientDashboardProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'catalogo' | 'carrito' | 'pedidos' | 'perfil'>('catalogo');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  // Shopping Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; rate: number; isFixed?: boolean } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');

  // Scanner Simulator state
  const [showScanner, setShowScanner] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scannerMessage, setScannerMessage] = useState('');

  // Profile Edit state
  const [profileForm, setProfileForm] = useState({
    nombre: currentUser.nombre || currentUser.username || '',
    telefono: currentUser.telefono || currentUser.phone || '',
    direccion: currentUser.direccion || currentUser.address || ''
  });
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nombre_producto.toLowerCase().includes(search.toLowerCase()) || 
                          p.marca.toLowerCase().includes(search.toLowerCase()) ||
                          p.codigo_barras.includes(search);
    
    let matchesCategory = true;
    if (selectedCategory !== 'Todas') {
      matchesCategory = p.id_categoria === selectedCategory;
    }
    return matchesSearch && matchesCategory;
  });

  // Client's specific orders
  const clientPedidos = pedidos
    .filter(o => o.id_usuario === currentUser.id)
    .sort((a, b) => b.id_pedido.localeCompare(a.id_pedido));

  // Cart operations
  const addToCart = (product: Product, qty: number = 1) => {
    if (product.stock <= 0) {
      alert('Producto agotado');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id_producto === product.id_producto);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > product.stock) {
          alert(`¡Límite de stock alcanzado! Solo quedan ${product.stock} disponibles.`);
          return prev;
        }
        return prev.map(item => 
          item.product.id_producto === product.id_producto ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    // Visual flash/feedback
    setScannerMessage(`¡${product.nombre_producto} agregado al carrito!`);
    setTimeout(() => setScannerMessage(''), 3000);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id_producto === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) {
            alert(`Límite superado. Stock actual: ${item.product.stock}`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id_producto !== id));
  };

  // Coupons
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = coupon.toUpperCase().trim();
    if (code === 'BARATO15') {
      setAppliedDiscount({ code, rate: 0.15 });
      setCouponSuccess('¡Cupón BARATO15 aplicado! Ahorraste el 15%.');
      setCouponError('');
    } else if (code === 'CETIS7') {
      setAppliedDiscount({ code, rate: 15, isFixed: true });
      setCouponSuccess('¡Cupón de Alianza CETIS-7 aplicado! Descuento fijo de $15.00.');
      setCouponError('');
    } else if (code === 'ENVIOFREE') {
      setAppliedDiscount({ code, rate: 0.10 });
      setCouponSuccess('¡Cupón de Envío cortesía! Ahorraste 10%.');
      setCouponError('');
    } else {
      setCouponError('Cupón no válido. Intenta con BARATO15 o CETIS7.');
      setCouponSuccess('');
    }
  };

  // Totals calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.precio * item.quantity), 0);
  let cartDiscount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.isFixed) {
      cartDiscount = Math.min(appliedDiscount.rate, cartSubtotal);
    } else {
      cartDiscount = cartSubtotal * appliedDiscount.rate;
    }
  }
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  // Checkout trigger
  const handleCheckout = () => {
    if (cart.length === 0) return;
    onPlaceOrder(cart, paymentMethod, appliedDiscount?.code);
    setCart([]);
    setAppliedDiscount(null);
    setCoupon('');
    setActiveSubTab('pedidos');
  };

  // Barcode mock scan
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const found = products.find(p => p.codigo_barras === scannedBarcode.trim());
    if (found) {
      addToCart(found, 1);
      setScannerMessage(`🔊 ¡BIP! Encontrado: ${found.nombre_producto} ($${found.precio.toFixed(2)})`);
      setScannedBarcode('');
    } else {
      setScannerMessage('❌ Código de barras no encontrado en la base de datos.');
    }
    setTimeout(() => setScannerMessage(''), 5000);
  };

  const simulateQuickScan = (bar: string) => {
    setScannedBarcode(bar);
    const found = products.find(p => p.codigo_barras === bar);
    if (found) {
      addToCart(found, 1);
      setScannerMessage(`🔊 ¡BIP! Escaneo automático de ${found.nombre_producto} exitoso.`);
    } else {
      setScannerMessage('❌ Error de lectura.');
    }
    setTimeout(() => setScannerMessage(''), 5000);
  };

  // Profile Save
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black/40 border border-white/10 p-8 md:p-10 rounded-[2.5rem] gap-6 glow-blue/5">
        <div>
          <span className="text-[10px] bg-neon-blue/10 text-neon-blue px-3 py-1 rounded-full border border-neon-blue/20 uppercase tracking-[0.2em] font-black italic">
            Área de Clientes
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mt-3 uppercase">
            ABARROTES <span className="text-neon-blue text-glow-blue">NEON</span>
          </h2>
          <p className="text-white/50 text-xs mt-1 uppercase tracking-wider font-semibold">
            Compra segura con entrega express • Hola, <span className="text-neon-yellow">{currentUser.username}</span>
          </p>
        </div>
        
        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setActiveSubTab('catalogo')}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${
              activeSubTab === 'catalogo'
                ? 'bg-neon-blue text-black border-neon-blue glow-blue'
                : 'bg-transparent text-white/50 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            🛍️ Catálogo
          </button>
          
          <button
            onClick={() => setActiveSubTab('carrito')}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border relative ${
              activeSubTab === 'carrito'
                ? 'bg-neon-green text-black border-neon-green glow-green'
                : 'bg-transparent text-white/50 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            🛒 Carrito
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 border border-black text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('pedidos')}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${
              activeSubTab === 'pedidos'
                ? 'bg-neon-yellow text-black border-neon-yellow glow-yellow'
                : 'bg-transparent text-white/50 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            📋 Mis Pedidos ({clientPedidos.length})
          </button>

          <button
            onClick={() => setActiveSubTab('perfil')}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${
              activeSubTab === 'perfil'
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-white/50 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            👤 Mi Perfil
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: CATALOGO */}
        {activeSubTab === 'catalogo' && (
          <motion.div
            key="catalogo"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Search, Filters, Code Scan Simulator toggle */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neon-blue" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar abarrotes, marca, código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-black/60 border border-white/10 rounded-2xl focus:border-neon-blue outline-none text-white text-sm"
                />
              </div>

              <div className="lg:col-span-4 flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-4 bg-black/60 border border-white/10 rounded-2xl text-white outline-none focus:border-neon-blue text-xs font-bold appearance-none cursor-pointer"
                >
                  <option value="Todas">🏠 Todas las Categorías</option>
                  {categories.map(c => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.nombre_categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <button
                  onClick={() => setShowScanner(!showScanner)}
                  className="w-full py-4 bg-white/5 border border-white/10 hover:border-neon-blue rounded-2xl text-[10px] font-black uppercase tracking-wider text-white hover:text-neon-blue flex items-center justify-center gap-2 transition-all"
                >
                  <ScanLine size={16} /> {showScanner ? 'Ocultar Escáner' : 'Escáner Barras'}
                </button>
              </div>
            </div>

            {/* Simulated Barcode Scanner Container */}
            {showScanner && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/80 border border-neon-blue/30 rounded-3xl p-6 relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                  <div className="p-4 bg-neon-blue/10 rounded-2xl border border-neon-blue/30 text-neon-blue shrink-0 animate-pulse">
                    <ScanLine size={36} />
                  </div>
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <h4 className="text-white font-black text-xs uppercase tracking-widest italic">Simulador de Lector Láser (Barcode Reader)</h4>
                    <p className="text-white/60 text-[10px]">
                      Ingresa el código de barras de cualquier producto o haz clic en un escaneo rápido para cargarlo al carrito instantáneamente.
                    </p>
                    
                    {/* Raw Input Form */}
                    <form onSubmit={handleBarcodeScan} className="flex gap-2 max-w-md mx-auto md:mx-0">
                      <input 
                        type="text" 
                        placeholder="Ej. 7501020304051"
                        value={scannedBarcode}
                        onChange={(e) => setScannedBarcode(e.target.value)}
                        className="flex-1 px-4 py-2 bg-black border border-white/20 rounded-xl text-white text-xs font-mono"
                      />
                      <button type="submit" className="px-4 py-2 bg-neon-blue text-black font-bold text-xs rounded-xl hover:bg-[#4deaff]">
                        Escuchar BIP
                      </button>
                    </form>
                  </div>
                  
                  {/* Quick test buttons */}
                  <div className="shrink-0 text-right space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-2">Escaneo Rápido Demo</p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                      <button 
                        onClick={() => simulateQuickScan('7501020304051')}
                        className="px-2 py-1 bg-black border border-white/10 hover:border-neon-blue text-[8px] font-mono rounded"
                      >
                        🥛 Leche
                      </button>
                      <button 
                        onClick={() => simulateQuickScan('7501020304068')}
                        className="px-2 py-1 bg-black border border-white/10 hover:border-neon-blue text-[8px] font-mono rounded"
                      >
                        🥚 Huevo
                      </button>
                      <button 
                        onClick={() => simulateQuickScan('7501020304075')}
                        className="px-2 py-1 bg-black border border-white/10 hover:border-neon-blue text-[8px] font-mono rounded"
                      >
                        🥤 CocaCola
                      </button>
                      <button 
                        onClick={() => simulateQuickScan('7501020304082')}
                        className="px-2 py-1 bg-black border border-white/10 hover:border-neon-blue text-[8px] font-mono rounded"
                      >
                        🥔 Papas
                      </button>
                    </div>
                  </div>
                </div>

                {scannerMessage && (
                  <div className="mt-4 text-center text-neon-blue text-xs font-black uppercase tracking-widest bg-neon-blue/10 border border-neon-blue/20 py-2 rounded-xl animate-bounce">
                    {scannerMessage}
                  </div>
                )}
                
                <div className="absolute top-0 left-0 w-full h-0.5 bg-neon-blue/30 shadow-[0_0_10px_#00F3FF] animate-[bounce_3s_infinite]" />
              </motion.div>
            )}

            {/* Coupons Promo Banner */}
            <div className="bg-gradient-to-r from-neon-yellow/10 to-transparent border border-neon-yellow/20 p-5 rounded-3xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Gift className="text-neon-yellow animate-bounce shrink-0" size={24} />
                <div>
                  <h5 className="font-bold text-white text-xs uppercase tracking-widest">¡Promociones Abarroteras Pro!</h5>
                  <p className="text-white/50 text-[10px] uppercase mt-0.5">
                    Utiliza el cupón <span className="text-neon-yellow font-black font-mono">BARATO15</span> para ahorrar el 15% o el cupón <span className="text-neon-yellow font-black font-mono">CETIS7</span> para descuento fijo de $15.00.
                  </p>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(p => {
                const catObj = categories.find(c => c.id_categoria === p.id_categoria);
                const hasLowStock = p.stock > 0 && p.stock <= 5;
                const isAgotado = p.stock <= 0;

                return (
                  <div 
                    key={p.id_producto}
                    id={`product-card-${p.id_producto}`}
                    className="bg-white/5 border border-white/5 rounded-[2.5rem] p-6 hover:border-neon-blue/30 hover:bg-white/10 transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      {/* Top badges */}
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[9px] bg-white/5 border border-white/10 text-white/50 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                          {catObj?.nombre_categoria || p.category}
                        </span>
                        
                        {isAgotado ? (
                          <span className="text-[8px] font-black bg-red-600/20 border border-red-600/40 text-red-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            🚫 Agotado
                          </span>
                        ) : hasLowStock ? (
                          <span className="text-[8px] font-black bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                            ⚠️ Bajo Stock
                          </span>
                        ) : (
                          <span className="text-[8px] font-black bg-neon-green/10 border border-neon-green/30 text-neon-green px-2.5 py-1 rounded-full uppercase tracking-wider">
                            ✓ Disponible
                          </span>
                        )}
                      </div>

                      {/* Product Visual Photo Emoji */}
                      <div className="w-full h-28 bg-black/60 border border-white/5 rounded-2xl flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition-transform shadow-inner select-none">
                        {p.foto || '📦'}
                      </div>

                      {/* Product detail */}
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                        {p.marca}
                      </p>
                      <h4 id={`product-name-${p.id_producto}`} className="text-lg font-black text-white group-hover:text-neon-blue transition-colors mt-0.5 leading-tight uppercase truncate">
                        {p.nombre_producto}
                      </h4>
                      <p className="text-white/50 text-[10px] mt-2 line-clamp-2 min-h-[2.5rem]">
                        {p.descripcion}
                      </p>
                      
                      <p className="text-[9px] font-mono text-white/20 mt-2">
                        BARCODE: {p.codigo_barras}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] text-white/30 uppercase tracking-widest">Precio</p>
                        <p className="text-2xl font-black text-white font-mono tracking-tighter">${p.precio.toFixed(2)}</p>
                      </div>
                      
                      <button
                        onClick={() => addToCart(p, 1)}
                        disabled={isAgotado}
                        className="py-3 px-4 bg-neon-blue disabled:bg-white/5 disabled:text-white/10 text-black rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-[#4deaff] active:scale-95 transition-all shadow-lg hover:shadow-neon-blue/20 flex items-center gap-1.5"
                      >
                        <Plus size={14} /> Carrito
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center text-white/10 bg-white/5 border border-white/5 rounded-[2.5rem]">
                  <Search size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-xs uppercase font-black tracking-widest px-10">Ningún producto coincide con el filtro / búsqueda</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: SHOPPING CART */}
        {activeSubTab === 'carrito' && (
          <motion.div
            key="carrito"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            {/* Left Col: Cart items list */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-black/40 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                <h3 className="font-black text-white text-xl uppercase italic tracking-tighter border-b border-white/5 pb-4 flex items-center gap-2">
                  <ShoppingCart className="text-neon-green" /> LISTA DE ARTÍCULOS SELECCIONADOS
                </h3>

                {cart.length === 0 ? (
                  <div className="py-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 border border-white/15 rounded-full flex items-center justify-center mx-auto text-white/20">
                      <ShoppingCart size={32} />
                    </div>
                    <div>
                      <p className="text-white/50 text-xs font-black uppercase tracking-widest">Tu carrito de la tienda está vacío</p>
                      <button 
                        onClick={() => setActiveSubTab('catalogo')}
                        className="mt-4 px-6 py-3 bg-neon-blue text-black font-black uppercase rounded-xl text-[10px] tracking-widest hover:bg-[#4deaff] transition-all"
                      >
                        Ver Catálogo de Productos
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div 
                        key={item.product.id_producto}
                        className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 group hover:border-white/15 transition-all"
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-3xl box-border border border-white/10 shrink-0">
                            {item.product.foto || '🥛'}
                          </div>
                          <div>
                            <p className="text-[8px] text-white/30 uppercase tracking-widest mt-0.5">{item.product.marca}</p>
                            <h5 className="text-white font-bold text-sm uppercase -mt-0.5">{item.product.nombre_producto}</h5>
                            <p className="text-[9px] text-neon-green font-mono">${item.product.precio.toFixed(2)} UNIT</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          {/* Quantity control */}
                          <div className="flex items-center bg-black border border-white/10 rounded-xl overflow-hidden p-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id_producto, -1)}
                              className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-lg active:scale-95"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center font-mono font-black text-xs text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id_producto, 1)}
                              className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-lg active:scale-95"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-right min-w-[5rem]">
                            <p className="font-mono font-black text-white text-sm">
                              ${(item.product.precio * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          {/* Kill button */}
                          <button
                            onClick={() => removeFromCart(item.product.id_producto)}
                            className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Remover"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery info placeholder displays */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-3">
                    <Truck size={16} className="text-neon-blue" /> Dirección de Entrega Confirmada
                  </h4>
                  <p className="text-white/60 text-xs py-2 px-3 bg-black border border-white/5 rounded-xl flex items-center gap-2">
                    <MapPin size={14} className="text-white/30 shrink-0" />
                    {profileForm.direccion || 'No ingresada, favor de escribirla en tu perfil'}
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-3">
                    <Phone size={16} className="text-neon-blue" /> Teléfono de Contacto
                  </h4>
                  <p className="text-white/60 text-xs py-2 px-3 bg-black border border-white/5 rounded-xl flex items-center gap-2">
                    <Phone size={14} className="text-white/30 shrink-0" />
                    {profileForm.telefono || 'Sin teléfono asociado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: Totals, Coupons, Payment controls */}
            <div className="lg:col-span-4 space-y-6">
              {/* Payment Methods */}
              <div className="bg-[#0c0c0c] border border-white/10 p-6 rounded-[2rem]">
                <h4 className="text-white font-black text-xs uppercase tracking-widest border-b border-white/5 pb-3 mb-4">
                  Método de Pago
                </h4>
                
                <div className="space-y-3">
                  {(['efectivo', 'tarjeta', 'transferencia'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`w-full py-4 px-4 rounded-xl text-left border flex items-center justify-between font-black uppercase text-[10px] tracking-wider transition-all ${
                        paymentMethod === method
                          ? 'border-neon-teal border-neon-blue text-white bg-neon-blue/5'
                          : 'border-white/5 text-white/40 bg-transparent hover:border-white/10'
                      }`}
                    >
                      <span>
                        {method === 'efectivo' && '💵 Efectivo (Pago al Recibir)'}
                        {method === 'tarjeta' && '💳 Tarjeta de Crédito/Débito'}
                        {method === 'transferencia' && '⚡ Transferencia Electrónica'}
                      </span>
                      {paymentMethod === method && (
                        <div className="w-4 h-4 rounded-full bg-neon-blue flex items-center justify-center text-black">
                          <Check size={10} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coupon applier form */}
              <div className="bg-[#0c0c0c] border border-white/10 p-6 rounded-[2rem]">
                <h4 className="text-white font-black text-xs uppercase tracking-widest border-b border-white/5 pb-3 mb-4">
                  Cupones de Descuento
                </h4>
                
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="INGRESAR CLAVE..."
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs text-center font-bold tracking-widest"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-neon-yellow text-black font-black text-[10px] rounded-xl hover:bg-[#ffe600] active:scale-95"
                  >
                    APLICAR
                  </button>
                </form>

                {couponError && (
                  <p className="text-red-400 text-[10px] mt-2 text-center uppercase tracking-wider font-bold">
                    {couponError}
                  </p>
                )}
                {couponSuccess && (
                  <p className="text-neon-green text-[10px] mt-2 text-center uppercase tracking-wider font-bold">
                    {couponSuccess}
                  </p>
                )}
                {appliedDiscount && (
                  <div className="mt-3 bg-neon-green/10 border border-neon-green/20 py-2 px-3 rounded-lg text-neon-green text-[9px] font-black text-center uppercase tracking-wide">
                    CUPÓN ACTIVO COBRADO: {appliedDiscount.code} 
                  </div>
                )}
              </div>

              {/* Live liquidator summary */}
              <div className="bg-black border-2 border-neon-green/30 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden">
                <h4 className="text-white font-black text-xs uppercase tracking-[0.25em] italic flex items-center gap-2">
                  <Clock size={16} className="text-neon-green" /> RESUMEN DE LA ORDEN
                </h4>

                <div className="space-y-4 text-xs font-semibold uppercase tracking-wider text-white/50 border-b border-white/5 pb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">${cartSubtotal.toFixed(2)}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-neon-green">
                      <span>Descuento Aplicado</span>
                      <span className="font-mono">-${cartDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span className="text-neon-blue font-black text-[9px] bg-neon-blue/10 border border-neon-blue/30 px-2.5 py-0.5 rounded">¡CORTESÍA!</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">Total a Validar</p>
                    <h5 className="text-4xl font-black text-white text-glow-green font-mono tracking-tighter">${cartTotal.toFixed(2)}</h5>
                  </div>
                  <div className="w-12 h-12 bg-neon-green/10 rounded-2xl flex items-center justify-center text-neon-green glow-green">
                    <ShoppingCart size={22} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-5 bg-neon-green disabled:bg-white/5 disabled:text-white/10 text-black rounded-2xl font-black text-base uppercase tracking-widest hover:bg-[#43ff1f] transition-all flex items-center justify-center gap-2 active:scale-95 lg:scale-105"
                >
                  Confirmar Compra
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: USER ORDERS */}
        {activeSubTab === 'pedidos' && (
          <motion.div
            key="pedidos"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="bg-black/40 border border-white/10 p-8 rounded-[2.5rem]">
              <h3 className="font-black text-white text-xl uppercase italic tracking-tighter border-b border-white/5 pb-4 mb-6">
                HISTORIAL DE MIS PEDIDOS REALIZADOS
              </h3>

              {clientPedidos.length === 0 ? (
                <div className="py-20 text-center text-white/20">
                  <Clock size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-xs uppercase font-black tracking-widest">No tienes ningún pedido registrado a tu nombre.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {clientPedidos.map(pedido => {
                    const lineItems = detallePedidos.filter(d => d.id_pedido === pedido.id_pedido);

                    return (
                      <div 
                        key={pedido.id_pedido}
                        className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6"
                      >
                        {/* Pedido Header Info */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                          <div>
                            <span className="text-[10px] text-neon-blue font-mono font-black">{pedido.id_pedido}</span>
                            <h4 className="text-white font-black text-lg uppercase italic tracking-tight mt-0.5">
                              Total de Compra: <span className="text-neon-green">${pedido.total.toFixed(2)}</span>
                            </h4>
                            <p className="text-white/40 text-[10px] font-bold font-mono mt-0.5">
                              FECHA DE REGISTRO: {pedido.fecha_pedido} • PAGO: {pedido.metodo_pago.toUpperCase()}
                            </p>
                          </div>
                          
                          {/* Live interactive Stepper state */}
                          <div className="flex flex-col md:items-end">
                            <p className="text-[8px] text-white/30 uppercase tracking-widest font-black mb-1.5">Estado del Pedido</p>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              pedido.estado_pedido === 'pendiente' ? 'border-neon-yellow/30 text-neon-yellow bg-neon-yellow/5' :
                              pedido.estado_pedido === 'preparando' ? 'border-amber-400/30 text-amber-400 bg-amber-400/5' :
                              pedido.estado_pedido === 'enviado' ? 'border-neon-blue/30 text-neon-blue bg-neon-blue/5' :
                              pedido.estado_pedido === 'entregado' ? 'border-neon-green/30 text-neon-green bg-neon-green/5' :
                              'border-red-400/30 text-red-500 bg-red-500/5'
                            }`}>
                              ● {pedido.estado_pedido.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Timeline Tracker */}
                        <div className="py-4">
                          <div className="grid grid-cols-5 text-center gap-1 relative">
                            {/* Connector line */}
                            <div className="absolute top-[18px] left-[10%] right-[10%] h-[3px] bg-white/5 z-0" />
                            
                            {/* Color highlight of active stages */}
                            {pedido.estado_pedido !== 'cancelado' && (
                              <div 
                                className="absolute top-[18px] left-[10%] h-[3px] bg-gradient-to-r from-neon-yellow to-neon-green z-0 transition-all duration-1000" 
                                style={{
                                  width: pedido.estado_pedido === 'pendiente' ? '10%' :
                                         pedido.estado_pedido === 'preparando' ? '30%' :
                                         pedido.estado_pedido === 'enviado' ? '55%' : '80%'
                                }}
                              />
                            )}

                            {[
                              { label: 'Pendiente', code: 'pendiente', color: 'text-neon-yellow shadow-neon-yellow/15 bg-neon-yellow', val: 1 },
                              { label: 'Preparación', code: 'preparando', color: 'text-amber-400 shadow-amber-400/15 bg-amber-400', val: 2 },
                              { label: 'En Ruta', code: 'enviado', color: 'text-neon-blue shadow-neon-blue/15 bg-neon-blue', val: 3 },
                              { label: 'Entregado Real', code: 'entregado', color: 'text-neon-green shadow-neon-green/15 bg-neon-green', val: 4 },
                              { label: 'Cancelado', code: 'cancelado', color: 'text-red-500 shadow-red-500/15 bg-red-600', val: 0 }
                            ].map((step, idx) => {
                              const isActive = pedido.estado_pedido === step.code;
                              const isPast = pedido.estado_pedido === 'cancelado' ? step.code === 'cancelado' :
                                           (step.code !== 'cancelado' && (
                                              pedido.estado_pedido === 'entregado' ||
                                              (pedido.estado_pedido === 'enviado' && step.val < 4) ||
                                              (pedido.estado_pedido === 'preparando' && step.val < 3) ||
                                              (pedido.estado_pedido === 'pendiente' && step.val < 2)
                                           ));

                              return (
                                <div key={idx} className="flex flex-col items-center relative z-10">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                    isActive ? `border-2 border-white scale-110 ${step.color} text-black font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.25)]` :
                                    isPast ? `${step.color} text-black font-extrabold` :
                                    'bg-neutral-900 border border-white/10 text-white/20'
                                  }`}>
                                    {isPast && !isActive ? '✓' : step.val === 0 ? '✕' : step.val}
                                  </div>
                                  <span className={`text-[9px] font-black uppercase mt-2 tracking-wider ${
                                    isActive ? 'text-white' : isPast ? 'text-white/60' : 'text-white/20'
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Order Items Table detail */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden p-4 space-y-3">
                          <p className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em]">Desglose de Productos</p>
                          <div className="space-y-2">
                            {lineItems.map(item => (
                              <div key={item.id_detalle} className="flex justify-between items-center text-xs font-semibold py-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-[9px] text-white rounded font-mono font-bold">
                                    {item.cantidad}x
                                  </span>
                                  <span className="text-white font-bold">{item.nombre_producto || `Artículo #${item.id_producto}`}</span>
                                </div>
                                <span className="font-mono text-neon-green">${item.subtotal.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: PROFILE */}
        {activeSubTab === 'perfil' && (
          <motion.div
            key="perfil"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-black/40 border border-white/10 p-8 md:p-10 rounded-[3rem] space-y-8">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="w-16 h-16 bg-neon-blue/10 border border-neon-blue/30 rounded-2xl flex items-center justify-center text-neon-blue glow-blue shrink-0">
                  <UserIcon size={28} />
                </div>
                <div>
                  <h3 className="font-black text-white text-xl uppercase tracking-tight">Editar Datos del Cliente</h3>
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-widest italic mt-0.5">Mantenimiento de Dirección de Envío y Contacto</p>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Nombre Completo</label>
                  <input 
                    required
                    type="text"
                    value={profileForm.nombre}
                    onChange={(e) => setProfileForm({...profileForm, nombre: e.target.value})}
                    className="w-full px-5 py-3.5 bg-black border border-white/10 rounded-xl focus:border-neon-blue outline-none text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Teléfono</label>
                    <input 
                      required
                      type="tel"
                      value={profileForm.telefono}
                      onChange={(e) => setProfileForm({...profileForm, telefono: e.target.value})}
                      className="w-full px-5 py-3.5 bg-black border border-white/10 rounded-xl focus:border-neon-blue outline-none text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Email Registrado</label>
                    <input 
                      disabled
                      type="email"
                      value={currentUser.email}
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-xl outline-none text-white/40 cursor-not-allowed font-semibold text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Dirección de Envío Completa</label>
                  <input 
                    required
                    type="text"
                    value={profileForm.direccion}
                    onChange={(e) => setProfileForm({...profileForm, direccion: e.target.value})}
                    className="w-full px-5 py-3.5 bg-black border border-white/10 rounded-xl focus:border-neon-blue outline-none text-white"
                    placeholder="Completa tu dirección de abarrotes para la entrega..."
                  />
                </div>

                {profileSuccess && (
                  <div className="bg-neon-green/10 border border-neon-green/30 p-4 rounded-xl text-neon-green text-[10px] font-black text-center uppercase tracking-widest animate-bounce">
                    ¡Perfil actualizado con éxito!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-neon-blue text-black font-black uppercase tracking-wider rounded-xl hover:bg-[#4deaff] active:scale-95 transition-all text-xs"
                >
                  Guardar Perfil de Entrega
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
