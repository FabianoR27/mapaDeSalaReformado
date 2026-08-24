import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { alerts } from '../lib/alerts';
import { MapaReserva, Sala, Professor, Turma, Horario } from '../types';
import { Plus, Search, Edit2, Trash2, CalendarRange, CheckSquare, Square, Calendar, User, DoorOpen, Clock, GraduationCap, RefreshCw } from 'lucide-react';

export const MapaView: React.FC = () => {
  const [mapas, setMapas] = useState<MapaReserva[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Forms
  const todayStr = new Date().toISOString().split('T')[0];
  const [dataReserva, setDataReserva] = useState(todayStr);
  const [codSala, setCodSala] = useState('');
  const [codTurma, setCodTurma] = useState('');
  const [codProfessor, setCodProfessor] = useState('');
  const [codHorario, setCodHorario] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [editDataReserva, setEditDataReserva] = useState(todayStr);
  const [editCodSala, setEditCodSala] = useState('');
  const [editCodTurma, setEditCodTurma] = useState('');
  const [editCodProfessor, setEditCodProfessor] = useState('');
  const [editCodHorario, setEditCodHorario] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [resMapas, resSalas, resProfs, resTurmas, resHorarios] = await Promise.all([
        api.consultarMapas(),
        api.consultarSalas(),
        api.consultarProfessores(),
        api.consultarTurmas(),
        api.consultarHorarios()
      ]);

      if (resMapas.dados) setMapas(resMapas.dados);
      if (resSalas.dados) setSalas(resSalas.dados);
      if (resProfs.dados) setProfessores(resProfs.dados);
      if (resTurmas.dados) setTurmas(resTurmas.dados);
      if (resHorarios.dados) setHorarios(resHorarios.dados);
    } catch (err) {
      alerts.error('Erro', 'Falha ao carregar dados de reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMapas.length && filteredMapas.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMapas.map(m => m.codigo));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataReserva || !codSala || !codTurma || !codProfessor || !codHorario) {
      alerts.warning('Campos Obrigatórios', 'Preencha todos os campos da reserva.');
      return;
    }

    try {
      const res = await api.inserirMapa({
        dataReserva,
        codSala: Number(codSala),
        codTurma: Number(codTurma),
        codProfessor: Number(codProfessor),
        codHorario: Number(codHorario)
      });

      if (res.sucesso) {
        alerts.success('Sucesso!', res.msg || 'Reserva cadastrada com sucesso.');
        setIsCreateOpen(false);
        setCodSala('');
        setCodTurma('');
        setCodProfessor('');
        setCodHorario('');
        loadAllData();
      } else {
        alerts.error('Erro ao reservar', res.erros?.[0]?.msg || res.msg || 'Não foi possível cadastrar a reserva.');
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao conectar com o servidor.');
    }
  };

  const openEditModal = (mapa: MapaReserva) => {
    setEditId(mapa.codigo);
    setEditDataReserva(mapa.datareserva || mapa.dt_reserva || todayStr);
    setEditCodSala(String(mapa.sala || mapa.codigo_sala));
    setEditCodTurma(String(mapa.codigo_turma));
    setEditCodProfessor(String(mapa.codigo_professor));
    setEditCodHorario(String(mapa.codigo_horario));
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editDataReserva || !editCodSala || !editCodTurma || !editCodProfessor || !editCodHorario) {
      alerts.warning('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const res = await api.alterarMapa({
        codigo: editId,
        dataReserva: editDataReserva,
        codSala: Number(editCodSala),
        codTurma: Number(editCodTurma),
        codProfessor: Number(editCodProfessor),
        codHorario: Number(editCodHorario)
      });

      if (res.sucesso) {
        alerts.success('Atualizado!', res.msg || 'Reserva atualizada com sucesso.');
        setIsEditOpen(false);
        loadAllData();
      } else {
        alerts.error('Erro', res.erros?.[0]?.msg || res.msg || 'Não foi possível atualizar a reserva.');
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao conectar com o servidor.');
    }
  };

  const handleDeactivate = async (mapa: MapaReserva) => {
    const confirmed = await alerts.confirm(
      'Desativar Reserva',
      `Tem certeza que deseja remover a reserva da ${mapa.descsala} (${mapa.desturma})?`
    );

    if (confirmed) {
      try {
        const res = await api.desativarMapa(mapa.codigo);
        if (res.sucesso) {
          alerts.success('Removida!', 'Reserva desativada com sucesso.');
          loadAllData();
        } else {
          alerts.error('Erro', res.erros?.[0]?.msg || res.msg || 'Não foi possível desativar a reserva.');
        }
      } catch (err) {
        alerts.error('Erro', 'Falha ao conectar com o servidor.');
      }
    }
  };

  const handleDeactivateSelected = async () => {
    if (selectedIds.length === 0) {
      alerts.warning('Nenhum selecionado', 'Selecione ao menos uma reserva para excluir.');
      return;
    }

    const confirmed = await alerts.confirm(
      'Excluir Selecionadas',
      `Deseja realmente desativar as ${selectedIds.length} reservas selecionadas?`
    );

    if (confirmed) {
      try {
        const res = await api.desativarMultiplosMapas(selectedIds);
        if (res.sucesso) {
          alerts.success('Excluídas!', res.msg || 'Reservas selecionadas foram desativadas.');
          setSelectedIds([]);
          loadAllData();
        } else {
          alerts.error('Erro', res.erros?.[0]?.msg || res.msg || 'Não foi possível desativar as reservas.');
        }
      } catch (err) {
        alerts.error('Erro', 'Falha ao conectar com o servidor.');
      }
    }
  };

  const formatDateBR = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const filteredMapas = mapas.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      (m.descsala && m.descsala.toLowerCase().includes(term)) ||
      (m.desturma && m.desturma.toLowerCase().includes(term)) ||
      (m.nome_professor && m.nome_professor.toLowerCase().includes(term)) ||
      (m.deshorario && m.deshorario.toLowerCase().includes(term)) ||
      (m.datareserva && m.datareserva.includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-yellow-500/20 text-yellow-400 rounded-xl">
              <CalendarRange className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Reservas e Mapeamento</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Alocação de salas para turmas, períodos e docentes com prevenção de conflitos.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-[#181c22] p-2.5 rounded-2xl border border-gray-800 shadow-md">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar reserva..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-400 min-h-[44px]"
            />
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeactivateSelected}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir ({selectedIds.length})</span>
            </button>
          )}
          <button
            id="btn-cadastrar-reserva"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold rounded-xl text-sm transition min-h-[44px] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Reserva</span>
          </button>
        </div>
      </div>

      {/* Mobile Selection & Action Bar */}
      <div className="sm:hidden flex items-center justify-between bg-[#181c22] px-4 py-3 rounded-xl border border-gray-800 mb-3">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 text-xs font-semibold text-gray-300"
        >
          {selectedIds.length === filteredMapas.length && filteredMapas.length > 0 ? (
            <CheckSquare className="w-4 h-4 text-yellow-400" />
          ) : (
            <Square className="w-4 h-4 text-gray-500" />
          )}
          <span>{selectedIds.length === filteredMapas.length && filteredMapas.length > 0 ? 'Desmarcar Todos' : 'Selecionar Todos'}</span>
        </button>
        <span className="text-xs text-gray-400">{filteredMapas.length} reservas</span>
      </div>

      {/* Mobile Card List View (< 640px) */}
      <div className="block sm:hidden space-y-3">
        {loading ? (
          <div className="bg-[#181c22] border border-gray-800 rounded-2xl p-8 text-center text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-yellow-400" />
            <span>Carregando reservas...</span>
          </div>
        ) : filteredMapas.length === 0 ? (
          <div className="bg-[#181c22] border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
            Nenhuma reserva encontrada.
          </div>
        ) : (
          filteredMapas.map((mapa) => {
            const isSelected = selectedIds.includes(mapa.codigo);
            return (
              <div
                key={mapa.codigo}
                className={`border rounded-2xl p-4 shadow-lg space-y-3 transition ${
                  isSelected ? 'bg-yellow-950/20 border-yellow-500/50' : 'bg-[#181c22] border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleSelect(mapa.codigo)}
                      className="p-1 text-gray-400 hover:text-yellow-400"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-yellow-500 text-gray-950 font-bold rounded text-xs">
                          {mapa.sala || mapa.codigo_sala}
                        </span>
                        <span className="font-bold text-white text-sm">{mapa.descsala}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-yellow-400 px-2 py-0.5 bg-gray-900 rounded border border-gray-750">
                    {formatDateBR(mapa.datareserva)}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-300">
                  <div className="flex items-center gap-1.5 text-gray-200 font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span>{mapa.desturma}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{mapa.nome_professor}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-300 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{mapa.deshorario} ({mapa.hora_inicial} - {mapa.hora_final})</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(mapa)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-gray-950 border border-yellow-500/30 rounded-xl text-xs font-semibold min-h-[40px] transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeactivate(mapa)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-semibold min-h-[40px] transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="hidden sm:block bg-[#181c22] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#13161c] border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">
                  <button onClick={handleSelectAll} className="text-gray-400 hover:text-yellow-400">
                    {selectedIds.length === filteredMapas.length && filteredMapas.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Data</th>
                <th className="py-3.5 px-4">Sala</th>
                <th className="py-3.5 px-4">Turma / Curso</th>
                <th className="py-3.5 px-4">Docente</th>
                <th className="py-3.5 px-4">Período / Horário</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Carregando mapa de reservas...
                  </td>
                </tr>
              ) : filteredMapas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Nenhuma reserva encontrada.
                  </td>
                </tr>
              ) : (
                filteredMapas.map((mapa) => {
                  const isSelected = selectedIds.includes(mapa.codigo);
                  return (
                    <tr
                      key={mapa.codigo}
                      className={`hover:bg-gray-800/40 transition-colors ${
                        isSelected ? 'bg-yellow-500/5' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <button onClick={() => toggleSelect(mapa.codigo)}>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-yellow-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDateBR(mapa.datareserva)}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-white whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-800 border border-gray-700 text-yellow-400 text-xs mr-2">
                          <DoorOpen className="w-3 h-3" />
                          {mapa.sala || mapa.codigo_sala}
                        </span>
                        {mapa.descsala}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-200">{mapa.desturma}</td>
                      <td className="py-4 px-4 text-gray-300">{mapa.nome_professor}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/60 border border-blue-800 text-blue-300">
                          <Clock className="w-3 h-3" />
                          {mapa.deshorario} ({mapa.hora_inicial} - {mapa.hora_final})
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(mapa)}
                            className="p-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-gray-950 rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="Editar Reserva"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivate(mapa)}
                            className="p-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="Desativar Reserva"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Reserva */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold shrink-0">
              <h3 className="text-base sm:text-lg">Cadastrar Nova Reserva</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-950 hover:opacity-75 text-xl font-bold p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Data da Reserva</label>
                <input
                  type="date"
                  value={dataReserva}
                  onChange={(e) => setDataReserva(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Sala de Aula</label>
                  <select
                    value={codSala}
                    onChange={(e) => setCodSala(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  >
                    <option value="">Selecione a Sala</option>
                    {salas.map((s) => (
                      <option key={s.codigo} value={s.codigo}>
                        Sala {s.codigo} - {s.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Turma / Curso</label>
                  <select
                    value={codTurma}
                    onChange={(e) => setCodTurma(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  >
                    <option value="">Selecione a Turma</option>
                    {turmas.map((t) => (
                      <option key={t.codigo} value={t.codigo}>
                        {t.descricao}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Docente Responsável</label>
                  <select
                    value={codProfessor}
                    onChange={(e) => setCodProfessor(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  >
                    <option value="">Selecione o Docente</option>
                    {professores.map((p) => (
                      <option key={p.codigo} value={p.codigo}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Período / Turno</label>
                  <select
                    value={codHorario}
                    onChange={(e) => setCodHorario(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  >
                    <option value="">Selecione o Horário</option>
                    {horarios.map((h) => (
                      <option key={h.codigo} value={h.codigo}>
                        {h.descricao} ({h.hora_ini || h.hora_inicial.substring(0, 5)} - {h.hora_fim || h.hora_final.substring(0, 5)})
                      </option>
                    ))}
                  </select>
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
                  Salvar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Reserva */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold shrink-0">
              <h3 className="text-base sm:text-lg">Editar Reserva #{editId}</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-950 hover:opacity-75 text-xl font-bold p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Data da Reserva</label>
                <input
                  type="date"
                  value={editDataReserva}
                  onChange={(e) => setEditDataReserva(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Sala de Aula</label>
                  <select
                    value={editCodSala}
                    onChange={(e) => setEditCodSala(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  >
                    {salas.map((s) => (
                      <option key={s.codigo} value={s.codigo}>
                        Sala {s.codigo} - {s.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Turma / Curso</label>
                  <select
                    value={editCodTurma}
                    onChange={(e) => setEditCodTurma(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  >
                    {turmas.map((t) => (
                      <option key={t.codigo} value={t.codigo}>
                        {t.descricao}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Docente Responsável</label>
                  <select
                    value={editCodProfessor}
                    onChange={(e) => setEditCodProfessor(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  >
                    {professores.map((p) => (
                      <option key={p.codigo} value={p.codigo}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Período / Turno</label>
                  <select
                    value={editCodHorario}
                    onChange={(e) => setEditCodHorario(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[44px]"
                  >
                    {horarios.map((h) => (
                      <option key={h.codigo} value={h.codigo}>
                        {h.descricao} ({h.hora_ini || h.hora_inicial.substring(0, 5)} - {h.hora_fim || h.hora_final.substring(0, 5)})
                      </option>
                    ))}
                  </select>
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
