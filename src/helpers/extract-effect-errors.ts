import { Option } from "effect";
import type { FieldErrors } from "./types";

function mergeInto(result: FieldErrors, value: unknown, parentKey?: string): void {
  // FieldErrors — плоский объект с массивами строк
  // { "contacts.1.value": ["Invalid email"] }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    for (const [path, messages] of Object.entries(value)) {
      const fullKey = parentKey ? `${parentKey}.${path}` : path;

      if (Array.isArray(messages)) {
        result[fullKey] = result[fullKey]
          ? [...result[fullKey], ...(messages as string[])]
          : (messages as string[]);
      } else if (typeof messages === "object" && messages !== null) {
        // Вложенный объект ошибок - рекурсивно мерджим с полным ключом
        mergeInto(result, messages, fullKey);
      }
    }
    return;
  }

  // Массив Option-ов — вложенный Effect.all
  if (Array.isArray(value)) {
    for (const item of value) {
      unwrapOption(result, item);
    }
  }
}

function unwrapOption(result: FieldErrors, raw: unknown): void {
  if (!Option.isOption(raw)) return;

  if (Option.isNone(raw)) return;

  // Извлекаем значение из Option
  const value = raw.value;

  // Если значение - массив, обрабатываем каждый элемент
  if (Array.isArray(value)) {
    for (const item of value) {
      unwrapOption(result, item);
    }
    return;
  }

  // Если значение - объект, мерджим его
  mergeInto(result, value);
}

export function extractEffectErrors(cause: unknown): FieldErrors {
  const result: FieldErrors = {};

  if (typeof cause !== "object" || cause === null) return result;

  for (const raw of Object.values(cause)) {
    unwrapOption(result, raw);
  }
  return result;
}
