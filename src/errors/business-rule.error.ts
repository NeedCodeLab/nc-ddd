import { Data } from "effect";

/**
 * Ошибка нарушения бизнес-правила.
 * Выбрасывается при нарушении инвариантов предметной области.
 *
 * @example
 * const error = new MaxEmployeesError();
 * Effect.fail(error)
 */
export class EffectBusinessRuleError extends Data.TaggedError("EffectBusinessRuleError")<{
  code: string;
  message: string;
}> {}

/**
 * Пример конкретной ошибки бизнес-правила: превышение максимального количества сотрудников
 */
export class MaxEmployeesError extends EffectBusinessRuleError {
  constructor(maxEmployees: number, current: number) {
    super({
      code: "MAX_EMPLOYEES_EXCEEDED",
      message: `Cannot create company with ${current} employees. Maximum allowed is ${maxEmployees}`,
    });
  }
}

/**
 * Ошибка бизнес-правила: дублирование типа контакта у сотрудника.
 * У сотрудника не может быть двух контактов одного типа (например, два email).
 */
export class DuplicateContactError extends EffectBusinessRuleError {
  constructor(contactType: string) {
    super({
      code: "DUPLICATE_CONTACT_TYPE",
      message: `Employee cannot have multiple contacts of type '${contactType}'`,
    });
  }
}
