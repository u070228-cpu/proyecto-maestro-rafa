import React, { useState } from 'react';
import { 
  TrendingUp, 
  Store, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Save, 
  ShieldCheck, 
  Check, 
  X, 
  User as UserIcon, 
  Users, 
  RefreshCw, 
  FileText, 
  Coins, 
  Layers, 
  Settings, 
  Tag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Product, User, Pedido, DetallePedido, InventarioItem, VentaItem, Screen } from '../types';

interface AdminDashboardProps {
  categories: Category[];
  products: Product[];
  users: User[];
  pedidos: Pedido[];
  detallePedidos: DetallePedido[];
  inventario: InventarioItem[];
  ventas: VentaItem[];
  currentUser: User;
  onAddCategory: (name: string, desc: string) => void;
  onAddProduct: (prod: Omit<Product, 'id_producto' | 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateProductStock: (id: string, qty: number) => void;
  onUpdateOrderStatus: (id: string, status: Pedido['estado_pedido']) => void;
  onUpdateUserStatus: (id: string, status: User['status']) => void;
  onDeleteUser: (id: string) => void;
  onAddRelationRow: (tableName: string, data: any) => void;
  onDeleteRelationRow: (tableName: string, id: string) => void;
}

export const AdminDashboard = ({
  categories,
  products,
  users,
  pedidos,
  detallePedidos,
  inventario,
  ventas,
  currentUser,
  onAddCategory,
  onAddProduct,
  onDeleteProduct,
  onUpdateProductStock,
  onUpdateOrderStatus,
  onUpdateUserStatus,
  onDeleteUser,
  onAddRelationRow,
  onDeleteRelationRow
}: AdminDashboardProps) => {
  const isAdmin = currentUser.role === 'Administrador';
  const isMainAdmin = currentUser.id === '1';
  const isEmployee = currentUser.role === 'Empleado';

  const [activeTab, setActiveTab] = useState<'stats' | 'pedidos' | 'inventarios' | 'tablas'>('stats');
  
  // Table Explorer state
  const [activeDBTable, setActiveDBTable] = useState<string>('categorias');

  // Addition inputs for CRUD
  const [newCat, setNewCat] = useState({ id_categoria: '', nombre_categoria: '', descripcion: '' });
  const [newProd, setNewProd] = useState({ id_producto: '', nombre_producto: '', precio: '', stock: '', foto: '📦', codigo_barras: '', marca: '', id_categoria: '' });
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'Cliente' as User['role'], phone: '', address: '' });
  const [newOrder, setNewOrder] = useState({ id_pedido: '', id_usuario: '', estado_pedido: 'pendiente' as Pedido['estado_pedido'], metodo_pago: 'efectivo' as Pedido['metodo_pago'], total: '' });
  const [newDetail, setNewDetail] = useState({ id_pedido: '', id_producto: '', cantidad: '' });
  const [newInv, setNewInv] = useState({ id_producto: '', cantidad_actual: '', stock_minimo: '', proveedor: '' });
  const [newVenta, setNewVenta] = useState({ id_pedido: '', total: '' });

  const [crudError, setCrudError] = useState('');
  const [crudSuccess, setCrudSuccess] = useState('');

  // Stats summaries
  const totalRevenue = ventas.reduce((s, v) => s + v.total, 0);
  const lowStockItems = inventario.filter(item => item.cantidad_actual <= item.stock_minimo);
  const pendingApprovals = users.filter(u => u.status === 'pending');

  const handleUpdateStockLevel = (pId: string, delta: number) => {
    onUpdateProductStock(pId, delta);
  };

  // Raw Database addition submitter with constraints check!
  const handleAddRowSubmit = (e: React.FormEvent, table: string) => {
    e.preventDefault();
    setCrudError('');
    setCrudSuccess('');

    try {
      if (table === 'categorias') {
        if (!newCat.id_categoria || !newCat.nombre_categoria) throw new Error('Favor de indicar ID y Nombre.');
        if (categories.some(c => c.id_categoria === newCat.id_categoria)) throw new Error('El ID de categoría ya existe.');
        onAddRelationRow('categorias', newCat);
        setNewCat({ id_categoria: '', nombre_categoria: '', descripcion: '' });
      } 
      
      else if (table === 'productos') {
        if (!newProd.id_producto || !newProd.nombre_producto || !newProd.precio || !newProd.stock) throw new Error('Los campos con asterisco son requeridos.');
        if (products.some(p => p.id_producto === newProd.id_producto)) throw new Error('El ID de producto ya existe.');
        if (!categories.some(c => c.id_categoria === newProd.id_categoria)) throw new Error('La categoría especificada no existe en la tabla de categorías.');
        
        onAddRelationRow('productos', {
          id_producto: newProd.id_producto,
          nombre_producto: newProd.nombre_producto,
          descripcion: 'Fila con relación desde base de datos externa.',
          precio: parseFloat(newProd.precio),
          stock: parseInt(newProd.stock),
          foto: newProd.foto,
          codigo_barras: newProd.codigo_barras || Math.floor(Math.random()*10000000).toString(),
          marca: newProd.marca || 'Generico',
          disponible: parseInt(newProd.stock) > 0,
          id_categoria: newProd.id_categoria
        });
        setNewProd({ id_producto: '', nombre_producto: '', precio: '', stock: '', foto: '📦', codigo_barras: '', marca: '', id_categoria: '' });
      } 
      
      else if (table === 'usuarios') {
        if (!newUser.username || !newUser.email) throw new Error('Nombre y correo son requeridos.');
        if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) throw new Error('El correo del usuario ya existe en otra cuenta.');
        onAddRelationRow('usuarios', newUser);
        setNewUser({ username: '', email: '', password: '', role: 'Cliente', phone: '', address: '' });
      } 
      
      else if (table === 'pedidos') {
        if (!newOrder.id_pedido || !newOrder.id_usuario || !newOrder.total) throw new Error('Campos incompletos.');
        if (pedidos.some(o => o.id_pedido === newOrder.id_pedido)) throw new Error('El ID de Pedido ya existe.');
        if (!users.some(u => u.id === newOrder.id_usuario)) throw new Error('El ID de Usuario no corresponde a ningún usuario registrado.');

        const usrObj = users.find(u => u.id === newOrder.id_usuario);
        onAddRelationRow('pedidos', {
          id_pedido: newOrder.id_pedido,
          id_usuario: newOrder.id_usuario,
          nombre_usuario: usrObj?.username,
          fecha_pedido: new Date().toISOString().split('T')[0],
          estado_pedido: newOrder.estado_pedido,
          metodo_pago: newOrder.metodo_pago,
          total: parseFloat(newOrder.total)
        });
        setNewOrder({ id_pedido: '', id_usuario: '', estado_pedido: 'pendiente', metodo_pago: 'efectivo', total: '' });
      } 
      
      else if (table === 'detalle') {
        if (!newDetail.id_pedido || !newDetail.id_producto || !newDetail.cantidad) throw new Error('Campos incompletos.');
        if (!pedidos.some(o => o.id_pedido === newDetail.id_pedido)) throw new Error('El ID del Pedido no existe.');
        if (!products.some(p => p.id_producto === newDetail.id_producto)) throw new Error('El ID del Producto no existe.');

        const prodObj = products.find(p => p.id_producto === newDetail.id_producto)!;
        const qty = parseInt(newDetail.cantidad);
        onAddRelationRow('detalle', {
          id_pedido: newDetail.id_pedido,
          id_producto: newDetail.id_producto,
          nombre_producto: prodObj.nombre_producto,
          cantidad: qty,
          precio_unitario: prodObj.precio,
          subtotal: qty * prodObj.precio
        });
        setNewDetail({ id_pedido: '', id_producto: '', cantidad: '' });
      } 
      
      else if (table === 'inventarios') {
        if (!newInv.id_producto || !newInv.cantidad_actual || !newInv.stock_minimo) throw new Error('Campos requeridos vacíos.');
        if (!products.some(p => p.id_producto === newInv.id_producto)) throw new Error('El ID del Producto no existe.');

        const prodObj = products.find(p => p.id_producto === newInv.id_producto)!;
        onAddRelationRow('inventarios', {
          id_producto: newInv.id_producto,
          nombre_producto: prodObj.nombre_producto,
          cantidad_actual: parseInt(newInv.cantidad_actual),
          stock_minimo: parseInt(newInv.stock_minimo),
          proveedor: newInv.proveedor || 'Sin Proveedor definido',
          fecha_actualizacion: new Date().toISOString().split('T')[0]
        });
        setNewInv({ id_producto: '', cantidad_actual: '', stock_minimo: '', proveedor: '' });
      } 
      
      else if (table === 'ventas') {
        if (!newVenta.id_pedido || !newVenta.total) throw new Error('Favor de indicar ID de Pedido y Total.');
        if (!pedidos.some(o => o.id_pedido === newVenta.id_pedido)) throw new Error('El ID del Pedido no existe.');

        onAddRelationRow('ventas', {
          id_pedido: newVenta.id_pedido,
          fecha: new Date().toISOString().split('T')[0],
          total: parseFloat(newVenta.total)
        });
        setNewVenta({ id_pedido: '', total: '' });
      }

      setCrudSuccess('¡Fila insertada correctamente cumpliendo integridad relacional!');
      setTimeout(() => setCrudSuccess(''), 4000);
    } catch (err: any) {
      setCrudError(err.message || 'Error en validaciones formales.');
      setTimeout(() => setCrudError(''), 5000);
    }
  };

  const handleRowDelete = (tableName: string, entityId: string) => {
    if (confirm(`¿Proceder a eliminar la fila ${entityId} de la tabla ${tableName}?`)) {
      onDeleteRelationRow(tableName, entityId);
      setCrudSuccess('¡Fila eliminada con éxito de la base!');
      setTimeout(() => setCrudSuccess(''), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Admin Panel Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-black/40 border border-white/10 p-8 rounded-[2.5rem] gap-6">
        <div>
          <span className="text-[10px] bg-neon-yellow/10 text-neon-yellow px-3 py-1 rounded-full border border-neon-yellow/20 uppercase tracking-[0.2em] font-black italic">
            {currentUser.role.toUpperCase()} CONSOLE
          </span>
          <h2 className="text-4xl font-black text-white italic tracking-tighter mt-3 uppercase">
            SISTEMA OPERATIVO <span className="text-neon-yellow text-glow-yellow">CENTRAL</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mt-0.5">
            Módulos de Almacén, Ventas consolidadas e Integridad Relacional de Datos
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
              activeTab === 'stats'
                ? 'bg-neon-blue text-black border-neon-blue glow-blue'
                : 'bg-transparent text-white/50 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            📊 Estadísticas
          </button>
          
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
              activeTab === 'pedidos'
                ? 'bg-neon-green text-black border-neon-green glow-green'
                : 'bg-transparent text-white/50 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            📦 Despachar Pedidos
          </button>

          <button
            onClick={() => setActiveTab('inventarios')}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
              activeTab === 'inventarios'
                ? 'bg-neon-yellow text-black border-neon-yellow glow-yellow'
                : 'bg-transparent text-white/50 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            ⚙️ Inventario Stock
          </button>

          <button
            onClick={() => setActiveTab('tablas')}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
              activeTab === 'tablas'
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-white/50 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            📁 BD SQL Abarrotes
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: VIEW STATS SUMMARY & GRAPHS */}
        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Ingresos Históricos', value: `$${totalRevenue.toFixed(2)}`, theme: 'text-neon-green border-neon-green bg-neon-green/5', desc: 'Ventas de caja registradas' },
                { title: 'Artículos Totales', value: `${products.length} productos`, theme: 'text-neon-blue border-neon-blue bg-neon-blue/5', desc: 'Registros SQL en tabla' },
                { title: 'Alertas Bajo Stock', value: `${lowStockItems.length} advertencias`, theme: lowStockItems.length > 0 ? 'text-neon-yellow border-neon-yellow bg-neon-yellow/10' : 'text-white/40 border-white/5', desc: 'Stock <= mínimo configurado' },
                { title: 'Pendientes Aprobación', value: `${pendingApprovals.length} personal`, theme: pendingApprovals.length > 0 ? 'text-neon-yellow border-neon-yellow bg-neon-yellow/15 animate-pulse' : 'text-white/40 border-white/5', desc: 'Solicitudes de ingreso' }
              ].map((m, i) => (
                <div key={i} className={`p-6 border rounded-[2rem] flex flex-col justify-between ${m.theme.split(' ')[2]} ${m.theme.split(' ')[1]}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">{m.title}</p>
                  <p className={`text-2xl font-black italic tracking-tighter ${m.theme.split(' ')[0]}`}>{m.value}</p>
                  <p className="text-[8px] uppercase tracking-wide text-white/30 font-bold mt-2">{m.desc}</p>
                </div>
              ))}
            </div>

            {/* Custom Responsive SVG Reports / Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily sales report */}
              <div className="bg-black/40 border border-white/10 p-8 rounded-[2.5rem] space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                  <h4 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="text-neon-green" size={16} /> Tendencia de Facturación Diaria
                  </h4>
                  <span className="text-[9px] text-neon-green font-black">Historial Activo</span>
                </div>

                {/* Simulated pure SVG Chart representing Daily Sales */}
                <div className="w-full h-44 bg-black/60 rounded-xl relative border border-white/5 p-4 flex flex-col justify-end">
                  <div className="absolute inset-x-0 bottom-8 top-4 flex items-end justify-between px-6 z-10">
                    <div className="h-[20%] w-3 bg-neon-green/30 hover:bg-neon-green rounded-t transition-all group relative"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/65 opacity-0 group-hover:opacity-100">$20.00</span></div>
                    <div className="h-[43%] w-3 bg-neon-green/30 hover:bg-neon-green rounded-t transition-all group relative"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/65 opacity-0 group-hover:opacity-100">$45.00</span></div>
                    <div className="h-[60%] w-3 bg-neon-green/30 hover:bg-neon-green rounded-t transition-all group relative"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/65 opacity-0 group-hover:opacity-100">$65.00</span></div>
                    <div className="h-[91%] w-3 bg-neon-green hover:bg-neon-green/80 rounded-t transition-all group relative"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/65 font-black">$91.00</span></div>
                    <div className="h-[48%] w-3 bg-neon-green/70 hover:bg-neon-green rounded-t transition-all group relative"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/65 font-black">$44.00</span></div>
                  </div>
                  {/* Backdrop grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-10">
                    <div className="border-b border-white w-full"></div>
                    <div className="border-b border-white w-full"></div>
                    <div className="border-b border-white w-full"></div>
                    <div className="border-b border-white w-full"></div>
                  </div>
                  {/* Bottom labels */}
                  <div className="flex justify-between text-[8px] font-mono text-white/40 px-3 mt-2 z-20 pt-2 border-t border-white/5">
                    <span>May 17</span>
                    <span>May 18</span>
                    <span>May 19</span>
                    <span>May 20</span>
                    <span>Hoy</span>
                  </div>
                </div>
                <p className="text-white/40 text-[9px] text-center uppercase tracking-wide">Representación analítica de ingresos recurrentes liquidados</p>
              </div>

              {/* Category distribution report */}
              <div className="bg-black/40 border border-white/10 p-8 rounded-[2.5rem] space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                  <h4 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                    <Layers className="text-neon-blue" size={16} /> Artículos por Categoría Bodega
                  </h4>
                  <span className="text-[9px] text-neon-blue font-black">Stock Distribución</span>
                </div>

                <div className="space-y-3 pt-2">
                  {categories.map(cat => {
                    const itemsInCat = products.filter(p => p.id_categoria === cat.id_categoria);
                    const sumStock = itemsInCat.reduce((s, p) => s + p.stock, 0);
                    const maxStockThreshold = 100;
                    const percent = Math.min(100, Math.floor((sumStock / maxStockThreshold) * 100));

                    return (
                      <div key={cat.id_categoria} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-white/60">
                          <span>{cat.nombre_categoria}</span>
                          <span className="font-mono text-neon-blue">{sumStock} pzas ({percent}%)</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-neon-blue rounded-full transition-all duration-100" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Low stock critical warnings list alerts */}
            <div className="bg-[#090909] border border-neon-yellow/30 p-8 rounded-[2.5rem]">
              <h4 className="font-black text-white text-xs uppercase tracking-widest border-b border-white/5 pb-4 mb-6 flex items-center gap-2">
                <ShieldAlert className="text-neon-yellow animate-pulse" /> CONFIGURACIÓN DE ALERTAS DE STOCK MÍNIMO POR PROVEEDOR
              </h4>

              {lowStockItems.length === 0 ? (
                <div className="py-10 text-center text-white/20">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-neon-green" />
                  <p className="text-xs uppercase font-black tracking-widest">Todos los productos cuentan con niveles seguros en almacén.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lowStockItems.map(item => {
                    const prodObj = products.find(p => p.id_producto === item.id_producto);
                    return (
                      <div key={item.id_inventario} className="bg-black border border-neon-yellow/20 p-5 rounded-2xl flex items-center justify-between gap-4">
                        <div>
                          <p className="text-white/30 text-[8px] font-mono leading-none">INV: {item.id_inventario} • PROD: {item.id_producto}</p>
                          <h5 className="font-black text-white text-sm uppercase mt-1 tracking-tight">
                            {prodObj?.nombre_producto || item.nombre_producto}
                          </h5>
                          <p className="text-[10px] text-neon-yellow font-bold uppercase mt-1 leading-none">Proveedor: {item.proveedor}</p>
                        </div>
                        <div className="text-right shrink-0 bg-neon-yellow/5 border border-neon-yellow/20 px-3 py-2 rounded-xl text-center">
                          <p className="text-[8px] font-black text-white/50 uppercase leading-none">Actual</p>
                          <p className="text-lg font-mono font-black text-neon-yellow mt-0.5 leading-none">{item.cantidad_actual}</p>
                          <p className="text-[7px] text-white/30 tracking-widest uppercase mt-1 font-bold">Mín: {item.stock_minimo}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: ACTIVE PENDING ORDERS (EMPLOYEE / ADMIN FOCUS) */}
        {activeTab === 'pedidos' && (
          <motion.div
            key="pedidos"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-black/40 border border-white/10 p-8 rounded-[2.5rem]">
              <h3 className="font-black text-white text-xl uppercase italic tracking-tighter border-b border-white/5 pb-4 mb-6">
                CONTROLLER DE DESPACHO DE PEDIDOS DE CLIENTES
              </h3>

              <div className="space-y-6">
                {pedidos.map(p => {
                  const items = detallePedidos.filter(d => d.id_pedido === p.id_pedido);
                  
                  return (
                    <div key={p.id_pedido} className="bg-white/5 border border-white/5 p-6 rounded-2xl md:p-8 space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-neon-blue">{p.id_pedido}</span>
                            <span className="text-[9px] bg-white/5 text-white/40 px-2.5 py-0.5 rounded border border-white/5 font-bold uppercase">
                              Cliente: {p.nombre_usuario || 'Cliente Registrado'}
                            </span>
                          </div>
                          <p className="text-xs font-black text-white/50 mt-1 uppercase">
                            Total Facturado: <span className="text-neon-green">${p.total.toFixed(2)}</span> • Método: {p.metodo_pago.toUpperCase()}
                          </p>
                        </div>

                        {/* Interactive state actions */}
                        <div className="flex items-center gap-2">
                          <p className="text-[8px] font-black uppercase text-white/30 mr-2">Establecer Estado:</p>
                          {(['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'] as Pedido['estado_pedido'][]).map(st => (
                            <button
                              key={st}
                              onClick={() => onUpdateOrderStatus(p.id_pedido, st)}
                              className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all ${
                                p.estado_pedido === st
                                  ? 'bg-white text-black border-white glow-blue'
                                  : 'bg-transparent text-white/30 border-white/5 hover:border-white/25 hover:text-white'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Line products breakdown */}
                      <div className="bg-black/60 p-4 rounded-xl border border-white/5">
                        <p className="text-[7px] font-black uppercase tracking-widest text-white/20 mb-2">Desglose Detalle Pedido</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map(it => (
                            <div key={it.id_detalle} className="text-xs border-b border-white/5 pb-1 flex justify-between">
                              <span className="font-bold text-white/80">{it.cantidad}x {it.nombre_producto}</span>
                              <span className="font-mono text-white/40">${it.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {pedidos.length === 0 && (
                  <div className="py-20 text-center text-white/10">
                    <p className="uppercase font-black tracking-widest">No hay pedidos agregados en el sistema</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: INVENTORY STOCK UPDATER */}
        {activeTab === 'inventarios' && (
          <motion.div
            key="inventarios"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-black/40 border border-white/10 p-8 rounded-[2.5rem]">
              <h3 className="font-black text-white text-xl uppercase italic tracking-tighter border-b border-white/5 pb-4 mb-6">
                PROVEEDORES Y ADMINISTRACIÓN DE STOCK DE ALMACÉN
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                    <tr>
                      <th className="p-5">Producto</th>
                      <th className="p-5">Código de Barras</th>
                      <th className="p-5 text-center">Proveedor Oficial</th>
                      <th className="p-5 text-center">Mínimo Permitido</th>
                      <th className="p-5 text-center">Cantidad Actual</th>
                      <th className="p-5 text-right">Ajustar Nivel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inventario.map(item => {
                      const prodObj = products.find(p => p.id_producto === item.id_producto);
                      const isBajo = item.cantidad_actual <= item.stock_minimo;

                      return (
                        <tr key={item.id_inventario} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 font-bold text-white">
                            <span className="text-xl mr-2 leading-none">{prodObj?.foto || '📦'}</span>
                            {prodObj?.nombre_producto || item.nombre_producto}
                          </td>
                          <td className="p-5 font-mono text-white/40 text-xs">{prodObj?.codigo_barras || 'N/A'}</td>
                          <td className="p-5 text-center text-xs font-semibold text-white/60">{item.proveedor}</td>
                          <td className="p-5 text-center font-mono text-xs">{item.stock_minimo}</td>
                          <td className="p-5 text-center">
                            <span className={`px-3 py-1 rounded font-mono font-bold text-xs ${
                              isBajo ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20' : 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                            }`}>
                              {item.cantidad_actual} units
                            </span>
                          </td>
                          <td className="p-5 text-right flex justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStockLevel(item.id_producto, -1)}
                              className="w-8 h-8 rounded bg-black border border-white/20 text-white/50 hover:text-white flex items-center justify-center font-bold text-xs active:scale-90"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => handleUpdateStockLevel(item.id_producto, 5)}
                              className="px-2 h-8 rounded bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue hover:text-black flex items-center justify-center font-bold text-[10px] active:scale-90 uppercase"
                            >
                              +5 Refill
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: MOCK SQL RELATION DATABASE CONSOLE */}
        {activeTab === 'tablas' && (
          <motion.div
            key="tablas"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Table pills navigation */}
            <div className="bg-black/40 border border-white/10 p-6 rounded-[2.5rem] flex flex-wrap gap-2.5 items-center justify-between">
              <div>
                <h4 className="text-white font-black text-xs uppercase tracking-widest italic leading-none">Tablas de la Base de Datos</h4>
                <p className="text-[8px] text-white/30 uppercase mt-1 tracking-widest font-black italic">Consola Relacional SQL</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { table: 'categorias', label: 'Categorías (6)' },
                  { table: 'productos', label: 'Productos' },
                  { table: 'usuarios', label: 'Usuarios' },
                  { table: 'pedidos', label: 'Pedidos' },
                  { table: 'detalle', label: 'Detalle_Pedido' },
                  { table: 'inventarios', label: 'Inventario' },
                  { table: 'ventas', label: 'Ventas' }
                ].map(info => (
                  <button
                    key={info.table}
                    onClick={() => {
                      setActiveDBTable(info.table);
                      setCrudError('');
                      setCrudSuccess('');
                    }}
                    className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                      activeDBTable === info.table
                        ? 'bg-neon-blue text-black border-neon-blue glow-blue font-black'
                        : 'bg-transparent text-white/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {info.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error alerts */}
            <AnimatePresence mode="wait">
              {crudError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }} 
                  className="bg-red-950/40 border border-red-500/40 p-4 rounded-xl text-red-400 text-xs font-black uppercase text-center tracking-widest"
                >
                  ⚠️ ERROR DE REGLA INTEGRIDAD: {crudError}
                </motion.div>
              )}
              {crudSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }} 
                  className="bg-neon-green/10 border border-neon-green/30 p-4 rounded-xl text-neon-green text-xs font-black uppercase text-center tracking-widest glow-green"
                >
                  {crudSuccess}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms and Active Data table split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Insert Panel Form */}
              <div className="lg:col-span-4 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 h-fit">
                <h4 className="font-black text-white text-xs uppercase tracking-widest border-b border-white/10 pb-3 mb-6 italic flex items-center gap-2">
                  <Plus size={16} className="text-neon-blue" /> INSERT ROW (CRUD FORM)
                </h4>

                {/* Form based on selected raw table */}
                {activeDBTable === 'categorias' && (
                  <form onSubmit={(e) => handleAddRowSubmit(e, 'categorias')} className="space-y-4">
                    <div>
                      <label className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">ID Categoría (PK) *</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ej. C10" 
                        value={newCat.id_categoria} 
                        onChange={(e) => setNewCat({...newCat, id_categoria: e.target.value})}
                        className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-xs font-mono text-neon-blue"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">Nombre Categoría *</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ej. Panadería" 
                        value={newCat.nombre_categoria} 
                        onChange={(e) => setNewCat({...newCat, nombre_categoria: e.target.value})}
                        className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">Descripción</label>
                      <textarea 
                        placeholder="Detallar productos..." 
                        value={newCat.descripcion} 
                        onChange={(e) => setNewCat({...newCat, descripcion: e.target.value})}
                        className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-xs h-16"
                      />
                    </div>
                    <button type="submit" className="w-full py-3 bg-neon-blue text-black font-black uppercase text-[10px] rounded-lg tracking-widest">
                      INSERT INTO categorias
                    </button>
                  </form>
                )}

                {activeDBTable === 'productos' && (
                  <form onSubmit={(e) => handleAddRowSubmit(e, 'productos')} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-white/40 uppercase block mb-1">ID_Producto *</label>
                        <input required type="text" placeholder="Ej. P10" value={newProd.id_producto} onChange={e => setNewProd({...newProd, id_producto: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs font-mono text-neon-blue rounded" />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-white/40 uppercase block mb-1">FK ID_Cat *</label>
                        <select required value={newProd.id_categoria} onChange={e => setNewProd({...newProd, id_categoria: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded">
                          <option value="">Seleccionar...</option>
                          {categories.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.id_categoria} ({c.nombre_categoria})</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 uppercase block mb-1">Nombre Producto *</label>
                      <input required type="text" placeholder="Ej. Pan Dulce" value={newProd.nombre_producto} onChange={e => setNewProd({...newProd, nombre_producto: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-white/40 uppercase block mb-1">Precio *</label>
                        <input required type="number" step="0.1" placeholder="20.0" value={newProd.precio} onChange={e => setNewProd({...newProd, precio: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded" />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-white/40 uppercase block mb-1">Stock Inicial *</label>
                        <input required type="number" placeholder="50" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[8px] font-black text-white/40 block mb-1">Marca</label>
                        <input type="text" placeholder="Bimbo" value={newProd.marca} onChange={e => setNewProd({...newProd, marca: e.target.value})} className="w-full p-1 bg-black border border-white/10 text-xs rounded" />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-white/40 block mb-1">Barras</label>
                        <input type="text" placeholder="7501" value={newProd.codigo_barras} onChange={e => setNewProd({...newProd, codigo_barras: e.target.value})} className="w-full p-1 bg-black border border-white/10 text-[10px] rounded font-mono" />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-white/40 block mb-1">Foto Emoji</label>
                        <input type="text" value={newProd.foto} onChange={e => setNewProd({...newProd, foto: e.target.value})} className="w-full p-1 bg-black border border-white/10 text-xs rounded" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-neon-blue text-black font-black uppercase text-[10px] rounded-lg tracking-widest">
                      INSERT INTO productos
                    </button>
                  </form>
                )}

                {activeDBTable === 'usuarios' && (
                  <form onSubmit={(e) => handleAddRowSubmit(e, 'usuarios')} className="space-y-4">
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">Nombre Completo *</label>
                      <input required type="text" placeholder="Ej. Carlos Pérez" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value, nombre: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">Correo Electrónico *</label>
                      <input required type="email" placeholder="carlos@correo.com" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value, correo: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">Contraseña *</label>
                      <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">Tipo Usuario *</label>
                      <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className="w-full p-2 bg-black border border-white/10 text-xs rounded">
                        <option value="Cliente">Cliente</option>
                        <option value="Empleado">Empleado</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full py-3 bg-neon-blue text-black font-black uppercase text-[10px] rounded-lg tracking-widest">
                      INSERT INTO usuarios
                    </button>
                  </form>
                )}

                {activeDBTable === 'pedidos' && (
                  <form onSubmit={(e) => handleAddRowSubmit(e, 'pedidos')} className="space-y-4">
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">ID Pedido (PK) *</label>
                      <input required type="text" placeholder="PED-10" value={newOrder.id_pedido} onChange={e => setNewOrder({...newOrder, id_pedido: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs font-mono rounded" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">FK ID Usuario *</label>
                      <select required value={newOrder.id_usuario} onChange={e => setNewOrder({...newOrder, id_usuario: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded">
                        <option value="">Seleccione ID usuario...</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.id} ({u.role}: {u.username})</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-white/40 block mb-1">Pago *</label>
                        <select value={newOrder.metodo_pago} onChange={e => setNewOrder({...newOrder, metodo_pago: e.target.value as any})} className="w-full p-1 bg-black border border-white/10 text-[10px] rounded">
                          <option value="efectivo">Efectivo</option>
                          <option value="tarjeta">Tarjeta</option>
                          <option value="transferencia">Transfer</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-white/40 block mb-1">Monto Total *</label>
                        <input required type="number" placeholder="100" value={newOrder.total} onChange={e => setNewOrder({...newOrder, total: e.target.value})} className="w-full p-1 bg-black border border-white/10 text-xs rounded" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-neon-blue text-black font-black uppercase text-[10px] rounded-lg tracking-widest">
                      INSERT INTO pedidos
                    </button>
                  </form>
                )}

                {activeDBTable === 'detalle' && (
                  <form onSubmit={(e) => handleAddRowSubmit(e, 'detalle')} className="space-y-4">
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">FK ID Pedido *</label>
                      <select required value={newDetail.id_pedido} onChange={e => setNewDetail({...newDetail, id_pedido: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded">
                        <option value="">Seleccione ID Pedido...</option>
                        {pedidos.map(o => <option key={o.id_pedido} value={o.id_pedido}>{o.id_pedido}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">FK ID Producto *</label>
                      <select required value={newDetail.id_producto} onChange={e => setNewDetail({...newDetail, id_producto: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded">
                        <option value="">Seleccione ID Producto...</option>
                        {products.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">Cantidad de Compra *</label>
                      <input required type="number" placeholder="1" value={newDetail.cantidad} onChange={e => setNewDetail({...newDetail, cantidad: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-neon-blue text-black font-black uppercase text-[10px] rounded-lg tracking-widest">
                      INSERT INTO detalle_pedido
                    </button>
                  </form>
                )}

                {activeDBTable === 'inventarios' && (
                  <form onSubmit={(e) => handleAddRowSubmit(e, 'inventarios')} className="space-y-4">
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">FK ID Producto *</label>
                      <select required value={newInv.id_producto} onChange={e => setNewInv({...newInv, id_producto: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded">
                        <option value="">Seleccione Producto...</option>
                        {products.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-white/40 block mb-1">Cantidad Actual *</label>
                        <input required type="number" value={newInv.cantidad_actual} onChange={e => setNewInv({...newInv, cantidad_actual: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded" />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-white/40 block mb-1">Stock Mínimo *</label>
                        <input required type="number" value={newInv.stock_minimo} onChange={e => setNewInv({...newInv, stock_minimo: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">Proveedor Principal</label>
                      <input type="text" placeholder="Bimbo S.A." value={newInv.proveedor} onChange={e => setNewInv({...newInv, proveedor: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-neon-blue text-black font-black uppercase text-[10px] rounded-lg tracking-widest">
                      INSERT INTO inventario
                    </button>
                  </form>
                )}

                {activeDBTable === 'ventas' && (
                  <form onSubmit={(e) => handleAddRowSubmit(e, 'ventas')} className="space-y-4">
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">FK ID Pedido *</label>
                      <select required value={newVenta.id_pedido} onChange={e => setNewVenta({...newVenta, id_pedido: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded">
                        <option value="">Seleccione Pedido...</option>
                        {pedidos.map(o => <option key={o.id_pedido} value={o.id_pedido}>{o.id_pedido} (${o.total})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 block mb-1">Total Cobrado (Venta) *</label>
                      <input required type="number" value={newVenta.total} onChange={e => setNewVenta({...newVenta, total: e.target.value})} className="w-full p-2 bg-black border border-white/10 text-xs rounded" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-neon-blue text-black font-black uppercase text-[10px] rounded-lg tracking-widest">
                      INSERT INTO ventas
                    </button>
                  </form>
                )}

                <div className="mt-6 pt-4 border-t border-white/5 text-[9px] uppercase tracking-wide text-white/30 space-y-1 font-semibold leading-relaxed">
                  <p>⚖️ Restricciones:</p>
                  <p>1. Verificación automática de PK.</p>
                  <p>2. FK existenciales en base relacional.</p>
                </div>
              </div>

              {/* Data Table Raw Display Panel */}
              <div className="lg:col-span-8 bg-black/40 rounded-[2.5rem] border border-white/10 overflow-hidden min-h-[400px]">
                
                {activeDBTable === 'categorias' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-[9px] font-black uppercase tracking-wider text-white/30 border-b border-white/5">
                        <tr>
                          <th className="p-4">id_categoria (PK)</th>
                          <th className="p-4">nombre_categoria</th>
                          <th className="p-4">descripcion</th>
                          <th className="p-4 text-right w-12">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium text-white/80">
                        {categories.map(c => (
                          <tr key={c.id_categoria}>
                            <td className="p-4 font-mono text-neon-blue">{c.id_categoria}</td>
                            <td className="p-4 text-white font-bold">{c.nombre_categoria}</td>
                            <td className="p-4 text-white/50">{c.descripcion}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleRowDelete('categorias', c.id_categoria)} className="text-white/20 hover:text-red-400 p-1 rounded hover:bg-white/5"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeDBTable === 'productos' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-[9px] font-black uppercase tracking-wider text-white/30 border-b border-white/5">
                        <tr>
                          <th className="p-4">id_producto</th>
                          <th className="p-4">nombre_producto</th>
                          <th className="p-4 font-mono">marca</th>
                          <th className="p-4 font-mono">precio</th>
                          <th className="p-4 text-center">stock</th>
                          <th className="p-4 text-center">FK id_categoria</th>
                          <th className="p-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium text-white/80">
                        {products.map(p => (
                          <tr key={p.id_producto}>
                            <td className="p-4 font-mono text-neon-blue">{p.id_producto}</td>
                            <td className="p-4 font-bold text-white"><span className="mr-1.5">{p.foto}</span>{p.nombre_producto}</td>
                            <td className="p-4 text-white/40">{p.marca}</td>
                            <td className="p-4 font-mono text-neon-green font-black">${p.precio.toFixed(2)}</td>
                            <td className="p-4 text-center font-mono">{p.stock}</td>
                            <td className="p-4 text-center font-mono text-neon-yellow">{p.id_categoria}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleRowDelete('productos', p.id_producto)} className="text-white/20 hover:text-red-400 p-1 rounded hover:bg-white/5"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeDBTable === 'usuarios' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-[9px] font-black uppercase tracking-wider text-white/30 border-b border-white/5">
                        <tr>
                          <th className="p-4">id_usuario</th>
                          <th className="p-4">nombre</th>
                          <th className="p-4">correo</th>
                          <th className="p-4 text-center">direccion</th>
                          <th className="p-4 text-center">tipo_usuario</th>
                          <th className="p-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium text-white/80">
                        {users.map(u => (
                          <tr key={u.id}>
                            <td className="p-4 font-mono text-neon-blue">{u.id}</td>
                            <td className="p-4 text-white font-bold">{u.username}</td>
                            <td className="p-4 font-mono text-white/40">{u.email}</td>
                            <td className="p-4 text-center text-[10px] text-white/50 max-w-[8rem] truncate">{u.address || 'N/A'}</td>
                            <td className="p-4 text-center">
                              <span className="text-[8px] border border-white/10 px-2 py-0.5 rounded font-black uppercase tracking-wider">{u.role}</span>
                            </td>
                            <td className="p-4 text-right">
                              {u.id !== '1' && (
                                <button onClick={() => handleRowDelete('usuarios', u.id)} className="text-white/20 hover:text-red-400 p-1 rounded hover:bg-white/5"><Trash2 size={13} /></button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeDBTable === 'pedidos' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-[9px] font-black uppercase tracking-wider text-white/30 border-b border-white/5">
                        <tr>
                          <th className="p-4">id_pedido</th>
                          <th className="p-4">FK id_usuario</th>
                          <th className="p-4">fecha_pedido</th>
                          <th className="p-4">estado_pedido</th>
                          <th className="p-4">metodo_pago</th>
                          <th className="p-4 text-right">total</th>
                          <th className="p-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium text-white/80">
                        {pedidos.map(o => (
                          <tr key={o.id_pedido}>
                            <td className="p-4 font-mono text-neon-blue">{o.id_pedido}</td>
                            <td className="p-4 font-mono text-white/40">{o.id_usuario}</td>
                            <td className="p-4 font-mono">{o.fecha_pedido}</td>
                            <td className="p-4 uppercase text-[9px] font-black"><span className="text-neon-yellow">●</span> {o.estado_pedido}</td>
                            <td className="p-4 text-white/40 text-[10px]">{o.metodo_pago}</td>
                            <td className="p-4 text-right font-mono text-neon-green font-black">${o.total.toFixed(2)}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleRowDelete('pedidos', o.id_pedido)} className="text-white/20 hover:text-red-400 p-1 rounded hover:bg-white/5"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeDBTable === 'detalle' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-[9px] font-black uppercase tracking-wider text-white/30 border-b border-white/5">
                        <tr>
                          <th className="p-4">id_detalle</th>
                          <th className="p-4">FK id_pedido</th>
                          <th className="p-4">FK id_producto</th>
                          <th className="p-4">nombre_producto</th>
                          <th className="p-4 text-center">cantidad</th>
                          <th className="p-4 text-right">subtotal</th>
                          <th className="p-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium text-white/80">
                        {detallePedidos.map((dp, i) => (
                          <tr key={dp.id_detalle || i}>
                            <td className="p-4 font-mono text-neon-blue">{dp.id_detalle || `D${i+1}`}</td>
                            <td className="p-4 font-mono text-white/40">{dp.id_pedido}</td>
                            <td className="p-4 font-mono text-neon-yellow">{dp.id_producto}</td>
                            <td className="p-4 font-bold">{dp.nombre_producto}</td>
                            <td className="p-4 text-center font-mono">{dp.cantidad}</td>
                            <td className="p-4 text-right font-mono text-neon-green font-black">${dp.subtotal.toFixed(2)}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleRowDelete('detalle', dp.id_detalle || `D${i+1}`)} className="text-white/20 hover:text-red-400 p-1 rounded hover:bg-white/5"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeDBTable === 'inventarios' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-[9px] font-black uppercase tracking-wider text-white/30 border-b border-white/5">
                        <tr>
                          <th className="p-4">id_inventario</th>
                          <th className="p-4">FK id_producto</th>
                          <th className="p-4">cantidad_actual</th>
                          <th className="p-4 text-center">stock_minimo</th>
                          <th className="p-4 text-center">proveedor</th>
                          <th className="p-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium text-white/80">
                        {inventario.map(inv => (
                          <tr key={inv.id_inventario}>
                            <td className="p-4 font-mono text-neon-blue">{inv.id_inventario}</td>
                            <td className="p-4 font-mono text-white/50">{inv.id_producto}</td>
                            <td className="p-4 font-mono text-neon-green font-bold">{inv.cantidad_actual}</td>
                            <td className="p-4 text-center font-mono">{inv.stock_minimo}</td>
                            <td className="p-4 text-center text-white/40">{inv.proveedor}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleRowDelete('inventarios', inv.id_inventario)} className="text-white/20 hover:text-red-400 p-1 rounded hover:bg-white/5"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeDBTable === 'ventas' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-[9px] font-black uppercase tracking-wider text-white/30 border-b border-white/5">
                        <tr>
                          <th className="p-4">id_venta (PK)</th>
                          <th className="p-4">FK id_pedido</th>
                          <th className="p-4">fecha</th>
                          <th className="p-4 text-right">total</th>
                          <th className="p-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium text-white/80">
                        {ventas.map(v => (
                          <tr key={v.id_venta}>
                            <td className="p-4 font-mono text-neon-blue">{v.id_venta}</td>
                            <td className="p-4 font-mono text-white/40">{v.id_pedido}</td>
                            <td className="p-4 font-mono">{v.fecha}</td>
                            <td className="p-4 text-right font-mono text-neon-green font-black">${v.total.toFixed(2)}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleRowDelete('ventas', v.id_venta)} className="text-white/20 hover:text-red-400 p-1 rounded hover:bg-white/5"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
