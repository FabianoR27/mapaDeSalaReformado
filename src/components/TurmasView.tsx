import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { alerts } from '../lib/alerts';
import { Turma } from '../types';
import { Plus, Search, Edit2, Trash2, GraduationCap, Users, Calendar } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/20 text-yellow-400 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Turmas e Cursos</h2>
          </div>
          <p className="text-sm text-gray-400 mt-1">Gerencie os cursos, turmas acadêmicas e limites de matrículas.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[#181c22] p-2 rounded-xl border border-gray-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar turma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-400 w-48 sm:w-64"
            />
          </div>
          <button
            id="btn-cadastrar-turma"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-semibold rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Turma</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#181c22] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
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
                          className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-gray-950 rounded-lg transition"
                          title="Editar Turma"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(turma)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition"
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

      {/* Modal Cadastro */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold">
              <h3>Cadastrar Nova Turma</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-950 hover:opacity-75 text-lg font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Descrição / Curso</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: DSM - 1º Semestre"
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Capacidade (alunos)</label>
                  <input
                    type="number"
                    value={capacidade}
                    onChange={(e) => setCapacidade(e.target.value)}
                    placeholder="Ex: 40"
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  />
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
              <h3>Editar Turma #{editId}</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-950 hover:opacity-75 text-lg font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Descrição</label>
                <input
                  type="text"
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Capacidade</label>
                  <input
                    type="number"
                    value={editCapacidade}
                    onChange={(e) => setEditCapacidade(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={editDataInicio}
                    onChange={(e) => setEditDataInicio(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  />
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
