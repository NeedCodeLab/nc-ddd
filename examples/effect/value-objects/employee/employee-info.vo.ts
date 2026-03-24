import { Effect } from "effect";
import { VOEffect } from "@/effect/core/vo-effect";
import { FieldErrors } from "@/helpers/types";

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
   * @param key — ключ поля для ошибок (по умолчанию "info")
   * @returns Effect с EmployeeInfoVO или ошибкой валидации
   */
  public static create(value: unknown, key: string): Effect.Effect<EmployeeInfoVO, FieldErrors> {
    if (typeof value !== "string") {
      return Effect.fail({ [key]: ["Info must be a string"] });
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      return Effect.fail({ [key]: ["Info cannot be empty"] });
    }
    if (trimmed.length > 300) {
      return Effect.fail({ [key]: ["Info cannot be more than 300 characters"] });
    }
    return Effect.succeed(new EmployeeInfoVO(trimmed));
  }
}
