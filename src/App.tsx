import React, { useState, useEffect } from 'react';
import { 
  Store, 
  ArrowLeft, 
  UserPlus, 
  Save, 
  LogIn, 
  Chrome, 
  Sliders, 
  ShieldCheck, 
  X, 
  Check, 
  Moon, 
  Sun,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import local modular layers
import { Sidebar } from './components/Sidebar';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Category, Product, User, Pedido, DetallePedido, InventarioItem, VentaItem, Screen, AppTheme } from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_USERS, 
  INITIAL_PEDIDOS, 
  INITIAL_DETALLES, 
  INITIAL_INVENTARIO, 
  INITIAL_VENTAS 
} from './utils';

// --- AuthFlow Component (Preserved initial validation/signup experience) ---
interface AuthFlowProps {
  users: User[];
  onLogin: (user: User) => void;
  onSignup: (u: any) => void;
  logoutMessage?: string;
}

const AuthFlow = ({ users, onLogin, onSignup, logoutMessage }: AuthFlowProps) => {
  const [mode, setMode] = useState<'choice' | 'login' | 'signup'>('choice');
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'Cliente' as User['role'], phone: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showGoogleSim, setShowGoogleSim] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('u070228@cetis7.edu.mx');
  const [googleNameInput, setGoogleNameInput] = useState('Cliente Google');
  const [isGoogleSignupTab, setIsGoogleSignupTab] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    if (user) {
      if (user.status === 'pending') {
        setError('Acceso denegado: Su solicitud está pendiente de aprobación por el Administrador Principal.');
        setSuccess('');
        setTimeout(() => setError(''), 5000);
        return;
      }
      if (user.status === 'denied') {
        setError('Acceso denegado: Su solicitud fue rechazada por el Administrador Principal.');
        setSuccess('');
        setTimeout(() => setError(''), 5000);
        return;
      }
      setSuccess('Se ha iniciado sesión de manera correcta');
      setError('');
      setTimeout(() => onLogin(user), 1500);
    } else {
      setError('No se puede realizar su validación. Credenciales incorrectas.');
      setSuccess('');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isSpecialRequest = formData.role === 'Administrador' || formData.role === 'Empleado';
    
    if (isSpecialRequest) {
      setSuccess('Solicitud enviada. El administrador principal validará su cuenta.');
    } else {
      setSuccess('Cuenta creada de manera exitosa');
    }
    setTimeout(() => onSignup(formData), 2000);
  };

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim() || !googleEmailInput.includes('@')) {
      setGoogleError('Por favor, ingresa un correo de Google válido.');
      return;
    }

    if (isGoogleSignupTab) {
      if (formData.role !== 'Cliente') {
        setGoogleError('Registro con Google denegado: El tipo de operador seleccionado requiere aprobación del Administrador Principal.');
        return;
      }
      const existingUser = users.find(u => u.email.toLowerCase() === googleEmailInput.toLowerCase().trim());
      if (existingUser) {
        setGoogleError('Esta cuenta ya existe. Por favor, inicia sesión.');
        return;
      }
      setSuccess('Cuenta de Google creada e inicio de sesión exitoso');
      setGoogleError('');
      setShowGoogleSim(false);
      setTimeout(() => {
        onSignup({
          username: googleNameInput.trim() || 'Cliente Google',
          email: googleEmailInput.toLowerCase().trim(),
          password: 'googleAuthPassword',
          role: 'Cliente',
          phone: '55-0000-0000',
          address: 'Dirección Google Registrada'
        });
      }, 1500);
    } else {
      const found = users.find(u => u.email.toLowerCase() === googleEmailInput.toLowerCase().trim());
      if (found) {
        if (found.role !== 'Cliente') {
          setGoogleError('El operador seleccionado requiere validación con credenciales manuales.');
          return;
        }
        setSuccess('Ingreso con Google validado con éxito');
        setGoogleError('');
        setShowGoogleSim(false);
        setTimeout(() => onLogin(found), 1500);
      } else {
        setGoogleError('No se encontró registro para este email. Regístrate antes.');
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-black/60 border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden text-left shadow-2xl">
      <AnimatePresence mode="wait">
        {mode === 'choice' ? (
          <motion.div key="choice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 py-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/5 border-2 border-neon-blue rounded-3xl flex items-center justify-center text-neon-blue mx-auto mb-6 glow-blue">
                <Store size={32} />
              </div>
              <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">BIENVENIDO</h3>
              <p className="text-[10px] text-white/30 uppercase mt-1.5 tracking-[0.3em] font-black italic">Portal de Control de Validación</p>
            </div>

            {logoutMessage && (
              <div className="bg-neon-blue/10 border border-neon-blue/20 p-4 rounded-2xl text-[10px] text-neon-blue font-bold text-center uppercase tracking-widest leading-loose animate-pulse">
                ℹ️ {logoutMessage}
              </div>
            )}

            <div className="space-y-4">
              <button onClick={() => setMode('login')} className="w-full py-4.5 bg-neon-blue text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-[#4deaff] active:scale-95 transition-all text-center">
                Iniciar Sesión
              </button>
              <button onClick={() => setMode('signup')} className="w-full py-4.5 bg-transparent border border-white/10 text-white hover:border-white/30 font-black uppercase text-xs tracking-widest rounded-2xl active:scale-95 transition-all text-center">
                Registrar Cuenta
              </button>
            </div>
          </motion.div>
        ) : mode === 'login' ? (
          <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }} className="space-y-6">
            <button onClick={() => setMode('choice')} className="mb-4 flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest">
              ← REGRESAR
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-black text-white uppercase italic">Ingresar Credenciales</h3>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[8px] font-black text-white/40 block mb-1 uppercase tracking-widest">Email Comercial *</label>
                <input required type="email" placeholder="admin@cetis7.edu.mx" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3.5 bg-black border border-white/10 rounded-xl text-white font-bold placeholder-white/10 text-xs focus:border-neon-blue outline-none" />
              </div>
              <div>
                <label className="text-[8px] font-black text-white/40 block mb-1 uppercase tracking-widest">Contraseña *</label>
                <input required type="password" placeholder="admin123" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3.5 bg-black border border-white/10 rounded-xl text-white font-bold placeholder-white/10 text-xs focus:border-neon-blue outline-none" />
              </div>

              {error && <div className="text-red-400 text-[10px] font-black uppercase text-center py-2 bg-red-950/10 border border-red-900/30 rounded-xl">{error}</div>}
              {success && <div className="text-neon-green text-[10px] font-black uppercase text-center py-2 bg-neon-green/10 border border-neon-green/30 rounded-xl animate-pulse">{success}</div>}

              <button type="submit" className="w-full py-4.5 bg-neon-blue text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-[#4deaff]">
                Acceder al Sistema
              </button>

              <button type="button" onClick={() => { setIsGoogleSignupTab(false); setShowGoogleSim(true); }} className="w-full py-4 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
                <Chrome size={14} className="text-[#4285F4]" /> Continuar con Google
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="signup" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 25 }} className="space-y-5">
            <button onClick={() => setMode('choice')} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest mb-4">
              ← REGRESAR
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-black text-white uppercase italic">Registrar Operador</h3>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-black text-white/30 uppercase block mb-1">Usuario *</label>
                  <input required type="text" placeholder="juan_perez" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-white rounded text-xs" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-white/30 uppercase block mb-1">Email *</label>
                  <input required type="email" placeholder="juan@correo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-white rounded text-xs" />
                </div>
              </div>

              <div>
                <label className="text-[8px] font-black text-white/30 uppercase block mb-1">Contraseña de Registro *</label>
                <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 bg-black border border-white/10 text-white rounded text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-black text-white/30 block mb-1">Teléfono</label>
                  <input type="tel" placeholder="55-1234" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-white rounded text-xs" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-white/30 block mb-1">Dirección</label>
                  <input type="text" placeholder="Av. Hidalgo" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-white rounded text-xs" />
                </div>
              </div>

              <div>
                <label className="text-[8px] font-black text-white/40 block mb-2 text-center uppercase tracking-widest font-black">Tipo de Cuenta</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Administrador', 'Cliente', 'Empleado'] as User['role'][]).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({...formData, role})}
                      className={`p-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                        formData.role === role
                          ? 'bg-neon-yellow text-black border-neon-yellow'
                          : 'bg-transparent text-white/30 border-white/5'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="text-red-400 text-[10px] uppercase text-center py-2 bg-red-950/10 border border-red-900/30 rounded-xl">{error}</div>}
              {success && <div className="text-neon-green text-[10px] uppercase text-center py-2 bg-neon-green/10 border border-neon-green/30 rounded-xl animate-bounce">{success}</div>}

              <button type="submit" className="w-full py-4.5 bg-neon-yellow text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-[#fff64c]">
                Registrar Solicitud
              </button>

              <button type="button" onClick={() => { setFormData({...formData, role: 'Cliente'}); setIsGoogleSignupTab(true); setShowGoogleSim(true); }} className="w-full py-4 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
                <Chrome size={14} className="text-[#4285F4]" /> Registrarse con Google (Cliente)
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded Google Sign-in dialog modal */}
      {showGoogleSim && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1c1c1e] p-8 rounded-3xl border border-white/10 max-w-sm w-full space-y-6 text-left relative">
            <button onClick={() => setShowGoogleSim(false)} className="absolute top-5 right-5 text-white/40 hover:text-white">
              <X size={20} />
            </button>
            <div className="text-center">
              <Chrome size={40} className="text-[#4285F4] mx-auto mb-2" />
              <h4 className="text-white font-black text-lg uppercase tracking-tight">Iniciar Sesión con Google</h4>
              <p className="text-[9px] text-white/40 uppercase tracking-widest">Simulación Segura de Auth</p>
            </div>

            <form onSubmit={handleGoogleSubmit} className="space-y-4">
              <div>
                <label className="text-[8px] font-black block mb-1 text-white/50 uppercase">Correo de Google (GMail)</label>
                <input required type="email" value={googleEmailInput} onChange={e => setGoogleEmailInput(e.target.value)} className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white font-mono text-xs" />
              </div>
              {isGoogleSignupTab && (
                <div>
                  <label className="text-[8px] font-black block mb-1 text-white/50 uppercase">Nombre Completo</label>
                  <input required type="text" value={googleNameInput} onChange={e => setGoogleNameInput(e.target.value)} className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white font-bold text-xs" />
                </div>
              )}

              {googleError && <p className="text-red-400 text-[10px] text-center uppercase tracking-widest font-black leading-relaxed">{googleError}</p>}
              
              <button type="submit" className="w-full py-3 bg-[#4285F4] hover:bg-[#5b95f5] text-white text-xs font-black uppercase rounded-xl tracking-widest">
                {isGoogleSignupTab ? 'CREAR CUENTA GOOGLE' : 'AUTENTICAR ENLACE'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};


// --- MAIN CONTEXT COINCIDENCE ---
export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [theme, setTheme] = useState<AppTheme>('cyber'); // default to black/cyber style

  // 1. Categorias
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('groceries_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // 2. Productos
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('groceries_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // 3. Usuarios/Socios
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('taqueria_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // 4. Pedidos
  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    const saved = localStorage.getItem('groceries_pedidos');
    return saved ? JSON.parse(saved) : INITIAL_PEDIDOS;
  });

  // 5. Detalle Pedidos
  const [detallePedidos, setDetallePedidos] = useState<DetallePedido[]>(() => {
    const saved = localStorage.getItem('groceries_detalle');
    return saved ? JSON.parse(saved) : INITIAL_DETALLES;
  });

  // 6. Almacén / Inventario
  const [inventario, setInventario] = useState<InventarioItem[]>(() => {
    const saved = localStorage.getItem('groceries_inventario');
    return saved ? JSON.parse(saved) : INITIAL_INVENTARIO;
  });

  // 7. Ventas
  const [ventas, setVentas] = useState<VentaItem[]>(() => {
    const saved = localStorage.getItem('groceries_ventas');
    return saved ? JSON.parse(saved) : INITIAL_VENTAS;
  });

  // Authentication Context state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [logoutMsg, setLogoutMsg] = useState('');

  const isAdmin = currentUser?.role === 'Administrador';
  const isMainAdmin = currentUser?.id === '1';

  // Save states modifications in localStorage
  useEffect(() => {
    localStorage.setItem('groceries_categories', JSON.stringify(categories));
    localStorage.setItem('groceries_products', JSON.stringify(products));
    localStorage.setItem('taqueria_users', JSON.stringify(users));
    localStorage.setItem('groceries_pedidos', JSON.stringify(pedidos));
    localStorage.setItem('groceries_detalle', JSON.stringify(detallePedidos));
    localStorage.setItem('groceries_inventario', JSON.stringify(inventario));
    localStorage.setItem('groceries_ventas', JSON.stringify(ventas));
  }, [categories, products, users, pedidos, detallePedidos, inventario, ventas]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setLogoutMsg('');
    setScreen('welcome');
  };

  const handleRegister = (newUser: any) => {
    const isRestrictedRole = newUser.role === 'Administrador' || newUser.role === 'Empleado';
    const userWithId: User = { 
      ...newUser, 
      id: Math.random().toString(36).substr(2, 9),
      id_usuario: Math.random().toString(36).substr(2, 9),
      nombre: newUser.username,
      correo: newUser.email,
      telefono: newUser.phone || 'N/A',
      direccion: newUser.address || 'N/A',
      tipo_usuario: newUser.role.toLowerCase() as any,
      status: isRestrictedRole ? 'pending' as const : 'approved' as const
    };
    
    setUsers(prev => [...prev, userWithId]);
    if (!isRestrictedRole) {
      setCurrentUser(userWithId);
      setScreen('welcome');
    } else {
      setLogoutMsg('Solicitud de Operador enviada. El Administrador Principal autorizará su cuenta.');
      setScreen('landing');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLogoutMsg('Sesión cerrada correctamente. Vuelve pronto.');
    setScreen('landing');
    setTimeout(() => setLogoutMsg(''), 4000);
  };

  // Profile update
  const handleUpdateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { 
      ...currentUser, 
      ...updatedData,
      username: updatedData.nombre || currentUser.username,
      nombre: updatedData.nombre || currentUser.nombre || '',
      phone: updatedData.telefono || currentUser.phone,
      telefono: updatedData.telefono || currentUser.telefono || '',
      address: updatedData.direccion || currentUser.address,
      direccion: updatedData.direccion || currentUser.direccion || ''
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  // Client order checkout triggers
  const handlePlaceOrder = (
    cartItems: { product: Product; quantity: number }[],
    paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia',
    couponCode?: string
  ) => {
    if (!currentUser) return;
    const orderId = `PED-${Math.floor(100 + Math.random() * 900)}`;
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.precio * item.quantity), 0);
    
    let discount = 0;
    if (couponCode === 'BARATO15') discount = subtotal * 0.15;
    else if (couponCode === 'CETIS7') discount = Math.min(15, subtotal);
    
    const total = Math.max(0, subtotal - discount);

    // 1. Appends Pedido
    const newOrder: Pedido = {
      id_pedido: orderId,
      id_usuario: currentUser.id,
      nombre_usuario: currentUser.username,
      fecha_pedido: new Date().toISOString().split('T')[0],
      estado_pedido: 'pendiente',
      metodo_pago: paymentMethod,
      total: total
    };

    // 2. Appends Details
    const newDetails: DetallePedido[] = cartItems.map((item, idx) => ({
      id_detalle: `DET-${Date.now()}-${idx}`,
      id_pedido: orderId,
      id_producto: item.product.id_producto,
      nombre_producto: item.product.nombre_producto,
      cantidad: item.quantity,
      precio_unitario: item.product.precio,
      subtotal: item.quantity * item.product.precio
    }));

    // 3. Appends Venta record
    const newVenta: VentaItem = {
      id_venta: `VTA-${Math.floor(100 + Math.random() * 900)}`,
      id_pedido: orderId,
      fecha: new Date().toISOString().split('T')[0],
      total: total
    };

    // 4. Update Product & Inventario Stocks elements
    setProducts(prevProducts => prevProducts.map(p => {
      const cartMatch = cartItems.find(c => c.product.id_producto === p.id_producto);
      if (cartMatch) {
         const newStock = Math.max(0, p.stock - cartMatch.quantity);
         return { ...p, stock: newStock, disponible: newStock > 0 };
      }
      return p;
    }));

    setInventario(prevInv => prevInv.map(inv => {
      const cartMatch = cartItems.find(c => c.product.id_producto === inv.id_producto);
      if (cartMatch) {
         const newStock = Math.max(0, inv.cantidad_actual - cartMatch.quantity);
         return { 
           ...inv, 
           cantidad_actual: newStock, 
           fecha_actualizacion: new Date().toISOString().split('T')[0] 
         };
      }
      return inv;
    }));

    setPedidos(prev => [newOrder, ...prev]);
    setDetallePedidos(prev => [...prev, ...newDetails]);
    setVentas(prev => [newVenta, ...prev]);
    
    alert(`🛒 ¡Pedido ${orderId} registrado con éxito por $${total.toFixed(2)} usando pago: ${paymentMethod}!`);
  };

  // Admin stocks updates
  const handleUpdateProductStock = (prodId: string, qty: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id_producto === prodId) {
        const newStock = Math.max(0, p.stock + qty);
        return { ...p, stock: newStock, disponible: newStock > 0 };
      }
      return p;
    }));

    setInventario(prev => prev.map(inv => {
      if (inv.id_producto === prodId) {
        const newStock = Math.max(0, inv.cantidad_actual + qty);
        return { 
          ...inv, 
          cantidad_actual: newStock, 
          fecha_actualizacion: new Date().toISOString().split('T')[0] 
        };
      }
      return inv;
    }));
  };

  // Orders Despachar controller update states
  const handleUpdateOrderStatus = (orderId: string, status: Pedido['estado_pedido']) => {
    setPedidos(prev => prev.map(o => o.id_pedido === orderId ? { ...o, estado_pedido: status } : o));
    
    // If order was cancelled manually, reset stock levels!
    if (status === 'cancelado') {
      const activeDetails = detallePedidos.filter(d => d.id_pedido === orderId);
      activeDetails.forEach(det => {
        handleUpdateProductStock(det.id_producto, det.cantidad);
      });
      alert(`⚠️ El pedido ${orderId} fue CANCELADO. Las existencias correspondientes regresaron al inventario.`);
    } else {
      alert(`🔔 Estado de Pedido ${orderId} actualizado a: ${status.toUpperCase()}`);
    }
  };

  // Approvals & Personal
  const handleUpdateUserStatus = (userId: string, status: User['status']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === '1') return; // protect master admin login
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // raw CRUD DB add/delete delegates
  const handleAddRelationRow = (tableName: string, data: any) => {
    if (tableName === 'categorias') {
      setCategories(prev => [...prev, data]);
    } else if (tableName === 'productos') {
      const fullProd: Product = {
        ...data,
        id: data.id_producto,
        name: data.nombre_producto,
        price: data.precio,
        category: categories.find(c => c.id_categoria === data.id_categoria)?.nombre_categoria || 'Varios'
      };
      setProducts(prev => [fullProd, ...prev]);

      // auto inventory row link
      const newInvRow: InventarioItem = {
        id_inventario: `INV-${Math.floor(100 + Math.random() * 900)}`,
        id_producto: data.id_producto,
        nombre_producto: data.nombre_producto,
        cantidad_actual: data.stock,
        stock_minimo: 10,
        proveedor: 'Distribuidora Central',
        fecha_actualizacion: new Date().toISOString().split('T')[0]
      };
      setInventario(prev => [...prev, newInvRow]);
    } else if (tableName === 'usuarios') {
      const parsedUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        id_usuario: Math.random().toString(36).substr(2, 9),
        username: data.username,
        nombre: data.username,
        email: data.email,
        correo: data.email,
        password: data.password || 'password123',
        role: data.role || 'Cliente',
        tipo_usuario: (data.role || 'Cliente').toLowerCase() as any,
        phone: data.phone || 'N/A',
        telefono: data.phone || 'N/A',
        address: data.address || 'N/A',
        direccion: data.address || 'N/A',
        status: 'approved'
      };
      setUsers(prev => [...prev, parsedUser]);
    } else if (tableName === 'pedidos') {
      setPedidos(prev => [data, ...prev]);
    } else if (tableName === 'detalle') {
      const parsedDet: DetallePedido = {
        id_detalle: `D-${Math.floor(100 + Math.random() * 900)}`,
        ...data
      };
      setDetallePedidos(prev => [...prev, parsedDet]);
    } else if (tableName === 'inventarios') {
      const parsedInv: InventarioItem = {
        id_inventario: `INV-${Math.floor(100 + Math.random() * 900)}`,
        ...data
      };
      setInventario(prev => [...prev, parsedInv]);
    } else if (tableName === 'ventas') {
      const parsedVta: VentaItem = {
        id_venta: `VTA-${Math.floor(100 + Math.random() * 900)}`,
        ...data
      };
      setVentas(prev => [parsedVta, ...prev]);
    }
  };

  const handleDeleteRelationRow = (tableName: string, entityId: string) => {
    if (tableName === 'categorias') {
      setCategories(prev => prev.filter(c => c.id_categoria !== entityId));
    } else if (tableName === 'productos') {
      setProducts(prev => prev.filter(p => p.id_producto !== entityId));
      setInventario(prev => prev.filter(inv => inv.id_producto !== entityId));
    } else if (tableName === 'usuarios') {
      setUsers(prev => prev.filter(u => u.id !== entityId));
    } else if (tableName === 'pedidos') {
      setPedidos(prev => prev.filter(o => o.id_pedido !== entityId));
      setDetallePedidos(prev => prev.filter(d => d.id_pedido !== entityId));
    } else if (tableName === 'detalle') {
      setDetallePedidos(prev => prev.filter(d => d.id_detalle !== entityId));
    } else if (tableName === 'inventarios') {
      setInventario(prev => prev.filter(inv => inv.id_inventario !== entityId));
    } else if (tableName === 'ventas') {
      setVentas(prev => prev.filter(v => v.id_venta !== entityId));
    }
  };

  return (
    <div className={`min-h-screen font-sans flex selection:bg-neon-blue selection:text-black transition-colors duration-500 ${
      theme === 'market' ? 'bg-[#faf8f4] text-neutral-800' : 'bg-[#050505] text-white'
    }`}>
      
      {/* 1. Sidebar Navigation */}
      {currentUser && (
        <Sidebar 
          currentScreen={screen} 
          setScreen={setScreen} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
        />
      )}

      {/* 2. Main content container panel */}
      <main className={`flex-1 ${currentUser ? 'ml-20 md:ml-64' : ''} p-6 md:p-10 lg:p-12 overflow-y-auto overflow-x-hidden relative`}>
        
        {/* Floating Theme controller and diagnostic credit */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-40 bg-zinc-900/10 backdrop-blur p-1.5 rounded-2xl border border-white/5">
          <button 
            type="button"
            onClick={() => setTheme(theme === 'cyber' ? 'market' : 'cyber')}
            className="p-2 text-white/50 hover:text-white rounded-xl hover:bg-white/5 flex items-center gap-1.5 transition-all text-[9.5px] font-black uppercase tracking-wider"
            title="Cambiar Diseño Visual"
          >
            {theme === 'cyber' ? <Sun size={15} className="text-neon-yellow" /> : <Moon size={15} className="text-neutral-600" />}
            <span className="hidden sm:inline">Theme: {theme === 'cyber' ? 'Cyber Neon' : 'Warm Market'}</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!currentUser ? (
            /* PUBLIC MODE: AuthFlow on the right, Public Catalogue on the left! */
            <div key="auth" className="max-w-7xl mx-auto w-full pt-10">
              <div className="flex flex-col lg:flex-row gap-10 items-stretch">
                
                {/* Public Catalog Sidebar Panel */}
                <div className="lg:w-1/3 flex">
                  <div className="bg-black/95 border border-white/10 p-8 rounded-[3.5rem] flex flex-col w-full glow-blue/5">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
                      <div className="p-3 bg-neon-blue/10 rounded-2xl text-neon-blue">
                        <Store size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Abierto</h3>
                        <p className="text-[9px] font-black text-white/40 tracking-[0.3em] uppercase">Catálogo Público</p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[60vh] custom-scrollbar">
                      {products.map(p => (
                        <div key={p.id_producto} className="bg-white/5 p-4 rounded-2xl border border-white/5 group hover:border-white/15 transition-all flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl leading-none">{p.foto}</span>
                            <div>
                              <p className="text-[8px] text-white/30 uppercase tracking-widest leading-none">{p.marca}</p>
                              <h4 className="text-white font-bold text-xs uppercase tracking-tight mt-0.5">{p.nombre_producto}</h4>
                              <p className="text-[9px] text-white/40 leading-none mt-1">{categories.find(c => c.id_categoria === p.id_categoria)?.nombre_categoria}</p>
                            </div>
                          </div>
                          <p className="text-neon-green font-mono font-black text-xs shrink-0">${p.precio.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 text-center">
                      <p className="text-[8.5px] font-black text-neon-yellow/60 uppercase tracking-[0.4em] italic animate-pulse">Registra tu usuario para comprar online</p>
                    </div>
                  </div>
                </div>

                {/* Authentication core container panel */}
                <div className="lg:w-2/3 flex items-center justify-center min-h-[500px]">
                  <AuthFlow 
                    users={users} 
                    onLogin={handleLogin} 
                    onSignup={handleRegister} 
                    logoutMessage={logoutMsg} 
                  />
                </div>
              </div>
            </div>
          ) : (
            /* AUTHORIZED FLOW USER ACTIVE HOOK */
            <div className="pt-8">
              {screen === 'welcome' && (
                <div key="welcome-view">
                  {currentUser.role === 'Cliente' ? (
                    <ClientDashboard 
                      products={products}
                      categories={categories}
                      pedidos={pedidos}
                      detallePedidos={detallePedidos}
                      currentUser={currentUser}
                      onUpdateProfile={handleUpdateProfile}
                      onPlaceOrder={handlePlaceOrder}
                    />
                  ) : (
                    /* Employee & Admin Statistics Summary panel view */
                    <AdminDashboard 
                      categories={categories}
                      products={products}
                      users={users}
                      pedidos={pedidos}
                      detallePedidos={detallePedidos}
                      inventario={inventario}
                      ventas={ventas}
                      currentUser={currentUser}
                      onAddCategory={(n, d) => handleAddRelationRow('categorias', { id_categoria: `C${categories.length+1}`, nombre_categoria: n, descripcion: d })}
                      onAddProduct={(p) => handleAddRelationRow('productos', { ...p, id_producto: `P${products.length+1}` })}
                      onDeleteProduct={(id) => handleDeleteRelationRow('productos', id)}
                      onUpdateProductStock={handleUpdateProductStock}
                      onUpdateOrderStatus={handleUpdateOrderStatus}
                      onUpdateUserStatus={handleUpdateUserStatus}
                      onDeleteUser={handleDeleteUser}
                      onAddRelationRow={handleAddRelationRow}
                      onDeleteRelationRow={handleDeleteRelationRow}
                    />
                  )}
                </div>
              )}

              {/* Inventario/Catalog CRUD quick view redirect */}
              {screen === 'register' && (
                <div key="register-view">
                  <AdminDashboard 
                    categories={categories}
                    products={products}
                    users={users}
                    pedidos={pedidos}
                    detallePedidos={detallePedidos}
                    inventario={inventario}
                    ventas={ventas}
                    currentUser={currentUser}
                    onAddCategory={(n, d) => handleAddRelationRow('categorias', { id_categoria: `C${categories.length+1}`, nombre_categoria: n, descripcion: d })}
                    onAddProduct={(p) => handleAddRelationRow('productos', { ...p, id_producto: `P${products.length+1}` })}
                    onDeleteProduct={(id) => handleDeleteRelationRow('productos', id)}
                    onUpdateProductStock={handleUpdateProductStock}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onUpdateUserStatus={handleUpdateUserStatus}
                    onDeleteUser={handleDeleteUser}
                    onAddRelationRow={handleAddRelationRow}
                    onDeleteRelationRow={handleDeleteRelationRow}
                  />
                </div>
              )}

              {/* Sales POS Quick terminal fallback */}
              {screen === 'sales' && (
                <div key="sales-view">
                  {/* Reuse beautiful Client catalog & shopping cart POS for employee/admin to register over-the-counter purchases! */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl text-center mb-6 text-neon-green font-black text-xs uppercase block animate-pulse">
                     📠 TERMINAL VENTA FISICA POS (CLIENTE SIMULADO EN MOSTRADOR)
                  </div>
                  <ClientDashboard 
                    products={products}
                    categories={categories}
                    pedidos={pedidos}
                    detallePedidos={detallePedidos}
                    currentUser={currentUser}
                    onUpdateProfile={handleUpdateProfile}
                    onPlaceOrder={handlePlaceOrder}
                  />
                </div>
              )}

              {/* ALL SEVEN TABLE VIEWERS (THE ENTIRE CONSOLE BASE AS REQUESTED) */}
              {screen === 'db' && (
                <div key="database-raw-view">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] text-center mb-5 uppercase text-neon-blue font-black tracking-widest text-[10px]">
                     📂 ADMINISTRACIÓN CENTRAL DE BASES DE DATOS RELACIONALES
                  </div>
                  <AdminDashboard 
                    categories={categories}
                    products={products}
                    users={users}
                    pedidos={pedidos}
                    detallePedidos={detallePedidos}
                    inventario={inventario}
                    ventas={ventas}
                    currentUser={currentUser}
                    onAddCategory={(n, d) => handleAddRelationRow('categorias', { id_categoria: `C${categories.length+1}`, nombre_categoria: n, descripcion: d })}
                    onAddProduct={(p) => handleAddRelationRow('productos', { ...p, id_producto: `P${products.length+1}` })}
                    onDeleteProduct={(id) => handleDeleteRelationRow('productos', id)}
                    onUpdateProductStock={handleUpdateProductStock}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onUpdateUserStatus={handleUpdateUserStatus}
                    onDeleteUser={handleDeleteUser}
                    onAddRelationRow={handleAddRelationRow}
                    onDeleteRelationRow={handleDeleteRelationRow}
                  />
                </div>
              )}

              {/* Personal management & custom operator approves list */}
              {screen === 'users' && (
                <div key="users-approvals">
                  {isMainAdmin || isAdmin ? (
                    <div className="bg-black/40 border border-white/10 p-8 rounded-[2.5rem] space-y-8">
                      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                        <div className="p-3.5 bg-neon-yellow/10 rounded-2xl text-neon-yellow shadow-lg shrink-0">
                          <ShieldCheck size={28} />
                        </div>
                        <div>
                          <h3 className="font-black text-white text-xl uppercase tracking-tight">SOLICITUDES DE ACCESO Y OPERADORES</h3>
                          <p className="text-neon-yellow text-[9px] font-black uppercase tracking-widest italic mt-0.5">Control de Auditoría y Verificación</p>
                        </div>
                      </div>

                      {/* Pending operators section */}
                      <div className="space-y-4">
                        <h4 className="text-white/60 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          📌 Solicitudes de Alta del Personal ({users.filter(u=>u.status==='pending').length})
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {users.filter(u=>u.status === 'pending').map(pUser => (
                            <div key={pUser.id} className="bg-black border border-white/10 p-5 rounded-2xl flex items-center justify-between gap-4">
                              <div>
                                <h5 className="font-bold text-white text-sm uppercase">{pUser.username}</h5>
                                <p className="text-white/40 text-xs font-mono font-medium">{pUser.email}</p>
                                <span className="mt-1.5 inline-block text-[8px] bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30 px-2.5 py-0.5 rounded font-black uppercase tracking-wider">
                                  {pUser.role} PENDIENTE
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateUserStatus(pUser.id, 'approved')}
                                  className="w-10 h-10 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-xl hover:bg-neon-green hover:text-black flex items-center justify-center font-black transition-all"
                                  title="Aprobar Operador"
                                >
                                  <Check size={20} />
                                </button>
                                <button
                                  onClick={() => handleUpdateUserStatus(pUser.id, 'denied')}
                                  className="w-10 h-10 bg-white/5 text-white/30 border border-white/10 rounded-xl hover:bg-red-600 hover:text-white flex items-center justify-center font-black transition-all"
                                  title="Denegar Operador"
                                >
                                  <X size={20} />
                                </button>
                              </div>
                            </div>
                          ))}

                          {users.filter(u=>u.status==='pending').length === 0 && (
                            <p className="col-span-full py-8 text-center text-white/20 text-xs uppercase font-bold">No hay solicitudes pendientes en curso.</p>
                          )}
                        </div>
                      </div>

                      {/* Approved operators list */}
                      <div className="space-y-4 pt-6">
                        <h4 className="text-white/60 text-xs font-black uppercase tracking-widest">
                          🛡️ Personal Auxiliar Activo en Turno
                        </h4>

                        <div className="bg-black/40 rounded-3xl border border-white/15 overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-[9px] uppercase font-black text-white/30 tracking-widest border-b border-white/5">
                              <tr>
                                <th className="p-4">Operador</th>
                                <th className="p-4">Email de Acceso</th>
                                <th className="p-4 text-center">Nivel Rol</th>
                                <th className="p-4 text-center">Estado Auditor</th>
                                <th className="p-4 text-right">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-medium text-white/80">
                              {users.filter(u=>u.status === 'approved').map(u => (
                                <tr key={u.id} className="hover:bg-white/5">
                                  <td className="p-4 font-bold text-white flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-black uppercase text-neon-blue">
                                      {u.username[0]}
                                    </div>
                                    {u.username}
                                  </td>
                                  <td className="p-4 font-mono text-white/40">{u.email}</td>
                                  <td className="p-4 text-center">
                                    <span className={`text-[8px] font-black border uppercase px-2 py-0.5 rounded ${
                                      u.role === 'Administrador' ? 'border-neon-yellow/30 text-neon-yellow' : 'border-white/10 text-white/50'
                                    }`}>
                                      {u.role}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center text-neon-green text-[9px] font-black uppercase">● AUTORIZADO CONTRATO</td>
                                  <td className="p-4 text-right">
                                    {u.id !== '1' && (
                                      <button onClick={() => handleDeleteUser(u.id)} className="p-1 rounded text-white/20 hover:text-red-500 hover:bg-red-500/10">
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-950/10 border border-red-900/30 p-12 text-center rounded-[3.5rem] uppercase text-red-400 font-extrabold text-sm tracking-widest">
                       ⚠️ ACCESO DENEGADO: REQUERIDO OPERADOR PRINCIPAL ADMINISTRADOR #04
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Cyber ambient grid particles */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-neon-blue/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-neon-green/5 rounded-full blur-[140px]"></div>
      </div>
    </div>
  );
}
