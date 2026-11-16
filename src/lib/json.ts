/**
 * JSON serialization and parsing utilities for SQLite and MySQL data layers.
 * Guarantees safe parsing, prevents double-stringification, and handles edge cases.
 */

export function safeJsonParse<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== 'string') return (val as T) ?? fallback;
  try {
    let parsed: unknown = JSON.parse(val);
    while (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        break;
      }
    }
    return (parsed as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export function serializeJson(val: unknown, fallback: string = '[]'): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object' && parsed !== null) {
        return JSON.stringify(parsed);
      }
    } catch {
      // not JSON object
    }
  }
  return JSON.stringify(val);
}
