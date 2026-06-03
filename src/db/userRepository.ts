// ============================================================
// TourOS POS — Repositório de Utilizadores (SQLite)
// ============================================================

import { getDB } from './database';
import type { User } from '../types';

/**
 * Cria um novo utilizador na base de dados local.
 */
export async function createUser(user: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  pinHash?: string;
}): Promise<User> {
  try {
    const db = getDB();
    const result = await db.executeSql(
      `INSERT INTO users (name, email, password, phone, pin_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user.name,
        user.email,
        user.password,
        user.phone ?? null,
        user.pinHash ?? null,
      ],
    );

    const insertId = result[0].insertId;
    return getUserById(insertId) as Promise<User>;
  } catch (error) {
    console.error('[UserRepo] Erro ao criar utilizador:', error);
    throw error;
  }
}

/**
 * Busca um utilizador pelo email.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const db = getDB();
    const result = await db.executeSql(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email],
    );

    if (result[0].rows.length === 0) {
      return null;
    }

    return mapRowToUser(result[0].rows.item(0));
  } catch (error) {
    console.error('[UserRepo] Erro ao buscar utilizador por email:', error);
    throw error;
  }
}

/**
 * Busca um utilizador pelo ID.
 */
export async function getUserById(id: number): Promise<User | null> {
  try {
    const db = getDB();
    const result = await db.executeSql(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id],
    );

    if (result[0].rows.length === 0) {
      return null;
    }

    return mapRowToUser(result[0].rows.item(0));
  } catch (error) {
    console.error('[UserRepo] Erro ao buscar utilizador por ID:', error);
    throw error;
  }
}

/**
 * Actualiza dados de um utilizador.
 */
export async function updateUser(
  id: number,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    pinHash: string;
    password: string;
  }>,
): Promise<User | null> {
  try {
    const db = getDB();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }
    if (data.pinHash !== undefined) {
      fields.push('pin_hash = ?');
      values.push(data.pinHash);
    }
    if (data.password !== undefined) {
      fields.push('password = ?');
      values.push(data.password);
    }

    if (fields.length === 0) {
      return getUserById(id);
    }

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await db.executeSql(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );

    return getUserById(id);
  } catch (error) {
    console.error('[UserRepo] Erro ao actualizar utilizador:', error);
    throw error;
  }
}

// ---- Helpers ----

function mapRowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    pinHash: row.pin_hash ?? undefined,
    password: row.password ?? undefined, // ← adicionar
    createdAt: row.created_at,
  };
}
