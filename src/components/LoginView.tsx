import React, { useState } from 'react';
import { api } from '../lib/api';
import { alerts } from '../lib/alerts';
import { Usuario } from '../types';
import { Lock, User, LogIn, KeyRound } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: Usuario) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('admin');
  const [senha, setSenha] = useState('123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !senha.trim()) {
      alerts.warning('Campos Obrigatórios', 'Por favor, preencha o usuário e a senha.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(usuario, senha);
      if (res.sucesso) {
        alerts.success('Bem-vindo!', 'Login realizado com sucesso.');
        onLoginSuccess(res.usuario || {
          codigo: 1,
          nome: 'Administrador FATEC',
          usuario: usuario,
          email: 'admin@fatecsr.edu.br',
          status: ''
        });
      } else {
        const errorMsg = res.erros?.[0]?.msg || res.msg || 'Usuário ou senha incorretos.';
        alerts.error('Falha no Login', errorMsg);
      }
    } catch (err) {
      alerts.error('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-gray-900 to-[#0e1116]">
      <div className="w-full max-w-md bg-[#1a1f26] border border-gray-800/80 rounded-2xl shadow-2xl overflow-hidden p-8">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gray-800/80 rounded-2xl border border-gray-700/50 mb-4 shadow-inner">
            <img 
              src="/assets/img/logo_fatecSR.png" 
              alt="FATEC São Roque" 
              className="h-16 w-auto object-contain mx-auto"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">FATEC São Roque</h2>
          <p className="text-sm text-yellow-400 font-medium mt-1">Sistema de Gestão de Mapa de Sala</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Usuário
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="input-usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Informe seu usuário"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="input-senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Informe sua senha"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
              />
            </div>
          </div>

          <button
            id="btn-entrar"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-gray-950 font-bold rounded-xl shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent"></span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Acessar Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Tip */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/80 border border-gray-800 text-xs text-gray-400">
            <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
            <span>Credenciais padrão: <strong className="text-gray-200">admin</strong> / <strong className="text-gray-200">123</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
