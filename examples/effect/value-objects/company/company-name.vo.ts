import { Effect } from "effect";
import { VOEffect } from "@/effect/core/vo-effect";
import { FieldErrors } from "@/helpers/types";

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
   * @param key — ключ поля для ошибок (по умолчанию "companyName")
   * @returns Effect с CompanyNameVO или ошибкой валидации
   */
  public static create(value: unknown, key: string): Effect.Effect<CompanyNameVO, FieldErrors> {
    if (typeof value !== "string") {
      return Effect.fail({ [key]: ["Company name must be a string"] });
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      return Effect.fail({ [key]: ["Company name cannot be empty"] });
    }
    if (trimmed.length > 100) {
      return Effect.fail({ [key]: ["Company name cannot be more than 100 characters"] });
    }
    return Effect.succeed(new CompanyNameVO(trimmed));
  }
}
