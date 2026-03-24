import { Effect } from "effect";
import { VOEffect } from "@/effect/core/vo-effect";
import { FieldErrors } from "@/helpers/types";

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
   * @param key — ключ поля для ошибок (по умолчанию "name")
   * @returns Effect с EmployeeNameVO или ошибкой валидации
   */
  public static create(value: unknown, key: string): Effect.Effect<EmployeeNameVO, FieldErrors> {
    if (typeof value !== "string") {
      return Effect.fail({ [key]: ["Name must be a string"] });
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      return Effect.fail({ [key]: ["Name cannot be empty"] });
    }
    if (trimmed.length > 20) {
      return Effect.fail({ [key]: ["Имя слишком длинное (макс. 20 символов)"] });
    }
    return Effect.succeed(new EmployeeNameVO(trimmed));
  }
}
