import { Effect } from "effect";
import { VOEffect } from "@/effect/core/vo-effect";
import { FieldErrors } from "@/helpers/types";

/**
 * Перечисление ролей сотрудника.
 */
export enum RoleEnum {
  staff = "staff",
  admin = "admin",
}

/**
 * Value Object для роли сотрудника.
 * Проверяет, что роль является одним из допустимых значений RoleEnum.
 */
export class EmployeeRoleVO extends VOEffect<RoleEnum> {
  private constructor(value: RoleEnum) {
    super(value);
  }

  /**
   * Фабричный метод для создания EmployeeRoleVO.
   * @param value — значение роли
   * @param key — ключ поля для ошибок (по умолчанию "role")
   * @returns Effect с EmployeeRoleVO или ошибкой валидации
   */
  public static create(value: unknown, key: string): Effect.Effect<EmployeeRoleVO, FieldErrors> {
    const validRoles = Object.values(RoleEnum);
    if (typeof value !== "string") {
      return Effect.fail({ [key]: [`Role must be a string, one of: ${validRoles.join(", ")}`] });
    }
    if (!validRoles.includes(value as RoleEnum)) {
      return Effect.fail({ [key]: [`Role must be one of: ${validRoles.join(", ")}`] });
    }
    return Effect.succeed(new EmployeeRoleVO(value as RoleEnum));
  }
}
