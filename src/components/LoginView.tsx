import React, { useState } from 'react';
import { api } from '../lib/api';
import { alerts } from '../lib/alerts';
import { Usuario } from '../types';
import { Lock, User, LogIn, KeyRound, Sparkles } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

interface LoginViewProps {
  onLoginSuccess: (user: Usuario) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('admin');
  const [senha, setSenha] = useState('123');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
          status: 'A'
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Sync user with Cloud SQL backend
      const res = await fetch('/Usuario/sync-firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0] || 'Usuário FATEC'
        })
      });
      const data = await res.json();

      alerts.success('Autenticado!', `Bem-vindo(a), ${user.displayName || user.email}!`);
      onLoginSuccess({
        codigo: data.usuario?.id || 1,
        nome: user.displayName || 'Usuário FATEC',
        usuario: user.email || 'usuario',
        email: user.email || '',
        status: 'A'
      });
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      alerts.error('Falha na Autenticação', error.message || 'Erro ao conectar via Google.');
    } finally {
      setGoogleLoading(false);
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Cloud SQL (PostgreSQL us-east1) Ativo
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          id="btn-google-signin"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full mb-5 py-2.5 px-4 bg-gray-800 hover:bg-gray-700 active:bg-gray-800/90 text-white font-medium rounded-xl border border-gray-700 flex items-center justify-center gap-3 transition shadow-sm hover:border-gray-600 disabled:opacity-50"
        >
          {googleLoading ? (
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Entrar com Google</span>
            </>
          )}
        </button>

        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="flex-shrink mx-3 text-xs text-gray-500 uppercase">ou com credenciais</span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="mt-6 pt-5 border-t border-gray-800 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/80 border border-gray-800 text-xs text-gray-400">
            <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
            <span>Credenciais padrão: <strong className="text-gray-200">admin</strong> / <strong className="text-gray-200">123</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
