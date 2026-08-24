import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { alerts } from '../lib/alerts';
import { RelatorioItem } from '../types';
import { FileText, Printer, Eye, Tv, Calendar, RefreshCw, Layers, Clock, DoorOpen, Users, GraduationCap, X } from 'lucide-react';

export const RelatorioView: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [dataRelatorio, setDataRelatorio] = useState(todayStr);
  const [relatorioData, setRelatorioData] = useState<RelatorioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [printMode, setPrintMode] = useState<'chaves' | 'visualizacao' | null>(null);
  const [isTvMode, setIsTvMode] = useState(false);
  const [tvPeriodoFilter, setTvPeriodoFilter] = useState('todos');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR'));

  // Clock ticker for TV mode
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGerarRelatorio = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dataRelatorio) {
      alerts.warning('Data Obrigatória', 'Informe a data para gerar o relatório.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.gerarRelatorio(dataRelatorio);
      if (res.sucesso && res.dados) {
        setRelatorioData(res.dados);
        if (res.dados.length === 0) {
          alerts.warning('Aviso', 'Nenhuma reserva encontrada para esta data.');
        }
      } else {
        setRelatorioData([]);
        alerts.warning('Aviso', res.msg || 'Nenhuma reserva encontrada para a data selecionada.');
      }
    } catch (err) {
      alerts.error('Erro', 'Falha ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGerarRelatorio();
  }, []);

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const triggerPrint = (mode: 'chaves' | 'visualizacao') => {
    if (relatorioData.length === 0) {
      alerts.warning('Relatório Vazio', 'Gere o relatório antes de imprimir.');
      return;
    }
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Helper to deduce floor from room number
  const getFloorFromCode = (code: number) => {
    if (code < 100) return 0; // Térreo
    return Math.floor(code / 100);
  };

  const getFloorBadgeClass = (floor: number) => {
    switch (floor) {
      case 0: return 'bg-gray-600 text-white';
      case 1: return 'bg-emerald-600 text-white';
      case 2: return 'bg-sky-600 text-white';
      case 3: return 'bg-purple-600 text-white';
      case 4: return 'bg-indigo-600 text-white';
      case 5: return 'bg-orange-600 text-white';
      default: return 'bg-red-600 text-white';
    }
  };

  const getFloorName = (floor: number) => {
    if (floor === 0) return 'Térreo';
    return `${floor}º Andar`;
  };

  // Group items for TV mode
  const filteredTvData = relatorioData.filter((item) => {
    if (tvPeriodoFilter === 'todos') return true;
    return item.desc_periodo.toLowerCase().includes(tvPeriodoFilter.toLowerCase());
  });

  const groupedByFloor = filteredTvData.reduce((acc, item) => {
    const floor = getFloorFromCode(item.desc_codigo);
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(item);
    return acc;
  }, {} as Record<number, RelatorioItem[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Main Relatório View */}
      {!isTvMode && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-yellow-500/20 text-yellow-400 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Relatório de Reservas</h2>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Geração de relatórios diários de ocupação, folhas de assinaturas para chaves e exibição Kiosk.
              </p>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-wrap items-end gap-3 bg-[#181c22] p-3 rounded-2xl border border-gray-800 shadow-lg">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Data da Reserva</label>
                <input
                  type="date"
                  value={dataRelatorio}
                  onChange={(e) => setDataRelatorio(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <button
                id="btn-gerar-relatorio"
                onClick={() => handleGerarRelatorio()}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold rounded-lg text-sm transition"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>Gerar Relatório</span>
              </button>

              <button
                id="btn-imprimir-chaves"
                onClick={() => triggerPrint('chaves')}
                className="flex items-center gap-2 px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg text-sm transition border border-gray-700"
                title="Imprimir com colunas de retirada, entrega e visto"
              >
                <Printer className="w-4 h-4 text-yellow-400" />
                <span>Imprimir Chaves</span>
              </button>

              <button
                id="btn-imprimir-visu"
                onClick={() => triggerPrint('visualizacao')}
                className="flex items-center gap-2 px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg text-sm transition border border-gray-700"
                title="Imprimir apenas o mapa das salas"
              >
                <Eye className="w-4 h-4 text-blue-400" />
                <span>Visualização</span>
              </button>

              <button
                id="btn-mostrar-tv"
                onClick={() => setIsTvMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-sm transition shadow-lg shadow-purple-600/20"
              >
                <Tv className="w-4 h-4" />
                <span>Modo TV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#181c22] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="tabelaRelatorio">
                <thead>
                  <tr className="bg-[#13161c] border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Data</th>
                    <th className="py-3.5 px-4">Sala</th>
                    <th className="py-3.5 px-4">Turma</th>
                    <th className="py-3.5 px-4">Docente</th>
                    <th className="py-3.5 px-4">Horário</th>
                    <th className="py-3.5 px-4 text-center">Retirada</th>
                    <th className="py-3.5 px-4 text-center">Entrega</th>
                    <th className="py-3.5 px-4 text-center">Visto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        Carregando relatório...
                      </td>
                    </tr>
                  ) : relatorioData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        Nenhuma reserva cadastrada para esta data. Selecione outra data e clique em "Gerar Relatório".
                      </td>
                    </tr>
                  ) : (
                    relatorioData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-yellow-400 whitespace-nowrap">
                          {formatDateBR(item.datareserva)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-yellow-400 text-xs mr-1.5">
                            {item.desc_codigo}
                          </span>
                          {item.desc_sala}
                        </td>
                        <td className="py-3.5 px-4 text-gray-200 font-medium">{item.desc_turma}</td>
                        <td className="py-3.5 px-4 text-gray-300 font-medium">{item.nome_professor}</td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-blue-300 whitespace-nowrap">
                          {item.desc_periodo} ({item.hora_inicial} - {item.hora_final})
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-500">
                          <div className="w-16 h-7 border border-dashed border-gray-700 rounded mx-auto flex items-center justify-center text-[10px]">
                            __:__
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-500">
                          <div className="w-16 h-7 border border-dashed border-gray-700 rounded mx-auto flex items-center justify-center text-[10px]">
                            __:__
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-500">
                          <div className="w-20 h-7 border border-dashed border-gray-700 rounded mx-auto"></div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Fullscreen TV Kiosk Mode */}
      {isTvMode && (
        <div className="fixed inset-0 z-50 bg-[#0f1216] text-white p-6 overflow-y-auto">
          {/* TV Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <img 
                src="/assets/img/logo_fatecSR.png" 
                alt="FATEC São Roque" 
                className="h-12 w-auto object-contain"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                  Mapeamento de Salas • FATEC São Roque
                </h1>
                <p className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Data: {formatDateBR(dataRelatorio)}</span>
                </p>
              </div>
            </div>

            {/* Filter Tabs & Clock & Exit */}
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-900 border border-gray-700 p-1 rounded-xl">
                {['todos', 'manhã', 'tarde', 'noite'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setTvPeriodoFilter(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                      tvPeriodoFilter === p
                        ? 'bg-yellow-500 text-gray-950'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-center">
                <span className="text-xs text-gray-400 block font-medium">Horário Local</span>
                <span className="text-lg font-mono font-bold text-emerald-400">{currentTime}</span>
              </div>

              <button
                onClick={() => setIsTvMode(false)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition"
              >
                <X className="w-4 h-4" />
                <span>Sair do Modo TV</span>
              </button>
            </div>
          </div>

          {/* Floor Sections Grid */}
          {Object.keys(groupedByFloor).length === 0 ? (
            <div className="text-center py-20">
              <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-400">Nenhuma reserva encontrada para este turno.</h2>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByFloor)
                .sort(([f1], [f2]) => Number(f1) - Number(f2))
                .map(([floorStr, items]) => {
                  const floorNum = Number(floorStr);
                  return (
                    <div key={floorNum} className="bg-[#161a20] border border-gray-800 rounded-2xl p-5 shadow-2xl">
                      {/* Floor Header Badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-4 py-1.5 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow ${getFloorBadgeClass(floorNum)}`}>
                          {getFloorName(floorNum)}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {items.length} {items.length === 1 ? 'sala alocada' : 'salas alocadas'}
                        </span>
                      </div>

                      {/* Floor Classrooms Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.map((reserva, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-xl bg-gray-900/90 border border-gray-700/80 shadow-md flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 border-b border-gray-800 pb-2 mb-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 bg-yellow-500 text-gray-950 font-black rounded-lg text-sm">
                                    {reserva.desc_codigo}
                                  </span>
                                  <span className="font-bold text-white text-sm truncate">{reserva.desc_sala}</span>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-xs">
                                <div className="flex items-start gap-1.5 text-yellow-300 font-medium">
                                  <GraduationCap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span>{reserva.desc_turma}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-300 font-medium">
                                  <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span className="truncate">{reserva.nome_professor}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-semibold text-blue-300">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {reserva.desc_periodo}
                              </span>
                              <span>{reserva.hora_inicial} - {reserva.hora_final}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Hidden Print Area */}
      <div id="print-area" className="hidden">
        <div className="p-8 text-black bg-white">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold uppercase">FATEC SÃO ROQUE</h1>
            <h2 className="text-lg font-semibold">
              {printMode === 'chaves' ? 'CONTROLE DE ENTREGA E RETIRADA DE CHAVES' : 'MAPA DE ALOCAÇÃO DE SALAS'}
            </h2>
            <p className="text-sm font-medium mt-1">Data: {formatDateBR(dataRelatorio)}</p>
          </div>

          <table className="w-full text-left border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-200 border-b border-black">
                <th className="border border-black p-2">Data</th>
                <th className="border border-black p-2">Sala</th>
                <th className="border border-black p-2">Turma</th>
                <th className="border border-black p-2">Docente</th>
                <th className="border border-black p-2">Horário</th>
                {printMode === 'chaves' && (
                  <>
                    <th className="border border-black p-2 text-center w-20">Retirada</th>
                    <th className="border border-black p-2 text-center w-20">Entrega</th>
                    <th className="border border-black p-2 text-center w-28">Visto / Assinatura</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {relatorioData.map((item, idx) => (
                <tr key={idx} className="border-b border-black">
                  <td className="border border-black p-2">{formatDateBR(item.datareserva)}</td>
                  <td className="border border-black p-2 font-bold">{item.desc_codigo} - {item.desc_sala}</td>
                  <td className="border border-black p-2">{item.desc_turma}</td>
                  <td className="border border-black p-2">{item.nome_professor}</td>
                  <td className="border border-black p-2">{item.desc_periodo} ({item.hora_inicial} - {item.hora_final})</td>
                  {printMode === 'chaves' && (
                    <>
                      <td className="border border-black p-2 text-center">__:__</td>
                      <td className="border border-black p-2 text-center">__:__</td>
                      <td className="border border-black p-2 text-center"></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 text-xs text-gray-600 flex justify-between">
            <span>Sistema de Mapa de Sala - FATEC São Roque</span>
            <span>Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
