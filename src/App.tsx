/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PackagePlus, 
  ShoppingCart, 
  Store, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2,
  Search,
  ChevronRight,
  Users,
  UserPlus,
  ShieldCheck,
  LogOut,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: 'Administrador' | 'Usuario (Cliente)';
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface SaleItem extends Product {
  quantity: number;
}

type Screen = 'welcome' | 'register' | 'sales' | 'users' | 'login';

// --- Components ---

const Sidebar = ({ currentScreen, setScreen, currentUser, onLogout }: { currentScreen: Screen, setScreen: (s: Screen) => void, currentUser: User | null, onLogout: () => void }) => {
  const isAdmin = currentUser?.role === 'Administrador';
  
  const menuItems = [
    { id: 'welcome', icon: LayoutDashboard, label: 'Inicio', color: 'text-neon-blue', visible: true },
    { id: 'register', icon: PackagePlus, label: 'Inventario', color: 'text-neon-yellow', visible: isAdmin },
    { id: 'sales', icon: ShoppingCart, label: 'Ventas', color: 'text-neon-green', visible: true },
  ];

  return (
    <aside id="sidebar" className="fixed left-0 top-0 h-full w-20 md:w-64 bg-black border-r border-white/10 flex flex-col z-50 p-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-transparent border-2 border-neon-blue rounded-xl flex items-center justify-center text-neon-blue font-bold text-xl glow-blue">
          <Store size={24} />
        </div>
        <span className="hidden md:block font-bold text-xl text-white tracking-widest text-glow-blue uppercase italic">Neon Pro</span>
      </div>
      <nav className="flex flex-col gap-4 flex-1">
        {menuItems.filter(item => item.visible).map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id as Screen)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group ${
              currentScreen === item.id 
                ? `bg-white/5 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]` 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={20} className={currentScreen === item.id ? item.color : 'group-hover:text-white'} />
            <span className={`hidden md:block text-sm font-bold tracking-wider ${currentScreen === item.id ? 'text-white' : ''}`}>{item.label}</span>
            {currentScreen === item.id && (
              <motion.div 
                layoutId="navGlow"
                className={`absolute -right-2 w-1 h-8 rounded-full blur-[2px] ${item.id === 'welcome' ? 'bg-neon-blue' : item.id === 'register' ? 'bg-neon-yellow' : 'bg-neon-green'}`}
              />
            )}
          </button>
        ))}
      </nav>
      
      <div className="mt-auto space-y-4">
        {currentUser ? (
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-white/40 hover:text-neon-yellow hover:bg-white/5 group border border-transparent hover:border-neon-yellow/20"
          >
            <LogOut size={20} className="group-hover:text-neon-yellow group-hover:scale-110 transition-transform" />
            <span className="hidden md:block text-[10px] font-black tracking-[0.2em] uppercase italic">Cerrar Sesión</span>
          </button>
        ) : (
          <button 
            onClick={() => setScreen('login')}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all bg-white/10 border border-white/20 text-white shadow-lg shadow-neon-blue/10"
          >
            <LogIn size={20} className="text-neon-blue" />
            <span className="hidden md:block text-[10px] font-black tracking-[0.2em] uppercase italic">Validación</span>
          </button>
        )}

        {isAdmin && currentScreen !== 'login' && (
          <button 
            onClick={() => setScreen('users')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
              currentScreen === 'users' ? 'bg-white/10 border border-white/20 font-black' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={20} className={currentScreen === 'users' ? 'text-neon-yellow' : 'group-hover:text-neon-yellow'} />
            <span className="hidden md:block text-[10px] font-black tracking-[0.2em] uppercase">Usuarios</span>
          </button>
        )}
        
        {currentUser && (
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mb-1 italic">Operador Activo</p>
              <p className={`text-sm font-black text-glow-yellow tracking-tighter ${currentUser.role === 'Administrador' ? 'text-neon-yellow' : 'text-neon-blue'}`}>
                {currentUser.username}
              </p>
              <p className="text-[8px] text-white/20 font-bold uppercase mt-1 tracking-widest">{currentUser.role}</p>
            </div>
            <div className={`absolute right-0 top-0 h-full w-1 ${currentUser.role === 'Administrador' ? 'bg-neon-yellow' : 'bg-neon-blue'} opacity-40`}></div>
          </div>
        )}
      </div>
    </aside>
  );
};


const WelcomeScreen = ({ stats, setScreen }: { stats: { products: number, sales: number, stock: number }, setScreen: (s: Screen) => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto space-y-12"
    >
      <header className="bg-black/40 backdrop-blur-md rounded-3xl p-12 border border-white/10 relative overflow-hidden glow-blue">
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">
            TIENDA <span className="text-neon-blue text-glow-blue underline decoration-neon-blue decoration-4 underline-offset-8 italic">NEON</span>
          </h1>
          <p className="text-white/60 max-w-lg text-xl font-medium leading-relaxed uppercase tracking-wide">
            Control de inventario y ventas con tecnología de <span className="text-neon-yellow">alto contraste</span>.
          </p>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-neon-blue/10 rounded-full blur-[100px]"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-neon-green/5 rounded-full blur-[100px]"></div>
      </header>

      <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Productos', value: stats.products, icon: PackagePlus, color: 'text-neon-blue border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.2)]', action: () => setScreen('register') },
          { label: 'Ventas', value: stats.sales, icon: ShoppingCart, color: 'text-neon-green border-neon-green shadow-[0_0_15px_rgba(57,255,20,0.2)]', action: () => setScreen('sales') },
          { label: 'Artículos', value: stats.stock, icon: Store, color: 'text-neon-yellow border-neon-yellow shadow-[0_0_15px_rgba(255,240,31,0.2)]', action: () => setScreen('register') },
        ].map((stat, i) => (
          <button 
            key={i} 
            onClick={stat.action}
            className="bg-white/5 p-8 rounded-[2rem] border border-white/10 flex flex-col gap-6 hover:bg-white/10 transition-all text-left group active:scale-95"
          >
            <div className={`w-14 h-14 rounded-xl border flex items-center justify-center shrink-0 ${stat.color.split(' ')[0]} ${stat.color.split(' ')[1]} transition-transform group-hover:scale-110`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
              <p className="text-4xl font-black text-white leading-none tracking-tighter">{stat.value}</p>
            </div>
          </button>
        ))}
      </div>

      <div id="main-menu" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button 
          onClick={() => setScreen('sales')}
          className="group relative p-12 bg-neon-green rounded-[3rem] text-black transition-all hover:scale-[1.02] active:scale-95 flex justify-between items-center overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-1 uppercase italic tracking-tighter">Nueva Venta</h3>
            <p className="text-black/60 font-bold uppercase text-xs tracking-widest">Abrir terminal POS</p>
          </div>
          <div className="relative z-10 bg-black/10 p-6 rounded-full group-hover:bg-black/20 transition-all">
            <ShoppingCart size={40} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        </button>

        <button 
          onClick={() => setScreen('register')}
          className="group relative p-12 bg-transparent border-4 border-neon-blue rounded-[3rem] text-neon-blue transition-all hover:bg-neon-blue/10 hover:shadow-[0_0_30px_rgba(0,243,255,0.3)] active:scale-95 flex justify-between items-center"
        >
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-1 uppercase italic tracking-tighter">Inventario</h3>
            <p className="text-neon-blue/60 font-bold uppercase text-xs tracking-widest">Gestión de productos</p>
          </div>
          <div className="relative z-10 bg-neon-blue/10 p-6 rounded-full group-hover:bg-neon-blue/20 transition-all">
            <PackagePlus size={40} />
          </div>
        </button>
      </div>
    </motion.div>
  );
};


const RegisterScreen = ({ addProduct, products }: { addProduct: (p: Omit<Product, 'id'>) => void, products: Product[] }) => {
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Abarrotes', stock: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock)
    });
    setFormData({ name: '', price: '', category: 'Abarrotes', stock: '' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-black text-white italic tracking-tighter text-glow-yellow underline decoration-neon-yellow decoration-4 underline-offset-8">Inventario</h2>
        <div className="flex gap-2">
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-neon-green bg-neon-green/10 border border-neon-green/30 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest glow-green"
            >
              <CheckCircle2 size={18} /> Sistema Actualizado
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <section className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 glow-yellow/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-neon-yellow flex items-center gap-2 uppercase tracking-widest text-xs italic">
                <Plus size={18} /> Alta de Producto
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase mb-2 block tracking-[0.3em]">Nombre del Producto</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-black border border-white/10 rounded-2xl focus:border-neon-yellow focus:ring-1 focus:ring-neon-yellow outline-none transition-all placeholder-white/20 text-white font-medium"
                  placeholder="Ej. Bebida Energética"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-white/30 uppercase mb-2 block tracking-[0.3em]">Precio</label>
                  <div className="relative">
                    <span className="absolute left-5 top-4 text-neon-yellow font-black">$</span>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full pl-10 pr-4 py-4 bg-black border border-white/10 rounded-2xl focus:border-neon-yellow outline-none transition-all text-white font-mono"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/30 uppercase mb-2 block tracking-[0.3em]">Stock</label>
                  <input 
                    required
                    type="number" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-5 py-4 bg-black border border-white/10 rounded-2xl focus:border-neon-yellow outline-none transition-all text-white font-mono text-center"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase mb-2 block tracking-[0.3em]">Categoría</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-6 py-4 bg-black border border-white/10 rounded-2xl focus:border-neon-yellow outline-none transition-all text-white font-bold appearance-none cursor-pointer"
                >
                  <option>Abarrotes</option>
                  <option>Lácteos y Huevos</option>
                  <option>Bebidas</option>
                  <option>Limpieza</option>
                  <option>Enlatados</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-neon-yellow text-black rounded-2xl font-black uppercase tracking-widest hover:bg-[#fff74d] transition-all shadow-xl shadow-neon-yellow/20 flex items-center justify-center gap-2 mt-6 active:scale-95"
              >
                <Save size={20} /> Guardar Registro
              </button>
            </form>
          </section>
        </div>

        <div className="lg:col-span-3">
          <section className="bg-black/40 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="font-black text-white text-xs uppercase tracking-[0.3em] italic flex items-center gap-3">
                <Store size={20} className="text-neon-blue" /> Artículos en Base
              </h3>
              <span className="text-[10px] font-black text-neon-blue bg-neon-blue/10 px-3 py-1 rounded-full border border-neon-blue/20 uppercase tracking-[0.2em]">
                {products.length} Registros
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 sticky top-0 text-white/30 font-black uppercase text-[10px] tracking-[0.3em] border-b border-white/5">
                  <tr>
                    <th className="px-8 py-5">Producto</th>
                    <th className="px-8 py-5 text-center">Categoría</th>
                    <th className="px-8 py-5 text-center">Stock</th>
                    <th className="px-8 py-5 text-right">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6 font-bold text-white tracking-wide">{p.name}</td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-[10px] border border-white/10 text-white/60 px-3 py-1 rounded-full font-bold uppercase tracking-widest">{p.category}</span>
                      </td>
                      <td className={`px-8 py-6 text-center font-mono font-bold ${p.stock < 10 ? 'text-neon-yellow' : 'text-white/40'}`}>{p.stock}</td>
                      <td className="px-8 py-6 text-right font-black text-neon-green font-mono">${p.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

const SalesScreen = ({ products, onFinishSale }: { products: Product[], onFinishSale: (cartItems: SaleItem[]) => void }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const categories = ['Todas', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchesSearch && matchesCategory && p.stock > 0;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('Stock máximo alcanzado');
          return prev;
        }
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-8"
    >
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-transparent border-4 border-neon-green rounded-3xl flex items-center justify-center font-black text-2xl text-neon-green glow-green italic">$</div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Terminal Venta</h2>
            <p className="text-neon-green/60 text-xs font-black uppercase tracking-[0.4em] glow-green">Sistema Activo</p>
          </div>
        </div>
        <div className="bg-black border border-neon-green/30 text-neon-green px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3">
           <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse shadow-[0_0_10px_#39FF14]" /> Operando
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-10 min-h-0">
        <div className="lg:col-span-3 flex flex-col gap-8 min-h-0">
          <div className="flex flex-col gap-6">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neon-blue" size={24} />
              <input 
                type="text" 
                placeholder="ESCANEAR O BUSCAR PRODUCTO..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-6 bg-black border border-white/10 rounded-[2rem] focus:border-neon-blue outline-none transition-all placeholder-white/20 text-white font-black tracking-widest text-lg"
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border shrink-0 ${
                    selectedCategory === cat 
                      ? 'bg-neon-blue text-black border-neon-blue' 
                      : 'bg-transparent text-white/40 border-white/10 hover:border-neon-blue hover:text-neon-blue'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-4 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-max custom-scrollbar">
            {filteredProducts.map(p => (
              <button 
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all active:scale-95 group flex flex-col justify-between relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className="text-[9px] bg-white/5 text-white/40 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-white/5">{p.category}</span>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full bg-black/40 border ${p.stock < 10 ? 'text-neon-yellow border-neon-yellow/30' : 'text-neon-blue border-neon-blue/20'}`}>
                    STOCK: {p.stock}
                  </span>
                </div>
                <h4 className="text-xl font-black text-white mb-2 group-hover:text-neon-blue transition-colors leading-tight uppercase relative z-10">{p.name}</h4>
                <div className="flex justify-between items-end mt-4 relative z-10">
                   <p className="text-3xl font-black text-white italic tracking-tighter font-mono">${p.price.toFixed(2)}</p>
                   <div className="bg-transparent border-2 border-white/10 text-white p-3 rounded-2xl group-hover:border-neon-blue group-hover:text-neon-blue transition-all">
                    <Plus size={24} />
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-8 bg-neon-blue/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#0d0d0d] rounded-[3rem] flex flex-col overflow-hidden border border-white/10 glow-green/5">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-4">
              <ShoppingCart className="text-neon-green" size={24} />
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Orden</h3>
            </div>
            <span className="text-[10px] font-black text-white/40 border border-white/10 px-3 py-1 rounded-full uppercase tracking-widest">{cart.length} ITEMS</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/20 text-center space-y-6 py-20 uppercase tracking-[0.3em]">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                  <ShoppingCart size={40} />
                </div>
                <p className="text-[10px] font-black leading-loose">Esperando<br/>Selección</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-white/5 p-5 rounded-[1.5rem] flex justify-between items-center group relative border border-white/5">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-neon-green font-black border border-neon-green/30 shadow-[0_0_10px_rgba(57,255,20,0.1)]">
                      {item.quantity}
                    </div>
                    <div>
                      <h5 className="text-white font-black text-sm uppercase mb-1 tracking-tight">{item.name}</h5>
                      <p className="text-[10px] text-white/30 font-black tracking-widest uppercase">${item.price.toFixed(2)} UNIT</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="font-black text-white font-mono text-lg">${(item.quantity * item.price).toFixed(2)}</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-white/20 hover:text-neon-yellow transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-8 bg-black border-t border-white/10 space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-white/30 uppercase text-[10px] tracking-[0.4em] font-black mb-1">Total Liquidación</span>
                <span className="text-5xl font-black text-white tracking-tighter text-glow-green">${total.toFixed(2)}</span>
              </div>
              <div className="w-14 h-14 bg-neon-green/10 rounded-2xl flex items-center justify-center text-neon-green shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                <CheckCircle2 size={32} />
              </div>
            </div>
            <button 
              disabled={cart.length === 0}
              onClick={() => {
                onFinishSale(cart);
                setCart([]);
              }}
              className="w-full py-6 bg-neon-green disabled:bg-white/5 disabled:text-white/10 text-black rounded-[2rem] font-black text-xl uppercase tracking-widest hover:bg-[#43ff1f] transition-all flex items-center justify-center gap-4 active:scale-95 shadow-[0_10px_30px_rgba(57,255,20,0.3)]"
            >
              CERRAR TRANSACCIÓN
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


const UsersScreen = ({ users, onAddUser, onDeleteUser }: { users: User[], onAddUser: (u: Omit<User, 'id'>) => void, onDeleteUser: (id: string) => void }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'Usuario (Cliente)' as User['role'] });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser(formData);
    setFormData({ username: '', email: '', password: '', role: 'Usuario (Cliente)' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-black text-white italic tracking-tighter text-glow-blue underline decoration-neon-blue decoration-4 underline-offset-8">Gestión de Usuarios</h2>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-neon-green bg-neon-green/10 border border-neon-green/30 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest glow-green"
          >
            <CheckCircle2 size={18} /> Usuario Registrado
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <section className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 glow-blue/10">
            <h3 className="font-black text-neon-blue flex items-center gap-2 uppercase tracking-widest text-xs italic mb-8">
              <UserPlus size={18} /> Nuevo Usuario
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase mb-2 block tracking-[0.3em]">Nombre de Usuario</label>
                <input 
                  required
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-6 py-4 bg-black border border-white/10 rounded-2xl focus:border-neon-blue outline-none transition-all placeholder-white/20 text-white"
                  placeholder="Ej. juan_ventas"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase mb-2 block tracking-[0.3em]">Email</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-6 py-4 bg-black border border-white/10 rounded-2xl focus:border-neon-blue outline-none transition-all placeholder-white/20 text-white"
                  placeholder="juan@tienda.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase mb-2 block tracking-[0.3em]">Contraseña</label>
                <input 
                  required
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-6 py-4 bg-black border border-white/10 rounded-2xl focus:border-neon-blue outline-none transition-all placeholder-white/20 text-white"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase mb-2 block tracking-[0.3em]">Tipo de Usuario</label>
                <div className="relative">
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as User['role'] })}
                    className="w-full px-6 py-4 bg-black border border-white/10 rounded-2xl focus:border-neon-blue outline-none transition-all text-white font-bold appearance-none cursor-pointer"
                  >
                    <option value="Usuario (Cliente)">Usuario (Cliente)</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-neon-blue rotate-90 pointer-events-none" size={18} />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-neon-blue text-black rounded-2xl font-black uppercase tracking-widest hover:bg-[#4deaff] transition-all shadow-xl shadow-neon-blue/20 flex items-center justify-center gap-2 mt-6 active:scale-95"
              >
                <Save size={20} /> Crear Usuario
              </button>
            </form>
          </section>
        </div>

        <div className="lg:col-span-3">
          <section className="bg-black/40 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="font-black text-white text-xs uppercase tracking-[0.3em] italic flex items-center gap-3">
                <Users size={20} className="text-neon-yellow" /> Panel de Control de Usuarios
              </h3>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 sticky top-0 text-white/30 font-black uppercase text-[10px] tracking-[0.3em] border-b border-white/5">
                  <tr>
                    <th className="px-8 py-5">Usuario</th>
                    <th className="px-8 py-5">Email</th>
                    <th className="px-8 py-5 text-center">Rol</th>
                    <th className="px-8 py-5 text-right w-20">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${user.role === 'Administrador' ? 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30' : 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'}`}>
                            {user.username[0].toUpperCase()}
                          </div>
                          <span className="font-bold text-white tracking-wide">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-white/40 font-medium">{user.email}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`text-[9px] border px-3 py-1 rounded-full font-black uppercase tracking-widest ${user.role === 'Administrador' ? 'border-neon-yellow/40 text-neon-yellow' : 'border-white/10 text-white/60'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => onDeleteUser(user.id)}
                          className="p-2 text-white/20 hover:text-neon-yellow transition-colors hover:bg-white/5 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};


const LoginScreen = ({ users, onLogin, logoutMessage }: { users: User[], onLogin: (user: User) => void, logoutMessage?: string }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    if (user) {
      setSuccess('se a iniciado sesión de manera correcta');
      setError('');
      setTimeout(() => {
        onLogin(user);
      }, 1500);
    } else {
      setError('No se puede realizar su validación');
      setSuccess('');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 glow-blue/20">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-transparent border-4 border-neon-blue rounded-[2rem] flex items-center justify-center text-neon-blue mb-6 glow-blue">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Iniciar Sesión</h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mt-2">Acceso al Sistema Neon</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-white/30 uppercase mb-2 block tracking-[0.3em]">Email Corporativo</label>
            <div className="relative">
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-6 py-4 bg-black border border-white/10 rounded-2xl focus:border-neon-blue outline-none transition-all text-white font-medium"
                placeholder="usuario@cetis7.edu.mx"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-white/30 uppercase mb-2 block tracking-[0.3em]">Contraseña</label>
            <input 
              required
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-6 py-4 bg-black border border-white/10 rounded-2xl focus:border-neon-blue outline-none transition-all text-white font-medium"
              placeholder="••••••••"
            />
          </div>

          <AnimatePresence>
            {logoutMessage && !error && !success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-neon-blue/10 border border-neon-blue/30 p-4 rounded-xl text-neon-blue text-[10px] font-black uppercase text-center tracking-widest glow-blue mb-4"
              >
                {logoutMessage}
              </motion.div>
            )}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-neon-yellow/10 border border-neon-yellow/30 p-4 rounded-xl text-neon-yellow text-[10px] font-black uppercase text-center tracking-widest"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-neon-green/10 border border-neon-green/30 p-4 rounded-xl text-neon-green text-[10px] font-black uppercase text-center tracking-widest glow-green"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={!!success}
            className="w-full py-5 bg-neon-blue text-black rounded-2xl font-black uppercase tracking-widest hover:bg-[#4deaff] transition-all shadow-xl shadow-neon-blue/20 flex items-center justify-center gap-3 mt-4 active:scale-95 disabled:opacity-50"
          >
            <LogIn size={20} /> Validar Acceso
          </button>
        </form>
      </div>
    </motion.div>
  );
};


// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'Admin #04', email: 'admin@cetis7.edu.mx', password: 'admin123', role: 'Administrador' },
    { id: '2', username: 'Ventas_Junior', email: 'ventas@cetis7.edu.mx', password: 'ventas123', role: 'Usuario (Cliente)' },
  ]);
  const [currentUser, setCurrentUser] = useState<User | null>(users[0]);
  const [logoutMsg, setLogoutMsg] = useState('');
  
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setLogoutMsg('');
    setScreen('welcome');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLogoutMsg('se ha cerrado la  sesión correctamente');
    setScreen('login');
    setTimeout(() => setLogoutMsg(''), 4000);
  };

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Leche Entera 1L', price: 24.50, category: 'Lácteos y Huevos', stock: 50 },
    { id: '2', name: 'Huevo 12 pzas', price: 42.00, category: 'Abarrotes', stock: 20 },
    { id: '3', name: 'Refresco Cola 600ml', price: 18.00, category: 'Bebidas', stock: 15 },
    { id: '4', name: 'Pan de Caja', price: 45.50, category: 'Abarrotes', stock: 8 },
    { id: '5', name: 'Jabón de Trastes', price: 32.00, category: 'Limpieza', stock: 12 },
  ]);
  const [salesCount, setSalesCount] = useState(0);

  const addProduct = (newProduct: Omit<Product, 'id'>) => {
    setProducts(prev => [
      { ...newProduct, id: Math.random().toString(36).substr(2, 9) },
      ...prev
    ]);
  };

  const handleAddUser = (newUser: Omit<User, 'id'>) => {
    setUsers(prev => [
      ...prev,
      { ...newUser, id: Math.random().toString(36).substr(2, 9) }
    ]);
  };

  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) {
      alert("No puedes eliminar al último administrador");
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleFinishSale = (cartItems: SaleItem[]) => {
    setSalesCount(prev => prev + 1);
    setProducts(prevProducts => {
      return prevProducts.map(product => {
        const cartItem = cartItems.find(item => item.id === product.id);
        if (cartItem) {
          return { ...product, stock: Math.max(0, product.stock - cartItem.quantity) };
        }
        return product;
      });
    });
    alert('¡Venta realizada con éxito!');
    setScreen('welcome');
  };

  const stats = {
    products: products.length,
    sales: salesCount,
    stock: products.reduce((acc, p) => acc + p.stock, 0)
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white flex selection:bg-neon-blue selection:text-black">
      <Sidebar currentScreen={screen} setScreen={setScreen} currentUser={currentUser} onLogout={handleLogout} />
      
      <main className="flex-1 ml-20 md:ml-64 p-6 md:p-10 lg:p-12 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          {screen === 'welcome' && (
            <div key="welcome">
              <WelcomeScreen stats={stats} setScreen={setScreen} />
            </div>
          )}
          {screen === 'register' && (
            <div key="register">
              <RegisterScreen products={products} addProduct={addProduct} />
            </div>
          )}
          {screen === 'sales' && (
            <div key="sales">
              <SalesScreen products={products} onFinishSale={handleFinishSale} />
            </div>
          )}
          {screen === 'users' && (
            <div key="users">
              <UsersScreen users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />
            </div>
          )}
          {screen === 'login' && (
            <div key="login">
              <LoginScreen users={users} onLogin={handleLogin} logoutMessage={logoutMsg} />
            </div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Background Neon Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-green/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}
