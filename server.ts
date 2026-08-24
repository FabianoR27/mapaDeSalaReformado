import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static public assets
app.use('/assets', express.static(path.join(process.cwd(), 'public/assets')));
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

// ==========================================
// IN-MEMORY DATA STORE (Mock Data for Node.js)
// ==========================================

interface DBUser {
  codigo: number;
  nome: string;
  usuario: string;
  senha: string;
  email: string;
  status: string;
}

interface DBSala {
  codigo: number;
  descricao: string;
  andar: number;
  capacidade: number;
  status: string;
}

interface DBProfessor {
  codigo: number;
  nome: string;
  cpf: string;
  tipo: 'F' | 'C';
  status: string;
}

interface DBTurma {
  codigo: number;
  descricao: string;
  capacidade: number;
  dt_inicio: string;
  status: string;
}

interface DBHorario {
  codigo: number;
  descricao: string;
  hora_inicial: string;
  hora_final: string;
  status: string;
}

interface DBMapa {
  codigo: number;
  dt_reserva: string;
  codigo_sala: number;
  codigo_horario: number;
  codigo_turma: number;
  codigo_professor: number;
  status: string;
}

// Initial Mock Datasets
let usuarios: DBUser[] = [
  { codigo: 1, nome: 'Administrador FATEC', usuario: 'admin', senha: '123', email: 'admin@fatecsr.edu.br', status: '' },
  { codigo: 2, nome: 'Coordenador Fabiano', usuario: 'fabiano', senha: '123', email: 'fabiano@fatecsr.edu.br', status: '' }
];

let salas: DBSala[] = [
  { codigo: 101, descricao: 'Laboratório de Informática 1', andar: 1, capacidade: 40, status: '' },
  { codigo: 102, descricao: 'Laboratório de Informática 2', andar: 1, capacidade: 40, status: '' },
  { codigo: 201, descricao: 'Sala de Aula Teórica A', andar: 2, capacidade: 45, status: '' },
  { codigo: 202, descricao: 'Sala de Aula Teórica B', andar: 2, capacidade: 50, status: '' },
  { codigo: 301, descricao: 'Auditório Principal', andar: 3, capacidade: 120, status: '' },
  { codigo: 10, descricao: 'Laboratório Maker / Robótica', andar: 0, capacidade: 30, status: '' },
  { codigo: 401, descricao: 'Laboratório de Redes e IoT', andar: 4, capacidade: 35, status: '' }
];

let professores: DBProfessor[] = [
  { codigo: 1, nome: 'Prof. Dr. Carlos Eduardo', cpf: '12345678901', tipo: 'F', status: '' },
  { codigo: 2, nome: 'Profa. Dra. Mariana Souza', cpf: '98765432100', tipo: 'F', status: '' },
  { codigo: 3, nome: 'Prof. Roberto Silva', cpf: '45678912344', tipo: 'C', status: '' },
  { codigo: 4, nome: 'Profa. Juliana Mendes', cpf: '78912345688', tipo: 'F', status: '' },
  { codigo: 5, nome: 'Prof. Alexandre Pinto', cpf: '32165498711', tipo: 'C', status: '' }
];

const today = new Date().toISOString().split('T')[0];

let turmas: DBTurma[] = [
  { codigo: 1, descricao: 'DSM - Desenvolvimento de Software Multiplataforma 1º Sem', capacidade: 40, dt_inicio: '2025-02-10', status: '' },
  { codigo: 2, descricao: 'DSM - Desenvolvimento de Software Multiplataforma 3º Sem', capacidade: 35, dt_inicio: '2025-02-10', status: '' },
  { codigo: 3, descricao: 'GTI - Gestão da Tecnologia da Informação 2º Sem', capacidade: 45, dt_inicio: '2025-02-10', status: '' },
  { codigo: 4, descricao: 'Eventos - Organização e Gestão 1º Sem', capacidade: 30, dt_inicio: '2025-02-10', status: '' }
];

let horarios: DBHorario[] = [
  { codigo: 1, descricao: 'Manhã (07:40 - 11:20)', hora_inicial: '07:40:00', hora_final: '11:20:00', status: '' },
  { codigo: 2, descricao: 'Tarde (13:10 - 16:50)', hora_inicial: '13:10:00', hora_final: '16:50:00', status: '' },
  { codigo: 3, descricao: 'Noite (19:00 - 22:30)', hora_inicial: '19:00:00', hora_final: '22:30:00', status: '' }
];

let mapas: DBMapa[] = [
  { codigo: 1, dt_reserva: today, codigo_sala: 101, codigo_horario: 1, codigo_turma: 1, codigo_professor: 1, status: '' },
  { codigo: 2, dt_reserva: today, codigo_sala: 102, codigo_horario: 1, codigo_turma: 2, codigo_professor: 2, status: '' },
  { codigo: 3, dt_reserva: today, codigo_sala: 201, codigo_horario: 3, codigo_turma: 3, codigo_professor: 3, status: '' },
  { codigo: 4, dt_reserva: today, codigo_sala: 301, codigo_horario: 3, codigo_turma: 4, codigo_professor: 4, status: '' }
];

// Helper to format Date
function formatDateBR(dateStr: string) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

// ==========================================
// 1. USUARIO CONTROLLER ROUTES
// ==========================================

const usuarioRouter = express.Router();

usuarioRouter.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    return res.json({
      sucesso: false,
      codigo: 2,
      erros: [{ campo: 'Usuario/Senha', msg: 'Usuário e senha são obrigatórios.' }]
    });
  }

  const user = usuarios.find(u => u.usuario.toLowerCase() === String(usuario).trim().toLowerCase() && u.senha === String(senha).trim() && u.status !== 'D');
  if (user) {
    return res.json({
      sucesso: true,
      codigo: 1,
      msg: 'login realizado com sucesso',
      usuario: { codigo: user.codigo, nome: user.nome, usuario: user.usuario, email: user.email }
    });
  } else {
    return res.json({
      sucesso: false,
      codigo: 11,
      erros: [{ campo: 'Credenciais', msg: 'Usuário ou senha incorretos.' }]
    });
  }
});

usuarioRouter.post('/consultar', (req, res) => {
  const { codigo, nome, email, usuario } = req.body;
  const active = usuarios.filter(u => u.status !== 'D');
  const filtered = active.filter(u => {
    if (codigo && u.codigo !== Number(codigo)) return false;
    if (nome && !u.nome.toLowerCase().includes(String(nome).toLowerCase())) return false;
    if (email && !u.email.toLowerCase().includes(String(email).toLowerCase())) return false;
    if (usuario && !u.usuario.toLowerCase().includes(String(usuario).toLowerCase())) return false;
    return true;
  });

  if (filtered.length > 0) {
    return res.json({ sucesso: true, codigo: 1, msg: 'Consulta realizada com sucesso.', dados: filtered });
  } else {
    return res.json({ sucesso: false, codigo: 11, msg: 'Nenhum usuário encontrado.' });
  }
});

usuarioRouter.post('/inserir', (req, res) => {
  const { nome, email, usuario, senha } = req.body;
  if (!nome || !email || !usuario || !senha) {
    return res.json({ sucesso: false, erros: [{ campo: 'Campos', msg: 'Preencha todos os campos obrigatórios.' }] });
  }
  const nextId = usuarios.length ? Math.max(...usuarios.map(u => u.codigo)) + 1 : 1;
  usuarios.push({ codigo: nextId, nome, email, usuario, senha, status: '' });
  return res.json({ sucesso: true, codigo: 1, msg: 'Usuário cadastrado corretamente' });
});

usuarioRouter.post('/alterar', (req, res) => {
  const { codigo, nome, email, usuario, senha } = req.body;
  const user = usuarios.find(u => u.codigo === Number(codigo));
  if (!user) return res.json({ sucesso: false, erros: [{ msg: 'Usuário não encontrado' }] });
  if (nome) user.nome = nome;
  if (email) user.email = email;
  if (usuario) user.usuario = usuario;
  if (senha) user.senha = senha;
  return res.json({ sucesso: true, codigo: 1, msg: 'Usuário atualizado com sucesso.' });
});

usuarioRouter.post('/desativar', (req, res) => {
  const { codigo } = req.body;
  const user = usuarios.find(u => u.codigo === Number(codigo));
  if (user) {
    user.status = 'D';
    return res.json({ sucesso: true, codigo: 1, msg: 'Usuário desativado com sucesso.' });
  }
  return res.json({ sucesso: false, erros: [{ msg: 'Usuário não encontrado.' }] });
});

// ==========================================
// 2. SALA CONTROLLER ROUTES
// ==========================================

const salaRouter = express.Router();

salaRouter.post('/consultar', (req, res) => {
  const { codigo, descricao, andar, capacidade } = req.body;
  let list = salas.filter(s => s.status !== 'D');

  if (codigo) list = list.filter(s => s.codigo === Number(codigo));
  if (andar !== undefined && andar !== '') list = list.filter(s => s.andar === Number(andar));
  if (descricao) list = list.filter(s => s.descricao.toLowerCase().includes(String(descricao).toLowerCase()));
  if (capacidade) list = list.filter(s => s.capacidade === Number(capacidade));

  if (list.length > 0) {
    return res.json({ codigo: 1, msg: 'Consulta realizada com sucesso.', dados: list });
  } else {
    return res.json({ codigo: 11, msg: 'Nenhuma sala encontrada com os parâmetros informados.', dados: [] });
  }
});

salaRouter.post('/inserir', (req, res) => {
  let { codigo, descricao, andar, capacidade } = req.body;
  const codNum = Number(codigo);
  if (!codigo || !descricao) {
    return res.json({ sucesso: false, erros: [{ campo: 'Campos', msg: 'Número e Descrição da sala são obrigatórios.' }] });
  }

  const existing = salas.find(s => s.codigo === codNum);
  if (existing) {
    if (existing.status === 'D') {
      existing.status = '';
      existing.descricao = descricao;
      existing.andar = Number(andar) || 0;
      existing.capacidade = Number(capacidade) || 0;
      return res.json({ sucesso: true, codigo: 1, msg: 'Sala reativada e cadastrada corretamente' });
    }
    return res.json({ sucesso: false, erros: [{ campo: 'Numero', msg: 'Sala já cadastrada no sistema.' }] });
  }

  salas.push({
    codigo: codNum,
    descricao: String(descricao).trim(),
    andar: Number(andar) || 0,
    capacidade: Number(capacidade) || 0,
    status: ''
  });

  return res.json({ sucesso: true, codigo: 1, msg: 'Sala cadastrada corretamente' });
});

salaRouter.post('/alterar', (req, res) => {
  const { codigo, descricao, andar, capacidade } = req.body;
  const sala = salas.find(s => s.codigo === Number(codigo));
  if (!sala) {
    return res.json({ sucesso: false, codigo: 8, erros: [{ msg: 'Sala não encontrada para atualização.' }] });
  }
  if (descricao !== undefined && String(descricao).trim() !== '') sala.descricao = String(descricao).trim();
  if (andar !== undefined && andar !== '') sala.andar = Number(andar);
  if (capacidade !== undefined && capacidade !== '') sala.capacidade = Number(capacidade);

  return res.json({ sucesso: true, codigo: 1, msg: 'Sala atualizada corretamente.' });
});

salaRouter.post('/desativar', (req, res) => {
  const { codigo } = req.body;
  const sala = salas.find(s => s.codigo === Number(codigo));
  if (sala) {
    sala.status = 'D';
    return res.json({ sucesso: true, codigo: 1, msg: 'Sala desativada corretamente.' });
  }
  return res.json({ sucesso: false, erros: [{ msg: 'Sala não encontrada.' }] });
});

// ==========================================
// 3. PROFESSOR CONTROLLER ROUTES
// ==========================================

const professorRouter = express.Router();

professorRouter.post('/consultar', (req, res) => {
  const { codigo, nome, cpf, tipo } = req.body;
  let list = professores.filter(p => p.status !== 'D');

  if (codigo) list = list.filter(p => p.codigo === Number(codigo));
  if (nome) list = list.filter(p => p.nome.toLowerCase().includes(String(nome).toLowerCase()));
  if (cpf) list = list.filter(p => p.cpf.includes(String(cpf).trim()));
  if (tipo) list = list.filter(p => p.tipo === tipo);

  if (list.length > 0) {
    return res.json({ codigo: 1, msg: 'Consulta efetuada com sucesso', dados: list });
  } else {
    return res.json({ codigo: 11, msg: 'Professor não encontrado.', dados: [] });
  }
});

professorRouter.post('/inserir', (req, res) => {
  const { nome, cpf, tipo } = req.body;
  if (!nome || !cpf || !tipo) {
    return res.json({ sucesso: false, erros: [{ msg: 'Preencha todos os campos do professor.' }] });
  }
  const cleanCpf = String(cpf).trim();
  const duplicate = professores.find(p => p.cpf === cleanCpf && p.status !== 'D');
  if (duplicate) {
    return res.json({ sucesso: false, erros: [{ campo: 'CPF', msg: 'O CPF informado já está cadastrado no sistema.' }] });
  }

  const nextId = professores.length ? Math.max(...professores.map(p => p.codigo)) + 1 : 1;
  professores.push({
    codigo: nextId,
    nome: String(nome).trim(),
    cpf: cleanCpf,
    tipo: (tipo === 'C' ? 'C' : 'F'),
    status: ''
  });

  return res.json({ sucesso: true, codigo: 1, msg: 'Professor cadastrado corretamente.' });
});

professorRouter.post('/alterar', (req, res) => {
  const { codigo, nome, cpf, tipo } = req.body;
  const prof = professores.find(p => p.codigo === Number(codigo));
  if (!prof) return res.json({ sucesso: false, erros: [{ msg: 'Professor não encontrado.' }] });

  if (cpf) {
    const cleanCpf = String(cpf).trim();
    const duplicate = professores.find(p => p.cpf === cleanCpf && p.codigo !== Number(codigo) && p.status !== 'D');
    if (duplicate) {
      return res.json({ sucesso: false, erros: [{ campo: 'CPF', msg: 'O CPF informado já está cadastrado para outro professor.' }] });
    }
    prof.cpf = cleanCpf;
  }

  if (nome) prof.nome = String(nome).trim();
  if (tipo) prof.tipo = (tipo === 'C' ? 'C' : 'F');

  return res.json({ sucesso: true, codigo: 1, msg: 'Professor atualizado corretamente.' });
});

professorRouter.post('/desativar', (req, res) => {
  const { codigo } = req.body;
  const prof = professores.find(p => p.codigo === Number(codigo));
  if (prof) {
    prof.status = 'D';
    return res.json({ sucesso: true, codigo: 1, msg: 'Professor DESATIVADO corretamente.' });
  }
  return res.json({ sucesso: false, erros: [{ msg: 'Professor não encontrado.' }] });
});

// ==========================================
// 4. TURMA CONTROLLER ROUTES
// ==========================================

const turmaRouter = express.Router();

turmaRouter.post('/consultar', (req, res) => {
  const { codigo, descricao, capacidade, dataInicio } = req.body;
  let list = turmas.filter(t => t.status !== 'D');

  if (codigo) list = list.filter(t => t.codigo === Number(codigo));
  if (descricao) list = list.filter(t => t.descricao.toLowerCase().includes(String(descricao).toLowerCase()));
  if (capacidade) list = list.filter(t => t.capacidade === Number(capacidade));
  if (dataInicio) list = list.filter(t => t.dt_inicio === dataInicio);

  const formatted = list.map(t => ({
    codigo: t.codigo,
    descricao: t.descricao,
    capacidade: t.capacidade,
    dataInicio: t.dt_inicio,
    dataIniciobra: formatDateBR(t.dt_inicio)
  }));

  if (formatted.length > 0) {
    return res.json({ codigo: 1, msg: 'Consulta efetuada com sucesso', dados: formatted });
  } else {
    return res.json({ codigo: 11, msg: 'Turma não encontrada.', dados: [] });
  }
});

turmaRouter.post('/inserir', (req, res) => {
  const { descricao, capacidade, dataInicio, dt_inicio } = req.body;
  const finalDate = dataInicio || dt_inicio;
  if (!descricao || !finalDate) {
    return res.json({ sucesso: false, erros: [{ msg: 'Descrição e Data de Início são obrigatórias.' }] });
  }

  const nextId = turmas.length ? Math.max(...turmas.map(t => t.codigo)) + 1 : 1;
  turmas.push({
    codigo: nextId,
    descricao: String(descricao).trim(),
    capacidade: Number(capacidade) || 0,
    dt_inicio: finalDate,
    status: ''
  });

  return res.json({ sucesso: true, codigo: 1, msg: 'Turma cadastrada corretamente.' });
});

turmaRouter.post('/alterar', (req, res) => {
  const { codigo, descricao, capacidade, dataInicio, dt_inicio } = req.body;
  const turma = turmas.find(t => t.codigo === Number(codigo));
  if (!turma) return res.json({ sucesso: false, erros: [{ msg: 'Turma não encontrada.' }] });

  if (descricao) turma.descricao = String(descricao).trim();
  if (capacidade !== undefined && capacidade !== '') turma.capacidade = Number(capacidade);
  const finalDate = dataInicio || dt_inicio;
  if (finalDate) turma.dt_inicio = finalDate;

  return res.json({ sucesso: true, codigo: 1, msg: 'Turma atualizada corretamente.' });
});

turmaRouter.post('/desativar', (req, res) => {
  const { codigo } = req.body;
  const turma = turmas.find(t => t.codigo === Number(codigo));
  if (turma) {
    turma.status = 'D';
    return res.json({ sucesso: true, codigo: 1, msg: 'Turma DESATIVADA corretamente.' });
  }
  return res.json({ sucesso: false, erros: [{ msg: 'Turma não encontrada.' }] });
});

// ==========================================
// 5. HORARIO (PERÍODO) CONTROLLER ROUTES
// ==========================================

const horarioRouter = express.Router();

horarioRouter.post('/consultar', (req, res) => {
  const { codigo, descricao, horaInicial, horaFinal } = req.body;
  let list = horarios.filter(h => h.status !== 'D');

  if (codigo) list = list.filter(h => h.codigo === Number(codigo));
  if (descricao) list = list.filter(h => h.descricao.toLowerCase().includes(String(descricao).toLowerCase()));
  if (horaInicial) list = list.filter(h => h.hora_inicial.startsWith(horaInicial));
  if (horaFinal) list = list.filter(h => h.hora_final.startsWith(horaFinal));

  const formatted = list.map(h => ({
    codigo: h.codigo,
    descricao: h.descricao,
    hora_ini: h.hora_inicial.substring(0, 5),
    hora_fim: h.hora_final.substring(0, 5),
    hora_inicial: h.hora_inicial,
    hora_final: h.hora_final
  }));

  if (formatted.length > 0) {
    return res.json({ codigo: 1, msg: 'Consulta realizada com sucesso.', dados: formatted });
  } else {
    return res.json({ codigo: 11, msg: 'Nenhum horário encontrado.', dados: [] });
  }
});

horarioRouter.post('/inserir', (req, res) => {
  const { descricao, horaInicial, horaFinal, horaIni, horaFim } = req.body;
  const ini = horaInicial || horaIni;
  const fim = horaFinal || horaFim;
  if (!descricao || !ini || !fim) {
    return res.json({ sucesso: false, erros: [{ msg: 'Preencha a descrição, horário inicial e horário final.' }] });
  }

  const nextId = horarios.length ? Math.max(...horarios.map(h => h.codigo)) + 1 : 1;
  horarios.push({
    codigo: nextId,
    descricao: String(descricao).trim(),
    hora_inicial: ini.length === 5 ? `${ini}:00` : ini,
    hora_final: fim.length === 5 ? `${fim}:00` : fim,
    status: ''
  });

  return res.json({ sucesso: true, codigo: 1, msg: 'Horário cadastrado corretamente' });
});

horarioRouter.post('/alterar', (req, res) => {
  const { codigo, descricao, horaInicial, horaFinal, horaIni, horaFim } = req.body;
  const hor = horarios.find(h => h.codigo === Number(codigo));
  if (!hor) return res.json({ sucesso: false, erros: [{ msg: 'Horário não encontrado.' }] });

  if (descricao) hor.descricao = String(descricao).trim();
  const ini = horaInicial || horaIni;
  const fim = horaFinal || horaFim;
  if (ini) hor.hora_inicial = ini.length === 5 ? `${ini}:00` : ini;
  if (fim) hor.hora_final = fim.length === 5 ? `${fim}:00` : fim;

  return res.json({ sucesso: true, codigo: 1, msg: 'Horário atualizado corretamente.' });
});

horarioRouter.post('/desativar', (req, res) => {
  const { codigo } = req.body;
  const hor = horarios.find(h => h.codigo === Number(codigo));
  if (hor) {
    hor.status = 'D';
    return res.json({ sucesso: true, codigo: 1, msg: 'Horário desativado corretamente.' });
  }
  return res.json({ sucesso: false, erros: [{ msg: 'Horário não encontrado.' }] });
});

// ==========================================
// 6. MAPA (RESERVAS) CONTROLLER ROUTES
// ==========================================

const mapaRouter = express.Router();

function getJoinedMapa(m: DBMapa) {
  const salaObj = salas.find(s => s.codigo === m.codigo_sala);
  const turmaObj = turmas.find(t => t.codigo === m.codigo_turma);
  const profObj = professores.find(p => p.codigo === m.codigo_professor);
  const horObj = horarios.find(h => h.codigo === m.codigo_horario);

  return {
    codigo: m.codigo,
    sala: m.codigo_sala,
    descsala: salaObj ? `${salaObj.codigo} - ${salaObj.descricao}` : `Sala ${m.codigo_sala}`,
    codigo_turma: m.codigo_turma,
    desturma: turmaObj ? turmaObj.descricao : `Turma ${m.codigo_turma}`,
    codigo_professor: m.codigo_professor,
    nome_professor: profObj ? profObj.nome : `Docente ${m.codigo_professor}`,
    codigo_horario: m.codigo_horario,
    deshorario: horObj ? `${horObj.descricao} (${horObj.hora_inicial.substring(0,5)} - ${horObj.hora_final.substring(0,5)})` : `Horário ${m.codigo_horario}`,
    datareserva: m.dt_reserva
  };
}

mapaRouter.post('/consultar', (req, res) => {
  const { codigo, dataReserva, codSala, codHorario, codTurma, codProfessor } = req.body;
  let list = mapas.filter(m => m.status !== 'D');

  if (codigo) list = list.filter(m => m.codigo === Number(codigo));
  if (dataReserva) list = list.filter(m => m.dt_reserva === dataReserva);
  if (codSala) list = list.filter(m => m.codigo_sala === Number(codSala));
  if (codHorario) list = list.filter(m => m.codigo_horario === Number(codHorario));
  if (codTurma) list = list.filter(m => m.codigo_turma === Number(codTurma));
  if (codProfessor) list = list.filter(m => m.codigo_professor === Number(codProfessor));

  const joined = list.map(getJoinedMapa);
  joined.sort((a, b) => a.datareserva.localeCompare(b.datareserva));

  if (joined.length > 0) {
    return res.json({ codigo: 1, msg: 'Consulta efetuada com sucesso', dados: joined });
  } else {
    return res.json({ codigo: 11, msg: 'Reserva não encontrada.', dados: [] });
  }
});

mapaRouter.post('/inserir', (req, res) => {
  const { codSala, codHorario, codTurma, codProfessor, dataReserva } = req.body;
  if (!codSala || !codHorario || !codTurma || !codProfessor || !dataReserva) {
    return res.json({ sucesso: false, erros: [{ msg: 'Por favor, preencha todos os campos obrigatórios antes de cadastrar.' }] });
  }

  // Check collision: is the same room already booked at the same time on that date?
  const collision = mapas.find(m => m.status !== 'D' &&
    m.dt_reserva === dataReserva &&
    m.codigo_sala === Number(codSala) &&
    m.codigo_horario === Number(codHorario)
  );

  if (collision) {
    return res.json({
      sucesso: false,
      erros: [{ campo: 'Conflito', msg: 'Esta sala já possui uma reserva ativa para o mesmo período e data!' }]
    });
  }

  const nextId = mapas.length ? Math.max(...mapas.map(m => m.codigo)) + 1 : 1;
  mapas.push({
    codigo: nextId,
    dt_reserva: dataReserva,
    codigo_sala: Number(codSala),
    codigo_horario: Number(codHorario),
    codigo_turma: Number(codTurma),
    codigo_professor: Number(codProfessor),
    status: ''
  });

  return res.json({ sucesso: true, codigo: 1, msg: 'Reserva cadastrada corretamente.' });
});

mapaRouter.post('/alterar', (req, res) => {
  const { codigo, codSala, codHorario, codTurma, codProfessor, dataReserva } = req.body;
  const mapa = mapas.find(m => m.codigo === Number(codigo));
  if (!mapa) return res.json({ sucesso: false, erros: [{ msg: 'Reserva não encontrada.' }] });

  if (codSala) mapa.codigo_sala = Number(codSala);
  if (codHorario) mapa.codigo_horario = Number(codHorario);
  if (codTurma) mapa.codigo_turma = Number(codTurma);
  if (codProfessor) mapa.codigo_professor = Number(codProfessor);
  if (dataReserva) mapa.dt_reserva = dataReserva;

  return res.json({ sucesso: true, codigo: 1, msg: 'Reserva atualizada corretamente.' });
});

mapaRouter.post('/desativar', (req, res) => {
  const { codigo } = req.body;
  const mapa = mapas.find(m => m.codigo === Number(codigo));
  if (mapa) {
    mapa.status = 'D';
    return res.json({ sucesso: true, codigo: 1, msg: 'Reserva DESATIVADA corretamente.' });
  }
  return res.json({ sucesso: false, erros: [{ msg: 'Reserva não encontrada.' }] });
});

mapaRouter.post('/desativarMultiplos', (req, res) => {
  const { codigos } = req.body;
  if (Array.isArray(codigos)) {
    codigos.forEach(c => {
      const m = mapas.find(item => item.codigo === Number(c));
      if (m) m.status = 'D';
    });
    return res.json({ sucesso: true, codigo: 1, msg: 'Reservas selecionadas foram desativadas com sucesso.' });
  }
  return res.json({ sucesso: false, erros: [{ msg: 'Códigos inválidos.' }] });
});

// ==========================================
// 7. RELATORIO CONTROLLER ROUTES
// ==========================================

const relatorioRouter = express.Router();

relatorioRouter.post('/gerarMapa', (req, res) => {
  const { dataMapa } = req.body;
  if (!dataMapa) {
    return res.json({ sucesso: false, erros: [{ msg: 'Por favor, informe uma data para gerar o relatório.' }] });
  }

  const reservasData = mapas.filter(m => m.dt_reserva === dataMapa && m.status !== 'D');

  if (reservasData.length === 0) {
    return res.json({
      sucesso: false,
      codigo: 3,
      msg: 'Nenhuma reserva encontrada para a data selecionada.',
      dados: []
    });
  }

  const dados = reservasData.map(m => {
    const salaObj = salas.find(s => s.codigo === m.codigo_sala);
    const turmaObj = turmas.find(t => t.codigo === m.codigo_turma);
    const profObj = professores.find(p => p.codigo === m.codigo_professor);
    const horObj = horarios.find(h => h.codigo === m.codigo_horario);

    return {
      datareserva: m.dt_reserva,
      desc_sala: salaObj ? salaObj.descricao : `Sala ${m.codigo_sala}`,
      desc_codigo: salaObj ? salaObj.codigo : m.codigo_sala,
      desc_periodo: horObj ? horObj.descricao : 'Período Padrão',
      hora_inicial: horObj ? horObj.hora_inicial.substring(0, 5) : '08:00',
      hora_final: horObj ? horObj.hora_final.substring(0, 5) : '12:00',
      desc_turma: turmaObj ? turmaObj.descricao : `Turma ${m.codigo_turma}`,
      nome_professor: profObj ? profObj.nome : `Docente ${m.codigo_professor}`
    };
  });

  // Sort by Period (Manhã, Tarde, Noite) then Sala
  dados.sort((a, b) => {
    const pOrder = (p: string) => {
      const lower = p.toLowerCase();
      if (lower.includes('manhã') || lower.includes('manha')) return 1;
      if (lower.includes('tarde')) return 2;
      if (lower.includes('noite')) return 3;
      return 4;
    };
    const diff = pOrder(a.desc_periodo) - pOrder(b.desc_periodo);
    if (diff !== 0) return diff;
    return a.desc_codigo - b.desc_codigo;
  });

  return res.json({
    sucesso: true,
    codigo: 1,
    msg: 'Relatório gerado com sucesso.',
    dados: dados
  });
});

// Register routes supporting both case-sensitive and case-insensitive paths (e.g. /Usuario and /usuario)
app.use('/Usuario', usuarioRouter);
app.use('/usuario', usuarioRouter);
app.use('/api/usuario', usuarioRouter);

app.use('/Sala', salaRouter);
app.use('/sala', salaRouter);
app.use('/api/sala', salaRouter);

app.use('/Professor', professorRouter);
app.use('/professor', professorRouter);
app.use('/api/professor', professorRouter);

app.use('/Turma', turmaRouter);
app.use('/turma', turmaRouter);
app.use('/api/turma', turmaRouter);

app.use('/Horario', horarioRouter);
app.use('/horario', horarioRouter);
app.use('/api/horario', horarioRouter);

app.use('/Mapa', mapaRouter);
app.use('/mapa', mapaRouter);
app.use('/api/mapa', mapaRouter);

app.use('/Relatorio', relatorioRouter);
app.use('/relatorio', relatorioRouter);
app.use('/api/relatorio', relatorioRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Setup Vite middleware for development & static fallback for production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sistema de Mapa de Sala] Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
