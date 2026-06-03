// ============================================================
// TourOS POS — Conexão à base de dados SQLite
// ============================================================

import SQLite from 'react-native-sqlite-storage';
import { DB_NAME } from '../utils/constants';
import { ALL_MIGRATIONS } from './migrations';

// Activar promises para a API do SQLite
SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabase({
      name: DB_NAME,
      location: 'default',
    });

    // Activar foreign keys
    await db.executeSql('PRAGMA foreign_keys = ON;');

    // Executar todas as migrations
    for (const migration of ALL_MIGRATIONS) {
      await db.executeSql(migration);
    }

    // Seed: garantir utilizador de teste
    try {
      const existing = await db.executeSql(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        ['admin@touros.app'],
      );
      if (existing[0].rows.length === 0) {
        await db.executeSql(
          `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
          ['Admin', 'admin@touros.app', 'admin123'],
        );
        console.log('[DB] Utilizador de teste criado');
      } else {
        console.log('[DB] Utilizador de teste já existe');
      }
    } catch (seedError) {
      console.error('[DB] Erro ao criar utilizador de teste:', seedError);
    }

    console.log('[DB] Base de dados inicializada com sucesso');
    return db;
  } catch (error) {
    console.error('[DB] Erro ao inicializar base de dados:', error);
    throw error;
  }
}

export function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error(
      'Base de dados não inicializada. Chama initDatabase() primeiro.',
    );
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('[DB] Base de dados fechada');
  }
}
