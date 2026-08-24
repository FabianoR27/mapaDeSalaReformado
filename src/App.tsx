import React, { useState, useEffect } from 'react';
import { Usuario } from './types';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { SalasView } from './components/SalasView';
import { ProfessoresView } from './components/ProfessoresView';
import { TurmasView } from './components/TurmasView';
import { PeriodosView } from './components/PeriodosView';
import { MapaView } from './components/MapaView';
import { RelatorioView } from './components/RelatorioView';

export function App() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('mapadesala_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default authenticated state for seamless exploration
    return {
      codigo: 1,
      nome: 'Administrador FATEC',
      usuario: 'admin',
      email: 'admin@fatecsr.edu.br',
      status: ''
    };
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');

  const handleLoginSuccess = (user: Usuario) => {
    setCurrentUser(user);
    localStorage.setItem('mapadesala_user', JSON.stringify(user));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mapadesala_user');
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#121418] text-slate-100 flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentView === 'dashboard' && (
          <DashboardView onNavigate={setCurrentView} onLogout={handleLogout} />
        )}
        {currentView === 'salas' && <SalasView />}
        {currentView === 'professores' && <ProfessoresView />}
        {currentView === 'turmas' && <TurmasView />}
        {currentView === 'periodos' && <PeriodosView />}
        {currentView === 'mapa' && <MapaView />}
        {currentView === 'relatorio' && <RelatorioView />}
      </main>

      <footer className="py-6 border-t border-gray-800/80 text-center text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} FATEC São Roque • Sistema de Gestão de Mapa de Sala</span>
          <span className="text-gray-400">Ambiente Node.js migrado e operando em alta performance</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
