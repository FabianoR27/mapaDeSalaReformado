export interface Usuario {
  codigo: number;
  nome: string;
  usuario: string;
  email: string;
  senha?: string;
  status: string;
  data_criacao?: string;
}

export interface Sala {
  codigo: number;
  descricao: string;
  andar: number;
  capacidade: number;
  status: string;
  data_criacao?: string;
}

export interface Professor {
  codigo: number;
  nome: string;
  cpf: string;
  tipo: 'F' | 'C'; // F = Funcionário, C = Carta Convite
  status: string;
  data_criacao?: string;
}

export interface Turma {
  codigo: number;
  descricao: string;
  capacidade: number;
  dt_inicio: string;
  status: string;
  data_criacao?: string;
  dataInicio?: string;
  dataIniciobra?: string;
}

export interface Horario {
  codigo: number;
  descricao: string;
  hora_inicial: string;
  hora_final: string;
  hora_ini?: string;
  hora_fim?: string;
  status: string;
  data_criacao?: string;
}

export interface MapaReserva {
  codigo: number;
  dt_reserva: string;
  codigo_sala: number;
  codigo_horario: number;
  codigo_turma: number;
  codigo_professor: number;
  status: string;
  // Joined fields for display
  sala?: number;
  descsala?: string;
  desturma?: string;
  nome_professor?: string;
  deshorario?: string;
  datareserva?: string;
}

export interface RelatorioItem {
  datareserva: string;
  desc_sala: string;
  desc_codigo: number;
  desc_periodo: string;
  hora_inicial: string;
  hora_final: string;
  desc_turma: string;
  nome_professor: string;
}

export interface ApiResponse<T = any> {
  sucesso?: boolean;
  codigo?: number;
  msg?: string;
  dados?: T;
  erros?: Array<{ codigo?: number; campo?: string; msg: string }>;
}
