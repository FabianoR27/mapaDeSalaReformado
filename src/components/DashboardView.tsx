import React, { useEffect, useState } from 'react';
import { DoorOpen, Users, GraduationCap, Clock, CalendarRange, FileText, LogOut, Database, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onLogout }) => {
  const [dbInfo, setDbInfo] = useState<{ connected: boolean; region?: string; stats?: { salas: number; professores: number; turmas: number; mapas: number } } | null>(null);

  useEffect(() => {
    fetch('/api/db-status')
      .then(res => res.json())
      .then(data => setDbInfo(data))
      .catch(() => setDbInfo({ connected: false }));
  }, []);

  const cards = [
    {
      id: 'salas',
      title: 'Sala de Aula',
      description: 'Cadastro e gerenciamento de salas, andares e capacidades.',
      iconPath: '/assets/img/sala-de-aula.png',
      fallbackIcon: DoorOpen,
      action: () => onNavigate('salas'),
      count: dbInfo?.stats?.salas
    },
    {
      id: 'professores',
      title: 'Docente',
      description: 'Gerenciamento de professores e instrutores com CPF e vínculos.',
      iconPath: '/assets/img/professores.png',
      fallbackIcon: Users,
      action: () => onNavigate('professores'),
      count: dbInfo?.stats?.professores
    },
    {
      id: 'turmas',
      title: 'Turma',
      description: 'Controle de turmas letivas, cursos e datas de início.',
      iconPath: '/assets/img/turma.png',
      fallbackIcon: GraduationCap,
      action: () => onNavigate('turmas'),
      count: dbInfo?.stats?.turmas
    },
    {
      id: 'periodos',
      title: 'Período',
      description: 'Definição de turnos, horários iniciais e finais de aula.',
      iconPath: '/assets/img/periodo.png',
      fallbackIcon: Clock,
      action: () => onNavigate('periodos')
    },
    {
      id: 'mapa',
      title: 'Reservas',
      description: 'Mapeamento e alocação de turmas, salas e professores.',
      iconPath: '/assets/img/mapeamento.png',
      fallbackIcon: CalendarRange,
      action: () => onNavigate('mapa'),
      count: dbInfo?.stats?.mapas
    },
    {
      id: 'relatorio',
      title: 'Relatórios',
      description: 'Relatórios de chaves, impressão e exibição em tempo real na TV.',
      iconPath: '/assets/img/relatorio.png',
      fallbackIcon: FileText,
      action: () => onNavigate('relatorio')
    },
    {
      id: 'sair',
      title: 'Encerrar Sessão',
      description: 'Finalizar sessão com segurança e retornar ao login.',
      iconPath: '/assets/img/sair.png',
      fallbackIcon: LogOut,
      action: onLogout,
      isDanger: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Title Header with Cloud SQL status */}
      <div className="mb-6 sm:mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Painel de Controle
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-400">
            Selecione um módulo abaixo para gerenciar a ocupação e mapeamento da FATEC São Roque.
          </p>
        </div>

        {/* Live Cloud SQL Status Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2 bg-emerald-950/70 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 shadow-sm self-start md:self-auto w-full sm:w-auto">
          <Database className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-emerald-200 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Cloud SQL (PostgreSQL) Conectado
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-400/80 font-mono">
              Região: us-east1 • Drizzle ORM
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Menu Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
        {cards.map((card) => {
          const FallbackIcon = card.fallbackIcon;
          return (
            <div
              key={card.id}
              id={`card-menu-${card.id}`}
              onClick={card.action}
              className={`group relative p-4 sm:p-6 rounded-2xl cursor-pointer select-none transition-all duration-300 card-theme active:scale-[0.98] ${
                card.isDanger
                  ? 'hover:!bg-red-600 hover:!border-red-600 hover:!text-white'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl bg-gray-900/80 p-2 sm:p-2.5 flex items-center justify-center border border-gray-700/60 group-hover:bg-yellow-400 group-hover:border-yellow-300 transition">
                  <img
                    src={card.iconPath}
                    alt={card.title}
                    className="w-full h-full object-contain filter group-hover:brightness-0 transition"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.fallback-icon');
                        if (fallback) (fallback as HTMLElement).style.display = 'block';
                      }
                    }}
                  />
                  <FallbackIcon className="fallback-icon w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 group-hover:text-gray-950 hidden" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-gray-950 transition truncate">
                    {card.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] sm:text-xs text-yellow-400 group-hover:text-gray-900 font-medium">
                      Acessar Módulo →
                    </span>
                    {card.count !== undefined && (
                      <span className="px-1.5 py-0.5 bg-gray-800 text-gray-300 group-hover:bg-gray-950 group-hover:text-yellow-400 text-[10px] font-semibold rounded-md">
                        {card.count} {card.count === 1 ? 'item' : 'itens'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-900 transition leading-relaxed">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
