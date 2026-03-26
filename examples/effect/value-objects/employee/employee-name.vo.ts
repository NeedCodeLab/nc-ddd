import { VOEffect } from "@/effect/core/vo-effect";
import { EffectFieldError } from "@/index";
import { Effect } from "effect";

/**
 * Value Object для имени сотрудника.
 * Проверяет, что имя — непустая строка длиной не более 20 символов.
 */
export class EmployeeNameVO extends VOEffect<string> {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Фабричный метод для создания EmployeeNameVO.
   * @param value — значение имени
   * @returns Effect с EmployeeNameVO или ошибкой валидации
   */
  public static create(value: unknown, errorKey: string): Effect.Effect<EmployeeNameVO, EffectFieldError> {
    if (typeof value !== "string") {
      return Effect.fail(new EffectFieldError({ message: "Name must be a string", errorKey }));
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      return Effect.fail(new EffectFieldError({ message: "Name cannot be empty", errorKey }));
    }
    if (trimmed.length > 20) {
      return Effect.fail(new EffectFieldError({ message: "Name cannot be more than 20 characters", errorKey }));
    }
    return Effect.succeed(new EmployeeNameVO(trimmed));
  }
}
