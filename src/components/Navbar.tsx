import React from 'react';
import { Usuario } from '../types';
import { LayoutDashboard, DoorOpen, Users, GraduationCap, Clock, CalendarRange, FileText, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: Usuario | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, currentUser, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'salas', label: 'Salas', icon: DoorOpen },
    { id: 'professores', label: 'Docentes', icon: Users },
    { id: 'turmas', label: 'Turmas', icon: GraduationCap },
    { id: 'periodos', label: 'Períodos', icon: Clock },
    { id: 'mapa', label: 'Reservas', icon: CalendarRange },
    { id: 'relatorio', label: 'Relatórios', icon: FileText },
  ];

  return (
    <header className="bg-[#181c22] border-b border-gray-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setCurrentView('dashboard')}
          >
            <img 
              src="/assets/img/logo_fatecSR.png" 
              alt="FATEC São Roque" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                // Fallback to text if image not loaded
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">FATEC São Roque</h1>
              <p className="text-xs text-yellow-400 font-medium -mt-1">Mapa de Salas</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-yellow-500 text-gray-950 shadow-sm font-semibold'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 text-right">
                <div>
                  <span className="block text-xs text-gray-400">Usuário</span>
                  <span className="block text-xs font-semibold text-gray-200 truncate max-w-[120px]">
                    {currentUser.nome || currentUser.usuario}
                  </span>
                </div>
              </div>
            )}
            <button
              id="logout-btn"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-800 text-red-300 hover:text-white border border-red-800/80 rounded-lg text-xs font-medium transition-colors"
              title="Sair do Sistema"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex overflow-x-auto py-2 px-3 space-x-2 bg-[#12151a] border-t border-gray-800 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs whitespace-nowrap ${
                isActive ? 'bg-yellow-500 text-gray-900 font-semibold' : 'text-gray-300 bg-gray-800/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
