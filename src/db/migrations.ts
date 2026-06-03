// ============================================================
// TourOS POS — Migrations (CREATE TABLE statements)
// ============================================================

export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    pin_hash TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`;

export const CREATE_RESERVAS_TABLE = `
  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    tour_id INTEGER NOT NULL,
    tour_nome TEXT NOT NULL,
    tour_tipo TEXT DEFAULT 'tour',
    data_reserva TEXT NOT NULL,
    hora_partida TEXT,
    idioma TEXT,
    opcao TEXT,
    adultos INTEGER DEFAULT 0,
    criancas INTEGER DEFAULT 0,
    bebes INTEGER DEFAULT 0,
    pickup_tipo TEXT,
    pickup_local TEXT,
    alergias TEXT,
    metodo_pagamento TEXT DEFAULT 'dinheiro',
    total REAL DEFAULT 0,
    estado_pagamento TEXT DEFAULT 'pendente',
    incluir_contacto INTEGER DEFAULT 0,
    incluir_faturacao INTEGER DEFAULT 0,
    observacoes TEXT,
    estado TEXT DEFAULT 'confirmada',
    processada INTEGER DEFAULT 0,
    user_id INTEGER NOT NULL,
    balcao TEXT,
    canal_venda TEXT DEFAULT 'POS',
    nota TEXT,
    data_original TEXT,
    data_remarcada TEXT,
    contacto_nome TEXT,
    contacto_apelido TEXT,
    contacto_email TEXT,
    contacto_telefone TEXT,
    faturacao_nome TEXT,
    faturacao_apelido TEXT,
    faturacao_empresa TEXT,
    faturacao_nif TEXT,
    faturacao_morada TEXT,
    faturacao_cidade TEXT,
    faturacao_distrito TEXT,
    faturacao_codigo_postal TEXT,
    faturacao_pais TEXT,
    faturacao_telefone TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`;

export const CREATE_RESERVA_PASSAGEIROS_TABLE = `
  CREATE TABLE IF NOT EXISTS reserva_passageiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    nome TEXT,
    tipo TEXT NOT NULL,
    ordem INTEGER NOT NULL,
    voucher_codigo TEXT,
    voucher_usado INTEGER DEFAULT 0
  );
`;

export const CREATE_PAGAMENTOS_TABLE = `
  CREATE TABLE IF NOT EXISTS pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reserva_id INTEGER NOT NULL,
    metodo TEXT NOT NULL,
    valor REAL NOT NULL,
    referencia TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`;

export const ALL_MIGRATIONS = [
  CREATE_USERS_TABLE,
  CREATE_RESERVAS_TABLE,
  CREATE_RESERVA_PASSAGEIROS_TABLE,
  CREATE_PAGAMENTOS_TABLE,
];
