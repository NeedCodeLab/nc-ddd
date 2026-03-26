import { VOEffect } from "@/effect/core/vo-effect";
import { EffectFieldError } from "@/index";
import { Effect } from "effect";

/**
 * Value Object для названия компании.
 * Проверяет, что название — непустая строка длиной не более 100 символов.
 */
export class CompanyNameVO extends VOEffect<string> {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Фабричный метод для создания CompanyNameVO.
   * @param value — значение названия компании
   * @returns Effect с CompanyNameVO или ошибкой валидации
   */
  public static create(value: unknown, errorKey: string): Effect.Effect<CompanyNameVO, EffectFieldError> {
    if (typeof value !== "string") {
      return Effect.fail(new EffectFieldError({ message: "Company name must be a string", errorKey }));
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      return Effect.fail(new EffectFieldError({ message: "Company name cannot be empty", errorKey }));
    }
    if (trimmed.length > 100) {
      return Effect.fail(new EffectFieldError({ message: "Company name cannot be more than 100 characters", errorKey }));
    }
    return Effect.succeed(new CompanyNameVO(trimmed));
  }
}
