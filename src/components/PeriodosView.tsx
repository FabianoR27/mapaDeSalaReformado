import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { alerts } from '../lib/alerts';
import { Horario } from '../types';
import { Plus, Search, Edit2, Trash2, Clock } from 'lucide-react';

export const PeriodosView: React.FC = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Forms
  const [descricao, setDescricao] = useState('');
  const [horaIni, setHoraIni] = useState('');
  const [horaFim, setHoraFim] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [editDescricao, setEditDescricao] = useState('');
  const [editHoraIni, setEditHoraIni] = useState('');
  const [editHoraFim, setEditHoraFim] = useState('');

  const loadHorarios = async () => {
    setLoading(true);
    try {
      const res = await api.consultarHorarios();
      if (res.dados) {
        setHorarios(res.dados);
      } else {
        setHorarios([]);
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao carregar horários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHorarios();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || !horaIni || !horaFim) {
      alerts.warning('Campos Obrigatórios', 'Preencha a descrição, horário inicial e horário final.');
      return;
    }

    try {
      const res = await api.inserirHorario({
        descricao: descricao.trim(),
        horaInicial: horaIni,
        horaFinal: horaFim
      });

      if (res.sucesso) {
        alerts.success('Sucesso!', res.msg || 'Período cadastrado com sucesso.');
        setIsCreateOpen(false);
        setDescricao('');
        setHoraIni('');
        setHoraFim('');
        loadHorarios();
      } else {
        alerts.error('Erro ao cadastrar', res.erros?.[0]?.msg || res.msg || 'Não foi possível cadastrar o período.');
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao conectar com o servidor.');
    }
  };

  const openEditModal = (horario: Horario) => {
    setEditId(horario.codigo);
    setEditDescricao(horario.descricao);
    setEditHoraIni(horario.hora_ini || horario.hora_inicial.substring(0, 5));
    setEditHoraFim(horario.hora_fim || horario.hora_final.substring(0, 5));
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editDescricao.trim() || !editHoraIni || !editHoraFim) {
      alerts.warning('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const res = await api.alterarHorario({
        codigo: editId,
        descricao: editDescricao.trim(),
        horaInicial: editHoraIni,
        horaFinal: editHoraFim
      });

      if (res.sucesso) {
        alerts.success('Atualizado!', res.msg || 'Período atualizado com sucesso.');
        setIsEditOpen(false);
        loadHorarios();
      } else {
        alerts.error('Erro', res.erros?.[0]?.msg || res.msg || 'Não foi possível atualizar o período.');
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao conectar com o servidor.');
    }
  };

  const handleDeactivate = async (horario: Horario) => {
    const confirmed = await alerts.confirm(
      'Desativar Período',
      `Tem certeza que deseja desativar o período "${horario.descricao}"?`
    );

    if (confirmed) {
      try {
        const res = await api.desativarHorario(horario.codigo);
        if (res.sucesso) {
          alerts.success('Desativado!', 'Período desativado com sucesso.');
          loadHorarios();
        } else {
          alerts.error('Erro', res.erros?.[0]?.msg || res.msg || 'Não foi possível desativar o período.');
        }
      } catch (err) {
        alerts.error('Erro', 'Falha ao conectar com o servidor.');
      }
    }
  };

  const filteredHorarios = horarios.filter((h) => {
    const term = searchTerm.toLowerCase();
    return (
      String(h.codigo).includes(term) ||
      h.descricao.toLowerCase().includes(term) ||
      (h.hora_ini && h.hora_ini.includes(term)) ||
      (h.hora_fim && h.hora_fim.includes(term)) ||
      h.hora_inicial.includes(term) ||
      h.hora_final.includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/20 text-yellow-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Períodos e Turnos</h2>
          </div>
          <p className="text-sm text-gray-400 mt-1">Definição dos blocos de horários de aulas e intervalos da faculdade.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[#181c22] p-2 rounded-xl border border-gray-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar período..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-400 w-48 sm:w-64"
            />
          </div>
          <button
            id="btn-cadastrar-periodo"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-semibold rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Período</span>
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
                <th className="py-3.5 px-6">Descrição do Período</th>
                <th className="py-3.5 px-6">Horário Inicial</th>
                <th className="py-3.5 px-6">Horário Final</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Carregando períodos...
                  </td>
                </tr>
              ) : filteredHorarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Nenhum período encontrado.
                  </td>
                </tr>
              ) : (
                filteredHorarios.map((horario) => (
                  <tr key={horario.codigo} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-800 border border-gray-700 text-yellow-400">
                        {horario.codigo}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-100">{horario.descricao}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800/80 border border-gray-700 text-xs font-mono font-medium text-emerald-400">
                        <Clock className="w-3.5 h-3.5" />
                        {horario.hora_ini || horario.hora_inicial.substring(0, 5)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800/80 border border-gray-700 text-xs font-mono font-medium text-blue-400">
                        <Clock className="w-3.5 h-3.5" />
                        {horario.hora_fim || horario.hora_final.substring(0, 5)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(horario)}
                          className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-gray-950 rounded-lg transition"
                          title="Editar Período"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(horario)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition"
                          title="Desativar Período"
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
              <h3>Cadastrar Novo Período</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-950 hover:opacity-75 text-lg font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Descrição</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Manhã (07:40 - 11:20)"
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Horário Inicial</label>
                  <input
                    type="time"
                    value={horaIni}
                    onChange={(e) => setHoraIni(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Horário Final</label>
                  <input
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
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
              <h3>Editar Período #{editId}</h3>
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
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Horário Inicial</label>
                  <input
                    type="time"
                    value={editHoraIni}
                    onChange={(e) => setEditHoraIni(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Horário Final</label>
                  <input
                    type="time"
                    value={editHoraFim}
                    onChange={(e) => setEditHoraFim(e.target.value)}
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
