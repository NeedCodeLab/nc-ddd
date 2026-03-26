import { VOEffect } from "@/effect/core/vo-effect";
import { EffectFieldError } from "@/index";
import { Effect } from "effect";

/**
 * Тип для контактной информации сотрудника.
 * Может быть email или phone.
 */
export type EmployeeContactType = "email" | "phone";

/**
 * Тип для props контактной информации.
 */
export interface EmployeeContactVOProps {
  type: EmployeeContactType;
  value: string;
}

/**
 * Value Object для контактной информации сотрудника.
 * Проверяет тип контакта и формат значения.
 */
export class EmployeeContactVO extends VOEffect<EmployeeContactVOProps> {
  private constructor(props: EmployeeContactVOProps) {
    super(props);
  }

  /**
   * Фабричный метод для создания EmployeeContactVO.
   * @param value — значение контакта
   * @returns Effect с EmployeeContactVO или ошибкой валидации
   */
  public static create(
    value: unknown,
    errorKey: string
  ): Effect.Effect<EmployeeContactVO, EffectFieldError> {
    // Проверка, что значение — объект
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return Effect.fail(new EffectFieldError({ message: "Contact must be an object",errorKey }));
    }

    const obj = value as Record<string, unknown>;

    // Проверка типа
    if (obj.type !== "email" && obj.type !== "phone") {
      return Effect.fail(new EffectFieldError({ message: "Contact type must be 'email' or 'phone'",errorKey }));
    }

    // Проверка значения
    if (typeof obj.value !== "string") {
      return Effect.fail(new EffectFieldError({ message: "Contact value must be a string",errorKey }));
    }

    const trimmedValue = obj.value.trim();
    if (trimmedValue === "") {
      return Effect.fail(new EffectFieldError({ message: "Contact value cannot be empty",errorKey }));
    }

    // Валидация формата в зависимости от типа
    if (obj.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return Effect.fail(new EffectFieldError({ message: "Invalid email format",errorKey }));
      }
    } else if (obj.type === "phone") {
      const phoneRegex = /^7\d{10}$/;
      if (!phoneRegex.test(trimmedValue)) {
        return Effect.fail(new EffectFieldError({ message: "Invalid phone format. Must be 7XXXXXXXXXX",errorKey }));
      }
    }

    return Effect.succeed(
      new EmployeeContactVO({
        type: obj.type as EmployeeContactType,
        value: trimmedValue,
      }),
    );
  }
}
