import { ApiResponse, Sala, Professor, Turma, Horario, MapaReserva, RelatorioItem } from '../types';

export const api = {
  // Auth
  login: async (usuario: string, senha: string): Promise<ApiResponse> => {
    const res = await fetch('/Usuario/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha })
    });
    return res.json();
  },

  // Salas
  consultarSalas: async (filters: Partial<Sala> = {}): Promise<ApiResponse<Sala[]>> => {
    const res = await fetch('/Sala/consultar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    return res.json();
  },
  inserirSala: async (sala: { codigo: number; descricao: string; andar: number; capacidade: number }): Promise<ApiResponse> => {
    const res = await fetch('/Sala/inserir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sala)
    });
    return res.json();
  },
  alterarSala: async (sala: { codigo: number; descricao: string; andar: number; capacidade: number }): Promise<ApiResponse> => {
    const res = await fetch('/Sala/alterar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sala)
    });
    return res.json();
  },
  desativarSala: async (codigo: number): Promise<ApiResponse> => {
    const res = await fetch('/Sala/desativar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo })
    });
    return res.json();
  },

  // Professores
  consultarProfessores: async (filters: Partial<Professor> = {}): Promise<ApiResponse<Professor[]>> => {
    const res = await fetch('/Professor/consultar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    return res.json();
  },
  inserirProfessor: async (prof: { nome: string; cpf: string; tipo: 'F' | 'C' }): Promise<ApiResponse> => {
    const res = await fetch('/Professor/inserir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prof)
    });
    return res.json();
  },
  alterarProfessor: async (prof: { codigo: number; nome: string; cpf: string; tipo: 'F' | 'C' }): Promise<ApiResponse> => {
    const res = await fetch('/Professor/alterar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prof)
    });
    return res.json();
  },
  desativarProfessor: async (codigo: number): Promise<ApiResponse> => {
    const res = await fetch('/Professor/desativar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo })
    });
    return res.json();
  },

  // Turmas
  consultarTurmas: async (filters: Partial<Turma> = {}): Promise<ApiResponse<Turma[]>> => {
    const res = await fetch('/Turma/consultar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    return res.json();
  },
  inserirTurma: async (turma: { descricao: string; capacidade: number; dataInicio: string }): Promise<ApiResponse> => {
    const res = await fetch('/Turma/inserir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turma)
    });
    return res.json();
  },
  alterarTurma: async (turma: { codigo: number; descricao: string; capacidade: number; dataInicio: string }): Promise<ApiResponse> => {
    const res = await fetch('/Turma/alterar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turma)
    });
    return res.json();
  },
  desativarTurma: async (codigo: number): Promise<ApiResponse> => {
    const res = await fetch('/Turma/desativar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo })
    });
    return res.json();
  },

  // Horários / Períodos
  consultarHorarios: async (filters: Partial<Horario> = {}): Promise<ApiResponse<Horario[]>> => {
    const res = await fetch('/Horario/consultar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    return res.json();
  },
  inserirHorario: async (horario: { descricao: string; horaInicial: string; horaFinal: string }): Promise<ApiResponse> => {
    const res = await fetch('/Horario/inserir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(horario)
    });
    return res.json();
  },
  alterarHorario: async (horario: { codigo: number; descricao: string; horaInicial: string; horaFinal: string }): Promise<ApiResponse> => {
    const res = await fetch('/Horario/alterar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(horario)
    });
    return res.json();
  },
  desativarHorario: async (codigo: number): Promise<ApiResponse> => {
    const res = await fetch('/Horario/desativar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo })
    });
    return res.json();
  },

  // Mapa / Reservas
  consultarMapas: async (filters: { dataReserva?: string; codSala?: number; codHorario?: number; codTurma?: number; codProfessor?: number } = {}): Promise<ApiResponse<MapaReserva[]>> => {
    const res = await fetch('/Mapa/consultar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    return res.json();
  },
  inserirMapa: async (mapa: { codSala: number; codHorario: number; codTurma: number; codProfessor: number; dataReserva: string }): Promise<ApiResponse> => {
    const res = await fetch('/Mapa/inserir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapa)
    });
    return res.json();
  },
  alterarMapa: async (mapa: { codigo: number; codSala: number; codHorario: number; codTurma: number; codProfessor: number; dataReserva: string }): Promise<ApiResponse> => {
    const res = await fetch('/Mapa/alterar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapa)
    });
    return res.json();
  },
  desativarMapa: async (codigo: number): Promise<ApiResponse> => {
    const res = await fetch('/Mapa/desativar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo })
    });
    return res.json();
  },
  desativarMultiplosMapas: async (codigos: number[]): Promise<ApiResponse> => {
    const res = await fetch('/Mapa/desativarMultiplos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigos })
    });
    return res.json();
  },

  // Relatório
  gerarRelatorio: async (dataMapa: string): Promise<ApiResponse<RelatorioItem[]>> => {
    const res = await fetch('/Relatorio/gerarMapa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataMapa })
    });
    return res.json();
  }
};
