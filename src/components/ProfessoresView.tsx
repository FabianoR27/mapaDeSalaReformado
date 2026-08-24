import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { alerts } from '../lib/alerts';
import { Professor } from '../types';
import { Plus, Search, Edit2, Trash2, Users, CreditCard, Award } from 'lucide-react';

export const ProfessoresView: React.FC = () => {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Forms
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [tipo, setTipo] = useState<'F' | 'C'>('F');

  const [editId, setEditId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editTipo, setEditTipo] = useState<'F' | 'C'>('F');

  const loadProfessores = async () => {
    setLoading(true);
    try {
      const res = await api.consultarProfessores();
      if (res.dados) {
        setProfessores(res.dados);
      } else {
        setProfessores([]);
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao carregar docentes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfessores();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cpf.trim() || !tipo) {
      alerts.warning('Campos Obrigatórios', 'Preencha o nome, CPF e o tipo do docente.');
      return;
    }

    try {
      const res = await api.inserirProfessor({
        nome: nome.trim(),
        cpf: cpf.trim(),
        tipo
      });

      if (res.sucesso) {
        alerts.success('Sucesso!', res.msg || 'Docente cadastrado com sucesso.');
        setIsCreateOpen(false);
        setNome('');
        setCpf('');
        setTipo('F');
        loadProfessores();
      } else {
        alerts.error('Erro ao cadastrar', res.erros?.[0]?.msg || res.msg || 'Não foi possível cadastrar o docente.');
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao conectar com o servidor.');
    }
  };

  const openEditModal = (prof: Professor) => {
    setEditId(prof.codigo);
    setEditNome(prof.nome);
    setEditCpf(prof.cpf);
    setEditTipo(prof.tipo);
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editNome.trim() || !editCpf.trim()) {
      alerts.warning('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const res = await api.alterarProfessor({
        codigo: editId,
        nome: editNome.trim(),
        cpf: editCpf.trim(),
        tipo: editTipo
      });

      if (res.sucesso) {
        alerts.success('Atualizado!', res.msg || 'Docente atualizado com sucesso.');
        setIsEditOpen(false);
        loadProfessores();
      } else {
        alerts.error('Erro', res.erros?.[0]?.msg || res.msg || 'Não foi possível atualizar o docente.');
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao conectar com o servidor.');
    }
  };

  const handleDeactivate = async (prof: Professor) => {
    const confirmed = await alerts.confirm(
      'Desativar Docente',
      `Tem certeza que deseja desativar o(a) docente "${prof.nome}"?`
    );

    if (confirmed) {
      try {
        const res = await api.desativarProfessor(prof.codigo);
        if (res.sucesso) {
          alerts.success('Desativado!', 'Docente desativado com sucesso.');
          loadProfessores();
        } else {
          alerts.error('Erro', res.erros?.[0]?.msg || res.msg || 'Não foi possível desativar o docente.');
        }
      } catch (err) {
        alerts.error('Erro', 'Falha ao conectar com o servidor.');
      }
    }
  };

  const formatCpf = (v: string) => {
    const nums = v.replace(/\D/g, '');
    if (nums.length <= 11) {
      return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return v;
  };

  const filteredProfessores = professores.filter((p) => {
    const term = searchTerm.toLowerCase();
    const tipoLabel = p.tipo === 'F' ? 'Funcionário' : 'Carta Convite';
    return (
      p.nome.toLowerCase().includes(term) ||
      p.cpf.includes(term) ||
      tipoLabel.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/20 text-yellow-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Corpo Docente</h2>
          </div>
          <p className="text-sm text-gray-400 mt-1">Cadastro e controle de professores e convidados da instituição.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[#181c22] p-2 rounded-xl border border-gray-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar docente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-400 w-48 sm:w-64"
            />
          </div>
          <button
            id="btn-cadastrar-professor"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-semibold rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Docente</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#181c22] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#13161c] border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Nome do Docente</th>
                <th className="py-3.5 px-6">CPF</th>
                <th className="py-3.5 px-6">Tipo / Vínculo</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    Carregando docentes...
                  </td>
                </tr>
              ) : filteredProfessores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    Nenhum docente encontrado.
                  </td>
                </tr>
              ) : (
                filteredProfessores.map((prof) => (
                  <tr key={prof.codigo} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center text-xs">
                          {prof.nome.charAt(0).toUpperCase()}
                        </div>
                        <span>{prof.nome}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300 font-mono text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800 border border-gray-700">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                        {formatCpf(prof.cpf)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {prof.tipo === 'F' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                          <Award className="w-3 h-3" />
                          Funcionário
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/60 border border-amber-800 text-amber-300">
                          <Award className="w-3 h-3" />
                          Carta Convite
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(prof)}
                          className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-gray-950 rounded-lg transition"
                          title="Editar Docente"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(prof)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition"
                          title="Desativar Docente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold">
              <h3>Cadastrar Novo Docente</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-950 hover:opacity-75 text-lg font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Prof. Dr. João Silva"
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">CPF (apenas números)</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="12345678901"
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Tipo de Vínculo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as 'F' | 'C')}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="F">Funcionário</option>
                    <option value="C">Carta Convite</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold rounded-lg text-sm"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold">
              <h3>Editar Docente #{editId}</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-950 hover:opacity-75 text-lg font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">CPF</label>
                  <input
                    type="text"
                    value={editCpf}
                    onChange={(e) => setEditCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Tipo</label>
                  <select
                    value={editTipo}
                    onChange={(e) => setEditTipo(e.target.value as 'F' | 'C')}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="F">Funcionário</option>
                    <option value="C">Carta Convite</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold rounded-lg text-sm"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
