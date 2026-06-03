// ============================================================
// TourOS POS — Repositório de Passageiros (SQLite)
// ============================================================

import { getDB } from './database';
import type { ReservaPassageiro } from '../types';

/**
 * Cria vários passageiros associados a uma reserva.
 * Insere todos dentro de uma transacção para garantir atomicidade.
 */
export async function createPassageiros(
  passageiros: Omit<ReservaPassageiro, 'id'>[],
): Promise<ReservaPassageiro[]> {
  if (passageiros.length === 0) {
    return [];
  }

  try {
    const db = getDB();

    // Iniciar transacção
    await db.executeSql('BEGIN TRANSACTION;');

    const created: ReservaPassageiro[] = [];

    for (const p of passageiros) {
      const result = await db.executeSql(
        `INSERT INTO reserva_passageiros (reserva_id, nome, tipo, ordem, voucher_codigo, voucher_usado)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          p.reservaId,
          p.nome ?? null,
          p.tipo,
          p.ordem,
          p.voucherCodigo ?? null,
          p.voucherUsado ? 1 : 0,
        ],
      );

      created.push({
        id: result[0].insertId,
        reservaId: p.reservaId,
        nome: p.nome,
        tipo: p.tipo,
        ordem: p.ordem,
        voucherCodigo: p.voucherCodigo,
        voucherUsado: p.voucherUsado,
      });
    }

    // Confirmar transacção
    await db.executeSql('COMMIT;');

    return created;
  } catch (error) {
    // Reverter em caso de erro
    try {
      const db = getDB();
      await db.executeSql('ROLLBACK;');
    } catch (rollbackError) {
      console.error('[PassageiroRepo] Erro ao fazer rollback:', rollbackError);
    }

    console.error('[PassageiroRepo] Erro ao criar passageiros:', error);
    throw error;
  }
}

/**
 * Busca todos os passageiros de uma reserva.
 */
export async function getPassageirosByReserva(
  reservaId: number,
): Promise<ReservaPassageiro[]> {
  try {
    const db = getDB();
    const result = await db.executeSql(
      'SELECT * FROM reserva_passageiros WHERE reserva_id = ? ORDER BY ordem ASC',
      [reservaId],
    );

    const passageiros: ReservaPassageiro[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      passageiros.push(mapRowToPassageiro(result[0].rows.item(i)));
    }

    return passageiros;
  } catch (error) {
    console.error(
      '[PassageiroRepo] Erro ao buscar passageiros da reserva:',
      error,
    );
    throw error;
  }
}

// ---- Helpers ----

function mapRowToPassageiro(row: any): ReservaPassageiro {
  return {
    id: row.id,
    reservaId: row.reserva_id,
    nome: row.nome ?? undefined,
    tipo: row.tipo,
    ordem: row.ordem,
    voucherCodigo: row.voucher_codigo ?? undefined,
    voucherUsado: row.voucher_usado === 1,
  };
}
