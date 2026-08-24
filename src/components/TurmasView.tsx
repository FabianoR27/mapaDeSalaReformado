import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { alerts } from '../lib/alerts';
import { Turma } from '../types';
import { Plus, Search, Edit2, Trash2, GraduationCap, Users, Calendar, RefreshCw } from 'lucide-react';

export const TurmasView: React.FC = () => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Forms
  const [descricao, setDescricao] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [dataInicio, setDataInicio] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [editDescricao, setEditDescricao] = useState('');
  const [editCapacidade, setEditCapacidade] = useState('');
  const [editDataInicio, setEditDataInicio] = useState('');

  const loadTurmas = async () => {
    setLoading(true);
    try {
      const res = await api.consultarTurmas();
      if (res.dados) {
        setTurmas(res.dados);
      } else {
        setTurmas([]);
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao carregar turmas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTurmas();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || !capacidade || !dataInicio) {
      alerts.warning('Campos Obrigatórios', 'Preencha a descrição, capacidade e data de início da turma.');
      return;
    }

    try {
      const res = await api.inserirTurma({
        descricao: descricao.trim(),
        capacidade: Number(capacidade),
        dataInicio
      });

      if (res.sucesso) {
        alerts.success('Sucesso!', res.msg || 'Turma cadastrada com sucesso.');
        setIsCreateOpen(false);
        setDescricao('');
        setCapacidade('');
        setDataInicio('');
        loadTurmas();
      } else {
        alerts.error('Erro ao cadastrar', res.erros?.[0]?.msg || res.msg || 'Não foi possível cadastrar a turma.');
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao conectar com o servidor.');
    }
  };

  const openEditModal = (turma: Turma) => {
    setEditId(turma.codigo);
    setEditDescricao(turma.descricao);
    setEditCapacidade(String(turma.capacidade));
    setEditDataInicio(turma.dataInicio || turma.dt_inicio || '');
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editDescricao.trim() || !editCapacidade || !editDataInicio) {
      alerts.warning('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const res = await api.alterarTurma({
        codigo: editId,
        descricao: editDescricao.trim(),
        capacidade: Number(editCapacidade),
        dataInicio: editDataInicio
      });

      if (res.sucesso) {
        alerts.success('Atualizado!', res.msg || 'Turma atualizada com sucesso.');
        setIsEditOpen(false);
        loadTurmas();
      } else {
        alerts.error('Erro', res.erros?.[0]?.msg || res.msg || 'Não foi possível atualizar a turma.');
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao conectar com o servidor.');
    }
  };

  const handleDeactivate = async (turma: Turma) => {
    const confirmed = await alerts.confirm(
      'Desativar Turma',
      `Tem certeza que deseja desativar a turma "${turma.descricao}"?`
    );

    if (confirmed) {
      try {
        const res = await api.desativarTurma(turma.codigo);
        if (res.sucesso) {
          alerts.success('Desativada!', 'Turma desativada com sucesso.');
          loadTurmas();
        } else {
          alerts.error('Erro', res.erros?.[0]?.msg || res.msg || 'Não foi possível desativar a turma.');
        }
      } catch (err) {
        alerts.error('Erro', 'Falha ao conectar com o servidor.');
      }
    }
  };

  const filteredTurmas = turmas.filter((t) => {
    const term = searchTerm.toLowerCase();
    const dateStr = t.dataIniciobra || t.dataInicio || '';
    return (
      String(t.codigo).includes(term) ||
      t.descricao.toLowerCase().includes(term) ||
      String(t.capacidade).includes(term) ||
      dateStr.includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-yellow-500/20 text-yellow-400 rounded-xl">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Turmas e Cursos</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Gerencie os cursos, turmas acadêmicas e limites de matrículas.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-[#181c22] p-2.5 rounded-2xl border border-gray-800 shadow-md">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar turma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-400 min-h-[44px]"
            />
          </div>
          <button
            id="btn-cadastrar-turma"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold rounded-xl text-sm transition min-h-[44px] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Turma</span>
          </button>
        </div>
      </div>

      {/* Mobile Card List View (< 640px) */}
      <div className="block sm:hidden space-y-3">
        {loading ? (
          <div className="bg-[#181c22] border border-gray-800 rounded-2xl p-8 text-center text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-yellow-400" />
            <span>Carregando turmas...</span>
          </div>
        ) : filteredTurmas.length === 0 ? (
          <div className="bg-[#181c22] border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
            Nenhuma turma encontrada.
          </div>
        ) : (
          filteredTurmas.map((turma) => (
            <div
              key={turma.codigo}
              className="bg-[#181c22] border border-gray-800 rounded-2xl p-4 shadow-lg space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="px-2.5 py-1 bg-yellow-500 text-gray-950 font-bold rounded-lg text-sm shrink-0">
                  #{turma.codigo}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white text-base leading-snug">{turma.descricao}</h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-300">
                  <Users className="w-3.5 h-3.5 text-yellow-400" />
                  {turma.capacidade} alunos
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-300 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {turma.dataIniciobra || turma.dataInicio || turma.dt_inicio}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(turma)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-gray-950 border border-yellow-500/30 rounded-xl text-xs font-semibold min-h-[40px] transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDeactivate(turma)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-semibold min-h-[40px] transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Desativar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden sm:block bg-[#181c22] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#13161c] border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Código</th>
                <th className="py-3.5 px-6">Descrição da Turma / Curso</th>
                <th className="py-3.5 px-6">Capacidade</th>
                <th className="py-3.5 px-6">Data de Início</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Carregando turmas...
                  </td>
                </tr>
              ) : filteredTurmas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Nenhuma turma encontrada.
                  </td>
                </tr>
              ) : (
                filteredTurmas.map((turma) => (
                  <tr key={turma.codigo} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-800 border border-gray-700 text-yellow-400">
                        {turma.codigo}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-100">{turma.descricao}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-gray-300">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {turma.capacidade} alunos
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800/80 border border-gray-700 text-xs font-medium text-gray-300">
                        <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                        {turma.dataIniciobra || turma.dataInicio || turma.dt_inicio}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(turma)}
                          className="p-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-gray-950 rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="Editar Turma"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(turma)}
                          className="p-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="Desativar Turma"
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

      {/* Modal Criar Turma */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold shrink-0">
              <h3 className="text-base sm:text-lg">Cadastrar Nova Turma</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-950 hover:opacity-75 text-xl font-bold p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Descrição / Nome da Turma</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: DSM 1º Semestre"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Capacidade de Alunos</label>
                  <input
                    type="number"
                    value={capacidade}
                    onChange={(e) => setCapacidade(e.target.value)}
                    placeholder="Ex: 40"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold rounded-xl text-sm min-h-[44px]"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Turma */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold shrink-0">
              <h3 className="text-base sm:text-lg">Editar Turma #{editId}</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-950 hover:opacity-75 text-xl font-bold p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Descrição</label>
                <input
                  type="text"
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Capacidade</label>
                  <input
                    type="number"
                    value={editCapacidade}
                    onChange={(e) => setEditCapacidade(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={editDataInicio}
                    onChange={(e) => setEditDataInicio(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold rounded-xl text-sm min-h-[44px]"
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
