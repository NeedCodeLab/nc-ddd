import { Effect } from "effect";
import { VOEffect } from "@/effect/core/vo-effect";

/**
 * Типы контактов для MultipleEffectVO.
 */
export type ContactType = "email" | "foo" | "date";

/**
 * Тип для props MultipleEffectVO.
 * Используется discriminated union для типизации.
 */
export type MultipleEffectVOProps =
  | { type: "email"; value: string }
  | { type: "foo"; value: string }
  | { type: "date"; value: string };

/**
 * Value Object для множественных контактов с валидацией формата.
 * Поддерживает email, URL и ISO date.
 */
export class MultipleEffectVO extends VOEffect<MultipleEffectVOProps> {
  private constructor(props: MultipleEffectVOProps) {
    super(props);
  }

  /**
   * Фабричный метод для создания MultipleEffectVO.
   * @param value — значение контакта
   * @param key — ключ поля для ошибок (по умолчанию "value")
   * @returns Effect с MultipleEffectVO или ошибкой валидации
   */
  public static create(
    value: unknown,
    key = "value",
  ): Effect.Effect<MultipleEffectVO, { [k: string]: string[] }> {
    // Проверка, что значение — объект
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return Effect.fail({ [key]: ["Value must be an object"] });
    }

    const obj = value as Record<string, unknown>;

    // Проверка типа
    if (obj.type !== "email" && obj.type !== "foo" && obj.type !== "date") {
      return Effect.fail({ [key]: ["Type must be 'email', 'foo', or 'date'"] });
    }

    // Проверка значения
    if (typeof obj.value !== "string") {
      return Effect.fail({ [`${key}.value`]: ["Value must be a string"] });
    }

    const trimmedValue = obj.value.trim();
    if (trimmedValue === "") {
      return Effect.fail({ [`${key}.value`]: ["Value cannot be empty"] });
    }

    // Валидация формата в зависимости от типа
    if (obj.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return Effect.fail({ [`${key}.value`]: ["Invalid email format"] });
      }
    } else if (obj.type === "foo") {
      try {
        new URL(trimmedValue);
      } catch {
        return Effect.fail({ [`${key}.value`]: ["Invalid URL format"] });
      }
    } else if (obj.type === "date") {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!isoDateRegex.test(trimmedValue)) {
        return Effect.fail({ [`${key}.value`]: ["Invalid ISO date format. Use YYYY-MM-DD"] });
      }
      // Дополнительная проверка валидности даты
      const date = new Date(trimmedValue);
      if (isNaN(date.getTime())) {
        return Effect.fail({ [`${key}.value`]: ["Invalid date"] });
      }
    }

    return Effect.succeed(
      new MultipleEffectVO({
        type: obj.type as ContactType,
        value: trimmedValue,
      }),
    );
  }
}
