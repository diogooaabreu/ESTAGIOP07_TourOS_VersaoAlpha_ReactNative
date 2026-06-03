// ============================================================
// TourOS POS — Repositório de Reservas (SQLite)
// ============================================================

import { getDB } from './database';
import type { Reserva } from '../types';

/**
 * Cria uma nova reserva na base de dados local.
 */
export async function createReserva(reserva: Reserva): Promise<Reserva> {
  try {
    const db = getDB();
    const result = await db.executeSql(
      `INSERT INTO reservas (
        codigo, tour_id, tour_nome, tour_tipo,
        data_reserva, hora_partida, idioma, opcao,
        adultos, criancas, bebes,
        pickup_tipo, pickup_local,
        alergias, metodo_pagamento, total, estado_pagamento,
        incluir_contacto, incluir_faturacao, observacoes,
        estado, processada, user_id, balcao, canal_venda, nota,
        data_original, data_remarcada,
        contacto_nome, contacto_apelido, contacto_email, contacto_telefone,
        faturacao_nome, faturacao_apelido, faturacao_empresa, faturacao_nif,
        faturacao_morada, faturacao_cidade, faturacao_distrito,
        faturacao_codigo_postal, faturacao_pais, faturacao_telefone
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?
      )`,
      [
        reserva.codigo,
        reserva.tourId,
        reserva.tourNome,
        reserva.tourTipo,
        reserva.dataReserva,
        reserva.horaPartida ?? null,
        reserva.idioma ?? null,
        reserva.opcao ?? null,
        reserva.adultos,
        reserva.criancas,
        reserva.bebes,
        reserva.pickupTipo ?? null,
        reserva.pickupLocal ?? null,
        reserva.alergias ?? null,
        reserva.metodoPagamento,
        reserva.total,
        reserva.estadoPagamento,
        reserva.incluirContacto ? 1 : 0,
        reserva.incluirFaturacao ? 1 : 0,
        reserva.observacoes ?? null,
        reserva.estado,
        reserva.processada ? 1 : 0,
        reserva.userId,
        reserva.balcao ?? null,
        reserva.canalVenda,
        reserva.nota ?? null,
        reserva.dataOriginal ?? null,
        reserva.dataRemarcada ?? null,
        reserva.contactoNome ?? null,
        reserva.contactoApelido ?? null,
        reserva.contactoEmail ?? null,
        reserva.contactoTelefone ?? null,
        reserva.faturacaoNome ?? null,
        reserva.faturacaoApelido ?? null,
        reserva.faturacaoEmpresa ?? null,
        reserva.faturacaoNif ?? null,
        reserva.faturacaoMorada ?? null,
        reserva.faturacaoCidade ?? null,
        reserva.faturacaoDistrito ?? null,
        reserva.faturacaoCodigoPostal ?? null,
        reserva.faturacaoPais ?? null,
        reserva.faturacaoTelefone ?? null,
      ],
    );

    const insertId = result[0].insertId;
    return { ...reserva, id: insertId };
  } catch (error) {
    console.error('[ReservaRepo] Erro ao criar reserva:', error);
    throw error;
  }
}

/**
 * Lista todas as reservas de um utilizador, ordenadas da mais recente para a mais antiga.
 */
export async function getAllReservas(userId: number): Promise<Reserva[]> {
  try {
    const db = getDB();
    const result = await db.executeSql(
      'SELECT * FROM reservas WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
    );

    const reservas: Reserva[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      reservas.push(mapRowToReserva(result[0].rows.item(i)));
    }

    return reservas;
  } catch (error) {
    console.error('[ReservaRepo] Erro ao listar reservas:', error);
    throw error;
  }
}

/**
 * Busca uma reserva pelo código único (TOS-XXXXXXXXX).
 */
export async function getReservaByCodigo(
  codigo: string,
): Promise<Reserva | null> {
  try {
    const db = getDB();
    const result = await db.executeSql(
      'SELECT * FROM reservas WHERE codigo = ? LIMIT 1',
      [codigo],
    );

    if (result[0].rows.length === 0) {
      return null;
    }

    return mapRowToReserva(result[0].rows.item(0));
  } catch (error) {
    console.error('[ReservaRepo] Erro ao buscar reserva por código:', error);
    throw error;
  }
}

/**
 * Actualiza os dados de uma reserva pelo código.
 */
export async function updateReserva(
  codigo: string,
  data: Partial<Reserva>,
): Promise<Reserva | null> {
  try {
    const db = getDB();
    const fields: string[] = [];
    const values: any[] = [];

    // Mapeamento de campos da interface para colunas da BD
    const fieldMap: Record<string, string> = {
      tourId: 'tour_id',
      tourNome: 'tour_nome',
      tourTipo: 'tour_tipo',
      dataReserva: 'data_reserva',
      horaPartida: 'hora_partida',
      pickupTipo: 'pickup_tipo',
      pickupLocal: 'pickup_local',
      metodoPagamento: 'metodo_pagamento',
      estadoPagamento: 'estado_pagamento',
      incluirContacto: 'incluir_contacto',
      incluirFaturacao: 'incluir_faturacao',
      canalVenda: 'canal_venda',
      dataOriginal: 'data_original',
      dataRemarcada: 'data_remarcada',
      contactoNome: 'contacto_nome',
      contactoApelido: 'contacto_apelido',
      contactoEmail: 'contacto_email',
      contactoTelefone: 'contacto_telefone',
      faturacaoNome: 'faturacao_nome',
      faturacaoApelido: 'faturacao_apelido',
      faturacaoEmpresa: 'faturacao_empresa',
      faturacaoNif: 'faturacao_nif',
      faturacaoMorada: 'faturacao_morada',
      faturacaoCidade: 'faturacao_cidade',
      faturacaoDistrito: 'faturacao_distrito',
      faturacaoCodigoPostal: 'faturacao_codigo_postal',
      faturacaoPais: 'faturacao_pais',
      faturacaoTelefone: 'faturacao_telefone',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if ((data as any)[key] !== undefined) {
        fields.push(`${column} = ?`);
        const val = (data as any)[key];
        // Converter booleanos para 0/1
        if (typeof val === 'boolean') {
          values.push(val ? 1 : 0);
        } else {
          values.push(val);
        }
      }
    }

    // Campos directos (mesmo nome)
    const directFields = [
      'idioma',
      'opcao',
      'adultos',
      'criancas',
      'bebes',
      'alergias',
      'total',
      'observacoes',
      'estado',
      'processada',
      'balcao',
      'nota',
    ];

    for (const field of directFields) {
      if ((data as any)[field] !== undefined) {
        fields.push(field);
        const val = (data as any)[field];
        if (typeof val === 'boolean') {
          values.push(val ? 1 : 0);
        } else {
          values.push(val);
        }
      }
    }

    if (fields.length === 0) {
      return getReservaByCodigo(codigo);
    }

    fields.push("updated_at = datetime('now')");
    values.push(codigo);

    await db.executeSql(
      `UPDATE reservas SET ${fields.join(', ')} WHERE codigo = ?`,
      values,
    );

    return getReservaByCodigo(codigo);
  } catch (error) {
    console.error('[ReservaRepo] Erro ao actualizar reserva:', error);
    throw error;
  }
}

/**
 * Cancela uma reserva (altera estado para 'cancelada').
 */
export async function cancelarReserva(codigo: string): Promise<Reserva | null> {
  try {
    const db = getDB();
    await db.executeSql(
      `UPDATE reservas SET estado = 'cancelada', updated_at = datetime('now') WHERE codigo = ?`,
      [codigo],
    );
    return getReservaByCodigo(codigo);
  } catch (error) {
    console.error('[ReservaRepo] Erro ao cancelar reserva:', error);
    throw error;
  }
}

/**
 * Remarca uma reserva para uma nova data.
 */
export async function remarcarReserva(
  codigo: string,
  novaData: string,
): Promise<Reserva | null> {
  try {
    const db = getDB();

    // Guardar a data original antes de alterar
    const reserva = await getReservaByCodigo(codigo);
    if (!reserva) {
      throw new Error(`Reserva ${codigo} não encontrada`);
    }

    await db.executeSql(
      `UPDATE reservas SET
        data_original = data_reserva,
        data_reserva = ?,
        data_remarcada = ?,
        updated_at = datetime('now')
       WHERE codigo = ?`,
      [novaData, novaData, codigo],
    );

    return getReservaByCodigo(codigo);
  } catch (error) {
    console.error('[ReservaRepo] Erro ao remarcar reserva:', error);
    throw error;
  }
}

// ---- Helpers ----

function mapRowToReserva(row: any): Reserva {
  return {
    id: row.id,
    codigo: row.codigo,
    tourId: row.tour_id,
    tourNome: row.tour_nome,
    tourTipo: row.tour_tipo,
    dataReserva: row.data_reserva,
    horaPartida: row.hora_partida ?? undefined,
    idioma: row.idioma ?? undefined,
    opcao: row.opcao ?? undefined,
    adultos: row.adultos,
    criancas: row.criancas,
    bebes: row.bebes,
    pickupTipo: row.pickup_tipo ?? undefined,
    pickupLocal: row.pickup_local ?? undefined,
    alergias: row.alergias ?? undefined,
    metodoPagamento: row.metodo_pagamento,
    total: row.total,
    estadoPagamento: row.estado_pagamento,
    incluirContacto: row.incluir_contacto === 1,
    incluirFaturacao: row.incluir_faturacao === 1,
    observacoes: row.observacoes ?? undefined,
    estado: row.estado,
    processada: row.processada === 1,
    userId: row.user_id,
    balcao: row.balcao ?? undefined,
    canalVenda: row.canal_venda,
    nota: row.nota ?? undefined,
    dataOriginal: row.data_original ?? undefined,
    dataRemarcada: row.data_remarcada ?? undefined,
    contactoNome: row.contacto_nome ?? undefined,
    contactoApelido: row.contacto_apelido ?? undefined,
    contactoEmail: row.contacto_email ?? undefined,
    contactoTelefone: row.contacto_telefone ?? undefined,
    faturacaoNome: row.faturacao_nome ?? undefined,
    faturacaoApelido: row.faturacao_apelido ?? undefined,
    faturacaoEmpresa: row.faturacao_empresa ?? undefined,
    faturacaoNif: row.faturacao_nif ?? undefined,
    faturacaoMorada: row.faturacao_morada ?? undefined,
    faturacaoCidade: row.faturacao_cidade ?? undefined,
    faturacaoDistrito: row.faturacao_distrito ?? undefined,
    faturacaoCodigoPostal: row.faturacao_codigo_postal ?? undefined,
    faturacaoPais: row.faturacao_pais ?? undefined,
    faturacaoTelefone: row.faturacao_telefone ?? undefined,
    createdAt: row.created_at,
  };
}
