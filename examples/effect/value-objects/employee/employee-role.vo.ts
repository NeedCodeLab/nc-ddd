import { VOEffect } from "@/effect/core/vo-effect";
import { EffectFieldError } from "@/index";
import { Effect } from "effect";

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
   * @returns Effect с EmployeeRoleVO или ошибкой валидации
   */
  public static create(value: unknown, errorKey: string): Effect.Effect<EmployeeRoleVO, EffectFieldError> {
    const validRoles = Object.values(RoleEnum);
    if (typeof value !== "string") {
      return Effect.fail(new EffectFieldError({ message: `Role must be a string, one of: ${validRoles.join(", ")}`,errorKey }));
    }
    if (!validRoles.includes(value as RoleEnum)) {
      return Effect.fail(new EffectFieldError({ message: `Role must be one of: ${validRoles.join(", ")}`,errorKey }));
    }
    return Effect.succeed(new EmployeeRoleVO(value as RoleEnum));
  }
}
