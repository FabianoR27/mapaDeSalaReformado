import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { alerts } from '../lib/alerts';
import { Sala } from '../types';
import { Plus, Search, Edit2, Trash2, DoorOpen, Users, Layers } from 'lucide-react';

export const SalasView: React.FC = () => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form states
  const [newCodigo, setNewCodigo] = useState('');
  const [newDescricao, setNewDescricao] = useState('');
  const [newAndar, setNewAndar] = useState('0');
  const [newCapacidade, setNewCapacidade] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [editDescricao, setEditDescricao] = useState('');
  const [editAndar, setEditAndar] = useState('0');
  const [editCapacidade, setEditCapacidade] = useState('');

  const andarLabels: Record<number, string> = {
    0: 'Térreo',
    1: '1º Andar',
    2: '2º Andar',
    3: '3º Andar',
    4: '4º Andar',
    5: '5º Andar',
    6: '6º Andar'
  };

  const loadSalas = async () => {
    setLoading(true);
    try {
      const res = await api.consultarSalas();
      if (res.dados) {
        setSalas(res.dados);
      } else {
        setSalas([]);
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao carregar salas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalas();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodigo || !newDescricao.trim() || !newCapacidade) {
      alerts.warning('Campos Obrigatórios', 'Preencha número, descrição e capacidade da sala.');
      return;
    }

    try {
      const res = await api.inserirSala({
        codigo: Number(newCodigo),
        descricao: newDescricao.trim(),
        andar: Number(newAndar),
        capacidade: Number(newCapacidade)
      });

      if (res.sucesso) {
        alerts.success('Sucesso!', res.msg || 'Sala cadastrada com sucesso.');
        setIsCreateOpen(false);
        setNewCodigo('');
        setNewDescricao('');
        setNewAndar('0');
        setNewCapacidade('');
        loadSalas();
      } else {
        alerts.error('Erro ao cadastrar', res.erros?.[0]?.msg || res.msg || 'Não foi possível cadastrar a sala.');
      }
    } catch (err) {
      alerts.error('Erro', 'Erro ao conectar ao servidor.');
    }
  };

  const openEditModal = (sala: Sala) => {
    setEditId(sala.codigo);
    setEditDescricao(sala.descricao);
    setEditAndar(String(sala.andar));
    setEditCapacidade(String(sala.capacidade));
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editDescricao.trim() || !editCapacidade) {
      alerts.warning('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const res = await api.alterarSala({
        codigo: editId,
        descricao: editDescricao.trim(),
        andar: Number(editAndar),
        capacidade: Number(editCapacidade)
      });

      if (res.sucesso) {
        alerts.success('Atualizado!', res.msg || 'Sala atualizada com sucesso.');
        setIsEditOpen(false);
        loadSalas();
      } else {
        alerts.error('Erro ao editar', res.erros?.[0]?.msg || res.msg || 'Falha ao atualizar a sala.');
      }
    } catch (err) {
      alerts.error('Erro', 'Erro ao conectar ao servidor.');
    }
  };

  const handleDeactivate = async (sala: Sala) => {
    const confirmed = await alerts.confirm(
      'Desativar Sala',
      `Tem certeza que deseja desativar a sala ${sala.codigo} (${sala.descricao})?`
    );

    if (confirmed) {
      try {
        const res = await api.desativarSala(sala.codigo);
        if (res.sucesso) {
          alerts.success('Desativada!', 'Sala desativada com sucesso.');
          loadSalas();
        } else {
          alerts.error('Erro', res.erros?.[0]?.msg || res.msg || 'Não foi possível desativar a sala.');
        }
      } catch (err) {
        alerts.error('Erro', 'Falha ao conectar com o servidor.');
      }
    }
  };

  const filteredSalas = salas.filter((s) => {
    const term = searchTerm.toLowerCase();
    const andarStr = andarLabels[s.andar] || '';
    return (
      String(s.codigo).includes(term) ||
      s.descricao.toLowerCase().includes(term) ||
      andarStr.toLowerCase().includes(term) ||
      String(s.capacidade).includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/20 text-yellow-400 rounded-xl">
              <DoorOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Salas de Aula</h2>
          </div>
          <p className="text-sm text-gray-400 mt-1">Gerencie as salas de aula, laboratórios e auditórios da unidade.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[#181c22] p-2 rounded-xl border border-gray-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar sala..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-400 w-48 sm:w-64"
            />
          </div>
          <button
            id="btn-cadastrar-sala"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-semibold rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Sala</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#181c22] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#13161c] border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Número / Código</th>
                <th className="py-3.5 px-6">Descrição</th>
                <th className="py-3.5 px-6">Andar</th>
                <th className="py-3.5 px-6">Capacidade</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Carregando salas...
                  </td>
                </tr>
              ) : filteredSalas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Nenhuma sala encontrada.
                  </td>
                </tr>
              ) : (
                filteredSalas.map((sala) => (
                  <tr key={sala.codigo} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-800 border border-gray-700 text-yellow-400">
                        {sala.codigo}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-200 font-medium">{sala.descricao}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-950/60 border border-blue-800 text-blue-300">
                        <Layers className="w-3 h-3" />
                        {andarLabels[sala.andar] || `Andar ${sala.andar}`}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-gray-300">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {sala.capacidade} alunos
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(sala)}
                          className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-gray-950 rounded-lg transition"
                          title="Editar Sala"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(sala)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition"
                          title="Desativar Sala"
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

      {/* Modal Cadastro de Sala */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold">
              <h3>Cadastrar Nova Sala</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-950 hover:opacity-75 text-lg font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Número / Código da Sala</label>
                <input
                  type="number"
                  value={newCodigo}
                  onChange={(e) => setNewCodigo(e.target.value)}
                  placeholder="Ex: 101"
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Andar</label>
                  <select
                    value={newAndar}
                    onChange={(e) => setNewAndar(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="0">Térreo</option>
                    <option value="1">Primeiro</option>
                    <option value="2">Segundo</option>
                    <option value="3">Terceiro</option>
                    <option value="4">Quarto</option>
                    <option value="5">Quinto</option>
                    <option value="6">Sexto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Capacidade</label>
                  <input
                    type="number"
                    value={newCapacidade}
                    onChange={(e) => setNewCapacidade(e.target.value)}
                    placeholder="Ex: 40"
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Descrição</label>
                <input
                  type="text"
                  value={newDescricao}
                  onChange={(e) => setNewDescricao(e.target.value)}
                  placeholder="Ex: Laboratório de Informática 1"
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                />
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

      {/* Modal Editar Sala */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#1a1f26] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-yellow-500 text-gray-950 flex items-center justify-between font-bold">
              <h3>Editar Sala #{editId}</h3>
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
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Andar</label>
                  <select
                    value={editAndar}
                    onChange={(e) => setEditAndar(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="0">Térreo</option>
                    <option value="1">Primeiro</option>
                    <option value="2">Segundo</option>
                    <option value="3">Terceiro</option>
                    <option value="4">Quarto</option>
                    <option value="5">Quinto</option>
                    <option value="6">Sexto</option>
                  </select>
                </div>
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
