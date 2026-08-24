import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { alerts } from '../lib/alerts';
import { Horario } from '../types';
import { Plus, Search, Edit2, Trash2, Clock, RefreshCw } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-yellow-500/20 text-yellow-400 rounded-xl">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Períodos e Turnos</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Definição dos blocos de horários de aulas e intervalos da faculdade.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-[#181c22] p-2.5 rounded-2xl border border-gray-800 shadow-md">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar período..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-400 min-h-[44px]"
            />
          </div>
          <button
            id="btn-cadastrar-periodo"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold rounded-xl text-sm transition min-h-[44px] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Período</span>
          </button>
        </div>
      </div>

      {/* Mobile Card List View (< 640px) */}
      <div className="block sm:hidden space-y-3">
        {loading ? (
          <div className="bg-[#181c22] border border-gray-800 rounded-2xl p-8 text-center text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-yellow-400" />
            <span>Carregando períodos...</span>
          </div>
        ) : filteredHorarios.length === 0 ? (
          <div className="bg-[#181c22] border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
            Nenhum período encontrado.
          </div>
        ) : (
          filteredHorarios.map((horario) => (
            <div
              key={horario.codigo}
              className="bg-[#181c22] border border-gray-800 rounded-2xl p-4 shadow-lg space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="px-2.5 py-1 bg-yellow-500 text-gray-950 font-bold rounded-lg text-sm shrink-0">
                  #{horario.codigo}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white text-base leading-snug">{horario.descricao}</h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800/90 border border-gray-700 font-mono text-emerald-400">
                  <Clock className="w-3.5 h-3.5" />
                  Início: {horario.hora_ini || horario.hora_inicial.substring(0, 5)}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800/90 border border-gray-700 font-mono text-blue-400">
                  <Clock className="w-3.5 h-3.5" />
                  Fim: {horario.hora_fim || horario.hora_final.substring(0, 5)}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(horario)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-gray-950 border border-yellow-500/30 rounded-xl text-xs font-semibold min-h-[40px] transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDeactivate(horario)}
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

      {/* Desktop / Tablet Table View */}
      <div className="hidden sm:block bg-[#181c22] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
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
                          className="p-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-gray-950 rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="Editar Período"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(horario)}
                          className="p-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center"
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

      {/* Modal Criar Período */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold shrink-0">
              <h3 className="text-base sm:text-lg">Cadastrar Novo Período</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-950 hover:opacity-75 text-xl font-bold p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Descrição do Período / Turno</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Manhã (1º Bloco)"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Horário Inicial</label>
                  <input
                    type="time"
                    value={horaIni}
                    onChange={(e) => setHoraIni(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Horário Final</label>
                  <input
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
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

      {/* Modal Editar Período */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold shrink-0">
              <h3 className="text-base sm:text-lg">Editar Período #{editId}</h3>
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
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Horário Inicial</label>
                  <input
                    type="time"
                    value={editHoraIni}
                    onChange={(e) => setEditHoraIni(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Horário Final</label>
                  <input
                    type="time"
                    value={editHoraFim}
                    onChange={(e) => setEditHoraFim(e.target.value)}
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
