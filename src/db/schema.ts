import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (integrated with Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  status: text('status').default('A').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Classrooms (Salas)
export const salas = pgTable('salas', {
  codigo: integer('codigo').primaryKey(),
  descricao: text('descricao').notNull(),
  andar: integer('andar').notNull(),
  capacidade: integer('capacidade').notNull(),
  status: text('status').default('A').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Teachers (Professores)
export const professores = pgTable('professores', {
  codigo: serial('codigo').primaryKey(),
  nome: text('nome').notNull(),
  cpf: text('cpf').notNull(),
  tipo: text('tipo').default('F').notNull(), // 'F' = Funcionario, 'C' = Convite
  status: text('status').default('A').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Classes / Courses (Turmas)
export const turmas = pgTable('turmas', {
  codigo: serial('codigo').primaryKey(),
  descricao: text('descricao').notNull(),
  capacidade: integer('capacidade').notNull(),
  dataInicio: text('data_inicio').notNull(),
  status: text('status').default('A').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Periods / Time slots (Horarios)
export const horarios = pgTable('horarios', {
  codigo: serial('codigo').primaryKey(),
  descricao: text('descricao').notNull(),
  horaInicial: text('hora_inicial').notNull(),
  horaFinal: text('hora_final').notNull(),
  status: text('status').default('A').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reservations / Room Allocations (Mapas)
export const mapas = pgTable('mapas', {
  codigo: serial('codigo').primaryKey(),
  dataReserva: text('data_reserva').notNull(), // YYYY-MM-DD
  codSala: integer('cod_sala').references(() => salas.codigo).notNull(),
  codTurma: integer('cod_turma').references(() => turmas.codigo).notNull(),
  codProfessor: integer('cod_professor').references(() => professores.codigo).notNull(),
  codHorario: integer('cod_horario').references(() => horarios.codigo).notNull(),
  status: text('status').default('A').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const mapasRelations = relations(mapas, ({ one }) => ({
  sala: one(salas, {
    fields: [mapas.codSala],
    references: [salas.codigo],
  }),
  turma: one(turmas, {
    fields: [mapas.codTurma],
    references: [turmas.codigo],
  }),
  professor: one(professores, {
    fields: [mapas.codProfessor],
    references: [professores.codigo],
  }),
  horario: one(horarios, {
    fields: [mapas.codHorario],
    references: [horarios.codigo],
  }),
}));
