import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { alerts } from '../lib/alerts';
import { MapaReserva, Sala, Professor, Turma, Horario } from '../types';
import { Plus, Search, Edit2, Trash2, CalendarRange, CheckSquare, Square, Calendar, User, DoorOpen, Clock, GraduationCap } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/20 text-yellow-400 rounded-xl">
              <CalendarRange className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Reservas e Mapeamento de Salas</h2>
          </div>
          <p className="text-sm text-gray-400 mt-1">Alocação de salas para turmas, períodos e docentes com prevenção de conflitos.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[#181c22] p-2 rounded-xl border border-gray-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar reserva..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-400 w-48 sm:w-60"
            />
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeactivateSelected}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-sm transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir ({selectedIds.length})</span>
            </button>
          )}
          <button
            id="btn-cadastrar-reserva"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-semibold rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Reserva</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#181c22] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#13161c] border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">
                  <button onClick={handleSelectAll} className="hover:text-yellow-400 transition" title="Selecionar Todos">
                    {selectedIds.length > 0 && selectedIds.length === filteredMapas.length ? (
                      <CheckSquare className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Data</th>
                <th className="py-3.5 px-4">Sala</th>
                <th className="py-3.5 px-4">Turma</th>
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
                      className={`hover:bg-gray-800/40 transition-colors ${isSelected ? 'bg-yellow-500/10' : ''}`}
                    >
                      <td className="py-4 px-4 text-center">
                        <button onClick={() => toggleSelect(mapa.codigo)} className="hover:text-yellow-400 transition">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-yellow-400 font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800 border border-gray-700">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateBR(mapa.datareserva || mapa.dt_reserva)}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-white">
                        <div className="flex items-center gap-1.5">
                          <DoorOpen className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{mapa.descsala}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-200">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate max-w-xs">{mapa.desturma}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{mapa.nome_professor}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-blue-300">{mapa.deshorario}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(mapa)}
                            className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-gray-950 rounded-lg transition"
                            title="Editar Reserva"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivate(mapa)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition"
                            title="Remover Reserva"
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

      {/* Modal Cadastro */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold">
              <h3>Cadastrar Nova Reserva</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-950 hover:opacity-75 text-lg font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Data da Reserva</label>
                <input
                  type="date"
                  value={dataReserva}
                  onChange={(e) => setDataReserva(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Sala de Aula</label>
                <select
                  value={codSala}
                  onChange={(e) => setCodSala(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                >
                  <option value="">Selecione a Sala</option>
                  {salas.map((s) => (
                    <option key={s.codigo} value={s.codigo}>
                      {s.codigo} - {s.descricao} (Andar {s.andar} | Cap: {s.capacidade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Turma</label>
                <select
                  value={codTurma}
                  onChange={(e) => setCodTurma(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                >
                  <option value="">Selecione a Turma</option>
                  {turmas.map((t) => (
                    <option key={t.codigo} value={t.codigo}>
                      {t.codigo} - {t.descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Docente Responsável</label>
                <select
                  value={codProfessor}
                  onChange={(e) => setCodProfessor(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                >
                  <option value="">Selecione o Docente</option>
                  {professores.map((p) => (
                    <option key={p.codigo} value={p.codigo}>
                      {p.nome} ({p.tipo === 'F' ? 'Funcionário' : 'Carta Convite'})
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
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                >
                  <option value="">Selecione o Período</option>
                  {horarios.map((h) => (
                    <option key={h.codigo} value={h.codigo}>
                      {h.descricao} ({h.hora_ini || h.hora_inicial.substring(0, 5)} - {h.hora_fim || h.hora_final.substring(0, 5)})
                    </option>
                  ))}
                </select>
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
                  Cadastrar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold">
              <h3>Editar Reserva #{editId}</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-950 hover:opacity-75 text-lg font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Data da Reserva</label>
                <input
                  type="date"
                  value={editDataReserva}
                  onChange={(e) => setEditDataReserva(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Sala de Aula</label>
                <select
                  value={editCodSala}
                  onChange={(e) => setEditCodSala(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                >
                  {salas.map((s) => (
                    <option key={s.codigo} value={s.codigo}>
                      {s.codigo} - {s.descricao} (Andar {s.andar})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Turma</label>
                <select
                  value={editCodTurma}
                  onChange={(e) => setEditCodTurma(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                >
                  {turmas.map((t) => (
                    <option key={t.codigo} value={t.codigo}>
                      {t.codigo} - {t.descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Docente</label>
                <select
                  value={editCodProfessor}
                  onChange={(e) => setEditCodProfessor(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                >
                  {professores.map((p) => (
                    <option key={p.codigo} value={p.codigo}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Período</label>
                <select
                  value={editCodHorario}
                  onChange={(e) => setEditCodHorario(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                >
                  {horarios.map((h) => (
                    <option key={h.codigo} value={h.codigo}>
                      {h.descricao} ({h.hora_ini || h.hora_inicial.substring(0, 5)} - {h.hora_fim || h.hora_final.substring(0, 5)})
                    </option>
                  ))}
                </select>
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
