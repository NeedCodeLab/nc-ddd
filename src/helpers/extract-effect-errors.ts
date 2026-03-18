import { Option } from "effect";

// ─── Хелперы ─────────────────────────────────────────────────────────────────

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isOptionArray(value: unknown): value is Option.Option<unknown>[] {
  return Array.isArray(value) && value.every(Option.isOption);
}

// ─── Основная функция ────────────────────────────────────────────────────────

export function extractEffectErrors(input: Record<string, unknown>): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const [key, raw] of Object.entries(input)) {
    // Пропускаем всё что не Option
    if (!Option.isOption(raw)) continue;
    if (Option.isNone(raw)) continue;

    const value = raw.value;

    if (!value) continue;

    // Простой массив строк: { name: Some(["Name can't be empty"]) }
    if (isStringArray(value)) {
      result[key] = value;
      continue;
    }

    // Массив Option-ов: { contacts: Some([Some({ "contacts.0": { value: [...] } })]) }
    if (isOptionArray(value)) {
      for (const item of value) {
        if (Option.isNone(item)) continue;

        const inner = item.value;

        if (typeof inner === "object" && inner !== null) {
          for (const [nestedKey, nestedVal] of Object.entries(inner)) {
            if (typeof nestedVal === "object" && nestedVal !== null) {
              for (const [fieldKey, fieldVal] of Object.entries(nestedVal)) {
                if (isStringArray(fieldVal)) {
                  // "contacts.0" + "." + "value" = "contacts.0.value"
                  result[`${nestedKey}.${fieldKey}`] = fieldVal;
                }
              }
            }
          }
        }
      }
      continue;
    }

    // Вложенный объект: рекурсия
    if (typeof value === "object") {
      const nested = extractEffectErrors(value as Record<string, unknown>);
      for (const [nestedKey, val] of Object.entries(nested)) {
        result[`${key}.${nestedKey}`] = val;
      }
    }
  }

  return result;
}
