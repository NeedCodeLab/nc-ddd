import { Effect } from "effect";
import { VOEffect } from "@/effect/core/vo-effect";
import { FieldErrors } from "@/helpers/types";

/**
 * Value Object для фамилии сотрудника.
 * Проверяет, что фамилия — непустая строка.
 */
export class EmployeeLastNameVO extends VOEffect<string> {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Фабричный метод для создания EmployeeLastNameVO.
   * @param value — значение фамилии
   * @param key — ключ поля для ошибок (по умолчанию "lastName")
   * @returns Effect с EmployeeLastNameVO или ошибкой валидации
   */
  public static create(value: unknown, key: string): Effect.Effect<EmployeeLastNameVO, FieldErrors> {
    if (typeof value !== "string") {
      return Effect.fail({ [key]: ["Last name must be a string"] });
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      return Effect.fail({ [key]: ["Last name cannot be empty"] });
    }
    return Effect.succeed(new EmployeeLastNameVO(trimmed));
  }
}
