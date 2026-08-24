import React, { useState } from 'react';
import { Usuario } from '../types';
import { LayoutDashboard, DoorOpen, Users, GraduationCap, Clock, CalendarRange, FileText, LogOut, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: Usuario | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, currentUser, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'salas', label: 'Salas', icon: DoorOpen },
    { id: 'professores', label: 'Docentes', icon: Users },
    { id: 'turmas', label: 'Turmas', icon: GraduationCap },
    { id: 'periodos', label: 'Períodos', icon: Clock },
    { id: 'mapa', label: 'Reservas', icon: CalendarRange },
    { id: 'relatorio', label: 'Relatórios', icon: FileText },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#181c22] border-b border-gray-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none py-1"
            onClick={() => handleNavClick('dashboard')}
          >
            <img 
              src="/assets/img/logo_fatecSR.png" 
              alt="FATEC São Roque" 
              className="h-9 sm:h-10 w-auto object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">FATEC São Roque</h1>
              <p className="text-[11px] sm:text-xs text-yellow-400 font-medium -mt-1 truncate">Mapa de Salas</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-yellow-500 text-gray-950 shadow-sm font-semibold'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User & Logout & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 text-right">
                <div className="text-right">
                  <span className="block text-[10px] text-gray-400 leading-tight">Conectado como</span>
                  <span className="block text-xs font-semibold text-gray-200 truncate max-w-[130px]">
                    {currentUser.nome || currentUser.usuario}
                  </span>
                </div>
              </div>
            )}

            <button
              id="logout-btn"
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-800 text-red-300 hover:text-white border border-red-800/80 rounded-lg text-xs font-medium transition-colors min-h-[38px]"
              title="Sair do Sistema"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sair</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-200 hover:text-yellow-400 border border-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center transition"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Quick-Scroll Bar (visible when menu collapsed on tablet/mobile) */}
      <div className="lg:hidden flex overflow-x-auto py-2 px-3 space-x-1.5 bg-[#12151a] border-t border-gray-800/80 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap min-h-[38px] transition ${
                isActive
                  ? 'bg-yellow-500 text-gray-950 font-bold shadow-sm'
                  : 'text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Drawer / Expanded Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#161a20] border-b border-gray-800 px-4 pt-3 pb-5 shadow-2xl space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-3 rounded-xl text-xs font-medium transition min-h-[44px] ${
                    isActive
                      ? 'bg-yellow-500 text-gray-950 font-bold shadow-sm'
                      : 'bg-gray-800/90 text-gray-200 hover:bg-gray-700 border border-gray-750'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-yellow-400" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User info & Logout on Mobile */}
          <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
            {currentUser && (
              <div className="text-left">
                <span className="block text-[10px] text-gray-400">Usuário Conectado</span>
                <span className="block text-xs font-bold text-gray-200 truncate max-w-[180px]">
                  {currentUser.nome || currentUser.usuario}
                </span>
              </div>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition min-h-[40px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
