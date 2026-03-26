import { VOEffect } from "@/effect/core/vo-effect";
import { EffectFieldError } from "@/index";
import { Effect } from "effect";

/**
 * Value Object для информации о сотруднике.
 * Проверяет, что информация — непустая строка длиной не более 300 символов.
 */
export class EmployeeInfoVO extends VOEffect<string> {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Фабричный метод для создания EmployeeInfoVO.
   * @param value — значение информации
   * @returns Effect с EmployeeInfoVO или ошибкой валидации
   */
  public static create(value: unknown, errorKey: string): Effect.Effect<EmployeeInfoVO, EffectFieldError> {
    if (typeof value !== "string") {
      return Effect.fail(new EffectFieldError({ message: "Info must be a string", errorKey }));
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      return Effect.fail(new EffectFieldError({ message: "Info cannot be empty", errorKey }));
    }
    if (trimmed.length > 300) {
      return Effect.fail(new EffectFieldError({ message: "Info cannot be more than 300 characters", errorKey }));
    }
    return Effect.succeed(new EmployeeInfoVO(trimmed));
  }
}
