import { VOEffect } from "@/effect/core/vo-effect";
import { EffectFieldError } from "@/index";
import { Effect } from "effect";

/**
 * Value Object для ID.
 * Проверяет, что значение является непустой строкой.
 */
export class IdVO extends VOEffect<string> {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Фабричный метод для создания IdVO.
   * @param value — значение ID
   * @returns Effect с IdVO или ошибкой валидации
   */
  public static create(value: unknown, errorKey: string): Effect.Effect<IdVO, EffectFieldError> {
    if (typeof value !== "string") {
      return Effect.fail(new EffectFieldError({ message: "Id must be a string", errorKey }));
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      return Effect.fail(new EffectFieldError({ message: "Id cannot be empty", errorKey }));
    }
    return Effect.succeed(new IdVO(trimmed));
  }
}
