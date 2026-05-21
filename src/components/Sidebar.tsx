import React from 'react';
import { 
  LayoutDashboard, 
  PackagePlus, 
  ShoppingCart, 
  Store, 
  Users, 
  Database, 
  LogOut, 
  LogIn
} from 'lucide-react';
import { motion } from 'motion/react';
import { Screen, User } from '../types';

interface SidebarProps {
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const Sidebar = ({ currentScreen, setScreen, currentUser, onLogout }: SidebarProps) => {
  const isAdmin = currentUser?.role === 'Administrador';
  const isMainAdmin = currentUser?.id === '1';
  const isEmployee = currentUser?.role === 'Empleado';
  const isCliente = currentUser?.role === 'Cliente';

  const menuItems = [
    { id: 'welcome', icon: LayoutDashboard, label: 'Inicio', color: 'text-neon-blue', visible: true },
    { id: 'register', icon: PackagePlus, label: 'Inventario', color: 'text-neon-yellow', visible: isAdmin || isMainAdmin || isEmployee },
    { id: 'sales', icon: ShoppingCart, label: 'Terminal Venta', color: 'text-neon-green', visible: isEmployee || isMainAdmin || isAdmin },
    { id: 'db', icon: Database, label: 'BD Abarrotes', color: 'text-neon-blue', visible: isAdmin || isMainAdmin || isEmployee },
    { id: 'users', icon: Users, label: 'Personal/Socios', color: 'text-neon-yellow', visible: isMainAdmin || isAdmin },
  ];

  return (
    <aside id="sidebar" className="fixed left-0 top-0 h-full w-20 md:w-64 bg-black/90 border-r border-white/10 flex flex-col z-50 p-6 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-10 justify-center md:justify-start">
        <div className="w-10 h-10 bg-transparent border-2 border-neon-blue rounded-xl flex items-center justify-center text-neon-blue font-bold text-xl glow-blue">
          <Store size={22} />
        </div>
        <span className="hidden md:block font-bold text-lg text-white tracking-widest text-glow-blue uppercase italic">Abarrotes Pro</span>
      </div>
      
      <nav className="flex flex-col gap-4 flex-1">
        {menuItems.filter(item => item.visible).map((item) => (
          <button
            key={item.id}
            id={`btn-nav-${item.id}`}
            onClick={() => setScreen(item.id as Screen)}
            className={`w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3.5 rounded-xl transition-all relative group ${
              currentScreen === item.id 
                ? `bg-white/5 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] text-white` 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={20} className={currentScreen === item.id ? item.color : 'group-hover:text-white transition-all'} />
            <span className={`hidden md:block text-xs font-bold tracking-wider ${currentScreen === item.id ? 'text-white' : ''}`}>{item.label}</span>
            {currentScreen === item.id && (
              <motion.div 
                layoutId="navGlow"
                className={`absolute -right-2 w-1.5 h-8 rounded-full blur-[2px] ${item.id === 'welcome' ? 'bg-neon-blue' : item.id === 'register' ? 'bg-neon-yellow' : 'bg-neon-green'}`}
              />
            )}
          </button>
        ))}
      </nav>
      
      <div className="mt-auto space-y-4">
        {currentUser ? (
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group">
              <div className="relative z-10 hidden md:block">
                <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em] mb-1 italic">Operador Activo</p>
                <p className={`text-xs font-black tracking-tighter truncate ${currentUser.role === 'Administrador' ? 'text-neon-yellow text-glow-yellow' : 'text-neon-blue text-glow-blue'}`}>
                  {currentUser.username}
                </p>
                <p className="text-[8px] text-white/20 font-bold uppercase mt-1 tracking-widest">{currentUser.role}</p>
                {currentUser.status === 'pending' && (
                  <div className="mt-2 text-center text-neon-yellow text-[8px] font-black uppercase tracking-wider bg-neon-yellow/10 border border-neon-yellow/30 px-2 py-1 rounded glow-yellow">
                    ⚠️ PENDIENTE APROBAR
                  </div>
                )}
              </div>
              <div className="md:hidden flex justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${currentUser.role === 'Administrador' ? 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/40' : 'bg-neon-blue/20 text-neon-blue border border-neon-blue/40'}`}>
                  {currentUser.username[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className={`absolute right-0 top-0 h-full w-1 ${currentUser.role === 'Administrador' ? 'bg-neon-yellow' : 'bg-neon-blue'} opacity-40`}></div>
            </div>

            <button 
              id="btn-logout"
              onClick={onLogout}
              className="w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3 rounded-xl transition-all text-white/40 hover:text-neon-yellow hover:bg-white/5 group border border-transparent hover:border-neon-yellow/20"
            >
              <LogOut size={18} className="group-hover:text-neon-yellow group-hover:scale-115 transition-transform" />
              <span className="hidden md:block text-[9px] font-black tracking-[0.2em] uppercase italic">Cerrar Sesión</span>
            </button>
          </div>
        ) : (
          <button 
            id="btn-login"
            onClick={() => setScreen('login')}
            className="w-full flex items-center justify-center md:justify-start gap-4 px-4 py-4 rounded-xl transition-all bg-white/10 border border-white/20 text-white shadow-lg shadow-neon-blue/10"
          >
            <LogIn size={20} className="text-neon-blue animate-pulse" />
            <span className="hidden md:block text-[10px] font-black tracking-[0.2em] uppercase italic">Ir a Validación</span>
          </button>
        )}
      </div>
    </aside>
  );
};
