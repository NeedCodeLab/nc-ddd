import { Effect } from "effect";
import { VOEffect } from "@/effect/core/vo-effect";
import { FieldErrors } from "@/helpers/types";

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
   * @param key — ключ поля для ошибок (по умолчанию "id")
   * @returns Effect с IdVO или ошибкой валидации
   */
  public static create(value: unknown, key: string): Effect.Effect<IdVO, FieldErrors> {
    if (typeof value !== "string") {
      return Effect.fail({ [key]: ["Id must be a string"] });
    }
    if (value.trim() === "") {
      return Effect.fail({ [key]: ["Id cannot be empty"] });
    }
    return Effect.succeed(new IdVO(value.trim()));
  }
}
