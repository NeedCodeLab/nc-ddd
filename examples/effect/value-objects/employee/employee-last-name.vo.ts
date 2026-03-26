import { VOEffect } from "@/effect/core/vo-effect";
import { EffectFieldError } from "@/index";
import { Effect } from "effect";

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
   * @returns Effect с EmployeeLastNameVO или ошибкой валидации
   */
  public static create(value: unknown, errorKey: string): Effect.Effect<EmployeeLastNameVO, EffectFieldError> {
    if (typeof value !== "string") {
      return Effect.fail(new EffectFieldError({ message: "Last name must be a string", errorKey }));
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      return Effect.fail(new EffectFieldError({ message: "Last name cannot be empty", errorKey }));
    }
    return Effect.succeed(new EmployeeLastNameVO(trimmed));
  }
}
