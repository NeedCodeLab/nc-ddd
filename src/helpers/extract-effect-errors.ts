import { Option } from "effect";
import type { FieldErrors } from "./vo-effect-factory";

function mergeInto(result: FieldErrors, value: unknown): void {
  // FieldErrors — плоский объект с массивами строк
  // { "contacts.1.value": ["Invalid email"] }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    for (const [path, messages] of Object.entries(value)) {
      if (!Array.isArray(messages)) continue;
      result[path] = result[path]
        ? [...result[path], ...(messages as string[])]
        : (messages as string[]);
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
  if (!Option.isOption(raw) || Option.isNone(raw)) return;
  mergeInto(result, raw.value);
}

export function extractEffectErrors(cause: unknown): FieldErrors {
  const result: FieldErrors = {};

  if (typeof cause !== "object" || cause === null) return result;

  for (const raw of Object.values(cause)) {
    unwrapOption(result, raw);
  }

  return result;
}
